import { motion } from 'framer-motion';
import { Check, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { desvioPct, fmtBRL, fmtPct, tempoRelativo, zonaUi } from '@/lib/api';
import type { AlcadaPendente } from '@/lib/api';
import Pill from '@/components/minhas/Pill';

/**
 * Card de pedido de alçada (réplica do wireframe "ap-card"):
 * solicitante (avatar iniciais), cliente, números Preço IA → Pedido,
 * justificativa em quote, pills de contexto e ações Aprovar / Devolver.
 */
export default function CardAlcada({
  alcada,
  decidindo,
  onDecidir,
}: {
  alcada: AlcadaPendente;
  decidindo: boolean;
  onDecidir: (decisao: 'aprovada' | 'devolvida') => void;
}) {
  const p = alcada.proposta;
  const zona = zonaUi(p.zona);
  const abaixoDoPiso = p.valorFinal < p.piso;
  const margemResultante =
    p.valorFinal > 0 ? Math.round(((p.valorFinal - p.custoTotal) / p.valorFinal) * 100) : 0;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, height: 0, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, overflow: 'hidden' }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="flex flex-col gap-3 rounded-2xl border border-al-border bg-white px-5 py-[18px]"
    >
      {/* topo: solicitante */}
      <div className="flex items-center gap-3">
        <div className="flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-al-teal-soft text-[14px] font-black text-al-green">
          {alcada.vendedorIniciais || '—'}
        </div>
        <div className="flex-1">
          <div className="text-[14.5px] font-black">
            {alcada.vendedorNome} · {p.cliente}
          </div>
          <div className="text-[12.5px] font-bold text-al-faint">
            {tempoRelativo(alcada.criadoEm)} · motivo: {alcada.motivo || '—'}
          </div>
        </div>
        <Pill tom={zona === 'vermelha' ? 'red' : 'amber'}>
          {zona === 'vermelha'
            ? 'zona vermelha'
            : alcada.nivel === 'gerente'
              ? 'zona amarela · gerente escalou'
              : 'zona amarela'}
        </Pill>
      </div>

      {/* números: Preço IA → Pedido */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-[10px] rounded-xl bg-al-cream px-4 py-3">
        <div className="text-center">
          <div className="text-[10.5px] font-black uppercase tracking-[.08em] text-al-faint">
            Preço IA
          </div>
          <div className="text-[22px] font-black [font-variant-numeric:tabular-nums]">
            {fmtBRL(p.precoIA)}
          </div>
        </div>
        <div className="text-[18px] text-al-faint">→</div>
        <div className="text-center">
          <div className="text-[10.5px] font-black uppercase tracking-[.08em] text-al-faint">
            Pedido
          </div>
          <div
            className={cn(
              'text-[22px] font-black [font-variant-numeric:tabular-nums]',
              zona === 'vermelha' ? 'text-al-red' : 'text-al-amber-ink',
            )}
          >
            {fmtBRL(p.valorFinal)}
          </div>
        </div>
      </div>

      {/* justificativa em quote */}
      <blockquote className="rounded-r-[10px] border-l-[3px] border-al-green bg-white px-[13px] py-[9px] text-[13px] font-bold leading-[1.55] text-al-muted">
        “{alcada.justificativa || alcada.motivo}”
      </blockquote>

      {/* pills de contexto */}
      <div className="flex flex-wrap gap-[10px]">
        <Pill tom="gray">desvio {fmtPct(desvioPct(p))}</Pill>
        <Pill tom={zona === 'vermelha' ? 'red' : 'amber'}>
          zona {zona === 'vermelha' ? 'vermelha' : 'amarela'} · alçada {alcada.nivel}
        </Pill>
        {p.valorFinal > 0 && <Pill tom="gray">margem resultante {margemResultante}%</Pill>}
        {abaixoDoPiso && <Pill tom="amber">abaixo do piso {fmtBRL(p.piso)}</Pill>}
      </div>

      {/* ações */}
      <div className="flex gap-[10px]">
        <button
          type="button"
          disabled={decidindo}
          onClick={() => onDecidir('aprovada')}
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-al-teal px-6 py-3 font-sans text-[14px] font-black text-white transition-colors hover:bg-al-teal-ink disabled:cursor-wait disabled:opacity-60"
        >
          <Check className="h-4 w-4" strokeWidth={3} />
          Aprovar essa alçada
        </button>
        <button
          type="button"
          disabled={decidindo}
          onClick={() => onDecidir('devolvida')}
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border-[1.5px] border-al-border bg-white px-6 py-3 font-sans text-[14px] font-black text-al-ink transition-colors hover:border-al-red hover:text-al-red disabled:cursor-wait disabled:opacity-60"
        >
          <Undo2 className="h-4 w-4" strokeWidth={2.5} />
          Devolver com observação
        </button>
      </div>
    </motion.article>
  );
}
