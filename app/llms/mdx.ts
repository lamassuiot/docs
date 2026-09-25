import { splitLocaleSlugs } from "@/lib/locales";
import { getLLMText, source } from "@/lib/source";
import type { Route } from "./+types/mdx";

export async function loader({ params }: Route.LoaderArgs) {
  const slugs = params["*"].split("/").filter((v) => v.length > 0);
  // remove the appended "index.mdx" that's added to avoid React Router issues
  slugs.pop();
  const { locale, content } = splitLocaleSlugs(slugs);
  const page = source.getPage(content, locale);
  if (!page) {
    return new Response("not found", { status: 404 });
  }
  return new Response(await getLLMText(page), {
    headers: {
      "Content-Type": "text/markdown",
    },
  });
}
