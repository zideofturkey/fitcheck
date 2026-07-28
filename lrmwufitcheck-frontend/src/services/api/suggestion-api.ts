/**
 * Custom service for the suggestion workflow (promoting a private
 * foodItem/dish/presetMeal to global, reviewed by an admin). Plain Express
 * routes, not a Mindbricks Manager - see
 * lrmwufitcheck-nutritionlibrary/src/routes/suggestions.js.
 */
import { nutritionlibraryApi } from "@/lib/service-client";

export type SuggestionEntityType = "foodItem" | "dish" | "presetMeal";
export type SuggestionStatus = "pending" | "approved" | "rejected";

export interface Suggestion {
  id: string;
  userId: string;
  entityType: SuggestionEntityType;
  sourceRecordId: string;
  status: SuggestionStatus;
  reviewNote?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSuggestionInput {
  entityType: SuggestionEntityType;
  sourceRecordId: string;
}

export interface SuggestionListResponse {
  status: string;
  count: number;
  suggestions: Suggestion[];
}

export interface SuggestionResponse {
  status: string;
  suggestion: Suggestion;
  globalCopy?: unknown;
  copiedLineCount?: number;
}

export const suggestionService = {
  /** POST /v1/suggestions */
  create: async (data: CreateSuggestionInput): Promise<SuggestionResponse> => {
    return nutritionlibraryApi.post<SuggestionResponse>(
      "v1/suggestions",
      data,
    );
  },

  /** GET /v1/suggestions?status=... */
  list: async (status?: string): Promise<SuggestionListResponse> => {
    return nutritionlibraryApi.get<SuggestionListResponse>("v1/suggestions", {
      params: status ? { status } : undefined,
    });
  },

  /** POST /v1/suggestions/:id/approve */
  approve: async (
    id: string,
    reviewNote?: string,
  ): Promise<SuggestionResponse> => {
    return nutritionlibraryApi.post<SuggestionResponse>(
      `v1/suggestions/${id}/approve`,
      reviewNote ? { reviewNote } : {},
    );
  },

  /** POST /v1/suggestions/:id/reject */
  reject: async (
    id: string,
    reviewNote?: string,
  ): Promise<SuggestionResponse> => {
    return nutritionlibraryApi.post<SuggestionResponse>(
      `v1/suggestions/${id}/reject`,
      reviewNote ? { reviewNote } : {},
    );
  },
};

export default suggestionService;
