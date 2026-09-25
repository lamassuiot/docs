import { docs } from "fumadocs-mdx:collections/server";
import { type InferPageType, loader } from "fumadocs-core/source";
import {
  BadgeCheck,
  Bell,
  ClipboardList,
  Cloud,
  Cpu,
  FileCheck2,
  Globe,
  KeyRound,
  List,
  Network,
  SearchCheck,
  Server,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { type ComponentType, createElement } from "react";
import { asset } from "@/lib/asset";
import { DOCS_BASE_PATH } from "@/lib/base-path";
import {
  DEFAULT_LOCALE,
  docsUrl,
  i18nConfig,
  type Locale,
} from "@/lib/locales";

const imgIconMap: Record<string, string> = {
  lamassu: asset("images/lamassu.svg"),
  k8s: asset("images/kubernetes.svg"),
};

const lucideIconMap: Record<
  string,
  ComponentType<{ size?: number; className?: string }>
> = {
  kms: KeyRound,
  ca: ShieldCheck,
  ra: ClipboardList,
  va: BadgeCheck,
  certs: FileCheck2,
  devices: Cpu,
  alerts: Bell,
  est: Network,
  ocsp: SearchCheck,
  crl: List,
  aws: Cloud,
  server: Server,
  fastlane: Zap,
  cloud: Cloud,
  saas: Globe,
};

export const source = loader({
  source: docs.toFumadocsSource(),
  baseUrl: DOCS_BASE_PATH,
  i18n: i18nConfig,
  // Fumadocs' createGetUrl places the locale before the mount point
  // (/en/docs/...); the site routes /docs/*, so the locale segment lives
  // inside the mount. DocsUrl also keeps the default locale unprefixed
  // regardless of hideLocale.
  url: (slugs, locale) =>
    docsUrl(DOCS_BASE_PATH, (locale as Locale) ?? DEFAULT_LOCALE, slugs),
  icon(name) {
    if (!name) return;
    if (name in imgIconMap) {
      return createElement("img", {
        src: imgIconMap[name],
        width: 20,
        height: 20,
        style: {
          width: "1.25rem",
          height: "1.25rem",
          verticalAlign: "middle",
          flexShrink: 0,
          objectFit: "contain",
        },
      });
    }
    if (name in lucideIconMap) {
      return createElement(lucideIconMap[name], {
        size: 16,
        className: "shrink-0",
      });
    }
  },
});

export async function getLLMText(page: InferPageType<typeof source>) {
  const processed = await page.data.getText("processed");

  return `# ${page.data.title} (${page.url})

${processed}`;
}
