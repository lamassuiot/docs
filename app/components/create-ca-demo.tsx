import { useEffect, useState } from "react";
import { asset } from "@/lib/asset";

export function CreateCaDemo({ locale }: { locale: "en" | "es" }) {
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
    <div className="platform-demo platform-demo--plain not-prose my-6 aspect-video w-full">
      {Demo && (
        <Demo
          key={locale}
          src={asset(`demos/create-ca/${locale}.json`)}
          wrapper="none"
          backdrop={null}
          hotspotStyle={{ bgColor: "#405fff", textColor: "#ffffff" }}
          startWhenVisible
        />
      )}
    </div>
  );
}
