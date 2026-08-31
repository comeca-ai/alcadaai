import { fmtBRL, fmtPct } from '@/lib/api';
import { cn } from '@/lib/utils';
import { PassaportePills } from './Passaporte';
import type { Passaporte } from './Passaporte';
import type { PropostaKanban } from './types';

interface ItemComposicao {
  nome?: string;
  qty?: number;
}

function resumoComposicao(composicao: string): string {
  try {
    const itens = JSON.parse(composicao) as ItemComposicao[];
    if (!Array.isArray(itens)) return '';
    return itens
      .filter((i) => (i.qty ?? 0) > 0)
      .map((i) => `${i.qty}× ${i.nome ?? 'cargo'}`)
      .join(' + ');
  } catch {
    return '';
  }
}

interface KanbanCardProps {
  proposta: PropostaKanban;
  passaporte: Passaporte;
  /** Texto de "falta evidência" devolvido pelo gate server-side (faixa vermelha inline). */
  faltaEvidencia: string | null;
  avancando: boolean;
  onAvancar: () => void;
  onAbrirGate: () => void;
}

export function KanbanCard({
  proposta: p,
  passaporte,
  faltaEvidencia,
  avancando,
  onAvancar,
  onAbrirGate,
}: KanbanCardProps) {
  const locked = p.status === 'aguardando_alcada';
  const elegivel = !locked && p.status !== 'enviada' && p.status !== 'devolvida';
  const comp = resumoComposicao(p.composicao);

  return (
    <div
      className={cn(
        'flex flex-col gap-[9px] rounded-[13px] border bg-white px-[14px] py-[13px]',
        locked ? 'border-al-red/45 bg-al-red-soft/20' : 'border-al-border',
      )}
    >
      <div className="text-[14px] font-black leading-[1.3] text-al-ink">{p.cliente}</div>

      <div className="text-[12px] font-bold leading-[1.45] text-al-muted">
        {fmtBRL(p.valorFinal)}/mês · desvio {fmtPct(p.descontoPct / 10)}
        {p.motivoDesvio ? ` · ${p.motivoDesvio}` : ''}
        {comp && <span className="mt-[2px] block text-al-faint">{comp}</span>}
      </div>

      <PassaportePills passaporte={passaporte} />

      {locked && (
        <div className="flex items-start gap-2 rounded-[9px] border border-al-red/30 bg-al-red-soft px-[10px] py-[7px] text-[11.5px] font-extrabold leading-[1.35] text-al-red-ink">
          <span>🔒</span>
          <span>
            <b>aguardando decisão da alçada</b> — o card fica travado até o gestor decidir no
            painel dele.
          </span>
        </div>
      )}

      {faltaEvidencia && (
        <button
          type="button"
          onClick={onAbrirGate}
          className="flex items-start gap-2 rounded-[9px] border border-al-red/40 bg-al-red-soft px-[10px] py-[7px] text-left text-[11.5px] font-extrabold leading-[1.35] text-al-red transition-colors hover:bg-al-red/10"
        >
          <span>⛔</span>
          <span>
            falta evidência: <b>{faltaEvidencia}</b> — tocar para ver o passaporte
          </span>
        </button>
      )}

      <div className="flex items-center gap-[6px]">
        <span className="flex h-6 w-6 items-center justify-center rounded-[8px] bg-al-teal-soft text-[10px] font-black text-al-teal-ink">
          {p.vendedorIniciais || '—'}
        </span>
        <span className="text-[11px] font-bold text-al-faint">{p.vendedorNome || 'sem dono'}</span>
        {elegivel && (
          <button
            type="button"
            disabled={avancando}
            onClick={onAvancar}
            className="ml-auto rounded-full bg-al-green px-[13px] py-[7px] text-[11.5px] font-black text-white transition-colors hover:bg-al-green-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {avancando ? 'verificando…' : 'Avançar →'}
          </button>
        )}
        {p.status === 'enviada' && (
          <span className="ml-auto text-[11px] font-extrabold text-al-teal-ink">
            ✓ enviada ao cliente
          </span>
        )}
      </div>
    </div>
  );
}
