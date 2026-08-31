import { cn } from '@/lib/utils';

/**
 * KPI card do wireframe (label uppercase faint / valor grande Fraunces / delta).
 * tom: 'up' verde, 'warn' vermelho, 'flat' neutro.
 */
export default function KpiCard({
  label,
  value,
  delta,
  tom = 'flat',
}: {
  label: string;
  value: string;
  delta?: string;
  tom?: 'up' | 'warn' | 'flat';
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-al-border bg-white px-5 py-4">
      <div className="text-[11.5px] font-extrabold uppercase tracking-[.08em] text-al-faint">
        {label}
      </div>
      <div className="font-display text-[28px] font-black leading-[1.1] tracking-[-0.02em] [font-variant-numeric:tabular-nums]">
        {value}
      </div>
      {delta && (
        <div
          className={cn(
            'text-[12px] font-extrabold',
            tom === 'up' && 'text-al-teal-ink',
            tom === 'warn' && 'text-al-red',
            tom === 'flat' && 'text-al-faint',
          )}
        >
          {delta}
        </div>
      )}
    </div>
  );
}
