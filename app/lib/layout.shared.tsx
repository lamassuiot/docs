import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { createElement } from 'react';

// fill this with your actual GitHub info, for example:
export const gitConfig = {
  user: 'fuma-nama',
  repo: 'fumadocs',
  branch: 'main',
};

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: createElement(
        'span',
        { style: { display: 'inline-flex', alignItems: 'center', gap: '0.5rem' } },
        createElement('img', {
          src: '/images/lamassu.svg',
          width: 22,
          height: 22,
          style: { width: '1.375rem', height: '1.375rem', objectFit: 'contain', flexShrink: 0 },
        }),
        'Lamassu IoT Docs',
      ),
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
