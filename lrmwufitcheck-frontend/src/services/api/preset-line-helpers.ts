/**
 * Companion to the generated nutritionlibrary-api.ts: addPresetLine there is
 * typed with only `foodItemId`, but the backend's add-presetline-api.js
 * accepts either foodItemId OR dishId (mutually exclusive nutrition source).
 * Preset meal creation is dish-only from the UI now, so this posts the same
 * endpoint with a dishId body instead of widening the generated type.
 */
import { nutritionlibraryApi } from "@/lib/service-client";
import type { NutritionlibraryPresetLineResponse } from "@/types/api";

export interface AddPresetLineDishInput {
  dishId: string;
  gramAmount: number;
}

export const addPresetLineDish = async (
  presetMealId: string,
  data: AddPresetLineDishInput,
): Promise<NutritionlibraryPresetLineResponse> => {
  return nutritionlibraryApi.post<NutritionlibraryPresetLineResponse>(
    `v1/preset-meals/${presetMealId}/lines`,
    data,
  );
};

// Manual/embedded entry (no foodItemId/dishId): a fully one-off "Yemek"
// whose own per-100g values are supplied directly, with no Dish library
// record created. See add-presetline-api.js's three-way source validation.
export interface AddPresetLineManualInput {
  manualFoodName: string;
  manualCaloriePer100g: number;
  manualProteinPer100g: number;
  manualCarbohydratePer100g: number;
  manualFatPer100g: number;
  manualSugarPer100g: number;
  manualFiberPer100g: number;
  gramAmount: number;
}

export const addPresetLineManual = async (
  presetMealId: string,
  data: AddPresetLineManualInput,
): Promise<NutritionlibraryPresetLineResponse> => {
  return nutritionlibraryApi.post<NutritionlibraryPresetLineResponse>(
    `v1/preset-meals/${presetMealId}/lines`,
    data,
  );
};
