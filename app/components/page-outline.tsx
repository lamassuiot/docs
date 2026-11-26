import { TOCItem, type TOCItemType, useActiveAnchor } from "fumadocs-core/toc";
import { TOCScrollArea } from "fumadocs-ui/components/toc/index";
import { ChevronRight, ListTree } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";

type OutlineNode = { item: TOCItemType; children: OutlineNode[] };

function makeOutline(items: TOCItemType[]): OutlineNode[] {
  const roots: OutlineNode[] = [];
  const stack: OutlineNode[] = [];
  for (const item of items) {
    const node: OutlineNode = { item, children: [] };
    while (stack.length && stack[stack.length - 1].item.depth >= item.depth)
      stack.pop();
    const parent = stack[stack.length - 1];
    (parent ? parent.children : roots).push(node);
    stack.push(node);
  }
  return roots;
}

function ancestors(nodes: OutlineNode[], active: string): string[] | null {
  for (const node of nodes) {
    if (node.item.url.slice(1) === active) return [];
    const path = ancestors(node.children, active);
    if (path) return [node.item.url, ...path];
  }
  return null;
}

function Outline({ items, locale }: { items: TOCItemType[]; locale: string }) {
  const tree = useMemo(() => makeOutline(items), [items]);
  const active = useActiveAnchor();
  const outlineId = useId();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (!active) return;
    const path = ancestors(tree, active);
    if (path?.length)
      setExpanded((previous) => {
        const next = { ...previous };
        for (const url of path) next[url] = true;
        return next;
      });
  }, [active, tree]);

  const renderNodes = (nodes: OutlineNode[], level: number) => (
    <ul className={level ? "lm-outline-children" : "lm-outline-list"}>
      {nodes.map(({ item, children }) => {
        const open = expanded[item.url] ?? level === 0;
        const itemId = `${outlineId}-${encodeURIComponent(item.url)}`;
        const action =
          locale === "es"
            ? open
              ? "Colapsar"
              : "Expandir"
            : open
              ? "Collapse"
              : "Expand";
        return (
          <li key={item.url}>
            <div className="lm-outline-row">
              {children.length > 0 ? (
                <button
                  type="button"
                  aria-labelledby={`${itemId}-action ${itemId}-link`}
                  aria-expanded={open}
                  onClick={() =>
                    setExpanded((previous) => ({
                      ...previous,
                      [item.url]: !open,
                    }))
                  }
                >
                  <span id={`${itemId}-action`} className="sr-only">
                    {action}
                  </span>
                  <ChevronRight
                    aria-hidden="true"
                    className={open ? "lm-outline-chevron-open" : undefined}
                  />
                </button>
              ) : (
                <span className="lm-outline-spacer" aria-hidden="true" />
              )}
              <TOCItem id={`${itemId}-link`} href={item.url}>
                {item.title}
              </TOCItem>
            </div>
            {open && children.length > 0 && renderNodes(children, level + 1)}
          </li>
        );
      })}
    </ul>
  );
  return (
    <nav aria-label={locale === "es" ? "En esta página" : "On this page"}>
      {renderNodes(tree, 0)}
    </nav>
  );
}

export function PageOutline({
  items,
  locale,
  mobile = false,
}: {
  items: TOCItemType[];
  locale: string;
  mobile?: boolean;
}) {
  const label = locale === "es" ? "En esta página" : "On this page";
  if (mobile)
    return (
      <details className="lm-outline-mobile max-xl:layout:[--fd-toc-popover-height:--spacing(10)]">
        <summary>
          <ListTree aria-hidden="true" />
          {label}
        </summary>
        <TOCScrollArea>
          <Outline items={items} locale={locale} />
        </TOCScrollArea>
      </details>
    );
  return (
    <aside
      id="nd-toc"
      className="lm-outline-desktop xl:layout:[--fd-toc-width:268px]"
    >
      <div className="lm-outline-title">
        <ListTree aria-hidden="true" />
        {label}
      </div>
      <TOCScrollArea>
        <Outline items={items} locale={locale} />
      </TOCScrollArea>
    </aside>
  );
}
