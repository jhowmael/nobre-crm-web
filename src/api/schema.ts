export interface paths {
    "/catalogs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["CatalogsController_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/followup-tasks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["FollowupTasksController_list"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/followup-tasks/{id}/done": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["FollowupTasksController_complete"];
        trace?: never;
    };
    "/followup-tasks/generate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["FollowupTasksController_generate"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["HealthController_check"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/opportunities": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["OpportunitiesController_list"];
        put?: never;
        post: operations["OpportunitiesController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/opportunities/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["OpportunitiesController_findOne"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["OpportunitiesController_update"];
        trace?: never;
    };
    "/opportunities/{id}/stage": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["OpportunitiesController_moveStage"];
        trace?: never;
    };
    "/opportunities/{opportunityId}/contacts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ContactLogsController_list"];
        put?: never;
        post: operations["ContactLogsController_register"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/opportunities/{opportunityId}/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["StageHistoriesController_list"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/opportunities/{opportunityId}/items": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["OpportunityItemsController_list"];
        put?: never;
        post: operations["OpportunityItemsController_add"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/opportunities/{opportunityId}/items/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["OpportunityItemsController_remove"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/sellers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["SellersController_list"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** @enum {string} */
        AttentionCode: AttentionCode;
        /** @enum {string} */
        AttentionLevel: AttentionLevel;
        AttentionResponseDto: {
            level: components["schemas"]["AttentionLevel"];
            signals: components["schemas"]["AttentionSignalResponseDto"][];
        };
        /** @enum {string} */
        AttentionSignalLevel: AttentionSignalLevel;
        AttentionSignalResponseDto: {
            /** @example PROPOSAL_EXPIRED */
            code: components["schemas"]["AttentionCode"];
            level: components["schemas"]["AttentionSignalLevel"];
            /** @example Proposta vencida há 2 dias */
            message: string;
        };
        BlockedReasonsByTargetResponseDto: {
            APRESENTACAO_ORCAMENTO: string | null;
            FECHAMENTO: string | null;
            FOLLOW_UP: string | null;
            FORECAST: string | null;
            PERDIDA: string | null;
            PRIMEIRO_CONTATO: string | null;
        };
        BlockedReasonsResponseDto: {
            APRESENTACAO_ORCAMENTO: components["schemas"]["BlockedReasonsByTargetResponseDto"];
            FECHAMENTO: components["schemas"]["BlockedReasonsByTargetResponseDto"];
            FOLLOW_UP: components["schemas"]["BlockedReasonsByTargetResponseDto"];
            FORECAST: components["schemas"]["BlockedReasonsByTargetResponseDto"];
            PERDIDA: components["schemas"]["BlockedReasonsByTargetResponseDto"];
            PRIMEIRO_CONTATO: components["schemas"]["BlockedReasonsByTargetResponseDto"];
        };
        CatalogsResponseDto: {
            /** @description Matriz origem x destino com o motivo do bloqueio; null quando a transição é permitida ou origem e destino são iguais. */
            blockedReasons: components["schemas"]["BlockedReasonsResponseDto"];
            lossReasons: components["schemas"]["LossReasonCatalogItemResponseDto"][];
            stages: components["schemas"]["StageCatalogItemResponseDto"][];
            /**
             * @description Data de referência do servidor (AAAA-MM-DD).
             * @example 2026-10-15
             */
            today: string;
            /** @description Etapas de destino permitidas a partir de cada etapa. */
            transitions: components["schemas"]["StageTransitionsResponseDto"];
        };
        ContactLogResponseDto: {
            /**
             * Format: date
             * @example 2026-10-15
             */
            contactedAt: string;
            /** Format: uuid */
            id: string;
            note: string | null;
        };
        CreateContactLogRequestDto: {
            /**
             * Format: date
             * @description Padrão: data de hoje.
             * @example 2026-10-15
             */
            contactedAt?: string;
            /** @example Cliente pediu ajuste na quantidade. */
            note?: string;
            /**
             * Format: uuid
             * @description Vendedor que fez o contato.
             */
            sellerId?: string;
        };
        CreateOpportunityItemRequestDto: {
            /** @example Agenda executiva */
            name: string;
            /** @example 1000 */
            quantity: number;
        };
        CreateOpportunityRequestDto: {
            /** @example Tech Alpha Ltda */
            company: string;
            /** @example 4500 */
            estimatedValue?: number;
            /**
             * Format: date
             * @example 2026-11-30
             */
            eventDate?: string;
            items?: components["schemas"]["GiftItemRequestDto"][];
            /** Format: uuid */
            sellerId: string;
        };
        /** @enum {string} */
        DatabaseStatus: DatabaseStatus;
        ErrorResponseDto: {
            /** @example Unprocessable Entity */
            error: string;
            /** @description Lista de violações; vazia quando o erro não é de campo. */
            errors: components["schemas"]["RuleViolationResponseDto"][];
            /** @example Informe o valor estimado para gerar o orçamento. */
            message: string;
            /** @example 422 */
            statusCode: number;
        };
        FollowupTaskResponseDto: {
            /** @example Clínica Vida */
            company: string;
            /**
             * Format: date
             * @example 2026-10-15
             */
            dueDate: string;
            /** Format: uuid */
            id: string;
            /** @description high: agir hoje; medium: acompanhar. */
            level: components["schemas"]["AttentionSignalLevel"];
            /** @example OPP-2003 */
            opportunityCode: string;
            /** Format: uuid */
            opportunityId: string;
            /** @example Evento em 3 dias e ainda em Follow-up */
            reason: string;
            /** @example EVENT_NEAR */
            reasonKey: components["schemas"]["AttentionCode"];
            /** Format: uuid */
            sellerId: string;
            status: components["schemas"]["FollowupTaskStatus"];
        };
        /** @enum {string} */
        FollowupTaskStatus: FollowupTaskStatus;
        GenerateFollowupTasksResponseDto: {
            /** @description Tarefas novas criadas. */
            created: number;
            /** @description Tarefas abertas que deixaram de ser necessárias e foram dispensadas. */
            dismissed: number;
        };
        GiftItemRequestDto: {
            /** @example Caneca personalizada */
            name: string;
            /** @example 300 */
            quantity: number;
        };
        GiftItemResponseDto: {
            /** Format: uuid */
            id: string;
            /** @example Caneca personalizada */
            name: string;
            /** @example 300 */
            quantity: number;
        };
        HealthResponseDto: {
            database: components["schemas"]["DatabaseStatus"];
            status: components["schemas"]["HealthStatus"];
        };
        /** @enum {string} */
        HealthStatus: HealthStatus;
        LossReasonCatalogItemResponseDto: {
            /** @description Somente motivos ativos podem ser escolhidos em novas perdas. */
            active: boolean;
            /** @example PRICE */
            code: string;
            /** @example Preço acima do orçamento do cliente */
            label: string;
        };
        LossReasonSummaryResponseDto: {
            /** @example COMPETITOR */
            code: string;
            /** @example Escolheu outro fornecedor */
            label: string;
        };
        MoveStageRequestDto: {
            /** @description Exigido em Apresentação de Orçamento, se ainda não informado. */
            estimatedValue?: number;
            /** @description Versão lida pelo cliente, para detectar movimentação concorrente. */
            expectedVersion: number;
            /** @description Substitui os itens atuais. */
            items?: components["schemas"]["GiftItemRequestDto"][];
            /**
             * @description Detalhe opcional do motivo da perda.
             * @example Concorrente ofereceu frete grátis.
             */
            lossNote?: string;
            /**
             * @description Obrigatório ao mover para Perdida: código ativo de GET /catalogs.
             * @example PRICE
             */
            lossReasonCode?: string;
            /**
             * Format: date
             * @example 2026-10-22
             */
            proposalValidUntil?: string;
            to: components["schemas"]["Stage"];
        };
        OpportunityItemResponseDto: {
            /** Format: uuid */
            id: string;
            /** @example Agenda executiva */
            name: string;
            /** @example 1000 */
            quantity: number;
        };
        OpportunityResponseDto: {
            allowedTransitions: components["schemas"]["Stage"][];
            attention: components["schemas"]["AttentionResponseDto"];
            /** @example OPP-2001 */
            code: string;
            /** @example Tech Alpha Ltda */
            company: string;
            /** @example 4500 */
            estimatedValue: number | null;
            /**
             * Format: date
             * @example 2026-11-30
             */
            eventDate: string | null;
            /** Format: uuid */
            id: string;
            items: components["schemas"]["GiftItemResponseDto"][];
            /**
             * Format: date
             * @example 2026-10-14
             */
            lastContactAt: string | null;
            /** @description Detalhe livre do motivo da perda. */
            lossNote: string | null;
            /** @description Preenchido somente em oportunidades Perdidas. */
            lossReason: components["schemas"]["LossReasonSummaryResponseDto"] | null;
            /** @description Perdida com motivo ainda não informado (dado migrado): pode ser completado com PATCH /opportunities/:id. */
            lossReasonPending: boolean;
            /**
             * Format: date
             * @example 2026-10-22
             */
            proposalValidUntil: string | null;
            seller: components["schemas"]["SellerSummaryResponseDto"];
            stage: components["schemas"]["Stage"];
            /** @example 1 */
            version: number;
        };
        /** @enum {string} */
        OpportunitySortField: OpportunitySortField;
        RuleViolationResponseDto: {
            /**
             * @description Campo ou regra que impediu a operação.
             * @example estimatedValue
             */
            field: string;
            /** @example Informe o valor estimado para gerar o orçamento. */
            message: string;
        };
        SellerResponseDto: {
            email: string | null;
            /** Format: uuid */
            id: string;
            /** @example Ana */
            name: string;
        };
        SellerSummaryResponseDto: {
            /** Format: uuid */
            id: string;
            /** @example Ana */
            name: string;
        };
        /** @enum {string} */
        SortDirection: SortDirection;
        /** @enum {string} */
        Stage: Stage;
        StageCatalogItemResponseDto: {
            /** @description Etapa final (Fechamento e Perdida) não pode ser movida. */
            final: boolean;
            /** @example Orçamento montado e enviado ao cliente. Exige valor estimado e ao menos um brinde. */
            hint: string;
            id: components["schemas"]["Stage"];
            /** @example Apresentação de Orçamento */
            label: string;
            /**
             * @description Posição de exibição, começando em 1.
             * @example 2
             */
            order: number;
            /** @example Exige valor estimado e ao menos um brinde. */
            requirement: string | null;
        };
        StageHistoryResponseDto: {
            /**
             * Format: date-time
             * @example 2026-10-15T10:00:00.000Z
             */
            at: string;
            /** @description Etapa de origem; null na criação. */
            from: components["schemas"]["Stage"] | null;
            /** Format: uuid */
            id: string;
            /** @example Escolheu outro fornecedor: concorrente ofereceu frete grátis */
            note: string | null;
            to: components["schemas"]["Stage"];
        };
        StageTransitionsResponseDto: {
            APRESENTACAO_ORCAMENTO: components["schemas"]["Stage"][];
            FECHAMENTO: components["schemas"]["Stage"][];
            FOLLOW_UP: components["schemas"]["Stage"][];
            FORECAST: components["schemas"]["Stage"][];
            PERDIDA: components["schemas"]["Stage"][];
            PRIMEIRO_CONTATO: components["schemas"]["Stage"][];
        };
        UpdateOpportunityRequestDto: {
            /** @example 4500 */
            estimatedValue?: number;
            /**
             * Format: date
             * @example 2026-11-30
             */
            eventDate?: string;
            /** @description Versão lida pelo cliente, para detectar edição concorrente. */
            expectedVersion: number;
            /**
             * @description Detalhe opcional do motivo da perda.
             * @example Cliente fechou com o fornecedor da matriz.
             */
            lossNote?: string;
            /**
             * @description Somente para oportunidades Perdidas com motivo pendente. Código ativo de GET /catalogs.
             * @example COMPETITOR
             */
            lossReasonCode?: string;
            /**
             * Format: date
             * @example 2026-10-22
             */
            proposalValidUntil?: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    CatalogsController_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Etapas, transições, bloqueios e motivos de perda: a fonte das regras para o frontend. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CatalogsResponseDto"];
                };
            };
        };
    };
    FollowupTasksController_list: {
        parameters: {
            query?: {
                /** @description Tarefas com vencimento até esta data. Padrão: hoje. */
                dueUntil?: string;
                sellerId?: string;
                status?: components["schemas"]["FollowupTaskStatus"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FollowupTaskResponseDto"][];
                };
            };
            /** @description Entrada em formato inválido. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    FollowupTasksController_complete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FollowupTaskResponseDto"];
                };
            };
            /** @description Entrada em formato inválido. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Tarefa não encontrada. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Tarefa já encerrada. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    FollowupTasksController_generate: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Executa a mesma rotina do agendamento diário. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenerateFollowupTasksResponseDto"];
                };
            };
            /** @description Entrada em formato inválido. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    HealthController_check: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthResponseDto"];
                };
            };
            /** @description Banco de dados indisponível. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthResponseDto"];
                };
            };
        };
    };
    OpportunitiesController_list: {
        parameters: {
            query?: {
                /** @description Somente oportunidades que exigem atenção. */
                onlyAttention?: boolean;
                /** @description Valores vazios ficam sempre por último. */
                order?: components["schemas"]["SortDirection"];
                /** @description Página (começa em 1). Ao enviar page ou pageSize, a resposta traz o cabeçalho X-Total-Count. */
                page?: number;
                /** @description Itens por página (padrão 20 quando page é enviado). */
                pageSize?: number;
                /** @description Busca por empresa, código (OPP-2001), vendedor ou brinde. */
                search?: string;
                sellerId?: string;
                sort?: components["schemas"]["OpportunitySortField"];
                stage?: components["schemas"]["Stage"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    /** @description Total de registros do filtro; enviado somente quando page ou pageSize são informados. */
                    "X-Total-Count"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OpportunityResponseDto"][];
                };
            };
            /** @description Entrada em formato inválido. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    OpportunitiesController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateOpportunityRequestDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OpportunityResponseDto"];
                };
            };
            /** @description Entrada em formato inválido. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Vendedor inexistente. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    OpportunitiesController_findOne: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OpportunityResponseDto"];
                };
            };
            /** @description Entrada em formato inválido. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Oportunidade não encontrada. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    OpportunitiesController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateOpportunityRequestDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OpportunityResponseDto"];
                };
            };
            /** @description Entrada em formato inválido. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Oportunidade não encontrada. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Versão desatualizada. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Campo não editável na etapa atual ou motivo de perda inválido. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    OpportunitiesController_moveStage: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MoveStageRequestDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OpportunityResponseDto"];
                };
            };
            /** @description Entrada em formato inválido. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Oportunidade não encontrada. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Versão desatualizada. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Transição inválida ou dados obrigatórios ausentes. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    ContactLogsController_list: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                opportunityId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ContactLogResponseDto"][];
                };
            };
            /** @description Entrada em formato inválido. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Oportunidade não encontrada. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    ContactLogsController_register: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                opportunityId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateContactLogRequestDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ContactLogResponseDto"];
                };
            };
            /** @description Entrada em formato inválido. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Oportunidade não encontrada. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Oportunidade em etapa final ou data no futuro. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    StageHistoriesController_list: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                opportunityId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StageHistoryResponseDto"][];
                };
            };
            /** @description Identificador inválido. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Oportunidade não encontrada. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    OpportunityItemsController_list: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                opportunityId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OpportunityItemResponseDto"][];
                };
            };
            /** @description Entrada em formato inválido. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Oportunidade ou item não encontrado. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    OpportunityItemsController_add: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                opportunityId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateOpportunityItemRequestDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OpportunityItemResponseDto"];
                };
            };
            /** @description Entrada em formato inválido. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Oportunidade ou item não encontrado. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Oportunidade em etapa final. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    OpportunityItemsController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                opportunityId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Entrada em formato inválido. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Oportunidade ou item não encontrado. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Não é possível remover o último item após o orçamento. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    SellersController_list: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SellerResponseDto"][];
                };
            };
        };
    };
}
export enum AttentionCode {
    PROPOSAL_EXPIRED = "PROPOSAL_EXPIRED",
    PROPOSAL_EXPIRES_TODAY = "PROPOSAL_EXPIRES_TODAY",
    PROPOSAL_EXPIRING = "PROPOSAL_EXPIRING",
    PROPOSAL_MISSING = "PROPOSAL_MISSING",
    PROPOSAL_AFTER_EVENT = "PROPOSAL_AFTER_EVENT",
    NO_CONTACT_REGISTERED = "NO_CONTACT_REGISTERED",
    NO_CONTACT = "NO_CONTACT",
    EVENT_NEAR = "EVENT_NEAR",
    EVENT_PAST = "EVENT_PAST"
}
export enum AttentionLevel {
    none = "none",
    medium = "medium",
    high = "high"
}
export enum AttentionSignalLevel {
    high = "high",
    medium = "medium"
}
export enum DatabaseStatus {
    up = "up",
    down = "down"
}
export enum FollowupTaskStatus {
    OPEN = "OPEN",
    DONE = "DONE",
    DISMISSED = "DISMISSED"
}
export enum HealthStatus {
    ok = "ok",
    error = "error"
}
export enum OpportunitySortField {
    number = "number",
    company = "company",
    eventDate = "eventDate",
    estimatedValue = "estimatedValue"
}
export enum SortDirection {
    asc = "asc",
    desc = "desc"
}
export enum Stage {
    PRIMEIRO_CONTATO = "PRIMEIRO_CONTATO",
    APRESENTACAO_ORCAMENTO = "APRESENTACAO_ORCAMENTO",
    FOLLOW_UP = "FOLLOW_UP",
    FORECAST = "FORECAST",
    FECHAMENTO = "FECHAMENTO",
    PERDIDA = "PERDIDA"
}
