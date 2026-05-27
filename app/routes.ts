import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  index('routes/docs-home.tsx'),
  route('docs', 'routes/docs-home.tsx', { id: 'docs-home-root' }),
  route('docs/*', 'routes/docs.tsx'),
  route('api/search', 'routes/search.ts'),

  // LLM integration:
  route('llms.txt', 'llms/index.ts'),
  route('llms-full.txt', 'llms/full.ts'),
  route('llms.mdx/docs/*', 'llms/mdx.ts'),

  route('api-reference/:service', 'routes/api-reference.tsx'),

  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig;
