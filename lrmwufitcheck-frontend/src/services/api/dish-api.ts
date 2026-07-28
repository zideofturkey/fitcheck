/**
 * Custom service for the Dish/DishLine entities. These were added directly
 * to the nutritionlibrary backend (not through the Mindbricks spec), so
 * there is no generated `nutritionlibrary-api.ts` coverage for them - this
 * file follows the same manual pattern as `nutritionai-helpers.ts`.
 */
import { nutritionlibraryApi } from "@/lib/service-client";
import type { MindbricksResponse } from "@/types/api";

export interface Dish {
  id: string;
  userId: string;
  dishName: string;
  descriptionText?: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbohydrates: number;
  totalFat: number;
  totalSugar: number;
  totalFiber: number;
  totalGramWeight: number;
  isGlobal?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DishLine {
  id: string;
  dishId: string;
  foodItemId: string;
  lineFoodName: string;
  gramAmount: number;
  lineCalories: number;
  lineProtein: number;
  lineCarbohydrates?: number;
  lineFat?: number;
  lineSugar?: number;
  lineFiber?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DishResponse extends MindbricksResponse {
  dish: Dish;
}

export interface DishListResponse extends MindbricksResponse {
  dishes: Dish[];
}

export interface DishLineResponse extends MindbricksResponse {
  dishLine: DishLine;
}

export interface DishLineListResponse extends MindbricksResponse {
  dishLines: DishLine[];
}

export interface CreateDishInput {
  dishName: string;
  descriptionText?: string;
  isGlobal?: boolean;
}

export interface AddDishLineInput {
  foodItemId: string;
  gramAmount: number;
}

export interface ListDishesParams {
  [key: string]: string | number | boolean | undefined;
  dishName?: string;
  isGlobal?: boolean;
  pageNumber?: number;
  pageRowCount?: number;
}

export const dishService = {
  /** POST /v1/dishes */
  createDish: async (data: CreateDishInput): Promise<DishResponse> => {
    return nutritionlibraryApi.post<DishResponse>("v1/dishes", data);
  },

  /** GET /v1/dishes/:dishId */
  getDish: async (dishId: string): Promise<DishResponse> => {
    return nutritionlibraryApi.get<DishResponse>(`v1/dishes/${dishId}`);
  },

  /** GET /v1/dishes */
  listDishes: async (params?: ListDishesParams): Promise<DishListResponse> => {
    return nutritionlibraryApi.get<DishListResponse>("v1/dishes", { params });
  },

  /** PATCH /v1/dishes/:dishId */
  updateDish: async (
    dishId: string,
    data: Partial<CreateDishInput>,
  ): Promise<DishResponse> => {
    return nutritionlibraryApi.patch<DishResponse>(
      `v1/dishes/${dishId}`,
      data,
    );
  },

  /** DELETE /v1/dishes/:dishId */
  deleteDish: async (dishId: string): Promise<MindbricksResponse> => {
    return nutritionlibraryApi.delete<MindbricksResponse>(
      `v1/dishes/${dishId}`,
    );
  },

  /** POST /v1/dishes/:dishId/lines */
  addDishLine: async (
    dishId: string,
    data: AddDishLineInput,
  ): Promise<DishLineResponse> => {
    return nutritionlibraryApi.post<DishLineResponse>(
      `v1/dishes/${dishId}/lines`,
      data,
    );
  },

  /** GET /v1/dishes/:dishId/lines */
  listDishLines: async (dishId: string): Promise<DishLineListResponse> => {
    return nutritionlibraryApi.get<DishLineListResponse>(
      `v1/dishes/${dishId}/lines`,
    );
  },

  /** DELETE /v1/dishes/:dishId/lines/:dishLineId */
  deleteDishLine: async (
    dishId: string,
    dishLineId: string,
  ): Promise<MindbricksResponse> => {
    return nutritionlibraryApi.delete<MindbricksResponse>(
      `v1/dishes/${dishId}/lines/${dishLineId}`,
    );
  },
};

export default dishService;
