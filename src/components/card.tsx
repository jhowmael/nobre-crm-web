"use client";

import { useDraggable } from "@dnd-kit/core";
import clsx from "clsx";
import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { CalendarDays, Lock, Package } from "lucide-react";
import { brlCompact, dateBR, firstName } from "@/lib/format";
import { lockedBadge } from "@/lib/stages";
import type { Opportunity } from "@/lib/types";
import { useCatalog } from "./app-data";
import { ATTENTION_LABEL, AttentionBadge, alertLevel } from "./attention-badge";
import { Avatar, LossPendingBadge } from "./ui";

export function CardView({ opp, dragging = false, locked = false }: { opp: Opportunity; dragging?: boolean; locked?: boolean }) {
  const first = opp.items[0];
  const extra = opp.items.length - 1;

  return (
    <div
      className={clsx(
        "@container relative flex flex-col gap-2 rounded-card border bg-surface p-3 text-left",
        dragging
          ? "animate-lift cursor-grabbing border-border-strong shadow-drag will-change-transform [backface-visibility:hidden]"
          : "transition-[border-color] duration-[var(--dur)] border-border group-hover:border-border-strong",
      )}
    >
      <div className="flex items-center justify-between gap-2 text-caption text-ink-2">
        <span className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
          <span className="whitespace-nowrap font-mono">{opp.code}</span>
          {locked && (
            <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-[4px] bg-raised px-1.5 text-ink-2" title="Etapa final: não pode ser movido">
              <Lock size={12} aria-hidden="true" />
              {lockedBadge(opp.stage)}
            </span>
          )}
          {opp.lossReasonPending && <LossPendingBadge />}
        </span>
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="hidden truncate @[14rem]:inline">{firstName(opp.seller.name)}</span>
          <Avatar name={opp.seller.name} />
        </span>
      </div>
      <div className="text-headline font-semibold text-ink">{opp.company}</div>
      <div className="flex min-w-0 items-center gap-1.5 text-body text-ink-2">
        <Package size={14} className="shrink-0" aria-hidden="true" />
        {first ? (
          <span className="truncate">
            {first.name} · <span className="tabular">{first.quantity.toLocaleString("pt-BR")}</span> un.{extra > 0 && ` +${extra}`}
          </span>
        ) : (
          <span>Nenhum brinde informado</span>
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className={clsx("tabular", opp.estimatedValue == null ? "text-body text-ink-2" : "text-body font-semibold text-ink")}>
          {brlCompact(opp.estimatedValue)}
        </span>
        <span className="flex items-center gap-1 text-caption text-ink-2" title="Data do evento">
          <CalendarDays size={14} aria-hidden="true" />
          <span className="tabular">{opp.eventDate ? dateBR(opp.eventDate).slice(0, 5) : "Sem data"}</span>
        </span>
      </div>
      {opp.proposalValidUntil && (
        <div className="text-caption text-ink-2">
          Proposta válida até <span className="tabular">{dateBR(opp.proposalValidUntil).slice(0, 5)}</span>
        </div>
      )}
      <AttentionBadge attention={opp.attention} compact />
    </div>
  );
}

const RESISTANCE = 0.16;
const MAX_PULL = 14;
const clampPull = (value: number) => Math.max(-MAX_PULL, Math.min(MAX_PULL, value * RESISTANCE));

export function DraggableCard({
  opp,
  onOpen,
  locked,
  landed = false,
}: {
  opp: Opportunity;
  onOpen: (opp: Opportunity) => void;
  locked: boolean;
  landed?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: opp.id,
    disabled: locked,
    attributes: { roleDescription: locked ? "card bloqueado" : "card arrastável" },
  });
  const [pull, setPull] = useState<{ x: number; y: number } | null>(null);
  const [anchor, setAnchor] = useState<{ left: number; width: number; bottom: number } | null>(null);
  const [released, setReleased] = useState(false);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);
  const catalog = useCatalog();
  const reason = catalog.lockedReason(opp.stage);
  const signal = opp.attention.signals[0];
  const label = [
    `${opp.company}, ${opp.code}`,
    `Etapa ${catalog.label(opp.stage)}`,
    ...(opp.lossReasonPending ? ["Motivo da perda pendente"] : []),
    opp.attention.level === "none" || !signal ? "Sem alertas" : `${ATTENTION_LABEL[alertLevel(opp.attention.level)]}: ${signal.message}`,
    `Valor ${brlCompact(opp.estimatedValue)}`,
    `Evento ${dateBR(opp.eventDate)}`,
    `Vendedor ${opp.seller.name}`,
  ].join(". ");

  const startPull = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!locked || event.button !== 0) return;
    origin.current = { x: event.clientX, y: event.clientY };
    const rect = event.currentTarget.getBoundingClientRect();
    setAnchor({ left: rect.left, width: rect.width, bottom: window.innerHeight - rect.top + 8 });
    moved.current = false;
    setReleased(false);

    const onMove = (move: PointerEvent) => {
      if (!origin.current) return;
      const dx = move.clientX - origin.current.x;
      const dy = move.clientY - origin.current.y;
      if (Math.hypot(dx, dy) > 6) {
        moved.current = true;
        setPull({ x: clampPull(dx), y: clampPull(dy) });
      }
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      origin.current = null;
      if (moved.current) {
        setReleased(true);
        setPull(null);
        setTimeout(() => setReleased(false), 600);
      }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  return (
    <div className="relative">
      {locked && pull && reason && anchor && (
        <div
          role="status"
          style={anchor}
          className="animate-rise pointer-events-none fixed z-40 flex items-start gap-1.5 rounded-panel border border-border bg-overlay px-3 py-2 text-caption font-medium text-ink shadow-float"
        >
          <Lock size={14} className="mt-px shrink-0 text-negative" aria-hidden="true" />
          {reason}
        </div>
      )}
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        aria-label={`${label}.${locked ? " Etapa final: não pode ser movido." : ""} Enter abre os detalhes.`}
        onPointerDown={startPull}
        onClick={() => {
          if (moved.current) {
            moved.current = false;
            return;
          }
          onOpen(opp);
        }}
        onKeyDown={(event) => {
          if (isDragging) return;
          if (event.key === "Enter" || (locked && event.key === " ")) {
            event.preventDefault();
            onOpen(opp);
            return;
          }
          listeners?.onKeyDown?.(event);
        }}
        style={pull ? { transform: `translate(${pull.x}px, ${pull.y}px)`, transition: "none" } : undefined}
        className={clsx(
          "group rounded-card",
          locked
            ? "cursor-not-allowed touch-manipulation select-none"
            : "cursor-grab touch-manipulation transition-transform duration-[var(--dur)] active:scale-[0.99] active:cursor-grabbing",
          released && "animate-refuse",
          isDragging && "opacity-40",
          landed && "animate-land",
        )}
      >
        <CardView opp={opp} locked={locked} />
      </div>
    </div>
  );
}
