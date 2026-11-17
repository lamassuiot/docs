import type { InteractiveDemoProps } from "@rustrak/openshowcase-player-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import { useDemoAutoplay } from "@/lib/demo-autoplay";

type Demo = NonNullable<InteractiveDemoProps["demo"]>;
type Player =
  typeof import("@rustrak/openshowcase-player-react").InteractiveDemo;
type GuideStep = { title: string; body: string; note?: string };

/** How long each popup stays on screen before Auto-play advances, in ms. */
const AUTOPLAY_POPUP_MS = 4000;
/** Smallest free width, in px, worth showing the guide beside the video. */
const MIN_SIDE_PX = 240;
const MAX_SIDE_PX = 340;
const GAP_PX = 16;
/** Stable references: the player restarts when its props change identity. */
const HOTSPOT_STYLE = { bgColor: "#405fff", textColor: "#ffffff" };

/**
 * Plain (no backdrop) OpenShowcase player for a demo exported under
 * `public/demos/<name>/<locale>.json`, with an optional step-by-step guide
 * from `guide.<locale>.json` (one entry per popup, in order).
 *
 * The site-wide Auto-play switch decides whether the demo runs by itself:
 * popups advance on their own after a short pause and the demo restarts when
 * it finishes. With it off, the reader clicks each popup.
 *
 * The guide sits to the right of the video when there is free room up to the
 * page's table of contents, and below it otherwise.
 */
export function OpenShowcaseDemo({
  name,
  locale,
}: {
  name: string;
  locale: "en" | "es";
}) {
  const [Player, setPlayer] = useState<Player | null>(null);
  const [demo, setDemo] = useState<Demo | null>(null);
  const [guide, setGuide] = useState<GuideStep[] | null>(null);
  const [current, setCurrent] = useState(0);
  const [side, setSide] = useState(0);
  const [autoplay] = useDemoAutoplay();
  const base = asset(`demos/${name}/`);
  const outer = useRef<HTMLDivElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    let active = true;
    import("@rustrak/openshowcase-player-react").then(({ InteractiveDemo }) => {
      if (active) setPlayer(() => InteractiveDemo);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setCurrent(0);
    fetch(`${base}${locale}.json`)
      .then((r) => r.json() as Promise<Demo>)
      .then((d) => {
        if (active) setDemo(d);
      })
      .catch(() => {});
    fetch(`${base}guide.${locale}.json`)
      .then((r) => r.json() as Promise<{ steps?: GuideStep[] }>)
      .then((g) => {
        if (active) setGuide(Array.isArray(g.steps) ? g.steps : null);
      })
      .catch(() => {
        if (active) setGuide(null);
      });
    return () => {
      active = false;
    };
  }, [base, locale]);

  // Indexes (in demo.steps) of the steps that carry a popup.
  const popups = useMemo(
    () =>
      (demo?.steps ?? []).flatMap((s, i) =>
        s.type === "photo" && s.hotspot ? [i] : [],
      ),
    [demo],
  );

  // Show the guide beside the video when there is room before the table of
  // contents (or the window edge); otherwise stack it below.
  useEffect(() => {
    if (!guide) return;
    const measure = () => {
      const parent = outer.current?.parentElement;
      if (!parent) return;
      const right = parent.getBoundingClientRect().right;
      const toc = document.getElementById("nd-toc");
      const limit = toc
        ? toc.getBoundingClientRect().left
        : document.documentElement.clientWidth;
      const free = limit - right - 2 * GAP_PX;
      setSide(
        free >= MIN_SIDE_PX ? Math.min(Math.floor(free), MAX_SIDE_PX) : 0,
      );
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [guide]);

  const latest = useRef({ popups, autoplay });
  latest.current = { popups, autoplay };

  const onStepChange = useCallback<
    NonNullable<InteractiveDemoProps["onStepChange"]>
  >((index, step) => {
    clearTimeout(timer.current);
    const { popups, autoplay } = latest.current;
    const reached = popups.filter((i) => i <= index).length;
    setCurrent(Math.max(0, reached - 1));
    // Auto-play: the player waits for a click on every popup's hotspot, so
    // click it for the reader after a short pause.
    if (!autoplay || step.type !== "photo" || !step.hotspot) return;
    timer.current = setTimeout(() => {
      container.current
        ?.querySelector<HTMLButtonElement>("button.hotspot")
        ?.click();
    }, AUTOPLAY_POPUP_MS);
  }, []);

  const playerDemo = useMemo(
    () =>
      demo && {
        ...demo,
        theme: { ...demo.theme, autoplay },
      },
    [demo, autoplay],
  );

  const beside = guide && side > 0;

  return (
    <div
      ref={outer}
      className="not-prose my-6"
      style={beside ? { marginRight: -(side + GAP_PX) } : undefined}
    >
      <div
        className={beside ? "grid items-stretch" : "flex flex-col gap-3"}
        style={
          beside
            ? { gridTemplateColumns: `minmax(0, 1fr) ${side}px`, gap: GAP_PX }
            : undefined
        }
      >
        <div
          ref={container}
          className="platform-demo platform-demo--plain aspect-video w-full"
        >
          {Player && playerDemo && (
            <Player
              key={`${name}-${locale}-${autoplay}`}
              demo={playerDemo}
              assetBaseUrl={base}
              wrapper="none"
              backdrop={null}
              hotspotStyle={HOTSPOT_STYLE}
              startWhenVisible
              onStepChange={onStepChange}
            />
          )}
        </div>
        {guide && guide.length > 0 && (
          <GuidePanel
            entries={guide}
            index={Math.min(current, guide.length - 1)}
            locale={locale}
            beside={!!beside}
          />
        )}
      </div>
    </div>
  );
}

/** Accent at a given strength, so the tints follow light and dark mode. */
const tint = (pct: number) =>
  `color-mix(in srgb, var(--lm-accent) ${pct}%, transparent)`;

function GuideEntry({
  entry,
  animate,
}: {
  entry: GuideStep;
  animate?: boolean;
}) {
  return (
    <div className={`flex flex-col ${animate ? "demo-guide-step" : ""}`}>
      <h3 className="text-[1.0625rem] font-semibold leading-snug tracking-[-0.015em] text-[var(--lm-heading)]">
        {entry.title}
      </h3>
      <p className="mt-2 text-sm leading-[1.65] text-[var(--lm-body)]">
        {entry.body}
      </p>
      {entry.note && (
        <div
          className="mt-4 flex gap-2.5 border-t pt-3.5"
          style={{ borderColor: tint(14) }}
        >
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            className="mt-[3px] size-3.5 shrink-0 text-[var(--lm-accent)]"
          >
            <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.14" />
            <rect x="7.1" y="7" width="1.8" height="4.6" rx="0.9" fill="currentColor" />
            <circle cx="8" cy="4.7" r="1.05" fill="currentColor" />
          </svg>
          <p className="text-[0.8125rem] leading-[1.6] text-fd-muted-foreground">
            {entry.note}
          </p>
        </div>
      )}
    </div>
  );
}

/** Step counter and one segment per step: done, current and pending. */
function GuideProgress({
  index,
  total,
  locale,
}: {
  index: number;
  total: number;
  locale: "en" | "es";
}) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[0.8125rem] tabular-nums tracking-tight">
          <span className="font-semibold text-[var(--lm-accent)]">
            {pad(index + 1)}
          </span>
          <span className="text-fd-muted-foreground"> / {pad(total)}</span>
        </p>
        <p className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-fd-muted-foreground">
          {locale === "es" ? "Guía" : "Guide"}
        </p>
      </div>
      <div className="flex gap-1" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className="h-[3px] flex-1 rounded-[1px] transition-colors duration-300"
            style={{
              background:
                i === index
                  ? "var(--lm-accent)"
                  : i < index
                    ? tint(38)
                    : tint(12),
            }}
          />
        ))}
      </div>
    </div>
  );
}

function GuidePanel({
  entries,
  index,
  locale,
  beside,
}: {
  entries: GuideStep[];
  index: number;
  locale: "en" | "es";
  beside: boolean;
}) {
  return (
    <aside
      aria-live="polite"
      aria-label={locale === "es" ? "Guía detallada" : "Detailed guide"}
      className={`flex flex-col rounded-r-xl border-l-2 border-[var(--lm-accent)] ${beside ? "min-h-0" : ""}`}
      style={{ background: tint(4) }}
    >
      <div className="px-5 pt-5 pb-4">
        <GuideProgress index={index} total={entries.length} locale={locale} />
      </div>
      {beside ? (
        <div className="relative min-h-0 flex-1">
          <div className="absolute inset-0 overflow-y-auto px-5 pb-5">
            <GuideEntry key={index} entry={entries[index]} animate />
          </div>
        </div>
      ) : (
        // Stack every step in one grid cell so the panel keeps the height of
        // the longest one and the text below the demo does not jump.
        <div className="grid px-5 pb-5">
          {entries.map((entry, i) => (
            <div
              key={entry.title}
              className={`col-start-1 row-start-1 ${i === index ? "" : "invisible"}`}
              aria-hidden={i !== index}
            >
              <GuideEntry entry={entry} animate={i === index} />
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
