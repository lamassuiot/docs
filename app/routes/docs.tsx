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
import {
  BadgeCheck,
  Bell,
  ClipboardList,
  Cpu,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";
import { redirect } from "react-router";
import { LLMCopyButton, ViewOptions } from "@/components/ai/page-actions";
import {
  type AffectedPages,
  DiffText,
  DiffToggle,
  type PageDiff,
} from "@/components/diff-toggle";
import { MdxLink } from "@/components/mdx-link";
import { VersionSelector } from "@/components/version-selector";
import { docsPath } from "@/lib/base-path";
import { baseOptions, gitConfig } from "@/lib/layout.shared";
import { source } from "@/lib/source";
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

function stripBadgeName(name: ReactNode): ReactNode {
  if (typeof name !== "string") {
    return name;
  }

  return splitBadgeTitle(name).text;
}

function clonePageItem(
  item: PageTreeItem,
  name: ReactNode,
  idSuffix: string,
): PageTreeItem {
  return {
    ...item,
    $id: item.$id ? `${item.$id}-${idSuffix}` : undefined,
    name,
  };
}

function createFolder(
  name: string,
  children: PageTreeNode[],
  id: string,
  icon?: ReactNode,
): PageTreeFolder {
  return {
    $id: id,
    type: "folder",
    name,
    icon,
    defaultOpen: true,
    children,
  };
}

/**
 * Operational groups, in sidebar order. Pages and subfolders pick
 * their group in content (frontmatter `sidebar.group`, or `group` in a
 * subfolder's meta.json — see source.config.ts); within a group they keep
 * their meta.json order. A group name not listed here becomes a new folder
 * after these; anything without a group goes to "Otros".
 */
const OPERATION_GROUPS: {
  source: string;
  name: string;
  id: string;
  icon: ReactNode;
}[] = [
  {
    source: "KMS",
    name: "Claves y motores",
    id: "kms",
    icon: <KeyRound size={16} className="shrink-0" />,
  },
  {
    source: "CA",
    name: "Autoridades y certificados",
    id: "ca",
    icon: <ShieldCheck size={16} className="shrink-0" />,
  },
  {
    source: "RA",
    name: "Enrolamiento",
    id: "ra",
    icon: <ClipboardList size={16} className="shrink-0" />,
  },
  {
    source: "VA",
    name: "Validación",
    id: "va",
    icon: <BadgeCheck size={16} className="shrink-0" />,
  },
  {
    source: "Gestión de flotas",
    name: "Dispositivos",
    id: "flotas",
    icon: <Cpu size={16} className="shrink-0" />,
  },
];
const OTHER_GROUP = {
  source: "Otros",
  name: "Monitorización",
  id: "monitorizacion",
  icon: <Bell size={16} className="shrink-0" />,
};

/** Group names match ignoring case and accents, so 'gestion de flotas' still lands in the right folder. */
function groupKey(name: string): string {
  return name.normalize("NFD").replace(/\p{M}/gu, "").trim().toLowerCase();
}

function sidebarPlacement(node: PageTreeNode): {
  group?: string;
  label?: string;
} {
  if (node.type === "page") return source.getNodePage(node)?.data.sidebar ?? {};
  if (node.type === "folder")
    return { group: source.getNodeMeta(node)?.data.group };
  return {};
}

function groupOperationNodes(children: PageTreeNode[]): PageTreeNode[] {
  const separatorIndex = children.findIndex(
    (node) =>
      node.type === "separator" &&
      typeof node.name === "string" &&
      node.name.toLowerCase() === "operar lamassu",
  );

  if (separatorIndex === -1) {
    return children;
  }

  const nextSeparatorIndex = children.findIndex(
    (node, index) => index > separatorIndex && node.type === "separator",
  );
  const endIndex =
    nextSeparatorIndex === -1 ? children.length : nextSeparatorIndex;
  const segment = children.slice(separatorIndex + 1, endIndex);
  const placements = segment.map(sidebarPlacement);

  // Content that declares no groups at all is shown as meta.json lists it.
  if (!placements.some((placement) => placement.group)) {
    return children;
  }

  type OperationGroup = {
    source: string;
    name: string;
    id: string;
    icon?: ReactNode;
    items: PageTreeNode[];
  };
  const groups = new Map<string, OperationGroup>(
    OPERATION_GROUPS.map((group) => [
      groupKey(group.source),
      { ...group, items: [] },
    ]),
  );
  const others = { ...OTHER_GROUP, items: [] as PageTreeNode[] };
  segment.forEach((node, index) => {
    const { group: name, label } = placements[index];
    const key = name ? groupKey(name) : undefined;
    let group =
      key === undefined || key === groupKey(OTHER_GROUP.source)
        ? others
        : groups.get(key);
    if (!group && name && key) {
      group = {
        source: name,
        name,
        id: key.replace(/[^a-z0-9]+/g, "-"),
        items: [],
      };
      groups.set(key, group);
    }
    const target = group ?? others;
    target.items.push(
      node.type === "page"
        ? clonePageItem(
            node,
            label ?? stripBadgeName(node.name),
            node.url.split("/").pop() ?? "item",
          )
        : node,
    );
  });

  const groupedChildren = [...groups.values(), others]
    .filter((group) => group.items.length > 0)
    .map((group) =>
      createFolder(
        group.name,
        group.items,
        `operar-lamassu-${group.id}`,
        group.icon,
      ),
    );

  return [
    ...children.slice(0, separatorIndex + 1),
    ...groupedChildren,
    ...children.slice(endIndex),
  ];
}

function mapPageTreeNode(node: PageTreeNode): PageTreeNode {
  if (node.type === "folder") {
    const groupedChildren = groupOperationNodes(node.children);

    const folder: PageTreeFolder = {
      ...node,
      name: mapTreeNodeName(node.name, true),
      children: groupedChildren.map(mapPageTreeNode),
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
        source.getNodePage(node)?.data.sidebar?.label ??
        mapTreeNodeName(node.name, true),
    } satisfies PageTreeItem;
  }

  return {
    ...node,
    name: node.name ? mapTreeNodeName(node.name, true) : node.name,
  };
}

function mapPageTree(root: PageTreeRoot): PageTreeRoot {
  const groupedChildren = groupOperationNodes(root.children);

  return {
    ...root,
    name: mapTreeNodeName(root.name, true),
    children: groupedChildren.map(mapPageTreeNode),
    fallback: root.fallback ? mapPageTree(root.fallback) : root.fallback,
  };
}

const DOC_REDIRECTS: Record<string, string> = {
  "platform/pki": "platform/pki/overview",
  "platform/pki/quickstarts": "platform/pki/quickstarts/overview",
  "platform/pki/concepts": "platform/pki/concepts/overview",
  deployment: "deployment/overview",
  "deployment/self-hosted": "deployment/self-hosted/overview",
  manual: "platform/pki/overview",
  "manual/inicio": "platform/pki/quickstarts/overview",
  "manual/inicio/primera-ca":
    "platform/pki/quickstarts/create-certificate-authority",
  "manual/inicio/primer-certificado":
    "platform/pki/quickstarts/issue-certificate",
  "manual/inicio/primer-dispositivo":
    "platform/pki/quickstarts/register-device",
  "manual/conceptos": "platform/pki/concepts/overview",
  "manual/conceptos/arquitectura": "platform/pki/concepts/architecture",
  "manual/conceptos/ciclo-identidad":
    "platform/pki/concepts/certificate-lifecycle",
  "manual/servicios-core/kms": "platform/pki/key-management",
  "manual/servicios-core/cas": "platform/pki/certificate-authorities",
  "manual/servicios-core/certificates": "platform/pki/certificates",
  "manual/servicios-core/validation": "platform/pki/certificate-validation",
  "manual/servicios-core/validation-ocsp": "platform/pki/ocsp",
  "manual/servicios-core/validation-crl": "platform/pki/crl",
  "manual/servicios-core/ra": "platform/pki/device-enrollment",
  "manual/servicios-core/est": "platform/pki/est-enrollment",
  "manual/servicios-core/devices": "platform/pki/device-management",
  "manual/servicios-core/alerts": "platform/pki/alerts",
  "manual/integraciones/aws": "platform/pki/integrations/aws-iot-core",
  despliegue: "deployment/overview",
  "despliegue/onprem": "deployment/self-hosted/overview",
  "despliegue/onprem/fastlane": "deployment/self-hosted/fastlane",
  "despliegue/cloud": "deployment/aws-marketplace",
  "despliegue/saas": "deployment/saas",
};

export async function loader({ params, request }: Route.LoaderArgs) {
  const slugs = params["*"].split("/").filter((v) => v.length > 0);
  if (slugs.length === 0) throw new Response("Not found", { status: 404 });
  const legacyPath = slugs.join("/");
  const redirectPath = DOC_REDIRECTS[legacyPath];
  if (redirectPath) {
    const search = new URL(request.url).search;
    throw redirect(`${docsPath(redirectPath)}${search}`, 301);
  }
  const page = source.getPage(slugs);
  if (!page) throw new Response("Not found", { status: 404 });
  const pageTree = mapPageTree(source.getPageTree());

  return {
    slugs: page.slugs,
    path: page.path,
    url: page.url,
    affected: affectedPages(),
    pageTree: await source.serializePageTree(pageTree),
  };
}

/** PR previews only: every page the PR touches, for the diff panel. */
function affectedPages(): AffectedPages | undefined {
  if (!__DOCS_DIFF__) return undefined;
  const byPath = new Map(source.getPages().map((page) => [page.path, page]));
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
      affected,
    }: {
      slugs: string[];
      path: string;
      url: string;
      affected?: AffectedPages;
    },
  ) {
    const markdownUrl = `/llms.mdx/docs/${[...slugs, "index.mdx"].join("/")}`;
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
        <DiffToggle diff={diff} affected={affected} currentUrl={url} />
        <div className="flex flex-row gap-2 items-center border-b -mt-4 pb-6">
          <LLMCopyButton markdownUrl={markdownUrl} />
          <ViewOptions
            markdownUrl={markdownUrl}
            githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${path}`}
          />
        </div>
        <DocsBody className="[&>h1:first-child]:hidden">
          <Mdx
            components={{ ...defaultMdxComponents, a: MdxLink, Step, Steps }}
          />
        </DocsBody>
      </DocsPage>
    );
  },
});

export default function Page({ loaderData }: Route.ComponentProps) {
  const { pageTree, ...rest } = useFumadocsLoader(loaderData);

  return (
    <DocsLayout
      {...baseOptions()}
      tree={pageTree}
      sidebar={{ banner: <VersionSelector /> }}
    >
      {clientLoader.useContent(loaderData.path, {
        ...rest,
      })}
    </DocsLayout>
  );
}
