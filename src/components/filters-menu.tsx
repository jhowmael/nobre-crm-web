"use client";

import clsx from "clsx";
import { ListFilter } from "lucide-react";
import type { Seller } from "@/lib/types";
import { useCatalog, useSellers } from "./app-data";
import { Popover } from "./popover";
import { Button, Field, Select } from "./ui";

export interface Filters {
  search: string;
  seller: string;
  stage: string;
  onlyAttention: boolean;
  onlyMine: boolean;
}

export const EMPTY_FILTERS: Filters = { search: "", seller: "", stage: "", onlyAttention: false, onlyMine: false };

export const initialFilters = (user: Seller | null): Filters => ({ ...EMPTY_FILTERS, onlyMine: user != null });

export const countActiveFilters = (filters: Filters, user: Seller | null) => {
  const mine = filters.onlyMine && user != null;
  return [mine ? false : filters.seller, filters.stage, filters.onlyAttention, mine].filter(Boolean).length;
};

function CheckOption({
  checked,
  onChange,
  title,
  hint,
  disabled = false,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  title: string;
  hint: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={clsx(
        "-mx-2 flex min-h-11 items-start gap-3 rounded-control px-2 py-2 transition-colors",
        disabled ? "cursor-not-allowed" : "cursor-pointer hover:bg-raised",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-4 shrink-0 cursor-pointer disabled:cursor-not-allowed"
      />
      <span className={clsx("flex flex-col text-body font-medium", disabled && "text-ink-2")}>
        {title}
        <span className="text-caption font-normal text-ink-2">{hint}</span>
      </span>
    </label>
  );
}

export function FiltersMenu({ filters, onChange, user }: { filters: Filters; onChange: (filters: Filters) => void; user: Seller | null }) {
  const catalog = useCatalog();
  const sellers = useSellers();
  const active = countActiveFilters(filters, user);
  const mine = filters.onlyMine && user != null;

  return (
    <Popover
      label="Filtros"
      trigger={({ open, toggle }) => (
        <Button
          onClick={toggle}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label={active > 0 ? `Filtros, ${active} ${active === 1 ? "ativo" : "ativos"}` : "Filtros"}
          className="max-sm:w-icon max-sm:px-0"
        >
          <ListFilter size={16} aria-hidden="true" />
          <span className="hidden sm:inline">Filtros</span>
          {active > 0 && (
            <span
              aria-hidden="true"
              className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-caption font-semibold tabular text-on-accent max-sm:absolute max-sm:-right-1.5 max-sm:-top-1.5"
            >
              {active}
            </span>
          )}
        </Button>
      )}
    >
      {(close) => (
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-headline font-semibold">Filtrar o funil</h3>
            <p className="text-caption text-ink-2">Combine os filtros para achar o que importa agora.</p>
          </div>
          <CheckOption
            checked={mine}
            disabled={user == null}
            onChange={(value) => onChange({ ...filters, onlyMine: value })}
            title={user ? `Só as minhas (${user.name})` : "Só as minhas"}
            hint={user ? "Mostra apenas as oportunidades do usuário logado." : "Entre para usar este filtro."}
          />
          <CheckOption
            checked={filters.onlyAttention}
            onChange={(value) => onChange({ ...filters, onlyAttention: value })}
            title="Só o que precisa de atenção"
            hint="Proposta vencida, sem contato ou evento próximo."
          />
          <Field label="Vendedor" hint={mine ? "Desative “Só as minhas” para escolher outro vendedor." : undefined}>
            <Select
              value={mine ? (user?.id ?? "") : filters.seller}
              disabled={mine}
              onChange={(event) => onChange({ ...filters, seller: event.target.value })}
            >
              <option value="">Todos</option>
              {sellers.map((seller) => (
                <option key={seller.id} value={seller.id}>
                  {seller.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Etapa">
            <Select value={filters.stage} onChange={(event) => onChange({ ...filters, stage: event.target.value })}>
              <option value="">Todas</option>
              {catalog.stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.label}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex justify-between gap-2 border-t border-rule pt-3">
            <Button variant="plain" disabled={active === 0} onClick={() => onChange({ ...EMPTY_FILTERS, search: filters.search })}>
              Limpar filtros
            </Button>
            <Button variant="primary" onClick={close}>
              Concluir
            </Button>
          </div>
        </div>
      )}
    </Popover>
  );
}
