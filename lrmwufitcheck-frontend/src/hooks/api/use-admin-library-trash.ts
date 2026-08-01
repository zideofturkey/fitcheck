import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminLibraryTrashService,
  type TrashObjectType,
} from "@/services/api/admin-library-trash-api";

export const adminLibraryTrashKeys = {
  all: () => ["adminLibraryTrash"] as const,
  list: (type: TrashObjectType) =>
    [...adminLibraryTrashKeys.all(), "list", type] as const,
};

export const useListLibraryTrash = <T>(
  type: TrashObjectType,
  enabled: boolean,
) => {
  return useQuery({
    queryKey: adminLibraryTrashKeys.list(type),
    queryFn: () => adminLibraryTrashService.list<T>(type),
    enabled,
  });
};

export const useRestoreLibraryItem = (type: TrashObjectType) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      adminLibraryTrashService.restoreOne(type, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminLibraryTrashKeys.all() });
      queryClient.invalidateQueries({ queryKey: ["nutritionlibrary"] });
      queryClient.invalidateQueries({ queryKey: ["dish"] });
    },
  });
};

export const useRestoreLibraryItemsBulk = (type: TrashObjectType) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      adminLibraryTrashService.restoreBulk(type, ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminLibraryTrashKeys.all() });
      queryClient.invalidateQueries({ queryKey: ["nutritionlibrary"] });
      queryClient.invalidateQueries({ queryKey: ["dish"] });
    },
  });
};
