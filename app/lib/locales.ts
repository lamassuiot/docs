import type { I18nConfig } from "fumadocs-core/i18n";
import { DOCS_BASE_PATH } from "./base-path";

/**
 * The two locales this docs site serves, and how they map to URLs.
 *
 * English is the default: its URLs keep the bare shape
 * (/docs/platform/pki/overview). Spanish lives under a locale prefix
 * (/docs/es/platform/pki/overview). Content uses fumadocs' "dot" parser:
 * the default locale's page has the plain name (overview.mdx) and the
 * translation sits beside it as `overview.es.mdx`, so the default language
 * needs no suffix and a folder named after a language can never be mistaken
 * for a locale (the "dir" parser would treat `content/docs/es/...` that way).
 */
export type Locale = "es" | "en";

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALES: Locale[] = ["en", "es"];

/** Label shown in the language switcher for each locale. */
export const LOCALE_ITEMS: { name: string; locale: Locale }[] = [
  { name: "English", locale: "en" },
  { name: "Español", locale: "es" },
];

/**
 * The i18n contract shared by the loader (app/lib/source.ts), the prerender
 * config (react-router.config.ts) and everything that maps a URL to a page.
 * Loaded in Node config files too, so this module must not touch
 * import.meta.env or browser-only APIs.
 */
export const i18nConfig: I18nConfig<Locale> = {
  languages: LOCALES,
  defaultLanguage: DEFAULT_LOCALE,
  // The default locale keeps unprefixed URLs; other locales get `/<locale>/`.
  hideLocale: "default-locale",
  parser: "dot",
};

function isLocale(value: string): value is Locale {
  return (LOCALES as string[]).includes(value);
}

function pathSegments(path: string): string[] {
  return path
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean);
}

function contentSegments(path: string): string[] {
  const segments = pathSegments(path);
  const mount = pathSegments(DOCS_BASE_PATH);
  const isMounted = mount.every((part, index) => segments[index] === part);
  return isMounted ? segments.slice(mount.length) : segments;
}

/** Locale used for a full site path, e.g. '/docs/en/platform/...' -> 'en'. The mount prefix is ignored first. */
export function localeFromPath(path: string): Locale {
  const content = contentSegments(path);
  return content.length > 0 && isLocale(content[0])
    ? content[0]
    : DEFAULT_LOCALE;
}

/**
 * Split route segments into the request locale and the content slugs, e.g.
 * ['es', 'platform', 'pki'] -> { locale: 'es', content: ['platform', 'pki'] }.
 * The default locale has no segment, so anything not matching a locale prefix
 * is default-locale (English) content.
 */
export function splitLocaleSlugs(slugs: string[]): {
  locale: Locale;
  content: string[];
} {
  const [first] = slugs;
  if (first && isLocale(first)) {
    return { locale: first, content: slugs.slice(1) };
  }
  return { locale: DEFAULT_LOCALE, content: slugs };
}

/**
 * Map a content path to the URL path segments within the mount point for a
 * locale: 'platform/pki/overview' -> 'es/platform/pki/overview' for Spanish,
 * unchanged for English.
 */
export function localePath(locale: Locale, path = ""): string {
  const suffix = path.replace(/^\/+|\/+$/g, "");
  return locale === DEFAULT_LOCALE
    ? suffix
    : `${locale}${suffix ? `/${suffix}` : ""}`;
}

/**
 * Rewrite a same-site docs URL to another locale. Handles both shapes a URL
 * can arrive in: 'platform/pki/overview' (relative) and full site paths such
 * as '/docs/platform/pki/overview' or '/docs/en/platform/pki/overview'.
 * Non-docs links (api-reference, llms endpoints) pass through untouched.
 */
export function rewriteDocsUrlToLocale(url: string, locale: Locale): string {
  const [path, hash] = url.split("#", 2);
  if (!path.startsWith("/")) return url;

  const mount = pathSegments(DOCS_BASE_PATH);
  const segments = pathSegments(path);
  if (!mount.every((part, index) => segments[index] === part)) return url;

  const mountedContent = segments.slice(mount.length);
  const hasLocalePrefix = isLocale(mountedContent[0] ?? "");
  const content = hasLocalePrefix ? mountedContent.slice(1) : mountedContent;
  const target = docsUrl(DOCS_BASE_PATH, locale, content);
  return hash !== undefined ? `${target}#${hash}` : target;
}
/**
 * Full site URL for a page, e.g. ('/docs', 'es', ['platform']) -> '/docs/es/platform'.
 * The default locale stays unprefixed; others get a segment inside the docs
 * mount point, matching the route pattern `/docs/*` and the fumadocs language
 * toggle's expectations.
 */
export function docsUrl(
  basePath: string,
  locale: Locale,
  slugs: string[],
): string {
  const base = basePath.replace(/^\/+|\/+$/g, "");
  const segments = [
    ...base.split("/").filter((v) => v.length > 0),
    ...(locale === DEFAULT_LOCALE ? [] : [locale]),
    ...slugs,
  ];
  return `/${segments.join("/")}`;
}

/** URL of the docs home page for a locale, e.g. '/docs' or '/docs/es'. */
export function siteUrl(locale: Locale): string {
  return docsUrl(DOCS_BASE_PATH, locale, []);
}

/** Site path segments with the mount prefix removed, e.g. '/docs/x' -> ['x']. */
export function mountFrom(path: string): string[] {
  return contentSegments(path);
}
/**
 * Split a content file path into its locale-free path and locale, mirroring
 * the loader's "dot" parser: 'platform/pki/overview.es.mdx' ->
 * { path: 'platform/pki/overview.mdx', locale: 'es' }. Files without a
 * known locale suffix belong to the default locale (English).
 */
export function parseLocaleFile(path: string): {
  path: string;
  locale: Locale;
} {
  const dot = path.lastIndexOf(".");
  if (dot === -1) return { path, locale: DEFAULT_LOCALE };

  const ext = path.slice(dot);
  const stem = path.slice(0, dot);
  const stemDot = stem.lastIndexOf(".");
  if (stemDot !== -1) {
    const candidate = stem.slice(stemDot + 1);
    if (isLocale(candidate)) {
      return { path: `${stem.slice(0, stemDot)}${ext}`, locale: candidate };
    }
  }
  return { path, locale: DEFAULT_LOCALE };
}

/** Fumadocs UI strings per locale; English matches fumadocs' defaults. */
const ES_TRANSLATIONS = {
  search: "Buscar",
  searchNoResult: "Sin resultados",
  toc: "En esta página",
  tocNoHeadings: "Sin encabezados",
  lastUpdate: "Última actualización",
  chooseLanguage: "Elige un idioma",
  nextPage: "Página siguiente",
  previousPage: "Página anterior",
  chooseTheme: "Tema",
  editOnGithub: "Editar en GitHub",
};

export function uiTranslations(locale: Locale) {
  return locale === DEFAULT_LOCALE ? {} : ES_TRANSLATIONS;
}
