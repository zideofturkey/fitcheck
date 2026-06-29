/**
 * React Query hooks for BFF dataView routes
 * Auto-generated from project BFF dataView definitions — DO NOT EDIT.
 *
 * AI agents: READ-ONLY. This file is overwritten on every codegen run.
 * Add custom BFF hooks as NEW files in this folder (e.g.
 * `use-bff-helpers.ts`) — any file whose name doesn't match Genesis's
 * generated set survives rebuilds.
 *
 * Each dataView gets:
 *   use{ViewName}List(params?, filter?)  — paginated list with optional filter
 *   use{ViewName}(id)                    — single record by ID
 *   use{ViewName}Count(filter?)          — total count for a filter
 */

import { useQuery } from "@tanstack/react-query";
import { bffService, type BffListParams } from "@/services/api/bff-service";

import type { BffFilter } from "@/types/api";

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const bffKeys = {
  all: () => ["bff"] as const,

  inviteLinkDeliveredNotificationView: {
    all: () =>
      [...bffKeys.all(), "inviteLinkDeliveredNotificationView"] as const,

    list: (params?: BffListParams, filter?: BffFilter) =>
      [
        ...bffKeys.inviteLinkDeliveredNotificationView.all(),
        "list",
        params,
        filter,
      ] as const,

    detail: (id: string) =>
      [...bffKeys.inviteLinkDeliveredNotificationView.all(), id] as const,

    count: (filter?: BffFilter, q?: string) =>
      [
        ...bffKeys.inviteLinkDeliveredNotificationView.all(),
        "count",
        filter,
        q,
      ] as const,
  },

  inviteLinkListView: {
    all: () => [...bffKeys.all(), "inviteLinkListView"] as const,

    list: (params?: BffListParams, filter?: BffFilter) =>
      [...bffKeys.inviteLinkListView.all(), "list", params, filter] as const,

    detail: (id: string) => [...bffKeys.inviteLinkListView.all(), id] as const,

    count: (filter?: BffFilter, q?: string) =>
      [...bffKeys.inviteLinkListView.all(), "count", filter, q] as const,
  },

  presetMealWithLines: {
    all: () => [...bffKeys.all(), "presetMealWithLines"] as const,

    list: (params?: BffListParams, filter?: BffFilter) =>
      [...bffKeys.presetMealWithLines.all(), "list", params, filter] as const,

    detail: (id: string) => [...bffKeys.presetMealWithLines.all(), id] as const,

    count: (filter?: BffFilter, q?: string) =>
      [...bffKeys.presetMealWithLines.all(), "count", filter, q] as const,
  },

  foodItemList: {
    all: () => [...bffKeys.all(), "foodItemList"] as const,

    list: (params?: BffListParams, filter?: BffFilter) =>
      [...bffKeys.foodItemList.all(), "list", params, filter] as const,

    detail: (id: string) => [...bffKeys.foodItemList.all(), id] as const,

    count: (filter?: BffFilter, q?: string) =>
      [...bffKeys.foodItemList.all(), "count", filter, q] as const,
  },

  aiCandidateMealWithLines: {
    all: () => [...bffKeys.all(), "aiCandidateMealWithLines"] as const,

    list: (params?: BffListParams, filter?: BffFilter) =>
      [
        ...bffKeys.aiCandidateMealWithLines.all(),
        "list",
        params,
        filter,
      ] as const,

    detail: (id: string) =>
      [...bffKeys.aiCandidateMealWithLines.all(), id] as const,

    count: (filter?: BffFilter, q?: string) =>
      [...bffKeys.aiCandidateMealWithLines.all(), "count", filter, q] as const,
  },

  mealLogWithLines: {
    all: () => [...bffKeys.all(), "mealLogWithLines"] as const,

    list: (params?: BffListParams, filter?: BffFilter) =>
      [...bffKeys.mealLogWithLines.all(), "list", params, filter] as const,

    detail: (id: string) => [...bffKeys.mealLogWithLines.all(), id] as const,

    count: (filter?: BffFilter, q?: string) =>
      [...bffKeys.mealLogWithLines.all(), "count", filter, q] as const,
  },

  aiSessionHistory: {
    all: () => [...bffKeys.all(), "aiSessionHistory"] as const,

    list: (params?: BffListParams, filter?: BffFilter) =>
      [...bffKeys.aiSessionHistory.all(), "list", params, filter] as const,

    detail: (id: string) => [...bffKeys.aiSessionHistory.all(), id] as const,

    count: (filter?: BffFilter, q?: string) =>
      [...bffKeys.aiSessionHistory.all(), "count", filter, q] as const,
  },

  dailyProgressView: {
    all: () => [...bffKeys.all(), "dailyProgressView"] as const,

    list: (params?: BffListParams, filter?: BffFilter) =>
      [...bffKeys.dailyProgressView.all(), "list", params, filter] as const,

    detail: (id: string) => [...bffKeys.dailyProgressView.all(), id] as const,

    count: (filter?: BffFilter, q?: string) =>
      [...bffKeys.dailyProgressView.all(), "count", filter, q] as const,
  },

  weeklyAnalyticsView: {
    all: () => [...bffKeys.all(), "weeklyAnalyticsView"] as const,

    list: (params?: BffListParams, filter?: BffFilter) =>
      [...bffKeys.weeklyAnalyticsView.all(), "list", params, filter] as const,

    detail: (id: string) => [...bffKeys.weeklyAnalyticsView.all(), id] as const,

    count: (filter?: BffFilter, q?: string) =>
      [...bffKeys.weeklyAnalyticsView.all(), "count", filter, q] as const,
  },

  monthlyAnalyticsView: {
    all: () => [...bffKeys.all(), "monthlyAnalyticsView"] as const,

    list: (params?: BffListParams, filter?: BffFilter) =>
      [...bffKeys.monthlyAnalyticsView.all(), "list", params, filter] as const,

    detail: (id: string) =>
      [...bffKeys.monthlyAnalyticsView.all(), id] as const,

    count: (filter?: BffFilter, q?: string) =>
      [...bffKeys.monthlyAnalyticsView.all(), "count", filter, q] as const,
  },

  dailyNutritionSummaryNotificationView: {
    all: () =>
      [...bffKeys.all(), "dailyNutritionSummaryNotificationView"] as const,

    list: (params?: BffListParams, filter?: BffFilter) =>
      [
        ...bffKeys.dailyNutritionSummaryNotificationView.all(),
        "list",
        params,
        filter,
      ] as const,

    detail: (id: string) =>
      [...bffKeys.dailyNutritionSummaryNotificationView.all(), id] as const,

    count: (filter?: BffFilter, q?: string) =>
      [
        ...bffKeys.dailyNutritionSummaryNotificationView.all(),
        "count",
        filter,
        q,
      ] as const,
  },

  dailyMealReminderNotificationView: {
    all: () => [...bffKeys.all(), "dailyMealReminderNotificationView"] as const,

    list: (params?: BffListParams, filter?: BffFilter) =>
      [
        ...bffKeys.dailyMealReminderNotificationView.all(),
        "list",
        params,
        filter,
      ] as const,

    detail: (id: string) =>
      [...bffKeys.dailyMealReminderNotificationView.all(), id] as const,

    count: (filter?: BffFilter, q?: string) =>
      [
        ...bffKeys.dailyMealReminderNotificationView.all(),
        "count",
        filter,
        q,
      ] as const,
  },
};

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

// ── inviteLinkDeliveredNotificationView ────────────────────────────────────────────────────────────

/**
 * List inviteLinkDeliveredNotificationView with optional pagination and filter.
 * Filter body: { field: { operator: "eq"|"ne"|"gt"|"lt"|"in"|"between"|"contains", value, values } }
 */
export const useInviteLinkDeliveredNotificationViewList = (
  params?: BffListParams,
  filter?: BffFilter,
) =>
  useQuery({
    queryKey: bffKeys.inviteLinkDeliveredNotificationView.list(params, filter),
    queryFn: () =>
      bffService.listInviteLinkDeliveredNotificationView(params, filter),
  });

/** Fetch a single inviteLinkDeliveredNotificationView by ID. */
export const useInviteLinkDeliveredNotificationView = (
  id: string | null | undefined,
) =>
  useQuery({
    queryKey: bffKeys.inviteLinkDeliveredNotificationView.detail(id!),
    queryFn: () => bffService.getInviteLinkDeliveredNotificationView(id!),
    enabled: !!id,
  });

/** Count inviteLinkDeliveredNotificationView records matching the given filter. */
export const useInviteLinkDeliveredNotificationViewCount = (
  filter?: BffFilter,
  q?: string,
) =>
  useQuery({
    queryKey: bffKeys.inviteLinkDeliveredNotificationView.count(filter, q),
    queryFn: () =>
      bffService.countInviteLinkDeliveredNotificationView(filter, q),
  });

// ── inviteLinkListView ────────────────────────────────────────────────────────────

/**
 * List inviteLinkListView with optional pagination and filter.
 * Filter body: { field: { operator: "eq"|"ne"|"gt"|"lt"|"in"|"between"|"contains", value, values } }
 */
export const useInviteLinkListViewList = (
  params?: BffListParams,
  filter?: BffFilter,
) =>
  useQuery({
    queryKey: bffKeys.inviteLinkListView.list(params, filter),
    queryFn: () => bffService.listInviteLinkListView(params, filter),
  });

/** Fetch a single inviteLinkListView by ID. */
export const useInviteLinkListView = (id: string | null | undefined) =>
  useQuery({
    queryKey: bffKeys.inviteLinkListView.detail(id!),
    queryFn: () => bffService.getInviteLinkListView(id!),
    enabled: !!id,
  });

/** Count inviteLinkListView records matching the given filter. */
export const useInviteLinkListViewCount = (filter?: BffFilter, q?: string) =>
  useQuery({
    queryKey: bffKeys.inviteLinkListView.count(filter, q),
    queryFn: () => bffService.countInviteLinkListView(filter, q),
  });

// ── presetMealWithLines ────────────────────────────────────────────────────────────

/**
 * List presetMealWithLines with optional pagination and filter.
 * Filter body: { field: { operator: "eq"|"ne"|"gt"|"lt"|"in"|"between"|"contains", value, values } }
 */
export const usePresetMealWithLinesList = (
  params?: BffListParams,
  filter?: BffFilter,
) =>
  useQuery({
    queryKey: bffKeys.presetMealWithLines.list(params, filter),
    queryFn: () => bffService.listPresetMealWithLines(params, filter),
  });

/** Fetch a single presetMealWithLines by ID. */
export const usePresetMealWithLines = (id: string | null | undefined) =>
  useQuery({
    queryKey: bffKeys.presetMealWithLines.detail(id!),
    queryFn: () => bffService.getPresetMealWithLines(id!),
    enabled: !!id,
  });

/** Count presetMealWithLines records matching the given filter. */
export const usePresetMealWithLinesCount = (filter?: BffFilter, q?: string) =>
  useQuery({
    queryKey: bffKeys.presetMealWithLines.count(filter, q),
    queryFn: () => bffService.countPresetMealWithLines(filter, q),
  });

// ── foodItemList ────────────────────────────────────────────────────────────

/**
 * List foodItemList with optional pagination and filter.
 * Filter body: { field: { operator: "eq"|"ne"|"gt"|"lt"|"in"|"between"|"contains", value, values } }
 */
export const useFoodItemListList = (
  params?: BffListParams,
  filter?: BffFilter,
) =>
  useQuery({
    queryKey: bffKeys.foodItemList.list(params, filter),
    queryFn: () => bffService.listFoodItemList(params, filter),
  });

/** Fetch a single foodItemList by ID. */
export const useFoodItemList = (id: string | null | undefined) =>
  useQuery({
    queryKey: bffKeys.foodItemList.detail(id!),
    queryFn: () => bffService.getFoodItemList(id!),
    enabled: !!id,
  });

/** Count foodItemList records matching the given filter. */
export const useFoodItemListCount = (filter?: BffFilter, q?: string) =>
  useQuery({
    queryKey: bffKeys.foodItemList.count(filter, q),
    queryFn: () => bffService.countFoodItemList(filter, q),
  });

// ── aiCandidateMealWithLines ────────────────────────────────────────────────────────────

/**
 * List aiCandidateMealWithLines with optional pagination and filter.
 * Filter body: { field: { operator: "eq"|"ne"|"gt"|"lt"|"in"|"between"|"contains", value, values } }
 */
export const useAiCandidateMealWithLinesList = (
  params?: BffListParams,
  filter?: BffFilter,
) =>
  useQuery({
    queryKey: bffKeys.aiCandidateMealWithLines.list(params, filter),
    queryFn: () => bffService.listAiCandidateMealWithLines(params, filter),
  });

/** Fetch a single aiCandidateMealWithLines by ID. */
export const useAiCandidateMealWithLines = (id: string | null | undefined) =>
  useQuery({
    queryKey: bffKeys.aiCandidateMealWithLines.detail(id!),
    queryFn: () => bffService.getAiCandidateMealWithLines(id!),
    enabled: !!id,
  });

/** Count aiCandidateMealWithLines records matching the given filter. */
export const useAiCandidateMealWithLinesCount = (
  filter?: BffFilter,
  q?: string,
) =>
  useQuery({
    queryKey: bffKeys.aiCandidateMealWithLines.count(filter, q),
    queryFn: () => bffService.countAiCandidateMealWithLines(filter, q),
  });

// ── mealLogWithLines ────────────────────────────────────────────────────────────

/**
 * List mealLogWithLines with optional pagination and filter.
 * Filter body: { field: { operator: "eq"|"ne"|"gt"|"lt"|"in"|"between"|"contains", value, values } }
 */
export const useMealLogWithLinesList = (
  params?: BffListParams,
  filter?: BffFilter,
) =>
  useQuery({
    queryKey: bffKeys.mealLogWithLines.list(params, filter),
    queryFn: () => bffService.listMealLogWithLines(params, filter),
  });

/** Fetch a single mealLogWithLines by ID. */
export const useMealLogWithLines = (id: string | null | undefined) =>
  useQuery({
    queryKey: bffKeys.mealLogWithLines.detail(id!),
    queryFn: () => bffService.getMealLogWithLines(id!),
    enabled: !!id,
  });

/** Count mealLogWithLines records matching the given filter. */
export const useMealLogWithLinesCount = (filter?: BffFilter, q?: string) =>
  useQuery({
    queryKey: bffKeys.mealLogWithLines.count(filter, q),
    queryFn: () => bffService.countMealLogWithLines(filter, q),
  });

// ── aiSessionHistory ────────────────────────────────────────────────────────────

/**
 * List aiSessionHistory with optional pagination and filter.
 * Filter body: { field: { operator: "eq"|"ne"|"gt"|"lt"|"in"|"between"|"contains", value, values } }
 */
export const useAiSessionHistoryList = (
  params?: BffListParams,
  filter?: BffFilter,
) =>
  useQuery({
    queryKey: bffKeys.aiSessionHistory.list(params, filter),
    queryFn: () => bffService.listAiSessionHistory(params, filter),
  });

/** Fetch a single aiSessionHistory by ID. */
export const useAiSessionHistory = (id: string | null | undefined) =>
  useQuery({
    queryKey: bffKeys.aiSessionHistory.detail(id!),
    queryFn: () => bffService.getAiSessionHistory(id!),
    enabled: !!id,
  });

/** Count aiSessionHistory records matching the given filter. */
export const useAiSessionHistoryCount = (filter?: BffFilter, q?: string) =>
  useQuery({
    queryKey: bffKeys.aiSessionHistory.count(filter, q),
    queryFn: () => bffService.countAiSessionHistory(filter, q),
  });

// ── dailyProgressView ────────────────────────────────────────────────────────────

/**
 * List dailyProgressView with optional pagination and filter.
 * Filter body: { field: { operator: "eq"|"ne"|"gt"|"lt"|"in"|"between"|"contains", value, values } }
 */
export const useDailyProgressViewList = (
  params?: BffListParams,
  filter?: BffFilter,
) =>
  useQuery({
    queryKey: bffKeys.dailyProgressView.list(params, filter),
    queryFn: () => bffService.listDailyProgressView(params, filter),
  });

/** Fetch a single dailyProgressView by ID. */
export const useDailyProgressView = (id: string | null | undefined) =>
  useQuery({
    queryKey: bffKeys.dailyProgressView.detail(id!),
    queryFn: () => bffService.getDailyProgressView(id!),
    enabled: !!id,
  });

/** Count dailyProgressView records matching the given filter. */
export const useDailyProgressViewCount = (filter?: BffFilter, q?: string) =>
  useQuery({
    queryKey: bffKeys.dailyProgressView.count(filter, q),
    queryFn: () => bffService.countDailyProgressView(filter, q),
  });

// ── weeklyAnalyticsView ────────────────────────────────────────────────────────────

/**
 * List weeklyAnalyticsView with optional pagination and filter.
 * Filter body: { field: { operator: "eq"|"ne"|"gt"|"lt"|"in"|"between"|"contains", value, values } }
 */
export const useWeeklyAnalyticsViewList = (
  params?: BffListParams,
  filter?: BffFilter,
) =>
  useQuery({
    queryKey: bffKeys.weeklyAnalyticsView.list(params, filter),
    queryFn: () => bffService.listWeeklyAnalyticsView(params, filter),
  });

/** Fetch a single weeklyAnalyticsView by ID. */
export const useWeeklyAnalyticsView = (id: string | null | undefined) =>
  useQuery({
    queryKey: bffKeys.weeklyAnalyticsView.detail(id!),
    queryFn: () => bffService.getWeeklyAnalyticsView(id!),
    enabled: !!id,
  });

/** Count weeklyAnalyticsView records matching the given filter. */
export const useWeeklyAnalyticsViewCount = (filter?: BffFilter, q?: string) =>
  useQuery({
    queryKey: bffKeys.weeklyAnalyticsView.count(filter, q),
    queryFn: () => bffService.countWeeklyAnalyticsView(filter, q),
  });

// ── monthlyAnalyticsView ────────────────────────────────────────────────────────────

/**
 * List monthlyAnalyticsView with optional pagination and filter.
 * Filter body: { field: { operator: "eq"|"ne"|"gt"|"lt"|"in"|"between"|"contains", value, values } }
 */
export const useMonthlyAnalyticsViewList = (
  params?: BffListParams,
  filter?: BffFilter,
) =>
  useQuery({
    queryKey: bffKeys.monthlyAnalyticsView.list(params, filter),
    queryFn: () => bffService.listMonthlyAnalyticsView(params, filter),
  });

/** Fetch a single monthlyAnalyticsView by ID. */
export const useMonthlyAnalyticsView = (id: string | null | undefined) =>
  useQuery({
    queryKey: bffKeys.monthlyAnalyticsView.detail(id!),
    queryFn: () => bffService.getMonthlyAnalyticsView(id!),
    enabled: !!id,
  });

/** Count monthlyAnalyticsView records matching the given filter. */
export const useMonthlyAnalyticsViewCount = (filter?: BffFilter, q?: string) =>
  useQuery({
    queryKey: bffKeys.monthlyAnalyticsView.count(filter, q),
    queryFn: () => bffService.countMonthlyAnalyticsView(filter, q),
  });

// ── dailyNutritionSummaryNotificationView ────────────────────────────────────────────────────────────

/**
 * List dailyNutritionSummaryNotificationView with optional pagination and filter.
 * Filter body: { field: { operator: "eq"|"ne"|"gt"|"lt"|"in"|"between"|"contains", value, values } }
 */
export const useDailyNutritionSummaryNotificationViewList = (
  params?: BffListParams,
  filter?: BffFilter,
) =>
  useQuery({
    queryKey: bffKeys.dailyNutritionSummaryNotificationView.list(
      params,
      filter,
    ),
    queryFn: () =>
      bffService.listDailyNutritionSummaryNotificationView(params, filter),
  });

/** Fetch a single dailyNutritionSummaryNotificationView by ID. */
export const useDailyNutritionSummaryNotificationView = (
  id: string | null | undefined,
) =>
  useQuery({
    queryKey: bffKeys.dailyNutritionSummaryNotificationView.detail(id!),
    queryFn: () => bffService.getDailyNutritionSummaryNotificationView(id!),
    enabled: !!id,
  });

/** Count dailyNutritionSummaryNotificationView records matching the given filter. */
export const useDailyNutritionSummaryNotificationViewCount = (
  filter?: BffFilter,
  q?: string,
) =>
  useQuery({
    queryKey: bffKeys.dailyNutritionSummaryNotificationView.count(filter, q),
    queryFn: () =>
      bffService.countDailyNutritionSummaryNotificationView(filter, q),
  });

// ── dailyMealReminderNotificationView ────────────────────────────────────────────────────────────

/**
 * List dailyMealReminderNotificationView with optional pagination and filter.
 * Filter body: { field: { operator: "eq"|"ne"|"gt"|"lt"|"in"|"between"|"contains", value, values } }
 */
export const useDailyMealReminderNotificationViewList = (
  params?: BffListParams,
  filter?: BffFilter,
) =>
  useQuery({
    queryKey: bffKeys.dailyMealReminderNotificationView.list(params, filter),
    queryFn: () =>
      bffService.listDailyMealReminderNotificationView(params, filter),
  });

/** Fetch a single dailyMealReminderNotificationView by ID. */
export const useDailyMealReminderNotificationView = (
  id: string | null | undefined,
) =>
  useQuery({
    queryKey: bffKeys.dailyMealReminderNotificationView.detail(id!),
    queryFn: () => bffService.getDailyMealReminderNotificationView(id!),
    enabled: !!id,
  });

/** Count dailyMealReminderNotificationView records matching the given filter. */
export const useDailyMealReminderNotificationViewCount = (
  filter?: BffFilter,
  q?: string,
) =>
  useQuery({
    queryKey: bffKeys.dailyMealReminderNotificationView.count(filter, q),
    queryFn: () => bffService.countDailyMealReminderNotificationView(filter, q),
  });
