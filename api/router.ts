import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  alcadasPendentes,
  avancarKanban,
  calcularPreco,
  criarProposta,
  decidirAlcada,
  feedEventos,
  listCargos,
  listPropostas,
  listUsuarios,
} from "./queries/ops";

const itemComposicao = z.object({
  cargoId: z.number(),
  nome: z.string(),
  qty: z.number().min(0),
  custoMensal: z.number(),
});

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),

  cargos: createRouter({
    list: publicQuery.query(() => listCargos()),
  }),

  usuarios: createRouter({
    list: publicQuery.query(() => listUsuarios()),
  }),

  preco: createRouter({
    calcular: publicQuery
      .input(
        z.object({
          itens: z.array(itemComposicao),
          sla: z.enum(["padrao", "urgente", "semanal"]).default("padrao"),
        })
      )
      .mutation(({ input }) => calcularPreco(input.itens, input.sla)),
  }),

  propostas: createRouter({
    list: publicQuery
      .input(z.object({ vendedorId: z.number().optional() }).optional())
      .query(({ input }) => listPropostas(input?.vendedorId)),
    criar: publicQuery
      .input(
        z.object({
          cliente: z.string().min(1),
          contato: z.string().default(""),
          escopo: z.string().default(""),
          sla: z.enum(["padrao", "urgente", "semanal"]).default("padrao"),
          duracaoMeses: z.number().int().default(12),
          itens: z.array(itemComposicao),
          valorFinal: z.number().min(0),
          motivoDesvio: z.string().default(""),
          vendedorId: z.number(),
        })
      )
      .mutation(({ input }) => criarProposta(input)),
  }),

  alcada: createRouter({
    pendentes: publicQuery.query(() => alcadasPendentes()),
    decidir: publicQuery
      .input(
        z.object({
          alcadaId: z.number(),
          decisao: z.enum(["aprovada", "devolvida"]),
          decididoPor: z.string(),
          observacao: z.string().optional(),
        })
      )
      .mutation(({ input }) => decidirAlcada(input)),
  }),

  kanban: createRouter({
    avancar: publicQuery
      .input(z.object({ propostaId: z.number(), atorNome: z.string() }))
      .mutation(({ input }) => avancarKanban(input.propostaId, input.atorNome)),
  }),

  eventos: createRouter({
    feed: publicQuery.input(z.object({ limite: z.number().default(15) }).optional()).query(({ input }) =>
      feedEventos(input?.limite)
    ),
  }),
});

export type AppRouter = typeof appRouter;
