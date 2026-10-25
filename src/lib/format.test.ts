import { describe, expect, it } from "vitest";
import { brl, brlCompact } from "./format";

const spaces = (text: string) => text.replace(/\s/g, " ");

describe("brl", () => {
  it("mostra os centavos", () => {
    expect(spaces(brl(4500.75))).toBe("R$ 4.500,75");
    expect(spaces(brl(4500))).toBe("R$ 4.500,00");
  });

  it("avisa quando o valor não foi informado", () => {
    expect(brl(null)).toBe("Valor não informado");
  });
});

describe("brlCompact", () => {
  it("arredonda para reais inteiros", () => {
    expect(spaces(brlCompact(4500.75))).toBe("R$ 4.501");
    expect(spaces(brlCompact(18000))).toBe("R$ 18.000");
  });

  it("avisa quando o valor não foi informado", () => {
    expect(brlCompact(null)).toBe("Valor não informado");
  });
});
