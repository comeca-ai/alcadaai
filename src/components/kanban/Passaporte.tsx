import { cn } from '@/lib/utils';
import type { PropostaKanban } from './types';

/** Estado de cada evidência do passaporte: done (teal) / wait (cinza) / miss (vermelho). */
export type EstadoEvidencia = 'done' | 'wait' | 'miss';

export interface Passaporte {
  dados: EstadoEvidencia;
  preco: EstadoEvidencia;
  alcada: EstadoEvidencia;
  selo: EstadoEvidencia;
}

export const EVIDENCIAS_ORDEM = [
  { key: 'dados', rotulo: 'dados', emoji: '📋' },
  { key: 'preco', rotulo: 'preço', emoji: '💲' },
  { key: 'alcada', rotulo: 'alçada', emoji: '🔓' },
  { key: 'selo', rotulo: 'selo', emoji: '📄' },
] as const;

const ESTILO_PILL: Record<EstadoEvidencia, string> = {
  done: 'bg-al-teal-soft text-al-teal-ink',
  wait: 'border border-al-border bg-al-cream text-al-faint',
  miss: 'bg-al-red-soft text-al-red',
};

/** As 4 evidências do passaporte em pills — você vê de longe o que falta em cada proposta. */
export function PassaportePills({ passaporte }: { passaporte: Passaporte }) {
  return (
    <div className="flex flex-wrap items-center gap-1 pt-[2px]">
      {EVIDENCIAS_ORDEM.map((ev, i) => {
        const estado = passaporte[ev.key];
        const marca = estado === 'done' ? '✓' : estado === 'miss' ? '✗' : ev.emoji;
        return (
          <span key={ev.key} className="flex items-center gap-1">
            {i > 0 && <span className="text-[9px] text-al-faint">→</span>}
            <span
              className={cn(
                'whitespace-nowrap rounded-full px-[7px] py-[3px] text-[10px] font-black',
                ESTILO_PILL[estado],
              )}
            >
              {marca} {ev.rotulo}
            </span>
          </span>
        );
      })}
    </div>
  );
}

const STATUS_POS_ALCADA = ['revisao_alcada', 'aprovada', 'doc_selado', 'enviada'];

/**
 * Deriva o passaporte de evidências dos dados da proposta (mesma lógica do gate do servidor):
 * - dados: cliente + escopo + composição não vazia
 * - preço: precoIA > 0
 * - alçada: zona verde OU já passou do gate (revisão/alçada em diante); miss se aguardando decisão
 * - selo: status doc_selado/enviada
 */
export function passaporteDe(p: PropostaKanban): Passaporte {
  let itens: unknown[] = [];
  try {
    const parsed = JSON.parse(p.composicao) as unknown;
    if (Array.isArray(parsed)) itens = parsed;
  } catch {
    itens = [];
  }

  const dadosOk = Boolean(p.cliente) && Boolean(p.escopo) && itens.length > 0;
  const precoOk = p.precoIA > 0;
  const alcadaOk = p.zona === 'verde' || STATUS_POS_ALCADA.includes(p.status);
  const seloOk = p.status === 'doc_selado' || p.status === 'enviada';

  return {
    dados: dadosOk ? 'done' : 'miss',
    preco: precoOk ? 'done' : 'wait',
    alcada: alcadaOk ? 'done' : p.status === 'aguardando_alcada' ? 'miss' : 'wait',
    selo: seloOk ? 'done' : 'wait',
  };
}
