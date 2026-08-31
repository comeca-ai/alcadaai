import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '../../api/router';

/**
 * Camada de API do v0.
 *
 * As páginas consomem o backend real via hooks `trpc.*` (src/providers/trpc.tsx).
 * Este módulo concentra: tipos derivados do AppRouter, helpers de domínio
 * (zona, formatação, composição) e os fallbacks locais (seed Vetta Facilities)
 * exibidos quando o servidor está fora do ar.
 */

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type CargoRow = RouterOutputs['cargos']['list'][number];
export type PropostaRow = RouterOutputs['propostas']['list'][number];
export type AlcadaPendente = RouterOutputs['alcada']['pendentes'][number];
export type PrecoCalc = RouterOutputs['preco']['calcular'];

/* ── Zonas da alçada ───────────────────────────────────────── */
/** Zona na UI (design tokens): verde / âmbar / vermelha. */
export type ZonaAlcada = 'verde' | 'ambar' | 'vermelha';
/** Zona como gravada no banco (enum do schema): verde / amarela / vermelha. */
export type ZonaBackend = 'verde' | 'amarela' | 'vermelha';

/** Converte a zona do backend ('amarela') para a zona da UI ('ambar'). */
export function zonaUi(zona: ZonaBackend | ZonaAlcada | string): ZonaAlcada {
  if (zona === 'verde') return 'verde';
  if (zona === 'amarela' || zona === 'ambar') return 'ambar';
  return 'vermelha';
}

/** Zona da alçada para um desconto (%): verde ≤ limVendedor, âmbar ≤ limGerente, senão vermelha. */
export function zonaDoDesconto(
  descontoPct: number,
  limiteVendedor = 5,
  limiteGerente = 12,
): ZonaAlcada {
  if (descontoPct <= limiteVendedor) return 'verde';
  if (descontoPct <= limiteGerente) return 'ambar';
  return 'vermelha';
}

/* ── Composição da proposta (JSON gravado em propostas.composicao) ── */
export interface ItemComposicao {
  cargoId: number;
  nome: string;
  qty: number;
  custoMensal: number;
}

export function parseComposicao(json: string): ItemComposicao[] {
  try {
    const arr = JSON.parse(json) as ItemComposicao[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/** "2× Técnico de Manutenção · 1× Auxiliar de Limpeza" */
export function resumoComposicao(json: string): string {
  const itens = parseComposicao(json);
  if (itens.length === 0) return '—';
  return itens.map((i) => `${i.qty.toLocaleString('pt-BR')}× ${i.nome}`).join(' · ');
}

/* ── Números ───────────────────────────────────────────────── */
/** descontoPct vem do banco em décimos de ponto percentual (139 = 13,9%). */
export function desvioPct(p: { descontoPct: number }): number {
  return p.descontoPct / 10;
}

/** R$ 13.200 (sem centavos, pt-BR). */
export function fmtBRL(v: number): string {
  return `R$ ${Math.round(v).toLocaleString('pt-BR')}`;
}

/** −13,9% (sinal + 1 casa, pt-BR). Positivo vira desconto (−), negativo vira acréscimo (+). */
export function fmtPct(descontoPct: number): string {
  const d = Math.round(descontoPct * 10) / 10;
  const sinal = d > 0 ? '−' : d < 0 ? '+' : '';
  return `${sinal}${Math.abs(d).toFixed(1).replace('.', ',')}%`;
}

/** "agora" / "há 25min" / "há 4h" / "há 2d" */
export function tempoRelativo(data: Date | string): string {
  const ms = Date.now() - new Date(data).getTime();
  const min = Math.max(0, Math.floor(ms / 60000));
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)}d`;
}

/* ── Status da proposta → pill ─────────────────────────────── */
export type StatusProposta = PropostaRow['status'];
export type TomPill = 'green' | 'amber' | 'red' | 'gray';

export const STATUS_META: Record<StatusProposta, { rotulo: string; tom: TomPill }> = {
  dados: { rotulo: 'dados incompletos', tom: 'gray' },
  elaborando: { rotulo: 'elaborando', tom: 'gray' },
  aguardando_alcada: { rotulo: 'aguardando alçada', tom: 'red' },
  revisao_alcada: { rotulo: 'revisão de alçada', tom: 'amber' },
  aprovada: { rotulo: 'aprovada', tom: 'green' },
  doc_selado: { rotulo: 'doc selado ✓', tom: 'green' },
  enviada: { rotulo: 'enviada ✓', tom: 'green' },
  devolvida: { rotulo: 'devolvida', tom: 'gray' },
};

/* ── Fallbacks locais (espelham db/seed.ts — Vetta Facilities) ── */
export const CARGOS_FALLBACK: CargoRow[] = [
  { id: 1, nome: 'Técnico de Manutenção', nivel: 'pleno', custoMensal: 4200, margemAlvo: 28, ativo: 1 },
  { id: 2, nome: 'Auxiliar de Limpeza', nivel: '', custoMensal: 2600, margemAlvo: 28, ativo: 1 },
  { id: 3, nome: 'Aux. Limpeza Crítica (hospitalar)', nivel: 'esp.', custoMensal: 3400, margemAlvo: 30, ativo: 1 },
  { id: 4, nome: 'Supervisor de Conta', nivel: 'sênior', custoMensal: 6800, margemAlvo: 28, ativo: 1 },
];

/** Quantidades iniciais da tela Nova Proposta (por cargoId). */
export const QTY_INICIAL: Record<number, number> = { 1: 2, 2: 1, 3: 0, 4: 0.5 };

const FALLBACK_AGORA = new Date();

export const PROPOSTAS_FALLBACK: PropostaRow[] = [
  {
    id: 1,
    cliente: 'Cond. Residencial Vista Park',
    contato: 'Síndica Márcia · (83) 99988-7766',
    escopo: 'Manutenção preventiva (2 torres, 96 unidades), limpeza das áreas comuns e supervisão mensal com relatório.',
    sla: 'urgente',
    duracaoMeses: 12,
    composicao: JSON.stringify([
      { cargoId: 1, nome: 'Técnico de Manutenção', qty: 2, custoMensal: 4200 },
      { cargoId: 2, nome: 'Auxiliar de Limpeza', qty: 1, custoMensal: 2600 },
      { cargoId: 4, nome: 'Supervisor de Conta', qty: 0.5, custoMensal: 6800 },
    ]),
    custoTotal: 14400,
    piso: 20000,
    precoIA: 21400,
    faixaTeto: 23540,
    valorFinal: 18400,
    descontoPct: 140,
    motivoDesvio: 'relacionamento',
    zona: 'vermelha',
    status: 'aguardando_alcada',
    vendedorId: 1,
    criadoEm: FALLBACK_AGORA,
    vendedorNome: 'Nizan Jhon',
    vendedorIniciais: 'NJ',
  },
  {
    id: 2,
    cliente: 'Hospital Vida Nova',
    contato: 'Dr. Camilo · compras',
    escopo: 'Limpeza crítica de alas hospitalares com protocolo, 2 turnos.',
    sla: 'padrao',
    duracaoMeses: 12,
    composicao: JSON.stringify([
      { cargoId: 3, nome: 'Aux. Limpeza Crítica (hospitalar)', qty: 4, custoMensal: 3400 },
      { cargoId: 1, nome: 'Técnico de Manutenção', qty: 2, custoMensal: 4200 },
      { cargoId: 4, nome: 'Supervisor de Conta', qty: 0.5, custoMensal: 6800 },
    ]),
    custoTotal: 25400,
    piso: 35278,
    precoIA: 35278,
    faixaTeto: 38806,
    valorFinal: 32700,
    descontoPct: 73,
    motivoDesvio: 'cliente estratégico',
    zona: 'amarela',
    status: 'revisao_alcada',
    vendedorId: 1,
    criadoEm: FALLBACK_AGORA,
    vendedorNome: 'Nizan Jhon',
    vendedorIniciais: 'NJ',
  },
  {
    id: 3,
    cliente: 'Escola Futuro',
    contato: 'Direção · adm',
    escopo: 'Facilities completo do colégio (turno da manhã).',
    sla: 'padrao',
    duracaoMeses: 12,
    composicao: JSON.stringify([
      { cargoId: 2, nome: 'Auxiliar de Limpeza', qty: 2, custoMensal: 2600 },
      { cargoId: 1, nome: 'Técnico de Manutenção', qty: 1, custoMensal: 4200 },
    ]),
    custoTotal: 9400,
    piso: 13056,
    precoIA: 13056,
    faixaTeto: 14361,
    valorFinal: 12800,
    descontoPct: 20,
    motivoDesvio: '',
    zona: 'verde',
    status: 'aprovada',
    vendedorId: 1,
    criadoEm: FALLBACK_AGORA,
    vendedorNome: 'Nizan Jhon',
    vendedorIniciais: 'NJ',
  },
  {
    id: 4,
    cliente: 'Rede de Farmácias BomPreço (8 lojas)',
    contato: 'a levantar',
    escopo: '',
    sla: 'padrao',
    duracaoMeses: 12,
    composicao: JSON.stringify([]),
    custoTotal: 0,
    piso: 0,
    precoIA: 0,
    faixaTeto: 0,
    valorFinal: 0,
    descontoPct: 0,
    motivoDesvio: '',
    zona: 'verde',
    status: 'dados',
    vendedorId: 1,
    criadoEm: FALLBACK_AGORA,
    vendedorNome: 'Nizan Jhon',
    vendedorIniciais: 'NJ',
  },
];
