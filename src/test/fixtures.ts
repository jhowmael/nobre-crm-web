import { AttentionCode, AttentionLevel, AttentionSignalLevel, FollowupTaskStatus, Stage, type Catalogs, type FollowupTask, type Opportunity } from "@/lib/types";

export const catalogsFixture: Catalogs = {
  today: "2026-10-15",
  stages: [
    { id: Stage.PRIMEIRO_CONTATO, label: "Primeiro Contato", order: 1, final: false, hint: "Lead recém-chegado. Falta qualificar e entender o que o cliente precisa.", requirement: null },
    { id: Stage.APRESENTACAO_ORCAMENTO, label: "Apresentação de Orçamento", order: 2, final: false, hint: "Orçamento montado e enviado ao cliente. Exige valor estimado e ao menos um brinde.", requirement: "Exige valor estimado e ao menos um brinde." },
    { id: Stage.FOLLOW_UP, label: "Follow-up", order: 3, final: false, hint: "Aguardando resposta ou negociando ajustes da proposta.", requirement: null },
    { id: Stage.FORECAST, label: "Forecast", order: 4, final: false, hint: "Negociação avançada, com grande chance de fechar.", requirement: null },
    { id: Stage.FECHAMENTO, label: "Fechamento", order: 5, final: true, hint: "Venda fechada. Etapa final.", requirement: "Só a partir de Forecast. Etapa final: não pode ser desfeita." },
    { id: Stage.PERDIDA, label: "Perdida", order: 6, final: true, hint: "Negociação perdida, com motivo registrado. Etapa final.", requirement: "Etapa final: exige o motivo da perda." },
  ],
  transitions: {
    PRIMEIRO_CONTATO: [Stage.APRESENTACAO_ORCAMENTO, Stage.PERDIDA],
    APRESENTACAO_ORCAMENTO: [Stage.FOLLOW_UP, Stage.PERDIDA],
    FOLLOW_UP: [Stage.FORECAST, Stage.APRESENTACAO_ORCAMENTO, Stage.PERDIDA],
    FORECAST: [Stage.FECHAMENTO, Stage.FOLLOW_UP, Stage.PERDIDA],
    FECHAMENTO: [],
    PERDIDA: [],
  },
  blockedReasons: {
    PRIMEIRO_CONTATO: {
      PRIMEIRO_CONTATO: null,
      APRESENTACAO_ORCAMENTO: null,
      FOLLOW_UP: "Não é possível pular etapas. A próxima é Apresentação de Orçamento.",
      FORECAST: "Não é possível pular etapas. A próxima é Apresentação de Orçamento.",
      FECHAMENTO: "Fechamento só é permitido a partir de Forecast.",
      PERDIDA: null,
    },
    APRESENTACAO_ORCAMENTO: {
      PRIMEIRO_CONTATO: "Não é possível voltar para Primeiro Contato: o lead já foi qualificado.",
      APRESENTACAO_ORCAMENTO: null,
      FOLLOW_UP: null,
      FORECAST: "Não é possível pular etapas. A próxima é Follow-up.",
      FECHAMENTO: "Fechamento só é permitido a partir de Forecast.",
      PERDIDA: null,
    },
    FOLLOW_UP: {
      PRIMEIRO_CONTATO: "Não é possível voltar para Primeiro Contato: o lead já foi qualificado.",
      APRESENTACAO_ORCAMENTO: null,
      FOLLOW_UP: null,
      FORECAST: null,
      FECHAMENTO: "Fechamento só é permitido a partir de Forecast.",
      PERDIDA: null,
    },
    FORECAST: {
      PRIMEIRO_CONTATO: "Não é possível voltar para Primeiro Contato: o lead já foi qualificado.",
      APRESENTACAO_ORCAMENTO: "Só é possível voltar uma etapa por vez, para Follow-up.",
      FOLLOW_UP: null,
      FORECAST: null,
      FECHAMENTO: null,
      PERDIDA: null,
    },
    FECHAMENTO: {
      PRIMEIRO_CONTATO: "Venda fechada é uma etapa final e não pode ser movida.",
      APRESENTACAO_ORCAMENTO: "Venda fechada é uma etapa final e não pode ser movida.",
      FOLLOW_UP: "Venda fechada é uma etapa final e não pode ser movida.",
      FORECAST: "Venda fechada é uma etapa final e não pode ser movida.",
      FECHAMENTO: null,
      PERDIDA: "Venda fechada é uma etapa final e não pode ser movida.",
    },
    PERDIDA: {
      PRIMEIRO_CONTATO: "Oportunidade perdida é uma etapa final e não pode ser movida. Para retomar, crie uma nova oportunidade.",
      APRESENTACAO_ORCAMENTO: "Oportunidade perdida é uma etapa final e não pode ser movida. Para retomar, crie uma nova oportunidade.",
      FOLLOW_UP: "Oportunidade perdida é uma etapa final e não pode ser movida. Para retomar, crie uma nova oportunidade.",
      FORECAST: "Oportunidade perdida é uma etapa final e não pode ser movida. Para retomar, crie uma nova oportunidade.",
      FECHAMENTO: "Oportunidade perdida é uma etapa final e não pode ser movida. Para retomar, crie uma nova oportunidade.",
      PERDIDA: null,
    },
  },
  lossReasons: [
    { code: "PRICE", label: "Preço acima do orçamento do cliente", active: true },
    { code: "DEADLINE", label: "Prazo de entrega inviável", active: true },
    { code: "COMPETITOR", label: "Escolheu outro fornecedor", active: true },
    { code: "EVENT_CANCELLED", label: "Evento cancelado ou adiado", active: true },
    { code: "NO_RESPONSE", label: "Sem resposta do cliente", active: true },
    { code: "OTHER", label: "Outro motivo", active: true },
    { code: "NOT_INFORMED", label: "Não informado (migração)", active: false },
  ],
};

export function buildOpportunity(overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    code: "OPP-2001",
    company: "Tech Alpha Ltda",
    seller: { id: "00000000-0000-4000-8000-0000000000a1", name: "Ana" },
    items: [{ id: "00000000-0000-4000-8000-0000000000b1", name: "Caneca personalizada", quantity: 300 }],
    estimatedValue: 4500,
    lastContactAt: "2026-10-14",
    proposalValidUntil: null,
    eventDate: "2026-11-30",
    stage: Stage.PRIMEIRO_CONTATO,
    lossReason: null,
    lossNote: null,
    lossReasonPending: false,
    version: 1,
    attention: { level: AttentionLevel.none, signals: [] },
    allowedTransitions: [Stage.APRESENTACAO_ORCAMENTO, Stage.PERDIDA],
    ...overrides,
  };
}

export const signal = (code: AttentionCode, level: AttentionSignalLevel, message: string) => ({ code, level, message });

export function buildTask(overrides: Partial<FollowupTask> = {}): FollowupTask {
  return {
    id: "00000000-0000-4000-8000-0000000000c1",
    opportunityId: "00000000-0000-4000-8000-000000000003",
    opportunityCode: "OPP-2003",
    company: "Clínica Vida",
    sellerId: "00000000-0000-4000-8000-0000000000a1",
    reasonKey: AttentionCode.EVENT_NEAR,
    reason: "Evento em 3 dias e ainda em Follow-up",
    level: AttentionSignalLevel.high,
    dueDate: "2026-10-15",
    status: FollowupTaskStatus.OPEN,
    ...overrides,
  };
}
