/**
 * Custom type extension for the mealLine.sourceDishId field, added outside
 * the original Mindbricks spec (mirrors the existing FoodItemWithBaseName /
 * food-item-extensions.ts pattern). Not generated — safe to edit.
 */
import type { MealtrackerMealLine } from "@/types/api";

export interface MealLineWithDish extends MealtrackerMealLine {
  sourceDishId?: string | null;
}
