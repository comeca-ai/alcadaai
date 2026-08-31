import { cn } from '@/lib/utils';

/**
 * Logo "alçada" (minúscula, Nunito 800) com o tick verde embaixo:
 * barra de 4px + traço vertical 4x14 à direita da barra.
 * `variant="light"` → branca (sidebar escura); `variant="dark"` → ink (superfícies claras).
 */
export default function LogoTick({
  variant = 'dark',
  className,
}: {
  variant?: 'light' | 'dark';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'relative inline-block text-[28px] font-extrabold leading-none tracking-[-0.02em]',
        variant === 'light' ? 'text-white' : 'text-al-ink',
        className,
      )}
    >
      alçada
      <span className="absolute bottom-[-6px] left-[1px] right-[16%] h-1 rounded-[2px] bg-al-teal">
        <span className="absolute bottom-0 right-[-4px] h-[14px] w-1 rounded-[2px] bg-al-teal" />
      </span>
    </span>
  );
}
