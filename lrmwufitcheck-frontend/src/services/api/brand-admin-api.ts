/**
 * Custom service for admin-only brand catalog management. There is no
 * separate "brand" entity - brandName is a free-text column on foodItem, so
 * these endpoints bulk-edit that column across every matching foodItem. See
 * lrmwufitcheck-nutritionlibrary/src/routes/brand-admin.js.
 */
import { nutritionlibraryApi } from "@/lib/service-client";

export interface BrandSummary {
  brandName: string;
  itemCount: number;
}

export interface BrandListResponse {
  status: string;
  brands: BrandSummary[];
}

export interface CreateBrandInput {
  brandName: string;
}

export interface CreateBrandResponse {
  status: string;
  brand: BrandSummary;
}

export interface RenameBrandInput {
  oldName: string;
  newName: string;
}

export interface RenameBrandResponse {
  status: string;
  oldName: string;
  newName: string;
  updatedCount: number;
}

export interface DeleteBrandResponse {
  status: string;
  brandName: string;
  clearedCount: number;
  clearedIds: string[];
  wasPlaceholder: boolean;
}

export interface RestoreBrandInput {
  brandName: string;
  ids?: string[];
  wasPlaceholder?: boolean;
}

export interface RestoreBrandResponse {
  status: string;
  brandName: string;
  restoredCount: number;
}

export const brandAdminService = {
  /** GET /v1/admin/brands */
  list: async (): Promise<BrandListResponse> => {
    return nutritionlibraryApi.get<BrandListResponse>("v1/admin/brands");
  },

  /** POST /v1/admin/brands */
  create: async (data: CreateBrandInput): Promise<CreateBrandResponse> => {
    return nutritionlibraryApi.post<CreateBrandResponse>(
      "v1/admin/brands",
      data,
    );
  },

  /** PATCH /v1/admin/brands/rename */
  rename: async (data: RenameBrandInput): Promise<RenameBrandResponse> => {
    return nutritionlibraryApi.patch<RenameBrandResponse>(
      "v1/admin/brands/rename",
      data,
    );
  },

  /** DELETE /v1/admin/brands/:name */
  remove: async (brandName: string): Promise<DeleteBrandResponse> => {
    return nutritionlibraryApi.delete<DeleteBrandResponse>(
      `v1/admin/brands/${encodeURIComponent(brandName)}`,
    );
  },

  /** POST /v1/admin/brands/restore */
  restore: async (data: RestoreBrandInput): Promise<RestoreBrandResponse> => {
    return nutritionlibraryApi.post<RestoreBrandResponse>(
      "v1/admin/brands/restore",
      data,
    );
  },
};
