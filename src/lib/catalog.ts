import { addDays, dateBR, daysBetween } from "./format";
import { stageColor } from "./stages";
import { Stage, type Catalogs, type LossReasonOption, type Opportunity, type StageCatalogItem } from "./types";

export interface StageView extends StageCatalogItem {
  dot: string;
}

export interface Catalog {
  today: string;
  stages: StageView[];
  lossReasons: LossReasonOption[];
  activeLossReasons: LossReasonOption[];
  stage: (id: Stage) => StageView;
  label: (id: Stage) => string;
  isFinal: (id: Stage) => boolean;
  order: (id: Stage) => number;
  transitions: (from: Stage) => Stage[];
  blockedReason: (from: Stage, to: Stage) => string | null;
  lockedReason: (stage: Stage) => string | null;
  daysFromToday: (iso: string) => number;
  inDays: (days: number) => string;
}

export const validityError = (date: string, today: string) =>
  !date
    ? "Informe a validade da proposta."
    : date < today
      ? `A validade não pode ser anterior a hoje (${dateBR(today)}).`
      : undefined;

export function blockedReason(catalogs: Pick<Catalogs, "blockedReasons" | "transitions">, from: Stage, to: Stage): string | null {
  if (from === to) return null;
  const reason = catalogs.blockedReasons[from]?.[to] ?? null;
  if (reason) return reason;
  return catalogs.transitions[from]?.includes(to) ? null : "Movimento não permitido.";
}

export function lockedReason(catalogs: Pick<Catalogs, "blockedReasons" | "stages">, stage: Stage): string | null {
  if (!catalogs.stages.find((item) => item.id === stage)?.final) return null;
  const reasons = Object.values(catalogs.blockedReasons[stage] ?? {});
  return reasons.find((reason): reason is string => Boolean(reason)) ?? null;
}

export function buildCatalog(catalogs: Catalogs): Catalog {
  const stages = [...catalogs.stages].sort((a, b) => a.order - b.order).map((item) => ({ ...item, dot: stageColor(item.id) }));
  const byId = new Map(stages.map((item) => [item.id, item]));
  const stage = (id: Stage): StageView =>
    byId.get(id) ?? { id, label: id, order: Number.MAX_SAFE_INTEGER, final: false, hint: "", requirement: null, dot: stageColor(id) };
  return {
    today: catalogs.today,
    stages,
    lossReasons: catalogs.lossReasons,
    activeLossReasons: catalogs.lossReasons.filter((reason) => reason.active),
    stage,
    label: (id) => stage(id).label,
    isFinal: (id) => stage(id).final,
    order: (id) => stage(id).order,
    transitions: (from) => catalogs.transitions[from] ?? [],
    blockedReason: (from, to) => blockedReason(catalogs, from, to),
    lockedReason: (id) => lockedReason(catalogs, id),
    daysFromToday: (iso) => daysBetween(catalogs.today, iso),
    inDays: (days) => addDays(catalogs.today, days),
  };
}

export const canMoveTo = (opp: Opportunity, to: Stage) => opp.allowedTransitions.includes(to);

export function missingForQuote(opp: Opportunity, today: string) {
  const missing: string[] = [];
  if ((opp.estimatedValue ?? 0) <= 0) missing.push("valor");
  if (opp.items.length === 0) missing.push("brinde");
  if (!opp.proposalValidUntil || opp.proposalValidUntil < today) missing.push("validade");
  return missing;
}

export const acceptsValidity = (catalog: Catalog, stage: Stage) => !catalog.isFinal(stage) && stage !== Stage.PRIMEIRO_CONTATO;
