"use client";

import { useDroppable } from "@dnd-kit/core";
import clsx from "clsx";
import { Ban, Funnel, Info, Lock, SearchX } from "lucide-react";
import { useCallback, useId, useRef, useState } from "react";
import { brl } from "@/lib/format";
import type { StageView } from "@/lib/catalog";
import type { Opportunity } from "@/lib/types";
import { DraggableCard } from "./card";
import { useDismiss } from "./ui";

export type DropState = "idle" | "allowed" | "blocked";

function StageHint({ stage }: { stage: StageView }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, ref);

  return (
    <div ref={ref} className="contents">
      <button
        type="button"
        aria-label={`Sobre a etapa ${stage.label}`}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className="relative inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-control text-ink-2 transition-colors after:absolute after:-inset-1 hover:bg-active hover:text-ink coarse:after:-inset-2.5"
      >
        <Info size={14} aria-hidden="true" />
      </button>
      {open && (
        <div
          id={id}
          role="note"
          className="animate-rise absolute inset-x-1 top-full z-10 mt-1 rounded-panel border border-border bg-overlay p-3 text-caption font-normal text-ink shadow-float"
        >
          {stage.hint}
        </div>
      )}
    </div>
  );
}

export function Column({
  stage,
  items,
  total,
  dropState,
  blockedMessage,
  filtering,
  filteredOut = false,
  landedId = null,
  onOpen,
}: {
  stage: StageView;
  items: Opportunity[];
  total: number;
  dropState: DropState;
  blockedMessage?: string | null;
  filtering: boolean;
  filteredOut?: boolean;
  landedId?: string | null;
  onOpen: (opp: Opportunity) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  const sum = items.reduce((acc, opp) => acc + (opp.estimatedValue ?? 0), 0);
  const noValues = items.every((opp) => opp.estimatedValue == null);
  const over = dropState === "allowed" && isOver;
  const noun = (n: number) => (n === 1 ? "oportunidade" : "oportunidades");
  const countLabel = filtering && items.length !== total ? `${items.length} de ${total} ${noun(total)}` : `${items.length} ${noun(items.length)}`;

  return (
    <section
      ref={setNodeRef}
      aria-label={stage.label}
      className={clsx(
        "relative -mx-[5px] flex min-w-0 flex-[1_0_282px] snap-start min-[1400px]:flex-[1_0_224px] flex-col rounded-panel border p-1 transition-[border-color,background-color] duration-[var(--dur-slow)] ease-out after:pointer-events-none after:absolute after:inset-0 after:rounded-panel after:bg-sheet after:opacity-0 after:transition-opacity after:duration-[var(--dur-slow)] after:content-[''] md:min-h-0",
        dropState === "idle" && "border-border bg-surface",
        dropState === "allowed" && !over && "border-border bg-accent-tint",
        over && "border-accent bg-accent-tint-strong",
        dropState === "blocked" && "border-border bg-surface after:opacity-60",
      )}
    >
      <header className="relative px-[13px] pb-2.5 pt-1">
        <div className="flex items-center gap-1.5">
          <span className="size-2 shrink-0 rounded-full" style={{ background: stage.dot }} aria-hidden="true" />
          <h2 title={stage.label} className="min-w-0 truncate text-body font-semibold text-ink">
            {stage.label}
          </h2>
          {stage.final && (
            <span title="Etapa final" className="relative inline-flex shrink-0 text-ink-2">
              <Lock size={14} aria-hidden="true" />
              <span className="sr-only">Etapa final</span>
            </span>
          )}
          <StageHint stage={stage} />
        </div>
        <p className="relative mt-0.5 flex flex-wrap items-center gap-x-1.5 pl-3.5 text-caption text-ink-2">
          <span className="tabular">{countLabel}</span>
          <span className="whitespace-nowrap">
            <span aria-hidden="true">· </span>
            {noValues ? (
              <>
                <span aria-hidden="true">—</span>
                <span className="sr-only">Valor não informado</span>
              </>
            ) : (
              <span className="tabular">{brl(sum)}</span>
            )}
          </span>
        </p>
      </header>

      {dropState === "blocked" && isOver && blockedMessage && (
        <div
          aria-hidden="true"
          className="animate-rise mx-1 mb-2 flex items-start gap-1.5 rounded-control bg-negative-tint px-2.5 py-2 text-caption font-medium text-negative-ink"
        >
          <Ban size={14} className="mt-px shrink-0" aria-hidden="true" />
          {blockedMessage}
        </div>
      )}

      <div className="scroll-quiet -m-1 flex min-h-28 flex-1 flex-col gap-2 p-1 md:overflow-y-auto">
        {items.map((opp) => (
          <DraggableCard key={opp.id} opp={opp} onOpen={onOpen} locked={stage.final} landed={opp.id === landedId} />
        ))}
        {items.length === 0 && (
          <div className="flex min-h-28 flex-col items-center justify-center gap-1.5 rounded-card border border-dashed border-border px-4 py-6 text-center text-caption text-ink-2">
            {filteredOut ? <Funnel size={16} aria-hidden="true" /> : <SearchX size={16} aria-hidden="true" />}
            {filteredOut
              ? "Filtro por etapa ativo"
              : filtering && total > 0
                ? "Nenhuma oportunidade com esses filtros"
                : "Nenhuma oportunidade nesta etapa"}
          </div>
        )}
      </div>
    </section>
  );
}
