import type { InteractiveDemoProps } from "@rustrak/openshowcase-player-react";
import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import { useDemoAutoplay } from "@/lib/demo-autoplay";

type Demo = NonNullable<InteractiveDemoProps["demo"]>;
type Player =
  typeof import("@rustrak/openshowcase-player-react").InteractiveDemo;

/** How long each popup stays on screen before Auto-play advances, in ms. */
const AUTOPLAY_POPUP_MS = 4000;

/**
 * Plain (no backdrop) OpenShowcase player for a demo exported under
 * `public/demos/<name>/<locale>.json`. The site-wide Auto-play switch decides
 * whether the demo runs by itself: popups advance on their own after a short
 * pause and the demo restarts when it finishes. With it off, the reader clicks
 * each popup.
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
  const [autoplay] = useDemoAutoplay();
  const base = asset(`demos/${name}/`);
  const container = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Auto-play: the player waits for a click on every popup's hotspot, so
  // click it for the reader after a short pause.
  const onStepChange: NonNullable<InteractiveDemoProps["onStepChange"]> = (
    _index,
    step,
  ) => {
    clearTimeout(timer.current);
    if (!autoplay || step.type !== "photo" || !step.hotspot) return;
    timer.current = setTimeout(() => {
      container.current
        ?.querySelector<HTMLButtonElement>("button.hotspot")
        ?.click();
    }, AUTOPLAY_POPUP_MS);
  };

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

  return (
    <div
      ref={container}
      className="platform-demo platform-demo--plain not-prose my-6 aspect-video w-full"
    >
      {Player && demo && (
        <Player
          key={`${name}-${locale}-${autoplay}`}
          demo={{ ...demo, theme: { ...demo.theme, autoplay } }}
          assetBaseUrl={base}
          wrapper="none"
          backdrop={null}
          hotspotStyle={{ bgColor: "#405fff", textColor: "#ffffff" }}
          startWhenVisible
          onStepChange={onStepChange}
        />
      )}
    </div>
  );
}
