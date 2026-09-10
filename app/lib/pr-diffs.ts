import prDiffs from '@/generated/pr-diffs.json';

export type DiffLine = { type: 'hunk' | 'add' | 'del' | 'ctx'; text: string };

/**
 * Per-page unified diff data, generated at build time for PR previews only
 * (scripts/generate-pr-diffs.mjs). Empty in production builds, so callers
 * naturally get `undefined` there and can skip rendering diff UI entirely.
 */
export function getPageDiff(path: string): DiffLine[] | undefined {
  return (prDiffs as Record<string, DiffLine[]>)[path];
}
