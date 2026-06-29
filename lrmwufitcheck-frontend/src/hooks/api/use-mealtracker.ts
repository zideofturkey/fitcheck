/**
 * React Query hooks for Mealtracker service
 * Auto-generated from project definition — DO NOT EDIT.
 *
 * AI agents: READ-ONLY. This file is overwritten on every codegen run.
 * Add custom mealtracker hooks as NEW files in this folder (e.g.
 * `use-mealtracker-helpers.ts`) — any file whose name doesn't match
 * Genesis's generated set survives rebuilds.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { mealtrackerService } from "@/services/api/mealtracker-api";

import type {
  CreateMealLogInput,
  UpdateMealLogInput,
  CreateMealLineInput,
  UpdateMealLineInput,
} from "@/services/api/mealtracker-api";

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const mealtrackerKeys = {
  all: () => ["mealtracker"] as const,

  createMealLog: (...args: unknown[]) =>
    [...mealtrackerKeys.all(), "createMealLog", ...args] as const,

  getMealLog: (...args: unknown[]) =>
    [...mealtrackerKeys.all(), "getMealLog", ...args] as const,

  listMealLogs: (...args: unknown[]) =>
    [...mealtrackerKeys.all(), "listMealLogs", ...args] as const,

  updateMealLog: (...args: unknown[]) =>
    [...mealtrackerKeys.all(), "updateMealLog", ...args] as const,

  deleteMealLog: (...args: unknown[]) =>
    [...mealtrackerKeys.all(), "deleteMealLog", ...args] as const,

  createMealLine: (...args: unknown[]) =>
    [...mealtrackerKeys.all(), "createMealLine", ...args] as const,

  updateMealLine: (...args: unknown[]) =>
    [...mealtrackerKeys.all(), "updateMealLine", ...args] as const,

  deleteMealLine: (...args: unknown[]) =>
    [...mealtrackerKeys.all(), "deleteMealLine", ...args] as const,

  listMealLines: (...args: unknown[]) =>
    [...mealtrackerKeys.all(), "listMealLines", ...args] as const,

  getDailyProgress: (...args: unknown[]) =>
    [...mealtrackerKeys.all(), "getDailyProgress", ...args] as const,

  getNutritionDay: (...args: unknown[]) =>
    [...mealtrackerKeys.all(), "getNutritionDay", ...args] as const,

  listNutritionDays: (...args: unknown[]) =>
    [...mealtrackerKeys.all(), "listNutritionDays", ...args] as const,

  getWeeklyAnalytics: (...args: unknown[]) =>
    [...mealtrackerKeys.all(), "getWeeklyAnalytics", ...args] as const,

  getMonthlyAnalytics: (...args: unknown[]) =>
    [...mealtrackerKeys.all(), "getMonthlyAnalytics", ...args] as const,

  triggerDailyReminderCheck: (...args: unknown[]) =>
    [...mealtrackerKeys.all(), "triggerDailyReminderCheck", ...args] as const,

  triggerDailySummary: (...args: unknown[]) =>
    [...mealtrackerKeys.all(), "triggerDailySummary", ...args] as const,
};

// ---------------------------------------------------------------------------
// createMealLog
// ---------------------------------------------------------------------------

export const useCreateMealLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMealLogInput) =>
      mealtrackerService.createMealLog(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mealtrackerKeys.all() });
    },
  });
};

// ---------------------------------------------------------------------------
// getMealLog
// ---------------------------------------------------------------------------

export const useGetMealLog = (mealLogId: string | null | undefined) => {
  return useQuery({
    queryKey: mealtrackerKeys.getMealLog(mealLogId),
    queryFn: () => mealtrackerService.getMealLog(mealLogId!),
    enabled: !!mealLogId,
  });
};

// ---------------------------------------------------------------------------
// listMealLogs
// ---------------------------------------------------------------------------

export const useListMealLogs = (
  ...args: Parameters<typeof mealtrackerService.listMealLogs>
) => {
  return useQuery({
    queryKey: mealtrackerKeys.listMealLogs(...args),
    queryFn: () => mealtrackerService.listMealLogs(...args),
  });
};

// ---------------------------------------------------------------------------
// updateMealLog
// ---------------------------------------------------------------------------

export const useUpdateMealLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      mealLogId,
      data,
    }: {
      mealLogId: string;
      data: UpdateMealLogInput;
    }) => mealtrackerService.updateMealLog(mealLogId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mealtrackerKeys.all() });
    },
  });
};

// ---------------------------------------------------------------------------
// deleteMealLog
// ---------------------------------------------------------------------------

export const useDeleteMealLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mealLogId: string) =>
      mealtrackerService.deleteMealLog(mealLogId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mealtrackerKeys.all() });
    },
  });
};

// ---------------------------------------------------------------------------
// createMealLine
// ---------------------------------------------------------------------------

export const useCreateMealLine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMealLineInput) =>
      mealtrackerService.createMealLine(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mealtrackerKeys.all() });
    },
  });
};

// ---------------------------------------------------------------------------
// updateMealLine
// ---------------------------------------------------------------------------

export const useUpdateMealLine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      mealLineId,
      data,
    }: {
      mealLineId: string;
      data: UpdateMealLineInput;
    }) => mealtrackerService.updateMealLine(mealLineId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mealtrackerKeys.all() });
    },
  });
};

// ---------------------------------------------------------------------------
// deleteMealLine
// ---------------------------------------------------------------------------

export const useDeleteMealLine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mealLineId: string) =>
      mealtrackerService.deleteMealLine(mealLineId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mealtrackerKeys.all() });
    },
  });
};

// ---------------------------------------------------------------------------
// listMealLines
// ---------------------------------------------------------------------------

export const useListMealLines = (
  ...args: Parameters<typeof mealtrackerService.listMealLines>
) => {
  return useQuery({
    queryKey: mealtrackerKeys.listMealLines(...args),
    queryFn: () => mealtrackerService.listMealLines(...args),
  });
};

// ---------------------------------------------------------------------------
// getDailyProgress
// ---------------------------------------------------------------------------

export const useGetDailyProgress = (
  ...args: Parameters<typeof mealtrackerService.getDailyProgress>
) => {
  return useQuery({
    queryKey: mealtrackerKeys.getDailyProgress(...args),
    queryFn: () => mealtrackerService.getDailyProgress(...args),
  });
};

// ---------------------------------------------------------------------------
// getNutritionDay
// ---------------------------------------------------------------------------

export const useGetNutritionDay = (
  nutritionDayId: string | null | undefined,
) => {
  return useQuery({
    queryKey: mealtrackerKeys.getNutritionDay(nutritionDayId),
    queryFn: () => mealtrackerService.getNutritionDay(nutritionDayId!),
    enabled: !!nutritionDayId,
  });
};

// ---------------------------------------------------------------------------
// listNutritionDays
// ---------------------------------------------------------------------------

export const useListNutritionDays = (
  ...args: Parameters<typeof mealtrackerService.listNutritionDays>
) => {
  return useQuery({
    queryKey: mealtrackerKeys.listNutritionDays(...args),
    queryFn: () => mealtrackerService.listNutritionDays(...args),
  });
};

// ---------------------------------------------------------------------------
// getWeeklyAnalytics
// ---------------------------------------------------------------------------

export const useGetWeeklyAnalytics = (
  ...args: Parameters<typeof mealtrackerService.getWeeklyAnalytics>
) => {
  return useQuery({
    queryKey: mealtrackerKeys.getWeeklyAnalytics(...args),
    queryFn: () => mealtrackerService.getWeeklyAnalytics(...args),
  });
};

// ---------------------------------------------------------------------------
// getMonthlyAnalytics
// ---------------------------------------------------------------------------

export const useGetMonthlyAnalytics = (
  ...args: Parameters<typeof mealtrackerService.getMonthlyAnalytics>
) => {
  return useQuery({
    queryKey: mealtrackerKeys.getMonthlyAnalytics(...args),
    queryFn: () => mealtrackerService.getMonthlyAnalytics(...args),
  });
};

// ---------------------------------------------------------------------------
// triggerDailyReminderCheck
// ---------------------------------------------------------------------------

export const useTriggerDailyReminderCheck = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => mealtrackerService.triggerDailyReminderCheck(),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mealtrackerKeys.all() });
    },
  });
};

// ---------------------------------------------------------------------------
// triggerDailySummary
// ---------------------------------------------------------------------------

export const useTriggerDailySummary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => mealtrackerService.triggerDailySummary(),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mealtrackerKeys.all() });
    },
  });
};
