import { cn } from '@/lib/utils';
import type { TomPill } from '@/lib/api';

/** Pill de status no estilo do wireframe (green/amber/red/gray). */
export default function Pill({ tom, children }: { tom: TomPill; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full px-[12px] py-[5px] text-[12px] font-black',
        tom === 'green' && 'border border-al-teal/30 bg-al-teal-soft text-al-teal-ink',
        tom === 'amber' && 'bg-al-amber-soft text-al-amber-ink',
        tom === 'red' && 'bg-al-red-soft text-al-red',
        tom === 'gray' && 'border border-al-border bg-white text-al-muted',
      )}
    >
      {children}
    </span>
  );
}
