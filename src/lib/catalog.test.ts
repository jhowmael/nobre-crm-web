import { describe, expect, it } from "vitest";
import { buildOpportunity, catalogsFixture } from "@/test/fixtures";
import { blockedReason, buildCatalog, canMoveTo, lockedReason, missingForQuote } from "./catalog";
import { Stage, type Catalogs } from "./types";

const withReason = (from: Stage, to: Stage, reason: string | null): Catalogs => ({
  ...catalogsFixture,
  blockedReasons: { ...catalogsFixture.blockedReasons, [from]: { ...catalogsFixture.blockedReasons[from], [to]: reason } },
});

describe("blockedReason", () => {
  it("lê a mensagem da matriz blockedReasons do catálogo", () => {
    expect(blockedReason(catalogsFixture, Stage.FOLLOW_UP, Stage.FECHAMENTO)).toBe("Fechamento só é permitido a partir de Forecast.");
    expect(blockedReason(catalogsFixture, Stage.PRIMEIRO_CONTATO, Stage.FORECAST)).toBe(
      "Não é possível pular etapas. A próxima é Apresentação de Orçamento.",
    );
  });

  it("devolve null para transição permitida ou para a mesma etapa", () => {
    expect(blockedReason(catalogsFixture, Stage.FOLLOW_UP, Stage.FORECAST)).toBeNull();
    expect(blockedReason(catalogsFixture, Stage.FORECAST, Stage.FORECAST)).toBeNull();
  });

  it("reflete qualquer texto que a API mandar", () => {
    expect(blockedReason(withReason(Stage.FOLLOW_UP, Stage.FECHAMENTO, "Mensagem do servidor."), Stage.FOLLOW_UP, Stage.FECHAMENTO)).toBe(
      "Mensagem do servidor.",
    );
  });

  it("usa um texto genérico se a matriz não explicar uma transição fora da lista", () => {
    expect(blockedReason(withReason(Stage.FOLLOW_UP, Stage.FECHAMENTO, null), Stage.FOLLOW_UP, Stage.FECHAMENTO)).toBe("Movimento não permitido.");
  });
});

describe("lockedReason", () => {
  it("explica o bloqueio de etapas finais com o texto do catálogo", () => {
    expect(lockedReason(catalogsFixture, Stage.FECHAMENTO)).toBe("Venda fechada é uma etapa final e não pode ser movida.");
    expect(lockedReason(catalogsFixture, Stage.PERDIDA)).toMatch(/^Oportunidade perdida é uma etapa final/);
    expect(lockedReason(catalogsFixture, Stage.FORECAST)).toBeNull();
  });
});

describe("buildCatalog", () => {
  it("ordena as colunas por order e expõe rótulos e etapas finais", () => {
    const catalog = buildCatalog({ ...catalogsFixture, stages: [...catalogsFixture.stages].reverse() });
    expect(catalog.stages.map((stage) => stage.id)).toEqual(catalogsFixture.stages.map((stage) => stage.id));
    expect(catalog.label(Stage.FOLLOW_UP)).toBe("Follow-up");
    expect(catalog.isFinal(Stage.PERDIDA)).toBe(true);
    expect(catalog.stage(Stage.FORECAST).dot).toBe("var(--stage-forecast)");
    expect(catalog.blockedReason(Stage.FORECAST, Stage.APRESENTACAO_ORCAMENTO)).toBe("Só é possível voltar uma etapa por vez, para Follow-up.");
  });

  it("só oferece motivos de perda ativos", () => {
    const catalog = buildCatalog(catalogsFixture);
    expect(catalog.activeLossReasons.map((reason) => reason.code)).not.toContain("NOT_INFORMED");
    expect(catalog.lossReasons.map((reason) => reason.code)).toContain("NOT_INFORMED");
  });

  it("calcula datas relativas ao hoje do catálogo", () => {
    const catalog = buildCatalog(catalogsFixture);
    expect(catalog.inDays(7)).toBe("2026-10-22");
    expect(catalog.daysFromToday("2026-10-13")).toBe(-2);
  });
});

describe("transições da oportunidade", () => {
  it("usa allowedTransitions da oportunidade", () => {
    const opp = buildOpportunity({ stage: Stage.FOLLOW_UP, allowedTransitions: [Stage.FORECAST, Stage.APRESENTACAO_ORCAMENTO, Stage.PERDIDA] });
    expect(canMoveTo(opp, Stage.FORECAST)).toBe(true);
    expect(canMoveTo(opp, Stage.FECHAMENTO)).toBe(false);
  });

  it("aponta o que falta para o orçamento", () => {
    const opp = buildOpportunity({ estimatedValue: null, items: [], proposalValidUntil: "2026-10-10" });
    expect(missingForQuote(opp, "2026-10-15")).toEqual(["valor", "brinde", "validade"]);
    expect(missingForQuote(buildOpportunity({ proposalValidUntil: "2026-10-20" }), "2026-10-15")).toEqual([]);
  });
});
