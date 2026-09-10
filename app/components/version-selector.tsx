import { ChevronDown, Tag } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  DOCS_BASE_PATH,
  pathWithinVersion,
  VERSIONS_MANIFEST_URL,
} from '@/lib/base-path';
import { cn } from '@/lib/cn';

type Version = { label: string; path: string; unstable?: boolean };

export function VersionSelector() {
  const [versions, setVersions] = useState<Version[] | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(VERSIONS_MANIFEST_URL)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && Array.isArray(data?.versions)) setVersions(data.versions);
      })
      .catch(() => {
        // Manifest missing (local dev, or a version deployed before it existed):
        // fall back to hiding the selector rather than showing a broken control.
      });
    return () => {
      active = false;
    };
  }, []);

  if (!versions || versions.length < 2) return null;

  const current = versions.find((v) => v.path === DOCS_BASE_PATH);
  // Switching versions crosses deployments, so these are real navigations, not
  // client-side routes. Keep the reader on the same page where it exists.
  // Guarded because this file is also evaluated during prerendering.
  const suffix =
    typeof window === 'undefined'
      ? ''
      : pathWithinVersion(window.location.pathname);

  return (
    <div className='relative'>
      <button
        type='button'
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className='flex w-full items-center gap-2 rounded-lg border border-fd-border bg-fd-card px-3 py-2 text-sm text-fd-foreground transition-colors hover:bg-fd-accent'
      >
        <Tag className='size-3.5 shrink-0 text-fd-muted-foreground' />
        <span className='truncate'>{current?.label ?? 'Versión'}</span>
        <ChevronDown
          className={cn(
            'ml-auto size-3.5 shrink-0 transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <ul className='absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-fd-border bg-fd-popover shadow-lg'>
          {versions.map((version) => (
            <li key={version.path}>
              <a
                href={suffix ? `${version.path}/${suffix}` : version.path}
                className={cn(
                  'block px-3 py-2 text-sm transition-colors hover:bg-fd-accent',
                  version.path === DOCS_BASE_PATH
                    ? 'font-medium text-fd-primary'
                    : 'text-fd-muted-foreground hover:text-fd-accent-foreground',
                )}
              >
                {version.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
