import { glob } from "node:fs/promises";
import type { Config } from "@react-router/dev/config";
import { getSlugs } from "fumadocs-core/source";
import {
  docsUrl,
  i18nConfig,
  LOCALES,
  parseLocaleFile,
} from "./app/lib/locales";
import { API_SERVICES } from "./app/lib/api-services";

// Mount point for this build — see app/lib/base-path.ts. Read from process.env
// because this config is loaded in Node, not bundled.
const basePath = (process.env.VITE_DOCS_BASE_PATH ?? "/docs").replace(
  /\/+$/,
  "",
);

export default {
  ssr: false,
  future: {
    v8_middleware: true,
  },
  async prerender({ getStaticPaths }) {
    const paths = new Set<string>();
    const excluded: string[] = [];

    for (const path of getStaticPaths()) {
      if (!excluded.includes(path)) paths.add(path);
    }

    for await (const entry of glob("**/*.{mdx,md}", { cwd: "content/docs" })) {
      // The dot parser strips the locale suffix from the virtual path, so
      // slugs must come from the stripped path (overview.en.mdx -> overview).
      const { path } = parseLocaleFile(entry);
      const slugs = getSlugs(path);
      for (const target of LOCALES) {
        // Every locale gets a page URL: untranslated pages fall back to the
        // default language's content at the locale's URL.
        paths.add(docsUrl(basePath, target, slugs));
        paths.add(
          `/llms.mdx/docs/${[...(target === i18nConfig.defaultLanguage ? [] : [target]), ...slugs, "index.mdx"].join("/")}`,
        );
      }
    }

    // The API reference is client-rendered, but GitHub Pages has no SPA
    // fallback: each service needs its own HTML entry point.
    for (const { id } of API_SERVICES) {
      paths.add(`${basePath}/api-reference/${id}`);
    }

    return [...paths];
  },
} satisfies Config;
