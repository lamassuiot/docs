import type { Config } from '@react-router/dev/config';
import { glob } from 'node:fs/promises';
import { createGetUrl, getSlugs } from 'fumadocs-core/source';

// Mount point for this build — see app/lib/base-path.ts. Read from process.env
// because this config is loaded in Node, not bundled.
const basePath = (process.env.VITE_DOCS_BASE_PATH ?? '/docs').replace(/\/+$/, '');
const getUrl = createGetUrl(basePath);

export default {
  ssr: false,
  future: {
    v8_middleware: true,
  },
  async prerender({ getStaticPaths }) {
    const paths: string[] = [];
    const excluded: string[] = [];

    for (const path of getStaticPaths()) {
      if (!excluded.includes(path)) paths.push(path);
    }


    for await (const entry of glob('**/*.mdx', { cwd: 'content/docs' })) {
      const slugs = getSlugs(entry);
      paths.push(getUrl(slugs), `/llms.mdx/docs/${[...slugs, 'index.mdx'].join('/')}`);
    }

    return paths;
  },
} satisfies Config;
