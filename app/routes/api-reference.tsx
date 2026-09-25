import { useTheme } from 'next-themes';
import { type CSSProperties, lazy, Suspense, useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router';
import { asset } from '@/lib/asset';
import { API_SERVICES as SERVICES } from '@/lib/api-services';
import { docsPath } from '@/lib/base-path';

const ApiReferenceReact = lazy(() =>
  import('@scalar/api-reference-react').then((mod) => {
    void import('@scalar/api-reference-react/style.css');
    return { default: mod.ApiReferenceReact };
  }),
);


export function HydrateFallback() {
  return (
    <div className="flex h-screen items-center justify-center text-sm text-fd-muted-foreground">
      Loading API reference…
    </div>
  );
}

export default function ApiReference() {
  const { service } = useParams<{ service: string }>();
  // Shares the site-wide theme (next-themes via fumadocs' RootProvider), so the
  // top bar, Scalar and the rest of the docs all switch together.
  const { resolvedTheme, setTheme } = useTheme();
  // resolvedTheme is unknown until hydration; the site defaults to dark.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = !mounted || resolvedTheme !== 'light';

  if (!service) return <Navigate to={docsPath('api-reference/ca')} replace />;
  const current = SERVICES.find((s) => s.id === service);
  if (!current) return <Navigate to={docsPath('api-reference/ca')} replace />;

  return (
    // The window scrolls, not an inner container: Scalar sizes its sticky
    // sidebar against the viewport minus --scalar-custom-header-height.
    <div style={{ '--scalar-custom-header-height': '3rem' } as CSSProperties}>
      {/* Top bar */}
      <header className="sticky top-0 z-50 flex h-12 items-center gap-3 border-b border-fd-border bg-fd-background px-4">
        <Link
          to={docsPath()}
          className="flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-semibold text-fd-foreground hover:text-fd-foreground/80"
        >
          <img src={asset('images/lamassu.svg')} alt="Lamassu" width={20} height={20} />
          Lamassu IoT
        </Link>

        <span className="hidden text-fd-muted-foreground md:inline">/</span>
        <span className="hidden whitespace-nowrap text-sm text-fd-muted-foreground md:inline">OpenAPI 3.0.3</span>

        <div className="ml-auto flex min-w-0 items-center gap-2">
          {/* Service tabs — scroll sideways on narrow screens */}
          <div className="flex min-w-0 items-center gap-1 overflow-x-auto [scrollbar-width:none]">
            {SERVICES.map((s) => (
              <Link
                key={s.id}
                to={docsPath(`api-reference/${s.id}`)}
                className={[
                  'shrink-0 whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium transition-colors',
                  s.id === service
                    ? 'bg-fd-accent text-fd-accent-foreground'
                    : 'text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground',
                ].join(' ')}
                title={s.description}
              >
                {s.label}
              </Link>
            ))}
          </div>

          {/* Divider */}
          <span className="h-4 w-px shrink-0 bg-fd-border" />

          {/* Dark / light toggle */}
          <button
            type="button"
            onClick={() => setTheme(dark ? 'light' : 'dark')}
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="shrink-0 rounded-md p-1.5 text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
          >
            {dark ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Scalar viewer */}
      <Suspense
        fallback={
          <div className="flex h-[calc(100dvh-3rem)] items-center justify-center text-sm text-fd-muted-foreground">
            Loading…
          </div>
        }
      >
        <ApiReferenceReact
          key={`${current.id}-${dark}`}
          configuration={{
            url: current.url,
            // The top bar owns the theme toggle; forcing the state keeps Scalar
            // from falling back to its own stored preference.
            forceDarkModeState: dark ? 'dark' : 'light',
            hideDarkModeToggle: true,
            hideModels: false,
          }}
        />
      </Suspense>
    </div>
  );
}
