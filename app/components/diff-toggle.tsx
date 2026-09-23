import { GitCompareArrows } from 'lucide-react';
import { useEffect, useState } from 'react';
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

/**
 * Runs before hydration so a reader who left the diff on doesn't see the page
 * flash without it on every navigation.
 */
export const diffInitScript = `try{if(localStorage.getItem(${JSON.stringify(STORAGE_KEY)})==='1')document.documentElement.setAttribute(${JSON.stringify(ATTRIBUTE)},'')}catch(e){}`;

/** Floating global switch; the choice applies to every page and persists. */
export function DiffToggle({ diff }: { diff?: PageDiff }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(document.documentElement.hasAttribute(ATTRIBUTE));
  }, []);

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

  return (
    <div className='fixed right-4 bottom-4 z-50 flex items-center gap-3 rounded-full border border-fd-border bg-fd-popover/95 py-1.5 pr-1.5 pl-4 text-sm shadow-lg backdrop-blur'>
      <GitCompareArrows className='size-4 shrink-0 text-fd-muted-foreground' />
      <span className='text-fd-muted-foreground'>{summary}</span>
      <button
        type='button'
        role='switch'
        aria-checked={on}
        onClick={toggle}
        className={cn(
          'flex items-center gap-2 rounded-full px-3 py-1 font-medium transition-colors',
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
