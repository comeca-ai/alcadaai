import { useMemo, useState } from 'react';
import { trpc } from '@/providers/trpc';
import { usePapel } from '@/lib/papel';
import { cn } from '@/lib/utils';
import { GateModal } from '@/components/kanban/GateModal';
import { KanbanCard } from '@/components/kanban/KanbanCard';
import { passaporteDe } from '@/components/kanban/Passaporte';
import { PROPOSTAS_EXEMPLO } from '@/components/kanban/exemplos';
import type { PropostaKanban } from '@/components/kanban/types';

type TomColuna = 'normal' | 'gate' | 'send';

interface ColunaDef {
  id: string;
  titulo: string;
  regra: string;
  tom: TomColuna;
  match: string[];
}

const COLUNAS: ColunaDef[] = [
  {
    id: 'dados',
    titulo: '📥 Dados',
    regra: 'Intake: cliente, escopo, documentos. Sai daqui quando os dados estão completos.',
    tom: 'normal',
    match: ['dados'],
  },
  {
    id: 'elaborando',
    titulo: '✍️ Elaborando',
    regra: 'Preço da IA + composição do time + revisão interna do próprio time.',
    tom: 'normal',
    match: ['elaborando'],
  },
  {
    id: 'gate',
    titulo: '🔒 Revisão & Alçada',
    regra: 'Gate duro: desvio sem alçada = card não anda. Não é combinado, é bloqueio.',
    tom: 'gate',
    match: ['revisao_alcada', 'aguardando_alcada'],
  },
  {
    id: 'enviar',
    titulo: '📤 Enviar',
    regra: 'Só entra com documento selado (three-way match). Daqui sai direto pro cliente.',
    tom: 'send',
    match: ['aprovada', 'doc_selado', 'enviada'],
  },
];

const ESTILO_HEAD: Record<TomColuna, string> = {
  normal: 'border-al-border text-al-ink',
  gate: 'border-al-red text-al-red',
  send: 'border-al-teal text-al-teal',
};

function SkeletonBoard() {
  return (
    <div className="grid grid-cols-1 items-start gap-[14px] md:grid-cols-2 xl:grid-cols-4">
      {COLUNAS.map((c) => (
        <div
          key={c.id}
          className="flex min-h-[300px] flex-col gap-[10px] rounded-[16px] border border-al-border bg-[#F5EDDE] p-[12px]"
        >
          <div className="h-4 w-2/3 animate-pulse rounded bg-al-border/70" />
          <div className="h-24 animate-pulse rounded-[13px] bg-white/80" />
          <div className="h-24 animate-pulse rounded-[13px] bg-white/60" />
        </div>
      ))}
    </div>
  );
}

export default function Kanban() {
  const { iniciais } = usePapel();
  const utils = trpc.useUtils();

  const lista = trpc.propostas.list.useQuery(undefined, { refetchInterval: 5000 });
  const usandoExemplo = lista.isError;
  const propostas = useMemo<PropostaKanban[]>(
    () => lista.data ?? (usandoExemplo ? PROPOSTAS_EXEMPLO : []),
    [lista.data, usandoExemplo],
  );

  // falta de evidência devolvida pelo gate server-side, por proposta
  const [faltaPorId, setFaltaPorId] = useState<Record<number, string>>({});
  const [gateAbertoId, setGateAbertoId] = useState<number | null>(null);

  const avancar = trpc.kanban.avancar.useMutation({
    onSuccess: (res, vars) => {
      const r = res as { ok: boolean; faltaEvidencia?: string };
      if (r.ok) {
        setFaltaPorId((m) => {
          if (!(vars.propostaId in m)) return m;
          const n = { ...m };
          delete n[vars.propostaId];
          return n;
        });
        void utils.propostas.list.invalidate();
      } else if (r.faltaEvidencia) {
        // gate server-side: nunca mover no client — registra e mostra inline
        setFaltaPorId((m) => ({ ...m, [vars.propostaId]: r.faltaEvidencia ?? '' }));
        setGateAbertoId(vars.propostaId);
      }
    },
    onError: (err, vars) => {
      setFaltaPorId((m) => ({ ...m, [vars.propostaId]: err.message }));
    },
  });

  const ativas = useMemo(() => propostas.filter((p) => p.status !== 'devolvida'), [propostas]);
  const porColuna = useMemo(
    () =>
      COLUNAS.map((c) => ({
        def: c,
        cards: ativas.filter((p) => c.match.includes(p.status)),
      })),
    [ativas],
  );

  const propostaGate = gateAbertoId != null ? ativas.find((p) => p.id === gateAbertoId) : undefined;

  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex items-center gap-3">
        <div className="font-display text-[22px] font-black tracking-[-0.01em]">
          Kanban da proposta
          <span className="mt-[2px] block font-sans text-[13px] font-bold text-al-muted">
            quando mais de um time trabalha na mesma proposta — o trabalho fica visível
          </span>
        </div>
        <span className="ml-auto inline-flex items-center whitespace-nowrap rounded-full border border-al-border bg-white px-[15px] py-[9px] text-[12.5px] font-black text-al-muted">
          {lista.isLoading ? '…' : `${ativas.length} cards ativos`}
        </span>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-al-green text-[15px] font-black text-white">
          {iniciais}
        </div>
      </div>

      {usandoExemplo && (
        <div className="rounded-[12px] border border-al-amber/40 bg-al-amber-soft px-[15px] py-[9px] text-[12.5px] font-extrabold text-al-amber-ink">
          ⚠ sem conexão com o servidor — mostrando dados de exemplo. O avanço real volta assim que
          a API responder.
        </div>
      )}

      {lista.isLoading ? (
        <SkeletonBoard />
      ) : (
        <div className="grid grid-cols-1 items-start gap-[14px] md:grid-cols-2 xl:grid-cols-4">
          {porColuna.map(({ def, cards }) => (
            <div
              key={def.id}
              className="flex min-h-[300px] flex-col gap-[10px] rounded-[16px] border border-al-border bg-[#F5EDDE] p-[12px]"
            >
              <div
                className={cn(
                  'flex items-center gap-2 border-b-2 px-[6px] pb-[8px] pt-[2px] text-[13px] font-black',
                  ESTILO_HEAD[def.tom],
                )}
              >
                {def.titulo}
                <span className="ml-auto rounded-full border border-al-border bg-white px-[9px] py-[2px] text-[11px] font-black text-al-muted">
                  {cards.length}
                </span>
              </div>
              <div className="px-[6px] pb-[6px] text-[11px] font-extrabold leading-[1.4] text-al-faint">
                {def.regra}
              </div>

              {cards.length === 0 && (
                <div className="rounded-[13px] border border-dashed border-al-border px-4 py-6 text-center text-[11.5px] font-extrabold text-al-faint">
                  nenhum card nesta fase
                </div>
              )}

              {cards.map((p) => (
                <KanbanCard
                  key={p.id}
                  proposta={p}
                  passaporte={passaporteDe(p)}
                  faltaEvidencia={faltaPorId[p.id] ?? null}
                  avancando={avancar.isPending && avancar.variables?.propostaId === p.id}
                  onAvancar={() =>
                    avancar.mutate({ propostaId: p.id, atorNome: 'Nizan Jhon' })
                  }
                  onAbrirGate={() => setGateAbertoId(p.id)}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-[14px] rounded-[18px] border border-al-border bg-white px-[22px] py-[16px]">
        <div className="text-[14px] font-extrabold leading-[1.5] text-al-ink">
          💡 <b>As 4 evidências do passaporte:</b> 📋 dados → 💲 preço → 🔓 alçada → 📄 selo.{' '}
          <b>Sem evidência, o card não passa de fase.</b>
        </div>
      </div>

      {propostaGate && faltaPorId[propostaGate.id] && (
        <GateModal
          proposta={propostaGate}
          passaporte={passaporteDe(propostaGate)}
          faltaEvidencia={faltaPorId[propostaGate.id]}
          onClose={() => setGateAbertoId(null)}
        />
      )}
    </div>
  );
}
