import { access, copyFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import {
  anchorRedirects,
  DOC_REDIRECTS,
  localizedDocUrl,
} from "./redirects.ts";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function scriptJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function redirectHtml(
  target: string,
  locale: string,
  anchors: Record<string, string>,
): string {
  const text =
    locale === "es"
      ? "Esta página se ha trasladado. Continúa en la documentación actual."
      : "This page has moved. Continue to the current documentation.";
  return `<!doctype html>
<html lang="${locale}"><head><meta charset="utf-8">
<meta name="robots" content="noindex"><title>${locale === "es" ? "Página trasladada" : "Page moved"}</title>
<link rel="canonical" href="${escapeHtml(target)}">
<noscript><meta http-equiv="refresh" content="0;url=${escapeHtml(target)}"></noscript>
<script>
const target = ${scriptJson(target)};
const anchors = ${scriptJson(anchors)};
let anchor = location.hash.slice(1);
try { anchor = decodeURIComponent(anchor); } catch {}
const mapped = Object.hasOwn(anchors, anchor) ? anchors[anchor] : undefined;
const [path, hash] = mapped ? mapped.split('#') : [target, undefined];
location.replace(path + location.search + (hash === undefined ? location.hash : '#' + hash));
</script></head><body><p>${text}</p><a href="${escapeHtml(target)}">${escapeHtml(target)}</a></body></html>\n`;
}

/** GitHub Pages needs a real HTML entry for every legacy route. */
export async function writeStaticDocRedirects(
  clientDirectory: string,
  basePath: string,
): Promise<void> {
  const entries = Object.entries(DOC_REDIRECTS).flatMap(
    ([oldPath, targetPath]) =>
      ["en", "es"].map((locale) => ({ oldPath, targetPath, locale })),
  );
  // Validate all destinations before writing anything; never hide a missing page.
  for (const { targetPath, locale } of entries) {
    const target = join(
      clientDirectory,
      localizedDocUrl(basePath, locale, targetPath).slice(1),
    );
    await access(join(target, "index.html"));
    await access(`${target}.data`);
    await access(
      join(
        clientDirectory,
        "llms.mdx/docs",
        locale === "en" ? "" : locale,
        targetPath,
        "index.mdx",
      ),
    );
  }
  for (const { oldPath, targetPath, locale } of entries) {
    const target = localizedDocUrl(basePath, locale, targetPath);
    const htmlPath = join(
      clientDirectory,
      localizedDocUrl(basePath, locale, oldPath).slice(1),
      "index.html",
    );
    await mkdir(dirname(htmlPath), { recursive: true });
    await writeFile(
      htmlPath,
      redirectHtml(target, locale, anchorRedirects(basePath, locale, oldPath)),
      { flag: "wx" },
    );
    // Client navigation requests React Router's prerendered loader data.
    await copyFile(
      join(clientDirectory, `${target.slice(1)}.data`),
      `${dirname(htmlPath)}.data`,
    );
    const markdownRoot = join(
      clientDirectory,
      "llms.mdx/docs",
      locale === "en" ? "" : locale,
    );
    const markdownPath = join(markdownRoot, oldPath, "index.mdx");
    await mkdir(dirname(markdownPath), { recursive: true });
    await copyFile(join(markdownRoot, targetPath, "index.mdx"), markdownPath);
  }
}
