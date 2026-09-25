import { DEFAULT_LOCALE } from "@/lib/locales";
import { getLLMText, source } from "@/lib/source";

export async function loader() {
  const scanned = await Promise.all(
    source.getPages(DEFAULT_LOCALE).map(getLLMText),
  );

  return new Response(scanned.join("\n\n"));
}
