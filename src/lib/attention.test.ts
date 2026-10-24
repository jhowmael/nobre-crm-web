import { describe, expect, it } from "vitest";
import { buildOpportunity, signal } from "@/test/fixtures";
import { compareByUrgency, withoutSignals } from "./attention";
import { AttentionCode, AttentionLevel, AttentionSignalLevel, type Opportunity } from "./types";

const high = signal(AttentionCode.PROPOSAL_EXPIRED, AttentionSignalLevel.high, "Proposta vencida há 2 dias");
const medium = signal(AttentionCode.NO_CONTACT, AttentionSignalLevel.medium, "Sem contato há 5 dias");
const other = signal(AttentionCode.PROPOSAL_AFTER_EVENT, AttentionSignalLevel.medium, "Validade da proposta posterior ao evento");

const sortCodes = (...opps: Opportunity[]) => [...opps].sort(compareByUrgency).map((opp) => opp.code);

describe("compareByUrgency", () => {
  it("ordena pelo nível de atenção vindo da API", () => {
    const none = buildOpportunity({ code: "A" });
    const warn = buildOpportunity({ code: "B", attention: { level: AttentionLevel.medium, signals: [medium] } });
    const act = buildOpportunity({ code: "C", attention: { level: AttentionLevel.high, signals: [high] } });
    expect(sortCodes(none, warn, act)).toEqual(["C", "B", "A"]);
  });

  it("desempata pela quantidade de sinais", () => {
    const one = buildOpportunity({ code: "A", attention: { level: AttentionLevel.medium, signals: [medium] } });
    const two = buildOpportunity({ code: "B", attention: { level: AttentionLevel.medium, signals: [medium, other] } });
    expect(sortCodes(one, two)).toEqual(["B", "A"]);
  });

  it("depois pelo evento mais próximo, com evento ausente por último", () => {
    const later = buildOpportunity({ code: "A", eventDate: "2026-12-01" });
    const sooner = buildOpportunity({ code: "B", eventDate: "2026-10-20" });
    const none = buildOpportunity({ code: "C", eventDate: null });
    expect(sortCodes(later, none, sooner)).toEqual(["B", "A", "C"]);
  });

  it("por fim pelo maior valor estimado", () => {
    const small = buildOpportunity({ code: "A", estimatedValue: 100 });
    const big = buildOpportunity({ code: "B", estimatedValue: 9000 });
    const empty = buildOpportunity({ code: "C", estimatedValue: null });
    expect(sortCodes(small, empty, big)).toEqual(["B", "A", "C"]);
  });

  it("o nível pesa mais que a quantidade de sinais e o evento", () => {
    const manyMedium = buildOpportunity({ code: "A", eventDate: "2026-10-16", attention: { level: AttentionLevel.medium, signals: [medium, other] } });
    const oneHigh = buildOpportunity({ code: "B", eventDate: "2026-12-30", attention: { level: AttentionLevel.high, signals: [high] } });
    expect(sortCodes(manyMedium, oneHigh)).toEqual(["B", "A"]);
  });
});

describe("withoutSignals", () => {
  it("remove os sinais informados e recalcula o nível", () => {
    const result = withoutSignals({ level: AttentionLevel.high, signals: [high, medium] }, [AttentionCode.PROPOSAL_EXPIRED]);
    expect(result).toEqual({ level: AttentionLevel.medium, signals: [medium] });
    expect(withoutSignals({ level: AttentionLevel.medium, signals: [medium] }, [AttentionCode.NO_CONTACT]).level).toBe(AttentionLevel.none);
  });
});
