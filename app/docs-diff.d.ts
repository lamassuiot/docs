/** Injected by vite.config.ts: pages the PR changes, or null outside PR previews. */
declare const __DOCS_DIFF__: {
  /** Paths relative to content/docs, e.g. 'manual/pqc.mdx'. */
  pages: { path: string; isNew: boolean }[];
  removed: string[];
} | null;
