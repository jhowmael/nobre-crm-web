import type { components, operations } from "@/api/schema";

export { AttentionCode, AttentionLevel, AttentionSignalLevel, FollowupTaskStatus, Stage } from "@/api/schema";

type Schemas = components["schemas"];

export type Opportunity = Schemas["OpportunityResponseDto"];
export type GiftItemInput = Schemas["GiftItemRequestDto"];
export type Attention = Schemas["AttentionResponseDto"];
export type StageChange = Schemas["StageHistoryResponseDto"];
export type Catalogs = Schemas["CatalogsResponseDto"];
export type StageCatalogItem = Schemas["StageCatalogItemResponseDto"];
export type LossReasonOption = Schemas["LossReasonCatalogItemResponseDto"];
export type Seller = Schemas["SellerResponseDto"];
export type FollowupTask = Schemas["FollowupTaskResponseDto"];
export type GenerateTasksResult = Schemas["GenerateFollowupTasksResponseDto"];
export type ContactLog = Schemas["ContactLogResponseDto"];
export type ContactInput = Schemas["CreateContactLogRequestDto"];
export type MoveStageInput = Schemas["MoveStageRequestDto"];
export type UpdateOpportunityInput = Schemas["UpdateOpportunityRequestDto"];
export type NewOpportunityInput = Schemas["CreateOpportunityRequestDto"];
export type ApiErrorBody = Schemas["ErrorResponseDto"];
export type FieldViolation = Schemas["RuleViolationResponseDto"];

export type OpportunityQuery = NonNullable<operations["OpportunitiesController_list"]["parameters"]["query"]>;
export type FollowupTaskQuery = NonNullable<operations["FollowupTasksController_list"]["parameters"]["query"]>;

export type MovePayload = Omit<MoveStageInput, "to" | "expectedVersion">;
export type OpportunityPatch = Omit<UpdateOpportunityInput, "expectedVersion">;

export interface OpportunityPage {
  items: Opportunity[];
  total: number;
}
