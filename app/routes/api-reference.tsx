import { getSidebarTabs } from "fumadocs-ui/utils/get-sidebar-tabs";
import { useTheme } from "next-themes";
import { type CSSProperties, lazy, Suspense, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router";
import { AppBar } from "@/components/app-bar";
import { API_SERVICES as SERVICES } from "@/lib/api-services";
import { docsPath } from "@/lib/base-path";
import { cn } from "@/lib/cn";
import { DEFAULT_LOCALE } from "@/lib/locales";
import { source } from "@/lib/source";
import type { Route } from "./+types/api-reference";

const ApiReferenceReact = lazy(() =>
  import("@scalar/api-reference-react").then((mod) => {
    void import("@scalar/api-reference-react/style.css");
    return { default: mod.ApiReferenceReact };
  }),
);

/**
 * The docs' section tabs, so the top bar matches the rest of the site. The API
 * reference is not translated, so it uses the default language's tree.
 */
export async function loader() {
  const tabs = getSidebarTabs(source.getPageTree(DEFAULT_LOCALE)).map(
    (tab) => ({
      title:
        typeof tab.title === "string" ? tab.title : String(tab.title ?? ""),
      url: tab.url,
    }),
  );
  return { tabs };
}

export function HydrateFallback() {
  return (
    <div className="flex h-screen items-center justify-center text-sm text-fd-muted-foreground">
      Loading API reference…
    </div>
  );
}

export default function ApiReference({ loaderData }: Route.ComponentProps) {
  const { service } = useParams<{ service: string }>();
  // Shares the site-wide theme (next-themes via fumadocs' RootProvider), so the
  // top bar, Scalar and the rest of the docs all switch together.
  const { resolvedTheme } = useTheme();
  // resolvedTheme is unknown until hydration; the site defaults to dark.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = !mounted || resolvedTheme !== "light";

  if (!service) return <Navigate to={docsPath("api-reference/ca")} replace />;
  const current = SERVICES.find((s) => s.id === service);
  if (!current) return <Navigate to={docsPath("api-reference/ca")} replace />;

  const tabs = [
    ...loaderData.tabs,
    { title: "API Reference", url: docsPath("api-reference/ca"), active: true },
  ];

  return (
    // The window scrolls, not an inner container: Scalar sizes its sticky
    // sidebar against the viewport minus --scalar-custom-header-height, which
    // is the docs top bar (3.5rem) plus its tab row (2.5rem).
    <div
      className="lm-api-reference"
      style={{ "--scalar-custom-header-height": "6rem" } as CSSProperties}
    >
      <AppBar tabs={tabs}>
        {/* One OpenAPI document per service — scroll sideways on narrow screens */}
        <nav aria-label="API services" className="lm-api-services">
          {SERVICES.map((s) => (
            <Link
              key={s.id}
              to={docsPath(`api-reference/${s.id}`)}
              title={s.description}
              aria-current={s.id === service ? "page" : undefined}
              className={cn(s.id === service && "is-active")}
            >
              {s.label}
            </Link>
          ))}
        </nav>
      </AppBar>

      {/* Scalar viewer */}
      <Suspense
        fallback={
          <div className="flex h-[calc(100dvh-6rem)] items-center justify-center text-sm text-fd-muted-foreground">
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
            forceDarkModeState: dark ? "dark" : "light",
            hideDarkModeToggle: true,
            hideModels: false,
          }}
        />
      </Suspense>
    </div>
  );
}
