/**
 * React Query hooks for Nutritionai service
 * Auto-generated from project definition — DO NOT EDIT.
 *
 * AI agents: READ-ONLY. This file is overwritten on every codegen run.
 * Add custom nutritionai hooks as NEW files in this folder (e.g.
 * `use-nutritionai-helpers.ts`) — any file whose name doesn't match
 * Genesis's generated set survives rebuilds.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { nutritionaiService } from "@/services/api/nutritionai-api";

import type {
  ParseMealInput,
  ConfirmCandidateMealInput,
  AskNutritionQuestionInput,
  UpdateAiCandidateLineInput,
} from "@/services/api/nutritionai-api";

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const nutritionaiKeys = {
  all: () => ["nutritionai"] as const,

  parseMeal: (...args: unknown[]) =>
    [...nutritionaiKeys.all(), "parseMeal", ...args] as const,

  confirmCandidateMeal: (...args: unknown[]) =>
    [...nutritionaiKeys.all(), "confirmCandidateMeal", ...args] as const,

  askNutritionQuestion: (...args: unknown[]) =>
    [...nutritionaiKeys.all(), "askNutritionQuestion", ...args] as const,

  getAiSession: (...args: unknown[]) =>
    [...nutritionaiKeys.all(), "getAiSession", ...args] as const,

  listAiSessions: (...args: unknown[]) =>
    [...nutritionaiKeys.all(), "listAiSessions", ...args] as const,

  getAiCandidateMeal: (...args: unknown[]) =>
    [...nutritionaiKeys.all(), "getAiCandidateMeal", ...args] as const,

  listAiCandidateMeals: (...args: unknown[]) =>
    [...nutritionaiKeys.all(), "listAiCandidateMeals", ...args] as const,

  updateAiCandidateLine: (...args: unknown[]) =>
    [...nutritionaiKeys.all(), "updateAiCandidateLine", ...args] as const,

  rejectCandidateMeal: (...args: unknown[]) =>
    [...nutritionaiKeys.all(), "rejectCandidateMeal", ...args] as const,

  getAiGuidanceNote: (...args: unknown[]) =>
    [...nutritionaiKeys.all(), "getAiGuidanceNote", ...args] as const,

  listAiGuidanceNotes: (...args: unknown[]) =>
    [...nutritionaiKeys.all(), "listAiGuidanceNotes", ...args] as const,
};

// ---------------------------------------------------------------------------
// parseMeal
// ---------------------------------------------------------------------------

export const useParseMeal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ParseMealInput) => nutritionaiService.parseMeal(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nutritionaiKeys.all() });
    },
  });
};

// ---------------------------------------------------------------------------
// confirmCandidateMeal
// ---------------------------------------------------------------------------

export const useConfirmCandidateMeal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      aiCandidateMealId,
      data,
    }: {
      aiCandidateMealId: string;
      data: ConfirmCandidateMealInput;
    }) => nutritionaiService.confirmCandidateMeal(aiCandidateMealId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nutritionaiKeys.all() });
    },
  });
};

// ---------------------------------------------------------------------------
// askNutritionQuestion
// ---------------------------------------------------------------------------

export const useAskNutritionQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AskNutritionQuestionInput) =>
      nutritionaiService.askNutritionQuestion(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nutritionaiKeys.all() });
    },
  });
};

// ---------------------------------------------------------------------------
// getAiSession
// ---------------------------------------------------------------------------

export const useGetAiSession = (aiSessionId: string | null | undefined) => {
  return useQuery({
    queryKey: nutritionaiKeys.getAiSession(aiSessionId),
    queryFn: () => nutritionaiService.getAiSession(aiSessionId!),
    enabled: !!aiSessionId,
  });
};

// ---------------------------------------------------------------------------
// listAiSessions
// ---------------------------------------------------------------------------

export const useListAiSessions = (
  ...args: Parameters<typeof nutritionaiService.listAiSessions>
) => {
  return useQuery({
    queryKey: nutritionaiKeys.listAiSessions(...args),
    queryFn: () => nutritionaiService.listAiSessions(...args),
  });
};

// ---------------------------------------------------------------------------
// getAiCandidateMeal
// ---------------------------------------------------------------------------

export const useGetAiCandidateMeal = (
  aiCandidateMealId: string | null | undefined,
) => {
  return useQuery({
    queryKey: nutritionaiKeys.getAiCandidateMeal(aiCandidateMealId),
    queryFn: () => nutritionaiService.getAiCandidateMeal(aiCandidateMealId!),
    enabled: !!aiCandidateMealId,
  });
};

// ---------------------------------------------------------------------------
// listAiCandidateMeals
// ---------------------------------------------------------------------------

export const useListAiCandidateMeals = (
  ...args: Parameters<typeof nutritionaiService.listAiCandidateMeals>
) => {
  return useQuery({
    queryKey: nutritionaiKeys.listAiCandidateMeals(...args),
    queryFn: () => nutritionaiService.listAiCandidateMeals(...args),
  });
};

// ---------------------------------------------------------------------------
// updateAiCandidateLine
// ---------------------------------------------------------------------------

export const useUpdateAiCandidateLine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      aiCandidateLineId,
      data,
    }: {
      aiCandidateLineId: string;
      data: UpdateAiCandidateLineInput;
    }) => nutritionaiService.updateAiCandidateLine(aiCandidateLineId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nutritionaiKeys.all() });
    },
  });
};

// ---------------------------------------------------------------------------
// rejectCandidateMeal
// ---------------------------------------------------------------------------

export const useRejectCandidateMeal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (aiCandidateMealId: string) =>
      nutritionaiService.rejectCandidateMeal(aiCandidateMealId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nutritionaiKeys.all() });
    },
  });
};

// ---------------------------------------------------------------------------
// getAiGuidanceNote
// ---------------------------------------------------------------------------

export const useGetAiGuidanceNote = (
  aiGuidanceNoteId: string | null | undefined,
) => {
  return useQuery({
    queryKey: nutritionaiKeys.getAiGuidanceNote(aiGuidanceNoteId),
    queryFn: () => nutritionaiService.getAiGuidanceNote(aiGuidanceNoteId!),
    enabled: !!aiGuidanceNoteId,
  });
};

// ---------------------------------------------------------------------------
// listAiGuidanceNotes
// ---------------------------------------------------------------------------

export const useListAiGuidanceNotes = (
  ...args: Parameters<typeof nutritionaiService.listAiGuidanceNotes>
) => {
  return useQuery({
    queryKey: nutritionaiKeys.listAiGuidanceNotes(...args),
    queryFn: () => nutritionaiService.listAiGuidanceNotes(...args),
  });
};
