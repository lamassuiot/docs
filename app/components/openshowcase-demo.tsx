import type { InteractiveDemoProps } from "@rustrak/openshowcase-player-react";
import { Maximize2, Minimize2 } from "lucide-react";
import {
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { asset } from "@/lib/asset";
import { useDemoAutoplay } from "@/lib/demo-autoplay";
import { useDemoPopups } from "@/lib/demo-popups";

type Demo = NonNullable<InteractiveDemoProps["demo"]>;
type Player =
  typeof import("@rustrak/openshowcase-player-react").InteractiveDemo;
type GuideStep = { title: string; body: string; note?: string };

/** How long each popup stays on screen before Auto-play advances, in ms. */
const AUTOPLAY_POPUP_MS = 4000;
/** How long each screen stays on when popups are off, in ms. */
const PLAIN_PHOTO_MS = 1500;
/** Stable references: the player restarts when its props change identity. */
const HOTSPOT_STYLE = { bgColor: "#405fff", textColor: "#ffffff" };

/**
 * Plain (no backdrop) OpenShowcase player for a demo exported under
 * `public/demos/<name>/<locale>.json`.
 *
 * Two site-wide switches control playback. Popups decides whether the demo
 * shows its step popups at all: off, the demo plays through on its own with
 * a mouse pointer moving between the clicks. Auto-play decides whether it
 * runs by itself: popups advance after a short pause and the demo restarts
 * when it finishes; with it off, the reader clicks each popup.
 */
export function OpenShowcaseDemo({
  name,
  locale,
  showGuide = false,
}: {
  name: string;
  locale: "en" | "es";
  showGuide?: boolean;
}) {
  const [Player, setPlayer] = useState<Player | null>(null);
  const [demo, setDemo] = useState<Demo | null>(null);
  const [autoplay] = useDemoAutoplay();
  const [showPopups] = useDemoPopups();
  const base = asset(`demos/${name}/`);
  const frame = useRef<HTMLDivElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [guide, setGuide] = useState<GuideStep[]>([]);
  const [guideIndex, setGuideIndex] = useState(0);
  const demoRef = useRef<Demo | null>(null);
  demoRef.current = demo;

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
    fetch(`${base}${locale}.json`)
      .then((r) => r.json() as Promise<Demo>)
      .then((d) => {
        if (active) setDemo(d);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [base, locale]);

  useEffect(() => {
    if (!showGuide) return;
    let active = true;
    setGuide([]);
    setGuideIndex(0);
    fetch(`${base}guide.${locale}.json`)
      .then((r) => r.json() as Promise<{ steps: GuideStep[] }>)
      .then((data) => {
        if (active) setGuide(data.steps);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [base, locale, showGuide]);

  // With popups off, keep every step (some screens exist only as photos) and
  // its hotspot, which app.css draws as a mouse pointer, but drop the label so
  // no tooltip shows. onStepChange then clicks each hotspot on its own.
  const playerDemo = useMemo(
    () =>
      demo && {
        ...demo,
        steps: showPopups
          ? demo.steps
          : demo.steps.map((s) =>
              s.type === "photo" && s.hotspot
                ? { ...s, hotspot: { ...s.hotspot, label: undefined } }
                : s,
            ),
        theme: { ...demo.theme, autoplay },
      },
    [demo, autoplay, showPopups],
  );

  const latest = useRef({ autoplay, showPopups, showGuide });
  latest.current = { autoplay, showPopups, showGuide };

  const onStepChange = useCallback<
    NonNullable<InteractiveDemoProps["onStepChange"]>
  >((index, step) => {
    clearTimeout(timer.current);
    if (step.type !== "photo") return;
    if (latest.current.showGuide && step.hotspot && demoRef.current) {
      setGuideIndex(
        Math.max(
          0,
          demoRef.current.steps
            .slice(0, index + 1)
            .filter((item) => item.type === "photo" && item.hotspot).length - 1,
        ),
      );
    }
    const { autoplay, showPopups } = latest.current;
    // The player waits for a click on every hotspot (or, without one, on the
    // stage). Popups off: click it after a short look at the screen. Popups
    // on with Auto-play: after time to read the popup. Otherwise the reader.
    const delay = !showPopups
      ? PLAIN_PHOTO_MS
      : autoplay && step.hotspot
        ? AUTOPLAY_POPUP_MS
        : null;
    if (delay === null) return;
    timer.current = setTimeout(() => {
      const target = step.hotspot ? "button.hotspot" : ".stage";
      container.current?.querySelector<HTMLElement>(target)?.click();
    }, delay);
  }, []);

  return (
    <div
      className={
        showGuide ? "demo-guide-container not-prose my-6" : "not-prose my-6"
      }
    >
      <div className={showGuide ? "demo-with-guide" : undefined}>
        <div ref={frame} className="demo-frame group not-prose relative">
          <FullscreenButton target={frame} locale={locale} />
          <div
            ref={container}
            className={`platform-demo platform-demo--plain aspect-video w-full ${showGuide ? "platform-demo--guided" : ""} ${showPopups ? "" : "platform-demo--clicks"}`}
          >
            {Player && playerDemo && (
              <Player
                key={`${name}-${locale}-${autoplay}-${showPopups}`}
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
        </div>
        {showGuide && guide[guideIndex] && (
          <aside
            className="demo-guide"
            aria-label={
              locale === "es" ? "Guía del recorrido" : "Walkthrough guide"
            }
          >
            <p className="demo-guide-count">
              {locale === "es" ? "Guía" : "Guide"} · {guideIndex + 1} /{" "}
              {guide.length}
            </p>
            <h3>{guide[guideIndex].title}</h3>
            <p>{guide[guideIndex].body}</p>
            {guide[guideIndex].note && (
              <p className="demo-guide-note">{guide[guideIndex].note}</p>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}

/**
 * Puts the whole demo (video, stills and popups) in fullscreen. Hidden where
 * the browser cannot do it for an element (iPhone Safari).
 */
function FullscreenButton({
  target,
  locale,
}: {
  target: RefObject<HTMLDivElement | null>;
  locale: "en" | "es";
}) {
  const [supported, setSupported] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    setSupported(document.fullscreenEnabled);
    const sync = () => setActive(document.fullscreenElement === target.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, [target]);

  if (!supported) return null;

  const es = locale === "es";
  const label = active
    ? es
      ? "Salir de pantalla completa"
      : "Exit fullscreen"
    : es
      ? "Pantalla completa"
      : "Fullscreen";
  const Icon = active ? Minimize2 : Maximize2;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => {
        if (active) document.exitFullscreen().catch(() => {});
        else target.current?.requestFullscreen().catch(() => {});
      }}
      className="absolute top-3 right-3 z-10 inline-flex size-8 items-center justify-center rounded-md border border-white/15 bg-black/55 text-white opacity-0 shadow-sm backdrop-blur-sm transition-opacity outline-none hover:bg-black/70 focus-visible:opacity-100 focus-visible:ring-[3px] focus-visible:ring-(--lm-control)/50 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
    >
      <Icon className="size-4" />
    </button>
  );
}
