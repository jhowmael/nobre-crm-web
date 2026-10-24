"use client";

import { Check, ChevronDown, LogOut } from "lucide-react";
import type { Seller } from "@/lib/types";
import { useSellers } from "./app-data";
import { Popover } from "./popover";
import { Avatar } from "./ui";

const ITEM = "flex min-h-control w-full cursor-pointer items-center gap-2.5 rounded-control px-2 text-left text-body transition-colors hover:bg-raised active:bg-active";

export function UserMenu({ user, onChange, onSignOut }: { user: Seller; onChange: (sellerId: string) => void; onSignOut: () => void }) {
  const sellers = useSellers();
  return (
    <Popover
      label="Conta do usuário"
      placement="end"
      width="w-64"
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label={`Usuário logado: ${user.name}`}
          className="relative flex h-control cursor-pointer items-center gap-1.5 rounded-control pl-1 pr-1.5 text-body font-medium text-ink transition-colors hover:bg-active active:bg-border sm:pr-2"
        >
          <Avatar name={user.name} />
          <span className="hidden sm:inline">{user.name}</span>
          <ChevronDown size={16} aria-hidden="true" className="text-ink-2" />
        </button>
      )}
    >
      {(close) => (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 pb-2">
            <Avatar name={user.name} size="md" />
            <div>
              <p className="text-body font-semibold">{user.name}</p>
              <p className="text-caption text-ink-2">Vendedor(a) · Nobre Brindes</p>
            </div>
          </div>
          <p id="simular-usuario" className="text-caption font-medium text-ink-2">
            Simular outro usuário
          </p>
          <ul aria-labelledby="simular-usuario" className="-mx-2 flex flex-col">
            {sellers.map((seller) => (
              <li key={seller.id}>
                <button
                  type="button"
                  aria-pressed={seller.id === user.id}
                  onClick={() => {
                    onChange(seller.id);
                    close();
                  }}
                  className={ITEM}
                >
                  <Avatar name={seller.name} />
                  <span className="flex-1">{seller.name}</span>
                  {seller.id === user.id && <Check size={16} aria-hidden="true" className="text-accent-ink" />}
                </button>
              </li>
            ))}
          </ul>
          <div className="-mx-2 border-t border-rule pt-2">
            <button
              type="button"
              className={`${ITEM} font-semibold`}
              onClick={() => {
                onSignOut();
                close();
              }}
            >
              <LogOut size={16} aria-hidden="true" /> Sair (simulado)
            </button>
          </div>
        </div>
      )}
    </Popover>
  );
}
