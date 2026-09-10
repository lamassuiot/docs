import type { Route } from './+types/docs';
import type { ReactNode } from 'react';
import { KeyRound, ShieldCheck, ClipboardList, BadgeCheck, Cpu, Bell } from 'lucide-react';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { source } from '@/lib/source';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import browserCollections from 'fumadocs-mdx:collections/browser';
import type { i as PageTreeRoot, n as PageTreeItem, r as PageTreeNode, t as PageTreeFolder } from 'fumadocs-core/dist/definitions-Cw2aM1Af';
import { baseOptions, gitConfig } from '@/lib/layout.shared';
import { useFumadocsLoader } from 'fumadocs-core/source/client';
import { LLMCopyButton, ViewOptions } from '@/components/ai/page-actions';
import { MdxLink } from '@/components/mdx-link';
import { VersionSelector } from '@/components/version-selector';

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
    ? 'inline-flex items-center rounded-full border border-fd-primary/20 bg-fd-primary/10 px-1.5 py-px text-[0.58rem] font-semibold uppercase tracking-[0.08em] text-fd-primary'
    : 'inline-flex items-center rounded-full border border-fd-primary/20 bg-fd-primary/10 px-3 py-1 text-sm font-semibold uppercase tracking-[0.12em] text-fd-primary';

  return (
    <span>
      <span className={`${badgeClassName} mr-2 align-middle`}>{badge}</span>
      <span>{text}</span>
    </span>
  );
}

function mapTreeNodeName(name: ReactNode, compact = false): ReactNode {
  if (typeof name !== 'string') {
    return name;
  }

  return renderBadgeTitle(name, compact);
}

function stripBadgeName(name: ReactNode): ReactNode {
  if (typeof name !== 'string') {
    return name;
  }

  return splitBadgeTitle(name).text;
}

function clonePageItem(item: PageTreeItem, name: ReactNode, idSuffix: string): PageTreeItem {
  return {
    ...item,
    $id: item.$id ? `${item.$id}-${idSuffix}` : undefined,
    name,
  };
}

function createFolder(name: string, children: PageTreeItem[], id: string, icon?: ReactNode): PageTreeFolder {
  return {
    $id: id,
    type: 'folder',
    name,
    icon,
    defaultOpen: true,
    children,
  };
}

function groupServiciosCoreNodes(children: PageTreeNode[]): PageTreeNode[] {
  const separatorIndex = children.findIndex(
    (node) => node.type === 'separator' && typeof node.name === 'string' && node.name.toLowerCase() === 'servicios core',
  );

  if (separatorIndex === -1) {
    return children;
  }

  const nextSeparatorIndex = children.findIndex((node, index) => index > separatorIndex && node.type === 'separator');
  const endIndex = nextSeparatorIndex === -1 ? children.length : nextSeparatorIndex;
  const segment = children.slice(separatorIndex + 1, endIndex);
  const pageItems = segment.filter((node): node is PageTreeItem => node.type === 'page');
  const pageBySlug = new Map(pageItems.map((item) => [item.url.split('/').pop() ?? '', item]));

  const kms = pageBySlug.get('kms');
  const cas = pageBySlug.get('cas');
  const ra = pageBySlug.get('ra');
  const est = pageBySlug.get('est');
  const validation = pageBySlug.get('validation');
  const validationOcsp = pageBySlug.get('validation-ocsp');
  const validationCrl = pageBySlug.get('validation-crl');
  const certificates = pageBySlug.get('certificates');
  const devices = pageBySlug.get('devices');
  const alerts = pageBySlug.get('alerts');

  if (!kms || !cas || !ra || !est || !validation) {
    return children;
  }

  const groupedChildren: PageTreeNode[] = [
    createFolder('KMS', [clonePageItem(kms, 'Visión general', 'general')], 'servicios-core-kms', <KeyRound size={16} className="shrink-0" />),
    createFolder(
      'CA',
      [
        clonePageItem(cas, 'Visión general', 'general'),
        ...(certificates ? [clonePageItem(certificates, stripBadgeName(certificates.name), 'certificates')] : []),
      ],
      'servicios-core-ca',
      <ShieldCheck size={16} className="shrink-0" />,
    ),
    createFolder(
      'RA',
      [
        clonePageItem(ra, 'Visión general', 'general'),
        clonePageItem(est, 'EST', 'est'),
      ],
      'servicios-core-ra',
      <ClipboardList size={16} className="shrink-0" />,
    ),
    createFolder(
      'VA',
      [
        clonePageItem(validation, 'Visión general', 'general'),
        ...(validationOcsp ? [clonePageItem(validationOcsp, 'OCSP', 'ocsp')] : []),
        ...(validationCrl ? [clonePageItem(validationCrl, 'CRL', 'crl')] : []),
      ],
      'servicios-core-va',
      <BadgeCheck size={16} className="shrink-0" />,
    ),
  ];

  if (devices) {
    groupedChildren.push(
      createFolder(
        'Gestion de flotas',
        [clonePageItem(devices, stripBadgeName(devices.name), 'devices')],
        'servicios-core-flotas',
        <Cpu size={16} className="shrink-0" />,
      ),
    );
  }

  const otherItems = [alerts].filter((item): item is PageTreeItem => Boolean(item));
  if (otherItems.length > 0) {
    groupedChildren.push(
      createFolder(
        'Otros',
        otherItems.map((item) => clonePageItem(item, stripBadgeName(item.name), item.url.split('/').pop() ?? 'item')),
        'servicios-core-otros',
        <Bell size={16} className="shrink-0" />,
      ),
    );
  }

  return [...children.slice(0, separatorIndex + 1), ...groupedChildren, ...children.slice(endIndex)];
}

function mapPageTreeNode(node: PageTreeNode): PageTreeNode {
  if (node.type === 'folder') {
    const groupedChildren = groupServiciosCoreNodes(node.children);

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

  if (node.type === 'page') {
    return {
      ...node,
      name: mapTreeNodeName(node.name, true),
    } satisfies PageTreeItem;
  }

  return {
    ...node,
    name: node.name ? mapTreeNodeName(node.name, true) : node.name,
  };
}

function mapPageTree(root: PageTreeRoot): PageTreeRoot {
  const groupedChildren = groupServiciosCoreNodes(root.children);

  return {
    ...root,
    name: mapTreeNodeName(root.name, true),
    children: groupedChildren.map(mapPageTreeNode),
    fallback: root.fallback ? mapPageTree(root.fallback) : root.fallback,
  };
}

export async function loader({ params }: Route.LoaderArgs) {
  const slugs = params['*'].split('/').filter((v) => v.length > 0);
  if (slugs.length === 0) throw new Response('Not found', { status: 404 });
  const page = source.getPage(slugs);
  if (!page) throw new Response('Not found', { status: 404 });
  const pageTree = mapPageTree(source.getPageTree());

  return {
    slugs: page.slugs,
    path: page.path,
    pageTree: await source.serializePageTree(pageTree),
  };
}

const clientLoader = browserCollections.docs.createClientLoader({
  component(
    { toc, frontmatter, default: Mdx },
    // you can define props for the component
    {
      slugs,
      path,
    }: {
      slugs: string[];
      path: string;
    },
  ) {
    const markdownUrl = `/llms.mdx/docs/${[...slugs, 'index.mdx'].join('/')}`;
    const titleParts = splitBadgeTitle(frontmatter.title);
    const filteredToc = toc.filter((item) => item.depth !== 1);

    return (
      <DocsPage
        breadcrumb={{
          enabled: false,
        }}
        toc={filteredToc}
        tableOfContent={{
          style: 'clerk',
        }}
        tableOfContentPopover={{
          style: 'clerk',
        }}
      >
        <title>{titleParts.badge ? `${titleParts.badge} ${titleParts.text}` : frontmatter.title}</title>
        <DocsTitle className="text-[2.25rem] font-bold tracking-tight">{renderBadgeTitle(frontmatter.title)}</DocsTitle>
        <DocsDescription>{frontmatter.description}</DocsDescription>
        <div className="flex flex-row gap-2 items-center border-b -mt-4 pb-6">
          <LLMCopyButton markdownUrl={markdownUrl} />
          <ViewOptions
            markdownUrl={markdownUrl}
            githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${path}`}
          />
        </div>
        <DocsBody className="[&>h1:first-child]:hidden">
          <Mdx components={{ ...defaultMdxComponents, a: MdxLink }} />
        </DocsBody>
      </DocsPage>
    );
  },
});

export default function Page({ loaderData }: Route.ComponentProps) {
  const { pageTree, ...rest } = useFumadocsLoader(loaderData);

  return (
    <DocsLayout {...baseOptions()} tree={pageTree} sidebar={{ banner: <VersionSelector /> }}>
      {clientLoader.useContent(loaderData.path, {
        ...rest,
      })}
    </DocsLayout>
  );
}
