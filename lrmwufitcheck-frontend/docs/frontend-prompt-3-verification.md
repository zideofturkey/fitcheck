

# **FITCHECK**

**FRONTEND GUIDE FOR AI CODING AGENTS - PART 3 - Verification Management**

This document is a part of a REST API guide for the fitcheck project.
It is designed for AI agents that will generate frontend code to consume the project's backend.

This document includes the verification processes for the autheitcation flow. Please read it carefully and implement all requirements described here.

The project has 1 auth service, 1 notification service, 1 BFF service, and 5 business services, plus other helper services such as bucket and realtime. In this document you will be informed only about the auth service. 

Each service is a separate microservice application and listens for HTTP requests at different service URLs.

Services may be deployed to the preview server, staging server, or production server. Therefore, each service has 3 access URLs.
The frontend application must support all deployment environments during development, and the user should be able to select the target API server on the home page.

## Accessing the backend

All verification hooks are imported from `@/hooks/api/use-auth`:

```tsx
import {
  useStartEmailVerification, useCompleteEmailVerification,
  useStartPasswordResetByEmail, useCompletePasswordResetByEmail,
} from "@/hooks/api/use-auth";
```

### Verification Types

```typescript
interface VerificationStartResponse {
  status: "OK";
  codeIndex?: number;
  timeStamp?: number;
  expireTime?: number;
  verificationType?: string;
  secretCode?: number;  // only in test/dev mode
  userId?: string;
}

interface VerificationCompleteResponse {
  status: "OK";
  isVerified: boolean;
}
```

### Verification Hooks

All hooks are mutations. All start hooks return `VerificationStartResponse`, all complete hooks return `VerificationCompleteResponse`.

**Email Verification**

| Hook | Payload | Notes |
|------|---------|-------|
| `useStartEmailVerification()` | `email: string` (raw, not object) | Sends code to email |
| `useCompleteEmailVerification()` | `{ email, secretCode }` | Invalidates session cache on success |


**Password Reset by Email**

| Hook | Payload | Notes |
|------|---------|-------|
| `useStartPasswordResetByEmail()` | `email: string` (raw, not object) | Sends reset code to email |
| `useCompletePasswordResetByEmail()` | `{ email, secretCode, password }` | Sets new password |


**Two-Factor Authentication (2FA)** — generated hooks. The user / session are read from the auth header on the backend, so neither `start` nor `complete` need `userId` or `sessionId` in the payload. Just pass the 6-digit code on `complete`.

| Hook | Payload | Notes |
|------|---------|-------|
| `useStartEmail2Factor()` | — (no body; auth required) | `VerificationStartResponse` — call once `sessionNeedsEmail2FA` is true |
| `useCompleteEmail2Factor()` | `secretCode: string` | `VerificationCompleteResponse` — invalidates the session cache so `useCurrentUser()` refreshes |

```tsx
import { useStartEmail2Factor, useCompleteEmail2Factor } from "@/hooks/api/use-auth";

const { mutate: start2FA } = useStartEmail2Factor();
const { mutate: complete2FA } = useCompleteEmail2Factor();

start2FA();                              // sends the code to the user's email
complete2FA(secretCode, {                // raw string, not an object
  onSuccess: () => navigate("/"),        // session is now fully authorized
});
```

> In test/dev mode, the `secretCode` is returned in every start response for easy testing. In production it is only sent via email/SMS.




## After User Registration
After a successful registration, the frontend code should handle any verification requirements. The registration response will include a `user` object in the root envelope; this object contains user information with an `id` field.
The user register response will include indicators for the frontend if any email or mobile verification is needed.

```json
{
  //....
  "emailVerificationNeeded": true,
  "mobileVerificationNeeded": true
}
```


## After User Registration

Frontend should also be aware of verification after any login attempt. 
The login request may return a 401 or 403 with the error codes that indicates the verification needs.

```json
{
  //...
  "errCode": "EmailVerificationNeeded",
  // or
  "errCode": "MobileVerificationNeeded",
}
```

## Email Verification

In the registration response, check the `emailVerificationNeeded` property in the response root. If it is `true`, start the email verification flow.

After the login process, if you receive an HTTP error and the response contains an `errCode` with the value `EmailVerificationNeeded`, start the email verification flow.

1. Call `useStartEmailVerification()` with the user's email. The backend will send a secret code to the provided email address. **In development, the `secretCode` is also returned in the response for testing.**
2. The secret code in the email will be a 6-digit code. Provide an input page so the user can paste this code into the frontend application. Navigate to this input page after starting the verification process. **If the `secretCode` is sent to the frontend for testing, display it on the input page so the user can copy and paste it.**
3. The `start` response includes a `codeIndex` property. Display its value on the input page so the user can match the index in the message with the one on the screen.
4. When the user submits the code, call `useCompleteEmailVerification()` with `{ email, secretCode }`.
5. After a successful email verification response, please check the response object to have the property 'mobileVerificationNeeded' as `true`, if so navigate to the mobile verification flow as described below. 
**If no mobile verification is needed then just navigate the login page.** 





## Resetting Password

Users can reset their forgotten passwords without a login required, through email verification.
To be able to start a password reset flow, users will click on the "Reset Password" link in the login page.





## Password Reset By Email Flow

1. Call `useStartPasswordResetByEmail()` with the user's email. The backend will send a secret code to the provided email address. **In development, the `secretCode` is also returned in the response.**
2. The secret code in the email will be a 6-digit code. Provide an input page so the user can paste this code into the frontend application. Navigate to this input page after starting the verification process. **If the `secretCode` is sent to the frontend for testing, display it on the input page so the user can copy and paste it.**
3. The `start` response includes a `codeIndex` property. Display its value on the input page so the user can match the index in the message with the one on the screen.
4. The input page should also include a double input area for the user to enter and confirm their new password.
5. When the user submits the code and the new password, call `useCompletePasswordResetByEmail()` with `{ email, secretCode, password }`.
6. After a successful verification response, navigate to the login page.







## Two-Factor Authentication (2FA)

**This project has email two-factor authentication enabled.** 2FA is different from email/mobile verification: verification proves ownership during registration (one-time), while **2FA runs on every login** as an additional security layer.

### How 2FA Works After Login

When a user logs in successfully, the login response includes `accessToken`, `userId`, `sessionId`, and all session data. However, when 2FA is active, the response **also** contains one or both of these flags:

* `sessionNeedsEmail2FA: true` — email 2FA is required

**When any of these flags are `true`, the session is NOT fully authorized.** The `accessToken` is valid only for calling the 2FA verification endpoints. All other protected API calls will return `403 Forbidden` with error code `EmailTwoFactorNeeded` or `MobileTwoFactorNeeded` until 2FA is completed.

### 2FA Frontend Flow

1. After a successful login, check the response for `sessionNeedsEmail2FA` or `sessionNeedsMobile2FA` (login returns 200 with the full session — `accessToken`, `userId`, `sessionId` and all user fields — *plus* the 2FA flag).
2. If either flag is `true`, **do not treat the user as authenticated and do not navigate to the app home**. The token from `useLogin` is already stored automatically; it's a *partial* token though — the backend's `enforce2FA(session)` will reject every protected call with `EmailTwoFactorNeeded` / `MobileTwoFactorNeeded` 403 until the 2FA flag is cleared. Only the 2FA verification endpoints (and `/currentuser`) accept it as-is.
3. Navigate the user to a **2FA verification page** instead of `/`.
4. On the 2FA page, immediately call `useStartEmail2Factor().mutate()` (no payload — the user/session are read from the auth header). This triggers sending the verification code to the user's email.
5. Display a 6-digit code input. **If the response contains `secretCode` (test/development mode), display it on the page so the user can copy and paste it.**
6. The `start` response includes a `codeIndex` property. Display its value on the page so the user can match the index in the message with the one on the screen.
7. When the user submits the code, call `useCompleteEmail2Factor().mutate(secretCode)` — pass the code as a raw string, no userId/sessionId needed.
8. On success, the `complete` endpoint returns the **updated session object** with the 2FA flag cleared. Now set the user as fully authenticated and navigate to the main application page.
9. Provide a "Resend Code" button with a **60-second cooldown** to prevent spam.
10. Provide a "Cancel" option that discards the partial session and returns the user to the login page.


### Important 2FA Notes

* **One code per session**: Only one active verification code exists per session at a time.
* **Resend throttling**: Code requests are throttled — wait at least 60 seconds between resend attempts.
* **Code expiration**: Codes expire after 86400 seconds.
* **Session stays valid**: The `accessToken` from login remains the same throughout the 2FA flow — you do not get a new token. The `complete` response returns the same session with the 2FA flag cleared.
* **`/currentuser` works during 2FA**: The `/currentuser` endpoint does **not** enforce 2FA, so it can be called during the 2FA flow. However, all other protected endpoints will return `403`.


 


** Please dont forget to arrange the code to be able to navigate to the verification pages both after registrations and login attempts if verification is needed.**
  

**After this prompt, the user may give you new instructions to update your first output or provide subsequent prompts about the project.**