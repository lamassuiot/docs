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

export default defineConfig({
  plugins: [
    ssrStubScalar,
    mdx(MdxConfig),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths({
      projects: ['./tsconfig.json'],
    }),
  ],
});
