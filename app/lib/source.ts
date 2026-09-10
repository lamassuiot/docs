import { loader, type InferPageType } from 'fumadocs-core/source';
import { docs } from 'fumadocs-mdx:collections/server';
import { type ComponentType, createElement } from 'react';
import { asset } from '@/lib/asset';
import { DOCS_BASE_PATH } from '@/lib/base-path';
import {
  KeyRound,
  ShieldCheck,
  ClipboardList,
  BadgeCheck,
  FileCheck2,
  Cpu,
  Bell,
  Network,
  SearchCheck,
  List,
  Cloud,
  Server,
  Zap,
  Globe,
} from 'lucide-react';

const imgIconMap: Record<string, string> = {
  lamassu: asset('images/lamassu.svg'),
  k8s: asset('images/kubernetes.svg'),
};

const lucideIconMap: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  kms:     KeyRound,
  ca:      ShieldCheck,
  ra:      ClipboardList,
  va:      BadgeCheck,
  certs:   FileCheck2,
  devices: Cpu,
  alerts:  Bell,
  est:     Network,
  ocsp:    SearchCheck,
  crl:     List,
  aws:     Cloud,
  server:  Server,
  fastlane: Zap,
  cloud:   Cloud,
  saas:    Globe,
};

export const source = loader({
  source: docs.toFumadocsSource(),
  baseUrl: DOCS_BASE_PATH,
  icon(name) {
    if (!name) return;
    if (name in imgIconMap) {
      return createElement('img', {
        src: imgIconMap[name],
        width: 20,
        height: 20,
        style: { width: '1.25rem', height: '1.25rem', verticalAlign: 'middle', flexShrink: 0, objectFit: 'contain' },
      });
    }
    if (name in lucideIconMap) {
      return createElement(lucideIconMap[name], { size: 16, className: 'shrink-0' });
    }
  },
});

export async function getLLMText(page: InferPageType<typeof source>) {
  const processed = await page.data.getText('processed');

  return `# ${page.data.title} (${page.url})

${processed}`;
}
