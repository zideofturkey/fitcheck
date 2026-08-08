import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  categoryAdminService,
  type CategoryEntity,
  type RenameCategoryInput,
  type RestoreCategoryInput,
} from "@/services/api/category-admin-api";

export const categoryAdminKeys = {
  all: () => ["categoryAdmin"] as const,
  list: (entity: CategoryEntity) =>
    [...categoryAdminKeys.all(), "list", entity] as const,
};

export const useListCategories = (entity: CategoryEntity) => {
  return useQuery({
    queryKey: categoryAdminKeys.list(entity),
    queryFn: () => categoryAdminService.list(entity),
  });
};

export const useRenameCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RenameCategoryInput) =>
      categoryAdminService.rename(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryAdminKeys.all() });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      entity,
      category,
    }: {
      entity: CategoryEntity;
      category: string;
    }) => categoryAdminService.remove(entity, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryAdminKeys.all() });
    },
  });
};

export const useRestoreCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RestoreCategoryInput) =>
      categoryAdminService.restore(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryAdminKeys.all() });
      queryClient.invalidateQueries({ queryKey: ["nutritionlibrary"] });
      queryClient.invalidateQueries({ queryKey: ["dish"] });
    },
  });
};
