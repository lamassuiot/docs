import browserCollections from "fumadocs-mdx:collections/browser";
import type {
  Folder as PageTreeFolder,
  Item as PageTreeItem,
  Node as PageTreeNode,
  Root as PageTreeRoot,
} from "fumadocs-core/page-tree";
import { useFumadocsLoader } from "fumadocs-core/source/client";
import { Step, Steps } from "fumadocs-ui/components/steps";
// Notebook layout: full-width top navbar with the section tabs underneath and
// the sidebar below it — the Mintlify-style shell (logo · search · actions,
// then a tab row) instead of the classic sidebar-owns-the-header layout.
import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/layouts/notebook/page";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { LLMCopyButton, ViewOptions } from "@/components/ai/page-actions";
import { ArchitectureDiagram } from "@/components/architecture-diagram";
import {
  type AffectedPages,
  DiffText,
  DiffToggle,
  type PageDiff,
} from "@/components/diff-toggle";
import { MdxCard, MdxLink } from "@/components/mdx-link";
import { ScalarIcon } from "@/components/scalar-icon";
import { VersionSelector } from "@/components/version-selector";
import { asset } from "@/lib/asset";
import { DOCS_BASE_PATH, docsPath } from "@/lib/base-path";
import { baseOptions, gitConfig } from "@/lib/layout.shared";
import { DEFAULT_LOCALE, splitLocaleSlugs } from "@/lib/locales";
import { source } from "@/lib/source";
import { getSidebarTabs } from "fumadocs-ui/utils/get-sidebar-tabs";
import { createElement } from "react";
import {
  canonicalDocPath,
  resolveDocRedirect,
} from "../../lib/docs-redirects/redirects";
import type { Route } from "./+types/docs";
import { ImageLightbox } from "@/components/image-lightbox";

function splitBadgeTitle(title: string) {
  const match = /^\[([^\]]+)\]\s*(.+)$/.exec(title.trim());

  if (!match) {
    return { badge: null, text: title };
  }

  return {
    badge: match[1],
    text: match[2],
  };
}

function renderBadgeTitle(title: string, compact = false): ReactNode {
  const { badge, text } = splitBadgeTitle(title);

  if (!badge) {
    return title;
  }

  const badgeClassName = compact
    ? "inline-flex items-center rounded-full border border-fd-primary/20 bg-fd-primary/10 px-1.5 py-px text-[0.58rem] font-semibold uppercase tracking-[0.08em] text-fd-primary"
    : "inline-flex items-center rounded-full border border-fd-primary/20 bg-fd-primary/10 px-3 py-1 text-sm font-semibold uppercase tracking-[0.12em] text-fd-primary";

  return (
    <span>
      <span className={`${badgeClassName} mr-2 align-middle`}>{badge}</span>
      <span>{text}</span>
    </span>
  );
}

function mapTreeNodeName(name: ReactNode, compact = false): ReactNode {
  if (typeof name !== "string") {
    return name;
  }

  return renderBadgeTitle(name, compact);
}

function mapPageTreeNode(node: PageTreeNode, locale: string): PageTreeNode {
  if (node.type === "folder") {
    const folder: PageTreeFolder = {
      ...node,
      name: mapTreeNodeName(node.name, true),
      children: node.children.map((child) => mapPageTreeNode(child, locale)),
    };

    if (node.index) {
      folder.index = {
        ...node.index,
        name: mapTreeNodeName(node.index.name, true),
      } satisfies PageTreeItem;
    }

    return folder;
  }

  if (node.type === "page") {
    return {
      ...node,
      name:
        source.getNodePage(node, locale)?.data.sidebar?.label ??
        mapTreeNodeName(node.name, true),
    } satisfies PageTreeItem;
  }

  return {
    ...node,
    name: node.name ? mapTreeNodeName(node.name, true) : node.name,
  };
}

function mapPageTree(root: PageTreeRoot, locale: string): PageTreeRoot {
  return {
    ...root,
    name: mapTreeNodeName(root.name, true),
    children: root.children.map((child) => mapPageTreeNode(child, locale)),
    fallback: root.fallback
      ? mapPageTree(root.fallback, locale)
      : root.fallback,
  };
}

/**
 * Where the page sits, shown as a path above its title ("Platform / PKI /
 * Validation"): the enclosing folders, from the tab down, followed by the
 * nearest sidebar separator ("---Validation---") that precedes the page.
 */
function sectionTrail(root: PageTreeRoot, url: string): string[] {
  const label = (name: ReactNode) =>
    typeof name === "string" ? splitBadgeTitle(name).text : null;
  const withSeparator = (trail: string[], separator: string | null) =>
    separator && trail.at(-1) !== separator ? [...trail, separator] : trail;

  function walk(nodes: PageTreeNode[], trail: string[]): string[] | undefined {
    let separator: string | null = null;
    for (const node of nodes) {
      if (node.type === "separator") {
        separator = label(node.name);
      } else if (node.type === "page") {
        if (node.url === url) return withSeparator(trail, separator);
      } else if (node.type === "folder") {
        // A folder's own landing page belongs to the folder's parent.
        if (node.index?.url === url) return withSeparator(trail, separator);
        const name = label(node.name);
        const found = walk(node.children, name ? [...trail, name] : trail);
        if (found) return found;
      }
    }
    return undefined;
  }

  return walk(root.children, []) ?? [];
}

export async function loader({ params }: Route.LoaderArgs) {
  const slugs = params["*"].split("/").filter((v) => v.length > 0);
  if (slugs.length === 0) throw new Response("Not found", { status: 404 });

  const { locale, content } = splitLocaleSlugs(slugs);
  const canonicalSlugs = canonicalDocPath(content.join("/")).split("/");
  const page = source.getPage(canonicalSlugs, locale);
  if (!page) throw new Response("Not found", { status: 404 });
  const rawTree = source.getPageTree(locale);
  const pageTree = mapPageTree(rawTree, locale);

  return {
    slugs: page.slugs,
    path: page.path,
    url: page.url,
    trail: sectionTrail(rawTree, page.url),
    locale,
    affected: affectedPages(locale),
    pageTree: await source.serializePageTree(pageTree),
  };
}

/** PR previews only: every page the PR touches, for the diff panel. */
function affectedPages(locale: string): AffectedPages | undefined {
  if (!__DOCS_DIFF__) return undefined;
  const byPath = new Map(
    source
      .getPages(locale)
      .map((page) => [page.path.replace(/\.es\.mdx$/, ".mdx"), page]),
  );
  const pages = __DOCS_DIFF__.pages.flatMap(({ path, isNew }) => {
    const page = byPath.get(path);
    return page
      ? [
          {
            url: page.url,
            title: splitBadgeTitle(page.data.title ?? path).text,
            isNew,
          },
        ]
      : [];
  });
  // Removed pages no longer build, so all there is to show is where they were.
  const removed = __DOCS_DIFF__.removed.map(
    (path) => `/${path.replace(/(^|\/)index\.mdx$|\.mdx$/, "")}`,
  );
  return { pages: pages.sort((a, b) => a.url.localeCompare(b.url)), removed };
}

const clientLoader = browserCollections.docs.createClientLoader({
  component(
    { toc, frontmatter, default: Mdx, ...exports },
    // you can define props for the component
    {
      slugs,
      path,
      url,
      trail,
      locale,
      affected,
    }: {
      slugs: string[];
      path: string;
      url: string;
      trail: string[];
      locale: string;
      affected?: AffectedPages;
    },
  ) {
    const markdownUrl = `/llms.mdx/docs/${[...(locale === DEFAULT_LOCALE ? [] : [locale]), ...slugs, "index.mdx"].join("/")}`;
    const titleParts = splitBadgeTitle(frontmatter.title);
    const filteredToc = toc.filter((item) => item.depth !== 1);
    // Only on PR previews, for pages the PR changed — see lib/docs-diff.
    const diff = (exports as { lmDiff?: PageDiff }).lmDiff;

    return (
      <DocsPage
        breadcrumb={{
          enabled: false,
        }}
        toc={filteredToc}
        // Narrow, centred reading column between the sidebar and the TOC.
        className="items-center *:w-full *:max-w-[47rem] xl:pt-12"
      >
        <title>
          {titleParts.badge
            ? `${titleParts.badge} ${titleParts.text}`
            : frontmatter.title}
        </title>
        {/* Page header: eyebrow, title with the page actions beside it, and
            the description — set off by an accent rule on a soft surface. */}
        <header className="lm-page-header @container/page-header">
          {/* Decorative: the Lamassu mark, large and faint, cropped at the
              card's right edge. Tinted through a mask so it follows the
              theme's accent colour. */}
          <span
            aria-hidden
            className="lm-page-mark"
            style={{
              WebkitMaskImage: `url(${asset("images/lamassu.svg")})`,
              maskImage: `url(${asset("images/lamassu.svg")})`,
            }}
          />
          {trail.length > 0 && (
            <nav aria-label="Breadcrumb" className="lm-page-trail">
              <ol>
                {trail.map((part, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: static, ordered path
                  <li key={i}>{part}</li>
                ))}
              </ol>
            </nav>
          )}
          <div className="flex flex-col gap-3 @[34rem]/page-header:flex-row @[34rem]/page-header:items-center">
            <DocsTitle className="lm-page-title">
              {diff?.title ? (
                <DiffText diff={diff.title} />
              ) : (
                renderBadgeTitle(frontmatter.title)
              )}
            </DocsTitle>
            <div className="lm-page-actions">
              <LLMCopyButton markdownUrl={markdownUrl} />
              <ViewOptions
                markdownUrl={markdownUrl}
                githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${path}`}
              />
            </div>
          </div>
          <DocsDescription className="lm-page-description">
            {diff?.description ? (
              <DiffText diff={diff.description} />
            ) : (
              frontmatter.description
            )}
          </DocsDescription>
        </header>
        <DiffToggle
          diff={diff}
          affected={affected}
          currentUrl={url}
          locale={locale}
        />
        <DocsBody className="mt-4 [&>h1:first-child]:hidden">
          <Mdx
            components={{
              ...defaultMdxComponents,
              a: MdxLink,
              Card: MdxCard,
              Step,
              Steps,
              ArchitectureDiagram,
            }}
          />
        </DocsBody>
        <ImageLightbox />
      </DocsPage>
    );
  },
});

export default function Page({ loaderData }: Route.ComponentProps) {
  const { pageTree, ...rest } = useFumadocsLoader(loaderData);
  const location = useLocation();
  const content = clientLoader.useContent(loaderData.path, rest);
  const target = resolveDocRedirect(location, DOCS_BASE_PATH);
  if (target) return <Navigate to={target} replace />;

  // Sidebar tabs derive from root folders; API Reference is a route, not a
  // content folder, so it is appended as a manual tab. Built from the
  // loader-provided `pageTree`: importing `source` here would pull the whole
  // server content collection into the client bundle.
  const tabs = [
    ...getSidebarTabs(pageTree),
    {
      url: docsPath("api-reference/ca"),
      title: loaderData.locale === DEFAULT_LOCALE ? "API Reference" : "Referencia de API",
      description: "",
      icon: createElement(ScalarIcon, { className: "size-full text-[#237b69]" }),
      urls: new Set<string>([docsPath("api-reference/ca")]),
    },
  ];

  return (
    <DocsLayout
      {...baseOptions()}
      nav={{ ...baseOptions().nav, mode: "top" }}
      tabMode="navbar"
      i18n
      tree={pageTree}
      sidebar={{ banner: <VersionSelector />, tabs, collapsible: false }}
    >
      {content}
    </DocsLayout>
  );
}
