import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "../services/authService";

/**
 * Authentication Store
 *
 * Manages user authentication state using Zustand with persistence.
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
      isInitialized: false,

      // Verification state
      pendingVerification: null, // { type: 'email' | 'mobile', email: string, codeIndex?: number, secretCode?: string }
      verificationLoading: false,

      // Two-factor authentication state
      pending2FA: null, // { userId, sessionId, twoFactorType: 'email'|'mobile', destination, accessToken }

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setToken: (accessToken) => set({ accessToken }),

      setLoading: (isLoading) => set({ isLoading }),

      // Set pending verification (called after registration or login that needs verification)
      setPendingVerification: (verification) =>
        set({ pendingVerification: verification }),

      // Clear pending verification
      clearPendingVerification: () => set({ pendingVerification: null }),

      // Login action
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await authService.login(email, password);

          // Check if 2FA is required before granting full access
          const needs2FA =
            response.sessionNeedsEmail2FA || response.sessionNeedsMobile2FA;
          if (needs2FA) {
            const twoFactorType = response.sessionNeedsEmail2FA
              ? "email"
              : "mobile";
            set({
              accessToken: response.accessToken,
              pending2FA: {
                userId: response.userId,
                sessionId: response.sessionId,
                twoFactorType,
                destination:
                  twoFactorType === "email" ? response.email : response.mobile,
                accessToken: response.accessToken,
              },
              isLoading: false,
            });
            return { success: true, needs2FA: true, twoFactorType };
          }
          set({
            user: {
              userId: response.userId,
              email: response.email,
              fullname: response.fullname,
              avatar: response.avatar,
              roleId: response.roleId,
              sessionId: response.sessionId,
            },
            accessToken: response.accessToken,
            isAuthenticated: true,
            isLoading: false,
            pendingVerification: null,
            pending2FA: null,
          });

          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          const errCode = error.response?.data?.errCode;
          const errorMessage = error.response?.data?.message || error.message;

          if (
            errCode === "EmailVerificationNeeded" ||
            errCode === "MobileVerificationNeeded"
          ) {
            set({
              pendingVerification: {
                type:
                  errCode === "EmailVerificationNeeded" ? "email" : "mobile",
                email,
              },
            });
          }

          return {
            success: false,
            error: errorMessage,
            errCode,
          };
        }
      },

      // Register action
      // The registration response may include an accessToken if the backend performed
      // auto-login (no email/mobile verification needed). In that case, the frontend
      // can skip the separate login call and use the token directly.
      register: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await authService.register(userData);
          set({ isLoading: false });

          // Check if auto-login was performed (accessToken in registration response)
          if (
            response.accessToken &&
            !response.emailVerificationNeeded &&
            !response.mobileVerificationNeeded
          ) {
            const session = response.autoLoginSession || {};
            set({
              user: {
                userId: session.userId || response.user?.id,
                email: session.email || response.user?.email || userData.email,
                fullname:
                  session.fullname ||
                  response.user?.fullname ||
                  userData.fullname,
                avatar: session.avatar || response.user?.avatar,
                roleId: session.roleId || response.user?.roleId || "user",
                sessionId: session.sessionId,
              },
              accessToken: response.accessToken,
              isAuthenticated: true,
              pendingVerification: null,
            });
            return { success: true, autoLoggedIn: true, user: response.user };
          }

          const result = { success: true, user: response.user };
          if (response.emailVerificationNeeded) {
            result.emailVerificationNeeded = true;
            set({
              pendingVerification: {
                type: "email",
                email: userData.email,
              },
            });
          } else if (response.mobileVerificationNeeded) {
            result.mobileVerificationNeeded = true;
            set({
              pendingVerification: {
                type: "mobile",
                email: userData.email,
              },
            });
          }
          return result;
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: error.response?.data?.message || error.message,
          };
        }
      },

      // Start email verification
      startEmailVerification: async (email) => {
        set({ verificationLoading: true });
        try {
          const response = await authService.startEmailVerification(email);
          set({
            verificationLoading: false,
            pendingVerification: {
              type: "email",
              email,
              codeIndex: response.codeIndex,
              expireTime: response.expireTime,
              verificationType: response.verificationType,
              secretCode: response.secretCode, // Only in test mode
            },
          });
          return { success: true, ...response };
        } catch (error) {
          set({ verificationLoading: false });
          return {
            success: false,
            error: error.response?.data?.message || error.message,
            errCode: error.response?.data?.errCode,
          };
        }
      },

      // Complete email verification
      completeEmailVerification: async (email, secretCode) => {
        set({ verificationLoading: true });
        try {
          const response = await authService.completeEmailVerification(
            email,
            secretCode,
          );

          // Check if mobile verification is also needed
          if (response.mobileVerificationNeeded) {
            set({
              verificationLoading: false,
              pendingVerification: {
                type: "mobile",
                email,
              },
            });
            return { success: true, mobileVerificationNeeded: true };
          }

          set({
            verificationLoading: false,
            pendingVerification: null,
          });
          return { success: true, isVerified: true };
        } catch (error) {
          set({ verificationLoading: false });
          return {
            success: false,
            error: error.response?.data?.message || error.message,
            errCode: error.response?.data?.errCode,
          };
        }
      },

      startMobileVerification: async (email) => {
        set({ verificationLoading: true });
        try {
          const response = await authService.startMobileVerification(email);
          set({
            verificationLoading: false,
            pendingVerification: {
              type: "mobile",
              email,
              codeIndex: response.codeIndex,
              expireTime: response.expireTime,
              verificationType: response.verificationType,
              secretCode: response.secretCode,
            },
          });
          return { success: true, ...response };
        } catch (error) {
          set({ verificationLoading: false });
          return {
            success: false,
            error: error.response?.data?.message || error.message,
            errCode: error.response?.data?.errCode,
          };
        }
      },

      completeMobileVerification: async (email, secretCode) => {
        set({ verificationLoading: true });
        try {
          const response = await authService.completeMobileVerification(
            email,
            secretCode,
          );
          set({
            verificationLoading: false,
            pendingVerification: null,
          });
          return { success: true, isVerified: true };
        } catch (error) {
          set({ verificationLoading: false });
          return {
            success: false,
            error: error.response?.data?.message || error.message,
            errCode: error.response?.data?.errCode,
          };
        }
      },

      // Start password reset by email
      startPasswordResetByEmail: async (email) => {
        set({ verificationLoading: true });
        try {
          const response = await authService.startPasswordResetByEmail(email);
          set({ verificationLoading: false });
          return { success: true, ...response };
        } catch (error) {
          set({ verificationLoading: false });
          return {
            success: false,
            error: error.response?.data?.message || error.message,
            errCode: error.response?.data?.errCode,
          };
        }
      },

      // Complete password reset by email
      completePasswordResetByEmail: async (email, secretCode, password) => {
        set({ verificationLoading: true });
        try {
          const response = await authService.completePasswordResetByEmail(
            email,
            secretCode,
            password,
          );
          set({ verificationLoading: false });
          return { success: true, isVerified: true };
        } catch (error) {
          set({ verificationLoading: false });
          return {
            success: false,
            error: error.response?.data?.message || error.message,
            errCode: error.response?.data?.errCode,
          };
        }
      },

      // Start 2FA - triggers sending the code
      start2FA: async () => {
        const p2fa = get().pending2FA;
        if (!p2fa) return { success: false, error: "No pending 2FA session" };
        try {
          const response = await authService.start2FA(
            p2fa.userId,
            p2fa.sessionId,
            p2fa.twoFactorType,
          );
          set({
            pending2FA: {
              ...p2fa,
              codeIndex: response.codeIndex,
              expireTime: response.expireTime,
              secretCode: response.secretCode, // Only in test mode
            },
          });
          return { success: true, ...response };
        } catch (error) {
          return {
            success: false,
            error: error.response?.data?.message || error.message,
          };
        }
      },

      // Complete 2FA - validates code and finalises session
      complete2FA: async (secretCode) => {
        const p2fa = get().pending2FA;
        if (!p2fa) return { success: false, error: "No pending 2FA session" };
        try {
          const session = await authService.complete2FA(
            p2fa.userId,
            p2fa.sessionId,
            secretCode,
            p2fa.twoFactorType,
          );
          set({
            user: {
              userId: session.userId,
              email: session.email,
              mobile: session.mobile,
              fullname: session.fullname,
              avatar: session.avatar,
              roleId: session.roleId,
              sessionId: session.sessionId,
            },
            accessToken: session.accessToken || p2fa.accessToken,
            isAuthenticated: true,
            pending2FA: null,
          });
          return { success: true };
        } catch (error) {
          return {
            success: false,
            error: error.response?.data?.message || error.message,
          };
        }
      },

      // Clear pending 2FA (e.g., user cancels)
      clearPending2FA: () => set({ pending2FA: null, accessToken: null }),

      startPasswordResetByMobile: async (email) => {
        set({ verificationLoading: true });
        try {
          const response = await authService.startPasswordResetByMobile(email);
          set({ verificationLoading: false });
          return { success: true, ...response };
        } catch (error) {
          set({ verificationLoading: false });
          return {
            success: false,
            error: error.response?.data?.message || error.message,
            errCode: error.response?.data?.errCode,
          };
        }
      },

      completePasswordResetByMobile: async (email, secretCode, password) => {
        set({ verificationLoading: true });
        try {
          const response = await authService.completePasswordResetByMobile(
            email,
            secretCode,
            password,
          );
          set({ verificationLoading: false });
          return { success: true, isVerified: true };
        } catch (error) {
          set({ verificationLoading: false });
          return {
            success: false,
            error: error.response?.data?.message || error.message,
            errCode: error.response?.data?.errCode,
          };
        }
      },

      // Logout action
      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error("Logout error:", error);
        }
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          pending2FA: null,
        });
      },

      // Check current session
      checkSession: async () => {
        set({ isLoading: true });
        try {
          const response = await authService.getCurrentUser();
          set({
            user: {
              userId: response.userId,
              email: response.email,
              fullname: response.fullname,
              avatar: response.avatar,
              roleId: response.roleId,
              sessionId: response.sessionId,
              // Bucket tokens for file uploads
            },
            accessToken: response.accessToken || get().accessToken,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
          });
          return true;
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
          });
          return false;
        }
      },

      // Update profile
      updateProfile: async (data) => {
        try {
          const response = await authService.updateProfile(data);
          set({ user: { ...get().user, ...response.user } });
          return { success: true };
        } catch (error) {
          return {
            success: false,
            error: error.response?.data?.message || error.message,
          };
        }
      },
    }),
    {
      name: "lrmwufitcheck-auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        pendingVerification: state.pendingVerification,
        pending2FA: state.pending2FA,
      }),
    },
  ),
);
