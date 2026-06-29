/**
 * Custom helpers for the Nutritionai service.
 *
 * The generated `nutritionai-api.ts` does not expose a list endpoint for
 * candidate lines, but the backend supports `GET /v1/ai-candidate-lines`.
 * This helper wraps that endpoint so the AI-assisted food creation flow can
 * read the parsed candidate lines after a `parseMeal` call.
 */
import { nutritionaiApi } from "@/lib/service-client";
import type { NutritionaiAiCandidateLineListResponse } from "@/types/api";
import type { ListParams } from "@/services/api/nutritionai-api";

export const nutritionaiHelpers = {
  /**
   * listAiCandidateLines — Lists candidate food lines for a candidate meal.
   * GET /v1/ai-candidate-lines?aiCandidateMealId=<id>
   */
  listAiCandidateLines: async (
    params?: { aiCandidateMealId?: string } & ListParams,
  ): Promise<NutritionaiAiCandidateLineListResponse> => {
    return nutritionaiApi.get<NutritionaiAiCandidateLineListResponse>(
      "v1/ai-candidate-lines",
      { params },
    );
  },
};

export default nutritionaiHelpers;
