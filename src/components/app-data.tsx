"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { buildCatalog, type Catalog } from "@/lib/catalog";
import type { Catalogs, Seller } from "@/lib/types";

interface AppData {
  catalog: Catalog;
  sellers: Seller[];
}

const AppDataContext = createContext<AppData | null>(null);

export function AppDataProvider({ catalogs, sellers, children }: { catalogs: Catalogs; sellers: Seller[]; children: ReactNode }) {
  const value = useMemo(() => ({ catalog: buildCatalog(catalogs), sellers }), [catalogs, sellers]);
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

function useAppData() {
  const value = useContext(AppDataContext);
  if (!value) throw new Error("AppDataProvider ausente.");
  return value;
}

export const useCatalog = () => useAppData().catalog;

export const useSellers = () => useAppData().sellers;

export const useOptionalSellers = () => useContext(AppDataContext)?.sellers ?? [];

export function useSellerName() {
  const sellers = useSellers();
  return useMemo(() => {
    const names = new Map(sellers.map((seller) => [seller.id, seller.name]));
    return (id: string | null | undefined) => (id ? (names.get(id) ?? null) : null);
  }, [sellers]);
}
