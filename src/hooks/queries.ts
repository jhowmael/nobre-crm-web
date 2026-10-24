"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useCatalog } from "@/components/app-data";
import {
  ApiError,
  completeFollowupTask,
  createOpportunity,
  generateFollowupTasks,
  getCatalogs,
  getOpportunity,
  listFollowupTasks,
  listHistory,
  listOpportunities,
  listSellers,
  moveStage,
  registerContact,
  updateOpportunity,
} from "@/lib/api";
import { withoutSignals } from "@/lib/attention";
import {
  AttentionCode,
  FollowupTaskStatus,
  Stage,
  type FollowupTask,
  type FollowupTaskQuery,
  type MovePayload,
  type NewOpportunityInput,
  type Opportunity,
  type OpportunityPage,
  type OpportunityPatch,
  type OpportunityQuery,
} from "@/lib/types";

export const KEYS = {
  catalogs: ["catalogs"] as const,
  sellers: ["sellers"] as const,
  opportunities: ["opportunities"] as const,
  list: (query: OpportunityQuery) => ["opportunities", "list", query] as const,
  detail: (id: string) => ["opportunities", "detail", id] as const,
  history: (id: string) => ["history", id] as const,
  tasks: ["followup-tasks"] as const,
  taskList: (query: FollowupTaskQuery) => ["followup-tasks", query] as const,
  generation: ["followup-generation"] as const,
};

const WRITE_KEY = ["opportunities", "write"];
const WRITE_SCOPE = { id: "opportunities-write" };
const CONTACT_CODES = [AttentionCode.NO_CONTACT, AttentionCode.NO_CONTACT_REGISTERED];

export const useCatalogs = () =>
  useQuery({ queryKey: KEYS.catalogs, queryFn: ({ signal }) => getCatalogs(signal), staleTime: Infinity, gcTime: Infinity, retry: false });

export const useSellersQuery = () =>
  useQuery({ queryKey: KEYS.sellers, queryFn: ({ signal }) => listSellers(signal), staleTime: 5 * 60_000, retry: false });

export const useOpportunities = (query: OpportunityQuery) =>
  useQuery({
    queryKey: KEYS.list(query),
    queryFn: ({ signal }) => listOpportunities(query, signal),
    placeholderData: keepPreviousData,
    retry: false,
  });

export const useOpportunityDetail = (id: string | null, enabled: boolean) =>
  useQuery({
    queryKey: KEYS.detail(id ?? ""),
    queryFn: ({ signal }) => getOpportunity(id!, signal),
    enabled: enabled && id != null,
    retry: false,
  });

export const useHistory = (id: string | null) =>
  useQuery({
    queryKey: KEYS.history(id ?? ""),
    queryFn: ({ signal }) => listHistory(id!, signal),
    enabled: id != null,
    retry: false,
  });

export const useInitialTaskGeneration = () =>
  useQuery({ queryKey: KEYS.generation, queryFn: generateFollowupTasks, staleTime: Infinity, gcTime: Infinity, retry: false });

export const useFollowupTasks = (query: FollowupTaskQuery, enabled: boolean) =>
  useQuery({
    queryKey: KEYS.taskList(query),
    queryFn: ({ signal }) => listFollowupTasks(query, signal),
    enabled,
    placeholderData: keepPreviousData,
    retry: false,
  });

const isPage = (data: unknown): data is OpportunityPage =>
  typeof data === "object" && data !== null && "total" in data && Array.isArray((data as OpportunityPage).items);

const isOpportunity = (data: unknown): data is Opportunity =>
  typeof data === "object" && data !== null && "id" in data && "version" in data && !("total" in data);

function patchEverywhere(client: QueryClient, id: string, patch: (opp: Opportunity) => Opportunity) {
  client.setQueriesData({ queryKey: KEYS.opportunities }, (data: unknown) => {
    if (isPage(data)) return { ...data, items: data.items.map((opp) => (opp.id === id ? patch(opp) : opp)) };
    if (isOpportunity(data) && data.id === id) return patch(data);
    return data;
  });
}

export function findCached(client: QueryClient, id: string): Opportunity | undefined {
  let found: Opportunity | undefined;
  client.getQueriesData({ queryKey: KEYS.opportunities }).forEach(([, data]) => {
    const candidate = isPage(data) ? data.items.find((opp) => opp.id === id) : isOpportunity(data) && data.id === id ? data : undefined;
    if (candidate && (!found || candidate.version > found.version)) found = candidate;
  });
  return found;
}

const expectedVersion = (client: QueryClient, opp: Opportunity) => findCached(client, opp.id)?.version ?? opp.version;

async function beginOptimistic(client: QueryClient, id: string, patch: (opp: Opportunity) => Opportunity) {
  await client.cancelQueries({ queryKey: KEYS.opportunities });
  const previous = findCached(client, id);
  patchEverywhere(client, id, patch);
  return { previous };
}

function rollback(client: QueryClient, previous: Opportunity | undefined) {
  if (previous) patchEverywhere(client, previous.id, () => previous);
}

function replaceWithServer(client: QueryClient, opp: Opportunity) {
  patchEverywhere(client, opp.id, () => opp);
}

function refreshAfterWrite(client: QueryClient, error: unknown, id?: string) {
  if (id) client.invalidateQueries({ queryKey: KEYS.history(id) });
  if (error instanceof ApiError && error.isConflict) {
    client.invalidateQueries({ queryKey: KEYS.opportunities });
    client.invalidateQueries({ queryKey: KEYS.tasks });
    return;
  }
  if (client.isMutating({ mutationKey: WRITE_KEY }) <= 1) client.invalidateQueries({ queryKey: KEYS.opportunities });
}

let generation: Promise<void> | null = null;
let pendingGeneration = false;

export function useRegenerateTasks(onError?: (error: unknown) => void) {
  const client = useQueryClient();
  return useCallback(() => {
    if (generation) {
      pendingGeneration = true;
      return;
    }
    const run = (): Promise<void> =>
      generateFollowupTasks()
        .then(() => client.invalidateQueries({ queryKey: KEYS.tasks }))
        .catch((error) => {
          client.invalidateQueries({ queryKey: KEYS.tasks });
          onError?.(error);
        })
        .then(() => {
          if (!pendingGeneration) return;
          pendingGeneration = false;
          return run();
        });
    generation = run().finally(() => {
      generation = null;
    });
  }, [client, onError]);
}

function removeTasks(client: QueryClient, predicate: (task: FollowupTask) => boolean) {
  const previous = client.getQueriesData<FollowupTask[]>({ queryKey: KEYS.tasks });
  client.setQueriesData<FollowupTask[]>({ queryKey: KEYS.tasks }, (tasks) => tasks?.filter((task) => !predicate(task)));
  return previous;
}

function restoreTasks(client: QueryClient, previous: ReturnType<typeof removeTasks> | undefined) {
  previous?.forEach(([key, data]) => client.setQueryData(key, data));
}

export interface MoveVars {
  opp: Opportunity;
  to: Stage;
  payload?: MovePayload;
}

export function useMoveStage(onTasksError?: (error: unknown) => void) {
  const client = useQueryClient();
  const catalog = useCatalog();
  const regenerate = useRegenerateTasks(onTasksError);
  return useMutation({
    mutationKey: WRITE_KEY,
    scope: WRITE_SCOPE,
    mutationFn: (vars: MoveVars) => moveStage(vars.opp.id, { ...vars.payload, to: vars.to, expectedVersion: expectedVersion(client, vars.opp) }),
    onMutate: (vars) =>
      beginOptimistic(client, vars.opp.id, (opp) => ({
        ...opp,
        stage: vars.to,
        allowedTransitions: catalog.transitions(vars.to),
        estimatedValue: vars.payload?.estimatedValue ?? opp.estimatedValue,
        items: vars.payload?.items ? vars.payload.items.map((item, index) => ({ id: `novo-${index}`, ...item })) : opp.items,
        proposalValidUntil: vars.payload?.proposalValidUntil ?? opp.proposalValidUntil,
        lossReason:
          vars.to === Stage.PERDIDA && vars.payload?.lossReasonCode
            ? { code: vars.payload.lossReasonCode, label: catalog.lossReasons.find((reason) => reason.code === vars.payload?.lossReasonCode)?.label ?? "" }
            : opp.lossReason,
        lossNote: vars.to === Stage.PERDIDA ? (vars.payload?.lossNote ?? null) : opp.lossNote,
      })),
    onSuccess: (data) => {
      replaceWithServer(client, data);
      regenerate();
    },
    onError: (_error, _vars, context) => rollback(client, context?.previous),
    onSettled: (_data, error, vars) => refreshAfterWrite(client, error, vars.opp.id),
  });
}

export interface UpdateVars {
  opp: Opportunity;
  patch: OpportunityPatch;
}

export function useUpdateOpportunity(onTasksError?: (error: unknown) => void) {
  const client = useQueryClient();
  const catalog = useCatalog();
  const regenerate = useRegenerateTasks(onTasksError);
  return useMutation({
    mutationKey: WRITE_KEY,
    scope: WRITE_SCOPE,
    mutationFn: (vars: UpdateVars) => updateOpportunity(vars.opp.id, { ...vars.patch, expectedVersion: expectedVersion(client, vars.opp) }),
    onMutate: (vars) =>
      beginOptimistic(client, vars.opp.id, (opp) => {
        const next = { ...opp, ...vars.patch } as Opportunity;
        if (vars.patch.lossReasonCode) {
          next.lossReason = {
            code: vars.patch.lossReasonCode,
            label: catalog.lossReasons.find((reason) => reason.code === vars.patch.lossReasonCode)?.label ?? "",
          };
          next.lossNote = vars.patch.lossNote ?? null;
          next.lossReasonPending = false;
        }
        return next;
      }),
    onSuccess: (data, vars) => {
      replaceWithServer(client, data);
      if (vars.patch.proposalValidUntil !== undefined || vars.patch.eventDate !== undefined || vars.patch.estimatedValue !== undefined) regenerate();
    },
    onError: (_error, _vars, context) => rollback(client, context?.previous),
    onSettled: (_data, error, vars) => refreshAfterWrite(client, error, vars.opp.id),
  });
}

export interface ContactVars {
  opp: Opportunity;
  sellerId?: string;
}

export function useRegisterContact(onTasksError?: (error: unknown) => void) {
  const client = useQueryClient();
  const catalog = useCatalog();
  const regenerate = useRegenerateTasks(onTasksError);
  return useMutation({
    mutationKey: WRITE_KEY,
    scope: WRITE_SCOPE,
    mutationFn: async (vars: ContactVars) => {
      await registerContact(vars.opp.id, vars.sellerId ? { sellerId: vars.sellerId } : {});
      return getOpportunity(vars.opp.id).catch(() => null);
    },
    onMutate: async (vars) => {
      const context = await beginOptimistic(client, vars.opp.id, (opp) => ({
        ...opp,
        lastContactAt: catalog.today,
        attention: withoutSignals(opp.attention, CONTACT_CODES),
      }));
      await client.cancelQueries({ queryKey: KEYS.tasks });
      const tasks = removeTasks(client, (task) => task.opportunityId === vars.opp.id && CONTACT_CODES.includes(task.reasonKey));
      return { ...context, tasks };
    },
    onSuccess: (data) => {
      if (data) replaceWithServer(client, data);
      regenerate();
    },
    onError: (_error, _vars, context) => {
      rollback(client, context?.previous);
      restoreTasks(client, context?.tasks);
    },
    onSettled: (_data, error) => refreshAfterWrite(client, error),
  });
}

export function useCreateOpportunity(onTasksError?: (error: unknown) => void) {
  const client = useQueryClient();
  const regenerate = useRegenerateTasks(onTasksError);
  return useMutation({
    mutationKey: WRITE_KEY,
    scope: WRITE_SCOPE,
    mutationFn: (input: NewOpportunityInput) => createOpportunity(input),
    onSuccess: () => regenerate(),
    onSettled: (_data, error) => refreshAfterWrite(client, error),
  });
}

export function useCompleteTasks() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(ids.map((id) => completeFollowupTask(id)));
      const failure = results.find(
        (result): result is PromiseRejectedResult =>
          result.status === "rejected" && !(result.reason instanceof ApiError && result.reason.status === 422),
      );
      if (failure) throw failure.reason;
      return results.length;
    },
    onMutate: async (ids) => {
      await client.cancelQueries({ queryKey: KEYS.tasks });
      return { tasks: removeTasks(client, (task) => ids.includes(task.id)) };
    },
    onError: (_error, _ids, context) => restoreTasks(client, context?.tasks),
    onSettled: () => client.invalidateQueries({ queryKey: KEYS.tasks }),
  });
}

export const OPEN_TASKS = FollowupTaskStatus.OPEN;
