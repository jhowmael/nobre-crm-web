"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  OPEN_TASKS,
  useCatalogs,
  useCompleteTasks,
  useCreateOpportunity,
  useFollowupTasks,
  useInitialTaskGeneration,
  useMoveStage,
  useOpportunities,
  useOpportunityDetail,
  useRegisterContact,
  useSellersQuery,
  useUpdateOpportunity,
} from "@/hooks/queries";
import { useDebounced } from "@/hooks/use-debounced";
import { ApiError, errorMessage, fieldErrors } from "@/lib/api";
import { compareByUrgency } from "@/lib/attention";
import { canMoveTo, missingForQuote } from "@/lib/catalog";
import { dateBR } from "@/lib/format";
import { groupTasks, type TaskGroup } from "@/lib/tasks";
import { Stage, type MovePayload, type NewOpportunityInput, type Opportunity, type OpportunityQuery, type Seller } from "@/lib/types";
import { AppDataProvider, useCatalog, useSellerName, useSellers } from "./app-data";
import { Board } from "./board";
import { CloseModal } from "./close-modal";
import { COMPLETE_FIELDS, CompleteModal, type CompleteInput } from "./complete-modal";
import { Drawer } from "./drawer";
import { countActiveFilters, EMPTY_FILTERS, initialFilters, type Filters } from "./filters-menu";
import { ListView } from "./list-view";
import { LOSS_FIELDS, LossModal, type LossInput } from "./loss-modal";
import { NEW_FIELDS, NewModal } from "./new-modal";
import { BootScreen, BoardSkeleton, EmptyFunnel, ErrorState, ListSkeleton, NoResults, RefetchNotice } from "./states";
import { Summary, type TasksState } from "./summary";
import { useToast } from "./toast";
import { TitleRow, TopBar, type ViewMode } from "./topbar";

const USER_KEY = "nobre-crm:user";
const DEFAULT_USER_NAME = "ana";
const CLOSE_FIELDS = ["to", "stage"] as const;

function readStoredUser() {
  try {
    return localStorage.getItem(USER_KEY);
  } catch {
    return null;
  }
}

function storeUser(id: string | null) {
  try {
    if (id) localStorage.setItem(USER_KEY, id);
    else localStorage.removeItem(USER_KEY);
  } catch {
    return;
  }
}

const defaultUser = (sellers: Seller[]) =>
  sellers.find((seller) => seller.name.trim().toLowerCase() === DEFAULT_USER_NAME) ??
  sellers.find((seller) => seller.name.trim().toLowerCase().startsWith(DEFAULT_USER_NAME)) ??
  sellers[0] ??
  null;

function initialUser(sellers: Seller[]) {
  const stored = readStoredUser();
  return sellers.find((seller) => seller.id === stored) ?? defaultUser(sellers);
}

interface ReportOptions {
  fallback: string;
  fields?: readonly string[];
  onFields?: (errors: Record<string, string>) => void;
  retry?: () => void;
}

export function FunnelApp() {
  const catalogs = useCatalogs();
  const sellers = useSellersQuery();

  if (catalogs.data && sellers.data) {
    return (
      <AppDataProvider catalogs={catalogs.data} sellers={sellers.data}>
        <Funnel />
      </AppDataProvider>
    );
  }

  const failure = catalogs.isError ? catalogs.error : sellers.isError ? sellers.error : null;
  if (failure) {
    return (
      <BootScreen
        error={errorMessage(failure, "Erro inesperado ao carregar o catálogo.")}
        retrying={catalogs.isFetching || sellers.isFetching}
        onRetry={() => {
          if (catalogs.isError) catalogs.refetch();
          if (sellers.isError) sellers.refetch();
        }}
      />
    );
  }
  return <BootScreen />;
}

function Funnel() {
  const toast = useToast();
  const catalog = useCatalog();
  const sellers = useSellers();
  const sellerName = useSellerName();

  const reportTasksError = useCallback(
    (error: unknown) => toast(`As tarefas de retorno não foram atualizadas. ${errorMessage(error)}`, "error"),
    [toast],
  );
  const move = useMoveStage(reportTasksError);
  const contact = useRegisterContact(reportTasksError);
  const create = useCreateOpportunity(reportTasksError);
  const update = useUpdateOpportunity(reportTasksError);
  const completeTasks = useCompleteTasks();

  const [userId, setUserId] = useState<string | null>(() => initialUser(sellers)?.id ?? null);
  const user = sellers.find((seller) => seller.id === userId) ?? null;
  const [filters, setFilters] = useState<Filters>(() => initialFilters(user));
  const [view, setView] = useState<ViewMode>("board");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lossFor, setLossFor] = useState<Opportunity | null>(null);
  const [completeFor, setCompleteFor] = useState<Opportunity | null>(null);
  const [closeFor, setCloseFor] = useState<Opportunity | null>(null);
  const [lossEditFor, setLossEditFor] = useState<Opportunity | null>(null);
  const [creating, setCreating] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [validityError, setValidityError] = useState<string | undefined>(undefined);

  const search = useDebounced(filters.search.trim(), 300);
  const mine = filters.onlyMine && user ? user : null;
  const sellerScope = mine?.id ?? (filters.seller || null);
  const scopeName = mine?.name ?? sellerName(filters.seller);
  const filtering = filters.search.trim() !== "" || countActiveFilters(filters, user) > 0;

  const scopeParams = useMemo<OpportunityQuery>(() => (sellerScope ? { sellerId: sellerScope } : {}), [sellerScope]);
  const visibleParams = useMemo<OpportunityQuery>(() => {
    const params: OpportunityQuery = { ...scopeParams };
    if (search) params.search = search;
    if (filters.stage) params.stage = filters.stage as Stage;
    if (filters.onlyAttention) params.onlyAttention = true;
    return params;
  }, [scopeParams, search, filters.stage, filters.onlyAttention]);

  const scopeQuery = useOpportunities(scopeParams);
  const visibleQuery = useOpportunities(visibleParams);

  const scoped = useMemo(() => scopeQuery.data?.items ?? [], [scopeQuery.data]);
  const visible = useMemo(() => [...(visibleQuery.data?.items ?? [])].sort(compareByUrgency), [visibleQuery.data]);
  const hasData = scopeQuery.data !== undefined && visibleQuery.data !== undefined;
  const loadError = scopeQuery.isError ? scopeQuery.error : visibleQuery.isError ? visibleQuery.error : null;
  const ready = hasData && scoped.length > 0;
  const fetching = scopeQuery.isFetching || visibleQuery.isFetching;

  const listed = selectedId ? (visible.find((opp) => opp.id === selectedId) ?? scoped.find((opp) => opp.id === selectedId) ?? null) : null;
  const detail = useOpportunityDetail(selectedId, selectedId != null && listed == null);
  const selected = listed ?? (detail.data && detail.data.id === selectedId ? detail.data : null);

  useEffect(() => {
    if (selectedId && !listed && detail.isError) {
      toast(errorMessage(detail.error, "Não foi possível abrir a oportunidade."), "error");
      setSelectedId(null);
    }
  }, [selectedId, listed, detail.isError, detail.error, toast]);

  const generation = useInitialTaskGeneration();
  const tasksEnabled = generation.isSuccess || generation.isError;
  useEffect(() => {
    if (generation.isError) reportTasksError(generation.error);
  }, [generation.isError, generation.error, reportTasksError]);

  const taskParams = useMemo(
    () => ({ status: OPEN_TASKS, dueUntil: catalog.today, ...(sellerScope ? { sellerId: sellerScope } : {}) }),
    [catalog.today, sellerScope],
  );
  const tasksQuery = useFollowupTasks(taskParams, tasksEnabled);
  const groups = useMemo(() => groupTasks(tasksQuery.data ?? []), [tasksQuery.data]);
  const tasksState: TasksState = !tasksEnabled || (tasksQuery.isPending && !tasksQuery.isError) ? "loading" : tasksQuery.data ? "ready" : "error";
  const lastTaskError = useRef(0);
  useEffect(() => {
    if (!tasksQuery.isError || !tasksQuery.data || tasksQuery.errorUpdatedAt === lastTaskError.current) return;
    lastTaskError.current = tasksQuery.errorUpdatedAt;
    toast(`Não foi possível atualizar as tarefas de retorno. ${errorMessage(tasksQuery.error)}`, "error");
  }, [tasksQuery.isError, tasksQuery.data, tasksQuery.error, tasksQuery.errorUpdatedAt, toast]);

  const report = (error: unknown, options: ReportOptions) => {
    if (error instanceof ApiError && (error.status === 400 || error.status === 422) && options.fields) {
      const { matched, rest } = fieldErrors(error, options.fields);
      if (Object.keys(matched).length > 0) {
        options.onFields?.(matched);
        rest.forEach((message) => toast(message, "error"));
        return;
      }
    }
    const retry = error instanceof ApiError && error.isRetryable ? options.retry : undefined;
    toast(errorMessage(error, options.fallback), "error", retry ? { label: "Tentar novamente", onClick: retry } : undefined);
  };

  const runMove = (opp: Opportunity, to: Stage, payload?: MovePayload, onDone?: () => void, fields?: readonly string[]) => {
    setFormErrors({});
    move.mutateAsync({ opp, to, payload }).then(
      () => {
        onDone?.();
        toast(`${opp.company} movida para ${catalog.label(to)}.`);
      },
      (error) =>
        report(error, {
          fallback: "Não foi possível mover a oportunidade.",
          fields,
          onFields: setFormErrors,
          retry: () => runMove(opp, to, payload, onDone, fields),
        }),
    );
  };

  const openModal = (open: () => void) => {
    setFormErrors({});
    open();
  };

  const requestMove = (opp: Opportunity, to: Stage) => {
    if (to === opp.stage) return;
    if (!canMoveTo(opp, to)) {
      toast(catalog.blockedReason(opp.stage, to) ?? "Movimento não permitido.", "error");
      return;
    }
    if (to === Stage.PERDIDA) return openModal(() => setLossFor(opp));
    if (to === Stage.APRESENTACAO_ORCAMENTO && missingForQuote(opp, catalog.today).length > 0) return openModal(() => setCompleteFor(opp));
    if (to === Stage.FECHAMENTO) return openModal(() => setCloseFor(opp));
    runMove(opp, to);
  };

  const confirmLoss = (input: LossInput) => {
    if (lossFor) runMove(lossFor, Stage.PERDIDA, input, () => setLossFor(null), LOSS_FIELDS);
  };

  const confirmComplete = (data: CompleteInput) => {
    if (completeFor) runMove(completeFor, Stage.APRESENTACAO_ORCAMENTO, data, () => setCompleteFor(null), COMPLETE_FIELDS);
  };

  const confirmClose = () => {
    if (closeFor) runMove(closeFor, Stage.FECHAMENTO, undefined, () => setCloseFor(null), CLOSE_FIELDS);
  };

  const saveValidity = (opp: Opportunity, date: string, onDone: () => void) => {
    setValidityError(undefined);
    update.mutateAsync({ opp, patch: { proposalValidUntil: date } }).then(
      () => {
        onDone();
        toast(`Validade da proposta de ${opp.company} atualizada para ${dateBR(date)}.`);
      },
      (error) =>
        report(error, {
          fallback: "Não foi possível atualizar a validade.",
          fields: ["proposalValidUntil"],
          onFields: (errors) => setValidityError(errors.proposalValidUntil),
          retry: () => saveValidity(opp, date, onDone),
        }),
    );
  };

  const saveLossReason = (input: LossInput) => {
    const opp = lossEditFor;
    if (!opp) return;
    setFormErrors({});
    update.mutateAsync({ opp, patch: input }).then(
      () => {
        setLossEditFor(null);
        toast(`Motivo da perda de ${opp.company} registrado.`);
      },
      (error) =>
        report(error, {
          fallback: "Não foi possível registrar o motivo.",
          fields: LOSS_FIELDS,
          onFields: setFormErrors,
          retry: () => saveLossReason(input),
        }),
    );
  };

  const registerContact = (opp: Opportunity) =>
    contact.mutateAsync({ opp, sellerId: user?.id }).then(
      () => toast(`Contato com ${opp.company} registrado.`),
      (error) => report(error, { fallback: `Não foi possível registrar o contato com ${opp.company}.`, retry: () => registerContact(opp) }),
    );

  const handleCreate = (input: NewOpportunityInput) => {
    setFormErrors({});
    create.mutateAsync(input).then(
      (created) => {
        setCreating(false);
        toast(`Oportunidade ${created.code} criada em ${catalog.label(created.stage)}.`);
      },
      onError: (error) =>
        report(error, { fallback: "Não foi possível criar a oportunidade.", fields: NEW_FIELDS, onFields: setFormErrors, retry: () => handleCreate(input) }),
    });
  };

  const completeGroup = (group: TaskGroup) =>
    completeTasks.mutateAsync(group.tasks.map((task) => task.id)).then(
      () => toast(group.tasks.length === 1 ? `Tarefa de ${group.company} concluída.` : `Tarefas de ${group.company} concluídas.`),
      (error) => report(error, { fallback: "Não foi possível concluir a tarefa.", retry: () => completeGroup(group) }),
    );

  const openDetails = (opp: Opportunity) => {
    setValidityError(undefined);
    setSelectedId(opp.id);
  };
  const openById = (id: string) => {
    setValidityError(undefined);
    setSelectedId(id);
  };
  const retryLoad = () => {
    if (scopeQuery.isError) scopeQuery.refetch();
    if (visibleQuery.isError) visibleQuery.refetch();
  };
  const refetchNotice = hasData && loadError ? <RefetchNotice retrying={fetching} onRetry={retryLoad} /> : null;
  const closeIfIdle = (close: () => void) => () => {
    if (!move.isPending) close();
  };

  return (
    <div className="flex min-h-dvh flex-col md:h-dvh">
      <TopBar
        search={filters.search}
        onSearch={(value) => setFilters((current) => ({ ...current, search: value }))}
        user={user}
        onUserChange={(id) => {
          setUserId(id);
          storeUser(id);
        }}
        onSignOut={() => {
          setUserId(null);
          storeUser(null);
          setFilters((current) => ({ ...current, onlyMine: false }));
          toast("Sessão encerrada (simulação).");
        }}
        onSignIn={() => {
          const next = defaultUser(sellers);
          setUserId(next?.id ?? null);
          storeUser(next?.id ?? null);
        }}
      />
      <main className="mx-inset mb-inset flex min-w-0 flex-1 flex-col gap-gap rounded-sheet border-[length:var(--edge)] border-sheet-edge bg-sheet pt-pad max-sm:rounded-none md:min-h-0">
        <div className="px-pad">
          <TitleRow filters={filters} onChange={setFilters} view={view} onViewChange={setView} onNew={() => openModal(() => setCreating(true))} user={user} />
        </div>
        {ready && (
          <div className="px-pad">
            <Summary
              opportunities={scoped}
              groups={groups}
              tasksState={tasksState}
              tasksFetching={tasksQuery.isFetching}
              scope={scopeName}
              fetching={fetching}
              onOpen={openById}
              onComplete={completeGroup}
              onRetryTasks={() => tasksQuery.refetch()}
            />
          </div>
        )}

        {!hasData && !loadError && (view === "board" ? <BoardSkeleton /> : <ListSkeleton />)}
        {!hasData && loadError && <ErrorState message={errorMessage(loadError, "Erro inesperado.")} retrying={fetching} onRetry={retryLoad} />}
        {hasData && scoped.length === 0 && !sellerScope && <EmptyFunnel onNew={() => openModal(() => setCreating(true))} />}
        {hasData && scoped.length === 0 && sellerScope && <NoResults onClear={() => setFilters(EMPTY_FILTERS)} />}
        {ready && visible.length === 0 && <NoResults onClear={() => setFilters(EMPTY_FILTERS)} />}
        {ready && visible.length > 0 && view === "board" && (
          <Board
            opportunities={visible}
            all={scoped}
            filtering={filtering}
            stageFilter={filters.stage}
            onOpen={openDetails}
            onMove={requestMove}
            notice={refetchNotice}
          />
        )}
        {ready && visible.length > 0 && view === "list" && (
          <div className="relative flex min-w-0 flex-col px-pad pb-pad md:min-h-0 md:flex-1">
            {refetchNotice}
            <ListView opportunities={visible} onOpen={openDetails} />
          </div>
        )}
      </main>

      {selected && (
        <Drawer
          opp={selected}
          onClose={() => setSelectedId(null)}
          onMove={requestMove}
          onContact={registerContact}
          onSaveValidity={saveValidity}
          onRegisterLoss={(opp) => openModal(() => setLossEditFor(opp))}
          contactPending={contact.isPending}
          movePending={move.isPending}
          validityPending={update.isPending}
          validityError={validityError}
        />
      )}
      {lossFor && (
        <LossModal opp={lossFor} pending={move.isPending} serverErrors={formErrors} onConfirm={confirmLoss} onClose={closeIfIdle(() => setLossFor(null))} />
      )}
      {completeFor && (
        <CompleteModal
          opp={completeFor}
          pending={move.isPending}
          serverErrors={formErrors}
          onConfirm={confirmComplete}
          onClose={closeIfIdle(() => setCompleteFor(null))}
        />
      )}
      {closeFor && (
        <CloseModal
          opp={closeFor}
          pending={move.isPending}
          error={formErrors.to ?? formErrors.stage}
          onConfirm={confirmClose}
          onClose={closeIfIdle(() => setCloseFor(null))}
        />
      )}
      {lossEditFor && (
        <LossModal
          mode="edit"
          opp={lossEditFor}
          pending={update.isPending}
          serverErrors={formErrors}
          onConfirm={saveLossReason}
          onClose={() => {
            if (!update.isPending) setLossEditFor(null);
          }}
        />
      )}
      {creating && (
        <NewModal
          defaultSellerId={user?.id ?? null}
          serverErrors={formErrors}
          onCreate={handleCreate}
          onClose={() => setCreating(false)}
          pending={create.isPending}
        />
      )}
    </div>
  );
}
