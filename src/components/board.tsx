"use client";

import {
  DndContext,
  pointerWithin,
  closestCenter,
  type CollisionDetection,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragStartEvent,
  type KeyboardCoordinateGetter,
} from "@dnd-kit/core";
import { useState, type ReactNode } from "react";
import { canMoveTo } from "@/lib/catalog";
import { LANDING_STAGES } from "@/lib/stages";
import type { Opportunity, Stage } from "@/lib/types";
import { useCatalog } from "./app-data";
import { CardView } from "./card";
import { Column, type DropState } from "./column";

const columnCoordinates: KeyboardCoordinateGetter = (event, { currentCoordinates, context }) => {
  const direction = event.code === "ArrowRight" ? 1 : event.code === "ArrowLeft" ? -1 : 0;
  if (direction === 0) return undefined;
  event.preventDefault();
  const rect = context.collisionRect;
  if (!rect) return undefined;
  const center = rect.left + rect.width / 2;
  let target: { left: number; width: number; top: number } | null = null;
  let best = Infinity;
  context.droppableRects.forEach((candidate) => {
    const distance = (candidate.left + candidate.width / 2 - center) * direction;
    if (distance > 10 && distance < best) {
      best = distance;
      target = candidate;
    }
  });
  if (!target) return undefined;
  const chosen: { left: number; width: number; top: number } = target;
  return {
    x: currentCoordinates.x + (chosen.left + chosen.width / 2 - center),
    y: currentCoordinates.y + (chosen.top + 56 - rect.top),
  };
};

const SCREEN_READER = {
  draggable:
    "Para mover este card, pressione Espaço, use as setas para a esquerda e para a direita para escolher a coluna e pressione Espaço de novo para soltar. Esc cancela. Enter abre os detalhes.",
};

const detectCollisions: CollisionDetection = (args) => {
  const within = pointerWithin(args);
  return within.length > 0 ? within : closestCenter(args);
};

export function Board({
  opportunities,
  all,
  filtering,
  stageFilter,
  onOpen,
  onMove,
  notice,
  scope,
}: {
  opportunities: Opportunity[];
  all: Opportunity[];
  filtering: boolean;
  stageFilter: string;
  onOpen: (opp: Opportunity) => void;
  onMove: (opp: Opportunity, to: Stage) => void;
  notice?: ReactNode;
  scope: string | null;
}) {
  const catalog = useCatalog();
  const { blockedReason, label: stageLabel } = catalog;
  const [activeId, setActiveId] = useState<string | null>(null);
  const [landedId, setLandedId] = useState<string | null>(null);
  const [settleBack, setSettleBack] = useState(false);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: columnCoordinates,
      keyboardCodes: { start: ["Space"], cancel: ["Escape"], end: ["Space", "Enter"] },
    }),
  );

  const find = (id: string | number) => opportunities.find((opp) => opp.id === id) ?? all.find((opp) => opp.id === id);
  const active = activeId ? (find(activeId) ?? null) : null;
  const describeTarget = (id: string | number, target: Stage) => {
    const opp = find(id);
    if (!opp) return `Coluna ${stageLabel(target)}.`;
    if (opp.stage === target) return `Coluna ${stageLabel(target)}, etapa atual. Soltar aqui não muda nada.`;
    const blocked = blockedReason(opp.stage, target);
    return blocked
      ? `Coluna ${stageLabel(target)}: movimento não permitido. ${blocked}`
      : `Coluna ${stageLabel(target)}: movimento permitido. Solte para mover.`;
  };

  const announcements: Announcements = {
    onDragStart: ({ active: item }) => `${find(item.id)?.company ?? "Card"} selecionado. Escolha a coluna de destino.`,
    onDragOver: ({ active: item, over }) => (over ? describeTarget(item.id, over.id as Stage) : "Fora das colunas."),
    onDragEnd: ({ active: item, over }) => {
      const opp = find(item.id);
      if (!over) return "Card solto fora das colunas. Nada mudou.";
      const target = over.id as Stage;
      const blocked = opp ? blockedReason(opp.stage, target) : null;
      if (blocked) return `Movimento não permitido. ${blocked} Nada mudou.`;
      return `${opp?.company ?? "Card"} solto em ${stageLabel(target)}.`;
    },
    onDragCancel: () => "Arraste cancelado. Nada mudou.",
  };

  const handleStart = (event: DragStartEvent) => setActiveId(String(event.active.id));

  const handleEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const opp = find(event.active.id);
    const target = event.over?.id as Stage | undefined;
    setSettleBack(!opp || !target || target === opp.stage || Boolean(blockedReason(opp.stage, target)));
    if (opp && target && target !== opp.stage) {
      onMove(opp, target);
      if (LANDING_STAGES.includes(target) && canMoveTo(opp, target)) {
        setLandedId(opp.id);
        setTimeout(() => setLandedId(null), 1000);
      }
    }
  };

  const dropStateFor = (stage: Stage): DropState =>
    !active || active.stage === stage ? "idle" : canMoveTo(active, stage) ? "allowed" : "blocked";

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={detectCollisions}
      accessibility={{ announcements, screenReaderInstructions: SCREEN_READER }}
      onDragStart={handleStart}
      onDragEnd={handleEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="relative flex min-w-0 flex-col md:min-h-0 md:flex-1">
        {notice}
        <div className="scroll-quiet mx-[calc(var(--pad)-6px)] flex min-w-0 snap-x snap-mandatory scroll-px-px overflow-x-auto sm:snap-none md:min-h-0 md:flex-1">
          <div className="flex w-max min-w-full gap-gap px-1.5 pb-pad">
            {catalog.stages.map((stage) => (
              <Column
                key={stage.id}
                stage={stage}
                items={opportunities.filter((opp) => opp.stage === stage.id)}
                total={all.filter((opp) => opp.stage === stage.id).length}
                dropState={dropStateFor(stage.id)}
                blockedMessage={active ? blockedReason(active.stage, stage.id) : null}
                filtering={filtering}
                filteredOut={Boolean(stageFilter) && stage.id !== stageFilter}
                landedId={landedId}
                scope={scope}
                onOpen={onOpen}
              />
            ))}
          </div>
        </div>
      </div>
      {active && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 bottom-6 z-30 flex justify-center px-4"
        >
          <div className="animate-rise rounded-full border border-border bg-overlay px-4 py-2 text-body font-medium text-ink shadow-float">
            {catalog.isFinal(active.stage) ? "Esta etapa é final e não pode ser movida" : "Solte em uma coluna destacada"}
          </div>
        </div>
      )}
      <DragOverlay dropAnimation={settleBack ? { duration: 240, easing: "cubic-bezier(0.22, 1, 0.36, 1)" } : null}>{active ? <CardView opp={active} dragging locked={catalog.isFinal(active.stage)} /> : null}</DragOverlay>
    </DndContext>
  );
}
