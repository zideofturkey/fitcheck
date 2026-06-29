/**
 * React Query hooks for Agenthub service
 * Auto-generated from project definition — DO NOT EDIT.
 *
 * AI agents: READ-ONLY. This file is overwritten on every codegen run.
 * Add custom agenthub hooks as NEW files in this folder (e.g.
 * `use-agenthub-helpers.ts`) — any file whose name doesn't match
 * Genesis's generated set survives rebuilds.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { agenthubService } from "@/services/api/agenthub-api";

import type {
  CreateAgentOverrideInput,
  UpdateAgentOverrideInput,
} from "@/services/api/agenthub-api";

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const agenthubKeys = {
  all: () => ["agenthub"] as const,

  getAgentOverride: (...args: unknown[]) =>
    [...agenthubKeys.all(), "getAgentOverride", ...args] as const,

  listAgentOverrides: (...args: unknown[]) =>
    [...agenthubKeys.all(), "listAgentOverrides", ...args] as const,

  createAgentOverride: (...args: unknown[]) =>
    [...agenthubKeys.all(), "createAgentOverride", ...args] as const,

  updateAgentOverride: (...args: unknown[]) =>
    [...agenthubKeys.all(), "updateAgentOverride", ...args] as const,

  deleteAgentOverride: (...args: unknown[]) =>
    [...agenthubKeys.all(), "deleteAgentOverride", ...args] as const,

  listToolCatalog: (...args: unknown[]) =>
    [...agenthubKeys.all(), "listToolCatalog", ...args] as const,

  getToolCatalogEntry: (...args: unknown[]) =>
    [...agenthubKeys.all(), "getToolCatalogEntry", ...args] as const,

  listAgentExecutions: (...args: unknown[]) =>
    [...agenthubKeys.all(), "listAgentExecutions", ...args] as const,

  getAgentExecution: (...args: unknown[]) =>
    [...agenthubKeys.all(), "getAgentExecution", ...args] as const,

  listAgentChats: (...args: unknown[]) =>
    [...agenthubKeys.all(), "listAgentChats", ...args] as const,

  getAgentChatMessages: (...args: unknown[]) =>
    [...agenthubKeys.all(), "getAgentChatMessages", ...args] as const,
};

// ---------------------------------------------------------------------------
// getAgentOverride
// ---------------------------------------------------------------------------

export const useGetAgentOverride = (
  sys_agentOverrideId: string | null | undefined,
) => {
  return useQuery({
    queryKey: agenthubKeys.getAgentOverride(sys_agentOverrideId),
    queryFn: () => agenthubService.getAgentOverride(sys_agentOverrideId!),
    enabled: !!sys_agentOverrideId,
  });
};

// ---------------------------------------------------------------------------
// listAgentOverrides
// ---------------------------------------------------------------------------

export const useListAgentOverrides = (
  ...args: Parameters<typeof agenthubService.listAgentOverrides>
) => {
  return useQuery({
    queryKey: agenthubKeys.listAgentOverrides(...args),
    queryFn: () => agenthubService.listAgentOverrides(...args),
  });
};

// ---------------------------------------------------------------------------
// createAgentOverride
// ---------------------------------------------------------------------------

export const useCreateAgentOverride = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAgentOverrideInput) =>
      agenthubService.createAgentOverride(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agenthubKeys.all() });
    },
  });
};

// ---------------------------------------------------------------------------
// updateAgentOverride
// ---------------------------------------------------------------------------

export const useUpdateAgentOverride = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sys_agentOverrideId,
      data,
    }: {
      sys_agentOverrideId: string;
      data: UpdateAgentOverrideInput;
    }) => agenthubService.updateAgentOverride(sys_agentOverrideId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agenthubKeys.all() });
    },
  });
};

// ---------------------------------------------------------------------------
// deleteAgentOverride
// ---------------------------------------------------------------------------

export const useDeleteAgentOverride = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sys_agentOverrideId: string) =>
      agenthubService.deleteAgentOverride(sys_agentOverrideId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agenthubKeys.all() });
    },
  });
};

// ---------------------------------------------------------------------------
// listToolCatalog
// ---------------------------------------------------------------------------

export const useListToolCatalog = (
  ...args: Parameters<typeof agenthubService.listToolCatalog>
) => {
  return useQuery({
    queryKey: agenthubKeys.listToolCatalog(...args),
    queryFn: () => agenthubService.listToolCatalog(...args),
  });
};

// ---------------------------------------------------------------------------
// getToolCatalogEntry
// ---------------------------------------------------------------------------

export const useGetToolCatalogEntry = (
  sys_toolCatalogId: string | null | undefined,
) => {
  return useQuery({
    queryKey: agenthubKeys.getToolCatalogEntry(sys_toolCatalogId),
    queryFn: () => agenthubService.getToolCatalogEntry(sys_toolCatalogId!),
    enabled: !!sys_toolCatalogId,
  });
};

// ---------------------------------------------------------------------------
// listAgentExecutions
// ---------------------------------------------------------------------------

export const useListAgentExecutions = (
  ...args: Parameters<typeof agenthubService.listAgentExecutions>
) => {
  return useQuery({
    queryKey: agenthubKeys.listAgentExecutions(...args),
    queryFn: () => agenthubService.listAgentExecutions(...args),
  });
};

// ---------------------------------------------------------------------------
// getAgentExecution
// ---------------------------------------------------------------------------

export const useGetAgentExecution = (
  sys_agentExecutionId: string | null | undefined,
) => {
  return useQuery({
    queryKey: agenthubKeys.getAgentExecution(sys_agentExecutionId),
    queryFn: () => agenthubService.getAgentExecution(sys_agentExecutionId!),
    enabled: !!sys_agentExecutionId,
  });
};

// ---------------------------------------------------------------------------
// listAgentChats
// ---------------------------------------------------------------------------

export const useListAgentChats = (
  ...args: Parameters<typeof agenthubService.listAgentChats>
) => {
  return useQuery({
    queryKey: agenthubKeys.listAgentChats(...args),
    queryFn: () => agenthubService.listAgentChats(...args),
  });
};

// ---------------------------------------------------------------------------
// getAgentChatMessages
// ---------------------------------------------------------------------------

export const useGetAgentChatMessages = (
  sys_agentConversationId: string | null | undefined,
) => {
  return useQuery({
    queryKey: agenthubKeys.getAgentChatMessages(sys_agentConversationId),
    queryFn: () =>
      agenthubService.getAgentChatMessages(sys_agentConversationId!),
    enabled: !!sys_agentConversationId,
  });
};
