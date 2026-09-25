import { DEFAULT_LOCALE } from "@/lib/locales";
import { source } from "@/lib/source";

// llms.txt lists the default-language pages. Translated pages fall back to
// Spanish content under their English URLs; the per-page markdown endpoint
// serves whichever locale the URL carries.
export async function loader() {
  const lines: string[] = [];
  lines.push("# Documentation");
  lines.push("");
  for (const page of source.getPages(DEFAULT_LOCALE)) {
    lines.push(`- [${page.data.title}](${page.url}): ${page.data.description}`);
  }
  return new Response(lines.join("\n"));
}
