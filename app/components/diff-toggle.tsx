import {
  ChevronUp,
  FileMinus,
  FilePen,
  FilePlus,
  GitCompareArrows,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { cn } from '@/lib/cn';

/**
 * PR previews are built with VITE_DOCS_DIFF_BASE, which makes lib/docs-diff
 * mark every change the PR makes. These components let the reader toggle
 * that markup; they render nothing in other builds.
 */
export const DIFF_ENABLED = Boolean(import.meta.env.VITE_DOCS_DIFF_BASE);

const STORAGE_KEY = 'lamassu-docs:show-diff';
const ATTRIBUTE = 'data-show-diff';

/** What lib/docs-diff/remark.ts exports from each page the PR changed. */
export type PageDiff = {
  isNew: boolean;
  changes: number;
  title?: TextDiff;
  description?: TextDiff;
};

export type TextDiff = { op: 'eq' | 'del' | 'ins'; text: string }[];

/** Every page the PR touches, resolved by the docs route loader. */
export type AffectedPages = {
  pages: { url: string; title: string; isNew: boolean }[];
  /** Site paths of pages the PR deleted, e.g. '/manual/old'. */
  removed: string[];
};

/**
 * Runs before hydration so a reader who left the diff on doesn't see the page
 * flash without it on every navigation.
 */
export const diffInitScript = `try{if(localStorage.getItem(${JSON.stringify(STORAGE_KEY)})==='1')document.documentElement.setAttribute(${JSON.stringify(ATTRIBUTE)},'')}catch(e){}`;

/** Floating global switch; the choice applies to every page and persists. */
export function DiffToggle({
  diff,
  affected,
  currentUrl,
}: {
  diff?: PageDiff;
  affected?: AffectedPages;
  currentUrl: string;
}) {
  const [on, setOn] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOn(document.documentElement.hasAttribute(ATTRIBUTE));
  }, []);

  useEffect(() => {
    if (!listOpen) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (
        event instanceof KeyboardEvent
          ? event.key === 'Escape'
          : !panelRef.current?.contains(event.target as Node)
      ) {
        setListOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [listOpen]);

  if (!DIFF_ENABLED) return null;

  const toggle = () => {
    const next = !on;
    setOn(next);
    document.documentElement.toggleAttribute(ATTRIBUTE, next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
    } catch {
      // Storage blocked: the switch still works for this page view.
    }
  };

  const summary = !diff
    ? 'Sin cambios en esta página'
    : diff.isNew
      ? 'Página nueva'
      : `${diff.changes} ${diff.changes === 1 ? 'cambio' : 'cambios'} en esta página`;

  const total = (affected?.pages.length ?? 0) + (affected?.removed.length ?? 0);

  return (
    <div
      ref={panelRef}
      className='fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2 text-sm'
    >
      {listOpen && affected && (
        <AffectedList affected={affected} currentUrl={currentUrl} />
      )}
      <div className='flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-full border border-fd-border bg-fd-popover/95 py-1.5 pr-1.5 pl-4 shadow-lg backdrop-blur'>
        <GitCompareArrows className='size-4 shrink-0 text-fd-muted-foreground' />
        <span className='hidden text-fd-muted-foreground sm:inline'>
          {summary}
        </span>
        {total > 0 && (
          <button
            type='button'
            aria-expanded={listOpen}
            aria-haspopup='dialog'
            onClick={() => setListOpen((v) => !v)}
            className='flex items-center gap-1 whitespace-nowrap rounded-full border border-fd-border px-2.5 py-1 text-fd-foreground transition-colors hover:bg-fd-accent'
          >
            {total} {total === 1 ? 'página afectada' : 'páginas afectadas'}
            <ChevronUp
              className={cn(
                'size-3.5 transition-transform',
                !listOpen && 'rotate-180',
              )}
            />
          </button>
        )}
        <button
          type='button'
          role='switch'
          aria-checked={on}
          onClick={toggle}
          className={cn(
            'flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1 font-medium transition-colors',
            on
              ? 'bg-fd-primary text-fd-primary-foreground'
              : 'bg-fd-secondary text-fd-secondary-foreground hover:bg-fd-accent',
          )}
        >
          <span
            aria-hidden
            className={cn(
              'relative inline-block h-4 w-7 rounded-full transition-colors',
              on ? 'bg-fd-primary-foreground/30' : 'bg-fd-muted-foreground/30',
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 size-3 rounded-full bg-current transition-all',
                on ? 'left-3.5' : 'left-0.5',
              )}
            />
          </span>
          Mostrar cambios
        </button>
      </div>
    </div>
  );
}

function AffectedList({
  affected,
  currentUrl,
}: {
  affected: AffectedPages;
  currentUrl: string;
}) {
  const normalize = (url: string) => url.replace(/\/+$/, '');
  return (
    <div
      role='dialog'
      aria-label='Páginas afectadas por este PR'
      className='max-h-[60vh] w-80 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-fd-border bg-fd-popover p-2 shadow-lg'
    >
      <p className='px-2 pt-1 pb-2 font-medium text-fd-foreground text-xs uppercase tracking-wide'>
        Páginas afectadas
      </p>
      <ul className='flex flex-col gap-0.5'>
        {affected.pages.map((page) => {
          const current = normalize(page.url) === normalize(currentUrl);
          const Icon = page.isNew ? FilePlus : FilePen;
          return (
            <li key={page.url}>
              <Link
                to={page.url}
                aria-current={current ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-fd-accent',
                  current
                    ? 'bg-fd-accent/60 font-medium text-fd-primary'
                    : 'text-fd-foreground',
                )}
              >
                <Icon
                  className={cn(
                    'size-4 shrink-0',
                    page.isNew
                      ? 'text-[var(--lm-diff-ins-edge)]'
                      : 'text-fd-muted-foreground',
                  )}
                />
                <span className='min-w-0 flex-1 truncate'>{page.title}</span>
                {page.isNew && (
                  <span className='shrink-0 text-[var(--lm-diff-ins-edge)] text-xs'>
                    nueva
                  </span>
                )}
              </Link>
            </li>
          );
        })}
        {affected.removed.map((path) => (
          <li
            key={path}
            className='flex items-center gap-2 px-2 py-1.5 text-fd-muted-foreground'
          >
            <FileMinus className='size-4 shrink-0 text-[var(--lm-diff-del-edge)]' />
            <span className='min-w-0 flex-1 truncate line-through'>{path}</span>
            <span className='shrink-0 text-[var(--lm-diff-del-edge)] text-xs'>
              eliminada
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A frontmatter field diff, e.g. the page title. */
export function DiffText({ diff }: { diff: TextDiff }) {
  return (
    <>
      {diff.map((seg, index) =>
        seg.op === 'eq' ? (
          seg.text
        ) : seg.op === 'ins' ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: static segments
          <ins key={index} className='lm-diff-ins'>
            {seg.text}
          </ins>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: static segments
          <del key={index} className='lm-diff-del'>
            {seg.text}
          </del>
        ),
      )}
    </>
  );
}
