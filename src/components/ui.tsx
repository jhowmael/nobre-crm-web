"use client";

import clsx from "clsx";
import {
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type RefObject,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { TriangleAlert } from "lucide-react";
import { initials } from "@/lib/format";
import { useOptionalSellers } from "./app-data";

type Variant = "primary" | "secondary" | "plain" | "danger-quiet";
type Size = "md" | "icon";

const VARIANTS: Record<Variant, string> = {
  primary: "border-accent bg-accent text-on-accent hover:border-accent-hover hover:bg-accent-hover active:bg-accent-press",
  secondary: "border-border-strong bg-surface text-ink hover:bg-raised active:bg-active",
  plain: "border-transparent bg-transparent text-ink hover:bg-active active:bg-border",
  "danger-quiet": "border-border-strong bg-surface text-negative hover:bg-negative-tint active:bg-negative-tint",
};

const SIZES: Record<Size, string> = {
  md: "h-control px-3",
  icon: "size-icon shrink-0",
};

export function Button({
  variant = "secondary",
  size = "md",
  type = "button",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      {...props}
      type={type}
      className={clsx(
        "relative inline-flex cursor-pointer select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-control border text-body font-medium transition-colors",
        "disabled:cursor-not-allowed disabled:border-border disabled:bg-raised disabled:text-ink-2",
        SIZES[size],
        VARIANTS[variant],
        size === "icon" && variant === "plain" && "text-ink-2 hover:text-ink",
        className,
      )}
    />
  );
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; icon: ReactNode }[];
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex h-control shrink-0 rounded-control bg-active p-0.5">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            aria-label={option.label}
            onClick={() => onChange(option.value)}
            className={clsx(
              "relative inline-flex min-w-11 flex-1 cursor-pointer items-center justify-center rounded-[5px] px-3 text-body font-medium transition-[background-color,color,box-shadow] coarse:after:absolute coarse:after:inset-x-0 coarse:after:-inset-y-0.5",
              selected ? "bg-surface font-semibold text-ink ring-1 ring-border-strong dark:bg-border-strong" : "text-ink-2 hover:text-ink",
            )}
          >
            <span aria-hidden="true" className="sm:hidden">
              {option.icon}
            </span>
            <span aria-hidden="true" className="hidden sm:inline">
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

const FIELD =
  "w-full rounded-control border border-field-border bg-surface text-body text-ink transition-colors placeholder:text-ink-2 hover:border-ink-2 focus-visible:border-focus focus-visible:outline-offset-0 disabled:cursor-not-allowed disabled:bg-raised disabled:text-ink-2 aria-[invalid=true]:border-negative";

export function Input({ withIcon = false, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { withIcon?: boolean }) {
  return <input {...props} className={clsx(FIELD, "h-control pr-2.5", withIcon ? "pl-8" : "pl-2.5", className)} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={clsx(FIELD, "h-control cursor-pointer px-2", className)} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={clsx(FIELD, "min-h-20 px-2.5 py-2", className)} />;
}

export function Field({
  label,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={clsx("flex min-w-0 flex-col gap-1.5 text-body font-medium text-ink", className)}>
      {label}
      {children}
      {hint && !error && <span className="text-caption font-normal text-ink-2">{hint}</span>}
      {error && (
        <span role="alert" className="text-caption font-normal text-negative">
          {error}
        </span>
      )}
    </label>
  );
}

export function SectionTitle({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h3 id={id} className="text-body font-semibold text-ink">
      {children}
    </h3>
  );
}

export function LossPendingBadge() {
  return (
    <span
      title="Motivo da perda pendente"
      className="inline-flex items-center whitespace-nowrap rounded-[4px] bg-warning-tint px-1.5 text-caption font-medium text-warning-ink"
    >
      Motivo <span className="sr-only">da perda </span>pendente
    </span>
  );
}

interface Layer {
  id: number;
}

const layers: Layer[] = [];
let layerSeq = 0;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const focusables = (node: HTMLElement) =>
  [...node.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((element) => element.getClientRects().length > 0);

const layerNodes = new Map<number, HTMLElement>();

function useLayer(onEscape: () => void, active: boolean, ref?: RefObject<HTMLElement | null>) {
  const handler = useRef(onEscape);

  useEffect(() => {
    handler.current = onEscape;
  });

  useEffect(() => {
    if (!active) return;
    const layer: Layer = { id: ++layerSeq };
    layers.push(layer);
    const isTop = () => layers[layers.length - 1] === layer;
    const node = ref?.current ?? null;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    if (node) {
      layerNodes.set(layer.id, node);
      const initial = node.querySelector<HTMLElement>("[data-autofocus]") ?? focusables(node)[0] ?? node;
      initial.focus();
    }

    const onKey = (event: KeyboardEvent) => {
      if (!isTop()) return;
      if (event.key === "Escape") {
        handler.current();
        return;
      }
      if (event.key !== "Tab" || !node) return;
      const items = focusables(node);
      if (items.length === 0) {
        event.preventDefault();
        node.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      if (!current || !node.contains(current)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const onFocusIn = (event: FocusEvent) => {
      if (!node || !isTop() || node.contains(event.target as Node)) return;
      (focusables(node)[0] ?? node).focus();
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("focusin", onFocusIn);
      layers.splice(layers.indexOf(layer), 1);
      layerNodes.delete(layer.id);
      if (!node) return;
      const current = document.activeElement;
      if (current && current !== document.body && !node.contains(current)) return;
      if (previous && previous.isConnected) {
        previous.focus();
        return;
      }
      const below = layers.length > 0 ? layerNodes.get(layers[layers.length - 1].id) : undefined;
      if (below) (focusables(below)[0] ?? below).focus();
    };
  }, [active, ref]);
}

export function useEscape(handler: () => void, active = true) {
  useLayer(handler, active);
}

export function useDialogFocus(ref: RefObject<HTMLElement | null>, onClose: () => void) {
  useLayer(onClose, true, ref);
}

export function useDismiss(open: boolean, close: () => void, ref: RefObject<HTMLElement | null>) {
  useEscape(close, open);
  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) close();
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, close, ref]);
}

export function Modal({
  title,
  description,
  onClose,
  onSubmit,
  children,
  footer,
  alert,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  onSubmit: () => void;
  children: ReactNode;
  footer: ReactNode;
  alert?: string | null;
}) {
  const ref = useRef<HTMLFormElement>(null);
  const id = useId();
  useDialogFocus(ref, onClose);

  return (
    <div className="animate-fade fixed inset-0 z-50 flex items-end justify-center bg-scrim sm:items-center sm:p-6" onMouseDown={onClose}>
      <form
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={description ? `${id}-desc` : undefined}
        tabIndex={-1}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        onMouseDown={(event) => event.stopPropagation()}
        className="animate-rise flex max-h-[92dvh] w-full flex-col rounded-t-panel border border-border bg-overlay shadow-overlay outline-none sm:max-w-[440px] sm:rounded-panel"
      >
        <div className="px-5 pt-5">
          <h2 id={`${id}-title`} className="text-headline font-semibold text-ink">
            {title}
          </h2>
          {description && (
            <p id={`${id}-desc`} className="mt-1 text-body text-ink-2">
              {description}
            </p>
          )}
        </div>
        <div className="scroll-quiet flex min-w-0 flex-col gap-4 overflow-y-auto px-5 py-4">
          {alert && (
            <p role="alert" className="flex items-start gap-2 rounded-card bg-negative-tint px-3 py-2.5 text-body text-negative-ink">
              <TriangleAlert size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
              {alert}
            </p>
          )}
          {children}
        </div>
        <div className="flex justify-end gap-2 px-5 pb-5 pt-1 [padding-bottom:max(20px,env(safe-area-inset-bottom))] max-sm:[&>*]:flex-1">{footer}</div>
      </form>
    </div>
  );
}

const PERSON_TONES = ["person-1", "person-2", "person-3"] as const;

const TONE_CLASS: Record<(typeof PERSON_TONES)[number], string> = {
  "person-1": "bg-[var(--person-1-bg)] text-[var(--person-1-ink)]",
  "person-2": "bg-[var(--person-2-bg)] text-[var(--person-2-ink)]",
  "person-3": "bg-[var(--person-3-bg)] text-[var(--person-3-ink)]",
};

export function Avatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const sellers = useOptionalSellers();
  const known = sellers.findIndex((seller) => seller.name === name);
  const seed = known >= 0 ? known : [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const tone = PERSON_TONES[seed % PERSON_TONES.length];
  return (
    <span
      aria-hidden="true"
      className={clsx(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
        size === "sm" ? "size-6 text-caption" : "size-8 text-body",
        TONE_CLASS[tone],
      )}
    >
      {initials(name)}
    </span>
  );
}
