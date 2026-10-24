import { describe, expect, it } from "vitest";
import { buildTask } from "@/test/fixtures";
import { countByLevel, groupTasks } from "./tasks";
import { AttentionCode, AttentionSignalLevel } from "./types";

const VIDA = "00000000-0000-4000-8000-000000000003";
const PULSO = "00000000-0000-4000-8000-000000000004";
const ALPHA = "00000000-0000-4000-8000-000000000001";

const pulso = { opportunityId: PULSO, opportunityCode: "OPP-2004", company: "Agência Pulso" };

describe("groupTasks", () => {
  const tasks = [
    buildTask({ id: "t1", ...pulso, reasonKey: AttentionCode.NO_CONTACT, reason: "Sem contato há 13 dias", level: AttentionSignalLevel.high }),
    buildTask({
      id: "t2",
      opportunityId: ALPHA,
      opportunityCode: "OPP-2001",
      company: "Tech Alpha Ltda",
      reasonKey: AttentionCode.PROPOSAL_MISSING,
      reason: "Proposta sem validade informada",
      level: AttentionSignalLevel.medium,
    }),
    buildTask({ id: "t3", opportunityId: VIDA, reasonKey: AttentionCode.PROPOSAL_AFTER_EVENT, reason: "Validade da proposta posterior ao evento", level: AttentionSignalLevel.medium }),
    buildTask({
      id: "t4",
      opportunityId: VIDA,
      reasonKey: AttentionCode.EVENT_NEAR,
      reason: "Evento em 3 dias e ainda em Follow-up",
      level: AttentionSignalLevel.high,
      dueDate: "2026-10-14",
    }),
    buildTask({ id: "t5", ...pulso, reasonKey: AttentionCode.PROPOSAL_EXPIRED, reason: "Proposta vencida há 5 dias", level: AttentionSignalLevel.high }),
  ];

  it("gera uma linha por oportunidade com todos os motivos, do mais grave para o mais leve", () => {
    const groups = groupTasks(tasks);
    expect(groups.map((group) => group.opportunityCode)).toEqual(["OPP-2003", "OPP-2004", "OPP-2001"]);
    const [vida, agency] = groups;
    expect(vida.level).toBe(AttentionSignalLevel.high);
    expect(vida.dueDate).toBe("2026-10-14");
    expect(vida.reasons).toEqual(["Evento em 3 dias e ainda em Follow-up", "Validade da proposta posterior ao evento"]);
    expect(vida.tasks.map((task) => task.id)).toEqual(["t4", "t3"]);
    expect(agency.tasks).toHaveLength(2);
    expect(agency.company).toBe("Agência Pulso");
  });

  it("ordena por nível e depois pelo vencimento mais antigo", () => {
    const groups = groupTasks([
      buildTask({ id: "a", opportunityId: "x", company: "X", level: AttentionSignalLevel.medium, dueDate: "2026-10-10" }),
      buildTask({ id: "b", opportunityId: "y", company: "Y", level: AttentionSignalLevel.high, dueDate: "2026-10-15" }),
      buildTask({ id: "c", opportunityId: "z", company: "Z", level: AttentionSignalLevel.high, dueDate: "2026-10-12" }),
    ]);
    expect(groups.map((group) => group.opportunityId)).toEqual(["z", "y", "x"]);
  });

  it("eleva o nível da linha quando qualquer tarefa é de agir hoje", () => {
    const [group] = groupTasks([
      buildTask({ id: "a", level: AttentionSignalLevel.medium, reason: "Proposta vence em 2 dias" }),
      buildTask({ id: "b", level: AttentionSignalLevel.high, reason: "Sem contato há 8 dias" }),
    ]);
    expect(group.level).toBe(AttentionSignalLevel.high);
    expect(group.reasons[0]).toBe("Sem contato há 8 dias");
  });

  it("conta oportunidades por nível", () => {
    expect(countByLevel(groupTasks(tasks))).toEqual({ high: 2, medium: 1 });
    expect(countByLevel([])).toEqual({ high: 0, medium: 0 });
  });
});
