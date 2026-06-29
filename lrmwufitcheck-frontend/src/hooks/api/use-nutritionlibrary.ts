/**
 * React Query hooks for Nutritionlibrary service
 * Auto-generated from project definition — DO NOT EDIT.
 *
 * AI agents: READ-ONLY. This file is overwritten on every codegen run.
 * Add custom nutritionlibrary hooks as NEW files in this folder (e.g.
 * `use-nutritionlibrary-helpers.ts`) — any file whose name doesn't match
 * Genesis's generated set survives rebuilds.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { nutritionlibraryService } from "@/services/api/nutritionlibrary-api";

import type {
  SetMacroTargetInput,
  CreateFoodItemInput,
  UpdateFoodItemInput,
  CreatePresetMealInput,
  UpdatePresetMealInput,
  AddPresetLineInput,
} from "@/services/api/nutritionlibrary-api";

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const nutritionlibraryKeys = {
  all: () => ["nutritionlibrary"] as const,

  setMacroTarget: (...args: unknown[]) =>
    [...nutritionlibraryKeys.all(), "setMacroTarget", ...args] as const,

  getMyMacroTarget: (...args: unknown[]) =>
    [...nutritionlibraryKeys.all(), "getMyMacroTarget", ...args] as const,

  createFoodItem: (...args: unknown[]) =>
    [...nutritionlibraryKeys.all(), "createFoodItem", ...args] as const,

  getFoodItem: (...args: unknown[]) =>
    [...nutritionlibraryKeys.all(), "getFoodItem", ...args] as const,

  listFoodItems: (...args: unknown[]) =>
    [...nutritionlibraryKeys.all(), "listFoodItems", ...args] as const,

  updateFoodItem: (...args: unknown[]) =>
    [...nutritionlibraryKeys.all(), "updateFoodItem", ...args] as const,

  deleteFoodItem: (...args: unknown[]) =>
    [...nutritionlibraryKeys.all(), "deleteFoodItem", ...args] as const,

  createPresetMeal: (...args: unknown[]) =>
    [...nutritionlibraryKeys.all(), "createPresetMeal", ...args] as const,

  getPresetMeal: (...args: unknown[]) =>
    [...nutritionlibraryKeys.all(), "getPresetMeal", ...args] as const,

  listPresetMeals: (...args: unknown[]) =>
    [...nutritionlibraryKeys.all(), "listPresetMeals", ...args] as const,

  updatePresetMeal: (...args: unknown[]) =>
    [...nutritionlibraryKeys.all(), "updatePresetMeal", ...args] as const,

  deletePresetMeal: (...args: unknown[]) =>
    [...nutritionlibraryKeys.all(), "deletePresetMeal", ...args] as const,

  addPresetLine: (...args: unknown[]) =>
    [...nutritionlibraryKeys.all(), "addPresetLine", ...args] as const,

  listPresetLines: (...args: unknown[]) =>
    [...nutritionlibraryKeys.all(), "listPresetLines", ...args] as const,

  deletePresetLine: (...args: unknown[]) =>
    [...nutritionlibraryKeys.all(), "deletePresetLine", ...args] as const,

  getPresetMealForLogging: (...args: unknown[]) =>
    [
      ...nutritionlibraryKeys.all(),
      "getPresetMealForLogging",
      ...args,
    ] as const,

  getFoodItemForLogging: (...args: unknown[]) =>
    [...nutritionlibraryKeys.all(), "getFoodItemForLogging", ...args] as const,

  getMyMacroTargetForLogging: (...args: unknown[]) =>
    [
      ...nutritionlibraryKeys.all(),
      "getMyMacroTargetForLogging",
      ...args,
    ] as const,
};

// ---------------------------------------------------------------------------
// setMacroTarget
// ---------------------------------------------------------------------------

export const useSetMacroTarget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SetMacroTargetInput) =>
      nutritionlibraryService.setMacroTarget(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nutritionlibraryKeys.all() });
    },
  });
};

// ---------------------------------------------------------------------------
// getMyMacroTarget
// ---------------------------------------------------------------------------

export const useGetMyMacroTarget = (
  ...args: Parameters<typeof nutritionlibraryService.getMyMacroTarget>
) => {
  return useQuery({
    queryKey: nutritionlibraryKeys.getMyMacroTarget(...args),
    queryFn: () => nutritionlibraryService.getMyMacroTarget(...args),
  });
};

// ---------------------------------------------------------------------------
// createFoodItem
// ---------------------------------------------------------------------------

export const useCreateFoodItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFoodItemInput) =>
      nutritionlibraryService.createFoodItem(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nutritionlibraryKeys.all() });
    },
  });
};

// ---------------------------------------------------------------------------
// getFoodItem
// ---------------------------------------------------------------------------

export const useGetFoodItem = (foodItemId: string | null | undefined) => {
  return useQuery({
    queryKey: nutritionlibraryKeys.getFoodItem(foodItemId),
    queryFn: () => nutritionlibraryService.getFoodItem(foodItemId!),
    enabled: !!foodItemId,
  });
};

// ---------------------------------------------------------------------------
// listFoodItems
// ---------------------------------------------------------------------------

export const useListFoodItems = (
  ...args: Parameters<typeof nutritionlibraryService.listFoodItems>
) => {
  return useQuery({
    queryKey: nutritionlibraryKeys.listFoodItems(...args),
    queryFn: () => nutritionlibraryService.listFoodItems(...args),
  });
};

// ---------------------------------------------------------------------------
// updateFoodItem
// ---------------------------------------------------------------------------

export const useUpdateFoodItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      foodItemId,
      data,
    }: {
      foodItemId: string;
      data: UpdateFoodItemInput;
    }) => nutritionlibraryService.updateFoodItem(foodItemId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nutritionlibraryKeys.all() });
    },
  });
};

// ---------------------------------------------------------------------------
// deleteFoodItem
// ---------------------------------------------------------------------------

export const useDeleteFoodItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (foodItemId: string) =>
      nutritionlibraryService.deleteFoodItem(foodItemId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nutritionlibraryKeys.all() });
    },
  });
};

// ---------------------------------------------------------------------------
// createPresetMeal
// ---------------------------------------------------------------------------

export const useCreatePresetMeal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePresetMealInput) =>
      nutritionlibraryService.createPresetMeal(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nutritionlibraryKeys.all() });
    },
  });
};

// ---------------------------------------------------------------------------
// getPresetMeal
// ---------------------------------------------------------------------------

export const useGetPresetMeal = (presetMealId: string | null | undefined) => {
  return useQuery({
    queryKey: nutritionlibraryKeys.getPresetMeal(presetMealId),
    queryFn: () => nutritionlibraryService.getPresetMeal(presetMealId!),
    enabled: !!presetMealId,
  });
};

// ---------------------------------------------------------------------------
// listPresetMeals
// ---------------------------------------------------------------------------

export const useListPresetMeals = (
  ...args: Parameters<typeof nutritionlibraryService.listPresetMeals>
) => {
  return useQuery({
    queryKey: nutritionlibraryKeys.listPresetMeals(...args),
    queryFn: () => nutritionlibraryService.listPresetMeals(...args),
  });
};

// ---------------------------------------------------------------------------
// updatePresetMeal
// ---------------------------------------------------------------------------

export const useUpdatePresetMeal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      presetMealId,
      data,
    }: {
      presetMealId: string;
      data: UpdatePresetMealInput;
    }) => nutritionlibraryService.updatePresetMeal(presetMealId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nutritionlibraryKeys.all() });
    },
  });
};

// ---------------------------------------------------------------------------
// deletePresetMeal
// ---------------------------------------------------------------------------

export const useDeletePresetMeal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (presetMealId: string) =>
      nutritionlibraryService.deletePresetMeal(presetMealId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nutritionlibraryKeys.all() });
    },
  });
};

// ---------------------------------------------------------------------------
// addPresetLine
// ---------------------------------------------------------------------------

export const useAddPresetLine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      presetMealId,
      data,
    }: {
      presetMealId: string;
      data: AddPresetLineInput;
    }) => nutritionlibraryService.addPresetLine(presetMealId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nutritionlibraryKeys.all() });
    },
  });
};

// ---------------------------------------------------------------------------
// listPresetLines
// ---------------------------------------------------------------------------

// Service function carries a `params?` slot — forward through the hook so
// callers can pass it alongside the path arg. Two shapes share this branch:
//   - get with declared httpLocation:'query' params → `params?: { <fields> }`
//   - list (always)                                 → `params?: ListParams |
//                                                       RequestParams [& <filters>]`
// Either way the type resolves via `Parameters<typeof svc.api>[<pathLen>]` so
// the hook stays in sync if the service signature shifts. `params` is in
// queryKey so React Query refetches when pagination / filters / transport
// flags (getJoins, caching) change.
export const useListPresetLines = (
  presetMealId: string | null | undefined,
  params?: Parameters<typeof nutritionlibraryService.listPresetLines>[1],
) => {
  return useQuery({
    queryKey: nutritionlibraryKeys.listPresetLines(presetMealId, params),
    queryFn: () =>
      nutritionlibraryService.listPresetLines(presetMealId!, params),
    enabled: !!presetMealId,
  });
};

// ---------------------------------------------------------------------------
// deletePresetLine
// ---------------------------------------------------------------------------

export const useDeletePresetLine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      presetMealId,
      presetLineId,
    }: {
      presetMealId: string;
      presetLineId: string;
    }) => nutritionlibraryService.deletePresetLine(presetMealId, presetLineId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nutritionlibraryKeys.all() });
    },
  });
};

// ---------------------------------------------------------------------------
// getPresetMealForLogging
// ---------------------------------------------------------------------------

export const useGetPresetMealForLogging = (
  presetMealId: string | null | undefined,
) => {
  return useQuery({
    queryKey: nutritionlibraryKeys.getPresetMealForLogging(presetMealId),
    queryFn: () =>
      nutritionlibraryService.getPresetMealForLogging(presetMealId!),
    enabled: !!presetMealId,
  });
};

// ---------------------------------------------------------------------------
// getFoodItemForLogging
// ---------------------------------------------------------------------------

export const useGetFoodItemForLogging = (
  foodItemId: string | null | undefined,
) => {
  return useQuery({
    queryKey: nutritionlibraryKeys.getFoodItemForLogging(foodItemId),
    queryFn: () => nutritionlibraryService.getFoodItemForLogging(foodItemId!),
    enabled: !!foodItemId,
  });
};

// ---------------------------------------------------------------------------
// getMyMacroTargetForLogging
// ---------------------------------------------------------------------------

export const useGetMyMacroTargetForLogging = (
  ...args: Parameters<typeof nutritionlibraryService.getMyMacroTargetForLogging>
) => {
  return useQuery({
    queryKey: nutritionlibraryKeys.getMyMacroTargetForLogging(...args),
    queryFn: () => nutritionlibraryService.getMyMacroTargetForLogging(...args),
  });
};
