import type { DiffLine } from '@/lib/pr-diffs';

const LINE_STYLES: Record<DiffLine['type'], string> = {
  hunk: 'bg-fd-muted text-fd-muted-foreground',
  add: 'bg-green-500/15 text-green-800 dark:text-green-400',
  del: 'bg-red-500/15 text-red-800 dark:text-red-400',
  ctx: 'text-fd-muted-foreground',
};

const LINE_PREFIX: Record<DiffLine['type'], string> = {
  hunk: '',
  add: '+',
  del: '-',
  ctx: ' ',
};

export function DiffPanel({ lines }: { lines: DiffLine[] }) {
  return (
    <div className="mb-6 overflow-x-auto rounded-lg border border-fd-border font-mono text-xs leading-5">
      {lines.map((line, i) => (
        // Diff lines have no stable identity of their own; index is fine since this list never reorders.
        // biome-ignore lint/suspicious/noArrayIndexKey: static diff data, list never reorders
        <div key={i} className={`whitespace-pre px-3 py-0.5 ${LINE_STYLES[line.type]}`}>
          <span className="mr-2 select-none opacity-50">{LINE_PREFIX[line.type]}</span>
          {line.text}
        </div>
      ))}
    </div>
  );
}
