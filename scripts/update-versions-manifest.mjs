#!/usr/bin/env node
// Adds or updates one entry in the shared version manifest that feeds the
// version selector (app/components/version-selector.tsx).
//
//   usage: node scripts/update-versions-manifest.mjs <manifest-path> <label> <path> [--unstable]
//   e.g.   node scripts/update-versions-manifest.mjs /tmp/ghp/versions.json v3.8.0 /docs/v3.8.0
//
// The manifest lives at the GitHub Pages project root so every deployed version
// reads the same list — a version published today shows up in the selector of a
// version published months ago.

import { readFileSync, writeFileSync } from 'node:fs';

const [manifestPath, label, path] = process.argv.slice(2);
const unstable = process.argv.includes('--unstable');

if (!manifestPath || !label || !path) {
  console.error(
    'usage: update-versions-manifest.mjs <manifest-path> <label> <path> [--unstable]',
  );
  process.exit(1);
}

let versions = [];
try {
  const parsed = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (Array.isArray(parsed.versions)) versions = parsed.versions;
} catch {
  // No manifest yet (first deploy) — start a fresh list.
}

versions = versions.filter((v) => v.path !== path);
versions.push(unstable ? { label, path, unstable: true } : { label, path });

// Unstable (main) first, then newest release first.
const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});
versions.sort((a, b) => {
  if (a.unstable !== b.unstable) return a.unstable ? -1 : 1;
  return collator.compare(b.label, a.label);
});

writeFileSync(manifestPath, `${JSON.stringify({ versions }, null, 2)}\n`);
console.log(`[versions] ${versions.map((v) => v.label).join(', ')}`);
