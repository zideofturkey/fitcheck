/**
 * Authentication context — `AuthProvider` + `useAuth()` hook for the app shell.
 * Auto-generated from project definition — DO NOT EDIT.
 *
 * AI agents: READ-ONLY. This file is overwritten on every codegen run.
 * Add custom auth context helpers as NEW files in this folder (e.g.
 * `auth-context-helpers.ts`) — any file whose name doesn't match Genesis's
 * generated set survives rebuilds.
 */
import { createContext, useCallback, useContext, useMemo } from "react";
import type { User } from "@/types/api";
import { useCurrentUser, useLogin, useLogout } from "@/hooks/api/use-auth";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isLoading } = useCurrentUser();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  // CurrentUserResponse is already flat — see types/api.ts. Just spread it
  // through and rename the three fields that don't line up with the User
  // shape: userId → id, registeredAt → createdAt, default isActive to true
  // when the backend omits it.
  //
  // The cast goes through `unknown` because the User interface may declare
  // required custom user properties (age, gender, etc.) that TS can't prove
  // are present on the session envelope. They ARE included flat by the
  // backend; this assertion bridges the gap rather than enumerating each.
  const user = useMemo<User | null>(() => {
    if (!session?.userId) return null;
    return {
      ...session,
      id: session.userId,
      isActive: (session.isActive as boolean | undefined) ?? true,
      createdAt: session.registeredAt,
    } as unknown as User;
  }, [session]);

  const login = useCallback(
    async (username: string, password: string) => {
      await loginMutation.mutateAsync({ username, password });
    },
    [loginMutation],
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
