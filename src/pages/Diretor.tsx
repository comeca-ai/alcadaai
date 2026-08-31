import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ShieldAlert, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/providers/trpc';
import { usePapel } from '@/lib/papel';
import { desvioPct, fmtBRL, fmtPct, tempoRelativo } from '@/lib/api';
import KpiCard from '@/components/minhas/KpiCard';
import Pill from '@/components/minhas/Pill';
import CardAlcada from '@/components/diretor/CardAlcada';
import LeaderboardDesvio from '@/components/diretor/LeaderboardDesvio';

/**
 * /diretor — Painel do diretor (réplica do wireframe).
 * Fila de alçadas (aprovar/devolver), KPIs de governança e desvio por vendedor.
 * Só faz sentido com papel 'diretor' — vendedor vê um aviso amigável.
 */
export default function Diretor() {
  const { papel, iniciais } = usePapel();
  const ehDiretor = papel === 'diretor';

  const utils = trpc.useUtils();
  const pendentesQ = trpc.alcada.pendentes.useQuery(undefined, {
    refetchInterval: 5000,
    retry: 1,
    enabled: ehDiretor,
  });
  const propostasQ = trpc.propostas.list.useQuery(undefined, {
    refetchInterval: 5000,
    retry: 1,
    enabled: ehDiretor,
  });

  const decidir = trpc.alcada.decidir.useMutation({
    onSuccess: (_res, vars) => {
      toast.success(vars.decisao === 'aprovada' ? 'Alçada aprovada ✓' : 'Alçada devolvida', {
        description:
          vars.decisao === 'aprovada'
            ? 'Proposta desbloqueada — o vendedor já pode avançar o card.'
            : 'O pedido voltou para o vendedor revisar o valor.',
      });
      utils.alcada.pendentes.invalidate();
      utils.propostas.list.invalidate();
    },
    onError: (e) => toast.error('Não foi possível decidir', { description: e.message }),
  });

  const pendentes = pendentesQ.data ?? [];
  const propostas = propostasQ.data ?? [];

  /* ── KPIs de governança ── */
  const maisAntigo =
    pendentes.length > 0
      ? pendentes.reduce((a, b) => (new Date(a.criadoEm) < new Date(b.criadoEm) ? a : b))
      : undefined;
  const comPreco = propostas.filter((p) => p.precoIA > 0);
  const desvioTime =
    comPreco.length > 0 ? comPreco.reduce((s, p) => s + desvioPct(p), 0) / comPreco.length : 0;
  const margemRisco = pendentes
    .filter((a) => a.proposta.zona !== 'verde')
    .reduce((s, a) => s + (a.proposta.descontoPct / 1000) * a.proposta.valorFinal, 0);
  const hoje = new Date().toDateString();
  const propostasHoje = propostas.filter((p) => new Date(p.criadoEm).toDateString() === hoje).length;

  return (
    <div className="flex flex-col gap-[18px]">
      {/* topbar */}
      <div className="flex items-center gap-3">
        <div className="font-display text-[22px] font-black tracking-[-0.01em]">
          Painel do diretor
          <span className="mt-[2px] block font-sans text-[13px] font-bold text-al-muted">
            governança comercial · Vetta Facilities · agosto de 2026
          </span>
        </div>
        {ehDiretor && (
          <span className="ml-auto">
            <Pill tom={pendentes.length > 0 ? 'red' : 'green'}>
              {pendentes.length > 0
                ? `${pendentes.length} ${pendentes.length === 1 ? 'pedido' : 'pedidos'} de alçada`
                : 'fila de alçadas limpa'}
            </Pill>
          </span>
        )}
        <div
          className={
            ehDiretor
              ? 'ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-al-dark text-[15px] font-black text-white'
              : 'ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-al-green text-[15px] font-black text-white'
          }
        >
          {iniciais}
        </div>
      </div>

      {!ehDiretor ? (
        /* ── Aviso para papel vendedor ── */
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 rounded-[18px] border border-al-border bg-white px-[22px] py-12 text-center"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-al-amber-soft text-al-amber-ink">
            <ShieldAlert className="h-6 w-6" strokeWidth={2.5} />
          </div>
          <div className="text-[16px] font-black">Área do diretor — troque o papel na sidebar</div>
          <p className="max-w-[520px] text-[13.5px] font-bold leading-[1.6] text-al-muted">
            Esta visão mostra a fila de pedidos de alçada e a governança do time. No seletor do
            rodapé da sidebar, troque de <b>NJ Vendedor</b> para <b>DC Diretor</b> para aprovar ou
            devolver os pedidos.
          </p>
        </motion.div>
      ) : (
        <>
          {pendentesQ.isError && (
            <div className="flex items-center gap-[10px] rounded-xl border border-al-amber/40 bg-al-amber-soft px-[15px] py-3 text-[13px] font-extrabold text-al-amber-ink">
              <WifiOff className="h-[18px] w-[18px] shrink-0" />
              Sem conexão com o servidor — os dados de governança aparecem assim que a API voltar.
            </div>
          )}

          {/* KPIs */}
          <div className="grid grid-cols-4 gap-[14px] max-[1150px]:grid-cols-2">
            <KpiCard
              label="Aguardando sua alçada"
              value={String(pendentes.length)}
              delta={maisAntigo ? `mais antigo ${tempoRelativo(maisAntigo.criadoEm)}` : 'fila limpa ✓'}
              tom={pendentes.length > 0 ? 'warn' : 'up'}
            />
            <KpiCard
              label="Desvio médio do time"
              value={fmtPct(desvioTime)}
              delta="meta: até −6%"
              tom={desvioTime <= 6 ? 'flat' : 'warn'}
            />
            <KpiCard
              label="Margem em risco (mês)"
              value={fmtBRL(margemRisco)}
              delta="soma dos desvios amarelos+vermelhos"
              tom={margemRisco > 0 ? 'warn' : 'flat'}
            />
            <KpiCard
              label="Propostas hoje"
              value={String(propostasHoje)}
              delta="Vetta Facilities"
            />
          </div>

          {/* Fila de alçadas */}
          <section className="rounded-[18px] border border-al-border bg-white px-[22px] py-5">
            <div className="mb-[14px] flex items-center gap-[9px] text-[15.5px] font-black">
              Pedidos de alçada
              <span className="rounded-full border border-al-border bg-al-cream px-[10px] py-[3px] text-[11px] font-black text-al-muted">
                aprovar ou devolver
              </span>
            </div>

            {pendentesQ.isLoading ? (
              <div className="flex animate-pulse flex-col gap-[14px]">
                {[0, 1].map((i) => (
                  <div key={i} className="flex flex-col gap-3 rounded-2xl border border-al-border px-5 py-[18px]">
                    <div className="flex items-center gap-3">
                      <div className="h-[38px] w-[38px] rounded-xl bg-al-rail" />
                      <div className="h-4 w-64 rounded bg-al-rail" />
                    </div>
                    <div className="h-[74px] rounded-xl bg-al-rail" />
                    <div className="h-10 rounded-full bg-al-rail" />
                  </div>
                ))}
              </div>
            ) : pendentes.length === 0 ? (
              <div className="flex items-center gap-[10px] rounded-xl border border-al-teal/30 bg-al-teal-soft px-[15px] py-4 text-[13.5px] font-extrabold text-al-teal-ink">
                <CheckCircle2 className="h-[18px] w-[18px] shrink-0" />
                Fila limpa — nenhum pedido de alçada pendente agora.
              </div>
            ) : (
              <div className="flex flex-col gap-[14px]">
                <AnimatePresence mode="popLayout">
                  {pendentes.map((a) => (
                    <CardAlcada
                      key={a.id}
                      alcada={a}
                      decidindo={decidir.isPending && decidir.variables?.alcadaId === a.id}
                      onDecidir={(decisao) =>
                        decidir.mutate({
                          alcadaId: a.id,
                          decisao,
                          decididoPor: 'Diretor Comercial',
                        })
                      }
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>

          {/* Leaderboard */}
          {propostasQ.isLoading ? (
            <div className="animate-pulse rounded-[18px] border border-al-border bg-white px-[22px] py-5">
              <div className="mb-4 h-4 w-44 rounded bg-al-rail" />
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3 border-b border-al-rail py-[11px] last:border-b-0">
                  <div className="h-4 w-32 rounded bg-al-rail" />
                  <div className="h-2 flex-[1.4] rounded-full bg-al-rail" />
                  <div className="h-4 w-[52px] rounded bg-al-rail" />
                </div>
              ))}
            </div>
          ) : (
            <LeaderboardDesvio propostas={propostas} />
          )}
        </>
      )}
    </div>
  );
}
