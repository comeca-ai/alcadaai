import { and, asc, desc, eq } from "drizzle-orm";
import { getDb } from "./connection";
import { alcadas, cargos, eventos, propostas, usuarios } from "../../db/schema";

const MARGEM_CASA = 28; // %
const LIM_VENDEDOR = 5;
const LIM_GERENTE = 12;
const FATOR_URGENTE = 1.07;

// ── Cargos / usuários ───────────────────────────────────────
export async function listCargos() {
  const db = getDb();
  return db.select().from(cargos).where(eq(cargos.ativo, 1)).orderBy(asc(cargos.custoMensal));
}
export async function listUsuarios() {
  const db = getDb();
  return db.select().from(usuarios).orderBy(asc(usuarios.id));
}

// ── Motor de preço ──────────────────────────────────────────
export type ItemComposicao = { cargoId: number; nome: string; qty: number; custoMensal: number };

export function calcularPreco(itens: ItemComposicao[], sla: "padrao" | "urgente" | "semanal") {
  const ativos = itens.filter((i) => i.qty > 0);
  const custoTotal = ativos.reduce((s, i) => s + Math.round(i.qty * i.custoMensal), 0);
  const piso = Math.round(custoTotal / (1 - MARGEM_CASA / 100));
  const fator = sla === "urgente" ? FATOR_URGENTE : 1;
  const precoIA = Math.round(piso * fator);
  const faixaTeto = Math.round(precoIA * 1.1);
  return { custoTotal, piso, precoIA, faixaTeto, fator, itens: ativos };
}

export function zonaDoDesconto(descontoPct: number): "verde" | "amarela" | "vermelha" {
  if (descontoPct <= LIM_VENDEDOR) return "verde";
  if (descontoPct <= LIM_GERENTE) return "amarela";
  return "vermelha";
}

// ── Propostas ───────────────────────────────────────────────
export async function criarProposta(input: {
  cliente: string;
  contato: string;
  escopo: string;
  sla: "padrao" | "urgente" | "semanal";
  duracaoMeses: number;
  itens: ItemComposicao[];
  valorFinal: number;
  motivoDesvio: string;
  vendedorId: number;
}) {
  const db = getDb();
  const calc = calcularPreco(input.itens, input.sla);
  const desconto = calc.precoIA > 0 ? Math.round((1 - input.valorFinal / calc.precoIA) * 1000) : 0;
  const zona = zonaDoDesconto(desconto / 10);
  const status = zona === "verde" ? ("aprovada" as const) : ("aguardando_alcada" as const);

  const [ins] = await db.insert(propostas).values({
    cliente: input.cliente,
    contato: input.contato,
    escopo: input.escopo,
    sla: input.sla,
    duracaoMeses: input.duracaoMeses,
    composicao: JSON.stringify(calc.itens),
    custoTotal: calc.custoTotal,
    piso: calc.piso,
    precoIA: calc.precoIA,
    faixaTeto: calc.faixaTeto,
    valorFinal: input.valorFinal,
    descontoPct: Math.max(desconto, 0),
    motivoDesvio: input.motivoDesvio,
    zona,
    status,
    vendedorId: input.vendedorId,
  });
  const propostaId = Number(ins.insertId);

  const [vend] = await db.select().from(usuarios).where(eq(usuarios.id, input.vendedorId));

  if (zona !== "verde") {
    const nivel = zona === "amarela" ? ("gerente" as const) : ("diretor" as const);
    await db.insert(alcadas).values({
      propostaId,
      solicitanteId: input.vendedorId,
      nivel,
      motivo: input.motivoDesvio,
      status: "pendente",
    });
    await addEvento(propostaId, vend?.nome ?? "vendedor", `pediu alçada ao <b>${nivel}</b> (desvio de ${(desconto / 10).toFixed(1).replace(".", ",")}%)`);
  } else {
    await addEvento(propostaId, vend?.nome ?? "vendedor", `registrou a proposta dentro da alçada (${(desconto / 10).toFixed(1).replace(".", ",")}%)`);
  }
  return { id: propostaId, zona, status, calc };
}

export async function listPropostas(vendedorId?: number) {
  const db = getDb();
  const base = db
    .select({ p: propostas, vendedorNome: usuarios.nome, vendedorIniciais: usuarios.iniciais })
    .from(propostas)
    .leftJoin(usuarios, eq(propostas.vendedorId, usuarios.id))
    .orderBy(desc(propostas.id));
  const rows = vendedorId ? await base.where(eq(propostas.vendedorId, vendedorId)) : await base;
  return rows.map((r) => ({ ...r.p, vendedorNome: r.vendedorNome ?? "", vendedorIniciais: r.vendedorIniciais ?? "" }));
}

// ── Alçadas ─────────────────────────────────────────────────
export async function alcadasPendentes() {
  const db = getDb();
  const rows = await db
    .select({ a: alcadas, p: propostas, vendNome: usuarios.nome, vendIniciais: usuarios.iniciais })
    .from(alcadas)
    .innerJoin(propostas, eq(alcadas.propostaId, propostas.id))
    .leftJoin(usuarios, eq(alcadas.solicitanteId, usuarios.id))
    .where(eq(alcadas.status, "pendente"))
    .orderBy(asc(alcadas.criadoEm));
  return rows.map((r) => ({ ...r.a, proposta: r.p, vendedorNome: r.vendNome ?? "", vendedorIniciais: r.vendIniciais ?? "" }));
}

export async function decidirAlcada(input: {
  alcadaId: number;
  decisao: "aprovada" | "devolvida";
  decididoPor: string;
  observacao?: string;
}) {
  const db = getDb();
  const [a] = await db.select().from(alcadas).where(eq(alcadas.id, input.alcadaId));
  if (!a || a.status !== "pendente") throw new Error("Alçada não encontrada ou já decidida");

  await db
    .update(alcadas)
    .set({ status: input.decisao, decididoPor: input.decididoPor, observacao: input.observacao ?? null, decididoEm: new Date() })
    .where(eq(alcadas.id, a.id));

  const novoStatus = input.decisao === "aprovada" ? ("revisao_alcada" as const) : ("devolvida" as const);
  await db.update(propostas).set({ status: novoStatus }).where(eq(propostas.id, a.propostaId));
  await addEvento(
    a.propostaId,
    input.decididoPor,
    input.decisao === "aprovada"
      ? `<b>aprovou a alçada</b> — proposta desbloqueada`
      : `<b>devolveu a alçada</b>${input.observacao ? ": " + input.observacao : ""}`
  );
  return { ok: true };
}

// ── Kanban com gate de evidência ────────────────────────────
const EVIDENCIAS: Record<string, (p: typeof propostas.$inferSelect, alc: boolean) => string | null> = {
  "dados->elaborando": (p) =>
    p.cliente && p.escopo && JSON.parse(p.composicao).length > 0 ? null : "ficha de dados completa",
  "elaborando->revisao_alcada": (p) => (p.precoIA > 0 ? null : "preço da IA registrado"),
  "revisao_alcada->aprovada": (p, alcOk) =>
    p.descontoPct / 10 <= LIM_VENDEDOR || alcOk ? null : "alçada aprovada (desvio acima da faixa)",
  "aprovada->doc_selado": () => null, // v0: selo manual
  "doc_selado->enviada": () => null,
};

const ORDEM = ["dados", "elaborando", "revisao_alcada", "aprovada", "doc_selado", "enviada"] as const;

export async function avancarKanban(propostaId: number, atorNome: string) {
  const db = getDb();
  const [p] = await db.select().from(propostas).where(eq(propostas.id, propostaId));
  if (!p) throw new Error("Proposta não encontrada");
  if (p.status === "aguardando_alcada") throw new Error("Bloqueado: aguardando decisão da alçada");
  if (p.status === "enviada" || p.status === "devolvida") throw new Error("Proposta já encerrada neste quadro");

  const idx = ORDEM.indexOf(p.status as (typeof ORDEM)[number]);
  if (idx < 0 || idx >= ORDEM.length - 1) throw new Error("Fase final alcançada");
  const proxima = ORDEM[idx + 1];

  // evidência: alçada aprovada existe?
  const [alcOk] = await db
    .select()
    .from(alcadas)
    .where(and(eq(alcadas.propostaId, p.id), eq(alcadas.status, "aprovada")));

  const chave = `${p.status}->${proxima}`;
  const checa = EVIDENCIAS[chave];
  const falta = checa ? checa(p, !!alcOk) : null;
  if (falta) return { ok: false, faltaEvidencia: falta };

  await db.update(propostas).set({ status: proxima }).where(eq(propostas.id, p.id));
  await addEvento(p.id, atorNome, `moveu o card para <b>${proxima.replace("_", " ")}</b>`);
  return { ok: true, status: proxima };
}

// ── Eventos ─────────────────────────────────────────────────
export async function addEvento(propostaId: number | null, ator: string, texto: string) {
  const db = getDb();
  await db.insert(eventos).values({ propostaId, ator, texto });
}
export async function feedEventos(limite = 15) {
  const db = getDb();
  return db.select().from(eventos).orderBy(desc(eventos.id)).limit(limite);
}
