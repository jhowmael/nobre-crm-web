import { AttentionLevel, AttentionSignalLevel, type Attention, type Opportunity } from "./types";

const RANK: Record<AttentionLevel, number> = {
  [AttentionLevel.none]: 0,
  [AttentionLevel.medium]: 1,
  [AttentionLevel.high]: 2,
};

const FAR_FUTURE = "9999-12-31";

export const attentionRank = (level: AttentionLevel) => RANK[level] ?? 0;

export const needsAttention = (attention: Attention) => attention.level !== AttentionLevel.none && attention.signals.length > 0;

export const attentionMessages = (attention: Attention) => attention.signals.map((signal) => signal.message);

export function compareByUrgency(a: Opportunity, b: Opportunity) {
  return (
    attentionRank(b.attention.level) - attentionRank(a.attention.level) ||
    b.attention.signals.length - a.attention.signals.length ||
    (a.eventDate ?? FAR_FUTURE).localeCompare(b.eventDate ?? FAR_FUTURE) ||
    (b.estimatedValue ?? 0) - (a.estimatedValue ?? 0)
  );
}

const SIGNAL_LEVEL: Record<AttentionSignalLevel, AttentionLevel> = {
  [AttentionSignalLevel.high]: AttentionLevel.high,
  [AttentionSignalLevel.medium]: AttentionLevel.medium,
};

export function withoutSignals(attention: Attention, codes: readonly string[]): Attention {
  const signals = attention.signals.filter((signal) => !codes.includes(signal.code));
  const level = signals
    .map((signal) => SIGNAL_LEVEL[signal.level] ?? AttentionLevel.none)
    .reduce((acc, next) => (attentionRank(next) > attentionRank(acc) ? next : acc), AttentionLevel.none);
  return { level, signals };
}
