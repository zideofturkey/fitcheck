/**
 * BFF (Backend-for-Frontend) Service API
 * Provides typed access to BFF dataView Elasticsearch routes.
 * Auto-generated from project definition — DO NOT EDIT.
 *
 * AI agents: READ-ONLY. This file is overwritten on every codegen run.
 * Add custom BFF helpers as NEW files in this folder (e.g.
 * `bff-helpers.ts`) — any file whose name doesn't match Genesis's
 * generated set survives rebuilds.
 *
 * Routes:
 *   POST /bff-api/{DataViewName}/list    — filtered list with pagination
 *   POST /bff-api/{DataViewName}/count   — total count for a filter
 *   GET  /bff-api/{DataViewName}/:id     — single record by ID
 *   POST /bff-api/dynamic/:index/list    — query any index dynamically
 *   GET  /bff-api/dynamic/:index/:id     — single record from any index
 *
 * Filter body format (POST body):
 *   {
 *     "fieldName": { "operator": "eq", "value": "someValue" }
 *     "numericField": { "operator": "between", "values": [10, 100] }
 *     "arrayField": { "operator": "in", "values": ["a", "b", "c"] }
 *   }
 */

import { bffApi } from "@/lib/service-client";
import type {
  inviteLinkDeliveredNotificationView,
  inviteLinkDeliveredNotificationViewListResponse,
  inviteLinkListView,
  inviteLinkListViewListResponse,
  presetMealWithLines,
  presetMealWithLinesListResponse,
  foodItemList,
  foodItemListListResponse,
  aiCandidateMealWithLines,
  aiCandidateMealWithLinesListResponse,
  mealLogWithLines,
  mealLogWithLinesListResponse,
  aiSessionHistory,
  aiSessionHistoryListResponse,
  dailyProgressView,
  dailyProgressViewListResponse,
  weeklyAnalyticsView,
  weeklyAnalyticsViewListResponse,
  monthlyAnalyticsView,
  monthlyAnalyticsViewListResponse,
  dailyNutritionSummaryNotificationView,
  dailyNutritionSummaryNotificationViewListResponse,
  dailyMealReminderNotificationView,
  dailyMealReminderNotificationViewListResponse,
  BffCountResponse,
  BffFilter,
} from "@/types/api";

// ---------------------------------------------------------------------------
// Shared types exported for use in hooks and pages
// ---------------------------------------------------------------------------

export type BffListParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  q?: string;
};

export { type BffFilter } from "@/types/api";

// ---------------------------------------------------------------------------
// BFF service object
// ---------------------------------------------------------------------------

export const bffService = {
  // ── inviteLinkDeliveredNotificationView ──────────────────────────────────────────────────────────

  /**
   * POST /bff-api/inviteLinkDeliveredNotificationView/list
   * List inviteLinkDeliveredNotificationView records with optional filter body and pagination params.
   */
  listInviteLinkDeliveredNotificationView: (
    params?: BffListParams,
    filter?: BffFilter,
  ): Promise<inviteLinkDeliveredNotificationViewListResponse> =>
    bffApi.post<inviteLinkDeliveredNotificationViewListResponse>(
      "inviteLinkDeliveredNotificationView/list",
      filter ?? {},
      { params },
    ),

  /**
   * GET /bff-api/inviteLinkDeliveredNotificationView/:id
   * Fetch a single inviteLinkDeliveredNotificationView record by ID.
   */
  getInviteLinkDeliveredNotificationView: (
    id: string,
  ): Promise<inviteLinkDeliveredNotificationView> =>
    bffApi.get<inviteLinkDeliveredNotificationView>(
      "inviteLinkDeliveredNotificationView/" + id,
    ),

  /**
   * POST /bff-api/inviteLinkDeliveredNotificationView/count
   * Count inviteLinkDeliveredNotificationView records matching the given filter.
   */
  countInviteLinkDeliveredNotificationView: (
    filter?: BffFilter,
    q?: string,
  ): Promise<BffCountResponse> =>
    bffApi.post<BffCountResponse>(
      "inviteLinkDeliveredNotificationView/count",
      filter ?? {},
      q ? { params: { q } } : undefined,
    ),

  // ── inviteLinkListView ──────────────────────────────────────────────────────────

  /**
   * POST /bff-api/inviteLinkListView/list
   * List inviteLinkListView records with optional filter body and pagination params.
   */
  listInviteLinkListView: (
    params?: BffListParams,
    filter?: BffFilter,
  ): Promise<inviteLinkListViewListResponse> =>
    bffApi.post<inviteLinkListViewListResponse>(
      "inviteLinkListView/list",
      filter ?? {},
      { params },
    ),

  /**
   * GET /bff-api/inviteLinkListView/:id
   * Fetch a single inviteLinkListView record by ID.
   */
  getInviteLinkListView: (id: string): Promise<inviteLinkListView> =>
    bffApi.get<inviteLinkListView>("inviteLinkListView/" + id),

  /**
   * POST /bff-api/inviteLinkListView/count
   * Count inviteLinkListView records matching the given filter.
   */
  countInviteLinkListView: (
    filter?: BffFilter,
    q?: string,
  ): Promise<BffCountResponse> =>
    bffApi.post<BffCountResponse>(
      "inviteLinkListView/count",
      filter ?? {},
      q ? { params: { q } } : undefined,
    ),

  // ── presetMealWithLines ──────────────────────────────────────────────────────────

  /**
   * POST /bff-api/presetMealWithLines/list
   * List presetMealWithLines records with optional filter body and pagination params.
   */
  listPresetMealWithLines: (
    params?: BffListParams,
    filter?: BffFilter,
  ): Promise<presetMealWithLinesListResponse> =>
    bffApi.post<presetMealWithLinesListResponse>(
      "presetMealWithLines/list",
      filter ?? {},
      { params },
    ),

  /**
   * GET /bff-api/presetMealWithLines/:id
   * Fetch a single presetMealWithLines record by ID.
   */
  getPresetMealWithLines: (id: string): Promise<presetMealWithLines> =>
    bffApi.get<presetMealWithLines>("presetMealWithLines/" + id),

  /**
   * POST /bff-api/presetMealWithLines/count
   * Count presetMealWithLines records matching the given filter.
   */
  countPresetMealWithLines: (
    filter?: BffFilter,
    q?: string,
  ): Promise<BffCountResponse> =>
    bffApi.post<BffCountResponse>(
      "presetMealWithLines/count",
      filter ?? {},
      q ? { params: { q } } : undefined,
    ),

  // ── foodItemList ──────────────────────────────────────────────────────────

  /**
   * POST /bff-api/foodItemList/list
   * List foodItemList records with optional filter body and pagination params.
   */
  listFoodItemList: (
    params?: BffListParams,
    filter?: BffFilter,
  ): Promise<foodItemListListResponse> =>
    bffApi.post<foodItemListListResponse>("foodItemList/list", filter ?? {}, {
      params,
    }),

  /**
   * GET /bff-api/foodItemList/:id
   * Fetch a single foodItemList record by ID.
   */
  getFoodItemList: (id: string): Promise<foodItemList> =>
    bffApi.get<foodItemList>("foodItemList/" + id),

  /**
   * POST /bff-api/foodItemList/count
   * Count foodItemList records matching the given filter.
   */
  countFoodItemList: (
    filter?: BffFilter,
    q?: string,
  ): Promise<BffCountResponse> =>
    bffApi.post<BffCountResponse>(
      "foodItemList/count",
      filter ?? {},
      q ? { params: { q } } : undefined,
    ),

  // ── aiCandidateMealWithLines ──────────────────────────────────────────────────────────

  /**
   * POST /bff-api/aiCandidateMealWithLines/list
   * List aiCandidateMealWithLines records with optional filter body and pagination params.
   */
  listAiCandidateMealWithLines: (
    params?: BffListParams,
    filter?: BffFilter,
  ): Promise<aiCandidateMealWithLinesListResponse> =>
    bffApi.post<aiCandidateMealWithLinesListResponse>(
      "aiCandidateMealWithLines/list",
      filter ?? {},
      { params },
    ),

  /**
   * GET /bff-api/aiCandidateMealWithLines/:id
   * Fetch a single aiCandidateMealWithLines record by ID.
   */
  getAiCandidateMealWithLines: (
    id: string,
  ): Promise<aiCandidateMealWithLines> =>
    bffApi.get<aiCandidateMealWithLines>("aiCandidateMealWithLines/" + id),

  /**
   * POST /bff-api/aiCandidateMealWithLines/count
   * Count aiCandidateMealWithLines records matching the given filter.
   */
  countAiCandidateMealWithLines: (
    filter?: BffFilter,
    q?: string,
  ): Promise<BffCountResponse> =>
    bffApi.post<BffCountResponse>(
      "aiCandidateMealWithLines/count",
      filter ?? {},
      q ? { params: { q } } : undefined,
    ),

  // ── mealLogWithLines ──────────────────────────────────────────────────────────

  /**
   * POST /bff-api/mealLogWithLines/list
   * List mealLogWithLines records with optional filter body and pagination params.
   */
  listMealLogWithLines: (
    params?: BffListParams,
    filter?: BffFilter,
  ): Promise<mealLogWithLinesListResponse> =>
    bffApi.post<mealLogWithLinesListResponse>(
      "mealLogWithLines/list",
      filter ?? {},
      { params },
    ),

  /**
   * GET /bff-api/mealLogWithLines/:id
   * Fetch a single mealLogWithLines record by ID.
   */
  getMealLogWithLines: (id: string): Promise<mealLogWithLines> =>
    bffApi.get<mealLogWithLines>("mealLogWithLines/" + id),

  /**
   * POST /bff-api/mealLogWithLines/count
   * Count mealLogWithLines records matching the given filter.
   */
  countMealLogWithLines: (
    filter?: BffFilter,
    q?: string,
  ): Promise<BffCountResponse> =>
    bffApi.post<BffCountResponse>(
      "mealLogWithLines/count",
      filter ?? {},
      q ? { params: { q } } : undefined,
    ),

  // ── aiSessionHistory ──────────────────────────────────────────────────────────

  /**
   * POST /bff-api/aiSessionHistory/list
   * List aiSessionHistory records with optional filter body and pagination params.
   */
  listAiSessionHistory: (
    params?: BffListParams,
    filter?: BffFilter,
  ): Promise<aiSessionHistoryListResponse> =>
    bffApi.post<aiSessionHistoryListResponse>(
      "aiSessionHistory/list",
      filter ?? {},
      { params },
    ),

  /**
   * GET /bff-api/aiSessionHistory/:id
   * Fetch a single aiSessionHistory record by ID.
   */
  getAiSessionHistory: (id: string): Promise<aiSessionHistory> =>
    bffApi.get<aiSessionHistory>("aiSessionHistory/" + id),

  /**
   * POST /bff-api/aiSessionHistory/count
   * Count aiSessionHistory records matching the given filter.
   */
  countAiSessionHistory: (
    filter?: BffFilter,
    q?: string,
  ): Promise<BffCountResponse> =>
    bffApi.post<BffCountResponse>(
      "aiSessionHistory/count",
      filter ?? {},
      q ? { params: { q } } : undefined,
    ),

  // ── dailyProgressView ──────────────────────────────────────────────────────────

  /**
   * POST /bff-api/dailyProgressView/list
   * List dailyProgressView records with optional filter body and pagination params.
   */
  listDailyProgressView: (
    params?: BffListParams,
    filter?: BffFilter,
  ): Promise<dailyProgressViewListResponse> =>
    bffApi.post<dailyProgressViewListResponse>(
      "dailyProgressView/list",
      filter ?? {},
      { params },
    ),

  /**
   * GET /bff-api/dailyProgressView/:id
   * Fetch a single dailyProgressView record by ID.
   */
  getDailyProgressView: (id: string): Promise<dailyProgressView> =>
    bffApi.get<dailyProgressView>("dailyProgressView/" + id),

  /**
   * POST /bff-api/dailyProgressView/count
   * Count dailyProgressView records matching the given filter.
   */
  countDailyProgressView: (
    filter?: BffFilter,
    q?: string,
  ): Promise<BffCountResponse> =>
    bffApi.post<BffCountResponse>(
      "dailyProgressView/count",
      filter ?? {},
      q ? { params: { q } } : undefined,
    ),

  // ── weeklyAnalyticsView ──────────────────────────────────────────────────────────

  /**
   * POST /bff-api/weeklyAnalyticsView/list
   * List weeklyAnalyticsView records with optional filter body and pagination params.
   */
  listWeeklyAnalyticsView: (
    params?: BffListParams,
    filter?: BffFilter,
  ): Promise<weeklyAnalyticsViewListResponse> =>
    bffApi.post<weeklyAnalyticsViewListResponse>(
      "weeklyAnalyticsView/list",
      filter ?? {},
      { params },
    ),

  /**
   * GET /bff-api/weeklyAnalyticsView/:id
   * Fetch a single weeklyAnalyticsView record by ID.
   */
  getWeeklyAnalyticsView: (id: string): Promise<weeklyAnalyticsView> =>
    bffApi.get<weeklyAnalyticsView>("weeklyAnalyticsView/" + id),

  /**
   * POST /bff-api/weeklyAnalyticsView/count
   * Count weeklyAnalyticsView records matching the given filter.
   */
  countWeeklyAnalyticsView: (
    filter?: BffFilter,
    q?: string,
  ): Promise<BffCountResponse> =>
    bffApi.post<BffCountResponse>(
      "weeklyAnalyticsView/count",
      filter ?? {},
      q ? { params: { q } } : undefined,
    ),

  // ── monthlyAnalyticsView ──────────────────────────────────────────────────────────

  /**
   * POST /bff-api/monthlyAnalyticsView/list
   * List monthlyAnalyticsView records with optional filter body and pagination params.
   */
  listMonthlyAnalyticsView: (
    params?: BffListParams,
    filter?: BffFilter,
  ): Promise<monthlyAnalyticsViewListResponse> =>
    bffApi.post<monthlyAnalyticsViewListResponse>(
      "monthlyAnalyticsView/list",
      filter ?? {},
      { params },
    ),

  /**
   * GET /bff-api/monthlyAnalyticsView/:id
   * Fetch a single monthlyAnalyticsView record by ID.
   */
  getMonthlyAnalyticsView: (id: string): Promise<monthlyAnalyticsView> =>
    bffApi.get<monthlyAnalyticsView>("monthlyAnalyticsView/" + id),

  /**
   * POST /bff-api/monthlyAnalyticsView/count
   * Count monthlyAnalyticsView records matching the given filter.
   */
  countMonthlyAnalyticsView: (
    filter?: BffFilter,
    q?: string,
  ): Promise<BffCountResponse> =>
    bffApi.post<BffCountResponse>(
      "monthlyAnalyticsView/count",
      filter ?? {},
      q ? { params: { q } } : undefined,
    ),

  // ── dailyNutritionSummaryNotificationView ──────────────────────────────────────────────────────────

  /**
   * POST /bff-api/dailyNutritionSummaryNotificationView/list
   * List dailyNutritionSummaryNotificationView records with optional filter body and pagination params.
   */
  listDailyNutritionSummaryNotificationView: (
    params?: BffListParams,
    filter?: BffFilter,
  ): Promise<dailyNutritionSummaryNotificationViewListResponse> =>
    bffApi.post<dailyNutritionSummaryNotificationViewListResponse>(
      "dailyNutritionSummaryNotificationView/list",
      filter ?? {},
      { params },
    ),

  /**
   * GET /bff-api/dailyNutritionSummaryNotificationView/:id
   * Fetch a single dailyNutritionSummaryNotificationView record by ID.
   */
  getDailyNutritionSummaryNotificationView: (
    id: string,
  ): Promise<dailyNutritionSummaryNotificationView> =>
    bffApi.get<dailyNutritionSummaryNotificationView>(
      "dailyNutritionSummaryNotificationView/" + id,
    ),

  /**
   * POST /bff-api/dailyNutritionSummaryNotificationView/count
   * Count dailyNutritionSummaryNotificationView records matching the given filter.
   */
  countDailyNutritionSummaryNotificationView: (
    filter?: BffFilter,
    q?: string,
  ): Promise<BffCountResponse> =>
    bffApi.post<BffCountResponse>(
      "dailyNutritionSummaryNotificationView/count",
      filter ?? {},
      q ? { params: { q } } : undefined,
    ),

  // ── dailyMealReminderNotificationView ──────────────────────────────────────────────────────────

  /**
   * POST /bff-api/dailyMealReminderNotificationView/list
   * List dailyMealReminderNotificationView records with optional filter body and pagination params.
   */
  listDailyMealReminderNotificationView: (
    params?: BffListParams,
    filter?: BffFilter,
  ): Promise<dailyMealReminderNotificationViewListResponse> =>
    bffApi.post<dailyMealReminderNotificationViewListResponse>(
      "dailyMealReminderNotificationView/list",
      filter ?? {},
      { params },
    ),

  /**
   * GET /bff-api/dailyMealReminderNotificationView/:id
   * Fetch a single dailyMealReminderNotificationView record by ID.
   */
  getDailyMealReminderNotificationView: (
    id: string,
  ): Promise<dailyMealReminderNotificationView> =>
    bffApi.get<dailyMealReminderNotificationView>(
      "dailyMealReminderNotificationView/" + id,
    ),

  /**
   * POST /bff-api/dailyMealReminderNotificationView/count
   * Count dailyMealReminderNotificationView records matching the given filter.
   */
  countDailyMealReminderNotificationView: (
    filter?: BffFilter,
    q?: string,
  ): Promise<BffCountResponse> =>
    bffApi.post<BffCountResponse>(
      "dailyMealReminderNotificationView/count",
      filter ?? {},
      q ? { params: { q } } : undefined,
    ),

  // ── Dynamic ───────────────────────────────────────────────────────────────

  /**
   * POST /bff-api/dynamic/:indexName/list
   * Query any Elasticsearch index by name with filter and pagination.
   */
  listDynamic: (
    indexName: string,
    params?: BffListParams,
    filter?: BffFilter,
  ): Promise<Record<string, unknown>> =>
    bffApi.post<Record<string, unknown>>(
      "dynamic/" + indexName + "/list",
      filter ?? {},
      { params },
    ),

  /**
   * GET /bff-api/dynamic/:indexName/:id
   * Fetch a single document from any Elasticsearch index.
   */
  getDynamic: (
    indexName: string,
    id: string,
  ): Promise<Record<string, unknown>> =>
    bffApi.get<Record<string, unknown>>("dynamic/" + indexName + "/" + id),
};

export default bffService;
