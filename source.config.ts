import { defineConfig, defineDocs } from 'fumadocs-mdx/config';

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
});

// Disable remarkImage: images live in /public and are served as static URLs,
// so they must not be imported as JS modules by the MDX compiler.
export default defineConfig({ remarkImageOptions: false });
