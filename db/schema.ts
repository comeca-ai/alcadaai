import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  int,
  timestamp,
  bigint,
} from "drizzle-orm/mysql-core";

// ── Cargos (a base do preço — cada empresa cadastra os seus) ──
export const cargos = mysqlTable("cargos", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 140 }).notNull(),
  nivel: varchar("nivel", { length: 60 }).notNull().default(""),
  custoMensal: int("custo_mensal").notNull(), // R$ consolidado/mês
  margemAlvo: int("margem_alvo").notNull().default(28), // %
  ativo: int("ativo").notNull().default(1),
});

// ── Usuários do time ────────────────────────────────────────
export const usuarios = mysqlTable("usuarios", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 140 }).notNull(),
  iniciais: varchar("iniciais", { length: 8 }).notNull(),
  papel: mysqlEnum("papel", ["vendedor", "gerente", "diretor"]).notNull(),
  alcadaPct: int("alcada_pct").notNull().default(5), // desconto máx. que aprova sozinho (%)
});

// ── Propostas ───────────────────────────────────────────────
export const propostas = mysqlTable("propostas", {
  id: serial("id").primaryKey(),
  cliente: varchar("cliente", { length: 180 }).notNull(),
  contato: varchar("contato", { length: 180 }).notNull().default(""),
  escopo: text("escopo").notNull(),
  sla: mysqlEnum("sla", ["padrao", "urgente", "semanal"]).notNull().default("padrao"),
  duracaoMeses: int("duracao_meses").notNull().default(12),
  composicao: text("composicao").notNull(), // JSON [{cargoId, nome, qty, custoMensal}]
  custoTotal: int("custo_total").notNull(),
  piso: int("piso").notNull(),
  precoIA: int("preco_ia").notNull(),
  faixaTeto: int("faixa_teto").notNull(),
  valorFinal: int("valor_final").notNull(),
  descontoPct: int("desconto_pct").notNull(), // milésimos: 139 = 13,9%
  motivoDesvio: varchar("motivo_desvio", { length: 60 }).notNull().default(""),
  zona: mysqlEnum("zona", ["verde", "amarela", "vermelha"]).notNull(),
  status: mysqlEnum("status", [
    "dados",
    "elaborando",
    "revisao_alcada",
    "aguardando_alcada",
    "aprovada",
    "doc_selado",
    "enviada",
    "devolvida",
  ]).notNull().default("elaborando"),
  vendedorId: bigint("vendedor_id", { mode: "number", unsigned: true }).notNull(),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

// ── Pedidos de alçada ───────────────────────────────────────
export const alcadas = mysqlTable("alcadas", {
  id: serial("id").primaryKey(),
  propostaId: bigint("proposta_id", { mode: "number", unsigned: true }).notNull(),
  solicitanteId: bigint("solicitante_id", { mode: "number", unsigned: true }).notNull(),
  nivel: mysqlEnum("nivel", ["gerente", "diretor"]).notNull(),
  motivo: varchar("motivo", { length: 60 }).notNull(),
  justificativa: text("justificativa").notNull(),
  status: mysqlEnum("status", ["pendente", "aprovada", "devolvida"]).notNull().default("pendente"),
  decididoPor: varchar("decidido_por", { length: 140 }),
  observacao: text("observacao"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
  decididoEm: timestamp("decidido_em"),
});

// ── Eventos (audit trail) ───────────────────────────────────
export const eventos = mysqlTable("eventos", {
  id: serial("id").primaryKey(),
  propostaId: bigint("proposta_id", { mode: "number", unsigned: true }),
  ator: varchar("ator", { length: 140 }).notNull(),
  texto: text("texto").notNull(),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export type Cargo = typeof cargos.$inferSelect;
export type Usuario = typeof usuarios.$inferSelect;
export type Proposta = typeof propostas.$inferSelect;
export type Alcada = typeof alcadas.$inferSelect;
export type Evento = typeof eventos.$inferSelect;
