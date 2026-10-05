import browserCollections from "fumadocs-mdx:collections/browser";
import type {
  Folder as PageTreeFolder,
  Item as PageTreeItem,
  Node as PageTreeNode,
  Root as PageTreeRoot,
} from "fumadocs-core/page-tree";
import { useFumadocsLoader } from "fumadocs-core/source/client";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/layouts/docs/page";
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
import { VersionSelector } from "@/components/version-selector";
import { DOCS_BASE_PATH } from "@/lib/base-path";
import { baseOptions, gitConfig } from "@/lib/layout.shared";
import { DEFAULT_LOCALE, splitLocaleSlugs } from "@/lib/locales";
import { source } from "@/lib/source";
import {
  canonicalDocPath,
  resolveDocRedirect,
} from "../../lib/docs-redirects/redirects";
import type { Route } from "./+types/docs";

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

export async function loader({ params }: Route.LoaderArgs) {
  const slugs = params["*"].split("/").filter((v) => v.length > 0);
  if (slugs.length === 0) throw new Response("Not found", { status: 404 });

  const { locale, content } = splitLocaleSlugs(slugs);
  const canonicalSlugs = canonicalDocPath(content.join("/")).split("/");
  const page = source.getPage(canonicalSlugs, locale);
  if (!page) throw new Response("Not found", { status: 404 });
  const pageTree = mapPageTree(source.getPageTree(locale), locale);

  return {
    slugs: page.slugs,
    path: page.path,
    url: page.url,
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
      locale,
      affected,
    }: {
      slugs: string[];
      path: string;
      url: string;
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
        tableOfContent={{
          style: "clerk",
        }}
        tableOfContentPopover={{
          style: "clerk",
        }}
      >
        <title>
          {titleParts.badge
            ? `${titleParts.badge} ${titleParts.text}`
            : frontmatter.title}
        </title>
        <DocsTitle className="text-[2.25rem] font-bold tracking-tight">
          {diff?.title ? (
            <DiffText diff={diff.title} />
          ) : (
            renderBadgeTitle(frontmatter.title)
          )}
        </DocsTitle>
        <DocsDescription>
          {diff?.description ? (
            <DiffText diff={diff.description} />
          ) : (
            frontmatter.description
          )}
        </DocsDescription>
        <DiffToggle
          diff={diff}
          affected={affected}
          currentUrl={url}
          locale={locale}
        />
        <div className="flex flex-row gap-2 items-center border-b -mt-4 pb-6">
          <LLMCopyButton markdownUrl={markdownUrl} />
          <ViewOptions
            markdownUrl={markdownUrl}
            githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${path}`}
          />
        </div>
        <DocsBody className="[&>h1:first-child]:hidden">
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

  return (
    <DocsLayout
      {...baseOptions()}
      i18n
      tree={pageTree}
      sidebar={{ banner: <VersionSelector /> }}
    >
      {content}
    </DocsLayout>
  );
}
