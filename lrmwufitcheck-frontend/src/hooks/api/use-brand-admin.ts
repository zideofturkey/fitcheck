import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  brandAdminService,
  type RenameBrandInput,
  type RestoreBrandInput,
} from "@/services/api/brand-admin-api";

export const brandAdminKeys = {
  all: () => ["brandAdmin"] as const,
  list: () => [...brandAdminKeys.all(), "list"] as const,
};

export const useListBrands = () => {
  return useQuery({
    queryKey: brandAdminKeys.list(),
    queryFn: () => brandAdminService.list(),
  });
};

export const useRenameBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RenameBrandInput) => brandAdminService.rename(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandAdminKeys.all() });
    },
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (brandName: string) => brandAdminService.remove(brandName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandAdminKeys.all() });
    },
  });
};

export const useRestoreBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RestoreBrandInput) => brandAdminService.restore(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandAdminKeys.all() });
      queryClient.invalidateQueries({ queryKey: ["nutritionlibrary"] });
    },
  });
};
