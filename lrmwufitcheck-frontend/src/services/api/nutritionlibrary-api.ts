/**
 * Nutritionlibrary service API
 * Auto-generated from project definition — DO NOT EDIT.
 *
 * AI agents: READ-ONLY. This file is overwritten on every codegen run.
 * Add custom nutritionlibrary services as NEW files in this folder
 * (e.g. `nutritionlibrary-helpers.ts`) — any file whose name doesn't match
 * Genesis's generated set survives rebuilds.
 */

import { nutritionlibraryApi } from "@/lib/service-client";

import type {
  NutritionlibraryMacroTargetResponse,
  NutritionlibraryFoodItemResponse,
  NutritionlibraryFoodItemListResponse,
  NutritionlibraryPresetMealResponse,
  NutritionlibraryPresetMealListResponse,
  NutritionlibraryPresetLineResponse,
  NutritionlibraryPresetLineListResponse,
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

export type SetMacroTargetInput = {
  calorieTarget: number;

  proteinTarget: number;

  carbohydrateTarget: number;

  fatTarget: number;

  sugarTarget: number;

  fiberTarget: number;
};

export type CreateFoodItemInput = {
  foodName: string;

  caloriePer100g: number;

  proteinPer100g: number;

  carbohydratePer100g: number;

  fatPer100g: number;

  sugarPer100g: number;

  fiberPer100g: number;

  brandName?: string;

  foodCategory?: string;

  creationSource?: "manualEntry" | "aiAssistant";
};

export type UpdateFoodItemInput = {
  foodName?: string;

  caloriePer100g?: number;

  proteinPer100g?: number;

  carbohydratePer100g?: number;

  fatPer100g?: number;

  sugarPer100g?: number;

  fiberPer100g?: number;

  brandName?: string;

  foodCategory?: string;
};

export type CreatePresetMealInput = {
  templateName: string;

  descriptionText?: string;
};

export type UpdatePresetMealInput = {
  templateName?: string;

  descriptionText?: string;
};

export type AddPresetLineInput = {
  foodItemId: string;

  gramAmount: number;
};

export const nutritionlibraryService = {
  /**
   * setMacroTarget — Upsert-style API: soft-deletes any existing active macro target for the user bef
   * POST /v1/macro-targets
   */
  setMacroTarget: async (
    data: SetMacroTargetInput,
  ): Promise<NutritionlibraryMacroTargetResponse> => {
    return nutritionlibraryApi.post<NutritionlibraryMacroTargetResponse>(
      "v1/macro-targets",
      data,
    );
  },

  /**
   * getMyMacroTarget — Fetch the authenticated user's current active macro target.
   * GET /v1/macro-targets/me
   */
  getMyMacroTarget: async (): Promise<NutritionlibraryMacroTargetResponse> => {
    return nutritionlibraryApi.get<NutritionlibraryMacroTargetResponse>(
      "v1/macro-targets/me",
    );
  },

  /**
   * createFoodItem — Create a food item in the user's personal food library.
   * POST /v1/food-items
   */
  createFoodItem: async (
    data: CreateFoodItemInput,
  ): Promise<NutritionlibraryFoodItemResponse> => {
    return nutritionlibraryApi.post<NutritionlibraryFoodItemResponse>(
      "v1/food-items",
      data,
    );
  },

  /**
   * getFoodItem — Fetch a single food item by id. Ownership enforced.
   * GET /v1/food-items/:foodItemId
   */
  getFoodItem: async (
    foodItemId: string,
  ): Promise<NutritionlibraryFoodItemResponse> => {
    return nutritionlibraryApi.get<NutritionlibraryFoodItemResponse>(
      `v1/food-items/${foodItemId}`,
    );
  },

  /**
   * listFoodItems — List the authenticated user's food items. Supports optional text search on foodN
   * GET /v1/food-items
   */
  listFoodItems: async (
    params?: {
      searchTerm?: string;
      foodCategory?: string;
      creationSource?: "manualEntry" | "aiAssistant";
    } & ListParams,
  ): Promise<NutritionlibraryFoodItemListResponse> => {
    return nutritionlibraryApi.get<NutritionlibraryFoodItemListResponse>(
      "v1/food-items",
      { params },
    );
  },

  /**
   * updateFoodItem — Update a food item's fields. All fields are optional (partial update). Ownership
   * PATCH /v1/food-items/:foodItemId
   */
  updateFoodItem: async (
    foodItemId: string,
    data: UpdateFoodItemInput,
  ): Promise<NutritionlibraryFoodItemResponse> => {
    return nutritionlibraryApi.patch<NutritionlibraryFoodItemResponse>(
      `v1/food-items/${foodItemId}`,
      data,
    );
  },

  /**
   * deleteFoodItem — Soft-delete a food item. Ownership enforced.
   * DELETE /v1/food-items/:foodItemId
   */
  deleteFoodItem: async (
    foodItemId: string,
  ): Promise<NutritionlibraryFoodItemResponse> => {
    return nutritionlibraryApi.delete<NutritionlibraryFoodItemResponse>(
      `v1/food-items/${foodItemId}`,
    );
  },

  /**
   * createPresetMeal — Create a preset meal header. Lines are added separately via addPresetLine. Total
   * POST /v1/preset-meals
   */
  createPresetMeal: async (
    data: CreatePresetMealInput,
  ): Promise<NutritionlibraryPresetMealResponse> => {
    return nutritionlibraryApi.post<NutritionlibraryPresetMealResponse>(
      "v1/preset-meals",
      data,
    );
  },

  /**
   * getPresetMeal — Fetch a preset meal with its lines joined.
   * GET /v1/preset-meals/:presetMealId
   */
  getPresetMeal: async (
    presetMealId: string,
  ): Promise<NutritionlibraryPresetMealResponse> => {
    return nutritionlibraryApi.get<NutritionlibraryPresetMealResponse>(
      `v1/preset-meals/${presetMealId}`,
    );
  },

  /**
   * listPresetMeals — List the authenticated user's preset meal templates.
   * GET /v1/preset-meals
   */
  listPresetMeals: async (
    params?: ListParams,
  ): Promise<NutritionlibraryPresetMealListResponse> => {
    return nutritionlibraryApi.get<NutritionlibraryPresetMealListResponse>(
      "v1/preset-meals",
      { params },
    );
  },

  /**
   * updatePresetMeal — Update preset meal header fields (templateName, descriptionText). Nutrition tota
   * PATCH /v1/preset-meals/:presetMealId
   */
  updatePresetMeal: async (
    presetMealId: string,
    data: UpdatePresetMealInput,
  ): Promise<NutritionlibraryPresetMealResponse> => {
    return nutritionlibraryApi.patch<NutritionlibraryPresetMealResponse>(
      `v1/preset-meals/${presetMealId}`,
      data,
    );
  },

  /**
   * deletePresetMeal — Soft-delete a preset meal and all its lines. Ownership enforced.
   * DELETE /v1/preset-meals/:presetMealId
   */
  deletePresetMeal: async (
    presetMealId: string,
  ): Promise<NutritionlibraryPresetMealResponse> => {
    return nutritionlibraryApi.delete<NutritionlibraryPresetMealResponse>(
      `v1/preset-meals/${presetMealId}`,
    );
  },

  /**
   * addPresetLine — Add a food item line to a preset meal. Validates preset ownership and food item
   * POST /v1/preset-meals/:presetMealId/lines
   */
  addPresetLine: async (
    presetMealId: string,
    data: AddPresetLineInput,
  ): Promise<NutritionlibraryPresetLineResponse> => {
    return nutritionlibraryApi.post<NutritionlibraryPresetLineResponse>(
      `v1/preset-meals/${presetMealId}/lines`,
      data,
    );
  },

  /**
   * listPresetLines — List all lines for a preset meal. Validates preset ownership. Joins food item da
   * GET /v1/preset-meals/:presetMealId/lines
   */
  listPresetLines: async (
    presetMealId: string,
    params?: RequestParams,
  ): Promise<NutritionlibraryPresetLineListResponse> => {
    return nutritionlibraryApi.get<NutritionlibraryPresetLineListResponse>(
      `v1/preset-meals/${presetMealId}/lines`,
      { params },
    );
  },

  /**
   * deletePresetLine — Remove a single line from a preset, then recalculate preset totals. Validates pr
   * DELETE /v1/preset-meals/:presetMealId/lines/:presetLineId
   */
  deletePresetLine: async (
    presetMealId: string,
    presetLineId: string,
  ): Promise<NutritionlibraryPresetLineResponse> => {
    return nutritionlibraryApi.delete<NutritionlibraryPresetLineResponse>(
      `v1/preset-meals/${presetMealId}/lines/${presetLineId}`,
    );
  },

  /**
   * getPresetMealForLogging — Dedicated read API for mealTracker and nutritionAi services. Fetches a preset wi
   * GET /v1/preset-meals/:presetMealId/for-logging
   */
  getPresetMealForLogging: async (
    presetMealId: string,
  ): Promise<NutritionlibraryPresetMealResponse> => {
    return nutritionlibraryApi.get<NutritionlibraryPresetMealResponse>(
      `v1/preset-meals/${presetMealId}/for-logging`,
    );
  },

  /**
   * getFoodItemForLogging — Dedicated read API for mealTracker and nutritionAi. Fetches full per-100g nutrit
   * GET /v1/food-items/:foodItemId/for-logging
   */
  getFoodItemForLogging: async (
    foodItemId: string,
  ): Promise<NutritionlibraryFoodItemResponse> => {
    return nutritionlibraryApi.get<NutritionlibraryFoodItemResponse>(
      `v1/food-items/${foodItemId}/for-logging`,
    );
  },

  /**
   * getMyMacroTargetForLogging — Dedicated read API for mealTracker (dashboard progress) and nutritionAi (context
   * GET /v1/macro-targets/me/for-logging
   */
  getMyMacroTargetForLogging:
    async (): Promise<NutritionlibraryMacroTargetResponse> => {
      return nutritionlibraryApi.get<NutritionlibraryMacroTargetResponse>(
        "v1/macro-targets/me/for-logging",
      );
    },
};

export default nutritionlibraryService;
