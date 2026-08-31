import { usePapel } from '@/lib/papel';

/** Stub /diretor — fila de alçadas com aprovar/devolver. Implementação: agente A. */
export default function Diretor() {
  const { iniciais } = usePapel();
  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex items-center gap-3">
        <div className="font-display text-[22px] font-black tracking-[-0.01em]">
          Painel do diretor
          <span className="mt-[2px] block font-sans text-[13px] font-bold text-al-muted">
            governança comercial · Vetta Facilities · agosto de 2026
          </span>
        </div>
        <span className="ml-auto inline-flex items-center whitespace-nowrap rounded-full bg-al-red-soft px-[15px] py-[9px] text-[12.5px] font-black text-al-red">
          2 pedidos de alçada
        </span>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-al-dark text-[15px] font-black text-white">
          {iniciais}
        </div>
      </div>
      <div className="rounded-[18px] border border-al-border bg-white px-[22px] py-10 text-center">
        <div className="text-[15.5px] font-black">Painel do diretor em construção</div>
        <p className="mx-auto mt-2 max-w-[520px] text-[13.5px] font-bold leading-[1.6] text-al-muted">
          A fila de pedidos de alçada (aprovar / devolver com observação), os KPIs de governança e
          o desvio por vendedor serão implementados nesta rota.
        </p>
      </div>
    </div>
  );
}
