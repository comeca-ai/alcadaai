import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { desvioPct, fmtBRL, fmtPct, resumoComposicao, STATUS_META, zonaUi } from '@/lib/api';
import type { PropostaRow, ZonaAlcada } from '@/lib/api';
import Pill from '@/components/minhas/Pill';

const DOT: Record<ZonaAlcada, string> = {
  verde: 'bg-al-teal',
  ambar: 'bg-al-amber',
  vermelha: 'bg-al-red',
};

const TH =
  'border-b border-al-border px-[10px] py-2 text-left text-[11.5px] font-black uppercase tracking-[.08em] text-al-faint';
const TD = 'border-b border-al-rail px-[10px] py-3 text-[14px] font-bold align-middle';

/**
 * Tabela "Pipeline" do /minhas — réplica do wireframe:
 * cliente, composição resumida, valor, desvio (semáforo dot + %), status (pill), motivo.
 */
export default function TabelaPropostas({ propostas }: { propostas: PropostaRow[] }) {
  return (
    <section className="rounded-[18px] border border-al-border bg-white px-[22px] py-5">
      <div className="mb-[14px] flex items-center gap-[9px] text-[15.5px] font-black">
        Pipeline
        <span className="rounded-full border border-al-border bg-al-cream px-[10px] py-[3px] text-[11px] font-black text-al-muted">
          semáforo = desvio vs. preço IA
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={TH}>Cliente</th>
              <th className={TH}>Composição</th>
              <th className={TH}>Valor</th>
              <th className={TH}>Desvio</th>
              <th className={TH}>Status</th>
              <th className={TH}>Motivo</th>
            </tr>
          </thead>
          <tbody>
            {propostas.length === 0 && (
              <tr>
                <td colSpan={6} className={cn(TD, 'border-b-0 py-8 text-center text-al-faint')}>
                  Nenhuma proposta ainda — crie a primeira em “Nova proposta”.
                </td>
              </tr>
            )}
            {propostas.map((p, idx) => {
              const zona = zonaUi(p.zona);
              const meta = STATUS_META[p.status];
              return (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.25 }}
                  className="last:[&>td]:border-b-0"
                >
                  <td className={cn(TD, 'font-black')}>{p.cliente}</td>
                  <td className={cn(TD, 'max-w-[240px] truncate text-[13px] text-al-muted')} title={resumoComposicao(p.composicao)}>
                    {resumoComposicao(p.composicao)}
                  </td>
                  <td className={cn(TD, 'whitespace-nowrap font-black [font-variant-numeric:tabular-nums]')}>
                    {p.valorFinal > 0 ? fmtBRL(p.valorFinal) : '—'}
                  </td>
                  <td className={cn(TD, 'whitespace-nowrap [font-variant-numeric:tabular-nums]')}>
                    <span className={cn('mr-2 inline-block h-[10px] w-[10px] rounded-full align-middle', DOT[zona])} />
                    {p.precoIA > 0 ? fmtPct(desvioPct(p)) : '—'}
                  </td>
                  <td className={TD}>
                    <Pill tom={meta.tom}>{meta.rotulo}</Pill>
                  </td>
                  <td className={cn(TD, 'text-[13px] text-al-muted')}>{p.motivoDesvio || '—'}</td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
