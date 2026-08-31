import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '../../../api/router';

type RouterOutputs = inferRouterOutputs<AppRouter>;

/** Linha de `trpc.propostas.list` — proposta + nome/iniciais do vendedor. */
export type PropostaKanban = RouterOutputs['propostas']['list'][number];
