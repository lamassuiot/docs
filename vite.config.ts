import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import mdx from 'fumadocs-mdx/vite';
import * as MdxConfig from './source.config';

// Stub out @scalar/api-reference-react during the SSR/prerender server build.
// The package embeds Vue.js with browser-only top-level code that crashes Node.js.
const ssrStubScalar: Plugin = {
  name: 'ssr-stub-scalar',
  resolveId(id, _importer, options) {
    if (!options?.ssr) return;
    if (id === '@scalar/api-reference-react' || id === '@scalar/api-reference-react/style.css') {
      return '\0ssr-stub-scalar';
    }
  },
  load(id) {
    if (id === '\0ssr-stub-scalar') {
      return 'export const ApiReferenceReact = () => null; export default {};';
    }
  },
};

// Where this build is mounted as the browser sees it — see app/lib/base-path.ts.
// Assets must carry the same prefix as pages, since GitHub Pages serves this
// repo under a "/docs/" project-site prefix that applies to assets too.
// The dev server keeps "/" so localhost doesn't need the prefix.
const basePath = (process.env.VITE_DOCS_BASE_PATH ?? '/docs').replace(/\/+$/, '');

export default defineConfig(({ command }) => ({
  base: command === 'build' ? `${basePath}/` : '/',
  plugins: [
    ssrStubScalar,
    mdx(MdxConfig),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths({
      projects: ['./tsconfig.json'],
    }),
  ],
}));
