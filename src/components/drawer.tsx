"use client";

import clsx from "clsx";
import { ArrowLeft, ArrowRight, CalendarDays, Lock, Pencil, PhoneCall, X, XCircle } from "lucide-react";
import { useId, useRef, useState, type ReactNode } from "react";
import { useHistory } from "@/hooks/queries";
import { needsAttention } from "@/lib/attention";
import { acceptsValidity, missingForQuote, validityError } from "@/lib/catalog";
import { brl, dateBR, dateTimeBR, plural } from "@/lib/format";
import { Stage, type Opportunity } from "@/lib/types";
import { useCatalog } from "./app-data";
import { ATTENTION_LABEL, AttentionBadge, alertLevel } from "./attention-badge";
import { Avatar, Button, Input, RetryButton, SectionTitle, useDialogFocus } from "./ui";

const LIST = new Intl.ListFormat("pt-BR", { style: "long", type: "conjunction" });

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-10 items-start justify-between gap-4 border-b border-rule py-2.5 text-body last:border-0">
      <dt className="text-ink-2">{label}</dt>
      <dd className="text-right font-medium text-ink">{children}</dd>
    </div>
  );
}

const missingFor = (opp: Opportunity, to: Stage, today: string) => (to === Stage.APRESENTACAO_ORCAMENTO ? missingForQuote(opp, today) : []);

export function Drawer({
  opp,
  onClose,
  onMove,
  onContact,
  onSaveValidity,
  onRegisterLoss,
  contactPending,
  movePending,
  validityPending,
  validityError: serverValidityError,
}: {
  opp: Opportunity;
  onClose: () => void;
  onMove: (opp: Opportunity, to: Stage) => void;
  onContact: (opp: Opportunity) => void;
  onSaveValidity: (opp: Opportunity, date: string, onDone: () => void) => void;
  onRegisterLoss: (opp: Opportunity) => void;
  contactPending: boolean;
  movePending: boolean;
  validityPending: boolean;
  validityError?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const id = useId();
  useDialogFocus(ref, onClose);
  const history = useHistory(opp.id);
  const catalog = useCatalog();
  const { today, label: stageLabel } = catalog;
  const attention = opp.attention;
  const stage = catalog.stage(opp.stage);
  const next = opp.allowedTransitions;
  const current = stage.order;
  const forward = next.filter((to) => to !== Stage.PERDIDA && catalog.order(to) > current);
  const backward = next.filter((to) => to !== Stage.PERDIDA && catalog.order(to) < current);
  const canLose = next.includes(Stage.PERDIDA);
  const silent = opp.lastContactAt ? -catalog.daysFromToday(opp.lastContactAt) : null;
  const canEditValidity = acceptsValidity(catalog, opp.stage);
  const lossPending = opp.lossReasonPending;
  const lossText = opp.lossReason ? [opp.lossReason.label, opp.lossNote].filter(Boolean).join(": ") : null;
  const blocked = catalog.stages
    .filter((item) => item.id !== opp.stage && !next.includes(item.id))
    .map((item) => catalog.blockedReason(opp.stage, item.id))
    .filter((reason, index, all): reason is string => Boolean(reason) && all.indexOf(reason) === index);

  const moveHint = (to: Stage) => {
    const missing = missingFor(opp, to, today);
    if (missing.length > 0) return `Falta ${LIST.format(missing)}. Será pedido ao mover.`;
    if (to === Stage.FECHAMENTO) return "Etapa final. Pede confirmação.";
    return null;
  };

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [touched, setTouched] = useState(false);
  const draftError = validityError(draft, today);
  const shownDraftError = touched ? (draftError ?? serverValidityError) : undefined;

  const startEdit = () => {
    setDraft(opp.proposalValidUntil ?? "");
    setTouched(false);
    setEditing(true);
  };

  const saveValidity = () => {
    setTouched(true);
    if (draftError || validityPending) return;
    onSaveValidity(opp, draft, () => setEditing(false));
  };

  const validityText = opp.proposalValidUntil
    ? dateBR(opp.proposalValidUntil)
    : opp.stage === Stage.PRIMEIRO_CONTATO
      ? "Ainda sem proposta"
      : "Validade não informada";

  return (
    <div className="animate-fade fixed inset-0 z-40 bg-scrim" onMouseDown={onClose}>
      <aside
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-stage`}
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
        className="animate-slide absolute right-0 top-0 flex h-full w-full flex-col bg-overlay shadow-overlay outline-none sm:right-2 sm:top-2 sm:h-[calc(100%-1rem)] sm:w-[440px] sm:rounded-sheet sm:border sm:border-border"
      >
        <header className="flex items-start justify-between gap-3 border-b border-rule px-5 pb-4 pt-[max(16px,env(safe-area-inset-top))]">
          <div className="min-w-0">
            <p className="font-mono text-caption text-ink-2">{opp.code}</p>
            <h2 id={`${id}-title`} className="text-title font-semibold tracking-[-0.01em] text-ink">
              {opp.company}
            </h2>
            <p id={`${id}-stage`} className="mt-1 inline-flex items-center gap-2 text-body text-ink">
              <span className="size-2.5 rounded-full" style={{ background: stage.dot }} aria-hidden="true" />
              <span className="sr-only">Etapa atual: </span>
              {stage.label}
              {stage.final && (
                <span className="inline-flex items-center gap-1 text-ink-2">
                  · <Lock size={12} aria-hidden="true" /> Etapa final
                </span>
              )}
            </p>
          </div>
          <Button variant="plain" size="icon" onClick={onClose} aria-label="Fechar detalhes" className="-mr-2">
            <X size={18} aria-hidden="true" />
          </Button>
        </header>

        <div className="scroll-quiet flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-5">
          {needsAttention(attention) && (
            <div className="flex flex-col gap-2">
              <SectionTitle>Precisa de atenção · {ATTENTION_LABEL[alertLevel(attention.level)]}</SectionTitle>
              {attention.signals.map((signal) => (
                <AttentionBadge key={signal.code} attention={{ level: signal.level, signals: [signal] }} />
              ))}
            </div>
          )}

          {lossPending ? (
            <div className="flex flex-col gap-2 rounded-card bg-negative-tint px-3 py-2.5 text-body text-negative-ink">
              <p>
                <span className="font-semibold">Motivo da perda pendente.</span>{" "}
                {opp.lossReason ? `Registrado como “${opp.lossReason.label}”. ` : ""}Registre o motivo real para a equipe aprender com a perda.
              </p>
              <Button variant="danger-quiet" className="self-start" onClick={() => onRegisterLoss(opp)}>
                <Pencil size={14} aria-hidden="true" /> Registrar motivo
              </Button>
            </div>
          ) : (
            opp.stage === Stage.PERDIDA &&
            lossText && (
              <div className="rounded-card bg-negative-tint px-3 py-2.5 text-body text-negative-ink">
                <span className="font-semibold">Motivo da perda:</span> {lossText}
              </div>
            )
          )}

          <div className="flex flex-col gap-2">
            <dl className="rounded-card bg-raised px-3.5">
              <Row label="Valor estimado">
                <span className={clsx("tabular", opp.estimatedValue == null && "font-normal text-ink-2")}>{brl(opp.estimatedValue)}</span>
              </Row>
              <Row label="Vendedor">
                <span className="inline-flex items-center gap-2">
                  <Avatar name={opp.seller.name} /> {opp.seller.name}
                </span>
              </Row>
              <Row label="Último contato">
                <span className={clsx("tabular", !opp.lastContactAt && "font-normal text-ink-2")}>{dateBR(opp.lastContactAt)}</span>
                {silent != null && silent > 0 && <span className="block text-caption font-normal text-ink-2">há {plural(silent, "dia", "dias")}</span>}
              </Row>
              <Row label="Validade da proposta">
                <span className={clsx("tabular", !opp.proposalValidUntil && "font-normal text-ink-2")}>{validityText}</span>
                {canEditValidity && !editing && (
                  <button
                    type="button"
                    onClick={startEdit}
                    className="relative ml-auto mt-1 flex cursor-pointer items-center justify-end gap-1 rounded-control text-caption font-semibold text-accent-ink after:absolute after:-inset-x-1 after:-inset-y-2 hover:underline hover:underline-offset-2 coarse:after:-inset-y-3.5"
                  >
                    <Pencil size={12} aria-hidden="true" /> Editar validade
                  </button>
                )}
              </Row>
              <Row label="Evento do cliente">
                <span className={clsx("inline-flex items-center gap-1.5 tabular", !opp.eventDate && "font-normal text-ink-2")}>
                  <CalendarDays size={14} aria-hidden="true" className="text-ink-2" />
                  {dateBR(opp.eventDate)}
                </span>
              </Row>
            </dl>

            {editing && (
              <form
                noValidate
                aria-label="Editar validade da proposta"
                onSubmit={(event) => {
                  event.preventDefault();
                  saveValidity();
                }}
                className="animate-rise flex flex-col gap-3 rounded-card border border-border px-3.5 py-3"
              >
                <label className="flex flex-col gap-1.5 text-body font-medium">
                  Nova validade da proposta
                  <Input
                    type="date"
                    required
                    min={today}
                    autoFocus
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    aria-invalid={Boolean(shownDraftError)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        event.stopPropagation();
                        setEditing(false);
                      }
                    }}
                  />
                  {shownDraftError ? (
                    <span role="alert" className="text-caption font-normal text-negative">
                      {shownDraftError}
                    </span>
                  ) : (
                    opp.eventDate &&
                    draft > opp.eventDate && (
                      <span className="text-caption font-normal text-ink-2">A validade passa da data do evento ({dateBR(opp.eventDate)}).</span>
                    )
                  )}
                </label>
                <div className="flex justify-end gap-2">
                  <Button onClick={() => setEditing(false)} disabled={validityPending}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" disabled={validityPending}>
                    {validityPending ? "Salvando…" : "Salvar validade"}
                  </Button>
                </div>
              </form>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <SectionTitle>Itens de brinde</SectionTitle>
            {opp.items.length === 0 ? (
              <p className="text-body text-ink-2">Nenhum brinde informado. É obrigatório para gerar o orçamento.</p>
            ) : (
              <ul className="rounded-card bg-raised px-3.5">
                {opp.items.map((item) => (
                  <li key={item.id} className="flex min-h-10 items-center justify-between gap-4 border-b border-rule py-2.5 text-body last:border-0">
                    <span className="font-medium">{item.name}</span>
                    <span className="tabular text-ink-2">{item.quantity.toLocaleString("pt-BR")} un.</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <SectionTitle>Próximas etapas possíveis</SectionTitle>
            <div className="rounded-card bg-raised px-3.5 py-3 text-body">
              {next.length === 0 ? (
                <p className="text-ink-2">Nenhuma. {catalog.lockedReason(opp.stage) ?? `${stage.label} é uma etapa final e não pode ser movida.`}</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {next.map((to) => {
                    const missing = missingFor(opp, to, today);
                    return (
                      <li key={to}>
                        <span className="font-medium">{stageLabel(to)}</span>
                        <span className="text-ink-2"> · {catalog.stage(to).requirement ?? "Sem campos obrigatórios."}</span>
                        {missing.length > 0 && <span className="block text-caption font-medium text-negative">Falta {LIST.format(missing)}.</span>}
                      </li>
                    );
                  })}
                </ul>
              )}
              {next.length > 0 && blocked.length > 0 && (
                <ul aria-label="Movimentos bloqueados" className="mt-3 flex list-disc flex-col gap-1 border-t border-border pl-4 pt-3 text-caption text-ink-2">
                  {blocked.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <SectionTitle>Histórico de etapas</SectionTitle>
            {history.isLoading && <div aria-label="Carregando histórico" className="h-12 rounded-card bg-raised" />}
            {history.isError && (
              <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-card bg-negative-tint px-3 py-2 text-body text-negative-ink">
                Não foi possível carregar o histórico.
                <RetryButton retrying={history.isFetching} onRetry={() => history.refetch()} />
              </div>
            )}
            {history.data && (
              <ol className="ml-1 space-y-4 border-l border-border-strong pl-5">
                {history.data.map((entry) => (
                  <li key={entry.id} className="relative text-body">
                    <span className="absolute -left-[25px] top-1.5 size-2.5 rounded-full border-2 border-overlay bg-ink-2" aria-hidden="true" />
                    <p className="font-medium">{entry.from ? `${stageLabel(entry.from)} → ${stageLabel(entry.to)}` : stageLabel(entry.to)}</p>
                    <p className="text-caption tabular text-ink-2">{dateTimeBR(entry.at)}</p>
                    {entry.note && <p className="mt-0.5 text-caption text-ink-2">{entry.note}</p>}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        {next.length > 0 && (
          <footer className="flex flex-col gap-3 border-t border-rule px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-4">
            <div className="flex flex-col gap-2">
              {[...forward, ...backward].map((to) => {
                const hint = moveHint(to);
                const back = backward.includes(to);
                return (
                  <div key={to} className="flex min-w-0 flex-col gap-1">
                    <Button
                      variant={back ? "secondary" : "primary"}
                      className="h-auto! min-h-control w-full whitespace-normal py-2 text-center"
                      disabled={movePending}
                      aria-describedby={hint ? `${id}-hint-${to}` : undefined}
                      onClick={() => onMove(opp, to)}
                    >
                      {back ? (
                        <>
                          <ArrowLeft size={16} aria-hidden="true" /> Voltar para {stageLabel(to)}
                        </>
                      ) : (
                        <>
                          Mover para {stageLabel(to)} <ArrowRight size={16} aria-hidden="true" />
                        </>
                      )}
                    </Button>
                    {hint && (
                      <span id={`${id}-hint-${to}`} className="text-center text-caption text-ink-2">
                        {hint}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 max-sm:flex-col max-sm:items-stretch">
              <Button onClick={() => onContact(opp)} disabled={contactPending}>
                <PhoneCall size={16} aria-hidden="true" /> Registrar contato hoje
              </Button>
              {canLose && (
                <Button variant="danger-quiet" disabled={movePending} onClick={() => onMove(opp, Stage.PERDIDA)}>
                  <XCircle size={16} aria-hidden="true" /> Marcar como perdida
                </Button>
              )}
            </div>
          </footer>
        )}
      </aside>
    </div>
  );
}
