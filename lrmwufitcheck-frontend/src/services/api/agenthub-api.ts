/**
 * Agenthub service API
 * Auto-generated from project definition — DO NOT EDIT.
 *
 * AI agents: READ-ONLY. This file is overwritten on every codegen run.
 * Add custom agenthub services as NEW files in this folder
 * (e.g. `agenthub-helpers.ts`) — any file whose name doesn't match
 * Genesis's generated set survives rebuilds.
 */

import { agenthubApi } from "@/lib/service-client";

import type {
  AgenthubSys_agentOverrideResponse,
  AgenthubSys_agentOverrideListResponse,
  AgenthubSys_toolCatalogListResponse,
  AgenthubSys_toolCatalogResponse,
  AgenthubSys_agentExecutionListResponse,
  AgenthubSys_agentExecutionResponse,
  AgenthubSys_agentConversationListResponse,
  AgenthubSys_agentConversationResponse,
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

export type CreateAgentOverrideInput = {
  agentName: string;

  provider?: string;

  model?: string;

  systemPrompt?: string;

  temperature?: number;

  maxTokens?: number;

  responseFormat?: string;

  selectedTools?: Record<string, unknown>;

  guardrails?: Record<string, unknown>;

  enabled?: boolean;
};

export type UpdateAgentOverrideInput = {
  provider?: string;

  model?: string;

  systemPrompt?: string;

  temperature?: number;

  maxTokens?: number;

  responseFormat?: string;

  selectedTools?: Record<string, unknown>;

  guardrails?: Record<string, unknown>;

  enabled?: boolean;
};

export const agenthubService = {
  /**
   * getAgentOverride
   * GET /v1/agentoverride/:sys_agentOverrideId
   */
  getAgentOverride: async (
    sys_agentOverrideId: string,
  ): Promise<AgenthubSys_agentOverrideResponse> => {
    return agenthubApi.get<AgenthubSys_agentOverrideResponse>(
      `v1/agentoverride/${sys_agentOverrideId}`,
    );
  },

  /**
   * listAgentOverrides
   * GET /v1/agentoverrides
   */
  listAgentOverrides: async (
    params?: ListParams,
  ): Promise<AgenthubSys_agentOverrideListResponse> => {
    return agenthubApi.get<AgenthubSys_agentOverrideListResponse>(
      "v1/agentoverrides",
      { params },
    );
  },

  /**
   * createAgentOverride
   * POST /v1/agentoverride
   */
  createAgentOverride: async (
    data: CreateAgentOverrideInput,
  ): Promise<AgenthubSys_agentOverrideResponse> => {
    return agenthubApi.post<AgenthubSys_agentOverrideResponse>(
      "v1/agentoverride",
      data,
    );
  },

  /**
   * updateAgentOverride
   * PATCH /v1/agentoverride/:sys_agentOverrideId
   */
  updateAgentOverride: async (
    sys_agentOverrideId: string,
    data: UpdateAgentOverrideInput,
  ): Promise<AgenthubSys_agentOverrideResponse> => {
    return agenthubApi.patch<AgenthubSys_agentOverrideResponse>(
      `v1/agentoverride/${sys_agentOverrideId}`,
      data,
    );
  },

  /**
   * deleteAgentOverride
   * DELETE /v1/agentoverride/:sys_agentOverrideId
   */
  deleteAgentOverride: async (
    sys_agentOverrideId: string,
  ): Promise<AgenthubSys_agentOverrideResponse> => {
    return agenthubApi.delete<AgenthubSys_agentOverrideResponse>(
      `v1/agentoverride/${sys_agentOverrideId}`,
    );
  },

  /**
   * listToolCatalog
   * GET /v1/toolcatalog
   */
  listToolCatalog: async (
    params?: { serviceName?: string } & ListParams,
  ): Promise<AgenthubSys_toolCatalogListResponse> => {
    return agenthubApi.get<AgenthubSys_toolCatalogListResponse>(
      "v1/toolcatalog",
      { params },
    );
  },

  /**
   * getToolCatalogEntry
   * GET /v1/toolcatalogentry/:sys_toolCatalogId
   */
  getToolCatalogEntry: async (
    sys_toolCatalogId: string,
  ): Promise<AgenthubSys_toolCatalogResponse> => {
    return agenthubApi.get<AgenthubSys_toolCatalogResponse>(
      `v1/toolcatalogentry/${sys_toolCatalogId}`,
    );
  },

  /**
   * listAgentExecutions
   * GET /v1/agentexecutions
   */
  listAgentExecutions: async (
    params?: {
      agentName?: string;
      agentType?: "design" | "dynamic";
      source?: "rest" | "sse" | "kafka" | "agent";
      userId?: string;
      status?: "success" | "error" | "timeout";
    } & ListParams,
  ): Promise<AgenthubSys_agentExecutionListResponse> => {
    return agenthubApi.get<AgenthubSys_agentExecutionListResponse>(
      "v1/agentexecutions",
      { params },
    );
  },

  /**
   * getAgentExecution
   * GET /v1/agentexecution/:sys_agentExecutionId
   */
  getAgentExecution: async (
    sys_agentExecutionId: string,
  ): Promise<AgenthubSys_agentExecutionResponse> => {
    return agenthubApi.get<AgenthubSys_agentExecutionResponse>(
      `v1/agentexecution/${sys_agentExecutionId}`,
    );
  },

  /**
   * listAgentChats
   * GET /v1/agentchats
   */
  listAgentChats: async (
    params?: { agentName?: string; userId?: string } & ListParams,
  ): Promise<AgenthubSys_agentConversationListResponse> => {
    return agenthubApi.get<AgenthubSys_agentConversationListResponse>(
      "v1/agentchats",
      { params },
    );
  },

  /**
   * getAgentChatMessages
   * GET /v1/agentchatmessages/:sys_agentConversationId
   */
  getAgentChatMessages: async (
    sys_agentConversationId: string,
  ): Promise<AgenthubSys_agentConversationResponse> => {
    return agenthubApi.get<AgenthubSys_agentConversationResponse>(
      `v1/agentchatmessages/${sys_agentConversationId}`,
    );
  },
};

export default agenthubService;
