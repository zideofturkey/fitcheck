# **FITCHECK** FRONTEND GUIDE FOR AI CODING AGENTS

This document is a rest api guide for the fitcheck project.
The document is designed for AI agents who will generate frontend code that will consume the project backend.

The project has got 1 auth service, 1 notification service, 1 bff service and business services.
Each service is a separate microservice application and listens the HTTP request from different service urls.

The services may be in preview server, staging server or real production server. So each service have got 3 acess urls.
Frontend application should support all deployemnt servers in the development phase,
and user should be able to select the target api server in the login page.

## Project Introduction

FitCheck is a private, invite-only nutrition and meal tracking web application designed for individual users who want to manage their daily nutrition intake in a secure, personal environment. Users can log meals through multiple methods—food library, preset templates, manual entry, or AI-assisted parsing—track daily progress against personalized macro targets, and gain insights through weekly and monthly analytics. The platform includes an integrated AI assistant that parses natural-language meal descriptions and provides context-aware nutrition guidance, all while maintaining strict data isolation and privacy for each user.

## API Structure

### Object Structure of a Successfull Response

When the service processes requests successfully, it wraps the requested resource(s) within a JSON envelope. This envelope not only contains the data but also includes essential metadata, such as configuration details and pagination information, to enrich the response and provide context to the client.

**HTTP Status Codes:**

- **200 OK**: This status code is returned for successful GET, LIST, UPDATE, or DELETE operations, indicating that the request has been processed successfully.
- **201 Created**: This status code is specific to CREATE operations, signifying that the requested resource has been successfully created.

**Success Response Format:**

For successful operations, the response includes a `"status": "OK"` property, signaling the successful execution of the request. The structure of a successful response is outlined below:

```json
{
  "status": "OK",
  "statusCode": 200,
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "products",
  "method": "GET",
  "action": "list",
  "appVersion": "Version",
  "rowCount": 3,
  "products": [{}, {}, {}],
  "paging": {
    "pageNumber": 1,
    "pageRowCount": 25,
    "totalRowCount": 3,
    "pageCount": 1
  },
  "filters": [],
  "uiPermissions": []
}
```

- **`products`**: In this example, this key contains the actual response content, which may be a single object or an array of objects depending on the operation performed.

### Additional Data

Each api may have include addtional data other than the main data object according to the business logic of the API. They will be given in each API's response signature.

### Error Response

If a request encounters an issue, whether due to a logical fault or a technical problem, the service responds with a standardized JSON error structure. The HTTP status code within this response indicates the nature of the error, utilizing commonly recognized codes for clarity:

- **400 Bad Request**: The request was improperly formatted or contained invalid parameters, preventing the server from processing it.
- **401 Unauthorized**: The request lacked valid authentication token , login required
- **403 Forbidden Error** Curent token provided do not grant access to the requested resource.
- **404 Not Found**: The requested resource was not found on the server.
- **500 Internal Server Error**: The server encountered an unexpected condition that prevented it from fulfilling the request.

Each error response is structured to provide meaningful insight into the problem, assisting in diagnosing and resolving issues efficiently.

```js
{
  "result": "ERR",
  "status": 400,
  "message": "errMsg_organizationIdisNotAValidID",
  "errCode": 400,
  "date": "2024-03-19T12:13:54.124Z",
  "detail": "String"
}
```

## Accessing the backend

Each service of the backend has got its own url according to the deployment environement. User may want to test the frontend in one of the 3 deployments of the application, preview, staging and production. Please ensure that register and login pages do have a deployemnt server selection option, so as the frontned coding agent you can arrange the base url path of all services.

The base url of the application in each environment is as follows:

- **Preview:** `https://lrmwufitcheck.preview.mindbricks.com`
- **Staging:** `https://lrmwufitcheck-stage.mindbricks.co`
- **Production:** `https://lrmwufitcheck.mindbricks.co`

For the auth service the base url is as follows:

- **Preview:** `https://lrmwufitcheck.preview.mindbricks.com/auth-api`
- **Staging:** `https://lrmwufitcheck-stage.mindbricks.co/auth-api`
- **Production:** `https://lrmwufitcheck.mindbricks.co/auth-api`

For each other service, the service base url will be given in service sections.

Any login requied request to the backend should have a valid token, when a user makes a successfull login, the ressponse JSON includes a JWT access token in the `accessToken`fields. In normal conditions, this token is also set to the cookie and then consumed automatically, but since AI coding agents preview options may fail to use cookies, please ensure that in each request include the access token in the bearer auth header.

## Registration Management

First of all please ensure that register and login pages do have a deployemnt server selection option, so as the frontned coding agent you can arrange the base url path of all services.

Start with a landing page and arranging register, verification and login flow. So at the first step, you need a general knowledge of the application to make a good landing page and the authetication flow.

### How To Register

Using `registeruser` route of auth api, send the required fields to the backend in your registration page.

The registerUser api in in `auth` service, is described with request and response structure below.

Note that since `registerUser` api is a business api, it has a version control, so please call it with the given version like `/v1/registeruser`

After a successful registration, frontend code should handle the verification needs. The registration response will have a `user` object in the root envelope, this object will have user information with an `id` parameter.

### Email Verification

In the registration response, you should check the property `emailVerificationNeeded` in the reponse root, and if this property is true you should start the email verification flow.

After login process, if you get an HTTP error status, and if there is an `errCode` property in the response with `EmailVerificationNeeded` value, you should start the email verification flow.

1. Call the email verification `start` route of the backend (described below) with the user email, backend will send a secret code to the given email adresss. **Backend can send the email message if the architect defined a real mail service or smtp server, so during the development time backend will send the secret code also to the frontend. You can get this secret code from the response within the `secretCode` property**.
2. The secret code in the sent email message will be a 6 digits code , and you should arrange an input page so that the user can paste this code to the frontend application. Please navigate to this input page after you start the verification process. **If the secretCode is sent to the frontend for test purposes, then you should show it as info in the input page, so that user can copy and paste it**.
3. There is a `codeIndex` property in the start response, please show it's value on the input page, so that user can match the index in the message with the one on the screen.
4. When the user submits the code, please complete the email verification using the `complete` route of the backend (described below) with the user email and the secret code.
5. After you get a successful response from email verification, you can navigate to the login page.

Here is the `start`and `complete` routes of email verification. These are system routes , so they dont have a version control.

#### `POST /verification-services/email-verification/start`

**Purpose:**
Starts the email verification by generating and sending a secret code.

| Parameter | Type   | Required | Description                    |
| --------- | ------ | -------- | ------------------------------ |
| `email`   | String | Yes      | User’s email address to verify |

**Example Request**

```json
{ "email": "user@example.com" }
```

**Success Response**

```json
{
  "status": "OK",
  "codeIndex": 1,
  // timeStamp : Milliseconds since Jan 1, 1970, 00:00:00.000 GMT
  "timeStamp": 1784578660000,
  "date": "Mon Jul 20 2026 23:17:40 GMT+0300 (GMT+03:00)",
  // expireTime: in seconds
  "expireTime": 86400,
  "verificationType": "byLink",

  // in testMode
  "secretCode": "123456",
  "userId": "user-uuid"
}
```

> ⚠️ In production, `secretCode` is **not** returned — only sent via email.

**Error Responses**

- `400 Bad Request`: Already verified
- `403 Forbidden`: Too many attempts (rate limit)

---

#### `POST /verification-services/email-verification/complete`

**Purpose:**
Completes the verification using the received code.

| Parameter    | Type   | Required | Description       |
| ------------ | ------ | -------- | ----------------- |
| `email`      | String | Yes      | User’s email      |
| `secretCode` | String | Yes      | Verification code |

**Success Response**

```json
{
  "status": "OK",
  "isVerified": true,
  "email": "user@email.com",
  // in testMode
  "userId": "user-uuid"
}
```

**Error Responses**

- `403 Forbidden`: Code expired or mismatched
- `404 Not Found`: No verification in progress

---

## Login Management

After a successfull login and completing required verifications, user can now login. Please make a fancy minimal login page where user can enter his email and password.

## Bucket Management

### Database Buckets (dbBuckets) — For Avatars

User and tenant avatars are stored using **database buckets (dbBuckets)**, which are built into the auth service. dbBuckets do not require separate bucket tokens — they use the regular access token.

**User Avatar Upload:**

`POST {authBaseUrl}/bucket/userAvatars/upload`

- Authentication: Regular access token (Bearer header)
- Content-Type: `multipart/form-data`
- Body: the image file in the `files` field

The response returns an `accessKey` that you use to build the public download URL:

`GET {authBaseUrl}/bucket/userAvatars/download/key/{accessKey}`

This download URL is **public** (no authentication required) and can be used directly as the avatar URL.

### Remote Buckets (RemoteBucket) — For Medium & Large Files

For files larger than a few MB, high-volume uploads, or media served via CDN (product images, videos, documents, audio), services declare a **`RemoteBucket`** that stores bytes in an external object store (S3, GCS, Azure Blob, R2, MinIO). Only metadata lives in the service DB. Each remote bucket exposes its own upload/download routes under that service's URL — `POST {serviceUrl}/remotebucket/{bucketName}/upload`, `GET {serviceUrl}/remotebucket/{bucketName}/download/{fileId}`, etc.

You authenticate to remote-bucket routes with the **regular access token** — the same Bearer header you use for the rest of the service's API. There is no separate bucket-service token to fetch or refresh.

Downloads may return a `302` redirect to a short-lived signed URL (the bucket's `urlStrategy` — `presigned` by default for direct client-to-storage downloads) or stream bytes through the service (`proxy` strategy). Browsers follow the redirect transparently; if you do the request yourself, use `fetch(..., { redirect: 'follow' })`.

Each service's frontend prompt and API guide enumerates that service's remote buckets — names, owner relations, access levels, and example payloads. Treat them as part of the service's API surface, not as a separate "bucket service".

## Role Management

This Fitcheck may have different role names defined fro different business logic. But unless another case is asked by the user, respect to the admin roles which may be `superAdmin`, `admin` or `saasAdmin` in the currentuser or login response given with the `roleId`property.

```json
{
  // ...
  "roleId": "superAdmin"
  // ...
}
```

If the application needs an admin panel, or any admin related page, please use these roleId's to decide if the user can access those pages or not.

## 1. Authentication Routes

### 1.1 `POST /login` — User Login

**Purpose:**
Verifies user credentials and creates an authenticated session with a JWT access token.

**Access Routes:**

- `GET /login`: Returns a minimal HTML login page (for browser-based testing).
- `POST /login`: Authenticates user credentials and returns an access token and session.

#### Request Parameters

| Parameter  | Type   | Required | Source                  |
| ---------- | ------ | -------- | ----------------------- |
| `username` | String | Yes      | `request.body.username` |
| `password` | String | Yes      | `request.body.password` |

#### Behavior

- Authenticates credentials and returns a session object.
- Sets cookie: `projectname-access-token[-tenantCodename]`
- Adds the same token in response headers.
- Accepts either `username` or `email` fields (if both exist, `username` is prioritized).

#### Example

```js
axios.post("/login", {
  username: "user@example.com",
  password: "securePassword",
});
```

#### Success Response

```json
{
  "userId": "d92b9d4c-9b1e-4e95-842e-3fb9c8c1df38",
  "email": "user@example.com",
  "fullname": "John Doe"
  //...
}
```

#### Error Responses

- `401 Unauthorized`: Invalid credentials
- `403 Forbidden`: Email/mobile verification or 2FA pending
- `400 Bad Request`: Missing parameters

---

### 1.2 `POST /logout` — User Logout

**Purpose:**
Terminates the current session and clears associated authentication tokens.

#### Behavior

- Invalidates session (if exists).
- Clears cookie `projectname-access-token[-tenantCodename]`.
- Returns a confirmation response (always `200 OK`).

#### Example

```js
axios.post(
  "/logout",
  {},
  {
    headers: { Authorization: "Bearer your-jwt-token" },
  },
);
```

#### Notes

- Can be called without a session (idempotent behavior).
- Works for both cookie-based and token-based sessions.

#### Success Response

```json
{ "status": "OK", "message": "User logged out successfully" }
```

---

## 2. Verification Services Overview

All verification routes are grouped under the `/verification-services` base path.
They follow a **two-step verification pattern**: `start` → `complete`.

---

## 3. Email Verification

### 3.1 Trigger Scenarios

- After registration (`emailVerificationRequiredForLogin` = true)
- When updating email address
- When login fails due to unverified email

### 3.2 Flow Summary

1. `/start` → Generate & send code via email.
2. `/complete` → Verify code and mark email as verified.

** PLEASE NOTE **

Email verification is a frontend triiggered process. After user registers, the frontend should start the email verification process and navigate to its code input page.

---

### 3.3 `POST /verification-services/email-verification/start`

**Purpose:**
Starts the email verification by generating and sending a secret code.

| Parameter | Type   | Required | Description                    |
| --------- | ------ | -------- | ------------------------------ |
| `email`   | String | Yes      | User’s email address to verify |

**Example Request**

```json
{ "email": "user@example.com" }
```

**Success Response**

```json
{
  "status": "OK",
  "codeIndex": 1,
  // timeStamp : Milliseconds since Jan 1, 1970, 00:00:00.000 GMT
  "timeStamp": 1784578660000,
  "date": "Mon Jul 20 2026 23:17:40 GMT+0300 (GMT+03:00)",
  // expireTime: in seconds
  "expireTime": 86400,
  "verificationType": "byLink",

  // in testMode
  "secretCode": "123456",
  "userId": "user-uuid"
}
```

> ⚠️ In production, `secretCode` is **not** returned — only sent via email.

**Error Responses**

- `400 Bad Request`: Already verified
- `403 Forbidden`: Too many attempts (rate limit)

---

### 3.4 `POST /verification-services/email-verification/complete`

**Purpose:**
Completes the verification using the received code.

| Parameter    | Type   | Required | Description       |
| ------------ | ------ | -------- | ----------------- |
| `email`      | String | Yes      | User’s email      |
| `secretCode` | String | Yes      | Verification code |

**Success Response**

```json
{
  "status": "OK",
  "isVerified": true,
  "email": "user@email.com",
  // in testMode
  "userId": "user-uuid"
}
```

**Error Responses**

- `403 Forbidden`: Code expired or mismatched
- `404 Not Found`: No verification in progress

---

### 3.5 Behavioral Notes

- **Resend Cooldown:** `resendTimeWindow` (e.g. 60s)
- **Expiration:** Codes expire after `expireTimeWindow` (e.g. 1 day)
- **Single Active Session:** One verification per user

---

## 4. Mobile Verification

### 4.1 Trigger Scenarios

- After registration (`mobileVerificationRequiredForLogin` = true)
- When updating phone number
- On login requiring mobile verification

### 4.2 Flow

1. `/start` → Sends verification code via SMS
2. `/complete` → Validates code and confirms number

---

### 4.3 `POST /verification-services/mobile-verification/start`

| Parameter | Type   | Required | Description                          |
| --------- | ------ | -------- | ------------------------------------ |
| `email`   | String | Yes      | User’s email to locate mobile record |

**Success Response**

```json
{
  "status": "OK",
  "codeIndex": 1,
  // timeStamp : Milliseconds since Jan 1, 1970, 00:00:00.000 GMT
  "timeStamp": 1784578660000,
  "date": "Mon Jul 20 2026 23:17:40 GMT+0300 (GMT+03:00)",
  // expireTime: in seconds
  "expireTime": 180,
  "verificationType": "byCode",

  // in testMode
  "secretCode": "123456",
  "userId": "user-uuid"
}
```

> ⚠️ `secretCode` returned only in development.

**Errors**

- `400 Bad Request`: Already verified
- `403 Forbidden`: Rate-limited

---

### 4.4 `POST /verification-services/mobile-verification/complete`

| Parameter    | Type   | Required | Description           |
| ------------ | ------ | -------- | --------------------- |
| `email`      | String | Yes      | Associated email      |
| `secretCode` | String | Yes      | Code received via SMS |

**Success Response**

```json
{
  "status": "OK",
  "isVerified": true,
  "mobile": "+1 333 ...",
  // in testMode
  "userId": "user-uuid"
}
```

---

### 4.5 Behavioral Notes

- **Cooldown:** One code per minute
- **Expiration:** Codes valid for 1 day
- **One Session Per User**

---

## 5. Two-Factor Authentication (2FA)

### 5.1 Email 2FA

**Flow**

1. `/start` → Generates and sends email code
2. `/complete` → Verifies code and updates session

---

#### `POST /verification-services/email-2factor-verification/start`

| Parameter   | Type   | Required | Description      |
| ----------- | ------ | -------- | ---------------- |
| `userId`    | String | Yes      | User ID          |
| `sessionId` | String | Yes      | Current session  |
| `client`    | String | No       | Optional context |
| `reason`    | String | No       | Reason for 2FA   |

**Response**

```json
{
  "status": "OK",
  "sessionId": "user session id UUID",
  "userId": "user-uuid",
  "codeIndex": 1,
  // timeStamp : Milliseconds since Jan 1, 1970, 00:00:00.000 GMT
  "timeStamp": 1784578660000,
  "date": "Mon Jul 20 2026 23:17:40 GMT+0300 (GMT+03:00)",
  // expireTime: in seconds
  "expireTime": 86400,
  "verificationType": "byLink",

  // in testMode
  "secretCode": "123456"
}
```

---

#### `POST /verification-services/email-2factor-verification/complete`

| Parameter    | Type   | Required | Description     |
| ------------ | ------ | -------- | --------------- |
| `userId`     | String | Yes      | User ID         |
| `sessionId`  | String | Yes      | Session ID      |
| `secretCode` | String | Yes      | Code from email |

**Response**

```json
{
  // user session data
  "sessionId": "session-uuid"
  // ...
}
```

---

### 5.2 Mobile 2FA

**Flow**

1. `/start` → Sends SMS code
2. `/complete` → Validates and finalizes session

---

#### `POST /verification-services/mobile-2factor-verification/start`

| Parameter   | Type   | Required | Description |
| ----------- | ------ | -------- | ----------- |
| `userId`    | String | Yes      | User ID     |
| `sessionId` | String | Yes      | Session ID  |
| `client`    | String | No       | Context     |
| `reason`    | String | No       | Reason      |

**Response**

```json
{
  "status": "OK",
  "sessionId": "user session id UUID",
  "userId": "user-uuid",
  "codeIndex": 1,
  // timeStamp : Milliseconds since Jan 1, 1970, 00:00:00.000 GMT
  "timeStamp": 1784578660000,
  "date": "Mon Jul 20 2026 23:17:40 GMT+0300 (GMT+03:00)",
  // expireTime: in seconds
  "expireTime": 86400,
  "verificationType": "byLink",

  // in testMode
  "secretCode": "123456"
}
```

---

#### `POST /verification-services/mobile-2factor-verification/complete`

| Parameter    | Type   | Required | Description  |
| ------------ | ------ | -------- | ------------ |
| `userId`     | String | Yes      | User ID      |
| `sessionId`  | String | Yes      | Session ID   |
| `secretCode` | String | Yes      | Code via SMS |

**Response**

```json
{
  // user session data
  "sessionId": "session-uuid"
  // ...
}
```

---

### 5.3 2FA Behavioral Notes

- One active code per session
- Cooldown: `resendTimeWindow` (e.g., 60s)
- Expiration: `expireTimeWindow` (e.g., 5m)

---

## 6. Password Reset

### 6.1 By Email

**Flow**

1. `/start` → Sends verification code via email
2. `/complete` → Validates and resets password

---

#### `POST /verification-services/password-reset-by-email/start`

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| `email`   | String | Yes      | User email  |

**Response**

```json
{
  "status": "OK",
  "codeIndex": 1,
  // timeStamp : Milliseconds since Jan 1, 1970, 00:00:00.000 GMT
  "timeStamp": 1784578660000,
  "date": "Mon Jul 20 2026 23:17:40 GMT+0300 (GMT+03:00)",
  // expireTime: in seconds
  "expireTime": 86400,
  "verificationType": "byLink",

  // in testMode
  "secretCode": "123456",
  "userId": "user-uuid"
}
```

#### `POST /verification-services/password-reset-by-email/complete`

| Parameter    | Type   | Required | Description   |
| ------------ | ------ | -------- | ------------- |
| `email`      | String | Yes      | User email    |
| `secretCode` | String | Yes      | Code received |
| `password`   | String | Yes      | New password  |

**Response**

```json
{
  "status": "OK",
  "isVerified": true,
  "email": "user@email.com",
  // in testMode
  "userId": "user-uuid"
}
```

---

### 6.2 By Mobile

**Flow**

1. `/start` → Sends SMS code
2. `/complete` → Validates and resets password

---

#### `POST /verification-services/password-reset-by-mobile/start`

| Parameter | Type   | Required | Description   |
| --------- | ------ | -------- | ------------- |
| `mobile`  | String | Yes      | Mobile number |

**Response**

```json
{
  "status": "OK",
  "codeIndex": 1,
  // timeStamp : Milliseconds since Jan 1, 1970, 00:00:00.000 GMT
  "timeStamp": 1784578660000,
  "date": "Mon Jul 20 2026 23:17:40 GMT+0300 (GMT+03:00)",
  // expireTime: in seconds
  "expireTime": 86400,
  "verificationType": "byLink",

  // in testMode
  "secretCode": "123456",
  "userId": "user-uuid"
}
```

#### `POST /verification-services/password-reset-by-mobile/complete`

| Parameter    | Type   | Required | Description      |
| ------------ | ------ | -------- | ---------------- |
| `email`      | String | Yes      | Associated email |
| `secretCode` | String | Yes      | Code via SMS     |
| `password`   | String | Yes      | New password     |

**Response**

```json
{
  "status": "OK",
  "isVerified": true,
  "mobile": "+1 444 ....",
  // in testMode
  "userId": "user-uuid"
}
```

---

### 6.3 Behavioral Notes

- Cooldown: 60s resend
- Expiration: 24h
- One session per user
- Works without an active login session

---

## 7. Verification Method Types

### 7.1 `byCode`

User manually enters the 6-digit code in frontend.

### 7.2 `byLink`

Frontend handles a one-click verification via email/SMS link containing code parameters.

## 8) `GET /currentuser` — Current Session

**Purpose**
Return the currently authenticated user’s session.

**Route Type**
`sessionInfo`

**Authentication**
Requires a valid access token (header or cookie).

### Request

_No parameters._

### Example

```js
axios.get("/currentuser", {
  headers: { Authorization: "Bearer <jwt>" },
});
```

### Success (200)

Returns the session object (identity, tenancy, token metadata):

```json
{
  "sessionId": "9cf23fa8-07d4-4e7c-80a6-ec6d6ac96bb9",
  "userId": "d92b9d4c-9b1e-4e95-842e-3fb9c8c1df38",
  "email": "user@example.com",
  "fullname": "John Doe",
  "roleId": "user",
  "tenantId": "abc123",
  "accessToken": "jwt-token-string",
  "...": "..."
}
```

### Errors

- **401 Unauthorized** — No active session/token

  ```json
  { "status": "ERR", "message": "No login found" }
  ```

**Notes**

- Commonly called by web/mobile clients after login to hydrate session state.
- Includes key identity/tenant fields and a token reference (if applicable).
- Ensure a valid token is supplied to receive a 200 response.

---

## 9) `GET /permissions` — List Effective Permissions

**Purpose**
Return all effective permission grants for the current user.

**Route Type**
`permissionFetch`

**Authentication**
Requires a valid access token.

### Request

_No parameters._

### Example

```js
axios.get("/permissions", {
  headers: { Authorization: "Bearer <jwt>" },
});
```

### Success (200)

Array of permission grants (aligned with `givenPermissions`):

```json
[
  {
    "id": "perm1",
    "permissionName": "adminPanel.access",
    "roleId": "admin",
    "subjectUserId": "d92b9d4c-9b1e-4e95-842e-3fb9c8c1df38",
    "subjectUserGroupId": null,
    "objectId": null,
    "canDo": true,
    "tenantCodename": "store123"
  },
  {
    "id": "perm2",
    "permissionName": "orders.manage",
    "roleId": null,
    "subjectUserId": "d92b9d4c-9b1e-4e95-842e-3fb9c8c1df38",
    "subjectUserGroupId": null,
    "objectId": null,
    "canDo": true,
    "tenantCodename": "store123"
  }
]
```

**Field meanings (per item):**

- `permissionName`: Granted permission key.
- `roleId`: Present if granted via role.
- `subjectUserId`: Present if granted directly to the user.
- `subjectUserGroupId`: Present if granted via group.
- `objectId`: Present if scoped to a specific object (OBAC).
- `canDo`: `true` if enabled, `false` if restricted.

### Errors

- **401 Unauthorized** — No active session

  ```json
  { "status": "ERR", "message": "No login found" }
  ```

- **500 Internal Server Error** — Unexpected failure

**Notes**

- Available on all Mindbricks-generated services (not only Auth).
- **Auth service:** Reads live `givenPermissions` from DB.
- **Other services:** Typically respond from a cached/projected view (e.g., ElasticSearch) for faster checks.

> **Tip:** Cache permission results client-side/server-side and refresh after login or permission updates.

---

## 10) `GET /permissions/:permissionName` — Check Permission Scope

**Purpose**
Check whether the current user has a specific permission and return any scoped object exceptions/inclusions.

**Route Type**
`permissionScopeCheck`

**Authentication**
Requires a valid access token.

### Path Parameters

| Name             | Type   | Required | Source                          |
| ---------------- | ------ | -------- | ------------------------------- |
| `permissionName` | String | Yes      | `request.params.permissionName` |

### Example

```js
axios.get("/permissions/orders.manage", {
  headers: { Authorization: "Bearer <jwt>" },
});
```

### Success (200)

```json
{
  "canDo": true,
  "exceptions": [
    "a1f2e3d4-xxxx-yyyy-zzzz-object1",
    "b2c3d4e5-xxxx-yyyy-zzzz-object2"
  ]
}
```

**Interpretation**

- If `canDo: true`: permission is generally granted **except** the listed `exceptions` (restrictions).
- If `canDo: false`: permission is generally **not** granted, **only** allowed for the listed `exceptions` (selective overrides).
- `exceptions` contains object IDs (UUID strings) from the relevant domain model.

### Errors

- **401 Unauthorized** — No active session/token.

## Services And Data Object

## Auth Service

Authentication service for the project

### Auth Service Data Objects

**User**
A data object that stores the user information and handles login settings.

**UserAvatarsFile**
Auto-generated file storage for the userAvatars database bucket. Files are stored as BYTEA in PostgreSQL.

### Auth Service Access urls

This service is accessible via the following environment-specific URLs:

- **Preview:** `https://lrmwufitcheck.preview.mindbricks.com/auth-api`
- **Staging:** `https://lrmwufitcheck-stage.mindbricks.co/auth-api`
- **Production:** `https://lrmwufitcheck.mindbricks.co/auth-api`

### `Get User` API

This api is used by admin roles or the users themselves to get the user profile information.

**Rest Route**

The `getUser` API REST controller can be triggered via the following route:

`/v1/users/:userId`

**Rest Request Parameters**

The `getUser` api has got 1 regular request parameter

| Parameter | Type | Required | Population                 |
| --------- | ---- | -------- | -------------------------- |
| userId    | ID   | true     | request.params?.["userId"] |

**userId** : This id paremeter is used to query the required data object.

**REST Request**
To access the api you can use the **REST** controller with the path **GET /v1/users/:userId**

```js
axios({
  method: "GET",
  url: `/v1/users/${userId}`,
  data: {},
  params: {},
});
```

**REST Response**

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "user",
  "method": "GET",
  "action": "get",
  "appVersion": "Version",
  "rowCount": 1,
  "user": {
    "id": "ID",
    "email": "String",
    "password": "String",
    "fullname": "String",
    "avatar": "String",
    "roleId": "String",
    "emailVerified": "Boolean",
    "isActive": true,
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID"
  }
}
```

### `Update User` API

This route is used by admins to update user profiles.

**Rest Route**

The `updateUser` API REST controller can be triggered via the following route:

`/v1/users/:userId`

**Rest Request Parameters**

The `updateUser` api has got 3 regular request parameters

| Parameter | Type   | Required | Population                 |
| --------- | ------ | -------- | -------------------------- |
| userId    | ID     | true     | request.params?.["userId"] |
| fullname  | String | false    | request.body?.["fullname"] |
| avatar    | String | false    | request.body?.["avatar"]   |

**userId** : This id paremeter is used to select the required data object that will be updated
**fullname** : User's full name.
**avatar** : Avatar URL.

**REST Request**
To access the api you can use the **REST** controller with the path **PATCH /v1/users/:userId**

```js
axios({
  method: "PATCH",
  url: `/v1/users/${userId}`,
  data: {
    fullname: "String",
    avatar: "String",
  },
  params: {},
});
```

**REST Response**

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "user",
  "method": "PATCH",
  "action": "update",
  "appVersion": "Version",
  "rowCount": 1,
  "user": {
    "id": "ID",
    "email": "String",
    "password": "String",
    "fullname": "String",
    "avatar": "String",
    "roleId": "String",
    "emailVerified": "Boolean",
    "isActive": true,
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID"
  }
}
```

### `Update Profile` API

This route is used by users to update their own profiles. The target user is always the session user — no userId is needed in the URL.

**Rest Route**

The `updateProfile` API REST controller can be triggered via the following route:

`/v1/profile`

**Rest Request Parameters**

The `updateProfile` api has got 2 regular request parameters

| Parameter | Type   | Required | Population                 |
| --------- | ------ | -------- | -------------------------- |
| fullname  | String | false    | request.body?.["fullname"] |
| avatar    | String | false    | request.body?.["avatar"]   |

**fullname** : User's full name.
**avatar** : Avatar URL.

**REST Request**
To access the api you can use the **REST** controller with the path **PATCH /v1/profile**

```js
axios({
  method: "PATCH",
  url: "/v1/profile",
  data: {
    fullname: "String",
    avatar: "String",
  },
  params: {},
});
```

**REST Response**

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "user",
  "method": "PATCH",
  "action": "update",
  "appVersion": "Version",
  "rowCount": 1,
  "user": {
    "id": "ID",
    "email": "String",
    "password": "String",
    "fullname": "String",
    "avatar": "String",
    "roleId": "String",
    "emailVerified": "Boolean",
    "isActive": true,
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID"
  }
}
```

### `Create User` API

This api is used by admin roles to create a new user manually from admin panels

**Rest Route**

The `createUser` API REST controller can be triggered via the following route:

`/v1/users`

**Rest Request Parameters**

The `createUser` api has got 4 regular request parameters

| Parameter | Type   | Required | Population                 |
| --------- | ------ | -------- | -------------------------- |
| email     | String | true     | request.body?.["email"]    |
| password  | String | true     | request.body?.["password"] |
| fullname  | String | true     | request.body?.["fullname"] |
| avatar    | String | false    | request.body?.["avatar"]   |

**email** : User's email address.
**password** : User's password (will be hashed at write time).
**fullname** : User's full name.
**avatar** : The avatar url of the user. If not sent, a default random one will be generated.

**REST Request**
To access the api you can use the **REST** controller with the path **POST /v1/users**

```js
axios({
  method: "POST",
  url: "/v1/users",
  data: {
    email: "String",
    password: "String",
    fullname: "String",
    avatar: "String",
  },
  params: {},
});
```

**REST Response**

```json
{
  "status": "OK",
  "statusCode": "201",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "user",
  "method": "POST",
  "action": "create",
  "appVersion": "Version",
  "rowCount": 1,
  "user": {
    "id": "ID",
    "email": "String",
    "password": "String",
    "fullname": "String",
    "avatar": "String",
    "roleId": "String",
    "emailVerified": "Boolean",
    "isActive": true,
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID"
  }
}
```

### `Delete User` API

This api is used by admins to delete user profiles.

**Rest Route**

The `deleteUser` API REST controller can be triggered via the following route:

`/v1/users/:userId`

**Rest Request Parameters**

The `deleteUser` api has got 1 regular request parameter

| Parameter | Type | Required | Population                 |
| --------- | ---- | -------- | -------------------------- |
| userId    | ID   | true     | request.params?.["userId"] |

**userId** : This id paremeter is used to select the required data object that will be deleted

**REST Request**
To access the api you can use the **REST** controller with the path **DELETE /v1/users/:userId**

```js
axios({
  method: "DELETE",
  url: `/v1/users/${userId}`,
  data: {},
  params: {},
});
```

**REST Response**

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "user",
  "method": "DELETE",
  "action": "delete",
  "appVersion": "Version",
  "rowCount": 1,
  "user": {
    "id": "ID",
    "email": "String",
    "password": "String",
    "fullname": "String",
    "avatar": "String",
    "roleId": "String",
    "emailVerified": "Boolean",
    "isActive": false,
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID"
  }
}
```

### `Archive Profile` API

This api is used by users to archive their own profiles. The target user is always the session user — no userId is needed in the URL.

**Rest Route**

The `archiveProfile` API REST controller can be triggered via the following route:

`/v1/archiveprofile`

**Rest Request Parameters**
The `archiveProfile` api has got no request parameters.

**REST Request**
To access the api you can use the **REST** controller with the path **DELETE /v1/archiveprofile**

```js
axios({
  method: "DELETE",
  url: "/v1/archiveprofile",
  data: {},
  params: {},
});
```

**REST Response**

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "user",
  "method": "DELETE",
  "action": "delete",
  "appVersion": "Version",
  "rowCount": 1,
  "user": {
    "id": "ID",
    "email": "String",
    "password": "String",
    "fullname": "String",
    "avatar": "String",
    "roleId": "String",
    "emailVerified": "Boolean",
    "isActive": false,
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID"
  }
}
```

### `List Users` API

The list of users is filtered by the tenantId.

**Rest Route**

The `listUsers` API REST controller can be triggered via the following route:

`/v1/users`

**Rest Request Parameters**

**Filter Parameters**

The `listUsers` api supports 3 optional filter parameters for filtering list results:

**email** (`String`): A string value to represent the user's email.

- Single (partial match, case-insensitive): `?email=<value>`
- Multiple: `?email=<value1>&email=<value2>`
- Null: `?email=null`

**fullname** (`String`): A string value to represent the fullname of the user

- Single (partial match, case-insensitive): `?fullname=<value>`
- Multiple: `?fullname=<value1>&fullname=<value2>`
- Null: `?fullname=null`

**roleId** (`String`): A string value to represent the roleId of the user.

- Single (partial match, case-insensitive): `?roleId=<value>`
- Multiple: `?roleId=<value1>&roleId=<value2>`
- Null: `?roleId=null`

**REST Request**
To access the api you can use the **REST** controller with the path **GET /v1/users**

```js
axios({
  method: "GET",
  url: "/v1/users",
  data: {},
  params: {
    // Filter parameters (see Filter Parameters section above)
    // email: '<value>' // Filter by email
    // fullname: '<value>' // Filter by fullname
    // roleId: '<value>' // Filter by roleId
  },
});
```

**REST Response**

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "users",
  "method": "GET",
  "action": "list",
  "appVersion": "Version",
  "rowCount": "\"Number\"",
  "users": [
    {
      "id": "ID",
      "email": "String",
      "password": "String",
      "fullname": "String",
      "avatar": "String",
      "roleId": "String",
      "emailVerified": "Boolean",
      "isActive": true,
      "recordVersion": "Integer",
      "createdAt": "Date",
      "updatedAt": "Date",
      "_owner": "ID"
    },
    {},
    {}
  ],
  "paging": {
    "pageNumber": "Number",
    "pageRowCount": "NUmber",
    "totalRowCount": "Number",
    "pageCount": "Number"
  },
  "filters": [],
  "uiPermissions": []
}
```

### `Search Users` API

The list of users is filtered by the tenantId.

**Rest Route**

The `searchUsers` API REST controller can be triggered via the following route:

`/v1/searchusers`

**Rest Request Parameters**

The `searchUsers` api has got 1 regular request parameter

| Parameter | Type   | Required | Population                 |
| --------- | ------ | -------- | -------------------------- |
| keyword   | String | true     | request.query?.["keyword"] |

**keyword** :

**Filter Parameters**

The `searchUsers` api supports 1 optional filter parameter for filtering list results:

**roleId** (`String`): A string value to represent the roleId of the user.

- Single (partial match, case-insensitive): `?roleId=<value>`
- Multiple: `?roleId=<value1>&roleId=<value2>`
- Null: `?roleId=null`

**REST Request**
To access the api you can use the **REST** controller with the path **GET /v1/searchusers**

```js
axios({
  method: "GET",
  url: "/v1/searchusers",
  data: {},
  params: {
    keyword: '"String"',

    // Filter parameters (see Filter Parameters section above)
    // roleId: '<value>' // Filter by roleId
  },
});
```

**REST Response**

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "users",
  "method": "GET",
  "action": "list",
  "appVersion": "Version",
  "rowCount": "\"Number\"",
  "users": [
    {
      "id": "ID",
      "email": "String",
      "password": "String",
      "fullname": "String",
      "avatar": "String",
      "roleId": "String",
      "emailVerified": "Boolean",
      "isActive": true,
      "recordVersion": "Integer",
      "createdAt": "Date",
      "updatedAt": "Date",
      "_owner": "ID"
    },
    {},
    {}
  ],
  "paging": {
    "pageNumber": "Number",
    "pageRowCount": "NUmber",
    "totalRowCount": "Number",
    "pageCount": "Number"
  },
  "filters": [],
  "uiPermissions": []
}
```

### `Update Userrole` API

This route is used by admin roles to update the user role.The default role is user when a user is registered. A user's role can be updated by superAdmin or admin

**Rest Route**

The `updateUserRole` API REST controller can be triggered via the following route:

`/v1/userrole/:userId`

**Rest Request Parameters**

The `updateUserRole` api has got 2 regular request parameters

| Parameter | Type   | Required | Population                 |
| --------- | ------ | -------- | -------------------------- |
| userId    | ID     | true     | request.params?.["userId"] |
| roleId    | String | true     | request.body?.["roleId"]   |

**userId** : This id paremeter is used to select the required data object that will be updated
**roleId** : The new roleId of the user to be updated

**REST Request**
To access the api you can use the **REST** controller with the path **PATCH /v1/userrole/:userId**

```js
axios({
  method: "PATCH",
  url: `/v1/userrole/${userId}`,
  data: {
    roleId: "String",
  },
  params: {},
});
```

**REST Response**

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "user",
  "method": "PATCH",
  "action": "update",
  "appVersion": "Version",
  "rowCount": 1,
  "user": {
    "id": "ID",
    "email": "String",
    "password": "String",
    "fullname": "String",
    "avatar": "String",
    "roleId": "String",
    "emailVerified": "Boolean",
    "isActive": true,
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID"
  }
}
```

### `Update Userpassword` API

This route is used to update the password of users in the profile page by users themselves. The target user is always the session user — no userId is needed in the URL.

**Rest Route**

The `updateUserPassword` API REST controller can be triggered via the following route:

`/v1/userpassword`

**Rest Request Parameters**

The `updateUserPassword` api has got 2 regular request parameters

| Parameter   | Type   | Required | Population                    |
| ----------- | ------ | -------- | ----------------------------- |
| oldPassword | String | true     | request.body?.["oldPassword"] |
| newPassword | String | true     | request.body?.["newPassword"] |

**oldPassword** : The old password of the user that will be overridden bu the new one. Send for double check.
**newPassword** : The new password of the user to be updated

**REST Request**
To access the api you can use the **REST** controller with the path **PATCH /v1/userpassword**

```js
axios({
  method: "PATCH",
  url: "/v1/userpassword",
  data: {
    oldPassword: "String",
    newPassword: "String",
  },
  params: {},
});
```

**REST Response**

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "user",
  "method": "PATCH",
  "action": "update",
  "appVersion": "Version",
  "rowCount": 1,
  "user": {
    "id": "ID",
    "email": "String",
    "password": "String",
    "fullname": "String",
    "avatar": "String",
    "roleId": "String",
    "emailVerified": "Boolean",
    "isActive": true,
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID"
  }
}
```

### `Update Userpasswordbyadmin` API

This route is used to change any user password by admins only. Superadmin can chnage all passwords, admins can change only nonadmin passwords

**Rest Route**

The `updateUserPasswordByAdmin` API REST controller can be triggered via the following route:

`/v1/userpasswordbyadmin/:userId`

**Rest Request Parameters**

The `updateUserPasswordByAdmin` api has got 2 regular request parameters

| Parameter | Type   | Required | Population                 |
| --------- | ------ | -------- | -------------------------- |
| userId    | ID     | true     | request.params?.["userId"] |
| password  | String | true     | request.body?.["password"] |

**userId** : This id paremeter is used to select the required data object that will be updated
**password** : The new password of the user to be updated

**REST Request**
To access the api you can use the **REST** controller with the path **PATCH /v1/userpasswordbyadmin/:userId**

```js
axios({
  method: "PATCH",
  url: `/v1/userpasswordbyadmin/${userId}`,
  data: {
    password: "String",
  },
  params: {},
});
```

**REST Response**

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "user",
  "method": "PATCH",
  "action": "update",
  "appVersion": "Version",
  "rowCount": 1,
  "user": {
    "id": "ID",
    "email": "String",
    "password": "String",
    "fullname": "String",
    "avatar": "String",
    "roleId": "String",
    "emailVerified": "Boolean",
    "isActive": true,
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID"
  }
}
```

### `Get Briefuser` API

This route is used by public to get simple user profile information.

**Rest Route**

The `getBriefUser` API REST controller can be triggered via the following route:

`/v1/briefuser/:userId`

**Rest Request Parameters**

The `getBriefUser` api has got 1 regular request parameter

| Parameter | Type | Required | Population                 |
| --------- | ---- | -------- | -------------------------- |
| userId    | ID   | true     | request.params?.["userId"] |

**userId** : This id paremeter is used to query the required data object.

**REST Request**
To access the api you can use the **REST** controller with the path **GET /v1/briefuser/:userId**

```js
axios({
  method: "GET",
  url: `/v1/briefuser/${userId}`,
  data: {},
  params: {},
});
```

**REST Response**

This route's response is constrained to a select list of properties, and therefore does not encompass all attributes of the resource.

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "user",
  "method": "GET",
  "action": "get",
  "appVersion": "Version",
  "rowCount": 1,
  "user": {
    "isActive": true
  }
}
```

### `Stream Test` API

Test API for iterator action streaming via SSE.

**Rest Route**

The `streamTest` API REST controller can be triggered via the following route:

`/v1/streamtest/:userId`

**Rest Request Parameters**

The `streamTest` api has got 1 regular request parameter

| Parameter | Type | Required | Population                 |
| --------- | ---- | -------- | -------------------------- |
| userId    | ID   | true     | request.params?.["userId"] |

**userId** : This id paremeter is used to query the required data object.

**REST Request**
To access the api you can use the **REST** controller with the path **GET /v1/streamtest/:userId**

```js
axios({
  method: "GET",
  url: `/v1/streamtest/${userId}`,
  data: {},
  params: {},
});
```

**REST Response**

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "user",
  "method": "GET",
  "action": "get",
  "appVersion": "Version",
  "rowCount": 1,
  "user": {
    "id": "ID",
    "email": "String",
    "password": "String",
    "fullname": "String",
    "avatar": "String",
    "roleId": "String",
    "emailVerified": "Boolean",
    "isActive": true,
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID"
  }
}
```

### `Get Useravatarsfile` API

**[Default get API]** — This is the designated default `get` API for the `userAvatarsFile` data object. Frontend generators and AI agents should use this API for standard CRUD operations.

**Rest Route**

The `getUserAvatarsFile` API REST controller can be triggered via the following route:

`/v1/useravatarsfiles/:userAvatarsFileId`

**Rest Request Parameters**

The `getUserAvatarsFile` api has got 1 regular request parameter

| Parameter         | Type | Required | Population                            |
| ----------------- | ---- | -------- | ------------------------------------- |
| userAvatarsFileId | ID   | true     | request.params?.["userAvatarsFileId"] |

**userAvatarsFileId** : This id paremeter is used to query the required data object.

**REST Request**
To access the api you can use the **REST** controller with the path **GET /v1/useravatarsfiles/:userAvatarsFileId**

```js
axios({
  method: "GET",
  url: `/v1/useravatarsfiles/${userAvatarsFileId}`,
  data: {},
  params: {},
});
```

**REST Response**

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "userAvatarsFile",
  "method": "GET",
  "action": "get",
  "appVersion": "Version",
  "rowCount": 1,
  "userAvatarsFile": {
    "id": "ID",
    "fileName": "String",
    "mimeType": "String",
    "fileSize": "Integer",
    "accessKey": "String",
    "ownerId": "ID",
    "fileData": "Blob",
    "metadata": "Object",
    "scanStatus": "String",
    "scanResult": "Text",
    "scannedAt": "Date",
    "userId": "ID",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": true
  }
}
```

### `List Useravatarsfiles` API

**[Default list API]** — This is the designated default `list` API for the `userAvatarsFile` data object. Frontend generators and AI agents should use this API for standard CRUD operations.

**Rest Route**

The `listUserAvatarsFiles` API REST controller can be triggered via the following route:

`/v1/useravatarsfiles`

**Rest Request Parameters**

**Filter Parameters**

The `listUserAvatarsFiles` api supports 4 optional filter parameters for filtering list results:

**mimeType** (`String`): MIME type of the uploaded file (e.g., image/png, application/pdf).

- Single (partial match, case-insensitive): `?mimeType=<value>`
- Multiple: `?mimeType=<value1>&mimeType=<value2>`
- Null: `?mimeType=null`

**ownerId** (`ID`): ID of the user who uploaded the file (from session).

- Single: `?ownerId=<value>`
- Multiple: `?ownerId=<value1>&ownerId=<value2>`
- Null: `?ownerId=null`

**scanStatus** (`String`): ClamAV scan result: 'clean' (safe), 'infected' (signature matched), 'error' (scan failed). 'pending' is reserved for async-scan modes not yet supported.

- Single (partial match, case-insensitive): `?scanStatus=<value>`
- Multiple: `?scanStatus=<value1>&scanStatus=<value2>`
- Null: `?scanStatus=null`

**userId** (`ID`): Reference to the owner user record.

- Single: `?userId=<value>`
- Multiple: `?userId=<value1>&userId=<value2>`
- Null: `?userId=null`

**REST Request**
To access the api you can use the **REST** controller with the path **GET /v1/useravatarsfiles**

```js
axios({
  method: "GET",
  url: "/v1/useravatarsfiles",
  data: {},
  params: {
    // Filter parameters (see Filter Parameters section above)
    // mimeType: '<value>' // Filter by mimeType
    // ownerId: '<value>' // Filter by ownerId
    // scanStatus: '<value>' // Filter by scanStatus
    // userId: '<value>' // Filter by userId
  },
});
```

**REST Response**

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "userAvatarsFiles",
  "method": "GET",
  "action": "list",
  "appVersion": "Version",
  "rowCount": "\"Number\"",
  "userAvatarsFiles": [
    {
      "id": "ID",
      "fileName": "String",
      "mimeType": "String",
      "fileSize": "Integer",
      "accessKey": "String",
      "ownerId": "ID",
      "fileData": "Blob",
      "metadata": "Object",
      "scanStatus": "String",
      "scanResult": "Text",
      "scannedAt": "Date",
      "userId": "ID",
      "recordVersion": "Integer",
      "createdAt": "Date",
      "updatedAt": "Date",
      "_owner": "ID",
      "isActive": true
    },
    {},
    {}
  ],
  "paging": {
    "pageNumber": "Number",
    "pageRowCount": "NUmber",
    "totalRowCount": "Number",
    "pageCount": "Number"
  },
  "filters": [],
  "uiPermissions": []
}
```

### `Delete Useravatarsfile` API

**[Default delete API]** — This is the designated default `delete` API for the `userAvatarsFile` data object. Frontend generators and AI agents should use this API for standard CRUD operations.

**Rest Route**

The `deleteUserAvatarsFile` API REST controller can be triggered via the following route:

`/v1/useravatarsfiles/:userAvatarsFileId`

**Rest Request Parameters**

The `deleteUserAvatarsFile` api has got 1 regular request parameter

| Parameter         | Type | Required | Population                            |
| ----------------- | ---- | -------- | ------------------------------------- |
| userAvatarsFileId | ID   | true     | request.params?.["userAvatarsFileId"] |

**userAvatarsFileId** : This id paremeter is used to select the required data object that will be deleted

**REST Request**
To access the api you can use the **REST** controller with the path **DELETE /v1/useravatarsfiles/:userAvatarsFileId**

```js
axios({
  method: "DELETE",
  url: `/v1/useravatarsfiles/${userAvatarsFileId}`,
  data: {},
  params: {},
});
```

**REST Response**

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "userAvatarsFile",
  "method": "DELETE",
  "action": "delete",
  "appVersion": "Version",
  "rowCount": 1,
  "userAvatarsFile": {
    "id": "ID",
    "fileName": "String",
    "mimeType": "String",
    "fileSize": "Integer",
    "accessKey": "String",
    "ownerId": "ID",
    "fileData": "Blob",
    "metadata": "Object",
    "scanStatus": "String",
    "scanResult": "Text",
    "scannedAt": "Date",
    "userId": "ID",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": false
  }
}
```

## AgentHub Service

AI Agent Hub

### AgentHub Service Data Objects

**Sys_agentOverride**
Runtime overrides for design-time agents. Null fields use the design default.

**Sys_agentExecution**
Agent execution log. Records each agent invocation with input, output, and performance metrics.

**Sys_toolCatalog**
Cached tool catalog discovered from project services. Refreshed periodically.

### AgentHub Service Access urls

This service is accessible via the following environment-specific URLs:

- **Preview:** `https://lrmwufitcheck.preview.mindbricks.com/agenthub-api`
- **Staging:** `https://lrmwufitcheck-stage.mindbricks.co/agenthub-api`
- **Production:** `https://lrmwufitcheck.mindbricks.co/agenthub-api`

### `Get Agentoverride` API

**[Default get API]** — This is the designated default `get` API for the `sys_agentOverride` data object. Frontend generators and AI agents should use this API for standard CRUD operations.

**Rest Route**

The `getAgentOverride` API REST controller can be triggered via the following route:

`/v1/agentoverride/:sys_agentOverrideId`

**Rest Request Parameters**

The `getAgentOverride` api has got 1 regular request parameter

| Parameter           | Type | Required | Population                              |
| ------------------- | ---- | -------- | --------------------------------------- |
| sys_agentOverrideId | ID   | true     | request.params?.["sys_agentOverrideId"] |

**sys_agentOverrideId** : This id paremeter is used to query the required data object.

**REST Request**
To access the api you can use the **REST** controller with the path **GET /v1/agentoverride/:sys_agentOverrideId**

```js
axios({
  method: "GET",
  url: `/v1/agentoverride/${sys_agentOverrideId}`,
  data: {},
  params: {},
});
```

**REST Response**

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "sys_agentOverride",
  "method": "GET",
  "action": "get",
  "appVersion": "Version",
  "rowCount": 1,
  "sys_agentOverride": {
    "id": "ID",
    "agentName": "String",
    "provider": "String",
    "model": "String",
    "systemPrompt": "Text",
    "temperature": "Double",
    "maxTokens": "Integer",
    "responseFormat": "String",
    "selectedTools": "Object",
    "guardrails": "Object",
    "enabled": "Boolean",
    "updatedBy": "ID",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": true
  }
}
```

### `List Agentoverrides` API

**[Default list API]** — This is the designated default `list` API for the `sys_agentOverride` data object. Frontend generators and AI agents should use this API for standard CRUD operations.

**Rest Route**

The `listAgentOverrides` API REST controller can be triggered via the following route:

`/v1/agentoverrides`

**Rest Request Parameters**
The `listAgentOverrides` api has got no request parameters.

**REST Request**
To access the api you can use the **REST** controller with the path **GET /v1/agentoverrides**

```js
axios({
  method: "GET",
  url: "/v1/agentoverrides",
  data: {},
  params: {},
});
```

**REST Response**

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "sys_agentOverrides",
  "method": "GET",
  "action": "list",
  "appVersion": "Version",
  "rowCount": "\"Number\"",
  "sys_agentOverrides": [
    {
      "id": "ID",
      "agentName": "String",
      "provider": "String",
      "model": "String",
      "systemPrompt": "Text",
      "temperature": "Double",
      "maxTokens": "Integer",
      "responseFormat": "String",
      "selectedTools": "Object",
      "guardrails": "Object",
      "enabled": "Boolean",
      "updatedBy": "ID",
      "recordVersion": "Integer",
      "createdAt": "Date",
      "updatedAt": "Date",
      "_owner": "ID",
      "isActive": true
    },
    {},
    {}
  ],
  "paging": {
    "pageNumber": "Number",
    "pageRowCount": "NUmber",
    "totalRowCount": "Number",
    "pageCount": "Number"
  },
  "filters": [],
  "uiPermissions": []
}
```

### `Create Agentoverride` API

**[Default create API]** — This is the designated default `create` API for the `sys_agentOverride` data object. Frontend generators and AI agents should use this API for standard CRUD operations.

**Rest Route**

The `createAgentOverride` API REST controller can be triggered via the following route:

`/v1/agentoverride`

**Rest Request Parameters**

The `createAgentOverride` api has got 10 regular request parameters

| Parameter      | Type    | Required | Population                       |
| -------------- | ------- | -------- | -------------------------------- |
| agentName      | String  | true     | request.body?.["agentName"]      |
| provider       | String  | false    | request.body?.["provider"]       |
| model          | String  | false    | request.body?.["model"]          |
| systemPrompt   | Text    | false    | request.body?.["systemPrompt"]   |
| temperature    | Double  | false    | request.body?.["temperature"]    |
| maxTokens      | Integer | false    | request.body?.["maxTokens"]      |
| responseFormat | String  | false    | request.body?.["responseFormat"] |
| selectedTools  | Object  | false    | request.body?.["selectedTools"]  |
| guardrails     | Object  | false    | request.body?.["guardrails"]     |
| enabled        | Boolean | false    | request.body?.["enabled"]        |

**agentName** : Design-time agent name this override applies to.
**provider** : Override AI provider (e.g., openai, anthropic).
**model** : Override model name.
**systemPrompt** : Override system prompt.
**temperature** : Override temperature (0-2).
**maxTokens** : Override max tokens.
**responseFormat** : Override response format (text/json).
**selectedTools** : Array of tool names from the catalog that this agent can use.
**guardrails** : Override guardrails: { maxToolCalls, timeout, maxTokenBudget }.
**enabled** : Optional caller override; defaults to true when omitted.

**REST Request**
To access the api you can use the **REST** controller with the path **POST /v1/agentoverride**

```js
axios({
  method: "POST",
  url: "/v1/agentoverride",
  data: {
    agentName: "String",
    provider: "String",
    model: "String",
    systemPrompt: "Text",
    temperature: "Double",
    maxTokens: "Integer",
    responseFormat: "String",
    selectedTools: "Object",
    guardrails: "Object",
    enabled: "Boolean",
  },
  params: {},
});
```

**REST Response**

```json
{
  "status": "OK",
  "statusCode": "201",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "sys_agentOverride",
  "method": "POST",
  "action": "create",
  "appVersion": "Version",
  "rowCount": 1,
  "sys_agentOverride": {
    "id": "ID",
    "agentName": "String",
    "provider": "String",
    "model": "String",
    "systemPrompt": "Text",
    "temperature": "Double",
    "maxTokens": "Integer",
    "responseFormat": "String",
    "selectedTools": "Object",
    "guardrails": "Object",
    "enabled": "Boolean",
    "updatedBy": "ID",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": true
  }
}
```

### `Update Agentoverride` API

**[Default update API]** — This is the designated default `update` API for the `sys_agentOverride` data object. Frontend generators and AI agents should use this API for standard CRUD operations.

**Rest Route**

The `updateAgentOverride` API REST controller can be triggered via the following route:

`/v1/agentoverride/:sys_agentOverrideId`

**Rest Request Parameters**

The `updateAgentOverride` api has got 10 regular request parameters

| Parameter           | Type    | Required | Population                              |
| ------------------- | ------- | -------- | --------------------------------------- |
| sys_agentOverrideId | ID      | true     | request.params?.["sys_agentOverrideId"] |
| provider            | String  | false    | request.body?.["provider"]              |
| model               | String  | false    | request.body?.["model"]                 |
| systemPrompt        | Text    | false    | request.body?.["systemPrompt"]          |
| temperature         | Double  | false    | request.body?.["temperature"]           |
| maxTokens           | Integer | false    | request.body?.["maxTokens"]             |
| responseFormat      | String  | false    | request.body?.["responseFormat"]        |
| selectedTools       | Object  | false    | request.body?.["selectedTools"]         |
| guardrails          | Object  | false    | request.body?.["guardrails"]            |
| enabled             | Boolean | false    | request.body?.["enabled"]               |

**sys_agentOverrideId** : This id paremeter is used to select the required data object that will be updated
**provider** : Override AI provider (e.g., openai, anthropic).
**model** : Override model name.
**systemPrompt** : Override system prompt.
**temperature** : Override temperature (0-2).
**maxTokens** : Override max tokens.
**responseFormat** : Override response format (text/json).
**selectedTools** : Array of tool names from the catalog that this agent can use.
**guardrails** : Override guardrails: { maxToolCalls, timeout, maxTokenBudget }.
**enabled** : Update the enabled flag.

**REST Request**
To access the api you can use the **REST** controller with the path **PATCH /v1/agentoverride/:sys_agentOverrideId**

```js
axios({
  method: "PATCH",
  url: `/v1/agentoverride/${sys_agentOverrideId}`,
  data: {
    provider: "String",
    model: "String",
    systemPrompt: "Text",
    temperature: "Double",
    maxTokens: "Integer",
    responseFormat: "String",
    selectedTools: "Object",
    guardrails: "Object",
    enabled: "Boolean",
  },
  params: {},
});
```

**REST Response**

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "sys_agentOverride",
  "method": "PATCH",
  "action": "update",
  "appVersion": "Version",
  "rowCount": 1,
  "sys_agentOverride": {
    "id": "ID",
    "agentName": "String",
    "provider": "String",
    "model": "String",
    "systemPrompt": "Text",
    "temperature": "Double",
    "maxTokens": "Integer",
    "responseFormat": "String",
    "selectedTools": "Object",
    "guardrails": "Object",
    "enabled": "Boolean",
    "updatedBy": "ID",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": true
  }
}
```

### `Delete Agentoverride` API

**[Default delete API]** — This is the designated default `delete` API for the `sys_agentOverride` data object. Frontend generators and AI agents should use this API for standard CRUD operations.

**Rest Route**

The `deleteAgentOverride` API REST controller can be triggered via the following route:

`/v1/agentoverride/:sys_agentOverrideId`

**Rest Request Parameters**

The `deleteAgentOverride` api has got 1 regular request parameter

| Parameter           | Type | Required | Population                              |
| ------------------- | ---- | -------- | --------------------------------------- |
| sys_agentOverrideId | ID   | true     | request.params?.["sys_agentOverrideId"] |

**sys_agentOverrideId** : This id paremeter is used to select the required data object that will be deleted

**REST Request**
To access the api you can use the **REST** controller with the path **DELETE /v1/agentoverride/:sys_agentOverrideId**

```js
axios({
  method: "DELETE",
  url: `/v1/agentoverride/${sys_agentOverrideId}`,
  data: {},
  params: {},
});
```

**REST Response**

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "sys_agentOverride",
  "method": "DELETE",
  "action": "delete",
  "appVersion": "Version",
  "rowCount": 1,
  "sys_agentOverride": {
    "id": "ID",
    "agentName": "String",
    "provider": "String",
    "model": "String",
    "systemPrompt": "Text",
    "temperature": "Double",
    "maxTokens": "Integer",
    "responseFormat": "String",
    "selectedTools": "Object",
    "guardrails": "Object",
    "enabled": "Boolean",
    "updatedBy": "ID",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": false
  }
}
```

### `List Toolcatalog` API

**[Default list API]** — This is the designated default `list` API for the `sys_toolCatalog` data object. Frontend generators and AI agents should use this API for standard CRUD operations.

**Rest Route**

The `listToolCatalog` API REST controller can be triggered via the following route:

`/v1/toolcatalog`

**Rest Request Parameters**

**Filter Parameters**

The `listToolCatalog` api supports 1 optional filter parameter for filtering list results:

**serviceName** (`String`): Source service name.

- Single (partial match, case-insensitive): `?serviceName=<value>`
- Multiple: `?serviceName=<value1>&serviceName=<value2>`
- Null: `?serviceName=null`

**REST Request**
To access the api you can use the **REST** controller with the path **GET /v1/toolcatalog**

```js
axios({
  method: "GET",
  url: "/v1/toolcatalog",
  data: {},
  params: {
    // Filter parameters (see Filter Parameters section above)
    // serviceName: '<value>' // Filter by serviceName
  },
});
```

**REST Response**

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "sys_toolCatalogs",
  "method": "GET",
  "action": "list",
  "appVersion": "Version",
  "rowCount": "\"Number\"",
  "sys_toolCatalogs": [
    {
      "id": "ID",
      "toolName": "String",
      "serviceName": "String",
      "description": "Text",
      "parameters": "Object",
      "lastRefreshed": "Date",
      "recordVersion": "Integer",
      "createdAt": "Date",
      "updatedAt": "Date",
      "_owner": "ID",
      "isActive": true
    },
    {},
    {}
  ],
  "paging": {
    "pageNumber": "Number",
    "pageRowCount": "NUmber",
    "totalRowCount": "Number",
    "pageCount": "Number"
  },
  "filters": [],
  "uiPermissions": []
}
```

### `Get Toolcatalogentry` API

**[Default get API]** — This is the designated default `get` API for the `sys_toolCatalog` data object. Frontend generators and AI agents should use this API for standard CRUD operations.

**Rest Route**

The `getToolCatalogEntry` API REST controller can be triggered via the following route:

`/v1/toolcatalogentry/:sys_toolCatalogId`

**Rest Request Parameters**

The `getToolCatalogEntry` api has got 1 regular request parameter

| Parameter         | Type | Required | Population                            |
| ----------------- | ---- | -------- | ------------------------------------- |
| sys_toolCatalogId | ID   | true     | request.params?.["sys_toolCatalogId"] |

**sys_toolCatalogId** : This id paremeter is used to query the required data object.

**REST Request**
To access the api you can use the **REST** controller with the path **GET /v1/toolcatalogentry/:sys_toolCatalogId**

```js
axios({
  method: "GET",
  url: `/v1/toolcatalogentry/${sys_toolCatalogId}`,
  data: {},
  params: {},
});
```

**REST Response**

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "sys_toolCatalog",
  "method": "GET",
  "action": "get",
  "appVersion": "Version",
  "rowCount": 1,
  "sys_toolCatalog": {
    "id": "ID",
    "toolName": "String",
    "serviceName": "String",
    "description": "Text",
    "parameters": "Object",
    "lastRefreshed": "Date",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": true
  }
}
```

### `List Agentexecutions` API

**[Default list API]** — This is the designated default `list` API for the `sys_agentExecution` data object. Frontend generators and AI agents should use this API for standard CRUD operations.

**Rest Route**

The `listAgentExecutions` API REST controller can be triggered via the following route:

`/v1/agentexecutions`

**Rest Request Parameters**

**Filter Parameters**

The `listAgentExecutions` api supports 5 optional filter parameters for filtering list results:

**agentName** (`String`): Agent that was executed.

- Single (partial match, case-insensitive): `?agentName=<value>`
- Multiple: `?agentName=<value1>&agentName=<value2>`
- Null: `?agentName=null`

**agentType** (`Enum`): Whether this was a design-time or dynamic agent.

- Single: `?agentType=<value>` (case-insensitive)
- Multiple: `?agentType=<value1>&agentType=<value2>`
- Null: `?agentType=null`

**source** (`Enum`): How the agent was triggered.

- Single: `?source=<value>` (case-insensitive)
- Multiple: `?source=<value1>&source=<value2>`
- Null: `?source=null`

**userId** (`ID`): User who triggered the execution.

- Single: `?userId=<value>`
- Multiple: `?userId=<value1>&userId=<value2>`
- Null: `?userId=null`

**status** (`Enum`): Execution status.

- Single: `?status=<value>` (case-insensitive)
- Multiple: `?status=<value1>&status=<value2>`
- Null: `?status=null`

**REST Request**
To access the api you can use the **REST** controller with the path **GET /v1/agentexecutions**

```js
axios({
  method: "GET",
  url: "/v1/agentexecutions",
  data: {},
  params: {
    // Filter parameters (see Filter Parameters section above)
    // agentName: '<value>' // Filter by agentName
    // agentType: '<value>' // Filter by agentType
    // source: '<value>' // Filter by source
    // userId: '<value>' // Filter by userId
    // status: '<value>' // Filter by status
  },
});
```

**REST Response**

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "sys_agentExecutions",
  "method": "GET",
  "action": "list",
  "appVersion": "Version",
  "rowCount": "\"Number\"",
  "sys_agentExecutions": [
    {
      "id": "ID",
      "agentName": "String",
      "agentType": "Enum",
      "agentType_idx": "Integer",
      "source": "Enum",
      "source_idx": "Integer",
      "userId": "ID",
      "input": "Object",
      "output": "Object",
      "toolCalls": "Integer",
      "tokenUsage": "Object",
      "durationMs": "Integer",
      "status": "Enum",
      "status_idx": "Integer",
      "error": "Text",
      "recordVersion": "Integer",
      "createdAt": "Date",
      "updatedAt": "Date",
      "_owner": "ID",
      "isActive": true
    },
    {},
    {}
  ],
  "paging": {
    "pageNumber": "Number",
    "pageRowCount": "NUmber",
    "totalRowCount": "Number",
    "pageCount": "Number"
  },
  "filters": [],
  "uiPermissions": []
}
```

### `Get Agentexecution` API

**[Default get API]** — This is the designated default `get` API for the `sys_agentExecution` data object. Frontend generators and AI agents should use this API for standard CRUD operations.

**Rest Route**

The `getAgentExecution` API REST controller can be triggered via the following route:

`/v1/agentexecution/:sys_agentExecutionId`

**Rest Request Parameters**

The `getAgentExecution` api has got 1 regular request parameter

| Parameter            | Type | Required | Population                               |
| -------------------- | ---- | -------- | ---------------------------------------- |
| sys_agentExecutionId | ID   | true     | request.params?.["sys_agentExecutionId"] |

**sys_agentExecutionId** : This id paremeter is used to query the required data object.

**REST Request**
To access the api you can use the **REST** controller with the path **GET /v1/agentexecution/:sys_agentExecutionId**

```js
axios({
  method: "GET",
  url: `/v1/agentexecution/${sys_agentExecutionId}`,
  data: {},
  params: {},
});
```

**REST Response**

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "sys_agentExecution",
  "method": "GET",
  "action": "get",
  "appVersion": "Version",
  "rowCount": 1,
  "sys_agentExecution": {
    "id": "ID",
    "agentName": "String",
    "agentType": "Enum",
    "agentType_idx": "Integer",
    "source": "Enum",
    "source_idx": "Integer",
    "userId": "ID",
    "input": "Object",
    "output": "Object",
    "toolCalls": "Integer",
    "tokenUsage": "Object",
    "durationMs": "Integer",
    "status": "Enum",
    "status_idx": "Integer",
    "error": "Text",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": true
  }
}
```
