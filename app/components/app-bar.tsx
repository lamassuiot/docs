import { buttonVariants } from "fumadocs-ui/components/ui/button";
import { useI18n } from "fumadocs-ui/contexts/i18n";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { Airplay, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { type ReactNode, useEffect, useState } from "react";
import { Link } from "react-router";
import { docsPath } from "@/lib/base-path";
import { cn } from "@/lib/cn";
import { baseOptions } from "@/lib/layout.shared";

export type AppBarTab = { title: string; url: string; active?: boolean };

/**
 * The docs top bar for pages that live outside the docs layout (the API
 * reference). Mirrors the markup of Fumadocs' notebook navbar — same
 * `#nd-subnav`, `[data-header-body]` and `[data-header-tabs]` hooks — so
 * app.css styles both identically.
 */
export function AppBar({
  tabs = [],
  children,
}: {
  /** Section tabs. Omit them (and `children`) to render just the top bar. */
  tabs?: AppBarTab[];
  /** Extra content at the end of the tab row. */
  children?: ReactNode;
}) {
  const { nav, githubUrl } = baseOptions();
  // baseOptions() sets a plain element as the title; the function form is
  // never used here.
  const title = typeof nav?.title === "function" ? null : nav?.title;

  return (
    <header id="nd-subnav" className="sticky top-0 z-30 flex flex-col">
      <div
        data-header-body=""
        className="flex border-b px-4 gap-2 h-14 md:px-6"
      >
        <div className="flex flex-1 items-center">
          <Link
            to={docsPath()}
            className="inline-flex items-center gap-2.5 font-semibold"
          >
            {title}
          </Link>
        </div>
        <SearchButton className="w-full my-auto max-md:hidden rounded-xl max-w-sm ps-2.5" />
        <div className="flex flex-1 items-center justify-end md:gap-2">
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="GitHub"
              className={cn(
                buttonVariants({ size: "icon-sm", color: "ghost" }),
                "text-fd-muted-foreground",
              )}
            >
              <GitHubIcon />
            </a>
          )}
          <SearchIconButton />
          <ThemeToggle className="max-md:hidden" />
        </div>
      </div>
      {(tabs.length > 0 || children) && (
        <div
          data-header-tabs=""
          className="flex flex-row items-end gap-6 overflow-x-auto border-b px-4 h-10 md:px-6 [scrollbar-width:none]"
        >
          {tabs.map((tab) => (
            <Link
              key={tab.url}
              to={tab.url}
              className={cn(
                "inline-flex border-b-2 border-transparent transition-colors items-center pb-1.5 font-medium gap-2 text-fd-muted-foreground text-sm text-nowrap hover:text-fd-accent-foreground",
                tab.active && "border-fd-primary text-fd-primary",
              )}
            >
              {tab.title}
            </Link>
          ))}
          {children}
        </div>
      )}
    </header>
  );
}

function SearchButton({ className }: { className?: string }) {
  const { enabled, hotKey, setOpenSearch } = useSearchContext();
  const { text } = useI18n();
  if (!enabled) return null;

  return (
    <button
      type="button"
      data-search-full=""
      onClick={() => setOpenSearch(true)}
      className={cn(
        "inline-flex items-center gap-2 border bg-fd-secondary/50 p-1.5 ps-2 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground",
        className,
      )}
    >
      <Search className="size-4" />
      {text.search}
      <div className="ms-auto inline-flex gap-0.5">
        {hotKey.map((k, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static key-combo list
          <kbd key={i} className="border bg-fd-background px-1.5">
            {k.display}
          </kbd>
        ))}
      </div>
    </button>
  );
}

function SearchIconButton() {
  const { enabled, setOpenSearch } = useSearchContext();
  const { text } = useI18n();
  if (!enabled) return null;

  return (
    <button
      type="button"
      aria-label={text.search}
      onClick={() => setOpenSearch(true)}
      className={cn(
        buttonVariants({ size: "icon-sm", color: "ghost" }),
        "p-2 md:hidden",
      )}
    >
      <Search />
    </button>
  );
}

const THEMES = [
  ["light", Sun],
  ["dark", Moon],
  ["system", Airplay],
] as const;

function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const value = mounted ? theme : null;

  return (
    <div
      data-theme-toggle=""
      className={cn(
        "inline-flex items-center rounded-full border p-1 *:rounded-full",
        className,
      )}
    >
      {THEMES.map(([key, Icon]) => (
        <button
          key={key}
          type="button"
          aria-label={key}
          onClick={() => setTheme(key)}
          className={cn(
            "size-6.5 p-1.5 text-fd-muted-foreground",
            value === key && "bg-fd-accent text-fd-accent-foreground",
          )}
        >
          <Icon className="size-full" fill="currentColor" />
        </button>
      ))}
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor">
      <title>GitHub</title>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}
