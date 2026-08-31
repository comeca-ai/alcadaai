import { Link, useLocation } from 'react-router';
import { cn } from '@/lib/utils';
import LogoTick from '@/components/LogoTick';
import { usePapel } from '@/lib/papel';

type NavEntry = {
  label: string;
  to: string;
  active: boolean;
  badge?: number;
};

function NavItem({ entry }: { entry: NavEntry }) {
  return (
    <Link
      to={entry.to}
      className={cn(
        'flex w-full items-center gap-[11px] rounded-xl px-[14px] py-[10px] text-left text-[14px] font-extrabold no-underline transition-colors',
        'text-al-sand hover:bg-white/[.07] hover:text-al-cream',
        entry.active && 'bg-al-green/40 text-al-gold hover:bg-al-green/40 hover:text-al-gold',
      )}
    >
      <span
        className={cn(
          'h-2 w-2 shrink-0 rounded-full bg-current opacity-[.55]',
          entry.active && 'bg-al-mint opacity-100',
        )}
      />
      {entry.label}
      {typeof entry.badge === 'number' && (
        <span className="ml-auto rounded-full bg-al-red px-[9px] py-[2px] text-[11.5px] font-black text-white [font-variant-numeric:tabular-nums]">
          {entry.badge}
        </span>
      )}
    </Link>
  );
}

/**
 * Sidebar escura (238px, sticky): LogoTick, tenant, nav principal e,
 * no rodapé, o SELETOR DE PAPEL (pills NJ Vendedor / DC Diretor) que
 * alterna o estado global via PapelProvider.
 */
export default function OpsSidebar() {
  const { pathname } = useLocation();
  const { papel, setPapel, nome, iniciais, cargo } = usePapel();

  const nav: NavEntry[] = [
    { label: 'Nova proposta', to: '/nova', active: pathname === '/' || pathname.startsWith('/nova') },
    { label: 'Kanban da proposta', to: '/kanban', active: pathname.startsWith('/kanban') },
    { label: 'Minhas propostas', to: '/minhas', active: pathname.startsWith('/minhas') },
    { label: 'Painel do diretor', to: '/diretor', active: pathname.startsWith('/diretor'), badge: 2 },
  ];

  return (
    <aside className="sticky top-0 flex h-[100dvh] w-[238px] shrink-0 flex-col gap-2 bg-al-dark px-[18px] py-[26px] text-al-cream">
      <div>
        <Link to="/" className="inline-block no-underline">
          <LogoTick variant="light" />
        </Link>
      </div>
      <div className="mb-4 mt-[10px] text-[10.5px] font-extrabold uppercase tracking-[.14em] text-al-faint">
        preço com governança
      </div>

      <div className="mb-3 rounded-xl border border-al-gold/30 bg-al-gold/[.12] px-[14px] py-[10px] text-[12px] font-extrabold text-al-gold">
        Vetta Facilities
        <span className="mt-[2px] block font-bold text-al-faint">plano time · 8 vendedores</span>
      </div>

      <nav className="flex flex-col gap-2">
        {nav.map((entry) => (
          <NavItem key={entry.label} entry={entry} />
        ))}
      </nav>

      {/* Seletor de papel (demo v0) */}
      <div className="mt-auto rounded-[14px] border border-white/10 bg-white/[.06] p-[14px]">
        <div className="flex gap-2">
          {(['vendedor', 'diretor'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPapel(p)}
              className={cn(
                'flex-1 cursor-pointer rounded-full border px-[10px] py-[8px] font-sans text-[12px] font-black transition-colors',
                papel === p
                  ? 'border-al-teal bg-al-teal text-white'
                  : 'border-white/15 bg-transparent text-al-sand hover:border-white/30 hover:text-al-cream',
              )}
            >
              {p === 'vendedor' ? 'NJ Vendedor' : 'DC Diretor'}
            </button>
          ))}
        </div>
        <div className="mt-3 text-[14px] font-black text-white">{nome}</div>
        <div className="mt-[2px] text-[12px] font-bold text-al-faint">
          {cargo} · Vetta Facilities
        </div>
        <div className="mt-[10px] text-[12px] font-extrabold text-al-mint">
          {papel === 'vendedor' ? 'Sua alçada: desconto até 5%' : 'Alçada total · fila com 2 pedidos'}
        </div>
        <div className="mt-2 flex h-[38px] w-[38px] items-center justify-center rounded-full bg-al-green text-[14px] font-black text-white">
          {iniciais}
        </div>
      </div>
    </aside>
  );
}
