import { getDb } from "../api/queries/connection";
import { alcadas, cargos, eventos, propostas, usuarios } from "./schema";

async function seed() {
  const db = getDb();
  console.log("Seeding Alçada (Vetta Facilities)...");

  await db.insert(cargos).values([
    { id: 1, nome: "Técnico de Manutenção", nivel: "pleno", custoMensal: 4200, margemAlvo: 28 },
    { id: 2, nome: "Auxiliar de Limpeza", nivel: "", custoMensal: 2600, margemAlvo: 28 },
    { id: 3, nome: "Aux. Limpeza Crítica (hospitalar)", nivel: "esp.", custoMensal: 3400, margemAlvo: 30 },
    { id: 4, nome: "Supervisor de Conta", nivel: "sênior", custoMensal: 6800, margemAlvo: 28 },
  ]);

  await db.insert(usuarios).values([
    { id: 1, nome: "Nizan Jhon", iniciais: "NJ", papel: "vendedor", alcadaPct: 5 },
    { id: 2, nome: "Rafa Gomes", iniciais: "RF", papel: "gerente", alcadaPct: 12 },
    { id: 3, nome: "Diretor Comercial", iniciais: "DC", papel: "diretor", alcadaPct: 100 },
  ]);

  // Propostas seed em vários estados do kanban
  await db.insert(propostas).values([
    {
      id: 1, cliente: "Cond. Residencial Vista Park", contato: "Síndica Márcia · (83) 99988-7766",
      escopo: "Manutenção preventiva (2 torres, 96 unidades), limpeza das áreas comuns e supervisão mensal com relatório.",
      sla: "urgente", duracaoMeses: 12,
      composicao: JSON.stringify([
        { cargoId: 1, nome: "Técnico de Manutenção", qty: 2, custoMensal: 4200 },
        { cargoId: 2, nome: "Auxiliar de Limpeza", qty: 1, custoMensal: 2600 },
        { cargoId: 4, nome: "Supervisor de Conta", qty: 0.5, custoMensal: 6800 },
      ]),
      custoTotal: 14400, piso: 20000, precoIA: 21400, faixaTeto: 23540,
      valorFinal: 18400, descontoPct: 140, motivoDesvio: "relacionamento",
      zona: "vermelha", status: "aguardando_alcada", vendedorId: 1,
    },
    {
      id: 2, cliente: "Hospital Vida Nova", contato: "Dr. Camilo · compras",
      escopo: "Limpeza crítica de alas hospitalares com protocolo, 2 turnos.",
      sla: "padrao", duracaoMeses: 12,
      composicao: JSON.stringify([
        { cargoId: 3, nome: "Aux. Limpeza Crítica (hospitalar)", qty: 4, custoMensal: 3400 },
        { cargoId: 1, nome: "Técnico de Manutenção", qty: 2, custoMensal: 4200 },
        { cargoId: 4, nome: "Supervisor de Conta", qty: 0.5, custoMensal: 6800 },
      ]),
      custoTotal: 25400, piso: 35278, precoIA: 35278, faixaTeto: 38806,
      valorFinal: 32700, descontoPct: 73, motivoDesvio: "cliente estratégico",
      zona: "amarela", status: "revisao_alcada", vendedorId: 1,
    },
    {
      id: 3, cliente: "Escola Futuro", contato: "Direção · adm",
      escopo: "Facilities completo do colégio (turno da manhã).",
      sla: "padrao", duracaoMeses: 12,
      composicao: JSON.stringify([
        { cargoId: 2, nome: "Auxiliar de Limpeza", qty: 2, custoMensal: 2600 },
        { cargoId: 1, nome: "Técnico de Manutenção", qty: 1, custoMensal: 4200 },
      ]),
      custoTotal: 9400, piso: 13056, precoIA: 13056, faixaTeto: 14361,
      valorFinal: 12800, descontoPct: 20, motivoDesvio: "",
      zona: "verde", status: "aprovada", vendedorId: 1,
    },
    {
      id: 4, cliente: "Rede de Farmácias BomPreço (8 lojas)", contato: "a levantar",
      escopo: "",
      sla: "padrao", duracaoMeses: 12,
      composicao: JSON.stringify([]),
      custoTotal: 0, piso: 0, precoIA: 0, faixaTeto: 0,
      valorFinal: 0, descontoPct: 0, motivoDesvio: "",
      zona: "verde", status: "dados", vendedorId: 1,
    },
  ]);

  await db.insert(alcadas).values([
    { propostaId: 1, solicitanteId: 1, nivel: "diretor", motivo: "relacionamento", justificativa: "Síndica amiga da diretoria e assembleia aprovando contrato anual. Se entrar nesse preço, em janeiro pego a 3ª torre deles no piso.", status: "pendente" },
    { propostaId: 2, solicitanteId: 1, nivel: "gerente", motivo: "cliente estratégico", justificativa: "Conta-âncora pra vertical hospitalar.", status: "aprovada", decididoPor: "Rafa Gomes" },
  ]);

  await db.insert(eventos).values([
    { propostaId: 1, ator: "Nizan Jhon", texto: "pediu alçada ao <b>diretor</b> (desvio de 14,0%)" },
    { propostaId: 2, ator: "Rafa Gomes", texto: "<b>aprovou a alçada</b> — proposta desbloqueada" },
    { propostaId: 3, ator: "Nizan Jhon", texto: "registrou a proposta dentro da alçada (2,0%)" },
  ]);

  console.log("Seed completo: 4 cargos, 3 usuários, 4 propostas, 2 alçadas, 3 eventos.");
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
