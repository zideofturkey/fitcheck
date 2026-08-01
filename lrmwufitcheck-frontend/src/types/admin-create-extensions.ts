/**
 * Local extensions for create-payload types that don't carry `isGlobal` in
 * their generated form (unlike Dish's hand-written CreateDishInput, which
 * already declares it). Admin-only "create as global" checkboxes need this.
 * Not generated - safe to edit.
 */
import type {
  CreateFoodItemInput,
  CreatePresetMealInput,
} from "@/services/api/nutritionlibrary-api";

export interface CreateFoodItemInputWithGlobal extends CreateFoodItemInput {
  isGlobal?: boolean;
}

export interface CreatePresetMealInputWithGlobal extends CreatePresetMealInput {
  isGlobal?: boolean;
}
