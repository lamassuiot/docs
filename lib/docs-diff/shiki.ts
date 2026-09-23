import { CODE_META, DEL, INS } from './diff.ts';

type HastElement = { type: 'element'; tagName: string; properties: Record<string, unknown>; children: unknown[] };
type Context = {
  options: { meta?: { __raw?: string } };
  addClassToHast(node: HastElement, className: string | string[]): HastElement;
};

const STATUS_RE = new RegExp(`(?:^|\\s)${CODE_META}="([=+-]*)"`);

/**
 * Shiki transformer that colors the lines of a code block the diff merged
 * (see diffCode in ./diff.ts), reading per-line statuses from its meta.
 */
export function transformerDocsDiff() {
  const statuses = (ctx: Context) => STATUS_RE.exec(ctx.options.meta?.__raw ?? '')?.[1];
  return {
    name: 'lamassu:docs-diff',
    pre(this: Context, node: HastElement) {
      if (statuses(this)) this.addClassToHast(node, 'lm-diff-code');
    },
    line(this: Context, node: HastElement, line: number) {
      const status = statuses(this)?.[line - 1];
      if (status === '+') this.addClassToHast(node, ['lm-diff-line', INS]);
      else if (status === '-') this.addClassToHast(node, ['lm-diff-line', DEL]);
    },
  };
}
