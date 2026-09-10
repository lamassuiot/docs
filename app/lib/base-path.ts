/**
 * Where this build of the site is mounted, as the browser sees it.
 *
 * Single source of truth for every path the app emits: route patterns
 * (app/routes.ts), page URLs (react-router.config.ts, app/lib/source.ts),
 * asset URLs (Vite's `base`) and in-app links. Set via VITE_DOCS_BASE_PATH:
 *
 *   /docs                     main, published at the gh-pages root
 *   /docs/v3.8.0              a tagged release
 *   /docs/pr-preview/pr-42    a PR preview
 *
 * The leading '/docs' is GitHub Pages' project-site prefix for this repo (the
 * custom domain is shared with another repo that owns the domain root), so it
 * is stripped again when publishing — see the deploy workflows.
 */
export const DOCS_BASE_PATH = normalize(
  // Vite exposes VITE_-prefixed vars to bundled code via import.meta.env; the
  // config files that also need this read process.env.VITE_DOCS_BASE_PATH.
  import.meta.env.VITE_DOCS_BASE_PATH ?? '/docs',
);

function normalize(value: string): string {
  const trimmed = value.replace(/\/+$/, '');
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

/** Join a path onto the mount point, e.g. docsPath('manual') -> '/docs/manual'. */
export function docsPath(path = ''): string {
  const suffix = path.replace(/^\//, '');
  return suffix ? `${DOCS_BASE_PATH}/${suffix}` : DOCS_BASE_PATH;
}

/**
 * The version manifest is shared by every deployed version, so it lives at the
 * GitHub Pages project root — the first segment of the mount point — rather
 * than inside any one version's subtree. A version published later can then
 * appear in the selector of a version published earlier.
 */
export const VERSIONS_MANIFEST_URL = `/${DOCS_BASE_PATH.split('/')[1]}/versions.json`;

/** The path of the current build within its version, e.g. 'manual/servicios-core/est'. */
export function pathWithinVersion(pathname: string): string {
  return pathname.startsWith(DOCS_BASE_PATH)
    ? pathname.slice(DOCS_BASE_PATH.length).replace(/^\//, '')
    : '';
}
