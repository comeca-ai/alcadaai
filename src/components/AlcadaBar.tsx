import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, OctagonX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fmtBRL, zonaDoDesconto } from '@/lib/api';
import type { ZonaAlcada } from '@/lib/api';

/**
 * Barra de alçada interativa (componente reutilizável).
 * 3 zonas: verde (≤ limiteVendedor — o vendedor aprova sozinho),
 * âmbar (≤ limiteGerente — pede gerente), vermelha (> limiteGerente — só diretor).
 * A agulha desliza conforme o desconto implícito; a escala termina no piso.
 */
export interface AlcadaBarProps {
  /** Desconto implícito em % (positivo = desconto, negativo = acréscimo). */
  descontoPct: number;
  /** Piso de preço em R$ (margem mínima da casa). */
  piso: number;
  /** Desconto máximo (%) que o vendedor aprova sozinho. */
  limiteVendedor?: number;
  /** Desconto máximo (%) que o gerente aprova. */
  limiteGerente?: number;
  /** Valor final negociado (para detectar "abaixo do piso"). */
  valorFinal?: number;
  /** Motivo do desvio (entra na mensagem da zona âmbar). */
  motivo?: string;
  /** Callback disparado quando a zona muda. */
  onZona?: (zona: ZonaAlcada) => void;
}

/** Posição da agulha (0–96%) mapeando desconto → zonas 45/35/20 da largura. */
function posicaoAgulha(desc: number, limV: number, limG: number): number {
  const max = 20; // escala vai até 20% de desconto
  if (desc <= 0) return 0;
  if (desc <= limV) return (desc / limV) * 45;
  if (desc <= limG) return 45 + ((desc - limV) / (limG - limV)) * 35;
  return Math.min(80 + ((desc - limG) / (max - limG)) * 16, 96);
}

export default function AlcadaBar({
  descontoPct,
  piso,
  limiteVendedor = 5,
  limiteGerente = 12,
  valorFinal,
  motivo,
  onZona,
}: AlcadaBarProps) {
  const zona = zonaDoDesconto(descontoPct, limiteVendedor, limiteGerente);
  const pos = posicaoAgulha(descontoPct, limiteVendedor, limiteGerente);
  const abaixoDoPiso = typeof valorFinal === 'number' && valorFinal < piso;

  useEffect(() => {
    onZona?.(zona);
  }, [zona, onZona]);

  return (
    <div className="mt-[6px]">
      <div className="mb-[10px] flex items-baseline justify-between gap-3">
        <div className="text-[15.5px] font-black">Sua alçada de desconto</div>
        <div className="text-[12px] font-extrabold text-al-faint">
          margem mínima da Vetta: 28%
        </div>
      </div>

      <div className="relative flex h-[56px] overflow-hidden rounded-[14px]">
        <div className="flex h-full w-[45%] items-center justify-center bg-al-teal text-center text-[11.5px] font-black leading-tight text-white">
          <div>
            ATÉ −{limiteVendedor}%
            <span className="block text-[10px] font-bold opacity-85">você aprova sozinho</span>
          </div>
        </div>
        <div className="flex h-full w-[35%] items-center justify-center bg-al-amber text-center text-[11.5px] font-black leading-tight text-white">
          <div>
            −{limiteVendedor}% a −{limiteGerente}%
            <span className="block text-[10px] font-bold opacity-85">pede alçada ao gerente</span>
          </div>
        </div>
        <div className="flex h-full w-[20%] items-center justify-center bg-al-red text-center text-[11.5px] font-black leading-tight text-white">
          <div>
            abaixo de −{limiteGerente}%
            <span className="block text-[10px] font-bold opacity-85">só o diretor</span>
          </div>
        </div>
        {/* agulha deslizante */}
        <motion.div
          className="absolute top-[-8px] h-[72px] w-1 rounded-[2px] bg-al-ink shadow-[0_0_0_3px_rgba(31,27,22,.15)]"
          initial={false}
          animate={{ left: `${pos}%` }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        >
          <span className="absolute left-1/2 top-[-6px] -translate-x-1/2 border-x-[6px] border-t-[8px] border-x-transparent border-t-al-ink" />
        </motion.div>
      </div>

      <div className="mt-2 flex justify-between text-[11px] font-extrabold text-al-faint [font-variant-numeric:tabular-nums]">
        <span>0%</span>
        <span>−{limiteVendedor}%</span>
        <span>−{limiteGerente}%</span>
        <span>piso {fmtBRL(piso)}</span>
      </div>

      <div
        className={cn(
          'mt-[14px] flex items-start gap-[10px] rounded-xl border px-[15px] py-3 text-[13.5px] font-extrabold leading-[1.5]',
          zona === 'verde' && 'border-al-teal/35 bg-al-teal-soft text-[#14694F]',
          zona === 'ambar' && 'border-al-amber/40 bg-al-amber-soft text-[#7A4E0C]',
          zona === 'vermelha' && 'border-al-red/35 bg-al-red-soft text-al-red-ink',
        )}
      >
        {zona === 'verde' && <CheckCircle2 className="mt-[1px] h-[18px] w-[18px] shrink-0" />}
        {zona === 'ambar' && <AlertTriangle className="mt-[1px] h-[18px] w-[18px] shrink-0" />}
        {zona === 'vermelha' && <OctagonX className="mt-[1px] h-[18px] w-[18px] shrink-0" />}
        <span>
          {zona === 'verde' && (
            <>
              <b>Dentro da sua alçada.</b> Desconto de até {limiteVendedor}% você aprova sozinho —
              registra e segue. O desvio entra no seu placar do mês.
            </>
          )}
          {zona === 'ambar' && (
            <>
              <b>Acima de {limiteVendedor}%:</b> precisa da alçada do <b>gerente</b>. O pedido vai
              com seu motivo{motivo ? <> (“{motivo}”)</> : null} e ele responde no painel ou no
              WhatsApp.
            </>
          )}
          {zona === 'vermelha' && (
            <>
              <b>Acima da sua alçada.</b> Zona vermelha
              {abaixoDoPiso && (
                <>
                  {' '}
                  e <b>abaixo do piso {fmtBRL(piso)}</b> (a margem fura o mínimo de 28%)
                </>
              )}{' '}
              — a proposta fica <b>bloqueada</b> até o <b>diretor</b> aprovar no painel/WhatsApp.
            </>
          )}
        </span>
      </div>
    </div>
  );
}
