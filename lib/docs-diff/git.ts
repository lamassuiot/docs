import { execFileSync } from 'node:child_process';

/** Pages a PR touches, as paths relative to content/docs (e.g. 'manual/pqc.mdx'). */
export type ChangedDocs = {
  /** Changed or added pages, mapped to their repo path at the base ('' when new). */
  changed: Map<string, string>;
  /** Pages that existed at the base and are gone. */
  removed: string[];
};

const CONTENT = 'content/docs/';

/**
 * Compares `base` with the working tree (not HEAD), so it also covers
 * uncommitted and untracked local edits when previewing a change locally.
 */
export function changedDocs(base: string, repo = gitRoot()): ChangedDocs {
  const changed = new Map<string, string>();
  const removed: string[] = [];
  const status = git(['diff', '--name-status', '-M', base, '--', CONTENT], repo);
  for (const line of status.split('\n')) {
    const [code, ...paths] = line.split('\t');
    if (!code) continue;
    const head = paths.at(-1) ?? '';
    if (code.startsWith('R')) {
      // A rename also removes the old URL.
      if (paths[0].endsWith('.mdx')) removed.push(paths[0].slice(CONTENT.length));
    }
    if (!head.endsWith('.mdx')) continue;
    if (code.startsWith('D')) removed.push(head.slice(CONTENT.length));
    else changed.set(head.slice(CONTENT.length), code.startsWith('A') ? '' : paths[0]);
  }
  const untracked = git(['ls-files', '--others', '--exclude-standard', '--', CONTENT], repo);
  for (const file of untracked.split('\n')) {
    if (file.endsWith('.mdx')) changed.set(file.slice(CONTENT.length), '');
  }
  return { changed, removed };
}

export function gitRoot(): string {
  return git(['rev-parse', '--show-toplevel']).trim();
}

export function git(args: string[], cwd?: string): string {
  return execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}
