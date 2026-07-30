/**
 * Custom service for the suggestion workflow (promoting a private
 * foodItem/dish/presetMeal to global, reviewed by an admin). Plain Express
 * routes, not a Mindbricks Manager - see
 * lrmwufitcheck-nutritionlibrary/src/routes/suggestions.js.
 */
import { nutritionlibraryApi } from "@/lib/service-client";

export type SuggestionEntityType = "foodItem" | "dish" | "presetMeal";
export type SuggestionStatus = "pending" | "approved" | "rejected";

export interface SuggestionLineDetail {
  lineFoodName: string;
  gramAmount: number;
  lineCalories: number;
  lineProtein: number;
  lineCarbohydrates: number;
  lineFat: number;
  lineSugar: number;
  lineFiber: number;
}

export interface SuggestionSourceDetail {
  // foodItem
  foodName?: string;
  caloriePer100g?: number;
  proteinPer100g?: number;
  carbohydratePer100g?: number;
  fatPer100g?: number;
  sugarPer100g?: number;
  fiberPer100g?: number;
  brandName?: string | null;
  // dish
  dishName?: string;
  totalGramWeight?: number;
  // presetMeal
  templateName?: string;
  // shared (dish/presetMeal)
  descriptionText?: string | null;
  totalCalories?: number;
  totalProtein?: number;
  totalCarbohydrates?: number;
  totalFat?: number;
  totalSugar?: number;
  totalFiber?: number;
  lines?: SuggestionLineDetail[];
}

export interface Suggestion {
  id: string;
  userId: string;
  entityType: SuggestionEntityType;
  sourceRecordId: string;
  status: SuggestionStatus;
  reviewNote?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  /** Enriched detail of the actual foodItem/dish/presetMeal being suggested,
   * fetched server-side so the admin panel can show what it's approving
   * instead of just a bare record id. Null if the source record was deleted. */
  sourceDetail?: SuggestionSourceDetail | null;
}

export interface CreateSuggestionInput {
  entityType: SuggestionEntityType;
  sourceRecordId: string;
}

export interface SuggestionListResponse {
  status: string;
  count: number;
  suggestions: Suggestion[];
}

export interface SuggestionResponse {
  status: string;
  suggestion: Suggestion;
  globalCopy?: unknown;
  copiedLineCount?: number;
}

export const suggestionService = {
  /** POST /v1/suggestions */
  create: async (data: CreateSuggestionInput): Promise<SuggestionResponse> => {
    return nutritionlibraryApi.post<SuggestionResponse>(
      "v1/suggestions",
      data,
    );
  },

  /** GET /v1/suggestions?status=...&userId=... (userId is admin-only) */
  list: async (
    status?: string,
    userId?: string,
  ): Promise<SuggestionListResponse> => {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    if (userId) params.userId = userId;
    return nutritionlibraryApi.get<SuggestionListResponse>("v1/suggestions", {
      params: Object.keys(params).length ? params : undefined,
    });
  },

  /** POST /v1/suggestions/:id/approve */
  approve: async (
    id: string,
    reviewNote?: string,
  ): Promise<SuggestionResponse> => {
    return nutritionlibraryApi.post<SuggestionResponse>(
      `v1/suggestions/${id}/approve`,
      reviewNote ? { reviewNote } : {},
    );
  },

  /** POST /v1/suggestions/:id/reject */
  reject: async (
    id: string,
    reviewNote?: string,
  ): Promise<SuggestionResponse> => {
    return nutritionlibraryApi.post<SuggestionResponse>(
      `v1/suggestions/${id}/reject`,
      reviewNote ? { reviewNote } : {},
    );
  },
};

export default suggestionService;
