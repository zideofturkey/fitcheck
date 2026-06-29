

# **FITCHECK**

**FRONTEND GUIDE FOR AI CODING AGENTS - PART 2 - Authentication Management**

This document covers the authentication features of the **fitcheck** project: registration, login, logout, and session management. The project introduction, API conventions, home page, and multi-tenancy setup were covered in the previous introductory prompt — make sure those are implemented before proceeding.

Use the generated auth hooks for all operations in this document. The SDK handles token storage, auth headers, and cache invalidation automatically.

### Auth SDK Types

```typescript
interface MindbricksResponse {
  status: "OK";
  statusCode: number;
  dataName?: string;
  rowCount?: number;
  paging?: { pageNumber: number; pageRowCount: number; totalRowCount: number; pageCount: number };
  [key: string]: unknown;
}

interface MindbricksUpdateEnvelope extends MindbricksResponse {
  oldDataValues?: Record<string, unknown>;
  newDataValues?: Record<string, unknown>;
}

interface User {
  id: string;
  email: string;
  fullname: string;
  avatar?: string;
  roleId: string;
  emailVerified: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Every column from the auth `user` dataObject (incl. custom additionals)
  // is enumerated above; this index signature only catches BE schema changes
  // that haven't yet been regenerated FE-side.
  [key: string]: unknown;
}

// Login / relogin / social-exchange. User & session fields are returned FLAT
// (NOT nested under `user`), alongside `accessToken` and several token fields.
interface SessionResponse {
  status: "OK";
  accessToken: string;
  sessionId: string;
  userId: string;
  appCodename?: string;
  isAbsolute?: boolean;
  email?: string;
  fullname?: string;
  avatar?: string;
  roleId: string;
  emailVerified?: boolean;
  registeredAt?: string;
  loginAt?: string;
  loginIp?: string;
  agent?: { deviceType?: string; os?: string; osVersion?: string; browserName?: string; browserVersion?: string; vendor?: string };
  checkTokenMark?: string;
  tenantCodename?: string; // multi-tenant only
  [key: string]: unknown; // custom user properties returned flat
}

// GET /currentuser. Same flat shape as SessionResponse + session metadata.
// When no user is logged in, the auth service catches the HTTP 401 and the
// hook returns `data: null` (NOT an error state).
interface CurrentUserResponse extends SessionResponse {
  source?: "redis" | "db" | "cache";
  expiresAt?: string;
  lastActiveAt?: string;
  lastActiveIp?: string;
}

// POST /logout — always { status: "OK" }, nothing else.
interface LogoutResponse { status: "OK"; }

interface RegisterResponse extends MindbricksResponse {
  user: User;
  accessToken?: string;
  emailVerificationNeeded?: boolean;
  mobileVerificationNeeded?: boolean;
}

interface VerificationStartResponse {
  status: "OK";
  codeIndex?: number;
  timeStamp?: number;
  expireTime?: number;
  verificationType?: string;
  secretCode?: number;  // only in test/dev mode
}

interface VerificationCompleteResponse {
  status: "OK";
  isVerified: boolean;
}

// Standard error envelope returned by every Mindbricks endpoint that fails
// (login wrong password, validation errors, permission denials, etc.).
// The api-client catches this and re-throws a flat object with the same
// fields plus `httpStatus` (the HTTP status code) — see "Error Handling".
interface MindbricksError {
  result: "ERR";
  status: number;       // HTTP status echoed in the body (401, 403, 422, …)
  message: string;      // i18n key (e.g. "errMsg_UserNotFound") — translate or map to user copy
  errCode: string | number; // stable symbolic code (e.g. "UserNotFound", "WrongPassword")
  date?: string;        // ISO-8601 timestamp of the error
  detail?: string;      // optional extra context
}

// Bucket upload returns its OWN compact shape — NOT the standard Mindbricks
// envelope (no statusCode/dataName/rowCount). Stays standalone.
interface BucketUploadResponse {
  status: "OK";
  action: "upload";
  bucket: string;
  file: {
    id: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    accessKey: string;
    ownerId?: string;
  };
}
```

### Auth Context — `useAuth()`

The primary way to manage authentication state. Import from `@/context/AuthContext`.

**Prerequisite:** Your `main.tsx` must wrap the app with `QueryClientProvider > AuthProvider > App` as described in the intro prompt. Without this provider hierarchy, `useAuth()` will throw.

Then use the hook in any component:

```tsx
import { useAuth } from "@/context/AuthContext";

const { user, isAuthenticated, isLoading, login, logout } = useAuth();
```

| Field | Type | Description |
|-------|------|-------------|
| `user` | `User` or `null` | Current user extracted from session. Includes `id` (mapped from session `userId`), `email`, `fullname`, `roleId`, etc. — plus the rest of the session envelope (tokens, lastActive*, custom user properties) since it's spread through. |
| `isAuthenticated` | `boolean` | `true` when user is logged in |
| `isLoading` | `boolean` | `true` during initial session fetch |
| `login(username, password)` | `async function` | Calls `authService.login()`, stores token, updates context |
| `logout()` | `async function` | Calls `authService.logout()`, clears tokens and cache |

`useAuth()` internally uses `useCurrentUser()`, `useLogin()`, and `useLogout()` — you do not need to import those separately for basic login/logout. The context automatically updates when the session changes.

**When to use `useLogin()` directly:** When you need the raw response (e.g. to check `sessionNeedsEmail2FA` or `errCode` for verification). `useAuth().login()` returns `void` — it does not expose the response.

### Auth Hooks Reference

Individual hooks for cases where you need more control than `useAuth()` provides. Import from `@/hooks/api/use-auth`:

```tsx
import { useLogin, useCurrentUser, useUser, useRegister, ... } from "@/hooks/api/use-auth";
```

> **Required-Role column** below is what the backend enforces, derived per-API
> from the auth service's `authOptions` (not a hardcoded label). Hooks that
> need a `roles: ...` gate should only be wired into screens the listed roles
> can reach — gate the calling component behind a role check (e.g.
> `useAuth().user.roleId === "superAdmin"` for superAdmin-only flows, or a
> broader check when the gate lists multiple roles). Hooks marked
> `owner or admin` allow a logged-in user to operate on their own record;
> admin-tier roles in the `absoluteRoles` list bypass the ownership check.
> Hooks marked `public` work without a session.

**Session & User**

| Hook | Type | Params | Returns | Required Role |
|------|------|--------|---------|---------------|
| `useCurrentUser()` | query | — | `CurrentUserResponse \| null` (staleTime 5min, retry off; `null` when logged out) | any (no auth needed) |
| `useUser(userId)` | query | `userId: string or null` | `User` — enabled when userId truthy | owner or admin (admin also bypass) |
| `useUsers(params?)` | query | `{ email?, fullname?, roleId?, pageNumber?, pageRowCount?, getJoins? }` — filter params reflect the project's actual user-filter config; for full-text search use `useSearchUsers(keyword)` (separate endpoint, ElasticSearch over email + fullname) | `User[]` | roles: superAdmin, admin |
| `useSearchUsers(keyword, params?)` | query | `keyword: string`, additional filters: { roleId? } | `User[]` — enabled when length >= 2 | roles: superAdmin, admin |
| `useBriefUser(userId)` | query | `userId: string or null` | `UserResponse` (id, fullname, avatar only) | public |

**Login / Logout** (use `useAuth()` for simple cases, these for response inspection)

| Hook | Type | Payload | Returns | Required Role |
|------|------|---------|---------|---------------|
| `useLogin()` | mutation | `{ username: string, password: string }` | `SessionResponse` — use `onSuccess` to check 2FA flags | public |
| `useLogout()` | mutation | — | clears all auth cache | login required |

**Registration**

Registration payload type:

```typescript
interface RegisterPayload {
  email: string;
  password: string;
  fullname: string;
  avatar?: string;
}
```

| Hook | Type | Payload | Returns |
|------|------|---------|---------|
| `useRegister()` | mutation | `RegisterPayload` | `RegisterResponse` |

**Profile** (self)

| Hook | Type | Payload | Returns | Required Role |
|------|------|---------|---------|---------------|
| `useUpdateProfile()` | mutation | `{ fullname?, avatar? }` | `UserResponse` + update envelope — PATCH `/v1/profile` (session-based, **no userId argument**). Every body field is optional (partial update). Server-only fields (`email`, `roleId`, `password`) are intentionally NOT on this route. Use `useUpdateUser(userId, ...)` for admin cross-user edits. | owner or admin |
| `useUpdateUserPassword()` | mutation | `{ oldPassword, newPassword }` | `UserResponse` + update envelope — PATCH `/v1/userpassword` (session-based, **no userId argument**); old password verified. For admin password reset on another user, use `useUpdateUserPasswordByAdmin`. | owner or admin — use `useUpdateUserPasswordByAdmin` for resets |
| `useArchiveProfile()` | mutation | _(no argument)_ | `UserResponse` — DELETE `/v1/archiveprofile` (session-based, **no userId argument**); soft-deletes the session user and clears auth cache. For admin removal of another user, use `useDeleteUser(userId)`. | owner or admin |

**Admin** (gate behind a role check before rendering — never expose to non-admins)

| Hook | Type | Payload | Returns | Required Role |
|------|------|---------|---------|---------------|
| `useUpdateUser()` | mutation | `{ userId, data: { fullname?, avatar? } }` | `UserResponse` + update envelope — PATCH `/v1/users/:userId` (admin acting on another user). Every body field optional. Use this on admin screens; `useUpdateProfile(data)` (no userId) is the self-edit variant. | roles: superAdmin, saasAdmin, admin, tenantOwner, tenantAdmin |
| `useCreateUser()` | mutation | `{ email, password, fullname, avatar? }` | `UserResponse` — payload mirrors what `POST /v1/users` accepts (project-specific user properties). For public signup use `useRegister*` instead. | roles: superAdmin, admin, saasAdmin, tenantAdmin, tenantOwner |
| `useDeleteUser()` | mutation | `userId: string` | `UserResponse` — hard delete | roles: superAdmin, admin |
| `useUpdateUserRole()` | mutation | `{ userId, data: { roleId } }` | `UserResponse` + update envelope | roles: superAdmin, admin |
| `useUpdateUserPasswordByAdmin()` | mutation | `{ userId, data: { password } }` | `UserResponse` + update envelope — no old password | owner, or roles: superAdmin, admin |

**Verification & Password Reset**

| Hook | Type | Payload | Returns |
|------|------|---------|---------|
| `useStartEmailVerification()` | mutation | `email: string` (raw, not object) | `VerificationStartResponse` |
| `useCompleteEmailVerification()` | mutation | `{ email, secretCode }` | `VerificationCompleteResponse` |
| `useStartMobileVerification()` | mutation | `email: string` (raw, not object) | `VerificationStartResponse` |
| `useCompleteMobileVerification()` | mutation | `{ email, secretCode }` | `VerificationCompleteResponse` |
| `useStartPasswordResetByEmail()` | mutation | `email: string` (raw, not object) | `VerificationStartResponse` |
| `useCompletePasswordResetByEmail()` | mutation | `{ email, secretCode, password }` | `VerificationCompleteResponse` |
| `useStartPasswordResetByMobile()` | mutation | `email: string` (raw, not object) | `VerificationStartResponse` |
| `useCompletePasswordResetByMobile()` | mutation | `{ email, secretCode, password }` | `VerificationCompleteResponse` |
| `useStartEmail2Factor()` | mutation | — (auth required) | `VerificationStartResponse` — call when login response indicates 2FA is needed |
| `useCompleteEmail2Factor()` | mutation | `secretCode: string` | `VerificationCompleteResponse` — invalidates session cache |
| `useStartMobile2Factor()` | mutation | — (auth required) | `VerificationStartResponse` — call when login response indicates 2FA is needed |
| `useCompleteMobile2Factor()` | mutation | `secretCode: string` | `VerificationCompleteResponse` — invalidates session cache |

**Sessions** (always available on every auth service)

| Hook | Type | Payload / Params | Returns |
|------|------|-------------------|---------|
| `useRelogin()` | mutation | — | `SessionResponse` — reissues access token **and rotates sessionId**; call after a profile/role change to refresh claims |
| `useUserSessions(userId?)` | query | `userId?: string` (defaults to current user) | `UserSessionRecord[]` — bare array, no envelope; `currentOne: true` marks the active session |
| `useUserHistory(userId?)` | query | `userId?: string` | `UserHistoryEntry[]` — bare array, no envelope |
| `useDeleteUserSession()` | mutation | `{ sessionId, userId? }` | `MindbricksResponse` — revokes one session, invalidates `userSessions` cache |
| `useDeleteAllSessions()` | mutation | `userId?: string` | `MindbricksResponse` — revokes all sessions; the current user must re-login |

**Avatar Bucket**

| Hook | Type | Payload | Returns |
|------|------|---------|---------|
| `useUploadUserAvatar()` | mutation | `file: File` | `BucketUploadResponse` |
| `useUserAvatarFile(fileId)` | query | `fileId: string or null` | file metadata |
| `useUserAvatarFiles()` | query | — | list of avatar files |
| `useDeleteUserAvatar()` | mutation | `fileId: string` | `MindbricksResponse` |

To get the avatar download URL (public, no auth): `authService.getUserAvatarUrl(accessKey)` returns a string URL.

### Error Handling in Hooks

All hooks throw on error. Handle errors via the `error` property (queries) or `onError` callback (mutations).

**The thrown error is a flat object** (the api-client uses native `fetch`, NOT axios — there is no `err.response.data`). Read fields directly off `err`:

```ts
type ThrownAuthError = {
  httpStatus: number;        // the HTTP status code (401, 403, 422, …)
  status: number;            // same status echoed in the body
  message: string;           // i18n key — translate or map to UI copy
  errCode: string | number;  // stable symbolic code — branch on this
  detail?: string;
};
```

**Common login error samples** (real responses):

```jsonc
// Unknown email / username — HTTP 401
{ "result": "ERR", "status": 401, "message": "errMsg_UserNotFound",
  "errCode": "UserNotFound", "date": "2026-04-26T12:51:51.917Z" }

// Right user, wrong password — HTTP 403
{ "result": "ERR", "status": 403, "message": "errMsg_PasswordDoesntMatch",
  "errCode": "WrongPassword", "date": "2026-04-26T12:52:00.446Z" }
```

Other common `errCode` values to branch on for auth flows: `EmailVerificationNeeded`, `MobileVerificationNeeded`, `EmailTwoFactorNeeded`, `MobileTwoFactorNeeded`, `InvalidOrExpiredSocialCode`, `MissingSocialCode`.

```tsx
const { mutate: login, isPending } = useLogin();
login({ username, password }, {
  onSuccess: (data) => {
    // data.accessToken, data.userId, data.sessionId, etc.
    // Check data.sessionNeedsEmail2FA / data.sessionNeedsMobile2FA to gate 2FA flow
  },
  onError: (err: ThrownAuthError) => {
    switch (err.errCode) {
      case "UserNotFound":   return setFormError("No account with this email.");
      case "WrongPassword":  return setFormError("Incorrect password.");
      case "EmailVerificationNeeded": return navigate("/verify-email");
      case "EmailTwoFactorNeeded":    return navigate("/2fa");
      default: return setFormError(err.message); // fallback i18n key
    }
  },
});
```

**`useCurrentUser()` is the one exception** — when no session exists the auth service catches the HTTP 401 and the hook resolves to `data: null` instead of erroring. So checking `data === null` on first load is the "logged-out" signal; only treat `error` as an error for unexpected failures.


### FRONTEND_URL

The `FRONTEND_URL` environment variable is automatically set on the auth service from the project's **frontendUrl** setting in Basic Project Settings. It is used by the auth service for:
- **Social login redirects** — after OAuth processing, the auth service redirects to `FRONTEND_URL + /auth/callback` (the frontend must have a page at this route; see the Social Login prompt for details)
- **Email notification links** — verification, password reset, and other links in emails point back to the frontend


## Registration Management


### User Registration

This application doesn't allow public user registration, so skip a public registration page. Users will be created only in the admin panel which will be described in the next prompt. Set up the login  and verification  flow. 


## Login Management

### Login Identifier Model

The **primary login identifier** for this application is the **email address**. Users register and log in using their email and password.
No mobile field is stored in the user data model. The login page should include an email input and a password input.


### Login Flow

After successful registration and completing any required verifications, the user can log in. Please create a minimal, polished login page as described above.

#### Quick-Fill SuperAdmin Credentials (demo convenience)

This project ships seeded SuperAdmin credentials so reviewers, AI agents, and demo users can sign in immediately after deployment without registering first. The values are baked into the auth service on first run from `loginDefinition.userSettings`:

- **Identifier:** `admin@fitcheck.com`
- **Password:** `superadmin`

On the login page, **either** pre-fill the identifier and password inputs with these values as default values (the user can clear or overwrite them before submitting) **or** render a small "Fill SuperAdmin" button next to the submit button that populates both inputs on click. Pick whichever fits the visual better — but do one of them, so a fresh deploy is signed in within seconds. This applies regardless of how the form submits the request (SDK hook or direct API call); only the credentials matter here.

Use the `useAuth()` context hook for login/logout and the `useCurrentUser()` query hook for session retrieval. The SDK handles token storage, cookie management, and auth header injection automatically.

If the login fails due to verification requirements, the response JSON includes an `errCode`. If it is `EmailVerificationNeeded`, start the email verification flow; if it is `MobileVerificationNeeded`, start the mobile verification flow.

After a successful login, you can access session (user) information at any time with the `useCurrentUser()` hook. On inner pages, show brief profile information (avatar, name, etc.) using the session information.

Note that the session/currentuser response has no `id` property; instead, the values for the user and session are exposed as `userId` and `sessionId`. The response combines user and session information.

### Login, Logout, and Session — SDK Hooks

Use `useAuth()` from `AuthContext` for login state, or `useLogin()` / `useLogout()` / `useCurrentUser()` hooks directly for more control. See the **Auth Hooks Reference** above for full signatures and return types.

On the login page:

```tsx
import { useLogin } from "@/hooks/api/use-auth";

const { mutate: login, isPending } = useLogin();

const handleSubmit = () => {
  login({ username: email, password }, {
    onSuccess: (data) => {
      // Check data.sessionNeedsEmail2FA / data.sessionNeedsMobile2FA for 2FA
      // If no 2FA, AuthContext updates automatically — navigate to home
    },
    onError: (err) => {
      // Flat error shape — see "Error Handling in Hooks" above.
      // err.errCode — e.g. "UserNotFound", "WrongPassword",
      // "EmailVerificationNeeded", "MobileVerificationNeeded",
      // "EmailTwoFactorNeeded", "MobileTwoFactorNeeded"
      // err.httpStatus — HTTP status (401/403/...)
      // err.message — i18n key (translate or map to UI copy)
    },
  });
};
```


#### Success Response

```json
{
  "sessionId": "e81c7d2b-4e95-9b1e-842e-3fb9c8c1df38",
  "userId": "d92b9d4c-9b1e-4e95-842e-3fb9c8c1df38",
  "email": "user@example.com",
  "fullname": "John Doe",
  //...
  "accessToken": "ey7....",
  "sessionNeedsEmail2FA": true,
  "sessionNeedsMobile2FA": true,

}
```

> **Note on file uploads:** The `accessToken` is the only token the frontend ever needs. File uploads — avatars via the auth service's `DbBucket`, plus any per-service `DbBucket` or `RemoteBucket` — all authenticate with that same Bearer token. There is no separate "bucket service token" to fetch.

> **Two-Factor Authentication (2FA):** When the login response contains `sessionNeedsEmail2FA: true or sessionNeedsMobile2FA: true`, the session is **not yet fully authorized**. The `accessToken` is valid but all protected API calls will return `403` until 2FA is completed. **Do not treat this login as successful** — instead, check the response in the `useLogin()` `onSuccess` callback and navigate the user to a 2FA verification page. The 2FA flow details are covered in the **Verification Management** prompt.

### Error Responses

* `401 Unauthorized`: Invalid credentials
* `403 Forbidden`: Email/mobile verification or 2FA pending
* `400 Bad Request`: Missing parameters

---


After you complete this step, please ensure you have not made the following common mistakes:

1. The raw `/currentuser` response (i.e. what `useCurrentUser()` returns) mixes session and user data into a single flat envelope. There is **no `id` property on the raw response** — use `userId` and `sessionId`. However, `useAuth().user` IS pre-mapped: the `AuthContext` exposes `user.id` (= `session.userId`) so consuming components can use `user.id` consistently. The raw `useCurrentUser()` data is what you'd inspect directly only when you need session-only fields like `sessionId`, `accessToken`, or `lastActiveAt`.

**After this prompt, the user may give you new instructions to update your output or provide subsequent prompts about the project.**
