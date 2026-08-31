import { usePapel } from '@/lib/papel';

/** Stub /kanban — Kanban da proposta (4 colunas + gate de evidência). Implementação: agente B. */
export default function Kanban() {
  const { iniciais } = usePapel();
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
          8 cards ativos
        </span>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-al-green text-[15px] font-black text-white">
          {iniciais}
        </div>
      </div>
      <div className="rounded-[18px] border border-al-border bg-white px-[22px] py-10 text-center">
        <div className="text-[15.5px] font-black">Kanban em construção</div>
        <p className="mx-auto mt-2 max-w-[520px] text-[13.5px] font-bold leading-[1.6] text-al-muted">
          As 4 colunas (Dados da proposta → Elaborando → Revisão &amp; Alçada → Enviar) com o
          passaporte de evidências e o gate duro de alçada serão implementadas nesta rota.
        </p>
      </div>
    </div>
  );
}
