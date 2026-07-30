/**
 * Custom service for the admin "view a specific user's private library" and
 * "promote directly to global" actions. Plain Express routes, not a
 * Mindbricks Manager - see
 * lrmwufitcheck-nutritionlibrary/src/routes/admin-user-library.js.
 */
import { nutritionlibraryApi } from "@/lib/service-client";
import type { SuggestionEntityType } from "@/services/api/suggestion-api";

export interface AdminLibraryItem {
  entityType: SuggestionEntityType;
  id: string;
  userId: string;
  isGlobal: boolean;
  createdAt: string;
  updatedAt: string;
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
  dishCategory?: string;
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
  totalGramWeight?: number;
}

export interface AdminLibraryResponse {
  status: string;
  count: number;
  items: AdminLibraryItem[];
}

export interface PromoteToGlobalResponse {
  status: string;
  globalCopy: unknown;
  copiedLineCount: number;
}

export const adminUserLibraryService = {
  /** GET /v1/admin/users/:userId/library */
  getLibrary: async (userId: string): Promise<AdminLibraryResponse> => {
    return nutritionlibraryApi.get<AdminLibraryResponse>(
      `v1/admin/users/${userId}/library`,
    );
  },

  /** POST /v1/admin/users/:userId/library/:entityType/:id/promote */
  promoteToGlobal: async (
    userId: string,
    entityType: SuggestionEntityType,
    id: string,
  ): Promise<PromoteToGlobalResponse> => {
    return nutritionlibraryApi.post<PromoteToGlobalResponse>(
      `v1/admin/users/${userId}/library/${entityType}/${id}/promote`,
      {},
    );
  },
};

export default adminUserLibraryService;
