import { loader, type InferPageType } from 'fumadocs-core/source';
import { docs } from 'fumadocs-mdx:collections/server';
import { createElement } from 'react';

const iconMap: Record<string, string> = {
  lamassu: '/images/lamassu.svg',
  k8s: '/images/kubernetes.svg',
};

export const source = loader({
  source: docs.toFumadocsSource(),
  baseUrl: '/docs',
  icon(name) {
    if (name && name in iconMap) {
      return createElement('img', {
        src: iconMap[name],
        width: 20,
        height: 20,
        style: { width: '1.25rem', height: '1.25rem', verticalAlign: 'middle', flexShrink: 0, objectFit: 'contain' },
      });
    }
  },
});

export async function getLLMText(page: InferPageType<typeof source>) {
  const processed = await page.data.getText('processed');

  return `# ${page.data.title} (${page.url})

${processed}`;
}
