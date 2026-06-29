/**
 * Invitationcenter service API
 * Auto-generated from project definition — DO NOT EDIT.
 *
 * AI agents: READ-ONLY. This file is overwritten on every codegen run.
 * Add custom invitationcenter services as NEW files in this folder
 * (e.g. `invitationcenter-helpers.ts`) — any file whose name doesn't match
 * Genesis's generated set survives rebuilds.
 */

import { invitationcenterApi } from "@/lib/service-client";

import type {
  InvitationcenterInviteLinkResponse,
  MindbricksUpdateEnvelope,
  InvitationcenterInviteLinkListResponse,
  InvitationcenterInviteAuditListResponse,
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

export type CreateInviteLinkInput = {
  invitedEmail?: string;

  usageMode: "singleUse" | "limitedUse";

  usageLimit?: number;

  expiresAt?: string;
};

export type RevokeInviteLinkInput = {
  eventNote?: string;
};

export type ValidateInviteCodeInput = {
  inviteCode: string;
};

export type ConsumeInviteLinkInput = {
  registeredUserId: string;

  relatedEmail?: string;
};

export const invitationcenterService = {
  /**
   * createInviteLink — Creates a new invite link with a generated unique code. Restricted to admins. Th
   * POST /v1/invite-links
   */
  createInviteLink: async (
    data: CreateInviteLinkInput,
  ): Promise<InvitationcenterInviteLinkResponse> => {
    return invitationcenterApi.post<InvitationcenterInviteLinkResponse>(
      "v1/invite-links",
      data,
    );
  },

  /**
   * activateInviteLink — Transitions an invite link from 'draft' to 'active' state, making it usable for
   * PATCH /v1/invite-links/:inviteLinkId/activate
   */
  activateInviteLink: async (
    inviteLinkId: string,
  ): Promise<InvitationcenterInviteLinkResponse & MindbricksUpdateEnvelope> => {
    return invitationcenterApi.patch<
      InvitationcenterInviteLinkResponse & MindbricksUpdateEnvelope
    >(`v1/invite-links/${inviteLinkId}/activate`);
  },

  /**
   * revokeInviteLink — Revokes an invite link, preventing further use. Only invite links in 'draft' or
   * PATCH /v1/invite-links/:inviteLinkId/revoke
   */
  revokeInviteLink: async (
    inviteLinkId: string,
    data: RevokeInviteLinkInput,
  ): Promise<InvitationcenterInviteLinkResponse> => {
    return invitationcenterApi.patch<InvitationcenterInviteLinkResponse>(
      `v1/invite-links/${inviteLinkId}/revoke`,
      data,
    );
  },

  /**
   * deliverInviteEmail — Triggers email delivery of an active invite link to its intended recipient. Sets
   * POST /v1/invite-links/:inviteLinkId/deliver
   */
  deliverInviteEmail: async (
    inviteLinkId: string,
  ): Promise<InvitationcenterInviteLinkResponse & MindbricksUpdateEnvelope> => {
    return invitationcenterApi.post<
      InvitationcenterInviteLinkResponse & MindbricksUpdateEnvelope
    >(`v1/invite-links/${inviteLinkId}/deliver`);
  },

  /**
   * validateInviteCode — Public endpoint that validates an invite code, increments its usage count, and u
   * POST /v1/invite-links/validate
   */
  validateInviteCode: async (
    data: ValidateInviteCodeInput,
  ): Promise<InvitationcenterInviteLinkResponse> => {
    return invitationcenterApi.post<InvitationcenterInviteLinkResponse>(
      "v1/invite-links/validate",
      data,
    );
  },

  /**
   * consumeInviteLink — Marks an invite link as consumed and records the registered user ID. Called by t
   * PATCH /v1/invite-links/:inviteLinkId/consume
   */
  consumeInviteLink: async (
    inviteLinkId: string,
    data: ConsumeInviteLinkInput,
  ): Promise<InvitationcenterInviteLinkResponse> => {
    return invitationcenterApi.patch<InvitationcenterInviteLinkResponse>(
      `v1/invite-links/${inviteLinkId}/consume`,
      data,
    );
  },

  /**
   * getInviteLinkByCode — Public endpoint to fetch invite link metadata by its unique code. Used by the re
   * GET /v1/invite-links/by-code/:inviteCode
   */
  getInviteLinkByCode: async (
    inviteCode: string,
  ): Promise<InvitationcenterInviteLinkResponse> => {
    return invitationcenterApi.get<InvitationcenterInviteLinkResponse>(
      `v1/invite-links/by-code/${inviteCode}`,
    );
  },

  /**
   * getInviteLink — Admin endpoint to fetch a single invite link by its ID.
   * GET /v1/invite-links/:inviteLinkId
   */
  getInviteLink: async (
    inviteLinkId: string,
  ): Promise<InvitationcenterInviteLinkResponse> => {
    return invitationcenterApi.get<InvitationcenterInviteLinkResponse>(
      `v1/invite-links/${inviteLinkId}`,
    );
  },

  /**
   * listInviteLinks — Admin endpoint to list all invite links with optional filtering by usageMode and
   * GET /v1/invite-links
   */
  listInviteLinks: async (
    params?: {
      usageMode?: "singleUse" | "limitedUse";
      inviteState?:
        | "draft"
        | "active"
        | "exhausted"
        | "revoked"
        | "expired"
        | "consumed";
    } & ListParams,
  ): Promise<InvitationcenterInviteLinkListResponse> => {
    return invitationcenterApi.get<InvitationcenterInviteLinkListResponse>(
      "v1/invite-links",
      { params },
    );
  },

  /**
   * listInviteAudits — Admin endpoint to list audit log entries for invite links. Filterable by inviteL
   * GET /v1/invite-audits
   */
  listInviteAudits: async (
    params?: {
      inviteLinkId?: string;
      eventType?:
        | "created"
        | "activated"
        | "delivered"
        | "validated"
        | "consumed"
        | "revoked"
        | "expired";
    } & ListParams,
  ): Promise<InvitationcenterInviteAuditListResponse> => {
    return invitationcenterApi.get<InvitationcenterInviteAuditListResponse>(
      "v1/invite-audits",
      { params },
    );
  },
};

export default invitationcenterService;
