import { rehypeCodeDefaultOptions } from 'fumadocs-core/mdx-plugins';
import { defineConfig, defineDocs, frontmatterSchema, metaSchema } from 'fumadocs-mdx/config';
import { z } from 'zod';
import { remarkDocsDiff } from './lib/docs-diff/remark.ts';
import { transformerDocsDiff } from './lib/docs-diff/shiki.ts';

// Sidebar placement inside "Servicios Core", which the site groups into
// KMS / CA / RA / VA / ... folders (see groupServiciosCoreNodes in
// app/routes/docs.tsx). Lives in content so a docs change can place its own
// pages: a page sets `sidebar.group` (and optionally `sidebar.label`); a
// subfolder of related pages sets `group` in its meta.json.
export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: frontmatterSchema.extend({
      sidebar: z
        .object({
          /** Group folder the page is listed under, e.g. 'CA'. Unknown names create a new group. */
          group: z.string().optional(),
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
    schema: metaSchema.extend({
      /** Group folder this whole subfolder is nested under, e.g. 'CA'. */
      group: z.string().optional(),
    }),
  },
});

// PR previews set this to the PR's base commit so every page the PR changes
// renders its diff, hidden until the reader turns on "Mostrar cambios".
const diffBase = process.env.VITE_DOCS_DIFF_BASE;

// Disable remarkImage: images live in /public and are served as static URLs,
// so they must not be imported as JS modules by the MDX compiler.
export default defineConfig({
  remarkImageOptions: false,
  mdxOptions: diffBase
    ? {
        // Appended after Fumadocs' own plugins — see remarkDocsDiff.
        remarkPlugins: (plugins) => [...plugins, [remarkDocsDiff, { base: diffBase }]],
        rehypeCodeOptions: {
          ...rehypeCodeDefaultOptions,
          transformers: [...(rehypeCodeDefaultOptions.transformers ?? []), transformerDocsDiff()],
        },
      }
    : undefined,
});
