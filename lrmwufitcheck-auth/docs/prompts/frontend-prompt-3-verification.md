# **FITCHECK**

**FRONTEND GUIDE FOR AI CODING AGENTS - PART 3 - Verification Management**

This document is a part of a REST API guide for the fitcheck project.
It is designed for AI agents that will generate frontend code to consume the project's backend.

This document includes the verification processes for the autheitcation flow. Please read it carefully and implement all requirements described here.

The project has 1 auth service, 1 notification service, 1 BFF service, and 1 business services, plus other helper services such as bucket and realtime. In this document you will be informed only about the auth service.

Each service is a separate microservice application and listens for HTTP requests at different service URLs.

Services may be deployed to the preview server, staging server, or production server. Therefore, each service has 3 access URLs.
The frontend application must support all deployment environments during development, and the user should be able to select the target API server on the home page.

## Accessing the backend

Each backend service has its own URL for each deployment environment. Users may want to test the frontend in one of the three deployments—preview, staging, or production. Please ensure that the home page includes a deployment server selection option so that, as the frontend coding agent, you can set the base URL for all services.

For the auth service, the base URLs are:

- **Preview:** `https://lrmwufitcheck.preview.mindbricks.com/auth-api`
- **Staging:** `https://lrmwufitcheck-stage.mindbricks.co/auth-api`
- **Production:** `https://lrmwufitcheck.mindbricks.co/auth-api`

Any request that requires login must include a valid token in the Bearer authorization header.

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
  "errCode": "MobileVerificationNeeded"
}
```

## Email Verification

In the registration response, check the `emailVerificationNeeded` property in the response root. If it is `true`, start the email verification flow.

After the login process, if you receive an HTTP error and the response contains an `errCode` with the value `EmailVerificationNeeded`, start the email verification flow.

1. Call the email verification `start` route of the backend (described below) with the user's email. The backend will send a secret code to the provided email address. **The backend can send the email if the architect has configured a real mail service or SMTP server. During development, the backend also returns the secret code to the frontend. You can read this code from the `secretCode` property of the response.**
2. The secret code in the email will be a 6-digit code. Provide an input page so the user can paste this code into the frontend application. Navigate to this input page after starting the verification process. **If the `secretCode` is sent to the frontend for testing, display it on the input page so the user can copy and paste it.**
3. The `start` response includes a `codeIndex` property. Display its value on the input page so the user can match the index in the message with the one on the screen.
4. When the user submits the code, complete the email verification using the `complete` route of the backend (described below) with the user's email and the secret code.
5. After a successful email verification response, please check the response object to have the property 'mobileVerificationNeeded' as `true`, if so navigate to the mobile verification flow as described below.
   **If no mobile verification is needed then just navigate the login page.**

Below are the `start` and `complete` routes for email verification. These are system routes and therefore are not versioned.

#### `POST /verification-services/email-verification/start`

**Purpose:**
Starts email verification by generating and sending a secret code.

| Parameter | Type   | Required | Description                    |
| --------- | ------ | -------- | ------------------------------ |
| `email`   | String | Yes      | User's email address to verify |

**Example Request**

```json
{ "email": "user@example.com" }
```

**Success Response**

```json
{
  "status": "OK",
  "codeIndex": 1,
  "timeStamp": 1784578660000,
  "date": "Mon Jul 20 2026 23:17:40 GMT+0300 (GMT+03:00)",
  "expireTime": 86400,
  "verificationType": "byLink",
  "secretCode": "123456",
  "userId": "user-uuid"
}
```

> ⚠️ In production, `secretCode` is **not** returned — it is only sent via email.

**Error Responses**

- `400 Bad Request`: Already verified
- `403 Forbidden`: Too many attempts (rate limit)

---

#### `POST /verification-services/email-verification/complete`

**Purpose:**
Completes verification using the received code.

| Parameter    | Type   | Required | Description       |
| ------------ | ------ | -------- | ----------------- |
| `email`      | String | Yes      | User's email      |
| `secretCode` | String | Yes      | Verification code |

**Success Response**

```json
{
  "status": "OK",
  "isVerified": true,
  "email": "user@email.com",
  "userId": "user-uuid"
}
```

**Error Responses**

- `403 Forbidden`: Code expired or mismatched
- `404 Not Found`: No verification in progress

---

## Resetting Password

Users can reset their forgotten passwords without a login required, through email verification.
To be able to start a password reset flow, users will click on the "Reset Password" link in the login page.

## Password Reset By Email Flow

1. Call the password reset by email verification `start` route of the backend (described below) with the user's email. The backend will send a secret code to the provided email address. **The backend can send the email if the architect has configured a real mail service or SMTP server. During development, the backend also returns the secret code to the frontend. You can read this code from the `secretCode` property of the response.**
2. The secret code in the email will be a 6-digit code. Provide an input page so the user can paste this code into the frontend application. Navigate to this input page after starting the verification process. **If the `secretCode` is sent to the frontend for testing, display it on the input page so the user can copy and paste it.**
3. The `start` response includes a `codeIndex` property. Display its value on the input page so the user can match the index in the message with the one on the screen.
4. The input page should also include a double input area for the user to enter and confirm their new password.
5. When the user submits the code and the new password, complete the password reset by email using the `complete` route of the backend (described below) with the user's email, the secret code and new password.
6. After a successful verification response, navigate to the login page.

Below are the `start` and `complete` routes for password reset by email verification. These are system routes and therefore are not versioned.

#### POST `/verification-services/password-reset-by-email/start`

**Purpose**:  
 Starts the password reset process by generating and sending a secret verification code.

#### Request Body

| Parameter | Type   | Required | Description                   |
| --------- | ------ | -------- | ----------------------------- |
| email     | String | Yes      | The email address of the user |

```json
{
  "email": "user@example.com"
}
```

**Success Response**

Returns secret code details (only in development environment) and confirmation that the verification step has been started.

```json
{
  "userId": "user-uuid",
  "email": "user@example.com",
  "codeIndex": 1,
  "secretCode": "123456",
  "timeStamp": 1765484354,
  "expireTime": 86400,
  "date": "2024-04-29T10:00:00.000Z",
  "verificationType": "byLink"
}
```

⚠️ In production, the secret code is only sent via email and not exposed in the API response.

**Error Responses**

- `401 NotAuthenticated`: Email address not found or not associated with a user.
- `403 Forbidden`: Sending a code too frequently (spam prevention).

---

#### POST `/verification-services/password-reset-by-email/complete`

**Purpose**:  
 Completes the password reset process by validating the secret code and updating the user's password.

#### Request Body

| Parameter  | Type   | Required | Description                            |
| ---------- | ------ | -------- | -------------------------------------- |
| email      | String | Yes      | The email address of the user          |
| secretCode | String | Yes      | The code received via email            |
| password   | String | Yes      | The new password the user wants to set |

```json
{
  "email": "user@example.com",
  "secretCode": "123456",
  "password": "newSecurePassword123"
}
```

**Success Response**

```json
{
  "userId": "user-uuid",
  "email": "user@example.com",
  "isVerified": true
}
```

**Error Responses**

- `403 Forbidden`:
  - Secret code mismatch
  - Secret code expired
  - No ongoing verification found

---

## Two-Factor Authentication (2FA)

**This project has email two-factor authentication enabled.** 2FA is different from email/mobile verification: verification proves ownership during registration (one-time), while **2FA runs on every login** as an additional security layer.

### How 2FA Works After Login

When a user logs in successfully, the login response includes `accessToken`, `userId`, `sessionId`, and all session data. However, when 2FA is active, the response **also** contains one or both of these flags:

- `sessionNeedsEmail2FA: true` — email 2FA is required

**When any of these flags are `true`, the session is NOT fully authorized.** The `accessToken` is valid only for calling the 2FA verification endpoints. All other protected API calls will return `403 Forbidden` with error code `EmailTwoFactorNeeded` or `MobileTwoFactorNeeded` until 2FA is completed.

### 2FA Frontend Flow

1. After a successful login, check the response for `sessionNeedsEmail2FA` or `sessionNeedsMobile2FA` (login returns 200 with the full session — `accessToken`, `userId`, `sessionId` and all user fields — _plus_ the 2FA flag).
2. If either flag is `true`, **do not treat the user as authenticated and do not navigate to the app home**. The token from `useLogin` is already stored automatically; it's a _partial_ token though — the backend's `enforce2FA(session)` will reject every protected call with `EmailTwoFactorNeeded` / `MobileTwoFactorNeeded` 403 until the 2FA flag is cleared. Only the 2FA verification endpoints (and `/currentuser`) accept it as-is.
3. Navigate the user to a **2FA verification page** instead of `/`.
4. On the 2FA page, immediately call the 2FA `start` endpoint (described below). The user / session are read from the auth header — no `userId` or `sessionId` in the payload. This triggers sending the verification code to the user's email.
5. Display a 6-digit code input. **If the response contains `secretCode` (test/development mode), display it on the page so the user can copy and paste it.**
6. The `start` response includes a `codeIndex` property. Display its value on the page so the user can match the index in the message with the one on the screen.
7. When the user submits the code, call the 2FA `complete` endpoint with just `secretCode` in the body (the auth header carries the user / session identity).
8. On success, the `complete` endpoint returns the **updated session object** with the 2FA flag cleared. Now set the user as fully authenticated and navigate to the main application page.
9. Provide a "Resend Code" button with a **60-second cooldown** to prevent spam.
10. Provide a "Cancel" option that discards the partial session and returns the user to the login page.

### Email 2FA Endpoints

#### `POST /verification-services/email-2factor-verification/start`

**Purpose:**
Starts email-based 2FA by generating and sending a verification code to the user's email.

| Parameter   | Type   | Required | Description            |
| ----------- | ------ | -------- | ---------------------- |
| `userId`    | String | Yes      | The user's ID          |
| `sessionId` | String | Yes      | The current session ID |

**Example Request**

```json
{
  "userId": "user-uuid",
  "sessionId": "session-uuid"
}
```

**Success Response**

```json
{
  "status": "OK",
  "sessionId": "session-uuid",
  "userId": "user-uuid",
  "codeIndex": 1,
  "timeStamp": 1784578660000,
  "date": "Mon Jul 20 2026 23:17:40 GMT+0300",
  "expireTime": 86400,
  "verificationType": "byCode",

  // in testMode only
  "secretCode": "123456"
}
```

> ⚠️ In production, `secretCode` is **not** returned — it is only sent via email.

**Error Responses**

- `403 Forbidden`: Code resend attempted before cooldown (60s)
- `401 Unauthorized`: Session not found

---

#### `POST /verification-services/email-2factor-verification/complete`

**Purpose:**
Completes email 2FA by validating the code and clearing the session 2FA flag.

| Parameter    | Type   | Required | Description                  |
| ------------ | ------ | -------- | ---------------------------- |
| `userId`     | String | Yes      | The user's ID                |
| `sessionId`  | String | Yes      | The session ID               |
| `secretCode` | String | Yes      | Verification code from email |

**Success Response**

Returns the updated session with `sessionNeedsEmail2FA: false`:

```json
{
  "sessionId": "session-uuid",
  "userId": "user-uuid",
  "email": "user@example.com",
  "fullname": "John Doe",
  "roleId": "user",
  "sessionNeedsEmail2FA": false,
  "accessToken": "jwt-token",
  "...": "..."
}
```

**Error Responses**

- `403 Forbidden`: Code mismatch or expired
- `403 Forbidden`: No ongoing verification found
- `401 Unauthorized`: Session does not exist

---

### Important 2FA Notes

- **One code per session**: Only one active verification code exists per session at a time.
- **Resend throttling**: Code requests are throttled — wait at least 60 seconds between resend attempts.
- **Code expiration**: Codes expire after 86400 seconds.
- **Session stays valid**: The `accessToken` from login remains the same throughout the 2FA flow — you do not get a new token. The `complete` response returns the same session with the 2FA flag cleared.
- **`/currentuser` works during 2FA**: The `/currentuser` endpoint does **not** enforce 2FA, so it can be called during the 2FA flow. However, all other protected endpoints will return `403`.

** Please dont forget to arrange the code to be able to navigate to the verification pages both after registrations and login attempts if verification is needed.**

**After this prompt, the user may give you new instructions to update your first output or provide subsequent prompts about the project.**
