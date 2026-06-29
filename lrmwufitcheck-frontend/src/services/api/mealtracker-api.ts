/**
 * Mealtracker service API
 * Auto-generated from project definition — DO NOT EDIT.
 *
 * AI agents: READ-ONLY. This file is overwritten on every codegen run.
 * Add custom mealtracker services as NEW files in this folder
 * (e.g. `mealtracker-helpers.ts`) — any file whose name doesn't match
 * Genesis's generated set survives rebuilds.
 */

import { mealtrackerApi } from "@/lib/service-client";

import type {
  MealtrackerMealLogResponse,
  MealtrackerMealLogListResponse,
  MealtrackerMealLineResponse,
  MealtrackerMealLineListResponse,
  MealtrackerNutritionDayResponse,
  MealtrackerNutritionDayListResponse,
  MindbricksUpdateEnvelope,
} from "@/types/api";

// Universal transport flags read off req.query by requestIdStamper on every
// request, regardless of CRUD or method. Intersected onto non-paginated
// GETs with declared query params so callers can pass `getJoins` and any
// dynamic filter key without TS errors.
export type RequestParams = {
  getJoins?: boolean;
  [key: string]: string | number | boolean | undefined;
};

// Paginated-list query params. Adds pageNumber/pageRowCount on top of
// RequestParams — only the list codepath actually consumes pagination,
// so it lives here rather than on the base. Sorting on standard list
// APIs is hardcoded at codegen from `listOptions.listSortBy` — request-
// side `sortBy` / `sortOrder` are silently dropped by the backend.
// Full-text `q` is a BFF DataView concept only (see `BffListParams`).
export type ListParams = RequestParams & {
  pageNumber?: number;
  pageRowCount?: number;
};

export type CreateMealLogInput = {
  mealDate: string;

  mealTime: string;

  slotName: string;

  logSource: "foodLibrary" | "presetTemplate" | "manualEntry" | "aiAssistant";

  noteText?: string;

  totalCalories: number;

  totalProtein: number;

  totalCarbohydrates: number;

  totalFat: number;

  totalSugar: number;

  totalFiber: number;

  lines: Record<string, unknown>[];
};

export type UpdateMealLogInput = {
  mealTime?: string;

  slotName?: string;

  noteText?: string;

  totalCalories?: number;

  totalProtein?: number;

  totalCarbohydrates?: number;

  totalFat?: number;

  totalSugar?: number;

  totalFiber?: number;
};

export type CreateMealLineInput = {
  mealLogId: string;

  itemName: string;

  consumedGrams: number;

  itemCalories: number;

  itemProtein: number;

  itemCarbohydrates: number;

  itemFat: number;

  itemSugar: number;

  itemFiber: number;

  lineSource:
    | "foodLibrary"
    | "presetTemplate"
    | "manualEntry"
    | "aiAssistant"
    | "temporaryAi";

  sourceFoodItemId?: string;

  sourcePresetMealId?: string;
};

export type UpdateMealLineInput = {
  itemName?: string;

  consumedGrams?: number;

  itemCalories?: number;

  itemProtein?: number;

  itemCarbohydrates?: number;

  itemFat?: number;

  itemSugar?: number;

  itemFiber?: number;
};

export const mealtrackerService = {
  /**
   * createMealLog — Creates a new meal log entry with all nutrition totals and then inserts individu
   * POST /v1/meal-logs
   */
  createMealLog: async (
    data: CreateMealLogInput,
  ): Promise<MealtrackerMealLogResponse> => {
    return mealtrackerApi.post<MealtrackerMealLogResponse>(
      "v1/meal-logs",
      data,
    );
  },

  /**
   * getMealLog — Retrieves a single meal log by ID, scoped to the authenticated user.
   * GET /v1/meal-logs/:mealLogId
   */
  getMealLog: async (
    mealLogId: string,
  ): Promise<MealtrackerMealLogResponse> => {
    return mealtrackerApi.get<MealtrackerMealLogResponse>(
      `v1/meal-logs/${mealLogId}`,
    );
  },

  /**
   * listMealLogs — Lists meal logs for the authenticated user with optional date range filtering. m
   * GET /v1/meal-logs
   */
  listMealLogs: async (
    params?: {
      fromDate?: string;
      toDate?: string;
      mealDate?: string;
      logSource?:
        | "foodLibrary"
        | "presetTemplate"
        | "manualEntry"
        | "aiAssistant";
    } & ListParams,
  ): Promise<MealtrackerMealLogListResponse> => {
    return mealtrackerApi.get<MealtrackerMealLogListResponse>("v1/meal-logs", {
      params,
    });
  },

  /**
   * updateMealLog — Updates editable fields of a meal log and recomputes the nutrition day snapshot.
   * PATCH /v1/meal-logs/:mealLogId
   */
  updateMealLog: async (
    mealLogId: string,
    data: UpdateMealLogInput,
  ): Promise<MealtrackerMealLogResponse> => {
    return mealtrackerApi.patch<MealtrackerMealLogResponse>(
      `v1/meal-logs/${mealLogId}`,
      data,
    );
  },

  /**
   * deleteMealLog — Deletes a meal log and its associated meal lines, then recomputes the nutrition
   * DELETE /v1/meal-logs/:mealLogId
   */
  deleteMealLog: async (
    mealLogId: string,
  ): Promise<MealtrackerMealLogResponse> => {
    return mealtrackerApi.delete<MealtrackerMealLogResponse>(
      `v1/meal-logs/${mealLogId}`,
    );
  },

  /**
   * createMealLine — Creates an individual meal line item and then recalculates meal-level and day-le
   * POST /v1/meal-lines
   */
  createMealLine: async (
    data: CreateMealLineInput,
  ): Promise<MealtrackerMealLineResponse> => {
    return mealtrackerApi.post<MealtrackerMealLineResponse>(
      "v1/meal-lines",
      data,
    );
  },

  /**
   * updateMealLine — Updates nutrition snapshot values of a meal line item, then recalculates meal-le
   * PATCH /v1/meal-lines/:mealLineId
   */
  updateMealLine: async (
    mealLineId: string,
    data: UpdateMealLineInput,
  ): Promise<MealtrackerMealLineResponse> => {
    return mealtrackerApi.patch<MealtrackerMealLineResponse>(
      `v1/meal-lines/${mealLineId}`,
      data,
    );
  },

  /**
   * deleteMealLine — Deletes a meal line item and recomputes the parent meal log and daily nutrition
   * DELETE /v1/meal-lines/:mealLineId
   */
  deleteMealLine: async (
    mealLineId: string,
  ): Promise<MealtrackerMealLineResponse> => {
    return mealtrackerApi.delete<MealtrackerMealLineResponse>(
      `v1/meal-lines/${mealLineId}`,
    );
  },

  /**
   * listMealLines — Lists meal lines for the authenticated user. mealLogId is an auto-filter param v
   * GET /v1/meal-lines
   */
  listMealLines: async (
    params?: { mealLogId?: string } & ListParams,
  ): Promise<MealtrackerMealLineListResponse> => {
    return mealtrackerApi.get<MealtrackerMealLineListResponse>(
      "v1/meal-lines",
      { params },
    );
  },

  /**
   * getDailyProgress — Retrieves (or initializes) the nutritionDay record for a given date, defaulting
   * GET /v1/nutrition-days/daily-progress
   */
  getDailyProgress: async (params?: {
    targetDate?: string;
  }): Promise<MealtrackerNutritionDayResponse> => {
    return mealtrackerApi.get<MealtrackerNutritionDayResponse>(
      "v1/nutrition-days/daily-progress",
      { params },
    );
  },

  /**
   * getNutritionDay — Retrieves a single nutritionDay record by ID, scoped to the authenticated user.
   * GET /v1/nutrition-days/:nutritionDayId
   */
  getNutritionDay: async (
    nutritionDayId: string,
  ): Promise<MealtrackerNutritionDayResponse> => {
    return mealtrackerApi.get<MealtrackerNutritionDayResponse>(
      `v1/nutrition-days/${nutritionDayId}`,
    );
  },

  /**
   * listNutritionDays — Lists nutritionDay records for the authenticated user with optional date range f
   * GET /v1/nutrition-days
   */
  listNutritionDays: async (
    params?: {
      fromDate?: string;
      toDate?: string;
      summaryDate?: string;
    } & ListParams,
  ): Promise<MealtrackerNutritionDayListResponse> => {
    return mealtrackerApi.get<MealtrackerNutritionDayListResponse>(
      "v1/nutrition-days",
      { params },
    );
  },

  /**
   * getWeeklyAnalytics — Returns the last 7 days of nutritionDay records plus computed analytics (average
   * GET /v1/analytics/weekly
   */
  getWeeklyAnalytics: async (
    params?: RequestParams,
  ): Promise<MealtrackerNutritionDayListResponse> => {
    return mealtrackerApi.get<MealtrackerNutritionDayListResponse>(
      "v1/analytics/weekly",
      { params },
    );
  },

  /**
   * getMonthlyAnalytics — Returns the last 30 days of nutritionDay records plus computed analytics (averag
   * GET /v1/analytics/monthly
   */
  getMonthlyAnalytics: async (
    params?: RequestParams,
  ): Promise<MealtrackerNutritionDayListResponse> => {
    return mealtrackerApi.get<MealtrackerNutritionDayListResponse>(
      "v1/analytics/monthly",
      { params },
    );
  },

  /**
   * triggerDailyReminderCheck — Admin-only scheduled endpoint that finds users with no meals today and emits a K
   * POST /v1/scheduled/daily-reminder-check
   */
  triggerDailyReminderCheck: async (): Promise<
    MealtrackerNutritionDayResponse & MindbricksUpdateEnvelope
  > => {
    return mealtrackerApi.post<
      MealtrackerNutritionDayResponse & MindbricksUpdateEnvelope
    >("v1/scheduled/daily-reminder-check");
  },

  /**
   * triggerDailySummary — Admin-only scheduled endpoint that finds users with meals today and emits a Kafk
   * POST /v1/scheduled/daily-summary
   */
  triggerDailySummary: async (): Promise<
    MealtrackerNutritionDayResponse & MindbricksUpdateEnvelope
  > => {
    return mealtrackerApi.post<
      MealtrackerNutritionDayResponse & MindbricksUpdateEnvelope
    >("v1/scheduled/daily-summary");
  },
};

export default mealtrackerService;
