import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import {
  anchorRedirects,
  DOC_REDIRECTS,
  localizedDocUrl,
  resolveDocRedirect,
} from "./redirects.ts";
import { redirectHtml, writeStaticDocRedirects } from "./static.ts";

test("static redirect scripts agree with SPA redirects, including encoded anchors", () => {
  const base = "/docs/pr-preview/pr-42";
  for (const [oldPath, targetPath] of Object.entries(DOC_REDIRECTS)) {
    for (const locale of ["en", "es"]) {
      const location = new URL(
        `https://docs.example${localizedDocUrl(base, locale, oldPath)}?view=device#trust%20anchors`,
      );
      let actual: string | undefined;
      const html = redirectHtml(
        localizedDocUrl(base, locale, targetPath),
        locale,
        anchorRedirects(base, locale, oldPath),
      );
      const script = /<script>([\s\S]*?)<\/script>/.exec(html)?.[1];
      assert.ok(script);
      runInNewContext(script, {
        location: {
          pathname: location.pathname,
          search: location.search,
          hash: location.hash,
          replace: (target: string) => {
            actual = target;
          },
        },
      });
      assert.equal(actual, resolveDocRedirect(location, base));
      assert.ok(html.includes('name="robots" content="noindex"'));
    }
  }
  const location = new URL(
    `https://docs.example${base}/es/platform/pki#automatiza-identidades-de-dispositivos`,
  );
  let actual: string | undefined;
  const html = redirectHtml(
    `${base}/es/platform/pki/overview`,
    "es",
    anchorRedirects(base, "es", "platform/pki"),
  );
  runInNewContext(/<script>([\s\S]*?)<\/script>/.exec(html)?.[1] ?? "", {
    location: {
      search: location.search,
      hash: location.hash,
      replace: (target: string) => {
        actual = target;
      },
    },
  });
  assert.equal(
    actual,
    `${base}/es/platform/overview#automatiza-identidades-de-dispositivos`,
  );
});

test("static generation supplies HTML, SPA data and Markdown for every old URL", async () => {
  const directory = await mkdtemp(join(tmpdir(), "docs-redirects-"));
  const base = "/docs/v3.8.0";
  try {
    for (const target of new Set(Object.values(DOC_REDIRECTS))) {
      for (const locale of ["en", "es"]) {
        const page = join(
          directory,
          localizedDocUrl(base, locale, target).slice(1),
        );
        const markdown = join(
          directory,
          "llms.mdx/docs",
          locale === "es" ? "es" : "",
          target,
          "index.mdx",
        );
        await mkdir(page, { recursive: true });
        await mkdir(dirname(markdown), { recursive: true });
        await writeFile(
          join(page, "index.html"),
          `<title>${locale}:${target}</title>`,
        );
        await writeFile(`${page}.data`, `${locale}:${target}`);
        await writeFile(markdown, `# ${locale}:${target}`);
      }
    }
    await writeStaticDocRedirects(directory, base);
    for (const [oldPath, target] of Object.entries(DOC_REDIRECTS)) {
      for (const locale of ["en", "es"]) {
        const old = join(
          directory,
          localizedDocUrl(base, locale, oldPath).slice(1),
        );
        assert.ok(
          (await readFile(join(old, "index.html"), "utf8")).includes(
            `href="${localizedDocUrl(base, locale, target)}"`,
          ),
        );
        assert.equal(
          await readFile(`${old}.data`, "utf8"),
          `${locale}:${target}`,
        );
        assert.equal(
          await readFile(
            join(
              directory,
              "llms.mdx/docs",
              locale === "es" ? "es" : "",
              oldPath,
              "index.mdx",
            ),
            "utf8",
          ),
          `# ${locale}:${target}`,
        );
        assert.equal(
          await readFile(
            join(
              directory,
              localizedDocUrl(base, locale, target).slice(1),
              "index.html",
            ),
            "utf8",
          ),
          `<title>${locale}:${target}</title>`,
        );
      }
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("missing canonical pages fail the build before emitting redirect entries", async () => {
  const directory = await mkdtemp(join(tmpdir(), "docs-redirects-missing-"));
  try {
    await assert.rejects(writeStaticDocRedirects(directory, "/docs"), {
      code: "ENOENT",
    });
    await assert.rejects(
      readFile(join(directory, "docs/platform/index.html")),
      { code: "ENOENT" },
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
