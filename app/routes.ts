import { index, type RouteConfig, route } from '@react-router/dev/routes';

// Mount point for this build, without the leading slash — see app/lib/base-path.ts.
// Read from process.env here because this config is loaded in Node, not bundled.
const PREFIX = (process.env.VITE_DOCS_BASE_PATH ?? '/docs').replace(
  /^\/+|\/+$/g,
  '',
);

export default [
  index('routes/docs-home.tsx'),
  route(PREFIX, 'routes/docs-home.tsx', { id: 'docs-home-root' }),
  route(`${PREFIX}/*`, 'routes/docs.tsx'),
  route('api/search', 'routes/search.ts'),

  // LLM integration:
  route('llms.txt', 'llms/index.ts'),
  route('llms-full.txt', 'llms/full.ts'),
  route('llms.mdx/docs/*', 'llms/mdx.ts'),

  route('api-reference/:service', 'routes/api-reference.tsx'),

  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig;
