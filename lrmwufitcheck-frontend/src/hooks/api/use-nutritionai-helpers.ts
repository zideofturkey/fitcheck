/**
 * Custom hooks for nutritionai-helpers.ts — endpoints the generated
 * use-nutritionai.ts hook file doesn't cover.
 */
import { useQuery } from "@tanstack/react-query";
import { nutritionaiHelpers } from "@/services/api/nutritionai-helpers";

export const useListAiCandidateLines = (
  aiCandidateMealId: string | null | undefined,
) => {
  return useQuery({
    queryKey: ["nutritionai", "listAiCandidateLines", aiCandidateMealId],
    queryFn: () =>
      nutritionaiHelpers.listAiCandidateLines({ aiCandidateMealId: aiCandidateMealId! }),
    enabled: !!aiCandidateMealId,
  });
};
