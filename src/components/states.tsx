import { CloudOff, Inbox, Plus, RotateCw, SearchX, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { ThemeToggle } from "./theme-toggle";
import { Mark } from "./topbar";
import { Button } from "./ui";

function Bar({ className }: { className: string }) {
  return <div className={`rounded-[4px] bg-active ${className}`} />;
}

export function BoardSkeleton() {
  return (
    <div role="status" aria-label="Carregando oportunidades" className="flex min-w-0 flex-col md:min-h-0 md:flex-1">
      <div className="mx-[calc(var(--pad)-6px)] flex min-w-0 overflow-hidden md:flex-1">
        <div className="flex w-max min-w-full gap-gap px-1.5 pb-pad">
          {Array.from({ length: 6 }).map((_, column) => (
            <div key={column} className="-mx-[5px] flex flex-[1_0_282px] flex-col gap-2 border border-transparent p-1 min-[1400px]:flex-[1_0_224px]">
              <div className="flex flex-col gap-2 px-[13px] pb-2.5 pt-1">
                <Bar className="h-5 w-36" />
                <Bar className="h-4 w-20" />
              </div>
              {Array.from({ length: column % 2 === 0 ? 2 : 1 }).map((__, card) => (
                <div key={card} className="flex flex-col gap-3 rounded-card border border-border p-3">
                  <Bar className="h-4 w-24" />
                  <Bar className="h-5 w-40" />
                  <Bar className="h-4 w-48" />
                  <Bar className="h-4 w-28" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div role="status" aria-label="Carregando oportunidades" className="flex min-w-0 flex-col px-pad pb-pad md:min-h-0 md:flex-1">
      <div className="min-h-0 overflow-hidden rounded-card border border-border md:flex-1">
        <div className="flex h-11 items-center gap-6 border-b border-border px-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Bar key={index} className="h-3 w-20" />
          ))}
        </div>
        {Array.from({ length: 7 }).map((_, row) => (
          <div key={row} className="flex h-row items-center gap-6 border-b border-rule px-3 last:border-0">
            <Bar className="h-4 w-16" />
            <Bar className="h-4 w-40" />
            <Bar className="h-4 w-28" />
            <Bar className="h-4 w-24" />
            <Bar className="h-4 w-20" />
            <Bar className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function RefetchNotice({ retrying, onRetry }: { retrying: boolean; onRetry: () => void }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center px-pad">
      <div
        role="alert"
        className="animate-rise pointer-events-auto flex w-full max-w-[560px] flex-wrap items-center gap-x-3 gap-y-2 rounded-panel border border-border bg-overlay px-4 py-2.5 text-body shadow-float"
      >
        <TriangleAlert size={16} className="shrink-0 text-negative" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="font-semibold text-ink">Não foi possível atualizar.</span>{" "}
          <span className="text-ink-2">Exibindo os últimos dados carregados.</span>
        </span>
        <Button onClick={onRetry} disabled={retrying}>
          <RotateCw size={16} aria-hidden="true" className={retrying ? "animate-spin" : undefined} />
          {retrying ? "Tentando…" : "Tentar novamente"}
        </Button>
      </div>
    </div>
  );
}

function Message({ icon, title, text, children, alert = false }: { icon: ReactNode; title: string; text: string; children: ReactNode; alert?: boolean }) {
  return (
    <div role={alert ? "alert" : undefined} className="flex flex-1 items-center justify-center px-pad py-16">
      <div className="flex max-w-sm flex-col items-center gap-3 text-center">
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-raised text-ink-2">{icon}</span>
        <h2 className="text-headline font-semibold text-ink">{title}</h2>
        <p className="text-body text-ink-2">{text}</p>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry, retrying = false }: { message: string; onRetry: () => void; retrying?: boolean }) {
  return (
    <Message alert icon={<CloudOff size={24} className="text-negative" aria-hidden="true" />} title="Não foi possível carregar o funil" text={message}>
      <Button variant="primary" onClick={onRetry} disabled={retrying}>
        <RotateCw size={16} aria-hidden="true" className={retrying ? "animate-spin" : undefined} /> {retrying ? "Tentando…" : "Tentar novamente"}
      </Button>
    </Message>
  );
}

export function BootScreen({ error, retrying = false, onRetry }: { error?: string | null; retrying?: boolean; onRetry?: () => void }) {
  return (
    <div className="flex min-h-dvh flex-col md:h-dvh">
      <header className="relative z-20 grid h-14 shrink-0 grid-cols-[1fr_auto] items-center gap-3 bg-frame px-gutter">
        <div className="flex min-w-0 items-center gap-2.5">
          <Mark />
          <span className="truncate text-body font-semibold text-ink">Nobre Brindes</span>
        </div>
        <div className="flex items-center justify-end gap-1">
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-inset mb-inset flex min-w-0 flex-1 flex-col gap-gap rounded-sheet border-[length:var(--edge)] border-sheet-edge bg-sheet pt-pad max-sm:rounded-none md:min-h-0">
        <div className="flex flex-col gap-1 px-pad">
          <h1 className="text-title font-semibold tracking-[-0.01em] text-ink">Funil de vendas</h1>
          {!error && <Bar className="h-4 w-56" />}
        </div>
        {error ? (
          <ErrorState message={error} retrying={retrying} onRetry={() => onRetry?.()} />
        ) : (
          <div role="status" aria-label="Carregando catálogo e vendedores" className="flex min-w-0 flex-col gap-gap md:min-h-0 md:flex-1">
            <div className="px-pad">
              <div className="flex min-h-[92px] flex-col gap-2 rounded-card border border-border p-3">
                <Bar className="h-5 w-40" />
                <div className="flex gap-2 overflow-hidden">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Bar key={index} className="h-13 w-[272px] shrink-0" />
                  ))}
                </div>
              </div>
            </div>
            <BoardSkeleton />
          </div>
        )}
      </main>
    </div>
  );
}

export function NoResults({ onClear }: { onClear: () => void }) {
  return (
    <Message icon={<SearchX size={24} aria-hidden="true" />} title="Nenhuma oportunidade encontrada" text="Nada corresponde à busca e aos filtros atuais.">
      <Button onClick={onClear}>Limpar busca e filtros</Button>
    </Message>
  );
}

export function EmptyFunnel({ onNew }: { onNew: () => void }) {
  return (
    <Message icon={<Inbox size={24} aria-hidden="true" />} title="Funil vazio" text="Nenhuma oportunidade ainda. Crie a primeira para começar o funil.">
      <Button variant="primary" onClick={onNew}>
        <Plus size={16} aria-hidden="true" /> Nova oportunidade
      </Button>
    </Message>
  );
}
