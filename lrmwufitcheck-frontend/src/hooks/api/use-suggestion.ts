import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  suggestionService,
  type CreateSuggestionInput,
} from "@/services/api/suggestion-api";

export const suggestionKeys = {
  all: () => ["suggestion"] as const,
  list: (status?: string, userId?: string) =>
    [...suggestionKeys.all(), "list", status, userId] as const,
};

export const useListSuggestions = (
  status?: string,
  userId?: string,
  enabled = true,
) => {
  return useQuery({
    queryKey: suggestionKeys.list(status, userId),
    queryFn: () => suggestionService.list(status, userId),
    enabled,
  });
};

export const useCreateSuggestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSuggestionInput) => suggestionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: suggestionKeys.all() });
    },
  });
};

export const useApproveSuggestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reviewNote }: { id: string; reviewNote?: string }) =>
      suggestionService.approve(id, reviewNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: suggestionKeys.all() });
    },
  });
};

export const useRejectSuggestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reviewNote }: { id: string; reviewNote?: string }) =>
      suggestionService.reject(id, reviewNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: suggestionKeys.all() });
    },
  });
};
