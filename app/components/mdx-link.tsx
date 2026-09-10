import type { ComponentProps } from 'react';
import { DOCS_BASE_PATH, docsPath } from '@/lib/base-path';

/**
 * Rewrites the absolute `/docs/...` links authors write in MDX onto this
 * build's mount point, so a versioned or preview build links within itself
 * instead of jumping back to the main site. External links, anchors and
 * already-correct links pass through untouched.
 */
export function MdxLink({ href, ...props }: ComponentProps<'a'>) {
  return <a href={href ? rewrite(href) : href} {...props} />;
}

function rewrite(href: string): string {
  if (href.startsWith(`${DOCS_BASE_PATH}/`) || href === DOCS_BASE_PATH)
    return href;
  if (href === '/docs') return docsPath();
  if (href.startsWith('/docs/')) return docsPath(href.slice('/docs/'.length));
  return href;
}
