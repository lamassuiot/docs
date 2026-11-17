import { useEffect, useState } from "react";
import { asset } from "@/lib/asset";

export function PlatformDemo({
  locale,
  noBackdrop = false,
}: {
  locale: "en" | "es";
  noBackdrop?: boolean;
}) {
  const [Demo, setDemo] = useState<
    typeof import("@rustrak/openshowcase-player-react").InteractiveDemo | null
  >(null);

  useEffect(() => {
    let active = true;
    import("@rustrak/openshowcase-player-react").then(({ InteractiveDemo }) => {
      if (active) setDemo(() => InteractiveDemo);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div
      className={`platform-demo not-prose my-6 aspect-video w-full ${noBackdrop ? "platform-demo--plain overflow-hidden rounded-xl shadow-xl" : ""}`}
    >
      {Demo && (
        <Demo
          key={locale}
          src={asset(`demos/lamassu-lab/${locale}.json`)}
          wrapper="none"
          backdrop={noBackdrop ? null : undefined}
          hotspotStyle={{ bgColor: "#405fff", textColor: "#ffffff" }}
          startWhenVisible
        />
      )}
    </div>
  );
}
