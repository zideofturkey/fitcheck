import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import adminUserLibraryService from "@/services/api/admin-user-library-api";
import type { SuggestionEntityType } from "@/services/api/suggestion-api";

export const adminUserLibraryKeys = {
  all: () => ["adminUserLibrary"] as const,
  byUser: (userId: string) => [...adminUserLibraryKeys.all(), userId] as const,
};

export const useAdminUserLibrary = (userId: string) => {
  return useQuery({
    queryKey: adminUserLibraryKeys.byUser(userId),
    queryFn: () => adminUserLibraryService.getLibrary(userId),
    enabled: !!userId,
  });
};

export const usePromoteToGlobal = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      entityType,
      id,
    }: {
      entityType: SuggestionEntityType;
      id: string;
    }) => adminUserLibraryService.promoteToGlobal(userId, entityType, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminUserLibraryKeys.byUser(userId),
      });
    },
  });
};
