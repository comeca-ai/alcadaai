import { cn } from '@/lib/utils';
import { EVIDENCIAS_ORDEM } from './Passaporte';
import type { Passaporte } from './Passaporte';
import type { PropostaKanban } from './types';

const DESCRICAO: Record<(typeof EVIDENCIAS_ORDEM)[number]['key'], { titulo: string; detalhe: string }> = {
  dados: {
    titulo: 'Ficha de dados completa',
    detalhe: 'cliente, escopo e composição do time documentados',
  },
  preco: {
    titulo: 'Preço da IA registrado',
    detalhe: 'calculado a partir do custo dos cargos + margem da casa',
  },
  alcada: {
    titulo: 'Alçada aprovada',
    detalhe: 'obrigatória quando o desvio passa da faixa do vendedor',
  },
  selo: {
    titulo: 'Documento selado',
    detalhe: 'versão final com hash de integridade (three-way match)',
  },
};

interface GateModalProps {
  proposta: PropostaKanban;
  passaporte: Passaporte;
  faltaEvidencia: string;
  onClose: () => void;
}

/**
 * Modal do gate de evidência (fundo escuro, tokens al-*): mostra as 4 evidências
 * do passaporte e qual está faltando para o card atravessar de fase.
 */
export function GateModal({ proposta, passaporte, faltaEvidencia, onClose }: GateModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex w-full max-w-[540px] flex-col gap-4 rounded-[20px] bg-al-dark px-[28px] py-[26px] text-al-cream shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Gate de evidência"
      >
        <div>
          <div className="text-[19px] font-black tracking-[-0.01em]">
            ⛔ Mover “{proposta.cliente}” de fase
          </div>
          <div className="mt-1 text-[13.5px] font-bold leading-[1.5] text-al-sand">
            Toda mudança de fase exige evidência. A Alçada confere o passaporte do card antes de
            deixar atravessar:
          </div>
        </div>

        {EVIDENCIAS_ORDEM.map((ev) => {
          const estado = passaporte[ev.key];
          const ok = estado === 'done';
          const miss = estado === 'miss';
          return (
            <div
              key={ev.key}
              className={cn(
                'flex items-center gap-[13px] rounded-[12px] border px-[15px] py-[12px]',
                miss
                  ? 'border-al-red/50 bg-al-red/10'
                  : 'border-white/10 bg-white/5',
              )}
            >
              <div
                className={cn(
                  'flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-[9px] text-[14px] font-black',
                  ok ? 'bg-al-teal text-white' : miss ? 'bg-al-red text-white' : 'bg-white/10 text-al-sand',
                )}
              >
                {ok ? '✓' : miss ? '✗' : ev.emoji}
              </div>
              <div className="flex-1 text-[13.5px] font-extrabold">
                {DESCRICAO[ev.key].titulo}
                <span className="mt-[1px] block text-[11.5px] font-bold text-al-sand">
                  {DESCRICAO[ev.key].detalhe}
                </span>
              </div>
              <span
                className={cn(
                  'whitespace-nowrap text-[11px] font-black',
                  ok ? 'text-al-mint' : miss ? 'text-[#FF9D97]' : 'text-al-sand',
                )}
              >
                {ok ? 'evidência ok' : miss ? 'falta evidência' : 'aguardando fase'}
              </span>
            </div>
          );
        })}

        <div className="mt-[2px] flex items-center gap-[10px]">
          <div className="flex-1 text-[12px] font-extrabold leading-[1.45] text-al-sand">
            O card <b className="text-al-cream">não atravessa</b> enquanto “{faltaEvidencia}” não
            existir. Quando a evidência aparecer, o card desbloqueia sozinho. Não é chatice — é a
            margem da empresa.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-al-green px-[16px] py-[10px] text-[12.5px] font-black text-white transition-colors hover:bg-al-green-hover"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}
