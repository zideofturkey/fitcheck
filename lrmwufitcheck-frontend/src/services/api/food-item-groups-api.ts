/**
 * Custom service for the /v1/food-items/grouped endpoint (brand-variant
 * grouping by baseName). Not part of the generated nutritionlibrary-api.ts
 * since this route isn't a Mindbricks Manager - see
 * lrmwufitcheck-nutritionlibrary/src/routes/food-item-groups.js.
 */
import { nutritionlibraryApi } from "@/lib/service-client";
import type { GroupedFoodItemsResponse } from "@/types/food-item-extensions";

export const foodItemGroupsService = {
  /** GET /v1/food-items/grouped */
  getGrouped: async (): Promise<GroupedFoodItemsResponse> => {
    return nutritionlibraryApi.get<GroupedFoodItemsResponse>(
      "v1/food-items/grouped",
    );
  },
};

export default foodItemGroupsService;
