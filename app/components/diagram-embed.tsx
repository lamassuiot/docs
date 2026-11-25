import { X, ZoomIn } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/cn";

const LABELS = {
  es: {
    zoom: "Ampliar diagrama",
    zoomed: "Diagrama ampliado",
    close: "Cerrar",
  },
  en: { zoom: "Enlarge diagram", zoomed: "Enlarged diagram", close: "Close" },
} as const;

/**
 * Embeds a standalone diagram from `public/diagrams/`. Each diagram ships as
 * `<name>.html` (light) and `<name>-dark.html`, with an `-en` infix for the
 * English drawing (`<name>-en.html`, `<name>-en-dark.html`); the `#embed` hash switches the
 * page to its chrome-free mode (no title, no background, scaled to the frame),
 * so the drawing sits directly on the docs page.
 *
 * A magnifier button opens the same diagram in the fullscreen overlay the
 * Mermaid component uses. The frame keeps the diagram's own aspect ratio
 * (8:5, the 960x600 viewBox). The iframe is remounted on theme changes because
 * each theme is a separate file; `colorScheme` must match the embedded
 * document's, otherwise the browser paints an opaque backdrop behind it.
 */
export function DiagramEmbed({
  name,
  title,
  lang = "es",
  className,
}: {
  name: string;
  title: string;
  lang?: "es" | "en";
  className?: string;
}) {
  const labels = LABELS[lang];
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = mounted && resolvedTheme === "dark";

  useEffect(() => {
    if (!zoomed) {
      return;
    }
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setZoomed(false);
      }
    };
    document.addEventListener("keydown", handleKeydown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.body.style.overflow = previousOverflow;
    };
  }, [zoomed]);

  const frame = (frameClassName: string) => (
    <iframe
      key={mounted ? String(dark) : "initial"}
      src={`${asset(`diagrams/${name}${lang === "en" ? "-en" : ""}${dark ? "-dark" : ""}.html`)}#embed`}
      title={title}
      loading="lazy"
      style={{ colorScheme: dark ? "dark" : "light" }}
      className={frameClassName}
    />
  );

  return (
    <>
      <div className={cn("relative my-6", className)}>
        {frame("aspect-[8/5] w-full bg-transparent")}
        <button
          type="button"
          className="diagram-zoom-button"
          aria-label={labels.zoom}
          title={labels.zoom}
          onClick={() => setZoomed(true)}
        >
          <ZoomIn />
        </button>
      </div>
      {zoomed && typeof document !== "undefined"
        ? createPortal(
            <div
              className="mermaid-zoom-overlay"
              role="dialog"
              aria-modal="true"
              aria-label={labels.zoomed}
              onClick={(event) => {
                if (event.target === event.currentTarget) {
                  setZoomed(false);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setZoomed(false);
                }
              }}
            >
              <div className="diagram-zoom-frame">
                {frame("size-full bg-transparent")}
              </div>
              <button
                type="button"
                className="diagram-zoom-close"
                aria-label={labels.close}
                onClick={() => setZoomed(false)}
              >
                <X />
              </button>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
