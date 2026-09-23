import { rehypeCodeDefaultOptions } from 'fumadocs-core/mdx-plugins';
import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { remarkDocsDiff } from './lib/docs-diff/remark.ts';
import { transformerDocsDiff } from './lib/docs-diff/shiki.ts';

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
});

// PR previews set this to the PR's base commit so every page the PR changes
// renders its diff, hidden until the reader turns on "Mostrar cambios".
const diffBase = process.env.VITE_DOCS_DIFF_BASE;

// Disable remarkImage: images live in /public and are served as static URLs,
// so they must not be imported as JS modules by the MDX compiler.
export default defineConfig({
  remarkImageOptions: false,
  mdxOptions: diffBase
    ? {
        // Appended after Fumadocs' own plugins — see remarkDocsDiff.
        remarkPlugins: (plugins) => [...plugins, [remarkDocsDiff, { base: diffBase }]],
        rehypeCodeOptions: {
          ...rehypeCodeDefaultOptions,
          transformers: [...(rehypeCodeDefaultOptions.transformers ?? []), transformerDocsDiff()],
        },
      }
    : undefined,
});
