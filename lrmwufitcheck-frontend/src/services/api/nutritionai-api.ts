/**
 * Nutritionai service API
 * Auto-generated from project definition — DO NOT EDIT.
 *
 * AI agents: READ-ONLY. This file is overwritten on every codegen run.
 * Add custom nutritionai services as NEW files in this folder
 * (e.g. `nutritionai-helpers.ts`) — any file whose name doesn't match
 * Genesis's generated set survives rebuilds.
 */

import { nutritionaiApi } from "@/lib/service-client";

import type {
  NutritionaiAiSessionResponse,
  NutritionaiAiCandidateMealResponse,
  NutritionaiAiSessionListResponse,
  NutritionaiAiCandidateMealListResponse,
  NutritionaiAiCandidateLineResponse,
  MindbricksUpdateEnvelope,
  NutritionaiAiGuidanceNoteResponse,
  NutritionaiAiGuidanceNoteListResponse,
} from "@/types/api";

// Universal transport flags read off req.query by requestIdStamper on every
// request, regardless of CRUD or method. Intersected onto non-paginated
// GETs with declared query params so callers can pass `getJoins` and any
// dynamic filter key without TS errors.
export type RequestParams = {
  getJoins?: boolean;
  [key: string]: string | number | boolean | undefined;
};

// Paginated-list query params. Adds pageNumber/pageRowCount on top of
// RequestParams — only the list codepath actually consumes pagination,
// so it lives here rather than on the base. Sorting on standard list
// APIs is hardcoded at codegen from `listOptions.listSortBy` — request-
// side `sortBy` / `sortOrder` are silently dropped by the backend.
// Full-text `q` is a BFF DataView concept only (see `BffListParams`).
export type ListParams = RequestParams & {
  pageNumber?: number;
  pageRowCount?: number;
};

export type ParseMealInput = {
  inputText: string;

  proposedMealDate?: string;

  proposedMealTime?: string;

  proposedSlotName?: string;
};

export type ConfirmCandidateMealInput = {
  proposedMealDate?: string;

  proposedMealTime?: string;

  proposedSlotName?: string;

  lineAdjustments?: Record<string, unknown>[];
};

export type AskNutritionQuestionInput = {
  inputText: string;

  contextRange?: string;
};

export type UpdateAiCandidateLineInput = {
  estimatedGrams?: number;

  saveAsFood?: boolean;

  detectedFoodName?: string;
};

export const nutritionaiService = {
  /**
   * parseMeal — Accepts a natural-language Turkish meal description, creates an aiSession record
   * POST /v1/ai-sessions/parse-meal
   */
  parseMeal: async (
    data: ParseMealInput,
  ): Promise<NutritionaiAiSessionResponse> => {
    return nutritionaiApi.post<NutritionaiAiSessionResponse>(
      "v1/ai-sessions/parse-meal",
      data,
    );
  },

  /**
   * confirmCandidateMeal — Confirms a candidate meal after user review — applies optional line adjustments,
   * PATCH /v1/ai-candidate-meals/:aiCandidateMealId/confirm
   */
  confirmCandidateMeal: async (
    aiCandidateMealId: string,
    data: ConfirmCandidateMealInput,
  ): Promise<NutritionaiAiCandidateMealResponse> => {
    return nutritionaiApi.patch<NutritionaiAiCandidateMealResponse>(
      `v1/ai-candidate-meals/${aiCandidateMealId}/confirm`,
      data,
    );
  },

  /**
   * askNutritionQuestion — Creates an aiSession for nutrition guidance, fetches macro targets and meal cont
   * POST /v1/ai-sessions/ask
   */
  askNutritionQuestion: async (
    data: AskNutritionQuestionInput,
  ): Promise<NutritionaiAiSessionResponse> => {
    return nutritionaiApi.post<NutritionaiAiSessionResponse>(
      "v1/ai-sessions/ask",
      data,
    );
  },

  /**
   * getAiSession — Retrieves a single AI session by ID, scoped to the authenticated user.
   * GET /v1/ai-sessions/:aiSessionId
   */
  getAiSession: async (
    aiSessionId: string,
  ): Promise<NutritionaiAiSessionResponse> => {
    return nutritionaiApi.get<NutritionaiAiSessionResponse>(
      `v1/ai-sessions/${aiSessionId}`,
    );
  },

  /**
   * listAiSessions — Lists all AI sessions for the authenticated user, ordered by most recent first.
   * GET /v1/ai-sessions
   */
  listAiSessions: async (
    params?: {
      userId?: string;
      sessionType?: "mealParsing" | "nutritionGuidance";
      sessionState?: "pending" | "needsConfirmation" | "completed" | "failed";
    } & ListParams,
  ): Promise<NutritionaiAiSessionListResponse> => {
    return nutritionaiApi.get<NutritionaiAiSessionListResponse>(
      "v1/ai-sessions",
      { params },
    );
  },

  /**
   * getAiCandidateMeal — Retrieves a single candidate meal by ID, scoped to the authenticated user.
   * GET /v1/ai-candidate-meals/:aiCandidateMealId
   */
  getAiCandidateMeal: async (
    aiCandidateMealId: string,
  ): Promise<NutritionaiAiCandidateMealResponse> => {
    return nutritionaiApi.get<NutritionaiAiCandidateMealResponse>(
      `v1/ai-candidate-meals/${aiCandidateMealId}`,
    );
  },

  /**
   * listAiCandidateMeals — Lists candidate meals for the authenticated user.
   * GET /v1/ai-candidate-meals
   */
  listAiCandidateMeals: async (
    params?: {
      userId?: string;
      aiSessionId?: string;
      isConfirmed?: boolean;
      isCommitted?: boolean;
    } & ListParams,
  ): Promise<NutritionaiAiCandidateMealListResponse> => {
    return nutritionaiApi.get<NutritionaiAiCandidateMealListResponse>(
      "v1/ai-candidate-meals",
      { params },
    );
  },

  /**
   * updateAiCandidateLine — Updates a single candidate food line — allows the user to adjust gram amounts, t
   * PATCH /v1/ai-candidate-lines/:aiCandidateLineId
   */
  updateAiCandidateLine: async (
    aiCandidateLineId: string,
    data: UpdateAiCandidateLineInput,
  ): Promise<NutritionaiAiCandidateLineResponse> => {
    return nutritionaiApi.patch<NutritionaiAiCandidateLineResponse>(
      `v1/ai-candidate-lines/${aiCandidateLineId}`,
      data,
    );
  },

  /**
   * rejectCandidateMeal — Rejects a candidate meal, marking it as not confirmed and updating the parent se
   * PATCH /v1/ai-candidate-meals/:aiCandidateMealId/reject
   */
  rejectCandidateMeal: async (
    aiCandidateMealId: string,
  ): Promise<NutritionaiAiCandidateMealResponse & MindbricksUpdateEnvelope> => {
    return nutritionaiApi.patch<
      NutritionaiAiCandidateMealResponse & MindbricksUpdateEnvelope
    >(`v1/ai-candidate-meals/${aiCandidateMealId}/reject`);
  },

  /**
   * getAiGuidanceNote — Retrieves a single AI guidance note by ID, scoped to the authenticated user.
   * GET /v1/ai-guidance-notes/:aiGuidanceNoteId
   */
  getAiGuidanceNote: async (
    aiGuidanceNoteId: string,
  ): Promise<NutritionaiAiGuidanceNoteResponse> => {
    return nutritionaiApi.get<NutritionaiAiGuidanceNoteResponse>(
      `v1/ai-guidance-notes/${aiGuidanceNoteId}`,
    );
  },

  /**
   * listAiGuidanceNotes — Lists all AI guidance notes for the authenticated user.
   * GET /v1/ai-guidance-notes
   */
  listAiGuidanceNotes: async (
    params?: {
      userId?: string;
      questionType?: string;
      contextRange?: string;
    } & ListParams,
  ): Promise<NutritionaiAiGuidanceNoteListResponse> => {
    return nutritionaiApi.get<NutritionaiAiGuidanceNoteListResponse>(
      "v1/ai-guidance-notes",
      { params },
    );
  },
};

export default nutritionaiService;
