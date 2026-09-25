import { createFromSource } from "fumadocs-core/search/server";
import { source } from "@/lib/source";

// The source carries an i18n config (see app/lib/locales.ts), so
// createFromSource builds one Orama index per locale and serves
// /api/search?query=...&locale=... — Spanish for the default locale, English
// from the translated pages. The client dialog passes the active locale
// through fumadocs' i18n context.
export const server = createFromSource(source, {
  localeMap: {
    es: "spanish",
    en: "english",
  },
});

export async function loader() {
  return server.staticGET();
}
