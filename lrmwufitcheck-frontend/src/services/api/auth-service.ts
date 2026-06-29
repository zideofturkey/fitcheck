/**
 * Authentication service
 * Handles login, logout, registration, profile, and verification.
 * Auto-generated from project definition — DO NOT EDIT.
 *
 * AI agents: READ-ONLY. This file is overwritten on every codegen run.
 * Add custom auth helpers as NEW files in this folder (e.g.
 * `auth-helpers.ts`) — any file whose name doesn't match Genesis's
 * generated set survives rebuilds.
 */

import { authApi } from "@/lib/service-client";
import type {
  SessionResponse,
  CurrentUserResponse,
  LogoutResponse,
  UserResponse,
  UsersResponse,
  UserSessionRecord,
  UserHistoryEntry,
  RegisterResponse,
  MindbricksResponse,
  BucketUploadResponse,
  VerificationStartResponse,
  VerificationCompleteResponse,
  MindbricksUpdateEnvelope,
} from "@/types/api";

type UserUpdateResponse = UserResponse & MindbricksUpdateEnvelope;
import { setAccessToken, clearAccessToken } from "@/lib/token-store";

export const authService = {
  /**
   * Get current authenticated user session.
   * GET /currentuser
   *
   * The endpoint returns user/session fields **flat** (not under `user`) plus
   * bucket/event tokens — see `CurrentUserResponse`. When no session is active
   * the backend replies HTTP 401 with `{ status: "ERR", message: "No login found" }`,
   * which is NOT the standard MindbricksError envelope. We catch that one case
   * and resolve to `null` so React Query gets clean `data: null` instead of an
   * error state on first load.
   */
  getCurrentUser: async (): Promise<CurrentUserResponse | null> => {
    try {
      return await authApi.get<CurrentUserResponse>("currentuser");
    } catch (err) {
      const e = err as { httpStatus?: number; message?: string };
      if (e?.httpStatus === 401 || e?.message === "No login found") return null;
      throw err;
    }
  },

  /**
   * Get a user by ID
   * GET /v1/users/:userId
   */
  getUser: async (userId: string): Promise<UserResponse> => {
    return authApi.get<UserResponse>(`v1/users/${userId}`);
  },

  /**
   * List users (admin)
   * GET /v1/users
   */
  listUsers: async (params?: {
    email?: string;
    fullname?: string;
    roleId?: string;
    pageNumber?: number;
    pageRowCount?: number;
    getJoins?: boolean;
  }): Promise<UsersResponse> => {
    return authApi.get<UsersResponse>("v1/users", { params });
  },

  /**
   * Search users by keyword
   * GET /v1/searchusers
   */
  searchUsers: async (params: {
    keyword: string;
    roleId?: string;
  }): Promise<UsersResponse> => {
    return authApi.get<UsersResponse>("v1/searchusers", { params });
  },

  /**
   * Login with email/password
   * POST /login
   */
  login: async (credentials: {
    username: string;
    password: string;
  }): Promise<SessionResponse> => {
    const response = await authApi.post<SessionResponse>("login", credentials);
    if (response.accessToken) {
      setAccessToken(response.accessToken);
    }
    return response;
  },

  /**
   * Logout current session.
   * POST /logout — always responds with `{ status: "OK" }`.
   */
  logout: async (): Promise<LogoutResponse> => {
    const response = await authApi.post<LogoutResponse>("logout");
    clearAccessToken();
    return response;
  },

  /**
   * Register a new user
   * POST /v1/registeruser

   * Note: When email verification is active, no accessToken is returned until verified.

   */
  registerUser: async (data: {}): Promise<RegisterResponse> => {
    const response = await authApi.post<RegisterResponse>(
      "v1/registeruser",
      data,
    );

    return response;
  },

  /**
   * Admin-only — update any user's record.
   * PATCH /v1/users/:userId — requires `superAdmin` role. Regular users
   * updating their own profile must call `updateProfile(...)` instead, which
   * is gated by ownership.
   */
  updateUser: async (
    userId: string,
    data: {
      fullname?: string;
      avatar?: string;
    },
  ): Promise<UserUpdateResponse> => {
    return authApi.patch<UserUpdateResponse>(`v1/users/${userId}`, data);
  },

  /**
   * Update the authenticated user's own profile.
   * PATCH /v1/profile — session-based, no userId needed. The BE resolves
   * the target user from the auth header. Admins editing other users
   * should call `updateUser(userId, data)` instead (different route).
   */
  updateProfile: async (data: {
    fullname?: string;
    avatar?: string;
  }): Promise<UserUpdateResponse> => {
    return authApi.patch<UserUpdateResponse>(`v1/profile`, data);
  },

  /**
   * Change the authenticated user's own password.
   * PATCH /v1/userpassword — session-based, no userId needed.
   * Admins resetting other users' passwords should call
   * `updateUserPasswordByAdmin(userId, ...)` instead.
   */
  updateUserPassword: async (data: {
    oldPassword: string;
    newPassword: string;
  }): Promise<UserUpdateResponse> => {
    return authApi.patch<UserUpdateResponse>(`v1/userpassword`, data);
  },

  /**
   * Archive (soft-delete) the authenticated user's own profile.
   * DELETE /v1/archiveprofile — session-based, no userId needed. Admins
   * removing other users should call `deleteUser(userId)` instead.
   */
  archiveProfile: async (): Promise<UserResponse> => {
    return authApi.delete<UserResponse>(`v1/archiveprofile`);
  },

  /**
   * Create a user (admin only)
   * POST /v1/users
   */
  createUser: async (data: {
    email: string;
    password: string;
    fullname: string;
    avatar?: string;
  }): Promise<UserResponse> => {
    return authApi.post<UserResponse>("v1/users", data);
  },

  /**
   * Delete a user (admin only)
   * DELETE /v1/users/:userId
   */
  deleteUser: async (userId: string): Promise<UserResponse> => {
    return authApi.delete<UserResponse>(`v1/users/${userId}`);
  },

  /**
   * Update user role (admin only)
   * PATCH /v1/userrole/:userId
   */
  updateUserRole: async (
    userId: string,
    data: { roleId: string },
  ): Promise<UserUpdateResponse> => {
    return authApi.patch<UserUpdateResponse>(`v1/userrole/${userId}`, data);
  },

  /**
   * Reset user password by admin (no old password required)
   * PATCH /v1/userpasswordbyadmin/:userId
   */
  updateUserPasswordByAdmin: async (
    userId: string,
    data: { password: string },
  ): Promise<UserUpdateResponse> => {
    return authApi.patch<UserUpdateResponse>(
      `v1/userpasswordbyadmin/${userId}`,
      data,
    );
  },

  /**
   * Get brief user info (public, limited fields)
   * GET /v1/briefuser/:userId
   */
  getBriefUser: async (userId: string): Promise<UserResponse> => {
    return authApi.get<UserResponse>(`v1/briefuser/${userId}`);
  },

  /**
   * Start email verification
   * POST /verification-services/email-verification/start
   */
  startEmailVerification: async (
    email: string,
  ): Promise<VerificationStartResponse> => {
    return authApi.post<VerificationStartResponse>(
      "verification-services/email-verification/start",
      { email },
    );
  },

  /**
   * Complete email verification
   * POST /verification-services/email-verification/complete
   */
  completeEmailVerification: async (
    email: string,
    secretCode: string,
  ): Promise<VerificationCompleteResponse> => {
    return authApi.post<VerificationCompleteResponse>(
      "verification-services/email-verification/complete",
      { email, secretCode },
    );
  },

  /**
   * Start mobile verification
   * POST /verification-services/mobile-verification/start
   */
  startMobileVerification: async (
    email: string,
  ): Promise<VerificationStartResponse> => {
    return authApi.post<VerificationStartResponse>(
      "verification-services/mobile-verification/start",
      { email },
    );
  },

  /**
   * Complete mobile verification
   * POST /verification-services/mobile-verification/complete
   */
  completeMobileVerification: async (
    email: string,
    secretCode: string,
  ): Promise<VerificationCompleteResponse> => {
    return authApi.post<VerificationCompleteResponse>(
      "verification-services/mobile-verification/complete",
      { email, secretCode },
    );
  },

  /**
   * Start password reset by email
   * POST /verification-services/password-reset-by-email/start
   */
  startPasswordResetByEmail: async (
    email: string,
  ): Promise<VerificationStartResponse> => {
    return authApi.post<VerificationStartResponse>(
      "verification-services/password-reset-by-email/start",
      { email },
    );
  },

  /**
   * Complete password reset by email
   * POST /verification-services/password-reset-by-email/complete
   */
  completePasswordResetByEmail: async (
    email: string,
    secretCode: string,
    password: string,
  ): Promise<VerificationCompleteResponse> => {
    return authApi.post<VerificationCompleteResponse>(
      "verification-services/password-reset-by-email/complete",
      {
        email,
        secretCode,
        password,
      },
    );
  },

  /**
   * Start password reset by mobile
   * POST /verification-services/password-reset-by-mobile/start
   */
  startPasswordResetByMobile: async (
    email: string,
  ): Promise<VerificationStartResponse> => {
    return authApi.post<VerificationStartResponse>(
      "verification-services/password-reset-by-mobile/start",
      { email },
    );
  },

  /**
   * Complete password reset by mobile
   * POST /verification-services/password-reset-by-mobile/complete
   */
  completePasswordResetByMobile: async (
    email: string,
    secretCode: string,
    password: string,
  ): Promise<VerificationCompleteResponse> => {
    return authApi.post<VerificationCompleteResponse>(
      "verification-services/password-reset-by-mobile/complete",
      {
        email,
        secretCode,
        password,
      },
    );
  },

  /**
   * Start email 2-factor verification (called automatically when login response indicates 2FA is required)
   * POST /verification-services/email-2factor-verification/start
   */
  startEmail2Factor: async (): Promise<VerificationStartResponse> => {
    return authApi.post<VerificationStartResponse>(
      "verification-services/email-2factor-verification/start",
    );
  },

  /**
   * Complete email 2-factor verification with the code received by email
   * POST /verification-services/email-2factor-verification/complete
   */
  completeEmail2Factor: async (
    secretCode: string,
  ): Promise<VerificationCompleteResponse> => {
    return authApi.post<VerificationCompleteResponse>(
      "verification-services/email-2factor-verification/complete",
      { secretCode },
    );
  },

  /**
   * Start mobile 2-factor verification (called automatically when login response indicates 2FA is required)
   * POST /verification-services/mobile-2factor-verification/start
   */
  startMobile2Factor: async (): Promise<VerificationStartResponse> => {
    return authApi.post<VerificationStartResponse>(
      "verification-services/mobile-2factor-verification/start",
    );
  },

  /**
   * Complete mobile 2-factor verification with the code received by SMS
   * POST /verification-services/mobile-2factor-verification/complete
   */
  completeMobile2Factor: async (
    secretCode: string,
  ): Promise<VerificationCompleteResponse> => {
    return authApi.post<VerificationCompleteResponse>(
      "verification-services/mobile-2factor-verification/complete",
      { secretCode },
    );
  },

  // ---------------------------------------------------------------------------
  // Session management
  // ---------------------------------------------------------------------------

  /**
   * Re-issue an access token from the current session (used to refresh after profile/role change)
   * GET /relogin
   */
  relogin: async (): Promise<SessionResponse> => {
    const response = await authApi.get<SessionResponse>("relogin");
    if (response.accessToken) {
      setAccessToken(response.accessToken);
    }
    return response;
  },

  /**
   * List active sessions (defaults to current user; admin may pass a userId).
   * GET /getusersessions — returns a bare `UserSessionRecord[]`. The session
   * that owns the current request is marked with `currentOne: true`.
   */
  getUserSessions: async (userId?: string): Promise<UserSessionRecord[]> => {
    return authApi.get<UserSessionRecord[]>(
      "getusersessions",
      userId ? { params: { userId } } : undefined,
    );
  },

  /**
   * List login history (defaults to current user; admin may pass a userId).
   * GET /getuserhistory — returns a bare `UserHistoryEntry[]`.
   */
  getUserHistory: async (userId?: string): Promise<UserHistoryEntry[]> => {
    return authApi.get<UserHistoryEntry[]>(
      "getuserhistory",
      userId ? { params: { userId } } : undefined,
    );
  },

  /**
   * Revoke a single session (defaults to current user's session list; admin may pass a userId)
   * DELETE /deleteusersession/:sessionId
   */
  deleteUserSession: async (
    sessionId: string,
    userId?: string,
  ): Promise<MindbricksResponse> => {
    return authApi.delete<MindbricksResponse>(
      `deleteusersession/${sessionId}`,
      undefined,
      userId ? { params: { userId } } : undefined,
    );
  },

  /**
   * Revoke all sessions (defaults to current user; admin may pass a userId; forces re-login)
   * DELETE /deleteallsessions
   */
  deleteAllSessions: async (userId?: string): Promise<MindbricksResponse> => {
    return authApi.delete<MindbricksResponse>(
      "deleteallsessions",
      undefined,
      userId ? { params: { userId } } : undefined,
    );
  },

  // ---------------------------------------------------------------------------
  // Avatar bucket operations
  // ---------------------------------------------------------------------------

  /**
   * Upload user avatar
   * POST /bucket/userAvatars/upload
   */
  uploadUserAvatar: async (file: File): Promise<BucketUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    return authApi.upload<BucketUploadResponse>(
      "bucket/userAvatars/upload",
      formData,
    );
  },

  /**
   * Get user avatar download URL by access key (public, no auth needed)
   */
  getUserAvatarUrl: (accessKey: string): string => {
    return `${authApi.baseUrl}/bucket/userAvatars/download/key/${accessKey}`;
  },

  /**
   * Get user avatar file metadata
   * GET /v1/userAvatarsFiles/:id
   */
  getUserAvatarFile: async (fileId: string): Promise<MindbricksResponse> => {
    return authApi.get<MindbricksResponse>(`v1/userAvatarsFiles/${fileId}`);
  },

  /**
   * List user avatar files
   * GET /v1/userAvatarsFiles
   */
  listUserAvatarFiles: async (): Promise<MindbricksResponse> => {
    return authApi.get<MindbricksResponse>("v1/userAvatarsFiles");
  },

  /**
   * Delete user avatar file
   * DELETE /v1/userAvatarsFiles/:id
   */
  deleteUserAvatar: async (fileId: string): Promise<MindbricksResponse> => {
    return authApi.delete<MindbricksResponse>(`v1/userAvatarsFiles/${fileId}`);
  },
};

export default authService;
