import { RootProvider } from "fumadocs-ui/provider/react-router";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";
import type { Route } from "./+types/root";
import "./app.css";
import { DIFF_ENABLED, diffInitScript } from "@/components/diff-toggle";
import SearchDialog from "@/components/search";
import { asset } from "@/lib/asset";
import { DOCS_BASE_PATH } from "@/lib/base-path";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_ITEMS,
  LOCALES,
  localeFromPath,
  mountFrom,
  uiTranslations,
} from "@/lib/locales";
import NotFound from "./routes/not-found";

/**
 * Runs before hydration: ?lang= overrides the cookie, the cookie overrides
 * the URL. Once applied, the URL is canonical — the query param is dropped,
 * which also keeps cache keys and prerendered pages consistent.
 */
const localeRedirectScript = `
try {
  var locales = ${JSON.stringify(LOCALES)};
  var params = new URLSearchParams(window.location.search);
  var param = params.get('lang');
  var cookie = (document.cookie.match(/(?:^|; )${LOCALE_COOKIE}=([^;]+)/) || [])[1];
  var target = locales.includes(param) ? param : (locales.includes(cookie) ? cookie : null);
  var path = window.location.pathname;
  var mount = ${JSON.stringify(DOCS_BASE_PATH)};
  var i = path.indexOf(mount + '/');
  var content = i !== -1 ? path.slice(i + mount.length + 1) : path.replace(/^\\/+/, '');
  var segments = content.split('/').filter(Boolean);
  var hasPrefix = segments.length > 0 && locales.includes(segments[0]);
  var current = hasPrefix ? segments[0] : ${JSON.stringify(DEFAULT_LOCALE)};
  // Prerendered HTML cannot know the URL, so correct lang before hydration.
  document.documentElement.lang = current;
  if (target) {
    var setCookie = function (value) {
      var entry = '${LOCALE_COOKIE}=' + value + '; path=/; max-age=31536000; samesite=lax';
      if (window.cookieStore && typeof window.cookieStore.set === 'function') {
        window.cookieStore.set({ name: '${LOCALE_COOKIE}', value: value, path: '/', expires: Date.now() + 31536000000 });
      } else {
        document.cookie = entry;
      }
    };
    if (current !== target) {
      var suffix = hasPrefix ? segments.slice(1) : segments;
      var next = (mount + '/' + (target === ${JSON.stringify(DEFAULT_LOCALE)} ? '' : target + '/') + suffix.join('/')).replace(/\\/+$/, '');
      var nextUrl = next + window.location.hash;
      params.delete('lang');
      var qs = params.toString();
      setCookie(target);
      window.location.replace(qs ? nextUrl + '?' + qs : nextUrl);
    } else {
      setCookie(target);
      if (param) {
        params.delete('lang');
        var qs2 = params.toString();
        var clean = window.location.pathname + window.location.hash;
        window.history.replaceState(window.history.state, '', qs2 ? clean + '?' + qs2 : clean);
      }
    }
  }
} catch (e) {}
`.trim();

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  // Prerendered HTML cannot know its URL, so this is only the default; the
  // pre-hydration script below corrects `lang` before content renders.
  return (
    <html lang={DEFAULT_LOCALE} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <link rel="icon" href={asset("favicon.svg")} type="image/svg+xml" />
        {DIFF_ENABLED && (
          // biome-ignore lint/security/noDangerouslySetInnerHtml: constant script, no user input
          <script dangerouslySetInnerHTML={{ __html: diffInitScript }} />
        )}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: constant script, no user input */}
        <script dangerouslySetInnerHTML={{ __html: localeRedirectScript }} />
      </head>
      <body className="flex flex-col min-h-screen">{children}</body>
    </html>
  );
}

function LocaleAwareApp() {
  const { pathname } = useLocation();
  const locale = localeFromPath(pathname);

  return (
    <RootProvider
      search={{ SearchDialog }}
      theme={{ defaultTheme: "dark", enableSystem: false }}
      i18n={{
        locale,
        locales: LOCALE_ITEMS,
        translations: uiTranslations(locale),
        // The default locale has no URL prefix, so switching to it removes
        // the locale segment; switching to a prefixed locale replaces or
        // unshifts it. The choice is stored in a cookie so the next visit
        // redirects before content renders.
        onLocaleChange: (next) => {
          const entry = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
          if ("cookieStore" in window) {
            window.cookieStore.set({
              name: LOCALE_COOKIE,
              value: next,
              path: "/",
              expires: Date.now() + 365 * 24 * 3600 * 1000,
            });
          } else {
            // biome-ignore lint/suspicious/noDocumentCookie: cookieStore is unavailable in older browsers
            document.cookie = entry;
          }
          const segments = mountFrom(pathname);
          const first = segments[0];
          if ((LOCALES as string[]).includes(first)) {
            if (next === DEFAULT_LOCALE) segments.splice(0, 1);
            else segments[0] = next;
          } else if (next !== DEFAULT_LOCALE) {
            segments.unshift(next);
          }
          const nextUrl = `/${[...segments].join("/")}`;
          window.location.assign(nextUrl === "/" ? DOCS_BASE_PATH : nextUrl);
        },
      }}
    >
      <Outlet />
    </RootProvider>
  );
}

export default function App() {
  return (
    <>
      <LocaleAwareApp />
      <ScrollRestoration />
      <Scripts />
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) return <NotFound />;
    message = "Error";
    details = error.statusText;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 w-full max-w-[1400px] mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
