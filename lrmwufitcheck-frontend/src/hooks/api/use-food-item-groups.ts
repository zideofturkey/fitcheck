import { useQuery } from "@tanstack/react-query";
import { foodItemGroupsService } from "@/services/api/food-item-groups-api";

export const useGroupedFoodItems = (enabled: boolean) => {
  return useQuery({
    queryKey: ["foodItem", "grouped"],
    queryFn: () => foodItemGroupsService.getGrouped(),
    enabled,
  });
};
