import clsx from "clsx";
import { Clock, TriangleAlert } from "lucide-react";

const keepHyphens = (text: string) => text.replace(/-/g, "\u2011");

export type AlertLevel = "high" | "medium";

export const ATTENTION_LABEL: Record<AlertLevel, string> = { high: "Agir hoje", medium: "Acompanhar" };

export const alertLevel = (level: string): AlertLevel => (level === "high" ? "high" : "medium");

export function AttentionIcon({ level, size = 14 }: { level: string; size?: number }) {
  const Icon = level === "high" ? TriangleAlert : Clock;
  return <Icon size={size} aria-hidden="true" className="shrink-0" />;
}

export interface BadgeAttention {
  level: string;
  signals: { message: string }[];
}

export function AttentionBadge({ attention, compact = false }: { attention: BadgeAttention; compact?: boolean }) {
  if (attention.level === "none" || attention.signals.length === 0) return null;
  const level = alertLevel(attention.level);
  const high = level === "high";
  const messages = attention.signals.map((signal) => signal.message);
  const extra = messages.length - 1;
  return (
    <span
      className={clsx(
        "relative inline-flex max-w-full items-start gap-1.5 rounded-control px-2 py-1 text-caption font-medium",
        high ? "bg-negative-tint text-negative-ink" : "bg-warning-tint text-warning-ink",
      )}
    >
      <span className="mt-px">
        <AttentionIcon level={level} size={13} />
      </span>
      <span className="sr-only">{ATTENTION_LABEL[level]}: </span>
      <span className="min-w-0">{keepHyphens(compact ? messages[0] : messages.join(" · "))}</span>
      {compact && extra > 0 && (
        <span className="shrink-0 font-semibold tabular">
          +{extra}
          <span className="sr-only"> {extra === 1 ? "outro motivo" : "outros motivos"}</span>
        </span>
      )}
    </span>
  );
}
