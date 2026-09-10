#!/usr/bin/env node
// Computes a per-page unified diff of content/docs/**/*.mdx between a base and
// head ref, and writes it to app/generated/pr-diffs.json for the PR-preview-only
// diff-mode toggle (see app/lib/pr-diffs.ts, app/components/diff-panel.tsx).
//
// No-op (writes {}) if the refs can't be diffed (e.g. shallow clone without the
// base ref, or running outside CI) -- the app already treats an empty diff set
// as "no diff mode available", so this fails safe rather than breaking the build.

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const outPath = join(repoRoot, 'app/generated/pr-diffs.json');

const baseRef = process.env.PR_DIFF_BASE ?? 'origin/main';
const headRef = process.env.PR_DIFF_HEAD ?? 'HEAD';

function git(args) {
  return execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

function writeResult(diffs) {
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(diffs, null, 2)}\n`);
  const count = Object.keys(diffs).length;
  console.log(`[pr-diffs] wrote ${count} page diff(s) to ${outPath}`);
}

let raw;
try {
  raw = git(['diff', '--unified=3', '--no-color', `${baseRef}...${headRef}`, '--', 'content/docs']);
} catch (err) {
  console.warn(`[pr-diffs] git diff ${baseRef}...${headRef} failed (${err.message.split('\n')[0]}); writing empty diff set.`);
  writeResult({});
  process.exit(0);
}

const diffs = {};
// Each file's diff starts with a "diff --git a/<path> b/<path>" line.
const fileBlocks = raw.split(/^diff --git /m).slice(1);

for (const block of fileBlocks) {
  const lines = block.split('\n');
  const headerLine = lines[0]; // "a/<path> b/<path>"
  const match = /^a\/(.+?) b\/(.+)$/.exec(headerLine);
  if (!match) continue;
  const filePath = match[2];
  if (!filePath.startsWith('content/docs/') || !filePath.endsWith('.mdx')) continue;
  const key = filePath.slice('content/docs/'.length);

  const diffLines = [];
  for (const line of lines.slice(1)) {
    if (line.startsWith('@@')) {
      diffLines.push({ type: 'hunk', text: line });
    } else if (line.startsWith('+') && !line.startsWith('+++')) {
      diffLines.push({ type: 'add', text: line.slice(1) });
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      diffLines.push({ type: 'del', text: line.slice(1) });
    } else if (line.startsWith(' ')) {
      diffLines.push({ type: 'ctx', text: line.slice(1) });
    }
    // Anything else (---/+++ headers, "index ...", "\ No newline at end of file") is skipped.
  }

  if (diffLines.length > 0) diffs[key] = diffLines;
}

writeResult(diffs);
