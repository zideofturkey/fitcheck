/**
 * Custom service for admin-only category catalog management. There is no
 * separate "category" entity - foodCategory/dishCategory/presetCategory are
 * free-text columns on foodItem/dish/presetMeal respectively, so these
 * endpoints bulk-edit that column across every matching row. See
 * lrmwufitcheck-nutritionlibrary/src/routes/category-admin.js.
 */
import { nutritionlibraryApi } from "@/lib/service-client";

export type CategoryEntity = "food" | "dish" | "preset";

export interface CategorySummary {
  category: string;
  itemCount: number;
}

export interface CategoryListResponse {
  status: string;
  entity: CategoryEntity;
  categories: CategorySummary[];
}

export interface CreateCategoryInput {
  entity: CategoryEntity;
  category: string;
}

export interface CreateCategoryResponse {
  status: string;
  entity: CategoryEntity;
  category: CategorySummary;
}

export interface RenameCategoryInput {
  entity: CategoryEntity;
  oldName: string;
  newName: string;
}

export interface RenameCategoryResponse {
  status: string;
  entity: CategoryEntity;
  oldName: string;
  newName: string;
  updatedCount: number;
}

export interface DeleteCategoryResponse {
  status: string;
  entity: CategoryEntity;
  category: string;
  clearedCount: number;
  clearedIds: string[];
  wasPlaceholder: boolean;
}

export interface RestoreCategoryInput {
  entity: CategoryEntity;
  category: string;
  ids?: string[];
  wasPlaceholder?: boolean;
}

export interface RestoreCategoryResponse {
  status: string;
  entity: CategoryEntity;
  category: string;
  restoredCount: number;
}

export const categoryAdminService = {
  /** GET /v1/admin/categories?entity=... */
  list: async (entity: CategoryEntity): Promise<CategoryListResponse> => {
    return nutritionlibraryApi.get<CategoryListResponse>(
      "v1/admin/categories",
      { params: { entity } },
    );
  },

  /** POST /v1/admin/categories */
  create: async (data: CreateCategoryInput): Promise<CreateCategoryResponse> => {
    return nutritionlibraryApi.post<CreateCategoryResponse>(
      "v1/admin/categories",
      data,
    );
  },

  /** PATCH /v1/admin/categories/rename */
  rename: async (
    data: RenameCategoryInput,
  ): Promise<RenameCategoryResponse> => {
    return nutritionlibraryApi.patch<RenameCategoryResponse>(
      "v1/admin/categories/rename",
      data,
    );
  },

  /** DELETE /v1/admin/categories/:name?entity=... */
  remove: async (
    entity: CategoryEntity,
    category: string,
  ): Promise<DeleteCategoryResponse> => {
    return nutritionlibraryApi.delete<DeleteCategoryResponse>(
      `v1/admin/categories/${encodeURIComponent(category)}`,
      undefined,
      { params: { entity } },
    );
  },

  /** POST /v1/admin/categories/restore */
  restore: async (
    data: RestoreCategoryInput,
  ): Promise<RestoreCategoryResponse> => {
    return nutritionlibraryApi.post<RestoreCategoryResponse>(
      "v1/admin/categories/restore",
      data,
    );
  },
};
