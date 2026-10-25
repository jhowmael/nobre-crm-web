"use client";

import clsx from "clsx";
import { Check, CircleCheck, LoaderCircle, RotateCw } from "lucide-react";
import { Fragment } from "react";
import { brlCompact } from "@/lib/format";
import { countByLevel, type TaskGroup } from "@/lib/tasks";
import type { Opportunity } from "@/lib/types";
import { useCatalog } from "./app-data";
import { ATTENTION_LABEL, AttentionIcon, alertLevel } from "./attention-badge";
import { Button } from "./ui";

function Stat({ label, value, tone, fetching = false }: { label: string; value: string; tone?: "negative" | "warning"; fetching?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="truncate text-caption text-ink-2">{label}</dt>
      <dd
        className={clsx(
          "flex items-center gap-1.5 text-headline font-semibold tabular sm:text-figure sm:tracking-[-0.01em]",
          tone === "negative" && "text-negative",
          tone === "warning" && "text-warning-ink",
        )}
      >
        {value}
        {fetching && <LoaderCircle size={14} aria-hidden="true" className="animate-spin text-ink-2" />}
      </dd>
    </div>
  );
}

export type TasksState = "loading" | "error" | "ready";

export function Summary({
  opportunities,
  groups,
  tasksState,
  tasksFetching = false,
  scope,
  fetching = false,
  onOpen,
  onComplete,
  onRetryTasks,
}: {
  opportunities: Opportunity[];
  groups: TaskGroup[];
  tasksState: TasksState;
  tasksFetching?: boolean;
  scope: string | null;
  fetching?: boolean;
  onOpen: (opportunityId: string) => void;
  onComplete: (group: TaskGroup) => void;
  onRetryTasks: () => void;
}) {
  const catalog = useCatalog();
  const open = opportunities.filter((opp) => !catalog.isFinal(opp.stage));
  const pipeline = open.reduce((sum, opp) => sum + (opp.estimatedValue ?? 0), 0);
  const { high, medium } = countByLevel(groups);
  const ready = tasksState === "ready";
  const headingId = "para-trabalhar-hoje";

  return (
    <section
      aria-label={scope ? `Resumo do funil de ${scope}` : "Resumo do funil"}
      className="relative grid grid-cols-1 rounded-card border border-border bg-surface xl:grid-cols-[minmax(0,1fr)_auto]"
    >
      <div className="flex min-w-0 flex-col gap-2 p-3">
        <h2 id={headingId} className="flex items-center gap-1.5 text-body font-semibold text-ink">
          <span>
            Para trabalhar hoje
            {scope && <span className="font-normal text-ink-2"> · {scope}</span>}
          </span>
          {tasksFetching && ready && <LoaderCircle size={14} aria-hidden="true" className="animate-spin text-ink-2" />}
        </h2>
        {tasksState === "loading" && (
          <div role="status" aria-label="Carregando tarefas de retorno" className="-mx-1 flex gap-2 overflow-hidden px-1 pb-1">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex min-h-13 w-[272px] shrink-0 flex-col justify-center gap-1.5 rounded-control bg-raised px-3 py-2">
                <div className="h-4 w-40 rounded-[4px] bg-active" />
                <div className="h-3 w-52 rounded-[4px] bg-active" />
              </div>
            ))}
          </div>
        )}
        {tasksState === "error" && (
          <div role="alert" className="flex flex-wrap items-center gap-x-3 gap-y-2 text-body">
            <span className="text-ink-2">Não foi possível carregar as tarefas de retorno.</span>
            <Button onClick={onRetryTasks} disabled={tasksFetching}>
              <RotateCw size={16} aria-hidden="true" className={tasksFetching ? "animate-spin" : undefined} />
              {tasksFetching ? "Tentando…" : "Tentar novamente"}
            </Button>
          </div>
        )}
        {ready && groups.length === 0 && (
          <p className="flex items-center gap-2 text-body text-ink-2">
            <CircleCheck size={16} aria-hidden="true" className="shrink-0 text-positive" />
            Tudo em dia. Nenhuma tarefa de retorno para hoje.
          </p>
        )}
        {ready && groups.length > 0 && (
          <ul aria-labelledby={headingId} className="scroll-quiet -mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1">
            {groups.map((group, index) => {
              const level = alertLevel(group.level);
              const isHigh = level === "high";
              const label = ATTENTION_LABEL[level];
              const reasons = group.reasons.join(" · ");
              const startsGroup = index > 0 && alertLevel(groups[index - 1].level) !== level;
              return (
                <Fragment key={group.opportunityId}>
                  {startsGroup && <li aria-hidden="true" className="mx-1 w-px shrink-0 self-stretch bg-border" />}
                  <li className="flex w-[272px] shrink-0 snap-start rounded-control bg-raised">
                    <button
                      type="button"
                      onClick={() => onOpen(group.opportunityId)}
                      title={`${group.company} (${group.opportunityCode}): ${reasons}`}
                      aria-label={`${label}: ${group.company}, ${group.opportunityCode}. ${group.reasons.join(". ")}. Abrir detalhes.`}
                      className="relative flex min-h-13 min-w-0 flex-1 cursor-pointer flex-col justify-center gap-0.5 rounded-l-control px-3 py-2 text-left transition-colors hover:bg-active active:bg-border"
                    >
                      <span aria-hidden="true" className="flex min-w-0 items-center gap-1.5">
                        <span
                          className={clsx(
                            "inline-flex shrink-0 items-center gap-1 rounded-[4px] px-1.5 text-caption font-medium",
                            isHigh ? "bg-negative-tint text-negative-ink" : "bg-warning-tint text-warning-ink",
                          )}
                        >
                          <AttentionIcon level={level} size={12} />
                          {label}
                        </span>
                        <span className="truncate text-body font-semibold text-ink">{group.company}</span>
                      </span>
                      <span aria-hidden="true" className="truncate text-caption text-ink-2">
                        <span className="font-mono">{group.opportunityCode}</span> · {reasons}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onComplete(group)}
                      title="Concluir"
                      aria-label={`Concluir ${group.tasks.length === 1 ? "tarefa" : `${group.tasks.length} tarefas`} de ${group.company}`}
                      className="relative inline-flex w-10 shrink-0 cursor-pointer items-center justify-center rounded-r-control coarse:w-11 border-l border-rule text-ink-2 transition-colors hover:bg-active hover:text-positive active:bg-border"
                    >
                      <Check size={16} aria-hidden="true" />
                    </button>
                  </li>
                </Fragment>
              );
            })}
          </ul>
        )}
      </div>

      <dl className="grid grid-cols-2 content-center gap-x-6 gap-y-2 p-3 max-xl:border-t max-xl:border-rule sm:grid-cols-4 xl:border-l xl:border-rule">
        <Stat label="Em aberto" value={String(open.length)} fetching={fetching} />
        <Stat label="Valor no funil" value={brlCompact(pipeline)} />
        <Stat label="Agir hoje" value={ready ? String(high) : "—"} tone={ready && high > 0 ? "negative" : undefined} />
        <Stat label="Acompanhar" value={ready ? String(medium) : "—"} tone={ready && medium > 0 ? "warning" : undefined} />
      </dl>

      <span role="status" className="sr-only">
        {fetching ? "Atualizando oportunidades…" : ""}
      </span>
    </section>
  );
}
