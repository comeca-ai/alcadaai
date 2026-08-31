import { WifiOff } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import { usePapel } from '@/lib/papel';
import { desvioPct, fmtBRL, fmtPct, PROPOSTAS_FALLBACK } from '@/lib/api';
import KpiCard from '@/components/minhas/KpiCard';
import TabelaPropostas from '@/components/minhas/TabelaPropostas';
import MinhasSkeleton from '@/components/minhas/MinhasSkeleton';

const VENDEDOR_ID = 1; // Nizan Jhon (v0: papel único de vendedor)

/**
 * /minhas — Minhas propostas (réplica do wireframe).
 * KPIs do mês + tabela do pipeline com semáforo de desvio.
 * Dados: trpc.propostas.list (refetch 5s); skeleton no loading; fallback local se erro.
 */
export default function Minhas() {
  const { nome, iniciais } = usePapel();
  const q = trpc.propostas.list.useQuery(
    { vendedorId: VENDEDOR_ID },
    { refetchInterval: 5000, retry: 1 },
  );

  const propostas = q.data ?? (q.isError ? PROPOSTAS_FALLBACK : undefined);

  /* ── KPIs do mês (calculados das propostas) ── */
  const comPreco = (propostas ?? []).filter((p) => p.precoIA > 0);
  const desvioMedio =
    comPreco.length > 0 ? comPreco.reduce((s, p) => s + desvioPct(p), 0) / comPreco.length : 0;
  const ganhas = (propostas ?? []).filter((p) => p.status === 'enviada');
  const totalGanho = ganhas.reduce((s, p) => s + p.valorFinal, 0);
  const aguardando = (propostas ?? []).filter((p) => p.status === 'aguardando_alcada');
  const selados = (propostas ?? []).filter(
    (p) => p.status === 'doc_selado' || p.status === 'enviada',
  ).length;

  return (
    <div className="flex flex-col gap-[18px]">
      {/* topbar */}
      <div className="flex items-center gap-3">
        <div className="font-display text-[22px] font-black tracking-[-0.01em]">
          Minhas propostas
          <span className="mt-[2px] block font-sans text-[13px] font-bold text-al-muted">
            {nome} · agosto de 2026
          </span>
        </div>
        <div className="ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-al-green text-[15px] font-black text-white">
          {iniciais}
        </div>
      </div>

      {q.isError && (
        <div className="flex items-center gap-[10px] rounded-xl border border-al-amber/40 bg-al-amber-soft px-[15px] py-3 text-[13px] font-extrabold text-al-amber-ink">
          <WifiOff className="h-[18px] w-[18px] shrink-0" />
          Sem conexão com o servidor — mostrando os dados de exemplo da Vetta Facilities.
        </div>
      )}

      {!propostas ? (
        <MinhasSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-[14px] max-[1150px]:grid-cols-2">
            <KpiCard
              label="Desvio médio do mês"
              value={fmtPct(desvioMedio)}
              delta={desvioMedio <= 5 ? 'dentro da sua alçada ✓' : 'acima da sua alçada de 5%'}
              tom={desvioMedio <= 5 ? 'up' : 'warn'}
            />
            <KpiCard
              label="Propostas ganhas"
              value={String(ganhas.length)}
              delta={ganhas.length > 0 ? `${fmtBRL(totalGanho)}/mês fechados` : 'nenhuma enviada ainda'}
              tom={ganhas.length > 0 ? 'up' : 'flat'}
            />
            <KpiCard
              label="Aguardando alçada"
              value={String(aguardando.length)}
              delta={
                aguardando.length > 0
                  ? `${aguardando[0]?.cliente ?? ''} · aguardando decisão`
                  : 'fila limpa ✓'
              }
              tom={aguardando.length > 0 ? 'warn' : 'up'}
            />
            <KpiCard
              label="Registradas"
              value={String(propostas.length)}
              delta={`${selados} docs selados`}
            />
          </div>

          <TabelaPropostas propostas={propostas} />
        </>
      )}
    </div>
  );
}
