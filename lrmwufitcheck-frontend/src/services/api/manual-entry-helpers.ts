/**
 * "Persist manual entry to library" helpers for the progressive Dish/
 * PresetMeal creation flow. A manual malzeme/yemek added while building a
 * Dish/PresetMeal is first saved as a fully embedded, library-independent
 * line (see dish-api.ts / preset-line-helpers.ts). If the user then answers
 * "Evet" or "Hayır, sadece kütüphaneme ekle" to the post-entry suggestion
 * prompt, these helpers create the corresponding real, reusable library
 * record from the same manual values - the "×" (dismiss) path never calls
 * these, so nothing gets persisted beyond the embedded line itself.
 */
import { nutritionlibraryService } from "@/services/api/nutritionlibrary-api";
import { dishService } from "@/services/api/dish-api";
import type { Dish } from "@/services/api/dish-api";
import type { NutritionlibraryFoodItem } from "@/types/api";

export interface ManualNutritionValues {
  name: string;
  caloriePer100g: number;
  proteinPer100g: number;
  carbohydratePer100g: number;
  fatPer100g: number;
  sugarPer100g: number;
  fiberPer100g: number;
}

/** Creates a real, reusable foodItem from manual per-100g values. */
export const persistManualFoodItem = async (
  values: ManualNutritionValues,
): Promise<NutritionlibraryFoodItem> => {
  const res = await nutritionlibraryService.createFoodItem({
    foodName: values.name,
    caloriePer100g: values.caloriePer100g,
    proteinPer100g: values.proteinPer100g,
    carbohydratePer100g: values.carbohydratePer100g,
    fatPer100g: values.fatPer100g,
    sugarPer100g: values.sugarPer100g,
    fiberPer100g: values.fiberPer100g,
  });
  return res.foodItem;
};

/**
 * Creates a real, reusable Dish from manual per-100g values: a Dish's own
 * totals are always derived from its dishLines (never directly settable),
 * so this wraps the values in a single embedded dishLine at gramAmount:100
 * - the resulting Dish is a self-consistent "100g of X" recipe whose
 * totals equal the entered per-100g values exactly, and scales normally
 * from there (via dishFactor) wherever it's referenced afterwards.
 */
export const persistManualDish = async (
  values: ManualNutritionValues,
): Promise<Dish> => {
  const dishRes = await dishService.createDish({ dishName: values.name });
  const dish = dishRes.dish;
  await dishService.addDishLine(dish.id, {
    gramAmount: 100,
    manualFoodName: values.name,
    manualCaloriePer100g: values.caloriePer100g,
    manualProteinPer100g: values.proteinPer100g,
    manualCarbohydratePer100g: values.carbohydratePer100g,
    manualFatPer100g: values.fatPer100g,
    manualSugarPer100g: values.sugarPer100g,
    manualFiberPer100g: values.fiberPer100g,
  });
  const refreshed = await dishService.getDish(dish.id);
  return refreshed.dish;
};
