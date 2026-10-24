"use client";

import clsx from "clsx";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useDismiss } from "./ui";

export function Popover({
  trigger,
  children,
  label,
  placement = "auto",
  width = "w-72",
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode;
  children: (close: () => void) => ReactNode;
  label: string;
  placement?: "auto" | "end";
  width?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useDismiss(open, close, wrapper);

  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    const root = wrapper.current;
    return () => {
      const current = document.activeElement;
      if (!current || current === document.body || root?.contains(current)) root?.querySelector<HTMLElement>("button")?.focus();
    };
  }, [open]);

  return (
    <div ref={wrapper} className="relative">
      {trigger({ open, toggle: () => setOpen((value) => !value) })}
      {open && (
        <>
          <div aria-hidden="true" className="animate-fade fixed inset-0 z-30 bg-scrim sm:hidden" onPointerDown={close} />
          <div
            ref={panel}
            role="dialog"
            aria-label={label}
            tabIndex={-1}
            className={clsx(
              "animate-rise scroll-quiet absolute top-full z-30 mt-2 max-h-[70dvh] overflow-auto rounded-panel border border-border bg-overlay p-4 text-ink shadow-overlay outline-none",
              "max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:mt-0 max-sm:max-h-[85dvh] max-sm:w-auto max-sm:rounded-b-none max-sm:border-x-0 max-sm:border-b-0 max-sm:pb-[max(16px,env(safe-area-inset-bottom))]",
              width,
              placement === "end" ? "right-0" : "left-0 sm:left-auto sm:right-0",
            )}
          >
            {children(close)}
          </div>
        </>
      )}
    </div>
  );
}
