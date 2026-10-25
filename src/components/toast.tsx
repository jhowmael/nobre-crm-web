"use client";

import { CircleAlert, CircleCheck } from "lucide-react";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type Tone = "success" | "error";

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastItem {
  id: number;
  message: string;
  tone: Tone;
  action?: ToastAction;
}

type Push = (message: string, tone?: Tone, action?: ToastAction) => void;

const ToastContext = createContext<Push>(() => undefined);

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => setItems((current) => current.filter((item) => item.id !== id)), []);

  const push = useCallback<Push>(
    (message, tone = "success", action) => {
      const id = Date.now() + Math.random();
      setItems((current) => [...current.filter((item) => item.message !== message), { id, message, tone, action }]);
      setTimeout(() => dismiss(id), action ? 8000 : 4200);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        aria-live="polite"
        aria-relevant="additions"
        className="pointer-events-none fixed inset-x-0 top-[max(12px,env(safe-area-inset-top))] z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:top-auto"
      >
        {items.map((item) => (
          <div
            key={item.id}
            role={item.tone === "error" ? "alert" : undefined}
            className="animate-rise pointer-events-auto flex max-w-md items-start gap-2.5 rounded-panel border border-border bg-overlay px-4 py-3 text-body text-ink shadow-overlay"
          >
            {item.tone === "error" ? (
              <CircleAlert size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-negative" />
            ) : (
              <CircleCheck size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-positive" />
            )}
            <span className="min-w-0 flex-1">{item.message}</span>
            {item.action && (
              <button
                type="button"
                onClick={() => {
                  dismiss(item.id);
                  item.action?.onClick();
                }}
                className="relative -my-1 shrink-0 cursor-pointer rounded-control px-2 py-1 text-body font-semibold text-accent-ink transition-colors after:absolute after:-inset-1 hover:bg-active coarse:after:-inset-2.5"
              >
                {item.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
