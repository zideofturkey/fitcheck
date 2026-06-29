const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const router = express.Router();
const jwt = require("jsonwebtoken");

const { BadRequestError, ForbiddenError, HttpServerError } = require("common");
const { md5 } = require("common");

const createServiceController = require("./create-service-controller");

const REDIRECT_PORTAL_URI =
  process.env.SERVICE_URL + "/auth/social-login-redirect";

// Resolve the frontend callback URL for SPA social login flows.
// If SOCIAL_LOGIN_REDIRECT_URL is explicitly set, use it (rare override).
// Otherwise derive from FRONTEND_URL (set from project's frontendUrl setting).
// When resolved, after OAuth processing the auth service redirects to this
// frontend URL with the socialCode as a short reference. The frontend then
// exchanges the socialCode for the full session data via POST /auth/social-login-result.
const SOCIAL_LOGIN_REDIRECT_URL =
  process.env.SOCIAL_LOGIN_REDIRECT_URL ||
  (process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.replace(/\/+$/, "") + "/auth/callback"
    : undefined);

// ── Temporary in-memory store for social login results ──
// Stores login/registration results keyed by socialCode.
// The frontend retrieves the result via POST /auth/social-login-result.
// Each entry is single-use and expires after 5 minutes.
const socialLoginResults = new Map();
const SOCIAL_LOGIN_RESULT_TTL = 5 * 60 * 1000; // 5 minutes

function storeSocialLoginResult(socialCode, data) {
  socialLoginResults.set(socialCode, {
    data,
    expiresAt: Date.now() + SOCIAL_LOGIN_RESULT_TTL,
  });
  // Lazy cleanup of expired entries
  for (const [key, value] of socialLoginResults) {
    if (value.expiresAt < Date.now()) {
      socialLoginResults.delete(key);
    }
  }
}

function retrieveSocialLoginResult(socialCode) {
  const entry = socialLoginResults.get(socialCode);
  if (!entry) return null;
  socialLoginResults.delete(socialCode); // single-use
  if (entry.expiresAt < Date.now()) return null; // expired
  return entry.data;
}

/**
 * If `avatarValue` is a base64 data URI (e.g. `data:image/png;base64,...`),
 * uploads the image to the userAvatars dbBucket and returns the public download URL.
 * If it is already a plain URL (or falsy), returns it unchanged.
 * Returns undefined on any error (missing bucket, etc.) so the caller can fall back gracefully.
 */
async function resolveAvatarToUrl(avatarValue) {
  if (!avatarValue || !avatarValue.startsWith("data:")) {
    return avatarValue;
  }

  try {
    const match = avatarValue.match(/^data:([^;]+);base64,(.+)$/s);
    if (!match) return undefined;

    const mimeType = match[1];
    const buffer = Buffer.from(match[2], "base64");
    const ext = mimeType.split("/")[1]?.split("+")[0] || "jpg";
    const accessKey = crypto.randomBytes(9).toString("base64url").slice(0, 12);

    const { createUserAvatarsFile } = require("dbLayer");
    const created = await createUserAvatarsFile({
      fileName: `avatar.${ext}`,
      mimeType,
      fileSize: buffer.length,
      fileData: buffer,
      accessKey,
      ownerId: null,
      metadata: null,
    });

    const record = created.dataValues || created;
    return `${process.env.SERVICE_URL}/bucket/userAvatars/download/key/${record.accessKey}`;
  } catch (err) {
    console.warn(
      "[SocialLogin] Could not upload base64 avatar to bucket:",
      err.message,
    );
    return undefined;
  }
}

/**
 * Handles social login result.
 *
 * When SOCIAL_LOGIN_REDIRECT_URL is set (SPA flow):
 *   Stores the result in the temp store keyed by socialCode, then redirects
 *   to the frontend callback URL with just provider + socialCode in the URL.
 *   The frontend exchanges the socialCode for the full result via
 *   POST /auth/social-login-result (which also sets cookies).
 *
 * When SOCIAL_LOGIN_REDIRECT_URL is NOT set (direct/API flow):
 *   Sets cookies and returns JSON directly, same as the normal login flow.
 *
 * @param {Object} restController - Initialized RestController instance
 * @param {Object} sessionManager - The session manager from restController
 * @param {Object} result - Return value from loginBySocialAccount
 * @param {string} provider - OAuth provider name (google, apple, facebook, microsoft, linkedin, github, gitlab)
 * @param {string} socialCode - The md5(access_token) reference key
 * @param {Object} res - Express response
 */
function handleSocialLoginResult(
  restController,
  sessionManager,
  result,
  provider,
  socialCode,
  res,
) {
  if (SOCIAL_LOGIN_REDIRECT_URL) {
    // SPA flow: store result and redirect with short socialCode reference
    if (result.needsRegistration) {
      storeSocialLoginResult(socialCode, {
        type: "needsRegistration",
        data: result.data,
      });
    } else {
      storeSocialLoginResult(socialCode, {
        type: "login",
        accessToken: sessionManager.accessToken,
        session: sessionManager.session,
      });
    }

    const separator = SOCIAL_LOGIN_REDIRECT_URL.includes("?") ? "&" : "?";
    return res.redirect(
      `${SOCIAL_LOGIN_REDIRECT_URL}${separator}provider=${provider}&socialCode=${socialCode}`,
    );
  }

  // Direct/API flow: return JSON with cookies set
  if (result.needsRegistration) {
    return res.status(200).send(result.data);
  }

  restController.sessionToken = sessionManager.accessToken;
  restController.setTokenInResponse();

  const responseData = restController.cookieError
    ? { ...sessionManager.session, cookieError: restController.cookieError }
    : sessionManager.session;

  res.status(200).send(responseData);
}

/**
 * Creates and initializes a RestController for social login.
 * Skips session verification since OAuth callbacks don't carry a session token.
 */
async function initSocialLoginController(req, res) {
  const restController = createServiceController(
    "socialLogin",
    "socialLogin",
    req,
    res,
  );
  await restController.init({ skipSessionVerification: true });
  return restController;
}

// redirect portal for all social login providers to extract tenantCodename
router.get("/auth/social-login-redirect", (req, res) => {
  const stateStr = Buffer.from(req.query.state, "base64").toString();
  const state = JSON.parse(stateStr); // contains redirect with tenant and csrf token if needed
  console.log("State from  Social Auth:", state);
  res.redirect(state.redirect + (req.queryString ? `?${req.queryString}` : ""));
});

// ── Exchange socialCode for the stored social login result ──
// The frontend calls this after being redirected with ?socialCode=...
// Returns the stored session data (login) or registration-needed data,
// and sets cookies for login results.
router.post("/auth/social-login-result", async (req, res, next) => {
  const { socialCode } = req.body;

  if (!socialCode) {
    return next(new BadRequestError("errMsg_MissingSocialCode"));
  }

  const storedResult = retrieveSocialLoginResult(socialCode);
  if (!storedResult) {
    return next(new BadRequestError("errMsg_InvalidOrExpiredSocialCode"));
  }

  try {
    if (storedResult.type === "needsRegistration") {
      return res.status(200).send(storedResult.data);
    }

    if (storedResult.type === "login") {
      // Set cookies using RestController, same as normal login flow
      const restController = await initSocialLoginController(req, res);
      restController.sessionToken = storedResult.accessToken;
      restController.setTokenInResponse();

      const responseData = restController.cookieError
        ? { ...storedResult.session, cookieError: restController.cookieError }
        : storedResult.session;

      return res.status(200).send(responseData);
    }

    return next(new HttpServerError("errMsg_UnexpectedSocialLoginResult"));
  } catch (error) {
    console.error("Social login result retrieval error:", error);
    next(new HttpServerError("errMsg_SocialLoginResultFailed", error));
  }
});

router.get("/social-login-demo", (req, res) => {
  const path = require("path");
  res.setHeader("Content-Type", "text/html");
  res.sendFile(
    path.resolve(__dirname, "../../project-session/authdemo/index.html"),
  );
});

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ??
  process.env.SERVICE_URL + "/auth/google/callback";

router.get("/auth/google", (req, res) => {
  let redirectUri = GOOGLE_REDIRECT_URI;
  let state = null;
  if (req.tenantCodename) {
    const uri = new URL(GOOGLE_REDIRECT_URI);
    uri.pathname = `/$${req.tenantCodename}${uri.pathname}`;
    const redirectWithTenant = uri.toString();
    const stateObj = {
      redirect: redirectWithTenant,
    };
    state = encodeURIComponent(
      Buffer.from(JSON.stringify(stateObj)).toString("base64"),
    );
    redirectUri = REDIRECT_PORTAL_URI;
  }

  console.log("Redirect URI for Google Auth:", redirectUri);
  console.log("State for Google Auth:", state);
  const url =
    `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=profile email` +
    (state ? `&state=${state}` : "");
  console.log("Redirecting to Google OAuth URL:", url);
  res.redirect(url);
});

router.get("/auth/google/callback", async (req, res, next) => {
  const { code } = req.query;

  if (!code)
    return next(new BadRequestError("errMsg_MissingAuthorizationCode"));

  try {
    const { data: tokenData } = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      },
    );

    const { access_token } = tokenData;

    const { data: profileData } = await axios.get(
      "https://www.googleapis.com/oauth2/v1/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      },
    );

    const socialCode = md5(access_token);
    const restController = await initSocialLoginController(req, res);
    const sessionManager = restController.sessionManager;

    const result = await sessionManager.loginBySocialAccount(
      {
        email: profileData.email,
        fullname: profileData.name,
        avatar: profileData.picture,
        name: profileData.given_name,
        surname: profileData.family_name,
        emailVerified: profileData.email_verified ?? true,
        socialCode,
        allowRegister: true,
        userField: "email",
      },
      req,
    );

    handleSocialLoginResult(
      restController,
      sessionManager,
      result,
      "google",
      socialCode,
      res,
    );
  } catch (error) {
    console.error(
      "Google OAuth callback error:",
      error.response?.data || error,
    );
    if (SOCIAL_LOGIN_REDIRECT_URL) {
      const errorMsg = error.message || "Google authentication failed";
      const encoded = Buffer.from(
        JSON.stringify({ type: "error", message: errorMsg }),
      ).toString("base64url");
      return res.redirect(
        `${SOCIAL_LOGIN_REDIRECT_URL}?provider=google&error=${encoded}`,
      );
    }
    next(new HttpServerError("errMsg_GoogleAuthFailed", error));
  }
});

router.get("/google-auth/callback", (req, res) => {
  const path = require("path");
  console.log("Google Auth Callback Triggered");
  res.setHeader("Content-Type", "text/html");
  res.sendFile(
    path.resolve(
      __dirname,
      "../../project-session/authdemo/google-callback.html",
    ),
  );
});

const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID;
const APPLE_TEAM_ID = process.env.APPLE_TEAM_ID;
const APPLE_KEY_ID = process.env.APPLE_KEY_ID;
const APPLE_PRIVATE_KEY = (process.env.APPLE_PRIVATE_KEY ?? "").replace(
  /\\n/g,
  "\n",
);
const APPLE_REDIRECT_URI =
  process.env.APPLE_REDIRECT_URI ??
  process.env.SERVICE_URL + "/auth/apple/callback";

function generateAppleClientSecret() {
  const now = Math.floor(Date.now() / 1000);
  return jwt.sign(
    {
      iss: APPLE_TEAM_ID,
      iat: now,
      exp: now + 3600,
      aud: "https://appleid.apple.com",
      sub: APPLE_CLIENT_ID,
    },
    APPLE_PRIVATE_KEY,
    {
      algorithm: "ES256",
      keyid: APPLE_KEY_ID,
    },
  );
}

router.get("/auth/apple", (req, res) => {
  const url = `https://appleid.apple.com/auth/authorize?response_type=code&client_id=${APPLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(APPLE_REDIRECT_URI)}&scope=name email&response_mode=form_post`;
  res.redirect(url);
});

router.post("/auth/apple/callback", async (req, res, next) => {
  const { code, id_token } = req.body;

  if (!code)
    return next(new BadRequestError("errMsg_MissingAuthorizationCode"));

  try {
    const clientSecret = generateAppleClientSecret();

    const tokenResponse = await axios.post(
      "https://appleid.apple.com/auth/token",
      null,
      {
        params: {
          grant_type: "authorization_code",
          code,
          redirect_uri: APPLE_REDIRECT_URI,
          client_id: APPLE_CLIENT_ID,
          client_secret: clientSecret,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    const { id_token: appleIdToken, access_token } = tokenResponse.data;
    const decoded = jwt.decode(appleIdToken);
    const socialCode = md5(access_token);

    const restController = await initSocialLoginController(req, res);
    const sessionManager = restController.sessionManager;

    const result = await sessionManager.loginBySocialAccount(
      {
        email: decoded.email,
        fullname: decoded.name
          ? `${decoded.name.firstName} ${decoded.name.lastName}`
          : undefined,
        avatar: undefined, // Apple does not provide an avatar
        name: decoded.name?.firstName ?? "",
        surname: decoded.name?.lastName ?? "",
        emailVerified: decoded.email_verified ?? true,
        socialCode,
        allowRegister: true,
        userField: "email",
      },
      req,
    );

    handleSocialLoginResult(
      restController,
      sessionManager,
      result,
      "apple",
      socialCode,
      res,
    );
  } catch (error) {
    console.error("Apple OAuth callback error:", error.response?.data || error);
    if (SOCIAL_LOGIN_REDIRECT_URL) {
      const errorMsg = error.message || "Apple authentication failed";
      const encoded = Buffer.from(
        JSON.stringify({ type: "error", message: errorMsg }),
      ).toString("base64url");
      return res.redirect(
        `${SOCIAL_LOGIN_REDIRECT_URL}?provider=apple&error=${encoded}`,
      );
    }
    next(new HttpServerError("errMsg_AppleAuthFailed", error));
  }
});

router.get("/apple-auth/callback", (req, res) => {
  const path = require("path");
  console.log("Apple Auth Callback Triggered");
  res.setHeader("Content-Type", "text/html");
  res.sendFile(
    path.resolve(
      __dirname,
      "../../project-session/authdemo/apple-callback.html",
    ),
  );
});

// Facebook OAuth configuration

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const FACEBOOK_REDIRECT_URI =
  process.env.FACEBOOK_REDIRECT_URI ??
  process.env.SERVICE_URL + "/auth/facebook/callback";

router.get("/auth/facebook", (req, res) => {
  let redirectUri = FACEBOOK_REDIRECT_URI;
  let state = null;
  if (req.tenantCodename) {
    const uri = new URL(FACEBOOK_REDIRECT_URI);
    uri.pathname = `/$${req.tenantCodename}${uri.pathname}`;
    const redirectWithTenant = uri.toString();
    const stateObj = {
      redirect: redirectWithTenant,
    };
    state = encodeURIComponent(
      Buffer.from(JSON.stringify(stateObj)).toString("base64"),
    );
    redirectUri = REDIRECT_PORTAL_URI;
  }

  const url =
    `https://www.facebook.com/v21.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent("email,public_profile")}` +
    (state ? `&state=${state}` : "");
  res.redirect(url);
});

router.get("/auth/facebook/callback", async (req, res, next) => {
  const { code } = req.query;

  if (!code)
    return next(new BadRequestError("errMsg_MissingAuthorizationCode"));

  try {
    // Exchange code for access token
    const tokenResponse = await axios.get(
      "https://graph.facebook.com/v21.0/oauth/access_token",
      {
        params: {
          client_id: FACEBOOK_APP_ID,
          client_secret: FACEBOOK_APP_SECRET,
          redirect_uri: FACEBOOK_REDIRECT_URI,
          code,
        },
      },
    );

    const access_token = tokenResponse.data.access_token;

    // Fetch user profile
    const profileResponse = await axios.get(
      "https://graph.facebook.com/v21.0/me",
      {
        params: {
          fields: "id,name,email,first_name,last_name,picture.type(large)",
          access_token,
        },
      },
    );

    const profile = profileResponse.data;
    const socialCode = md5(access_token);

    const restController = await initSocialLoginController(req, res);
    const sessionManager = restController.sessionManager;

    const result = await sessionManager.loginBySocialAccount(
      {
        email: profile.email,
        fullname: profile.name,
        avatar: profile.picture?.data?.url,
        name: profile.first_name ?? "",
        surname: profile.last_name ?? "",
        emailVerified: true, // Facebook verifies emails
        socialCode,
        allowRegister: true,
        userField: "email",
      },
      req,
    );

    handleSocialLoginResult(
      restController,
      sessionManager,
      result,
      "facebook",
      socialCode,
      res,
    );
  } catch (error) {
    console.error(
      "Facebook OAuth callback error:",
      error.response?.data || error,
    );
    if (SOCIAL_LOGIN_REDIRECT_URL) {
      const errorMsg = error.message || "Facebook authentication failed";
      const encoded = Buffer.from(
        JSON.stringify({ type: "error", message: errorMsg }),
      ).toString("base64url");
      return res.redirect(
        `${SOCIAL_LOGIN_REDIRECT_URL}?provider=facebook&error=${encoded}`,
      );
    }
    next(new HttpServerError("errMsg_FacebookAuthFailed", error));
  }
});

// Microsoft Azure AD / Microsoft Entra ID OAuth configuration (OpenID Connect)

const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;
const MICROSOFT_TENANT = process.env.MICROSOFT_TENANT ?? "common";
const MICROSOFT_REDIRECT_URI =
  process.env.MICROSOFT_REDIRECT_URI ??
  process.env.SERVICE_URL + "/auth/microsoft/callback";

router.get("/auth/microsoft", (req, res) => {
  let redirectUri = MICROSOFT_REDIRECT_URI;
  let state = null;
  if (req.tenantCodename) {
    const uri = new URL(MICROSOFT_REDIRECT_URI);
    uri.pathname = `/$${req.tenantCodename}${uri.pathname}`;
    const redirectWithTenant = uri.toString();
    const stateObj = {
      redirect: redirectWithTenant,
    };
    state = encodeURIComponent(
      Buffer.from(JSON.stringify(stateObj)).toString("base64"),
    );
    redirectUri = REDIRECT_PORTAL_URI;
  }

  const url =
    `https://login.microsoftonline.com/${MICROSOFT_TENANT}/oauth2/v2.0/authorize?client_id=${MICROSOFT_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent("openid profile email User.Read")}` +
    (state ? `&state=${state}` : "");
  res.redirect(url);
});

router.get("/auth/microsoft/callback", async (req, res, next) => {
  const { code } = req.query;

  if (!code)
    return next(new BadRequestError("errMsg_MissingAuthorizationCode"));

  try {
    // Exchange code for tokens
    const tokenResponse = await axios.post(
      `https://login.microsoftonline.com/${MICROSOFT_TENANT}/oauth2/v2.0/token`,
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: MICROSOFT_REDIRECT_URI,
        client_id: MICROSOFT_CLIENT_ID,
        client_secret: MICROSOFT_CLIENT_SECRET,
        scope: "openid profile email User.Read",
      }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
    );

    const access_token = tokenResponse.data.access_token;

    // Fetch user profile from Microsoft Graph
    const profileResponse = await axios.get(
      "https://graph.microsoft.com/v1.0/me",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      },
    );

    const profile = profileResponse.data;
    // Microsoft Graph returns mail or userPrincipalName for email
    const email = profile.mail || profile.userPrincipalName;

    // Try to get profile photo. Microsoft returns raw binary — convert to a
    // dbBucket URL so the user table stores a plain URL, not base64 data.
    let avatar = undefined;
    try {
      const photoResponse = await axios.get(
        "https://graph.microsoft.com/v1.0/me/photo/$value",
        {
          headers: { Authorization: `Bearer ${access_token}` },
          responseType: "arraybuffer",
        },
      );
      const base64 = Buffer.from(photoResponse.data).toString("base64");
      const contentType = photoResponse.headers["content-type"] || "image/jpeg";
      avatar = await resolveAvatarToUrl(`data:${contentType};base64,${base64}`);
    } catch {
      // No profile photo — that's fine
    }

    const socialCode = md5(access_token);
    const restController = await initSocialLoginController(req, res);
    const sessionManager = restController.sessionManager;

    const result = await sessionManager.loginBySocialAccount(
      {
        email,
        fullname:
          profile.displayName ||
          `${profile.givenName ?? ""} ${profile.surname ?? ""}`.trim(),
        avatar,
        name: profile.givenName ?? "",
        surname: profile.surname ?? "",
        emailVerified: true, // Microsoft verifies emails
        socialCode,
        allowRegister: true,
        userField: "email",
      },
      req,
    );

    handleSocialLoginResult(
      restController,
      sessionManager,
      result,
      "microsoft",
      socialCode,
      res,
    );
  } catch (error) {
    console.error(
      "Microsoft OAuth callback error:",
      error.response?.data || error,
    );
    if (SOCIAL_LOGIN_REDIRECT_URL) {
      const errorMsg = error.message || "Microsoft authentication failed";
      const encoded = Buffer.from(
        JSON.stringify({ type: "error", message: errorMsg }),
      ).toString("base64url");
      return res.redirect(
        `${SOCIAL_LOGIN_REDIRECT_URL}?provider=microsoft&error=${encoded}`,
      );
    }
    next(new HttpServerError("errMsg_MicrosoftAuthFailed", error));
  }
});

// GitHub OAuth configuration

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI =
  process.env.GITHUB_REDIRECT_URI ??
  process.env.SERVICE_URL + "/auth/github/callback";

router.get("/auth/github", (req, res) => {
  const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDIRECT_URI}&scope=read:user user:email`;
  res.redirect(url);
});

router.get("/auth/github/callback", async (req, res, next) => {
  const { code } = req.query;

  if (!code)
    return next(new BadRequestError("errMsg_MissingAuthorizationCode"));

  try {
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: GITHUB_REDIRECT_URI,
      },
      {
        headers: { Accept: "application/json" },
      },
    );

    const access_token = tokenResponse.data.access_token;

    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const emailResponse = await axios.get(
      "https://api.github.com/user/emails",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      },
    );

    const primaryEmail = emailResponse.data.find((e) => e.primary)?.email ?? "";

    const profile = userResponse.data;
    const socialCode = md5(access_token);

    const restController = await initSocialLoginController(req, res);
    const sessionManager = restController.sessionManager;

    const result = await sessionManager.loginBySocialAccount(
      {
        email: primaryEmail,
        fullname: profile.name || profile.login,
        avatar: profile.avatar_url,
        name: profile.name?.split(" ")[0] ?? profile.login,
        surname: profile.name?.split(" ").slice(1).join(" ") ?? "",
        emailVerified: true,
        socialCode,
        allowRegister: true,
        userField: "email",
      },
      req,
    );

    handleSocialLoginResult(
      restController,
      sessionManager,
      result,
      "github",
      socialCode,
      res,
    );
  } catch (error) {
    console.error(
      "GitHub OAuth callback error:",
      error.response?.data || error,
    );
    if (SOCIAL_LOGIN_REDIRECT_URL) {
      const errorMsg = error.message || "GitHub authentication failed";
      const encoded = Buffer.from(
        JSON.stringify({ type: "error", message: errorMsg }),
      ).toString("base64url");
      return res.redirect(
        `${SOCIAL_LOGIN_REDIRECT_URL}?provider=github&error=${encoded}`,
      );
    }
    next(new HttpServerError("errMsg_GithubAuthFailed", error));
  }
});

router.get("/github-auth/callback", (req, res) => {
  const path = require("path");
  res.setHeader("Content-Type", "text/html");
  res.sendFile(
    path.resolve(
      __dirname,
      "../../project-session/authdemo/github-callback.html",
    ),
  );
});

// gitlab OAuth configuration
const GITLAB_CLIENT_ID = process.env.GITLAB_CLIENT_ID;
const GITLAB_CLIENT_SECRET = process.env.GITLAB_CLIENT_SECRET;
const GITLAB_REDIRECT_URI =
  process.env.GITLAB_REDIRECT_URI ??
  process.env.SERVICE_URL + "/auth/gitlab/callback";

router.get("/auth/gitlab", (req, res) => {
  const url = `https://gitlab.com/oauth/authorize?client_id=${GITLAB_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITLAB_REDIRECT_URI)}&response_type=code&scope=read_user`;
  res.redirect(url);
});

router.get("/auth/gitlab/callback", async (req, res, next) => {
  const { code } = req.query;

  if (!code)
    return next(new BadRequestError("errMsg_MissingAuthorizationCode"));

  try {
    const tokenResponse = await axios.post(
      "https://gitlab.com/oauth/token",
      null,
      {
        params: {
          client_id: GITLAB_CLIENT_ID,
          client_secret: GITLAB_CLIENT_SECRET,
          code,
          grant_type: "authorization_code",
          redirect_uri: GITLAB_REDIRECT_URI,
        },
      },
    );

    const access_token = tokenResponse.data.access_token;

    const userResponse = await axios.get("https://gitlab.com/api/v4/user", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const profile = userResponse.data;
    const socialCode = md5(access_token);

    const restController = await initSocialLoginController(req, res);
    const sessionManager = restController.sessionManager;

    const result = await sessionManager.loginBySocialAccount(
      {
        email: profile.email,
        fullname: profile.name,
        avatar: profile.avatar_url,
        name: profile.name?.split(" ")[0] ?? profile.username,
        surname: profile.name?.split(" ").slice(1).join(" ") ?? "",
        emailVerified: true,
        socialCode,
        allowRegister: true,
        userField: "email",
      },
      req,
    );

    handleSocialLoginResult(
      restController,
      sessionManager,
      result,
      "gitlab",
      socialCode,
      res,
    );
  } catch (error) {
    console.error(
      "GitLab OAuth callback error:",
      error.response?.data || error,
    );
    if (SOCIAL_LOGIN_REDIRECT_URL) {
      const errorMsg = error.message || "GitLab authentication failed";
      const encoded = Buffer.from(
        JSON.stringify({ type: "error", message: errorMsg }),
      ).toString("base64url");
      return res.redirect(
        `${SOCIAL_LOGIN_REDIRECT_URL}?provider=gitlab&error=${encoded}`,
      );
    }
    next(new HttpServerError("errMsg_GitlabAuthFailed", error));
  }
});

router.get("/gitlab-auth/callback", (req, res) => {
  const path = require("path");
  res.setHeader("Content-Type", "text/html");
  res.sendFile(
    path.resolve(
      __dirname,
      "../../project-session/authdemo/gitlab-callback.html",
    ),
  );
});

// LinkedIn OAuth configuration (OpenID Connect)

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_REDIRECT_URI =
  process.env.LINKEDIN_REDIRECT_URI ??
  process.env.SERVICE_URL + "/auth/linkedin/callback";

router.get("/auth/linkedin", (req, res) => {
  let redirectUri = LINKEDIN_REDIRECT_URI;
  let state = null;
  if (req.tenantCodename) {
    const uri = new URL(LINKEDIN_REDIRECT_URI);
    uri.pathname = `/$${req.tenantCodename}${uri.pathname}`;
    const redirectWithTenant = uri.toString();
    const stateObj = {
      redirect: redirectWithTenant,
    };
    state = encodeURIComponent(
      Buffer.from(JSON.stringify(stateObj)).toString("base64"),
    );
    redirectUri = REDIRECT_PORTAL_URI;
  }

  const url =
    `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent("openid profile email")}` +
    (state ? `&state=${state}` : "");
  res.redirect(url);
});

router.get("/auth/linkedin/callback", async (req, res, next) => {
  const { code } = req.query;

  if (!code)
    return next(new BadRequestError("errMsg_MissingAuthorizationCode"));

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: LINKEDIN_REDIRECT_URI,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
      }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
    );

    const access_token = tokenResponse.data.access_token;

    // Fetch user profile using OpenID Connect userinfo endpoint
    const profileResponse = await axios.get(
      "https://api.linkedin.com/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      },
    );

    const profile = profileResponse.data;
    const socialCode = md5(access_token);

    const restController = await initSocialLoginController(req, res);
    const sessionManager = restController.sessionManager;

    const result = await sessionManager.loginBySocialAccount(
      {
        email: profile.email,
        fullname:
          profile.name ||
          `${profile.given_name ?? ""} ${profile.family_name ?? ""}`.trim(),
        avatar: profile.picture,
        name: profile.given_name ?? "",
        surname: profile.family_name ?? "",
        emailVerified: profile.email_verified ?? true,
        socialCode,
        allowRegister: true,
        userField: "email",
      },
      req,
    );

    handleSocialLoginResult(
      restController,
      sessionManager,
      result,
      "linkedin",
      socialCode,
      res,
    );
  } catch (error) {
    console.error(
      "LinkedIn OAuth callback error:",
      error.response?.data || error,
    );
    if (SOCIAL_LOGIN_REDIRECT_URL) {
      const errorMsg = error.message || "LinkedIn authentication failed";
      const encoded = Buffer.from(
        JSON.stringify({ type: "error", message: errorMsg }),
      ).toString("base64url");
      return res.redirect(
        `${SOCIAL_LOGIN_REDIRECT_URL}?provider=linkedin&error=${encoded}`,
      );
    }
    next(new HttpServerError("errMsg_LinkedinAuthFailed", error));
  }
});

const getSocialLoginRouter = () => {
  return router;
};

module.exports = {
  getSocialLoginRouter,
};
