/**
 * Resolve a path under `public/` against Vite's configured base path, so
 * root-absolute asset URLs still work when the app is built for a non-root
 * preview basename (see PREVIEW_BASENAME in vite.config.ts / react-router.config.ts).
 */
export function asset(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}
