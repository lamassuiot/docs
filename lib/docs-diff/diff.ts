/**
 * Structural diff between two MDX syntax trees, used by PR previews to show
 * exactly what a docs PR changes.
 *
 * A line diff of Markdown is useless for prose: a paragraph is usually one
 * source line, so fixing one word shows the whole paragraph deleted and
 * re-added. Instead this aligns the two trees block by block (paragraphs,
 * headings, list items, table rows, MDX components, code blocks), and only
 * inside blocks that were *modified* does it diff at word level (or line level
 * for code). The result is written back into the head tree:
 *
 *   - inserted inline text   -> <ins class="lm-diff-ins">
 *   - deleted inline text    -> <del class="lm-diff-del">  (base text re-inserted)
 *   - inserted/deleted block -> wrapped in <div class="lm-diff-ins|lm-diff-del">,
 *                               or classed directly for <li>/<tr>
 *   - modified code block    -> final block + merged old/new block (see diffCode)
 *
 * Deleted content is hidden unless the page has `data-show-diff`, so the
 * preview reads as the final version until a reviewer turns the diff on.
 */

export type MdNode = {
  type: string;
  children?: MdNode[];
  value?: string;
  name?: string | null;
  attributes?: unknown[];
  depth?: number;
  ordered?: boolean | null;
  lang?: string | null;
  meta?: string | null;
  url?: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
};

export const INS = 'lm-diff-ins';
export const DEL = 'lm-diff-del';
/** Shown only while the diff is off / on: the two renderings of a modified code block. */
export const FINAL = 'lm-diff-final';
export const MERGED = 'lm-diff-merged';
/** Code-block meta attribute carrying per-line statuses: '=' kept, '+' added, '-' removed. */
export const CODE_META = 'lmdiff';

export type DiffStats = { changes: number };

/** Blocks whose children are inline content and get a word-level diff. */
const TEXT_BLOCKS = new Set(['paragraph', 'heading', 'tableCell']);
/** Blocks whose children are blocks and get a recursive structural diff. */
const CONTAINERS = new Set([
  'root',
  'list',
  'listItem',
  'blockquote',
  'table',
  'tableRow',
  'mdxJsxFlowElement',
]);
/** Blocks with a CSS-addressable element of their own that must not be wrapped. */
const CLASSED_BLOCKS = new Set(['listItem', 'tableRow']);
/** Nodes that render nothing where they stand; wrapping them would break MDX. */
const INVISIBLE = new Set(['mdxjsEsm', 'definition', 'footnoteDefinition', 'yaml', 'toml']);
/** Inline nodes whose children are more inline content. */
const INLINE_CONTAINERS = new Set(['strong', 'emphasis', 'delete', 'link', 'linkReference']);

/** Minimum word similarity for two differing blocks to count as "the same block, edited". */
const PAIR_THRESHOLD = 0.3;

/** Diff `base` into `head` in place. Returns how many change regions were marked. */
export function diffTrees(base: MdNode, head: MdNode): DiffStats {
  const ctx: Ctx = { stats: { changes: 0 } };
  head.children = diffChildren(ctx, base.children ?? [], head.children ?? [], head.type);
  return ctx.stats;
}

/** Mark every block of a page that did not exist in the base as inserted. */
export function markAllInserted(head: MdNode): DiffStats {
  const ctx: Ctx = { stats: { changes: 0 } };
  head.children = (head.children ?? []).flatMap((child) => markBlock(ctx, child, head.type, INS));
  return ctx.stats;
}

type Ctx = { stats: DiffStats };

type Op =
  | { kind: 'eq'; base: MdNode; head: MdNode }
  | { kind: 'mod'; base: MdNode; head: MdNode }
  | { kind: 'del'; base: MdNode }
  | { kind: 'ins'; head: MdNode };

function diffChildren(ctx: Ctx, base: MdNode[], head: MdNode[], parentType: string): MdNode[] {
  const out: MdNode[] = [];
  for (const op of alignBlocks(base, head)) {
    switch (op.kind) {
      case 'eq':
        out.push(op.head);
        break;
      case 'mod':
        out.push(...modifyBlock(ctx, op.base, op.head));
        break;
      case 'ins':
        out.push(...markBlock(ctx, op.head, parentType, INS));
        break;
      case 'del':
        out.push(...markBlock(ctx, op.base, parentType, DEL));
        break;
    }
  }
  return out;
}

/**
 * Two passes: an exact LCS anchors the unchanged blocks, then inside each gap
 * between anchors a similarity-weighted alignment decides which removed and
 * added blocks are really one edited block.
 */
function alignBlocks(base: MdNode[], head: MdNode[]): Op[] {
  const baseSigs = base.map(signature);
  const headSigs = head.map(signature);
  const anchors = lcs(base.length, head.length, (i, j) => baseSigs[i] === headSigs[j]);

  const ops: Op[] = [];
  let bi = 0;
  let hi = 0;
  for (const [ai, aj] of [...anchors, [base.length, head.length] as const]) {
    ops.push(...alignGap(base.slice(bi, ai), head.slice(hi, aj)));
    if (ai < base.length) ops.push({ kind: 'eq', base: base[ai], head: head[aj] });
    bi = ai + 1;
    hi = aj + 1;
  }
  return ops;
}

function alignGap(base: MdNode[], head: MdNode[]): Op[] {
  if (base.length === 0) return head.map((h) => ({ kind: 'ins', head: h }));
  if (head.length === 0) return base.map((b) => ({ kind: 'del', base: b }));

  // Needleman-Wunsch style: maximize total similarity of paired blocks.
  const n = base.length;
  const m = head.length;
  const score = (i: number, j: number) => pairScore(base[i], head[j]);
  const best: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      const s = score(i, j);
      best[i][j] = Math.max(best[i + 1][j], best[i][j + 1], s > 0 ? s + best[i + 1][j + 1] : 0);
    }
  }

  const ops: Op[] = [];
  const pendingIns: Op[] = [];
  let i = 0;
  let j = 0;
  // Emit deletions before insertions within a run so "old, then new" reads naturally.
  const flush = () => ops.push(...pendingIns.splice(0));
  while (i < n && j < m) {
    const s = score(i, j);
    if (s > 0 && best[i][j] === s + best[i + 1][j + 1]) {
      flush();
      ops.push({ kind: 'mod', base: base[i++], head: head[j++] });
    } else if (best[i][j] === best[i + 1][j]) {
      ops.push({ kind: 'del', base: base[i++] });
    } else {
      pendingIns.push({ kind: 'ins', head: head[j++] });
    }
  }
  while (i < n) ops.push({ kind: 'del', base: base[i++] });
  flush();
  while (j < m) ops.push({ kind: 'ins', head: head[j++] });
  return ops;
}

/** > 0 when the two blocks can be diffed against each other; higher is a better match. */
function pairScore(base: MdNode, head: MdNode): number {
  if (base.type !== head.type) return 0;
  switch (base.type) {
    case 'heading':
      if (base.depth !== head.depth) return 0;
      break;
    case 'list':
      if (Boolean(base.ordered) !== Boolean(head.ordered)) return 0;
      break;
    case 'table':
      if (base.children?.[0]?.children?.length !== head.children?.[0]?.children?.length) return 0;
      break;
    case 'tableRow':
      if (base.children?.length !== head.children?.length) return 0;
      break;
    case 'mdxJsxFlowElement':
      // A component with different props is shown as replaced: its props are
      // not text we can highlight.
      if (base.name !== head.name || signature({ type: 'a', v: base.attributes }) !== signature({ type: 'a', v: head.attributes })) return 0;
      break;
    case 'code':
      if ((base.lang ?? '') !== (head.lang ?? '') || (base.meta ?? '') !== (head.meta ?? '')) return 0;
      return threshold(dice(lines(base.value ?? ''), lines(head.value ?? '')));
    default:
      if (!TEXT_BLOCKS.has(base.type) && !CONTAINERS.has(base.type)) return 0;
  }
  // Wrapper containers always pair (their children are diffed); a small
  // floor keeps them preferred over leaving both sides unpaired. Rows and
  // items are content: a rewritten one reads better as removed + added.
  const similarity = dice(words(textOf(base)), words(textOf(head)));
  if (CONTAINERS.has(base.type) && !CLASSED_BLOCKS.has(base.type)) return Math.max(similarity, 0.01);
  return threshold(similarity);
}

function threshold(similarity: number): number {
  return similarity >= PAIR_THRESHOLD ? similarity : 0;
}

/** Diff a paired block. Returns the node(s) to put in its place. */
function modifyBlock(ctx: Ctx, base: MdNode, head: MdNode): MdNode[] {
  if (head.type === 'code') return diffCode(ctx, base, head);
  if (TEXT_BLOCKS.has(head.type)) {
    head.children = diffInline(ctx, base.children ?? [], head.children ?? []);
  } else if (head.type === 'tableRow') {
    // Paired rows have the same cell count; cells are positional.
    head.children = (head.children ?? []).map((cell, index) => {
      const baseCell = base.children?.[index];
      if (baseCell && signature(baseCell) !== signature(cell)) modifyBlock(ctx, baseCell, cell);
      return cell;
    });
  } else {
    head.children = diffChildren(ctx, base.children ?? [], head.children ?? [], head.type);
  }
  return [head];
}

/** Mark a whole block as inserted or deleted. Returns the node(s) to put in its place. */
function markBlock(ctx: Ctx, node: MdNode, parentType: string, cls: string): MdNode[] {
  if (INVISIBLE.has(node.type)) return cls === DEL ? [] : [node];
  ctx.stats.changes++;
  if (CLASSED_BLOCKS.has(node.type)) {
    addClass(node, cls);
    return [node];
  }
  if (parentType === 'tableRow') {
    // A lone cell: its <td> must stay a direct child of the row.
    node.children = [inlineMark(cls, node.children ?? [])];
    return [node];
  }
  if (node.type === 'heading' && cls === DEL) {
    // remark-heading already ran, so a deleted heading has no id and stays
    // out of the table of contents; mark its text so it reads as struck.
    node.children = [inlineMark(cls, node.children ?? [])];
  }
  return [wrapBlock(`${cls} lm-diff-block`, node)];
}

function wrapBlock(className: string, node: MdNode): MdNode {
  return {
    type: 'mdxJsxFlowElement',
    name: 'div',
    attributes: [{ type: 'mdxJsxAttribute', name: 'className', value: className }],
    children: [node],
  };
}

function addClass(node: MdNode, cls: string): void {
  node.data ??= {};
  const data = node.data as { hProperties?: Record<string, unknown> };
  data.hProperties ??= {};
  const props = data.hProperties;
  const existing = props.className;
  const list = Array.isArray(existing) ? existing : typeof existing === 'string' ? [existing] : [];
  props.className = [...list, cls, 'lm-diff-block'];
}

function inlineMark(cls: string, children: MdNode[]): MdNode {
  return {
    type: 'mdxJsxTextElement',
    name: cls === INS ? 'ins' : 'del',
    attributes: [{ type: 'mdxJsxAttribute', name: 'className', value: cls }],
    children,
  };
}

// ── Inline (word-level) diff ────────────────────────────────────────────────

type Token = {
  /** Comparison key: formatting context + normalized content. */
  key: string;
  /** Text content, for text tokens. */
  text?: string;
  /** The node itself, for atomic inline nodes (code, images, breaks, JSX...). */
  atom?: MdNode;
  /** Enclosing inline containers (strong, link...), outermost first. */
  chain: MdNode[];
};

type Seg = { op: 'eq' | 'del' | 'ins'; tokens: Token[] };

const WORD_RE = /[\p{L}\p{N}_]+|\s+|[^\p{L}\p{N}_\s]/gu;

function tokenize(nodes: MdNode[], chain: MdNode[] = [], out: Token[] = []): Token[] {
  const context = chain.map((n) => (n.type === 'link' ? `link(${n.url})` : n.type)).join('>');
  for (const node of nodes) {
    if (node.type === 'text') {
      for (const piece of (node.value ?? '').match(WORD_RE) ?? []) {
        // Markdown soft-wraps paragraphs, so reflowing is not a change.
        const normalized = /^\s+$/.test(piece) ? ' ' : piece;
        out.push({ key: `${context}\u0000${normalized}`, text: piece, chain });
      }
    } else if (INLINE_CONTAINERS.has(node.type) && node.children) {
      tokenize(node.children, [...chain, node], out);
    } else {
      out.push({ key: `${context}\u0000${signature(node)}`, atom: node, chain });
    }
  }
  return out;
}

function diffInline(ctx: Ctx, base: MdNode[], head: MdNode[]): MdNode[] {
  const a = tokenize(base);
  const b = tokenize(head);
  const segments = cleanupSemantic(diffTokens(a, b));
  ctx.stats.changes += segments.filter((s, i) => s.op !== 'eq' && segments[i - 1]?.op !== 'del').length;
  return rebuild(segments);
}

function diffTokens(a: Token[], b: Token[]): Seg[] {
  const pairs = lcs(a.length, b.length, (i, j) => a[i].key === b[j].key);
  const segs: Seg[] = [];
  const push = (op: Seg['op'], token: Token) => {
    const last = segs.at(-1);
    if (last?.op === op) last.tokens.push(token);
    else segs.push({ op, tokens: [token] });
  };
  let i = 0;
  let j = 0;
  for (const [pi, pj] of [...pairs, [a.length, b.length] as const]) {
    while (i < pi) push('del', a[i++]);
    while (j < pj) push('ins', b[j++]);
    if (pi < a.length) push('eq', b[pj]);
    i = pi + 1;
    j = pj + 1;
  }
  return normalizeRuns(segs);
}

/**
 * Drop equalities too short to be meaningful between two edits (a shared
 * space or "de" inside a rewritten sentence), so a rewrite reads as one
 * replaced phrase instead of confetti. Same rule as diff-match-patch's
 * semantic cleanup: an equality goes when it is no longer than the edits on
 * either side of it.
 */
function cleanupSemantic(segs: Seg[]): Seg[] {
  let changed = true;
  while (changed) {
    changed = false;
    for (let k = 0; k < segs.length; k++) {
      if (segs[k].op !== 'eq') continue;
      const left = editLength(segs, k, -1);
      const right = editLength(segs, k, 1);
      if (left === 0 || right === 0) continue;
      const len = textLength(segs[k].tokens);
      if (len <= left && len <= right) {
        const tokens = segs[k].tokens;
        segs.splice(k, 1, { op: 'del', tokens }, { op: 'ins', tokens });
        segs = normalizeRuns(segs);
        changed = true;
        break;
      }
    }
  }
  return segs;
}

/** Length of the edit run adjacent to segs[k] in direction `dir` (the larger side). */
function editLength(segs: Seg[], k: number, dir: 1 | -1): number {
  let del = 0;
  let ins = 0;
  for (let i = k + dir; i >= 0 && i < segs.length && segs[i].op !== 'eq'; i += dir) {
    if (segs[i].op === 'del') del += textLength(segs[i].tokens);
    else ins += textLength(segs[i].tokens);
  }
  return Math.max(del, ins);
}

function textLength(tokens: Token[]): number {
  return tokens.reduce((n, t) => n + (t.text ? t.text.trim().length || 1 : 4), 0);
}

/** Within each run between equalities, group all deletions before all insertions. */
function normalizeRuns(segs: Seg[]): Seg[] {
  const out: Seg[] = [];
  let del: Token[] = [];
  let ins: Token[] = [];
  const flush = () => {
    if (del.length) out.push({ op: 'del', tokens: del });
    if (ins.length) out.push({ op: 'ins', tokens: ins });
    del = [];
    ins = [];
  };
  for (const seg of segs) {
    if (seg.op === 'del') del = [...del, ...seg.tokens];
    else if (seg.op === 'ins') ins = [...ins, ...seg.tokens];
    else {
      flush();
      const last = out.at(-1);
      if (last?.op === 'eq') last.tokens.push(...seg.tokens);
      else out.push({ op: 'eq', tokens: [...seg.tokens] });
    }
  }
  flush();
  return out;
}

/** Turn diff segments back into inline mdast, recreating formatting wrappers. */
function rebuild(segs: Seg[]): MdNode[] {
  const root: MdNode = { type: 'root', children: [] };
  let stack: { ref: MdNode | null; node: MdNode }[] = [{ ref: null, node: root }];

  for (const seg of segs) {
    for (const token of seg.tokens) {
      // Reuse open wrappers shared with the previous token; open the rest.
      let depth = 1;
      while (depth < stack.length && stack[depth].ref === token.chain[depth - 1]) depth++;
      stack = stack.slice(0, depth);
      for (const wrapper of token.chain.slice(depth - 1)) {
        const { children: _children, position: _position, ...rest } = wrapper;
        const clone: MdNode = { ...rest, children: [] };
        stack.at(-1)?.node.children?.push(clone);
        stack.push({ ref: wrapper, node: clone });
      }

      const parent = stack[stack.length - 1].node;
      const siblings = parent.children ?? [];
      const leaf: MdNode = token.atom ?? { type: 'text', value: token.text ?? '' };
      if (seg.op === 'eq') {
        appendLeaf(siblings, leaf);
        continue;
      }
      const cls = seg.op === 'ins' ? INS : DEL;
      const last = siblings.at(-1);
      if (last?.type === 'mdxJsxTextElement' && last.name === (seg.op === 'ins' ? 'ins' : 'del') && last.data?.lmSeg === seg) {
        appendLeaf(last.children ?? [], leaf);
      } else {
        const mark = inlineMark(cls, [leaf]);
        mark.data = { lmSeg: seg };
        siblings.push(mark);
      }
    }
  }

  stripSegData(root);
  return root.children ?? [];
}

function appendLeaf(siblings: MdNode[], leaf: MdNode): void {
  const last = siblings.at(-1);
  if (leaf.type === 'text' && last?.type === 'text') last.value = (last.value ?? '') + leaf.value;
  else siblings.push(leaf);
}

function stripSegData(node: MdNode): void {
  if (node.data && 'lmSeg' in node.data) delete node.data;
  for (const child of node.children ?? []) stripSegData(child);
}

// ── Code blocks (line-level diff) ───────────────────────────────────────────

/**
 * A modified code block is emitted twice: the PR's version, shown while the
 * diff is off, and a merged old+new version shown while it is on. Hiding
 * removed lines inside a single block would still leak them into the copy
 * button, which copies the block's textContent.
 */
function diffCode(ctx: Ctx, base: MdNode, head: MdNode): MdNode[] {
  const a = (base.value ?? '').split('\n');
  const b = (head.value ?? '').split('\n');
  const pairs = lcs(a.length, b.length, (i, j) => a[i] === b[j]);
  const merged: string[] = [];
  let status = '';
  let i = 0;
  let j = 0;
  for (const [pi, pj] of [...pairs, [a.length, b.length] as const]) {
    if (i < pi || j < pj) ctx.stats.changes++;
    while (i < pi) {
      merged.push(a[i++]);
      status += '-';
    }
    while (j < pj) {
      merged.push(b[j++]);
      status += '+';
    }
    if (pi < a.length) {
      merged.push(b[pj]);
      status += '=';
    }
    i = pi + 1;
    j = pj + 1;
  }
  const diffed: MdNode = { ...head, value: merged.join('\n'), meta: `${head.meta ?? ''} ${CODE_META}="${status}"`.trim() };
  return [wrapBlock(FINAL, head), wrapBlock(MERGED, diffed)];
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const signatures = new WeakMap<object, string>();

/** Content identity of a node, ignoring source positions and plugin data. */
export function signature(node: MdNode | { type: string; [key: string]: unknown }): string {
  const cached = signatures.get(node);
  if (cached !== undefined) return cached;
  const sig = JSON.stringify(node, (key, value) => (key === 'position' || key === 'data' ? undefined : value));
  signatures.set(node, sig);
  return sig;
}

export function textOf(node: MdNode): string {
  if (typeof node.value === 'string') return node.value;
  return (node.children ?? []).map(textOf).join(' ');
}

function words(text: string): string[] {
  return text.toLowerCase().match(/[\p{L}\p{N}_]+/gu) ?? [];
}

function lines(text: string): string[] {
  return text.split('\n').map((line) => line.trim()).filter(Boolean);
}

/** Dice coefficient over multisets: 1 for identical bags, 0 for disjoint. */
function dice(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 1;
  const counts = new Map<string, number>();
  for (const w of a) counts.set(w, (counts.get(w) ?? 0) + 1);
  let common = 0;
  for (const w of b) {
    const c = counts.get(w) ?? 0;
    if (c > 0) {
      common++;
      counts.set(w, c - 1);
    }
  }
  return (2 * common) / (a.length + b.length);
}

/** Longest common subsequence as increasing [i, j] index pairs. */
function lcs(n: number, m: number, equal: (i: number, j: number) => boolean): [number, number][] {
  // Trim the common prefix/suffix first: most edits touch a small window.
  let start = 0;
  while (start < n && start < m && equal(start, start)) start++;
  let endN = n;
  let endM = m;
  while (endN > start && endM > start && equal(endN - 1, endM - 1)) {
    endN--;
    endM--;
  }

  const rows = endN - start;
  const cols = endM - start;
  const table = new Uint32Array((rows + 1) * (cols + 1));
  const at = (i: number, j: number) => i * (cols + 1) + j;
  for (let i = rows - 1; i >= 0; i--) {
    for (let j = cols - 1; j >= 0; j--) {
      table[at(i, j)] = equal(start + i, start + j)
        ? table[at(i + 1, j + 1)] + 1
        : Math.max(table[at(i + 1, j)], table[at(i, j + 1)]);
    }
  }

  const pairs: [number, number][] = [];
  for (let k = 0; k < start; k++) pairs.push([k, k]);
  let i = 0;
  let j = 0;
  while (i < rows && j < cols) {
    if (equal(start + i, start + j) && table[at(i, j)] === table[at(i + 1, j + 1)] + 1) {
      pairs.push([start + i, start + j]);
      i++;
      j++;
    } else if (table[at(i + 1, j)] >= table[at(i, j + 1)]) {
      i++;
    } else {
      j++;
    }
  }
  for (let k = 0; k < n - endN; k++) pairs.push([endN + k, endM + k]);
  return pairs;
}

/** Word-level diff of two plain strings (page title, description). */
export function diffText(base: string, head: string): { op: 'eq' | 'del' | 'ins'; text: string }[] {
  const segs = cleanupSemantic(
    diffTokens(tokenize([{ type: 'text', value: base }]), tokenize([{ type: 'text', value: head }])),
  );
  return segs.map((seg) => ({ op: seg.op, text: seg.tokens.map((t) => t.text ?? '').join('') }));
}
