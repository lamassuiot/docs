import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/cn";

/**
 * Embeds the animated Kubernetes deployment diagram (public/architecture-diagram.html).
 * `lock` hides the low/medium level toggle so a page can pin the diagram at
 * medium level and reserve the low-level (per-service) view for the
 * platform architecture chapter.
 */
export function ArchitectureDiagram({
  view = "3d",
  level = "medium",
  lock = false,
  title = "Lamassu Kubernetes deployment architecture",
  className,
}: {
  view?: "2d" | "3d";
  level?: "low" | "medium";
  lock?: boolean;
  title?: string;
  className?: string;
}) {
  // Shares the site-wide theme (next-themes via fumadocs' RootProvider). The
  // diagram reads it once from the URL hash, so a theme change after it has
  // loaded needs a fresh iframe — the `key` below forces that remount.
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = mounted && resolvedTheme === "dark";

  const hash = [view, level, dark ? "dark" : "light", lock ? "lock" : null]
    .filter(Boolean)
    .join("&");

  return (
    <iframe
      key={mounted ? String(dark) : "initial"}
      src={`${asset("architecture-diagram.html")}#${hash}`}
      title={title}
      loading="lazy"
      allowFullScreen
      className={cn(
        "my-6 aspect-[16/9] w-full rounded-lg border",
        className,
      )}
    />
  );
}
