import type {
  ApiErrorBody,
  Catalogs,
  ContactInput,
  ContactLog,
  FieldViolation,
  FollowupTask,
  FollowupTaskQuery,
  GenerateTasksResult,
  MoveStageInput,
  NewOpportunityInput,
  Opportunity,
  OpportunityPage,
  OpportunityQuery,
  Seller,
  StageChange,
  UpdateOpportunityInput,
} from "./types";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333").replace(/\/+$/, "");
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

const READ_TIMEOUT_MS = 10_000;
const WRITE_TIMEOUT_MS = 15_000;
const TOTAL_COUNT_HEADER = "X-Total-Count";

export const MESSAGES = {
  network: "Não foi possível conectar à API. Verifique se ela está no ar e tente novamente.",
  timeout: "A API demorou demais para responder. Tente novamente.",
  conflict: "Esta oportunidade foi alterada por outra pessoa. Os dados foram atualizados.",
  rateLimit: "Muitas requisições. Aguarde um instante e tente novamente.",
  unauthorized: "A API recusou a chave de acesso.",
  unavailable: "A API está temporariamente indisponível (banco de dados fora do ar). Tente novamente em instantes.",
  server: "A API encontrou um erro inesperado. Tente novamente.",
  notFound: "Registro não encontrado. Ele pode ter sido removido.",
  invalidResponse: "A API respondeu em um formato inesperado.",
  generic: "Não foi possível concluir a operação.",
} as const;

const STATUS_MESSAGES: Partial<Record<number, string>> = {
  401: MESSAGES.unauthorized,
  409: MESSAGES.conflict,
  429: MESSAGES.rateLimit,
  503: MESSAGES.unavailable,
};

type ApiErrorKind = "network" | "timeout" | "http";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors: FieldViolation[] = [],
    public kind: ApiErrorKind = "http",
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isConflict() {
    return this.status === 409;
  }

  get isRetryable() {
    return this.kind !== "http" || this.status === 429 || this.status >= 500;
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

const isViolation = (value: unknown): value is FieldViolation =>
  isRecord(value) && typeof value.field === "string" && typeof value.message === "string";

function parseBody(body: unknown): Partial<ApiErrorBody> {
  if (!isRecord(body)) return {};
  return {
    message: typeof body.message === "string" ? body.message : undefined,
    errors: Array.isArray(body.errors) ? body.errors.filter(isViolation) : [],
  };
}

function httpMessage(status: number, server: string | null): string {
  const fixed = STATUS_MESSAGES[status];
  if (fixed) return fixed;
  if (status >= 500) return MESSAGES.server;
  return server ?? (status === 404 ? MESSAGES.notFound : MESSAGES.generic);
}

export function toApiError(status: number, body: unknown): ApiError {
  const parsed = parseBody(body);
  const errors = parsed.errors ?? [];
  const server = parsed.message ?? errors[0]?.message ?? null;
  return new ApiError(httpMessage(status, server), status, errors);
}

const networkError = () => new ApiError(MESSAGES.network, 0, [], "network");

const timeoutError = () => new ApiError(MESSAGES.timeout, 0, [], "timeout");

export const errorMessage = (error: unknown, fallback: string = MESSAGES.generic) =>
  error instanceof ApiError ? error.message : fallback;

export function fieldErrors(error: unknown, fields: readonly string[]) {
  const matched: Record<string, string> = {};
  const rest: string[] = [];
  if (!(error instanceof ApiError)) return { matched, rest };
  for (const violation of error.errors) {
    const field = fields.includes(violation.field) ? violation.field : violation.field.split(".")[0];
    if (fields.includes(field)) {
      matched[field] ??= violation.message;
    } else {
      rest.push(violation.message);
    }
  }
  return { matched, rest };
}

const failureForced = () =>
  typeof window !== "undefined" && new URLSearchParams(window.location.search).has("falha");

type Query = Record<string, string | number | boolean | undefined | null>;

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  query?: Query;
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
}

export function buildUrl(path: string, query?: Query) {
  const params = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
  });
  const search = params.toString();
  return `${API_URL}${path}${search ? `?${search}` : ""}`;
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function send(path: string, options: RequestOptions = {}): Promise<{ data: unknown; headers: Headers }> {
  if (failureForced()) throw networkError();

  const method = options.method ?? "GET";
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, options.timeoutMs ?? (method === "GET" ? READ_TIMEOUT_MS : WRITE_TIMEOUT_MS));
  const forward = () => controller.abort();
  if (options.signal?.aborted) controller.abort();
  options.signal?.addEventListener("abort", forward);

  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (API_KEY) headers["x-api-key"] = API_KEY;

  try {
    let response: Response;
    try {
      response = await fetch(buildUrl(path, options.query), {
        method,
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: controller.signal,
      });
    } catch (error) {
      if (timedOut) throw timeoutError();
      if (options.signal?.aborted) throw error;
      throw networkError();
    }
    const data = await readJson(response);
    if (!response.ok) throw toApiError(response.status, data);
    return { data, headers: response.headers };
  } catch (error) {
    if (timedOut && !(error instanceof ApiError)) throw timeoutError();
    throw error;
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener("abort", forward);
  }
}

async function request<T>(path: string, options?: RequestOptions): Promise<T> {
  const { data } = await send(path, options);
  return data as T;
}

function readTotal(headers: Headers, fallback: number) {
  const raw = headers.get(TOTAL_COUNT_HEADER);
  const total = raw == null ? NaN : Number(raw);
  return Number.isFinite(total) ? total : fallback;
}

const opportunityPath = (id: string) => `/opportunities/${encodeURIComponent(id)}`;

export const getCatalogs = (signal?: AbortSignal) => request<Catalogs>("/catalogs", { signal });

export const listSellers = (signal?: AbortSignal) => request<Seller[]>("/sellers", { signal });

export async function listOpportunities(query: OpportunityQuery = {}, signal?: AbortSignal): Promise<OpportunityPage> {
  const { data, headers } = await send("/opportunities", { query: { ...query }, signal });
  if (!Array.isArray(data)) throw new ApiError(MESSAGES.invalidResponse, 200);
  const items = data as Opportunity[];
  return { items, total: readTotal(headers, items.length) };
}

export const getOpportunity = (id: string, signal?: AbortSignal) => request<Opportunity>(opportunityPath(id), { signal });

export const createOpportunity = (input: NewOpportunityInput) =>
  request<Opportunity>("/opportunities", { method: "POST", body: input });

export const updateOpportunity = (id: string, input: UpdateOpportunityInput) =>
  request<Opportunity>(opportunityPath(id), { method: "PATCH", body: input });

export const moveStage = (id: string, input: MoveStageInput) =>
  request<Opportunity>(`${opportunityPath(id)}/stage`, { method: "PATCH", body: input });

export const listHistory = (id: string, signal?: AbortSignal) => request<StageChange[]>(`${opportunityPath(id)}/history`, { signal });

export const registerContact = (id: string, input: ContactInput = {}) =>
  request<ContactLog>(`${opportunityPath(id)}/contacts`, { method: "POST", body: input });

export const listFollowupTasks = (query: FollowupTaskQuery = {}, signal?: AbortSignal) =>
  request<FollowupTask[]>("/followup-tasks", { query: { ...query }, signal });

export const generateFollowupTasks = () => request<GenerateTasksResult>("/followup-tasks/generate", { method: "POST" });

export const completeFollowupTask = (id: string) =>
  request<FollowupTask>(`/followup-tasks/${encodeURIComponent(id)}/done`, { method: "PATCH" });
