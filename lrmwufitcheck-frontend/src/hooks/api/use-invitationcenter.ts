/**
 * React Query hooks for Invitationcenter service
 * Auto-generated from project definition — DO NOT EDIT.
 *
 * AI agents: READ-ONLY. This file is overwritten on every codegen run.
 * Add custom invitationcenter hooks as NEW files in this folder (e.g.
 * `use-invitationcenter-helpers.ts`) — any file whose name doesn't match
 * Genesis's generated set survives rebuilds.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { invitationcenterService } from "@/services/api/invitationcenter-api";

import type {
  CreateInviteLinkInput,
  RevokeInviteLinkInput,
  ValidateInviteCodeInput,
  ConsumeInviteLinkInput,
} from "@/services/api/invitationcenter-api";

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const invitationcenterKeys = {
  all: () => ["invitationcenter"] as const,

  createInviteLink: (...args: unknown[]) =>
    [...invitationcenterKeys.all(), "createInviteLink", ...args] as const,

  activateInviteLink: (...args: unknown[]) =>
    [...invitationcenterKeys.all(), "activateInviteLink", ...args] as const,

  revokeInviteLink: (...args: unknown[]) =>
    [...invitationcenterKeys.all(), "revokeInviteLink", ...args] as const,

  deliverInviteEmail: (...args: unknown[]) =>
    [...invitationcenterKeys.all(), "deliverInviteEmail", ...args] as const,

  validateInviteCode: (...args: unknown[]) =>
    [...invitationcenterKeys.all(), "validateInviteCode", ...args] as const,

  consumeInviteLink: (...args: unknown[]) =>
    [...invitationcenterKeys.all(), "consumeInviteLink", ...args] as const,

  getInviteLinkByCode: (...args: unknown[]) =>
    [...invitationcenterKeys.all(), "getInviteLinkByCode", ...args] as const,

  getInviteLink: (...args: unknown[]) =>
    [...invitationcenterKeys.all(), "getInviteLink", ...args] as const,

  listInviteLinks: (...args: unknown[]) =>
    [...invitationcenterKeys.all(), "listInviteLinks", ...args] as const,

  listInviteAudits: (...args: unknown[]) =>
    [...invitationcenterKeys.all(), "listInviteAudits", ...args] as const,
};

// ---------------------------------------------------------------------------
// createInviteLink
// ---------------------------------------------------------------------------

export const useCreateInviteLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInviteLinkInput) =>
      invitationcenterService.createInviteLink(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationcenterKeys.all() });
    },
  });
};

// ---------------------------------------------------------------------------
// activateInviteLink
// ---------------------------------------------------------------------------

export const useActivateInviteLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteLinkId: string) =>
      invitationcenterService.activateInviteLink(inviteLinkId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationcenterKeys.all() });
    },
  });
};

// ---------------------------------------------------------------------------
// revokeInviteLink
// ---------------------------------------------------------------------------

export const useRevokeInviteLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      inviteLinkId,
      data,
    }: {
      inviteLinkId: string;
      data: RevokeInviteLinkInput;
    }) => invitationcenterService.revokeInviteLink(inviteLinkId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationcenterKeys.all() });
    },
  });
};

// ---------------------------------------------------------------------------
// deliverInviteEmail
// ---------------------------------------------------------------------------

export const useDeliverInviteEmail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteLinkId: string) =>
      invitationcenterService.deliverInviteEmail(inviteLinkId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationcenterKeys.all() });
    },
  });
};

// ---------------------------------------------------------------------------
// validateInviteCode
// ---------------------------------------------------------------------------

export const useValidateInviteCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ValidateInviteCodeInput) =>
      invitationcenterService.validateInviteCode(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationcenterKeys.all() });
    },
  });
};

// ---------------------------------------------------------------------------
// consumeInviteLink
// ---------------------------------------------------------------------------

export const useConsumeInviteLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      inviteLinkId,
      data,
    }: {
      inviteLinkId: string;
      data: ConsumeInviteLinkInput;
    }) => invitationcenterService.consumeInviteLink(inviteLinkId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationcenterKeys.all() });
    },
  });
};

// ---------------------------------------------------------------------------
// getInviteLinkByCode
// ---------------------------------------------------------------------------

export const useGetInviteLinkByCode = (
  inviteCode: string | null | undefined,
) => {
  return useQuery({
    queryKey: invitationcenterKeys.getInviteLinkByCode(inviteCode),
    queryFn: () => invitationcenterService.getInviteLinkByCode(inviteCode!),
    enabled: !!inviteCode,
  });
};

// ---------------------------------------------------------------------------
// getInviteLink
// ---------------------------------------------------------------------------

export const useGetInviteLink = (inviteLinkId: string | null | undefined) => {
  return useQuery({
    queryKey: invitationcenterKeys.getInviteLink(inviteLinkId),
    queryFn: () => invitationcenterService.getInviteLink(inviteLinkId!),
    enabled: !!inviteLinkId,
  });
};

// ---------------------------------------------------------------------------
// listInviteLinks
// ---------------------------------------------------------------------------

export const useListInviteLinks = (
  ...args: Parameters<typeof invitationcenterService.listInviteLinks>
) => {
  return useQuery({
    queryKey: invitationcenterKeys.listInviteLinks(...args),
    queryFn: () => invitationcenterService.listInviteLinks(...args),
  });
};

// ---------------------------------------------------------------------------
// listInviteAudits
// ---------------------------------------------------------------------------

export const useListInviteAudits = (
  ...args: Parameters<typeof invitationcenterService.listInviteAudits>
) => {
  return useQuery({
    queryKey: invitationcenterKeys.listInviteAudits(...args),
    queryFn: () => invitationcenterService.listInviteAudits(...args),
  });
};
