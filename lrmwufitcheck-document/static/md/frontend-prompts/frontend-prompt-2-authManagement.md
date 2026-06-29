

# **FITCHECK**

**FRONTEND GUIDE FOR AI CODING AGENTS - PART 2 - Authentication Management**

This document covers the authentication features of the **fitcheck** project: registration, login, logout, and session management. The project introduction, API conventions, home page, and multi-tenancy setup were covered in the previous introductory prompt — make sure those are implemented before proceeding.

All auth APIs use the auth service base URL with the `/auth-api` prefix (e.g., `https://lrmwufitcheck.mindbricks.co/auth-api`).

### FRONTEND_URL

The `FRONTEND_URL` environment variable is automatically set on the auth service from the project's **frontendUrl** setting in Basic Project Settings. It is used by the auth service for:
- **Social login redirects** — after OAuth processing, the auth service redirects to `FRONTEND_URL + /auth/callback` (the frontend must have a page at this route; see the Social Login prompt for details)
- **Email notification links** — verification, password reset, and other links in emails point back to the frontend

Defaults if not configured:

| Environment | Default |
|-------------|---------|
| dev | `http://localhost:5173` |
| test | `https://lrmwufitcheck.preview.mindbricks.com`   |
| stage | `https://lrmwufitcheck-stage.mindbricks.co` |
| prod | `https://lrmwufitcheck.mindbricks.co` |

You can customize `FRONTEND_URL` per environment by configuring the `frontendUrl` field in your project's Basic Project Settings (e.g., when using a custom domain).

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

Note that this page should respect the deployment (environment) selection option made in the home page to set the base URL. If the user reaches this page directly skipping home page, the default `production` deployment will be used.

The login API returns a created session. This session can be retrieved later with the access token using the `/currentuser` system route.

Any request that requires login must include a valid token. When a user logs in successfully, the response JSON includes a JWT access token in the `accessToken` field. Under normal conditions, this token is also set as a cookie and consumed automatically. However, since AI coding agents' preview options may fail to use cookies, ensure that each request includes the access token in the Bearer authorization header.

If the login fails due to verification requirements, the response JSON includes an `errCode`. If it is `EmailVerificationNeeded`, start the email verification flow; if it is `MobileVerificationNeeded`, start the mobile verification flow.

After a successful login, you can access session (user) information at any time with the `/currentuser` API. On inner pages, show brief profile information (avatar, name, etc.) using the session information.

Note that the session/currentuser response has no `id` property; instead, the values for the user and session are exposed as `userId` and `sessionId`. The response combines user and session information.

The login, logout, and currentuser APIs are as follows. They are system routes and are not versioned.

### `POST /login` — User Login

**Purpose:**
Verifies user credentials and creates an authenticated session with a JWT access token.

**Access Routes:**

#### Request Parameters

| Parameter  | Type   | Required | Source                  |
| ---------- | ------ | -------- | ----------------------- |
| `username` | String | Yes      | `request.body.username` |
| `password` | String | Yes      | `request.body.password` |

#### Behavior

* Authenticates credentials and returns a session object.
* Sets cookie: `projectname-access-token[-tenantCodename]`
* Adds the same token in response headers.
* Accepts either `username` or `email` fields (if both exist, `username` is prioritized). The `mobile` field is also accepted when the user has a mobile number on file.

#### Example

```js
axios.post("/login", {
  email: "user@example.com",
  password: "securePassword"
});
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

> **Two-Factor Authentication (2FA):** When the login response contains `sessionNeedsEmail2FA: true or sessionNeedsMobile2FA: true`, the session is **not yet fully authorized**. The `accessToken` is valid but all protected API calls will return `403` until 2FA is completed. **Do not treat this login as successful** — instead, store the `accessToken`, `userId`, and `sessionId`, and navigate the user to a 2FA verification page. The 2FA flow details are covered in the **Verification Management** prompt.

### Error Responses

* `401 Unauthorized`: Invalid credentials
* `403 Forbidden`: Email/mobile verification or 2FA pending
* `400 Bad Request`: Missing parameters

---

### `POST /logout` — User Logout

**Purpose:**
Terminates the current session and clears associated authentication tokens.

#### Behavior

* Invalidates the session (if it exists).
* Clears cookie `projectname-access-token[-tenantCodename]`.
* Returns a confirmation response (always `200 OK`).

#### Example

```js
axios.post("/logout", {}, {
  headers: { "Authorization": "Bearer your-jwt-token" }
});
```

#### Notes

* Can be called without a session (idempotent behavior).
* Works for both cookie-based and token-based sessions.

#### Success Response

```json
{ "status": "OK", "message": "User logged out successfully" }
```

### `GET /currentuser` — Current Session

**Purpose**
Returns the currently authenticated user's session.

**Route Type**
`sessionInfo`

**Authentication**
Requires a valid access token (header or cookie).

#### Request

*No parameters.*

#### Example

```js
axios.get("/currentuser", {
  headers: { Authorization: "Bearer <jwt>" }
});
```

#### Success (200)

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

Note that the `currentuser` API returns a session object, so there is no `id` property, instead, the values for the user and session are exposed as `userId` and `sessionId`. The response is a mix of user and session information.

#### Errors

* **401 Unauthorized** — No active session/token

  ```json
  { "status": "ERR", "message": "No login found" }
  ```

**Notes**

* Commonly called by web/mobile clients after login to hydrate session state.
* Includes key identity/tenant fields and a token reference (if applicable).
* Ensure a valid token is supplied to receive a 200 response.

After you complete this step, please ensure you have not made the following common mistakes:

1. The raw `/currentuser` API mixes session and user data into a single flat envelope. There is **no `id` property on the raw response** — use `userId` and `sessionId`. 
2. Note that any API call to the auth service should use the `/auth-api` prefix after the application's base URL.

**After this prompt, the user may give you new instructions to update your output or provide subsequent prompts about the project.**
