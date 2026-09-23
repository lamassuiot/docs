import path from 'node:path';
import { diffText, diffTrees, markAllInserted, type MdNode } from './diff.ts';
import { changedDocs, git, gitRoot } from './git.ts';

/**
 * Remark plugin for PR-preview builds: diffs every page the PR touched
 * against its version at `base` (a Git revision) and marks the changes in
 * place — see ./diff.ts. Pages the PR did not touch are left alone.
 *
 * Must run after remark-heading and remark-structure, so heading ids, the
 * table of contents and the search index are all built from the PR's version
 * of the page, not from the diff markup.
 *
 * Also exports `lmDiff` from each changed page (title/description diffs and a
 * change count) for the page chrome, which renders frontmatter outside MDX.
 */
export function remarkDocsDiff(this: { parse(value: string): unknown }, { base }: { base: string }) {
  // Same parser (MDX + GFM) the page itself went through.
  const parse = (value: string) => this.parse(value) as MdNode;
  const repo = gitRoot();
  const { changed } = changedDocs(base, repo);
  console.log(`[docs-diff] diffing ${changed.size} changed page(s) against ${base}`);

  return (tree: MdNode, file: VFileLike) => {
    if (!file.path) return;
    const rel = path.relative(repo, path.resolve(file.cwd ?? process.cwd(), file.path)).split(path.sep).join('/');
    if (!rel.startsWith('content/docs/')) return;
    const basePath = changed.get(rel.slice('content/docs/'.length));
    if (basePath === undefined) return;

    const headMatter = (file.data.frontmatter ?? {}) as Record<string, unknown>;
    let baseMatter: Record<string, string> = {};
    let isNew = false;
    let changes: number;
    const baseSource = basePath ? show(repo, base, basePath) : null;
    if (baseSource === null) {
      isNew = true;
      changes = markAllInserted(tree).changes;
    } else {
      const { frontmatter, content } = splitFrontmatter(baseSource);
      baseMatter = frontmatter;
      try {
        changes = diffTrees(parse(content), tree).changes;
      } catch (error) {
        console.warn(`[docs-diff] ${rel}: could not parse base version, skipping:`, error);
        return;
      }
    }

    const field = (name: string) => {
      const head = typeof headMatter[name] === 'string' ? (headMatter[name] as string) : '';
      const old = baseMatter[name] ?? '';
      return isNew || old === head ? undefined : diffText(old, head);
    };
    const title = field('title');
    const description = field('description');
    changes += (title ? 1 : 0) + (description ? 1 : 0);

    file.data['mdx-export'] ??= [];
    (file.data['mdx-export'] as unknown[]).push({ name: 'lmDiff', value: { isNew, changes, title, description } });
  };
}

type VFileLike = { path?: string; cwd?: string; data: Record<string, unknown> };

function show(repo: string, base: string, file: string): string | null {
  try {
    return git(['show', `${base}:${file}`], repo);
  } catch {
    return null;
  }
}

/** Same split fumadocs-mdx does before compiling; only flat string fields are needed. */
function splitFrontmatter(source: string): { frontmatter: Record<string, string>; content: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  if (!match) return { frontmatter: {}, content: source };
  const frontmatter: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = /^(\w+):\s*(.*)$/.exec(line);
    if (field) frontmatter[field[1]] = field[2].trim().replace(/^(['"])(.*)\1$/, '$2');
  }
  return { frontmatter, content: source.slice(match[0].length) };
}
