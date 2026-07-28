/**
 * React Query hooks for the custom Dish/DishLine service (dish-api.ts).
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  dishService,
  type CreateDishInput,
  type AddDishLineInput,
  type ListDishesParams,
} from "@/services/api/dish-api";

export const dishKeys = {
  all: () => ["dish"] as const,
  list: (params?: ListDishesParams) =>
    [...dishKeys.all(), "list", params] as const,
  detail: (dishId: string | null | undefined) =>
    [...dishKeys.all(), "detail", dishId] as const,
  lines: (dishId: string | null | undefined) =>
    [...dishKeys.all(), "lines", dishId] as const,
};

export const useListDishes = (params?: ListDishesParams) => {
  return useQuery({
    queryKey: dishKeys.list(params),
    queryFn: () => dishService.listDishes(params),
  });
};

export const useGetDish = (dishId: string | null | undefined) => {
  return useQuery({
    queryKey: dishKeys.detail(dishId),
    queryFn: () => dishService.getDish(dishId!),
    enabled: !!dishId,
  });
};

export const useListDishLines = (dishId: string | null | undefined) => {
  return useQuery({
    queryKey: dishKeys.lines(dishId),
    queryFn: () => dishService.listDishLines(dishId!),
    enabled: !!dishId,
  });
};

export const useCreateDish = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDishInput) => dishService.createDish(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dishKeys.all() });
    },
  });
};

export const useUpdateDish = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      dishId,
      data,
    }: {
      dishId: string;
      data: Partial<CreateDishInput>;
    }) => dishService.updateDish(dishId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: dishKeys.all() });
      queryClient.invalidateQueries({
        queryKey: dishKeys.detail(variables.dishId),
      });
    },
  });
};

export const useDeleteDish = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dishId: string) => dishService.deleteDish(dishId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dishKeys.all() });
    },
  });
};

export const useAddDishLine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      dishId,
      data,
    }: {
      dishId: string;
      data: AddDishLineInput;
    }) => dishService.addDishLine(dishId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: dishKeys.lines(variables.dishId) });
      queryClient.invalidateQueries({ queryKey: dishKeys.detail(variables.dishId) });
      queryClient.invalidateQueries({ queryKey: dishKeys.all() });
    },
  });
};

export const useDeleteDishLine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      dishId,
      dishLineId,
    }: {
      dishId: string;
      dishLineId: string;
    }) => dishService.deleteDishLine(dishId, dishLineId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: dishKeys.lines(variables.dishId) });
      queryClient.invalidateQueries({ queryKey: dishKeys.detail(variables.dishId) });
      queryClient.invalidateQueries({ queryKey: dishKeys.all() });
    },
  });
};
