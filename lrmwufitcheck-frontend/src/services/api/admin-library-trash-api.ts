/**
 * Custom service for the admin-only global-library recycle bin. See
 * lrmwufitcheck-nutritionlibrary/src/routes/admin-global-trash.js.
 */
import { nutritionlibraryApi } from "@/lib/service-client";

export type TrashObjectType = "fooditem" | "dish" | "presetmeal";

const DATA_NAME: Record<TrashObjectType, string> = {
  fooditem: "foodItems",
  dish: "dishes",
  presetmeal: "presetMeals",
};

export interface TrashListResponse<T> {
  status: string;
  windowDays: number;
  [key: string]: unknown | T[];
}

export interface RestoreResponse<T> {
  status: string;
  restored: T;
}

export interface RestoreBulkResponse {
  status: string;
  restoredCount: number;
  restoredIds: string[];
}

export const adminLibraryTrashService = {
  /** GET /v1/admin/library/:type/trash */
  list: async <T>(type: TrashObjectType): Promise<T[]> => {
    const res = await nutritionlibraryApi.get<TrashListResponse<T>>(
      `v1/admin/library/${type}/trash`,
    );
    return (res[DATA_NAME[type]] as T[]) ?? [];
  },

  /** POST /v1/admin/library/:type/:id/restore */
  restoreOne: async <T>(
    type: TrashObjectType,
    id: string,
  ): Promise<RestoreResponse<T>> => {
    return nutritionlibraryApi.post<RestoreResponse<T>>(
      `v1/admin/library/${type}/${id}/restore`,
      {},
    );
  },

  /** POST /v1/admin/library/:type/restore-bulk */
  restoreBulk: async (
    type: TrashObjectType,
    ids: string[],
  ): Promise<RestoreBulkResponse> => {
    return nutritionlibraryApi.post<RestoreBulkResponse>(
      `v1/admin/library/${type}/restore-bulk`,
      { ids },
    );
  },
};
