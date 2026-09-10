import type { Config } from '@react-router/dev/config';
import { glob } from 'node:fs/promises';
import { createGetUrl, getSlugs } from 'fumadocs-core/source';

const getUrl = createGetUrl('/docs');

// Set by CI to mount a PR preview build under a non-root path, e.g. "/pr-preview/pr-42".
// Leave unset for the production build, which is served at the domain root.
const basename = process.env.PREVIEW_BASENAME || '/';

export default {
  ssr: false,
  basename,
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
