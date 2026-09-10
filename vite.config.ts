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

// GitHub Pages serves this repo's gh-pages branch under a "/docs/" project-site
// prefix (the custom domain www.lamassu.io is shared with another repo that owns
// the domain root), and that prefix applies to assets too — so built asset URLs
// must carry it. Note this is only Vite's asset `base`; React Router's
// `basename` stays at its default, because the app already prefixes its own
// page routes with /docs (see createGetUrl in react-router.config.ts) and
// setting both would double it up.
//
// PREVIEW_BASENAME overrides it for PR previews, which mount deeper
// (/docs/pr-preview/pr-<n>) and DO set a matching React Router basename.
const previewBasename = process.env.PREVIEW_BASENAME;
const GH_PAGES_BASE = '/docs/';

export default defineConfig(({ command }) => ({
  base: previewBasename ? `${previewBasename}/` : command === 'build' ? GH_PAGES_BASE : '/',
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
