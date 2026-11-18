import { useI18n } from "fumadocs-ui/contexts/i18n";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import { DOCS_BASE_PATH } from "@/lib/base-path";
import { DEFAULT_LOCALE } from "@/lib/locales";

/** Fallback height until the page reports its own, so the layout does not jump from zero. */
const INITIAL_HEIGHT = 2400;
/** Gap left under the sticky top bar when the page asks the parent to scroll to a section. */
const SCROLL_GAP = 16;

type WelcomeMessage =
  | { type: "pqc-welcome:height"; height: number }
  | { type: "pqc-welcome:scroll"; top: number };

/**
 * Embeds the interactive PQC welcome page (public/pqc-welcome.html, and
 * pqc-welcome.es.html in Spanish) at its full height, so it reads as part of
 * the docs page instead of a scrolling box:
 *
 * - the page reports its height and the iframe grows to fit it;
 * - in-page jumps (section links, "see the component" buttons) are sent here
 *   and scroll the docs page, since the iframe itself never scrolls;
 * - the site's theme is passed on load and on every switch, without
 *   reloading the iframe (which would lose the reader's selections);
 * - links into the docs use this build's base path and the reader's locale.
 */
export function PqcWelcome({ title }: { title?: string }) {
  const { locale = DEFAULT_LOCALE } = useI18n();
  const { resolvedTheme } = useTheme();
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(INITIAL_HEIGHT);
  // The theme is only known on the client. Build the URL once, after mount, so
  // a later theme switch is sent as a message rather than reloading the page.
  const [src, setSrc] = useState<string | null>(null);
  const theme = resolvedTheme === "dark" ? "dark" : "light";
  const es = locale === "es";

  useEffect(() => {
    if (src || !resolvedTheme) return;
    const docs = `${DOCS_BASE_PATH}${locale === DEFAULT_LOCALE ? "" : `/${locale}`}`;
    const file = es ? "pqc-welcome.es.html" : "pqc-welcome.html";
    setSrc(
      `${asset(file)}#embed&theme=${theme}&docs=${encodeURIComponent(docs)}`,
    );
  }, [src, resolvedTheme, theme, locale, es]);

  useEffect(() => {
    frame.current?.contentWindow?.postMessage(
      { type: "pqc-welcome:theme", theme },
      window.location.origin,
    );
  }, [theme]);

  useEffect(() => {
    function onMessage(event: MessageEvent<WelcomeMessage>) {
      const el = frame.current;
      if (!el || event.source !== el.contentWindow) return;
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (data?.type === "pqc-welcome:height" && Number.isFinite(data.height)) {
        setHeight(Math.ceil(data.height));
      } else if (
        data?.type === "pqc-welcome:scroll" &&
        Number.isFinite(data.top)
      ) {
        const topBar =
          document.getElementById("nd-subnav")?.getBoundingClientRect()
            .bottom ?? 0;
        const reduce = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        window.scrollTo({
          top:
            el.getBoundingClientRect().top +
            window.scrollY +
            data.top -
            Math.max(0, topBar) -
            SCROLL_GAP,
          behavior: reduce ? "auto" : "smooth",
        });
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="not-prose my-2" style={{ minHeight: height }}>
      {src && (
        <iframe
          ref={frame}
          src={src}
          title={
            title ??
            (es
              ? "Bienvenida interactiva a PQC en Lamassu"
              : "Interactive PQC welcome for Lamassu")
          }
          className="block w-full border-0"
          style={{ height, colorScheme: theme }}
          // Re-send the theme once loaded, in case it changed while loading.
          onLoad={(e) =>
            e.currentTarget.contentWindow?.postMessage(
              { type: "pqc-welcome:theme", theme },
              window.location.origin,
            )
          }
        />
      )}
    </div>
  );
}
