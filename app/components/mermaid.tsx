import { X } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { mermaidConfig } from "../lib/mermaid-theme";

/**
 * Renders ```mermaid code blocks with client-side mermaid, and opens a
 * fullscreen zoomed view when the reader clicks the diagram. Mermaid is
 * loaded on demand (only pages that use mermaid pay the bundle cost) and
 * re-renders on theme switches, so colors follow the reader's light/dark
 * mode.
 */
export function Mermaid({ chart }: { chart: string }) {
  const { resolvedTheme } = useTheme();
  const rawId = useId();
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // useId returns characters (":r1:" in React 18, "«r1»" in React 19) that
    // are invalid in SVG element ids.
    const renderId = `mermaid-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize(mermaidConfig(resolvedTheme === "dark"));
        const { svg } = await mermaid.render(renderId, chart);
        if (!cancelled) {
          setSvg(svg);
          setError(null);
        }
      } catch (e) {
        console.error("Mermaid render failed", e);
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    }

    void render();
    return () => {
      cancelled = true;
    };
  }, [chart, rawId, resolvedTheme]);

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

  if (error) {
    return (
      <pre className="my-6 overflow-x-auto rounded-lg border p-4 text-sm">
        {chart}
      </pre>
    );
  }

  return (
    <>
      <figure
        className="mermaid-fig"
        onClick={(event) => {
          // Only open when the click lands on the diagram itself, not on a
          // text selection inside it.
          const selection = window.getSelection();
          if (selection && selection.toString().length > 0) {
            return;
          }
          if (event.target instanceof Element) {
            setZoomed(true);
          }
        }}
        dangerouslySetInnerHTML={{ __html: svg ?? "" }}
      />
      {zoomed && svg && typeof document !== "undefined"
        ? createPortal(
            <div
              className="mermaid-zoom-overlay"
              role="dialog"
              aria-modal="true"
              aria-label="Diagrama ampliado"
              onClick={(event) => {
                if (event.target === event.currentTarget) {
                  setZoomed(false);
                }
              }}
            >
              <div
                className="mermaid-zoom-frame"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
              <button
                type="button"
                className="lb-close"
                aria-label="Cerrar"
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
