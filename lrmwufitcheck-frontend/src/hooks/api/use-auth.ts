/**
 * React Query hooks for Authentication
 * Covers: login, logout, session, registration, profile management, email verification, password reset.
 * Auto-generated from project definition — DO NOT EDIT.
 *
 * AI agents: READ-ONLY. This file is overwritten on every codegen run.
 * Add custom auth hooks as NEW files in this folder (e.g.
 * `use-auth-helpers.ts`) — any file whose name doesn't match Genesis's
 * generated set survives rebuilds.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/api/auth-service";

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const authKeys = {
  all: () => ["auth"] as const,
  session: () => [...authKeys.all(), "session"] as const,
  user: (userId: string) => [...authKeys.all(), "user", userId] as const,
  users: (params?: Record<string, string>) =>
    [...authKeys.all(), "users", params] as const,
  searchUsers: (keyword: string, extra?: Record<string, unknown>) =>
    [...authKeys.all(), "searchUsers", keyword, extra] as const,
  userSessions: (userId?: string | null) =>
    [...authKeys.all(), "userSessions", userId ?? "self"] as const,
  userHistory: (userId?: string | null) =>
    [...authKeys.all(), "userHistory", userId ?? "self"] as const,
};

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: () => authService.getCurrentUser(),
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
};

export const useUser = (userId: string | null | undefined) => {
  return useQuery({
    queryKey: authKeys.user(userId!),
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      const response = await authService.getUser(userId);
      return response.user;
    },
    enabled: !!userId,
  });
};

// Param shape comes from `authService.listUsers` so this hook stays in
// lockstep with whatever filter params the project's user model actually
// declares (email-only projects don't get `mobile`, mobile-primary projects
// do, etc.) PLUS the global pagination + transport flags every list API
// honors (pageNumber, pageRowCount, getJoins) — the service template already
// derives those from the live API config via `_bodyFieldsBlock(_listUsersApi)`.
export const useUsers = (
  params?: Parameters<typeof authService.listUsers>[0],
) => {
  return useQuery({
    queryKey: authKeys.users(params as Record<string, string> | undefined),
    queryFn: async () => {
      const response = await authService.listUsers(params);
      return response.users ?? [];
    },
  });
};

// `keyword` stays as the positional primary input (debounce-friendly), while
// any additional filter params the project's searchUsers API declares
// (e.g. `roleId`) come through the optional second arg. Derived from the
// service signature, so adding a filter on the BE auto-propagates here.
type _SearchUsersExtra = Omit<
  Parameters<typeof authService.searchUsers>[0],
  "keyword"
>;
export const useSearchUsers = (keyword: string, extra?: _SearchUsersExtra) => {
  return useQuery({
    queryKey: authKeys.searchUsers(
      keyword,
      extra as Record<string, unknown> | undefined,
    ),
    queryFn: async () => {
      const response = await authService.searchUsers({ keyword, ...extra });
      return response.users ?? [];
    },
    enabled: keyword.length >= 2,
    staleTime: 1000 * 30,
  });
};

// ---------------------------------------------------------------------------
// Login / Logout
// ---------------------------------------------------------------------------

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: { username: string; password: string }) =>
      authService.login(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.session(), data);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: authKeys.all() });
      queryClient.clear();
    },
  });
};

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: Parameters<typeof authService.registerUser>[0]) =>
      authService.registerUser(data),
  });
};

// ---------------------------------------------------------------------------
// Profile management
// ---------------------------------------------------------------------------

/** Admin-only — updates any user's record (PATCH /v1/users/:userId). */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: Parameters<typeof authService.updateUser>[1];
    }) => authService.updateUser(userId, data),
    onSuccess: (response, variables) => {
      queryClient.setQueryData(authKeys.user(variables.userId), response.user);
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
    },
  });
};

/**
 * Self-update — the current user updates their own profile.
 * PATCH /v1/profile (session-based — no userId in payload).
 * For admin editing other users, use `useUpdateUser()` instead.
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // Body shape derived from `authService.updateProfile`, which is itself
    // generated from the live updateProfile API config — adapts to whichever
    // self-updatable user fields the project actually declares (mobile only
    // when the user model has a mobile column, etc.). Hand-hardcoding
    // `mobile?: string` here would advertise a field the BE silently drops.
    mutationFn: (data: Parameters<typeof authService.updateProfile>[0]) =>
      authService.updateProfile(data),
    onSuccess: () => {
      // Session-based update — invalidate the current-user query so the new
      // values appear immediately. The user record in cache is keyed by id;
      // dropping the whole user namespace is the simplest correct refresh.
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
      queryClient.invalidateQueries({ queryKey: authKeys.all() });
    },
  });
};

/**
 * Self password change — PATCH /v1/userpassword (session-based).
 * For admin password reset, use `useUpdateUserPasswordByAdmin()`.
 */
export const useUpdateUserPassword = () => {
  return useMutation({
    mutationFn: (data: { oldPassword: string; newPassword: string }) =>
      authService.updateUserPassword(data),
  });
};

/**
 * Self-archive — DELETE /v1/archiveprofile (session-based, no userId).
 * The user soft-deletes their own account. For admin removal, use `useDeleteUser()`.
 */
export const useArchiveProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authService.archiveProfile(),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: authKeys.all() });
      queryClient.clear();
    },
  });
};

// ---------------------------------------------------------------------------
// Admin operations
// ---------------------------------------------------------------------------

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof authService.createUser>[0]) =>
      authService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.all() });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => authService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.all() });
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: { roleId: string };
    }) => authService.updateUserRole(userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: authKeys.user(variables.userId),
      });
    },
  });
};

export const useUpdateUserPasswordByAdmin = () => {
  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: { password: string };
    }) => authService.updateUserPasswordByAdmin(userId, data),
  });
};

export const useBriefUser = (userId: string | null | undefined) => {
  return useQuery({
    queryKey: [...authKeys.all(), "briefUser", userId],
    queryFn: () => authService.getBriefUser(userId!),
    enabled: !!userId,
  });
};

// ---------------------------------------------------------------------------
// Email verification
// ---------------------------------------------------------------------------

export const useStartEmailVerification = () => {
  return useMutation({
    mutationFn: (email: string) => authService.startEmailVerification(email),
  });
};

export const useCompleteEmailVerification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      email,
      secretCode,
    }: {
      email: string;
      secretCode: string;
    }) => authService.completeEmailVerification(email, secretCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
    },
  });
};

// ---------------------------------------------------------------------------
// Password reset by email
// ---------------------------------------------------------------------------

export const useStartPasswordResetByEmail = () => {
  return useMutation({
    mutationFn: (email: string) => authService.startPasswordResetByEmail(email),
  });
};

export const useCompletePasswordResetByEmail = () => {
  return useMutation({
    mutationFn: ({
      email,
      secretCode,
      password,
    }: {
      email: string;
      secretCode: string;
      password: string;
    }) => authService.completePasswordResetByEmail(email, secretCode, password),
  });
};

// ---------------------------------------------------------------------------
// Email 2-factor verification
// ---------------------------------------------------------------------------

export const useStartEmail2Factor = () => {
  return useMutation({
    mutationFn: () => authService.startEmail2Factor(),
  });
};

export const useCompleteEmail2Factor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (secretCode: string) =>
      authService.completeEmail2Factor(secretCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
    },
  });
};

// ---------------------------------------------------------------------------
// Session management
// ---------------------------------------------------------------------------

export const useRelogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authService.relogin(),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.session(), data);
    },
  });
};

export const useUserSessions = (userId?: string | null) => {
  return useQuery({
    queryKey: authKeys.userSessions(userId),
    queryFn: () => authService.getUserSessions(userId ?? undefined),
  });
};

export const useUserHistory = (userId?: string | null) => {
  return useQuery({
    queryKey: authKeys.userHistory(userId),
    queryFn: () => authService.getUserHistory(userId ?? undefined),
  });
};

export const useDeleteUserSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      userId,
    }: {
      sessionId: string;
      userId?: string;
    }) => authService.deleteUserSession(sessionId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: authKeys.userSessions(variables.userId),
      });
    },
  });
};

export const useDeleteAllSessions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId?: string) => authService.deleteAllSessions(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({
        queryKey: authKeys.userSessions(userId),
      });
    },
  });
};

// ---------------------------------------------------------------------------
// Avatar bucket operations
// ---------------------------------------------------------------------------

export const useUploadUserAvatar = () => {
  return useMutation({
    mutationFn: (file: File) => authService.uploadUserAvatar(file),
  });
};

export const useUserAvatarFile = (fileId: string | null | undefined) => {
  return useQuery({
    queryKey: [...authKeys.all(), "userAvatarFile", fileId],
    queryFn: () => authService.getUserAvatarFile(fileId!),
    enabled: !!fileId,
  });
};

export const useUserAvatarFiles = () => {
  return useQuery({
    queryKey: [...authKeys.all(), "userAvatarFiles"],
    queryFn: () => authService.listUserAvatarFiles(),
  });
};

export const useDeleteUserAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fileId: string) => authService.deleteUserAvatar(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...authKeys.all(), "userAvatarFiles"],
      });
    },
  });
};
