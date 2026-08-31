import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { desvioPct, fmtPct } from '@/lib/api';
import type { PropostaRow } from '@/lib/api';

/**
 * Leaderboard "Desvio por vendedor" (réplica do wireframe lb-row):
 * barra por desvio médio, cor pelo semáforo (≤5% teal, ≤12% âmbar, senão vermelho).
 */
export default function LeaderboardDesvio({ propostas }: { propostas: PropostaRow[] }) {
  const porVendedor = new Map<string, { nome: string; desvios: number[] }>();
  for (const p of propostas) {
    if (p.precoIA <= 0) continue;
    const chave = p.vendedorNome || `Vendedor #${p.vendedorId}`;
    const entry = porVendedor.get(chave) ?? { nome: chave, desvios: [] };
    entry.desvios.push(desvioPct(p));
    porVendedor.set(chave, entry);
  }

  const linhas = [...porVendedor.values()]
    .map((v) => ({
      nome: v.nome,
      medio: v.desvios.reduce((s, d) => s + d, 0) / v.desvios.length,
    }))
    .sort((a, b) => a.medio - b.medio);

  const pior = linhas.length > 0 ? linhas[linhas.length - 1] : undefined;

  return (
    <section className="rounded-[18px] border border-al-border bg-white px-[22px] py-5">
      <div className="mb-[14px] flex items-center gap-[9px] text-[15.5px] font-black">
        Desvio por vendedor
        <span className="rounded-full border border-al-border bg-al-cream px-[10px] py-[3px] text-[11px] font-black text-al-muted">
          agosto
        </span>
      </div>

      {linhas.length === 0 && (
        <div className="py-4 text-[13px] font-bold text-al-faint">
          Nenhuma proposta com preço da IA neste mês.
        </div>
      )}

      {linhas.map((l, idx) => {
        const cor = l.medio <= 5 ? 'bg-al-teal' : l.medio <= 12 ? 'bg-al-amber' : 'bg-al-red';
        return (
          <div
            key={l.nome}
            className="flex items-center gap-3 border-b border-al-rail py-[11px] text-[14px] font-extrabold last:border-b-0"
          >
            <span className="flex-1">{l.nome}</span>
            <span className="h-2 flex-[1.4] overflow-hidden rounded-full bg-al-rail">
              <motion.span
                className={cn('block h-full rounded-full', cor)}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(Math.max(l.medio, 0) * 10, 100)}%` }}
                transition={{ delay: 0.1 + idx * 0.06, duration: 0.5, ease: 'easeOut' }}
              />
            </span>
            <span className="w-[52px] text-right text-[13px] font-black [font-variant-numeric:tabular-nums]">
              {fmtPct(l.medio)}
            </span>
          </div>
        );
      })}

      {pior && (
        <div className="mt-[10px] text-[12.5px] font-bold text-al-faint">
          {pior.medio > 6
            ? `${pior.nome} está acima da banda de −6% (${fmtPct(pior.medio)}) — padrão pra conversar no 1:1.`
            : 'Time dentro da banda de −6% neste mês.'}
        </div>
      )}
    </section>
  );
}
