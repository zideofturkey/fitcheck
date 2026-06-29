import { useEffect } from "react";
import { useAuthStore } from "../stores/authStore";

/**
 * Custom hook for authentication
 *
 * Provides easy access to auth state and actions.
 */
export function useAuth() {
  const {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    isInitialized,
    login,
    logout,
    register,
    checkSession,
    updateProfile,
  } = useAuthStore();

  // Check session on mount (skip if 2FA is pending — session is not yet fully authorized)
  useEffect(() => {
    const pending2FA = useAuthStore.getState().pending2FA;
    if (accessToken && !user && !pending2FA) {
      checkSession();
    } else if (!accessToken || pending2FA) {
      useAuthStore.setState({ isLoading: false, isInitialized: true });
    }
  }, []);

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    isInitialized,
    login,
    logout,
    register,
    checkSession,
    updateProfile,
  };
}
