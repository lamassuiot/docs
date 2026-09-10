import { GitCompare } from 'lucide-react';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { cn } from '@/lib/cn';

export function DiffToggle({ enabled, onToggle }: { enabled: boolean; onToggle: (next: boolean) => void }) {
  return (
    <button
      type="button"
      aria-pressed={enabled}
      onClick={() => onToggle(!enabled)}
      className={cn(
        buttonVariants({
          color: enabled ? 'primary' : 'secondary',
          size: 'sm',
          className: 'ml-auto gap-2 [&_svg]:size-3.5',
        }),
      )}
    >
      <GitCompare />
      {enabled ? 'Diff on' : 'Show diff'}
    </button>
  );
}
