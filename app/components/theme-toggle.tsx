import { buttonVariants } from "fumadocs-ui/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/cn";

/**
 * Single-button light/dark switch. The icon follows the `dark` class that
 * next-themes puts on <html>, so it is correct before hydration (no flash).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      data-theme-toggle=""
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
      className={cn(
        buttonVariants({ size: "icon-sm", color: "ghost" }),
        "size-7.5 shrink-0 self-center p-0 text-fd-muted-foreground",
        className,
      )}
    >
      <Sun className="hidden size-4.5 dark:block" fill="currentColor" />
      <Moon className="size-4.5 dark:hidden" fill="currentColor" />
    </button>
  );
}
