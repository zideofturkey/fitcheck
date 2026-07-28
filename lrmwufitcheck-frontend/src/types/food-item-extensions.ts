/**
 * Custom type extensions for foodItem fields added outside the original
 * Mindbricks spec (baseName / parentIngredientId brand-variant grouping).
 * Not generated — safe to edit.
 */
import type { NutritionlibraryFoodItem } from "@/types/api";

export interface FoodItemWithBaseName extends NutritionlibraryFoodItem {
  baseName?: string | null;
  parentIngredientId?: string | null;
  isGlobal?: boolean;
}

export interface FoodItemGroup {
  baseName: string | null;
  items: FoodItemWithBaseName[];
}

export interface GroupedFoodItemsResponse {
  status: string;
  groupCount: number;
  itemCount: number;
  groups: FoodItemGroup[];
}
