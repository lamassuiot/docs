import { useI18n } from "fumadocs-ui/contexts/i18n";
import { Repeat } from "lucide-react";
import { cn } from "@/lib/cn";
import { useDemoAutoplay } from "@/lib/demo-autoplay";

/** Global switch in the top bar: should interactive demos restart when they finish? */
export function AutoplayToggle({ className }: { className?: string }) {
  const { locale } = useI18n();
  const [autoplay, setAutoplay] = useDemoAutoplay();
  const es = locale === "es";
  const label = es ? "Reproducción automática de demos" : "Auto-play demos";
  const hint = es
    ? "Reinicia las demos interactivas al terminar"
    : "Restart interactive demos when they finish";

  return (
    <button
      type="button"
      aria-pressed={autoplay}
      aria-label={label}
      title={`${label}: ${autoplay ? (es ? "activada" : "on") : es ? "desactivada" : "off"}. ${hint}.`}
      onClick={() => setAutoplay(!autoplay)}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        autoplay
          ? "border-fd-primary/40 bg-fd-accent text-fd-accent-foreground"
          : "text-fd-muted-foreground hover:bg-fd-accent/50",
        className,
      )}
    >
      <Repeat className="size-3.5" />
      <span>Auto-play</span>
    </button>
  );
}
