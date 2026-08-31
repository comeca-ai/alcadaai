import { toast } from 'sonner';

/**
 * Camada de API do v0 (demo funcional).
 *
 * O backend tRPC ainda não existe neste scaffold. Quando existir, a página
 * Nova Proposta passará a chamar `trpc.propostas.criar.useMutation` — este
 * wrapper é o ponto único de troca: ele já tem o contrato de entrada/saída
 * e hoje cai no fallback local (estado em memória + toast).
 */
export type ZonaAlcada = 'verde' | 'ambar' | 'vermelha';

export interface CargoComposicao {
  nome: string;
  custoMensal: number;
  quantidade: number;
}

export interface NovaPropostaInput {
  cliente: string;
  contato: string;
  escopo: string;
  composicao: CargoComposicao[];
  sla: 'padrao' | 'urgente';
  duracaoMeses: number;
  precoIA: number;
  piso: number;
  valorFinal: number;
  descontoPct: number;
  motivo: string;
  zona: ZonaAlcada;
}

export interface PropostaRegistrada extends NovaPropostaInput {
  id: string;
  criadoEm: string;
  status: 'registrada' | 'aguardando_gerente' | 'aguardando_diretor';
}

/** Fallback local: propostas criadas nesta sessão (substituído pelo tRPC depois). */
const propostasLocais: PropostaRegistrada[] = [];

export function listarPropostasLocais(): readonly PropostaRegistrada[] {
  return propostasLocais;
}

function statusDaZona(zona: ZonaAlcada): PropostaRegistrada['status'] {
  if (zona === 'verde') return 'registrada';
  if (zona === 'ambar') return 'aguardando_gerente';
  return 'aguardando_diretor';
}

/**
 * Cria a proposta (ou o pedido de alçada) a partir da tela Nova Proposta.
 * TODO(backend): trocar o corpo por `trpc.propostas.criar.useMutation`
 * mantendo esta assinatura — a página não deve mudar.
 */
export async function criarProposta(input: NovaPropostaInput): Promise<PropostaRegistrada> {
  // fallback local (v0 sem backend)
  const proposta: PropostaRegistrada = {
    ...input,
    id: `prop-${Date.now()}`,
    criadoEm: new Date().toISOString(),
    status: statusDaZona(input.zona),
  };
  propostasLocais.push(proposta);

  if (input.zona === 'verde') {
    toast.success('Proposta registrada ✓', {
      description: `${input.cliente} · ${fmtBRL(input.valorFinal)}/mês · dentro da sua alçada.`,
    });
  } else {
    const quem = input.zona === 'ambar' ? 'gerente' : 'diretor';
    toast.success('Pedido de alçada enviado', {
      description: `${input.cliente} · desvio de ${fmtPct(input.descontoPct)} foi para o ${quem} (painel + WhatsApp).`,
    });
  }
  return proposta;
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

/** R$ 13.200 (sem centavos, pt-BR). */
export function fmtBRL(v: number): string {
  return `R$\u00A0${Math.round(v).toLocaleString('pt-BR')}`;
}

/** −13,9% (sinal + 1 casa, pt-BR). Positivo vira desconto (−), negativo vira acréscimo (+). */
export function fmtPct(descontoPct: number): string {
  const d = Math.round(descontoPct * 10) / 10;
  const sinal = d > 0 ? '−' : d < 0 ? '+' : '';
  return `${sinal}${Math.abs(d).toFixed(1).replace('.', ',')}%`;
}
