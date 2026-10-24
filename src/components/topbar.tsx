"use client";

import clsx from "clsx";
import { Columns3, List, LogIn, Plus, Search } from "lucide-react";
import { dateBR } from "@/lib/format";
import type { Seller } from "@/lib/types";
import { useCatalog, useSellerName } from "./app-data";
import { FiltersMenu, type Filters } from "./filters-menu";
import { ThemeToggle } from "./theme-toggle";
import { Button, Input, Segmented } from "./ui";
import { UserMenu } from "./user-menu";

export type ViewMode = "board" | "list";

function SearchField({
  value,
  onChange,
  placeholder = "Buscar empresa, código, vendedor ou brinde",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={clsx("relative min-w-0", className)}>
      <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-2" />
      <Input
        type="search"
        withIcon
        aria-label="Buscar oportunidades"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export function Mark() {
  return (
    <span aria-hidden="true" className="inline-flex size-8 shrink-0 items-center justify-center rounded-card bg-brand text-headline font-bold text-on-brand">
      N
    </span>
  );
}

export function TopBar({
  search,
  onSearch,
  user,
  onUserChange,
  onSignOut,
  onSignIn,
}: {
  search: string;
  onSearch: (value: string) => void;
  user: Seller | null;
  onUserChange: (sellerId: string) => void;
  onSignOut: () => void;
  onSignIn: () => void;
}) {
  return (
    <header className="relative z-20 grid h-14 shrink-0 grid-cols-[1fr_auto] items-center gap-3 bg-frame px-gutter sm:grid-cols-[1fr_minmax(0,360px)_1fr] lg:grid-cols-[1fr_minmax(0,440px)_1fr]">
      <div className="flex min-w-0 items-center gap-2.5">
        <Mark />
        <span className="truncate text-body font-semibold text-ink">Nobre Brindes</span>
      </div>
      <SearchField value={search} onChange={onSearch} className="hidden sm:block" />
      <div className="flex items-center justify-end gap-1">
        <ThemeToggle />
        {user ? (
          <UserMenu user={user} onChange={onUserChange} onSignOut={onSignOut} />
        ) : (
          <Button variant="plain" onClick={onSignIn}>
            <LogIn size={16} aria-hidden="true" /> Entrar
          </Button>
        )}
      </div>
    </header>
  );
}

export function TitleRow({
  filters,
  onChange,
  view,
  onViewChange,
  onNew,
  user,
}: {
  filters: Filters;
  onChange: (filters: Filters) => void;
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onNew: () => void;
  user: Seller | null;
}) {
  const catalog = useCatalog();
  const sellerName = useSellerName();
  const scope = filters.onlyMine && user ? user.name : sellerName(filters.seller);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-title font-semibold tracking-[-0.01em] text-ink">Funil de vendas</h1>
          <p className="relative text-caption text-ink-2">
            Hoje, <span className="tabular">{dateBR(catalog.today)}</span>
            <span className="max-sm:sr-only"> (data de referência da API)</span>
            {" · "}
            {scope ? (
              <>
                <span className="max-sm:hidden">oportunidades de </span>
                {scope}
              </>
            ) : (
              "todos os vendedores"
            )}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-2 sm:flex">
            <Segmented
              label="Modo de visualização"
              value={view}
              onChange={onViewChange}
              options={[
                { value: "board", label: "Kanban", icon: <Columns3 size={16} /> },
                { value: "list", label: "Lista", icon: <List size={16} /> },
              ]}
            />
            <FiltersMenu filters={filters} onChange={onChange} user={user} />
          </div>
          <Button variant="primary" onClick={onNew} aria-label="Nova oportunidade">
            <Plus size={16} aria-hidden="true" />
            <span className="md:hidden">Nova</span>
            <span className="hidden md:inline">Nova oportunidade</span>
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:hidden">
        <SearchField value={filters.search} onChange={(search) => onChange({ ...filters, search })} placeholder="Buscar oportunidades" className="flex-1" />
        <FiltersMenu filters={filters} onChange={onChange} user={user} />
        <Segmented
          label="Modo de visualização"
          value={view}
          onChange={onViewChange}
          options={[
            { value: "board", label: "Kanban", icon: <Columns3 size={16} /> },
            { value: "list", label: "Lista", icon: <List size={16} /> },
          ]}
        />
      </div>
    </div>
  );
}
