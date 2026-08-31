import { usePapel } from '@/lib/papel';

/** Stub /minhas — lista do vendedor com semáforo de desvio. Implementação: agente A. */
export default function Minhas() {
  const { nome, iniciais } = usePapel();
  return (
    <div className="flex flex-col gap-[18px]">
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
      <div className="rounded-[18px] border border-al-border bg-white px-[22px] py-10 text-center">
        <div className="text-[15.5px] font-black">Minhas propostas em construção</div>
        <p className="mx-auto mt-2 max-w-[520px] text-[13.5px] font-bold leading-[1.6] text-al-muted">
          KPIs do mês (desvio médio, propostas ganhas, aguardando alçada, docs selados) e a tabela
          do pipeline com semáforo de desvio serão implementadas nesta rota.
        </p>
      </div>
    </div>
  );
}
