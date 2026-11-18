import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "fumadocs-ui/components/ui/popover";
import { useI18n } from "fumadocs-ui/contexts/i18n";
import { ChevronsUpDown, MonitorPlay } from "lucide-react";
import { useId } from "react";
import { cn } from "@/lib/cn";
import { useDemoAutoplay } from "@/lib/demo-autoplay";
import { useDemoPopups } from "@/lib/demo-popups";

const TEXT = {
  en: {
    trigger: "Playback control",
    title: "Interactive demos",
    subtitle: "Playback preferences for every demo in the docs.",
    popups: "Step popups",
    popupsHint: "Pause on each step and show what to do next.",
    autoplay: "Auto-play",
    autoplayHint: "Advance steps on their own and loop at the end.",
  },
  es: {
    trigger: "Control de reproducción",
    title: "Demos interactivas",
    subtitle: "Preferencias de reproducción para todas las demos.",
    popups: "Popups de pasos",
    popupsHint: "Pausa en cada paso e indica qué hacer a continuación.",
    autoplay: "Reproducción automática",
    autoplayHint: "Avanza los pasos sola y vuelve a empezar al terminar.",
  },
} as const;

/**
 * Top-bar control that groups every interactive-demo preference. Styled after
 * shadcn/ui: an outline button opening a popover of labelled switches.
 */
export function DemoSettings({ className }: { className?: string }) {
  const { locale } = useI18n();
  const t = TEXT[locale === "es" ? "es" : "en"];
  const [popups, setPopups] = useDemoPopups();
  const [autoplay, setAutoplay] = useDemoAutoplay();

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          // shadcn Button, variant "outline", size "sm"
          "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border bg-fd-background px-3 text-sm font-medium shadow-xs transition-colors outline-none",
          "hover:bg-fd-accent hover:text-fd-accent-foreground data-[state=open]:bg-fd-accent data-[state=open]:text-fd-accent-foreground",
          "focus-visible:ring-[3px] focus-visible:ring-(--lm-control)/40",
          className,
        )}
      >
        <MonitorPlay className="size-4 text-(--lm-control)" />
        <span>{t.trigger}</span>
        <ChevronsUpDown className="size-3.5 opacity-50" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={6}
        // shadcn PopoverContent: solid surface, rounded-md, shadow-md, p-4
        className="w-80 rounded-md bg-fd-popover p-4 shadow-md backdrop-blur-none"
      >
        <div className="grid gap-4">
          <div className="space-y-1.5">
            <h4 className="font-medium leading-none text-fd-popover-foreground">
              {t.title}
            </h4>
            <p className="text-sm text-fd-muted-foreground">{t.subtitle}</p>
          </div>
          <div className="grid gap-4">
            <SettingRow
              label={t.popups}
              hint={t.popupsHint}
              checked={popups}
              onChange={setPopups}
            />
            <SettingRow
              label={t.autoplay}
              hint={t.autoplayHint}
              checked={autoplay}
              onChange={setAutoplay}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** shadcn "settings" row: Label and description on the left, Switch on the right. */
function SettingRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="grid gap-1">
        <label
          htmlFor={id}
          className="cursor-pointer select-none text-sm font-medium leading-none"
        >
          {label}
        </label>
        <p
          id={`${id}-hint`}
          className="text-[0.8125rem] leading-snug text-fd-muted-foreground"
        >
          {hint}
        </p>
      </div>
      <Switch
        id={id}
        checked={checked}
        onChange={onChange}
        describedBy={`${id}-hint`}
      />
    </div>
  );
}

/** shadcn/ui Switch markup, without the Radix dependency. */
function Switch({
  id,
  checked,
  onChange,
  describedBy,
}: {
  id: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  describedBy?: string;
}) {
  const state = checked ? "checked" : "unchecked";
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-describedby={describedBy}
      data-state={state}
      onClick={() => onChange(!checked)}
      className={cn(
        "peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none",
        "focus-visible:ring-[3px] focus-visible:ring-(--lm-control)/40",
        "data-[state=checked]:bg-(--lm-control) data-[state=unchecked]:bg-fd-muted-foreground/25",
      )}
    >
      <span
        data-state={state}
        className="pointer-events-none block size-4 rounded-full bg-fd-background ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
      />
    </button>
  );
}
