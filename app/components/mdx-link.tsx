import { useI18n } from "fumadocs-ui/contexts/i18n";
import type { ComponentProps } from "react";
import { DOCS_BASE_PATH, docsPath } from "@/lib/base-path";
import {
  DEFAULT_LOCALE,
  type Locale,
  rewriteDocsUrlToLocale,
} from "@/lib/locales";

/**
 * Rewrites the absolute `/docs/...` links authors write in MDX onto this
 * build's mount point and the reader's locale, so a versioned or preview
 * build links within itself and stays in the same language. External links,
 * anchors and already-correct links pass through untouched.
 */
export function MdxLink({ href, ...props }: ComponentProps<"a">) {
  const { locale } = useI18n();
  return (
    <a
      href={href ? rewrite(href, (locale ?? DEFAULT_LOCALE) as Locale) : href}
      {...props}
    />
  );
}

function rewrite(href: string, locale: Locale): string {
  if (href.startsWith(`${DOCS_BASE_PATH}/`) || href === DOCS_BASE_PATH)
    return rewriteDocsUrlToLocale(href, locale);
  if (href === "/docs") return docsPath();
  if (href.startsWith("/docs/"))
    return rewriteDocsUrlToLocale(
      docsPath(href.slice("/docs/".length)),
      locale,
    );
  return href;
}
