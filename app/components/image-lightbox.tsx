import { X } from "lucide-react";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const OPEN_SELECTOR =
  '.prose img, article img, [class*="prose"] img, figure img, [data-lightboxable]';

/** Rect of the clicked thumbnail in viewport coordinates, if visible. */
function thumbnailRect(image: HTMLImageElement): DOMRect | null {
  const rect = image.getBoundingClientRect();
  return rect.width > 0 &&
    rect.height > 0 &&
    rect.bottom > 0 &&
    rect.top < window.innerHeight
    ? rect
    : null;
}

/** First-frame transform of the FLIP zoom, as CSS custom properties. */
type StartTransform = {
  "--lb-start-x": string;
  "--lb-start-y": string;
  "--lb-start-sx": string;
  "--lb-start-sy": string;
};

/**
 * Fullscreen image lightbox for doc content.
 *
 * Images inside the docs body are opened via event delegation, so MDX pages
 * need no markup changes. The image FLIP-zooms from the clicked thumbnail's
 * rect into its final position (up, down, wherever it is) and the close is
 * instant. The overlay closes when the user clicks the backdrop, presses
 * Escape, or focus leaves it.
 */
export function ImageLightbox() {
  const [src, setSrc] = useState<string | null>(null);
  const [start, setStart] = useState<StartTransform | null>(null);
  const [ready, setReady] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const thumbElRef = useRef<HTMLImageElement | null>(null);
  const measuredRef = useRef(false);

  const close = useCallback(() => {
    measuredRef.current = false;
    thumbElRef.current = null;
    setReady(false);
    setStart(null);
    setSrc(null);
  }, []);

  const measureAndStart = useCallback(() => {
    if (measuredRef.current) {
      return;
    }

    const image = imgRef.current;
    const thumb = thumbElRef.current;
    // The thumb is re-measured here, after the scrollbar was removed, so both
    // rects share the same layout (centered content shifts when it disappears).
    if (!image || !thumb || !thumb.isConnected) {
      return;
    }

    const thumbRect = thumbnailRect(thumb);
    const final = image.getBoundingClientRect();
    if (!thumbRect || final.width <= 0 || final.height <= 0) {
      return;
    }

    measuredRef.current = true;
    setStart({
      "--lb-start-x": `${thumbRect.left - final.left}px`,
      "--lb-start-y": `${thumbRect.top - final.top}px`,
      "--lb-start-sx": `${thumbRect.width / final.width}`,
      "--lb-start-sy": `${thumbRect.height / final.height}`,
    });
    setReady(true);
  }, []);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const image = target.closest(OPEN_SELECTOR);
      if (
        !(image instanceof HTMLImageElement) ||
        image.closest("nav, #nd-sidebar, #nd-sidebar-mobile, .lb-overlay")
      ) {
        return;
      }

      // Ignore tiny inline icons/decorations.
      if (image.naturalWidth < 64 || image.naturalHeight < 64) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      thumbElRef.current = image;
      measuredRef.current = false;
      setStart(null);
      setReady(false);
      setSrc(image.currentSrc || image.src);
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () =>
      document.removeEventListener("click", handleDocumentClick, true);
  }, []);

  useEffect(() => {
    if (!src) {
      return;
    }

    // Cached images may already be complete by the time this effect runs.
    if (imgRef.current?.complete) {
      measureAndStart();
    }
  }, [src, measureAndStart]);

  useEffect(() => {
    if (!src) {
      return;
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.addEventListener("keydown", handleKeydown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.body.style.overflow = previousOverflow;
    };
  }, [src, close]);

  if (!src || typeof document === "undefined") {
    return null;
  }

  const style = start ? (start as CSSProperties) : undefined;

  return createPortal(
    <div
      className="lb-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Imagen ampliada"
      tabIndex={-1}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          close();
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          close();
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          close();
        }
      }}
      ref={(node) => node?.focus()}
    >
      <img
        ref={imgRef}
        className={ready ? "lb-image lb-ready" : "lb-image"}
        src={src}
        alt=""
        style={style}
        onLoad={measureAndStart}
      />
      <button
        type="button"
        className="lb-close"
        aria-label="Cerrar"
        onClick={close}
      >
        <X />
      </button>
    </div>,
    document.body,
  );
}
