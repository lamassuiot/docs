import { rehypeCodeDefaultOptions } from "fumadocs-core/mdx-plugins";
import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from "fumadocs-mdx/config";
import { z } from "zod";
import { remarkDocsDiff } from "./lib/docs-diff/remark.ts";
import { transformerDocsDiff } from "./lib/docs-diff/shiki.ts";

// Navigation folders and ordering are defined in localized meta.json files.
export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: frontmatterSchema.extend({
      sidebar: z
        .object({
          /** Label in the sidebar, when it should differ from the title (e.g. 'Visión general'). */
          label: z.string().optional(),
        })
        .strict()
        .optional(),
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

// PR previews set this to the PR's base commit so every page the PR changes
// renders its diff, hidden until the reader turns on "Mostrar cambios".
const diffBase = process.env.VITE_DOCS_DIFF_BASE;

// Disable remarkImage: images live in /public and are served as static URLs,
// so they must not be imported as JS modules by the MDX compiler.
export default defineConfig({
  mdxOptions: {
    remarkImageOptions: false,
    rehypeCodeOptions: {
      ...rehypeCodeDefaultOptions,
      // Muted, low-chroma palette instead of Fumadocs' default GitHub theme.
      themes: { light: "min-light", dark: "min-dark" },
      ...(diffBase
        ? {
            transformers: [
              ...(rehypeCodeDefaultOptions.transformers ?? []),
              transformerDocsDiff(),
            ],
          }
        : {}),
    },
    ...(diffBase
      ? {
          // Appended after Fumadocs' own plugins — see remarkDocsDiff.
          remarkPlugins: (plugins) => [
            ...plugins,
            [remarkDocsDiff, { base: diffBase }],
          ],
        }
      : {}),
  },
});
