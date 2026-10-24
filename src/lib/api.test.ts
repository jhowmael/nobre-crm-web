import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, buildUrl, fieldErrors, listOpportunities, MESSAGES, moveStage, send, toApiError } from "./api";
import { Stage } from "./types";

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers } });

const hangUntilAborted = () =>
  vi.fn(
    (_url: string, init: RequestInit) =>
      new Promise<Response>((_resolve, reject) => init.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")))),
  );

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("toApiError", () => {
  it("mapeia 409 para a mensagem de conflito de versão", () => {
    const error = toApiError(409, { statusCode: 409, error: "Conflict", message: "A oportunidade foi alterada por outra pessoa.", errors: [] });
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(409);
    expect(error.isConflict).toBe(true);
    expect(error.message).toBe(MESSAGES.conflict);
    expect(error.serverMessage).toBe("A oportunidade foi alterada por outra pessoa.");
  });

  it("mantém a mensagem e as violações de um 422", () => {
    const error = toApiError(422, {
      statusCode: 422,
      error: "Unprocessable Entity",
      message: "Informe o valor estimado para gerar o orçamento.",
      errors: [
        { field: "estimatedValue", message: "Informe o valor estimado para gerar o orçamento." },
        { field: "items", message: "Informe ao menos um item de brinde para gerar o orçamento." },
      ],
    });
    expect(error.status).toBe(422);
    expect(error.message).toBe("Informe o valor estimado para gerar o orçamento.");
    expect(error.errors).toHaveLength(2);
    expect(error.isRetryable).toBe(false);
  });

  it("mapeia 429, 401 e 503 para mensagens próprias", () => {
    expect(toApiError(429, { message: "Too Many Requests" }).message).toBe(MESSAGES.rateLimit);
    expect(toApiError(429, {}).isRetryable).toBe(true);
    expect(toApiError(401, { message: "Chave inválida." }).message).toBe(MESSAGES.unauthorized);
    expect(toApiError(503, { message: "Banco de dados indisponível." }).message).toBe(MESSAGES.unavailable);
    expect(toApiError(503, {}).isRetryable).toBe(true);
  });

  it("tolera corpo ausente ou fora do formato", () => {
    const error = toApiError(404, null);
    expect(error.message).toBe(MESSAGES.notFound);
    expect(error.errors).toEqual([]);
    expect(toApiError(422, { errors: [{ field: 1 }, { field: "to", message: "Bloqueado." }] }).errors).toEqual([{ field: "to", message: "Bloqueado." }]);
  });
});

describe("fieldErrors", () => {
  it("separa as violações de campos do formulário das demais, inclusive campos aninhados", () => {
    const error = toApiError(400, {
      message: "Informe o nome do brinde.",
      errors: [
        { field: "items.0.name", message: "Informe o nome do brinde." },
        { field: "proposalValidUntil", message: "A validade da proposta não pode ser anterior a hoje (15/10/2026)." },
        { field: "body", message: "Informe ao menos um campo para atualizar." },
      ],
    });
    const { matched, rest } = fieldErrors(error, ["items", "proposalValidUntil", "estimatedValue"]);
    expect(matched).toEqual({
      items: "Informe o nome do brinde.",
      proposalValidUntil: "A validade da proposta não pode ser anterior a hoje (15/10/2026).",
    });
    expect(rest).toEqual(["Informe ao menos um campo para atualizar."]);
  });

  it("não encontra campos em erros que não são da API", () => {
    expect(fieldErrors(new Error("x"), ["to"])).toEqual({ matched: {}, rest: [] });
  });
});

describe("send", () => {
  it("converte falha de rede em erro de conexão", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    const error = await send("/catalogs").catch((reason) => reason);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.kind).toBe("network");
    expect(error.status).toBe(0);
    expect(error.message).toMatch(/^Não foi possível conectar à API/);
    expect(error.isRetryable).toBe(true);
  });

  it("aborta a requisição ao estourar o tempo limite", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", hangUntilAborted());
    const pending = send("/catalogs", { timeoutMs: 50 }).catch((reason) => reason);
    await vi.advanceTimersByTimeAsync(60);
    const error = await pending;
    expect(error).toBeInstanceOf(ApiError);
    expect(error.kind).toBe("timeout");
    expect(error.message).toBe(MESSAGES.timeout);
  });

  it("repassa o cancelamento feito pelo chamador sem convertê-lo em erro de rede", async () => {
    vi.stubGlobal("fetch", hangUntilAborted());
    const controller = new AbortController();
    const pending = send("/catalogs", { signal: controller.signal }).catch((reason) => reason);
    controller.abort();
    const error = await pending;
    expect(error).not.toBeInstanceOf(ApiError);
    expect(error.name).toBe("AbortError");
  });

  it("transforma respostas de erro em ApiError com status e violações", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        json(422, {
          statusCode: 422,
          message: "Fechamento só é permitido a partir de Forecast.",
          errors: [{ field: "to", message: "Fechamento só é permitido a partir de Forecast." }],
        }),
      ),
    );
    const error = await moveStage("abc", { to: Stage.FECHAMENTO, expectedVersion: 1 }).catch((reason) => reason);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(422);
    expect(error.errors[0].field).toBe("to");
  });

  it("envia o corpo em JSON com o método correto", async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(200, { id: "abc" }));
    vi.stubGlobal("fetch", fetchMock);
    await moveStage("abc", { to: Stage.FORECAST, expectedVersion: 3 });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:3333/opportunities/abc/stage");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body)).toEqual({ to: "FORECAST", expectedVersion: 3 });
    expect(init.headers["Content-Type"]).toBe("application/json");
  });
});

describe("listOpportunities", () => {
  it("monta a query sem parâmetros vazios e lê o X-Total-Count", async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(200, [{ id: "1" }], { "X-Total-Count": "42" }));
    vi.stubGlobal("fetch", fetchMock);
    const page = await listOpportunities({ search: "vida", sellerId: undefined, page: 2, pageSize: 1, onlyAttention: true });
    expect(page.total).toBe(42);
    expect(page.items).toHaveLength(1);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.pathname).toBe("/opportunities");
    expect(Object.fromEntries(url.searchParams)).toEqual({ search: "vida", page: "2", pageSize: "1", onlyAttention: "true" });
  });

  it("usa o tamanho da lista quando não há paginação", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json(200, [{ id: "1" }, { id: "2" }])));
    expect((await listOpportunities()).total).toBe(2);
  });

  it("monta URLs com a base configurada", () => {
    expect(buildUrl("/sellers")).toBe("http://localhost:3333/sellers");
  });
});
