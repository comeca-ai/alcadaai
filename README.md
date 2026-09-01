# Alçada — Governança de Desconto

> O desconto agora tem dono.

Plataforma para empresas com time comercial: a IA calcula o preço da proposta a partir do **custo real dos cargos**, cada vendedor tem uma **faixa de desconto que aprova sozinho**, e acima dela o sistema exige **alçada** do gerente/diretor. Kanban com **gate de evidência**: sem prova, o card não passa de fase.

**Produção:** vitrine https://alcada.ia.br/ · app https://app.alcada.ia.br/

**Stack:** React 19 + Vite + TypeScript + Tailwind + shadcn/ui · Hono + tRPC 11 · Drizzle ORM + MySQL 8 · Docker

---

## O que tem no v0

| Tela | Rota | O que faz |
|---|---|---|
| Nova proposta | `/nova` | composição de cargos × quantidades → preço da IA (custo × margem × urgência) → barra de alçada viva (verde/âmbar/vermelho + piso) → registrar ou pedir alçada |
| Kanban | `/kanban` | 4 fases (Dados → Elaborando → Revisão & Alçada → Enviar), passaporte de evidências por card, avanço com gate **server-side** |
| Minhas propostas | `/minhas` | pipeline com semáforo de desvio e KPIs do vendedor |
| Painel do diretor | `/diretor` | fila de alçadas, aprovar/devolver, margem em risco, leaderboard de desvio |

## Arquitetura

```
React (src/) ──tRPC──▶ Hono (api/) ──Drizzle──▶ MySQL
```

- `db/schema.ts` — `cargos`, `usuarios`, `propostas`, `alcadas`, `eventos` (audit trail)
- `api/queries/ops.ts` — motor de preço (piso = custo ÷ (1 − margem)), zonas de alçada, gate de evidências do kanban
- `api/router.ts` — routers: `cargos`, `usuarios`, `preco.calcular`, `propostas`, `alcada`, `kanban.avancar`, `eventos`
- `db/seed.ts` — tenant demo "Vetta Facilities" (4 cargos, 3 usuários, 4 propostas em vários estados)

## Rodar local

```bash
pnpm install
pnpm db:push        # precisa de DATABASE_URL no .env
node node_modules/.pnpm/tsx@*/node_modules/tsx/dist/cli.mjs db/seed.ts
pnpm dev            # http://localhost:3000
```

## Deploy (VPS central, padrão Docker + Caddy)

```bash
docker build -t alcada:<tag> .                                    # imagem (build com pnpm)
docker build --target build -t alcada-build:<tag> .               # imagem de setup (migrações/seed)
cd /srv/apps/alcada && docker compose --env-file release.env up -d
```

- Segredos em `mysql.env` / `release.env` (gitignored — ver `deploy/*.example`)
- Site no Caddy central: `deploy` segue INFRA.md — mTLS + Origin CA da zona
- DNS: `A @`, `A app` → IP do host, proxy laranja, Full (strict), AOP ON

## Pendências (roadmap)

- [ ] Auth real (graft `--features auth`)
- [ ] WhatsApp: alçada aprovável direto na conversa (Evolution API)
- [ ] Diff do documento final (three-way match)
- [ ] Relatório "Por Que Damos Desconto" + Termômetro público
- [ ] Multi-tenant de verdade (hoje: 1 tenant seed)
