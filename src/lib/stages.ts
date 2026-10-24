import { Stage } from "./types";

const STAGE_COLORS: Record<Stage, string> = {
  [Stage.PRIMEIRO_CONTATO]: "var(--stage-primeiro)",
  [Stage.APRESENTACAO_ORCAMENTO]: "var(--stage-orcamento)",
  [Stage.FOLLOW_UP]: "var(--stage-followup)",
  [Stage.FORECAST]: "var(--stage-forecast)",
  [Stage.FECHAMENTO]: "var(--stage-fechamento)",
  [Stage.PERDIDA]: "var(--stage-perdida)",
};

export const stageColor = (stage: Stage) => STAGE_COLORS[stage] ?? "var(--ink-2)";

export const LANDING_STAGES: Stage[] = [Stage.FOLLOW_UP, Stage.FORECAST];

export const lockedBadge = (stage: Stage) => (stage === Stage.PERDIDA ? "Perdida" : "Venda fechada");
