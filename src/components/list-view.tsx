"use client";

import clsx from "clsx";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useMemo, useState } from "react";
import { compareByUrgency, needsAttention } from "@/lib/attention";
import type { Catalog } from "@/lib/catalog";
import { brl, dateBR } from "@/lib/format";
import type { Opportunity } from "@/lib/types";
import { useCatalog } from "./app-data";
import { AttentionBadge } from "./attention-badge";
import { Avatar, LossPendingBadge } from "./ui";

type SortKey = "code" | "company" | "stage" | "gift" | "value" | "seller" | "lastContact" | "validity" | "event" | "attention";
type Direction = "asc" | "desc";

interface Column {
  key: SortKey;
  label: string;
  compare: (a: Opportunity, b: Opportunity) => number;
  hasValue?: (opp: Opportunity) => boolean;
}

const text = (a: string | null, b: string | null) => (a == null ? (b == null ? 0 : 1) : b == null ? -1 : a.localeCompare(b, "pt-BR"));
const number = (a: number | null, b: number | null) => (a == null ? (b == null ? 0 : 1) : b == null ? -1 : a - b);

const buildColumns = (catalog: Catalog): Column[] => [
  { key: "code", label: "Código", compare: (a, b) => text(a.code, b.code) },
  { key: "company", label: "Empresa", compare: (a, b) => text(a.company, b.company) },
  { key: "stage", label: "Etapa", compare: (a, b) => catalog.order(a.stage) - catalog.order(b.stage) },
  { key: "gift", label: "Brinde", compare: (a, b) => text(a.items[0]?.name ?? null, b.items[0]?.name ?? null), hasValue: (opp) => opp.items.length > 0 },
  { key: "value", label: "Valor", compare: (a, b) => number(a.estimatedValue, b.estimatedValue), hasValue: (opp) => opp.estimatedValue != null },
  { key: "seller", label: "Vendedor", compare: (a, b) => text(a.seller.name, b.seller.name) },
  { key: "lastContact", label: "Último contato", compare: (a, b) => text(a.lastContactAt, b.lastContactAt), hasValue: (opp) => opp.lastContactAt != null },
  {
    key: "validity",
    label: "Validade da proposta",
    compare: (a, b) => text(a.proposalValidUntil, b.proposalValidUntil),
    hasValue: (opp) => opp.proposalValidUntil != null,
  },
  { key: "event", label: "Evento", compare: (a, b) => text(a.eventDate, b.eventDate), hasValue: (opp) => opp.eventDate != null },
  { key: "attention", label: "Atenção", compare: (a, b) => compareByUrgency(b, a) },
];

function Missing() {
  return (
    <>
      <span aria-hidden="true">—</span>
      <span className="sr-only">Não informado</span>
    </>
  );
}

const date = (iso: string | null) => (iso ? dateBR(iso) : <Missing />);

export function ListView({ opportunities, onOpen }: { opportunities: Opportunity[]; onOpen: (opp: Opportunity) => void }) {
  const catalog = useCatalog();
  const columns = useMemo(() => buildColumns(catalog), [catalog]);
  const [sort, setSort] = useState<{ key: SortKey; direction: Direction }>({ key: "attention", direction: "desc" });

  const rows = useMemo(() => {
    const column = columns.find((item) => item.key === sort.key)!;
    const hasValue = column.hasValue ?? (() => true);
    const sign = sort.direction === "asc" ? 1 : -1;
    return [...opportunities].sort((a, b) => {
      const aHas = hasValue(a);
      const bHas = hasValue(b);
      if (aHas !== bHas) return aHas ? -1 : 1;
      return sign * column.compare(a, b);
    });
  }, [opportunities, sort, columns]);

  const toggle = (key: SortKey) =>
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: key === "attention" || key === "value" ? "desc" : "asc" },
    );

  return (
    <div className="scroll-quiet relative min-h-0 overflow-auto rounded-card border border-border bg-surface">
      <table className="w-full min-w-[1120px] border-collapse whitespace-nowrap text-left text-body">
        <caption className="sr-only">Oportunidades. Use os títulos das colunas para ordenar.</caption>
        <thead className="sticky top-0 z-10 bg-surface text-caption text-ink-2">
          <tr>
            {columns.map((column) => {
              const active = sort.key === column.key;
              const Icon = sort.direction === "asc" ? ArrowUp : ArrowDown;
              const numeric = column.key === "value";
              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
                  className={clsx(
                    "border-b border-border px-1.5 py-1 font-normal",
                    numeric && "text-right",
                    column.key === "company" && "sticky left-0 z-10 bg-surface",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggle(column.key)}
                    className={clsx(
                      "relative inline-flex h-8 cursor-pointer items-center gap-1 whitespace-nowrap rounded-control px-1.5 transition-colors hover:bg-active hover:text-ink coarse:h-11",
                      numeric && "flex-row-reverse",
                      active && "font-semibold text-ink",
                    )}
                  >
                    {column.label}
                    <Icon size={12} aria-hidden="true" className={active ? undefined : "invisible"} />
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((opp) => {
            const stage = catalog.stage(opp.stage);
            const first = opp.items[0];
            const extra = opp.items.length - 1;
            return (
              <tr key={opp.id} onClick={() => onOpen(opp)} className="group h-row cursor-pointer border-b border-rule last:border-0">
                <td className="px-3 py-2.5 font-mono text-caption text-ink-2 group-hover:bg-raised">{opp.code}</td>
                <td className="sticky left-0 bg-surface px-3 py-2.5 group-hover:bg-raised">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpen(opp);
                    }}
                    aria-label={`Abrir detalhes de ${opp.company}`}
                    className="relative cursor-pointer rounded-control text-left font-semibold text-ink hover:underline hover:underline-offset-2"
                  >
                    {opp.company}
                  </button>
                </td>
                <td className="px-3 py-2.5 group-hover:bg-raised">
                  <span className="inline-flex items-center gap-2 whitespace-nowrap">
                    <span className="size-2 rounded-full" style={{ background: stage.dot }} aria-hidden="true" />
                    {stage.label}
                  </span>
                </td>
                <td className="px-3 py-2.5 group-hover:bg-raised">
                  {first ? (
                    <span>
                      {first.name} · <span className="tabular">{first.quantity.toLocaleString("pt-BR")}</span> un.
                      {extra > 0 && <span className="text-ink-2"> +{extra}</span>}
                    </span>
                  ) : (
                    <span className="text-ink-2">
                      <Missing />
                    </span>
                  )}
                </td>
                <td className={clsx("whitespace-nowrap px-3 py-2.5 text-right tabular group-hover:bg-raised", opp.estimatedValue == null ? "text-ink-2" : "font-semibold")}>
                  {opp.estimatedValue == null ? <Missing /> : brl(opp.estimatedValue)}
                </td>
                <td className="px-3 py-2.5 group-hover:bg-raised">
                  <span className="inline-flex items-center gap-2">
                    <Avatar name={opp.seller.name} />
                    {opp.seller.name}
                  </span>
                </td>
                <td className="px-3 py-2.5 tabular text-ink-2 group-hover:bg-raised">{date(opp.lastContactAt)}</td>
                <td className="px-3 py-2.5 tabular text-ink-2 group-hover:bg-raised">{date(opp.proposalValidUntil)}</td>
                <td className="px-3 py-2.5 tabular text-ink-2 group-hover:bg-raised">{date(opp.eventDate)}</td>
                <td className="min-w-60 whitespace-normal px-3 py-2.5 group-hover:bg-raised">
                  {opp.lossReasonPending && !needsAttention(opp.attention) ? <LossPendingBadge /> : <AttentionBadge attention={opp.attention} compact />}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
