import { useMemo, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { usePapel } from '@/lib/papel';
import AlcadaBar from '@/components/AlcadaBar';
import { criarProposta, fmtBRL, fmtPct, zonaDoDesconto } from '@/lib/api';

/**
 * Página Nova Proposta (rotas `/` e `/nova`) — v0 demo funcional.
 * Form (cliente/composição/SLA) → preço da IA no painel escuro →
 * "Fechando o preço" com barra de alçada viva e CTA por zona.
 */

/* ── Seed Vetta Facilities (design-alcada/design.md) ─────────────────── */
interface CargoSeed {
  nome: string;
  detalhe: string;
  custoMensal: number;
  qtyInicial: number;
}
const CARGOS_SEED: CargoSeed[] = [
  { nome: 'Técnico de Manutenção', detalhe: 'pleno', custoMensal: 4200, qtyInicial: 2 },
  { nome: 'Auxiliar de Limpeza', detalhe: '', custoMensal: 2600, qtyInicial: 1 },
  { nome: 'Aux. Limpeza Crítica (hospitalar)', detalhe: 'esp. · margem 30%', custoMensal: 3400, qtyInicial: 0 },
  { nome: 'Supervisor de Conta', detalhe: 'sênior', custoMensal: 6800, qtyInicial: 0.5 },
];

const MARGEM_CASA = 0.28; // margem alvo = margem mínima (piso automático)
const FATOR_URGENCIA = 1.07; // SLA urgente 24h
const LIMITE_VENDEDOR = 5;
const LIMITE_GERENTE = 12;

const MOTIVOS = [
  'concorrência',
  'relacionamento',
  'volume futuro',
  'risco de churn',
  'cliente estratégico',
];

const FIELD_INPUT =
  'w-full rounded-xl border border-al-border bg-al-cream px-[14px] py-3 font-sans text-[14.5px] font-bold text-al-ink outline-none focus:border-al-green';
const FIELD_LABEL =
  'text-[11.5px] font-black uppercase tracking-[.08em] text-al-faint';

function QtyStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const step = (dir: 1 | -1) => onChange(Math.max(0, Math.round((value + dir * 0.5) * 2) / 2));
  return (
    <span className="inline-flex items-center overflow-hidden rounded-full border-[1.5px] border-al-border">
      <button
        type="button"
        aria-label="diminuir"
        onClick={() => step(-1)}
        className="flex h-[34px] w-[34px] items-center justify-center bg-white text-al-muted transition-colors hover:text-al-green"
      >
        <Minus className="h-4 w-4" strokeWidth={3} />
      </button>
      <span className="w-[46px] text-center text-[14.5px] font-black [font-variant-numeric:tabular-nums]">
        {value.toLocaleString('pt-BR')}
      </span>
      <button
        type="button"
        aria-label="aumentar"
        onClick={() => step(1)}
        className="flex h-[34px] w-[34px] items-center justify-center bg-white text-al-muted transition-colors hover:text-al-green"
      >
        <Plus className="h-4 w-4" strokeWidth={3} />
      </button>
    </span>
  );
}

export default function NovaProposta() {
  const { nome, iniciais } = usePapel();

  const [cliente, setCliente] = useState('Condomínio Residencial Vista Park');
  const [contato, setContato] = useState('Síndica Márcia · (83) 99988-7766');
  const [escopo, setEscopo] = useState(
    'Manutenção preventiva do condomínio (2 torres, 96 unidades), limpeza das áreas comuns e supervisão mensal com relatório.',
  );
  const [qtys, setQtys] = useState<number[]>(CARGOS_SEED.map((c) => c.qtyInicial));
  const [sla, setSla] = useState<'padrao' | 'urgente'>('urgente');
  const [duracao, setDuracao] = useState(12);
  const [motivo, setMotivo] = useState('relacionamento');
  const [salvando, setSalvando] = useState(false);

  /* ── Preço da IA: custo → piso (custo/(1−margem)) → urgência ── */
  const custoTotal = useMemo(
    () => CARGOS_SEED.reduce((acc, c, i) => acc + c.custoMensal * (qtys[i] ?? 0), 0),
    [qtys],
  );
  const piso = custoTotal / (1 - MARGEM_CASA);
  const precoIA = Math.round(piso * (sla === 'urgente' ? FATOR_URGENCIA : 1));
  const teto = Math.round((precoIA * 1.1) / 100) * 100;

  const [valorFinal, setValorFinal] = useState<number>(18400);

  const descontoPct = precoIA > 0 ? (1 - valorFinal / precoIA) * 100 : 0;
  const zona = zonaDoDesconto(descontoPct, LIMITE_VENDEDOR, LIMITE_GERENTE);

  const cta =
    zona === 'verde'
      ? { rotulo: 'Registrar proposta ✓', cls: 'bg-al-teal hover:bg-al-teal-ink' }
      : zona === 'ambar'
        ? { rotulo: 'Pedir alçada ao gerente →', cls: 'bg-al-green hover:bg-al-green-hover' }
        : { rotulo: 'Pedir alçada ao diretor →', cls: 'bg-al-red hover:bg-al-red-ink' };

  async function handleCta() {
    if (salvando) return;
    setSalvando(true);
    try {
      await criarProposta({
        cliente,
        contato,
        escopo,
        composicao: CARGOS_SEED.map((c, i) => ({
          nome: c.nome,
          custoMensal: c.custoMensal,
          quantidade: qtys[i] ?? 0,
        })),
        sla,
        duracaoMeses: duracao,
        precoIA,
        piso: Math.round(piso),
        valorFinal,
        descontoPct: Math.round(descontoPct * 10) / 10,
        motivo,
        zona,
      });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="flex flex-col gap-[18px]">
      {/* topbar */}
      <div className="flex items-center gap-3">
        <div className="font-display text-[22px] font-black tracking-[-0.01em]">
          Nova proposta
          <span className="mt-[2px] block font-sans text-[13px] font-bold text-al-muted">
            {cliente || 'Novo cliente'} · rascunho de hoje, 14h32
          </span>
        </div>
        <span className="ml-auto inline-flex items-center whitespace-nowrap rounded-full border border-al-border bg-white px-[15px] py-[9px] text-[12.5px] font-black text-al-muted">
          vendedor: {nome}
        </span>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-al-green text-[15px] font-black text-white">
          {iniciais}
        </div>
      </div>

      <div className="grid grid-cols-[1.5fr_1fr] items-start gap-[18px] max-[1150px]:grid-cols-1">
        <div className="flex flex-col gap-[18px]">
          {/* ══ Cliente e composição ══ */}
          <section className="rounded-[18px] border border-al-border bg-white px-[22px] py-5">
            <div className="mb-[14px] text-[15.5px] font-black">Cliente e composição do time</div>
            <div className="grid grid-cols-2 gap-x-4 max-[1150px]:grid-cols-1">
              <div className="mb-[14px] flex flex-col gap-[6px]">
                <label className={FIELD_LABEL} htmlFor="f-cliente">Cliente</label>
                <input
                  id="f-cliente"
                  className={FIELD_INPUT}
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                />
              </div>
              <div className="mb-[14px] flex flex-col gap-[6px]">
                <label className={FIELD_LABEL} htmlFor="f-contato">Contato</label>
                <input
                  id="f-contato"
                  className={FIELD_INPUT}
                  value={contato}
                  onChange={(e) => setContato(e.target.value)}
                />
              </div>
            </div>
            <div className="mb-[14px] flex flex-col gap-[6px]">
              <label className={FIELD_LABEL} htmlFor="f-escopo">O contrato cobre</label>
              <textarea
                id="f-escopo"
                rows={2}
                className={cn(FIELD_INPUT, 'resize-y')}
                value={escopo}
                onChange={(e) => setEscopo(e.target.value)}
              />
            </div>

            <div className="mb-[14px] mt-[6px] flex items-center gap-[9px] text-[15.5px] font-black">
              Time da proposta
              <span className="rounded-full border border-al-border bg-al-cream px-[10px] py-[3px] text-[11px] font-black text-al-muted">
                funções da sua empresa
              </span>
            </div>
            <div>
              {CARGOS_SEED.map((cargo, i) => (
                <div
                  key={cargo.nome}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-al-rail py-3 last:border-b-0"
                >
                  <div className="text-[14.5px] font-black">
                    {cargo.nome}
                    <span className="mt-[1px] block text-[12px] font-bold text-al-faint">
                      {cargo.detalhe ? `${cargo.detalhe} · ` : ''}custo consolidado{' '}
                      {fmtBRL(cargo.custoMensal)}/mês
                    </span>
                  </div>
                  <span className="text-[13px] font-extrabold text-al-muted [font-variant-numeric:tabular-nums]">
                    {(qtys[i] ?? 0) > 0 ? fmtBRL(cargo.custoMensal * (qtys[i] ?? 0)) : ''}
                  </span>
                  <QtyStepper
                    value={qtys[i] ?? 0}
                    onChange={(v) => setQtys((old) => old.map((q, j) => (j === i ? v : q)))}
                  />
                </div>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-x-4 max-[1150px]:grid-cols-1">
              <div className="flex flex-col gap-[6px]">
                <label className={FIELD_LABEL} htmlFor="f-sla">Prazo de resposta (SLA)</label>
                <select
                  id="f-sla"
                  className={FIELD_INPUT}
                  value={sla}
                  onChange={(e) => setSla(e.target.value as 'padrao' | 'urgente')}
                >
                  <option value="padrao">padrão (48h)</option>
                  <option value="urgente">urgente (24h) · ×1,07</option>
                </select>
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className={FIELD_LABEL} htmlFor="f-dur">Duração do contrato</label>
                <select
                  id="f-dur"
                  className={FIELD_INPUT}
                  value={duracao}
                  onChange={(e) => setDuracao(Number(e.target.value))}
                >
                  <option value={12}>12 meses</option>
                  <option value={6}>6 meses</option>
                  <option value={24}>24 meses</option>
                </select>
              </div>
            </div>
          </section>

          {/* ══ Fechando o preço + alçada ══ */}
          <section className="rounded-[18px] border border-al-border bg-white px-[22px] py-5">
            <div className="mb-[14px] flex items-center gap-[9px] text-[15.5px] font-black">
              Fechando o preço
              <span className="rounded-full border border-al-border bg-al-cream px-[10px] py-[3px] text-[11px] font-black text-al-muted">
                sua alçada: até −{LIMITE_VENDEDOR}%
              </span>
            </div>
            <div className="grid grid-cols-[1.2fr_1fr] gap-x-4 max-[1150px]:grid-cols-1">
              <div className="flex flex-col gap-[6px]">
                <label className={FIELD_LABEL} htmlFor="f-valor">Seu valor final (mensal)</label>
                <div className="flex items-center gap-[10px]">
                  <span className="font-black text-al-faint">R$</span>
                  <input
                    id="f-valor"
                    type="number"
                    step={50}
                    min={0}
                    className={cn(
                      FIELD_INPUT,
                      'w-full px-4 py-[14px] text-right text-[22px] font-black [font-variant-numeric:tabular-nums]',
                    )}
                    value={Number.isNaN(valorFinal) ? '' : valorFinal}
                    onChange={(e) => setValorFinal(e.target.value === '' ? 0 : Number(e.target.value))}
                  />
                </div>
                <div className="mt-2 flex justify-between text-[13.5px] font-extrabold">
                  <span>desconto implícito vs. preço da IA</span>
                  <span
                    className={cn(
                      '[font-variant-numeric:tabular-nums]',
                      zona === 'verde' && 'text-al-teal-ink',
                      zona === 'ambar' && 'text-al-amber-ink',
                      zona === 'vermelha' && 'text-al-red',
                    )}
                  >
                    {fmtPct(descontoPct)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className={FIELD_LABEL} htmlFor="f-motivo">Motivo do desvio</label>
                <select
                  id="f-motivo"
                  className={FIELD_INPUT}
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                >
                  {MOTIVOS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <AlcadaBar
              descontoPct={descontoPct}
              piso={Math.round(piso)}
              limiteVendedor={LIMITE_VENDEDOR}
              limiteGerente={LIMITE_GERENTE}
              valorFinal={valorFinal}
              motivo={motivo}
            />

            <div className="mt-[18px] flex gap-[10px]">
              <button
                type="button"
                onClick={handleCta}
                disabled={salvando}
                className={cn(
                  'flex-1 cursor-pointer rounded-full px-6 py-[14px] font-sans text-[14.5px] font-black text-white transition-colors disabled:cursor-wait disabled:opacity-70',
                  cta.cls,
                )}
              >
                {salvando ? 'Enviando…' : cta.rotulo}
              </button>
              <button
                type="button"
                onClick={() => toast('Rascunho salvo', { description: `${cliente} · ${fmtBRL(valorFinal)}/mês` })}
                className="cursor-pointer rounded-full border-[1.5px] border-al-border bg-white px-6 py-[14px] font-sans text-[14.5px] font-black text-al-ink transition-colors hover:border-al-green"
              >
                Salvar rascunho
              </button>
            </div>
          </section>
        </div>

        {/* ══ Painel escuro: Preço da IA ══ */}
        <aside className="sticky top-6 flex flex-col gap-4 rounded-[20px] bg-al-dark px-[26px] py-6 text-al-cream">
          <div className="text-[11px] font-black uppercase tracking-[.12em] text-al-sand">
            Preço da IA
          </div>
          <div>
            {CARGOS_SEED.filter((_, i) => (qtys[i] ?? 0) > 0).map((cargo) => {
              const i = CARGOS_SEED.indexOf(cargo);
              const q = qtys[i] ?? 0;
              return (
                <div
                  key={cargo.nome}
                  className="flex items-baseline justify-between gap-[10px] border-b border-white/10 pb-[10px] pt-[2px] text-[14px] font-bold text-al-border"
                >
                  <span>
                    {q.toLocaleString('pt-BR')}× {cargo.nome} ({fmtBRL(cargo.custoMensal)})
                  </span>
                  <span className="whitespace-nowrap font-black text-white [font-variant-numeric:tabular-nums]">
                    {fmtBRL(cargo.custoMensal * q)}
                  </span>
                </div>
              );
            })}
            <div className="flex items-baseline justify-between gap-[10px] border-b border-white/10 pb-[10px] pt-[10px] text-[14px] font-bold text-al-border">
              <span>custo consolidado do time</span>
              <span className="whitespace-nowrap font-black text-white [font-variant-numeric:tabular-nums]">
                {fmtBRL(custoTotal)}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-[10px] border-b border-white/10 pb-[10px] pt-[10px] text-[14px] font-bold text-al-border">
              <span>margem alvo da Vetta (28%)</span>
              <span className="whitespace-nowrap font-black text-white [font-variant-numeric:tabular-nums]">
                ÷ 0,72
              </span>
            </div>
            {sla === 'urgente' && (
              <div className="flex items-baseline justify-between gap-[10px] border-b border-white/10 pb-[10px] pt-[10px] text-[14px] font-bold text-al-border">
                <span>urgência (SLA 24h)</span>
                <span className="whitespace-nowrap font-black text-white [font-variant-numeric:tabular-nums]">
                  × 1,07
                </span>
              </div>
            )}
          </div>

          <div className="mt-1 flex items-baseline gap-2">
            <div className="font-display text-[52px] font-black leading-none tracking-[-0.02em] [font-variant-numeric:tabular-nums]">
              {fmtBRL(precoIA)}
            </div>
            <div className="text-[15px] font-extrabold text-al-sand">
              /mês
              <br />
              sugerido
            </div>
          </div>

          <div className="rounded-xl border border-al-mint/40 bg-al-mint/[.14] px-[14px] py-[11px] text-[13px] font-extrabold leading-[1.45] text-al-mint">
            Faixa segura: <b>{fmtBRL(Math.round(piso))} – {fmtBRL(teto)}</b>
            <br />
            Abaixo de {fmtBRL(Math.round(piso))} a margem fura o mínimo de 28% e o desvio vira
            governança.
          </div>

          <div className="mt-1 text-[11px] font-black uppercase tracking-[.12em] text-al-sand">
            Leitura da negociação
          </div>
          <div className="text-[13px] font-bold leading-[1.55] text-al-sand">
            Condomínio com 2 torres e assembleia aprovando contrato anual — conta estável, churn
            baixo. A IA sugere segurar o piso e negociar prazo em vez de preço.
          </div>
        </aside>
      </div>
    </div>
  );
}
