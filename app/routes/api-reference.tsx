import { lazy, Suspense, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router';

const ApiReferenceReact = lazy(() =>
  import('@scalar/api-reference-react').then((mod) => {
    void import('@scalar/api-reference-react/style.css');
    return { default: mod.ApiReferenceReact };
  }),
);

const SERVICES = [
  {
    id: 'ca',
    label: 'CA',
    description: 'Certificate Authority',
    url: 'https://www.lamassu.io/lamassuiot/ca-openapi.yaml',
  },
  {
    id: 'va',
    label: 'VA',
    description: 'Validation Authority',
    url: 'https://www.lamassu.io/lamassuiot/va-openapi.yaml',
  },
  {
    id: 'device-manager',
    label: 'Device Manager',
    description: 'Device lifecycle management',
    url: 'https://www.lamassu.io/lamassuiot/device-manager-openapi.yaml',
  },
  {
    id: 'dms-manager',
    label: 'DMS Manager',
    description: 'Device Manufacturing Service',
    url: 'https://www.lamassu.io/lamassuiot/dms-manager-openapi.yaml',
  },
  {
    id: 'alerts',
    label: 'Alerts',
    description: 'Alerting & notifications',
    url: 'https://www.lamassu.io/lamassuiot/alerts-openapi.yaml',
  },
] as const;

function readStoredDark(): boolean {
  try { return localStorage.getItem('scalar-dark') !== 'false'; } catch {}
  return true;
}

export function HydrateFallback() {
  return (
    <div className="flex h-screen items-center justify-center text-sm text-fd-muted-foreground">
      Loading API reference…
    </div>
  );
}

export default function ApiReference() {
  const { service } = useParams<{ service: string }>();
  const [dark, setDark] = useState(readStoredDark);

  if (!service) return <Navigate to="/api-reference/ca" replace />;
  const current = SERVICES.find((s) => s.id === service);
  if (!current) return <Navigate to="/api-reference/ca" replace />;

  function toggleDark() {
    setDark((d) => {
      const next = !d;
      try { localStorage.setItem('scalar-dark', String(next)); } catch {}
      return next;
    });
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Top bar */}
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-fd-border bg-fd-background px-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-semibold text-fd-foreground hover:text-fd-foreground/80"
        >
          <img src="/images/lamassu.svg" alt="Lamassu" width={20} height={20} />
          Lamassu IoT
        </Link>

        <span className="text-fd-muted-foreground">/</span>
        <span className="text-sm text-fd-muted-foreground">OpenAPI 3.0.3</span>

        <div className="ml-auto flex items-center gap-2">
          {/* Service tabs */}
          <div className="flex items-center gap-1">
            {SERVICES.map((s) => (
              <Link
                key={s.id}
                to={`/api-reference/${s.id}`}
                className={[
                  'rounded-md px-3 py-1 text-xs font-medium transition-colors',
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
          <span className="h-4 w-px bg-fd-border" />

          {/* Dark / light toggle */}
          <button
            type="button"
            onClick={toggleDark}
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="rounded-md p-1.5 text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
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
      <div className="min-h-0 flex-1 overflow-auto">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center text-sm text-fd-muted-foreground">
              Loading…
            </div>
          }
        >
          <ApiReferenceReact
            key={`${current.id}-${dark}`}
            configuration={{
              url: current.url,
              darkMode: dark,
              hideModels: false,
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}
