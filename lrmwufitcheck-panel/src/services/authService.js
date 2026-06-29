import { authClient } from "./apiClient";

const resolveRoutePath = (routePath, params = {}) =>
  String(routePath || "").replace(/:([a-zA-Z0-9_]+)/g, (_, key) =>
    encodeURIComponent(params[key] ?? ""),
  );

/**
 * Authentication Service
 *
 * Handles all authentication-related API calls.
 */
export const authService = {
  /**
   * Login with credentials
   */
  login: async (email, password) => {
    const response = await authClient.post("/login", {
      username: email,
      password,
    });
    return response.data;
  },

  /**
   * Logout current user
   */
  logout: async () => {
    const response = await authClient.post("/logout");
    return response.data;
  },

  /**
   * Get current user session
   * Note: This returns session data, not the latest user data from DB
   */
  getCurrentUser: async () => {
    const response = await authClient.get("/currentuser");
    return response.data;
  },

  /**
   * Get user by ID (fetches latest data from database)
   * Use this for profile page instead of getCurrentUser
   * @param {string} userId - The user's ID
   */
  getUser: async (userId) => {
    const response = await authClient.get(`/v1/users/${userId}`);
    return response.data;
  },

  /**
   * Update user profile
   * Session-based — the BE resolves the target user from the auth header,
   * no userId argument needed. Admin cross-user edits go through `updateUser`.
   * @param {Object} data - Profile data (fullname, avatar, mobile)
   */
  updateProfile: async (data) => {
    const response = await authClient.patch(`/v1/profile`, data);
    return response.data;
  },

  /**
   * Update password
   * Session-based — the BE resolves the target user from the auth header,
   * no userId argument needed. Admin password reset uses `updateUserPasswordByAdmin`.
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   */
  updatePassword: async (oldPassword, newPassword) => {
    const response = await authClient.patch(`/v1/userpassword`, {
      oldPassword,
      newPassword,
    });
    return response.data;
  },

  /**
   * Archive user profile
   * Session-based — soft-deletes the session user. Marks account as archived;
   * user can restore by logging in within 1 month. Admin removal of another
   * user goes through `deleteUser`.
   */
  archiveProfile: async () => {
    const response = await authClient.delete(`/v1/archiveprofile`);
    return response.data;
  },

  // ============================================
  // Email Verification
  // ============================================

  /**
   * Start email verification
   * Sends a verification code to the user's email
   * @param {string} email - User's email address
   */
  startEmailVerification: async (email) => {
    const response = await authClient.post(
      "/verification-services/email-verification/start",
      {
        email,
      },
    );
    return response.data;
  },

  /**
   * Complete email verification
   * @param {string} email - User's email address
   * @param {string} secretCode - Verification code from email
   */
  completeEmailVerification: async (email, secretCode) => {
    const response = await authClient.post(
      "/verification-services/email-verification/complete",
      {
        email,
        secretCode,
      },
    );
    return response.data;
  },

  // ============================================
  // Mobile Verification
  // ============================================

  /**
   * Start mobile verification
   * Sends a verification code via SMS
   */
  startMobileVerification: async (email) => {
    const response = await authClient.post(
      "/verification-services/mobile-verification/start",
      {
        email,
      },
    );
    return response.data;
  },

  /**
   * Complete mobile verification
   */
  completeMobileVerification: async (email, secretCode) => {
    const response = await authClient.post(
      "/verification-services/mobile-verification/complete",
      {
        email,
        secretCode,
      },
    );
    return response.data;
  },

  // ============================================
  // Password Reset by Email
  // ============================================

  /**
   * Start password reset by email
   * Sends a reset code to the user's email
   * @param {string} email - User's email address
   */
  startPasswordResetByEmail: async (email) => {
    const response = await authClient.post(
      "/verification-services/password-reset-by-email/start",
      {
        email,
      },
    );
    return response.data;
  },

  /**
   * Complete password reset by email
   * @param {string} email - User's email
   * @param {string} secretCode - Verification code
   * @param {string} password - New password
   */
  completePasswordResetByEmail: async (email, secretCode, password) => {
    const response = await authClient.post(
      "/verification-services/password-reset-by-email/complete",
      {
        email,
        secretCode,
        password,
      },
    );
    return response.data;
  },

  // ============================================
  // Password Reset by Mobile
  // ============================================

  /**
   * Start password reset by mobile
   * Sends a reset code via SMS
   */
  startPasswordResetByMobile: async (email) => {
    const response = await authClient.post(
      "/verification-services/password-reset-by-mobile/start",
      {
        email,
      },
    );
    return response.data;
  },

  /**
   * Complete password reset by mobile
   */
  completePasswordResetByMobile: async (email, secretCode, password) => {
    const response = await authClient.post(
      "/verification-services/password-reset-by-mobile/complete",
      {
        email,
        secretCode,
        password,
      },
    );
    return response.data;
  },

  // ============================================
  // Two-Factor Authentication (2FA)
  // ============================================

  /**
   * Start 2FA verification - sends a code to the user's email or mobile
   * @param {string} userId - User ID
   * @param {string} sessionId - Session ID
   * @param {'email'|'mobile'} twoFactorType - Type of 2FA
   */
  start2FA: async (userId, sessionId, twoFactorType) => {
    const endpoint =
      twoFactorType === "email"
        ? "/verification-services/email-2factor-verification/start"
        : "/verification-services/mobile-2factor-verification/start";
    const response = await authClient.post(endpoint, { userId, sessionId });
    return response.data;
  },

  /**
   * Complete 2FA verification - validates the code
   * @param {string} userId - User ID
   * @param {string} sessionId - Session ID
   * @param {string} secretCode - Verification code entered by user
   * @param {'email'|'mobile'} twoFactorType - Type of 2FA
   */
  complete2FA: async (userId, sessionId, secretCode, twoFactorType) => {
    const endpoint =
      twoFactorType === "email"
        ? "/verification-services/email-2factor-verification/complete"
        : "/verification-services/mobile-2factor-verification/complete";
    const response = await authClient.post(endpoint, {
      userId,
      sessionId,
      secretCode,
    });
    return response.data;
  },

  // ============================================
  // Session Management
  // ============================================

  /**
   * Get all active sessions for the current user
   * Returns array of sessions with current session marked as currentOne: true
   */
  getSessions: async () => {
    const response = await authClient.get("/getusersessions");
    return response.data;
  },

  /**
   * Delete a specific session (logout from that device)
   * Cannot delete the current session
   * @param {string} sessionId - Session ID to delete
   */
  deleteSession: async (sessionId) => {
    const response = await authClient.delete(`/deleteusersession/${sessionId}`);
    return response.data;
  },

  /**
   * Delete all other sessions (logout from all other devices)
   * Keeps the current session active
   */
  deleteAllOtherSessions: async () => {
    const response = await authClient.delete("/deleteallsessions");
    return response.data;
  },

  /**
   * Get social login URL for a provider
   * The URL points to the auth service's OAuth initiation endpoint.
   * The frontend should redirect the browser (or open a popup) to this URL.
   * @param {string} provider - 'google', 'apple', 'github', or 'gitlab'
   * @returns {string} The full URL to redirect to
   */
  getSocialLoginUrl: (provider) => {
    const baseUrl = authClient.defaults.baseURL;
    return `${baseUrl}/auth/${provider}`;
  },

  /**
   * Handle social login callback - exchange code for session
   * Called from the callback page after OAuth redirect
   * @param {string} provider - 'google', 'apple', 'github', or 'gitlab'
   * @param {string} code - Authorization code from OAuth provider
   * @returns {Promise<Object>} Session data or registration-needed response
   */
  handleSocialCallback: async (provider, code) => {
    const response = await authClient.get(`/auth/${provider}/callback`, {
      params: { code },
    });
    return response.data;
  },

  /**
   * Exchange socialCode for social login result.
   * After OAuth, the backend redirects to the frontend with a short socialCode reference.
   * This method exchanges that socialCode for the full session data or registration-needed data.
   * The backend also sets session cookies during this call.
   * @param {string} socialCode - The socialCode from the redirect URL query params
   * @returns {Promise<Object>} Session data (with accessToken) or registration-needed response
   */
  completeSocialLogin: async (socialCode) => {
    const response = await authClient.post("/auth/social-login-result", {
      socialCode,
    });
    return response.data;
  },

  // ============================================
  // Admin: User Management
  // ============================================

  /**
   * List all users (admin only)
   * @param {Object} options - Query options
   * @param {number} options.pageNumber - Page number (default 1)
   * @param {number} options.pageRowCount - Items per page (default 25)
   */
  listUsers: async ({ pageNumber = 1, pageRowCount = 25 } = {}) => {
    const response = await authClient.get("/v1/users", {
      params: { pageNumber, pageRowCount },
    });
    return response.data;
  },

  /**
   * Search users by keyword (admin only)
   * Searches in fullname and email using elasticsearch
   * @param {string} keyword - Search keyword (min 3 chars)
   * @param {Object} options - Query options
   */
  searchUsers: async (keyword, { pageNumber = 1, pageRowCount = 25 } = {}) => {
    const response = await authClient.get("/v1/searchusers", {
      params: { keyword, pageNumber, pageRowCount },
    });
    return response.data;
  },

  /**
   * Create a new user (admin only)
   * @param {Object} userData - User data (email, password, fullname, avatar, roleId, etc.)
   */
  createUser: async (userData) => {
    const response = await authClient.post("/v1/users", userData);
    return response.data;
  },

  /**
   * Update user (admin only)
   * @param {string} userId - User ID
   * @param {Object} data - Updated user data (fullname, avatar)
   */
  updateUser: async (userId, data) => {
    const response = await authClient.patch(`/v1/users/${userId}`, data);
    return response.data;
  },

  /**
   * Update user role (admin only)
   * Rules:
   * - superAdmin role cannot be unassigned
   * - Admin roles can only be assigned/unassigned by superAdmin
   * @param {string} userId - User ID
   * @param {string} roleId - New role(s)
   */
  updateUserRole: async (userId, roleId) => {
    const response = await authClient.patch(`/v1/userrole/${userId}`, {
      roleId,
    });
    return response.data;
  },

  /**
   * Update user password by admin
   * Rules:
   * - SuperAdmin and admin passwords can only be updated by superAdmin
   * - Admins can only update non-admin passwords
   * @param {string} userId - User ID
   * @param {string} newPassword - New password
   */
  updateUserPasswordByAdmin: async (userId, newPassword) => {
    const response = await authClient.patch(
      `/v1/userpasswordbyadmin/${userId}`,
      {
        newPassword,
      },
    );
    return response.data;
  },

  /**
   * Delete user (admin only)
   * Rules:
   * - SuperAdmin cannot be deleted
   * - Admins can only be deleted by superAdmin
   * @param {string} userId - User ID
   */
  deleteUser: async (userId) => {
    const response = await authClient.delete(`/v1/users/${userId}`);
    return response.data;
  },

  // ============================================
  // Avatar Upload (Database Bucket)
  // ============================================

  /**
   * Upload an avatar image to the auth service's database bucket.
   * Uses the regular access token (set by interceptor) — no bucket-specific token needed.
   * @param {string} bucketName - The bucket name (e.g., "userAvatars")
   * @param {File|Blob} imageFile - The image file to upload
   * @returns {Promise<string>} The public download URL (using accessKey)
   */
  uploadAvatar: async (bucketName, imageFile) => {
    const file =
      imageFile instanceof File
        ? imageFile
        : new File([imageFile], "avatar.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("file", file);

    const response = await authClient.post(
      `/bucket/${bucketName}/upload`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );

    const result = response.data;
    if (result?.file?.accessKey) {
      return `${authClient.defaults.baseURL}/bucket/${bucketName}/download/key/${result.file.accessKey}`;
    }
    throw new Error("Failed to upload avatar");
  },
};
