/**
 * Authentication Middleware
 *
 * Validates JWT tokens and attaches user context to requests.
 *
 * Environment Variables:
 * - SKIP_AUTH: Set to 'true' to skip authentication (for local development only!)
 * - AUTH_SERVICE_URL: URL of auth service (used to fetch public key and/or validate tokens)
 * - JWT_PUBLIC_KEY: The RSA public key content for RS256 verification (optional override)
 * - JWT_PUBLIC_KEY_FILE: Path to the public key file (optional override)
 * - JWT_SECRET: Fallback secret for HS256 verification
 * - AUTH_VALIDATE_MODE: 'key' (default) to verify locally, 'session' to validate via /currentuser
 */

const jwt = require("jsonwebtoken");
const axios = require("axios");
const logger = require("../common/logger");
const ApiError = require("../common/ApiError");

// Check if auth should be skipped (local development only!)
const skipAuth = process.env.SKIP_AUTH === "true";
if (skipAuth) {
  logger.warn(
    "⚠️  AUTH SKIPPED - SKIP_AUTH is enabled. Do NOT use in production!",
  );
}

// Cache for public keys (keyId -> publicKey)
const publicKeyCache = new Map();

// Auth service URL
const authServiceUrl =
  process.env.AUTH_SERVICE_URL || "http://lrmwufitcheck-auth-service:3001";

// Validation mode: 'key' (local verification) or 'session' (via /currentuser)
// Defaults to 'session' so tokens are always validated via the auth service's /currentuser
// endpoint, which works as long as AUTH_SERVICE_URL is reachable. Set AUTH_VALIDATE_MODE=key
// only when you have the public key available locally.
const validateMode = process.env.AUTH_VALIDATE_MODE || "session";

/**
 * Fetch public key from auth service
 * @param {string} keyId - The key ID from JWT header
 * @returns {Promise<string|null>} The public key or null
 */
const fetchPublicKeyFromAuthService = async (keyId) => {
  // Check cache first
  if (publicKeyCache.has(keyId)) {
    return publicKeyCache.get(keyId);
  }

  try {
    const url = `${authServiceUrl}/publickey?keyId=${keyId}`;
    logger.info(`[Auth] Fetching public key from ${url}`);

    const response = await axios.get(url, { timeout: 8000 });
    const data = response.data;

    // Auth service returns { keyId, keyData } — extract the PEM string
    const publicKey =
      typeof data === "string"
        ? data
        : data?.publicKey || data?.keyData || null;

    if (
      publicKey &&
      typeof publicKey === "string" &&
      publicKey.includes("-----BEGIN")
    ) {
      publicKeyCache.set(keyId, publicKey);
      logger.info(`[Auth] Public key cached for keyId: ${keyId}`);
      return publicKey;
    }

    logger.warn(
      `[Auth] Public key response for keyId ${keyId} did not contain a valid PEM key. Response fields: ${Object.keys(data || {}).join(", ")}`,
    );
  } catch (err) {
    logger.warn(
      `[Auth] Failed to fetch public key for keyId ${keyId}: ${err.message}`,
    );
  }

  return null;
};

/**
 * Get public key from environment or file (static configuration)
 */
const getStaticPublicKey = () => {
  // 1. Try environment variable (key content)
  if (process.env.JWT_PUBLIC_KEY) {
    return process.env.JWT_PUBLIC_KEY;
  }

  // 2. Try loading from file
  const fs = require("fs");
  const path = require("path");

  // Check custom path first
  const customKeyPath = process.env.JWT_PUBLIC_KEY_FILE;
  if (customKeyPath) {
    try {
      return fs.readFileSync(customKeyPath, "utf8");
    } catch (err) {
      logger.warn(`Failed to load JWT public key from ${customKeyPath}`);
    }
  }

  // Try default path
  try {
    const keyPath = path.join(__dirname, "../../keys/rsa.key.pub");
    return fs.readFileSync(keyPath, "utf8");
  } catch (err) {
    // Try to find any .pub file in keys folder
    try {
      const keysDir = path.join(__dirname, "../../keys");
      const files = fs.readdirSync(keysDir);
      const pubFile = files.find((f) => f.startsWith("rsa.key.pub"));
      if (pubFile) {
        return fs.readFileSync(path.join(keysDir, pubFile), "utf8");
      }
    } catch (e) {
      // Keys folder doesn't exist
    }
  }

  return null;
};

// Load static public key (if configured)
const staticPublicKey = skipAuth ? null : getStaticPublicKey();
const jwtSecret = process.env.JWT_SECRET || "lrmwufitcheck-jwt-secret";

// Log auth configuration at startup
logger.info(
  `[Auth] Configuration — mode: ${validateMode}, authServiceUrl: ${authServiceUrl}, staticPublicKey: ${staticPublicKey ? "loaded" : "not found"}, skipAuth: ${skipAuth}`,
);

/**
 * Validate token by calling auth service /currentuser
 */
const validateWithCurrentUser = async (token, tenantCodename = null) => {
  const url = `${authServiceUrl}/currentuser`;
  try {
    const headers = { Authorization: `Bearer ${token}` };
    logger.info(`[Auth] Validating token via /currentuser at ${url}`);
    const response = await axios.get(url, {
      headers,
      timeout: 10000,
    });
    logger.info("[Auth] /currentuser validation succeeded");
    return { data: response.data };
  } catch (err) {
    const status = err.response?.status;
    const detail = err.response?.data || err.message;
    const networkCode = err.code || null;
    logger.warn(
      `[Auth] /currentuser validation failed — url: ${url}, status: ${status || "N/A"}, detail: ${typeof detail === "string" ? detail : JSON.stringify(detail)}, code: ${networkCode || "N/A"}`,
    );
    return {
      data: null,
      error: {
        url,
        status: status || null,
        detail: typeof detail === "string" ? detail : JSON.stringify(detail),
        networkCode,
      },
    };
  }
};

/**
 * Verify JWT token and return decoded payload
 */
const verifyToken = async (token) => {
  // Decode token header to get keyId
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded) {
    throw new ApiError(401, "Invalid token format");
  }

  const keyId = decoded.header.kid;
  const alg = decoded.header.alg;

  // Method 1: Try static public key first (if configured)
  if (staticPublicKey) {
    try {
      const payload = jwt.verify(token, staticPublicKey, {
        algorithms: ["RS256"],
      });
      return payload;
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        throw new ApiError(401, "Token expired");
      }
      logger.debug(`[Auth] Static key verification failed: ${err.message}`);
    }
  }

  // Method 2: Fetch public key from auth service (if keyId present)
  if (keyId) {
    const publicKey = await fetchPublicKeyFromAuthService(keyId);
    if (publicKey) {
      try {
        const payload = jwt.verify(token, publicKey, { algorithms: ["RS256"] });
        return payload;
      } catch (err) {
        if (err.name === "TokenExpiredError") {
          throw new ApiError(401, "Token expired");
        }
        logger.warn(
          `[Auth] Fetched key verification failed (keyId: ${keyId}): ${err.message}`,
        );
      }
    } else {
      logger.warn(
        `[Auth] Could not obtain public key for keyId: ${keyId} from ${authServiceUrl}`,
      );
    }
  } else {
    logger.debug(
      "[Auth] No keyId (kid) in JWT header, skipping public key fetch",
    );
  }

  // Method 3: Try shared secret (HS256)
  if (jwtSecret) {
    try {
      const payload = jwt.verify(token, jwtSecret);
      return payload;
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        throw new ApiError(401, "Token expired");
      }
      logger.debug(`[Auth] HS256 secret verification failed: ${err.message}`);
    }
  }

  logger.warn(
    `[Auth] All local token verification methods failed (alg: ${alg}, kid: ${keyId || "none"}, staticKey: ${!!staticPublicKey}, authServiceUrl: ${authServiceUrl})`,
  );
  return null;
};

const resolveTenantCodename = (req) => {
  return null;
};

const authMiddleware = async (req, res, next) => {
  try {
    // Skip auth for local development if configured
    if (skipAuth) {
      req.user = {
        userId: "dev-user",
        email: "dev@localhost",
        fullname: "Development User",
        roleId: "admin",
        sessionId: "dev-session",
      };
      return next();
    }

    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const isMcp = req.originalUrl?.includes("/mcp");
      if (isMcp) {
        logger.warn("[MCP-Auth] Rejected — no Bearer token", {
          url: req.originalUrl,
          method: req.method,
          ip: req.headers["x-forwarded-for"] || req.ip,
          userAgent: req.headers["user-agent"],
          headers: Object.keys(req.headers).join(", "),
        });
      }
      throw new ApiError(401, "No authentication token provided");
    }

    const token = authHeader.substring(7);
    req.accessToken = token; // Store the token for forwarding to MCP tools
    let userContext = null;

    const tenantCodename = resolveTenantCodename(req);

    // Choose validation method based on mode
    if (validateMode === "session") {
      // Validate via /currentuser endpoint
      const result = await validateWithCurrentUser(token, tenantCodename);
      if (!result.data) {
        const e = result.error || {};
        throw new ApiError(
          401,
          `Token validation failed — auth service: ${e.url || authServiceUrl}, http: ${e.status || "no response"}, reason: ${e.detail || "unknown"}${e.networkCode ? `, network: ${e.networkCode}` : ""}`,
        );
      }
      userContext = result.data;
    } else {
      // Verify token locally using public key
      const decoded = await verifyToken(token);

      if (!decoded) {
        // Fallback: try /currentuser as last resort
        const result = await validateWithCurrentUser(token, tenantCodename);
        if (!result.data) {
          const e = result.error || {};
          throw new ApiError(
            401,
            `Invalid token — local verification failed; auth service fallback: ${e.url || authServiceUrl}, http: ${e.status || "no response"}, reason: ${e.detail || "unknown"}${e.networkCode ? `, network: ${e.networkCode}` : ""}`,
          );
        }
        userContext = result.data;
      } else {
        userContext = decoded;
      }
    }

    // Attach user context to request
    req.user = {
      userId: userContext.userId || userContext.sub,
      email: userContext.email,
      fullname: userContext.fullname,
      roleId: userContext.roleId,
      sessionId: userContext.sessionId,
      tenantId: userContext.tenantId,
      tenantCodename: userContext.tenantCodename,
    };

    next();
  } catch (error) {
    const isMcp = req.originalUrl?.includes("/mcp");
    if (isMcp) {
      logger.error("[MCP-Auth] Authentication failed for MCP request", {
        url: req.originalUrl,
        method: req.method,
        ip: req.headers["x-forwarded-for"] || req.ip,
        userAgent: req.headers["user-agent"],
        error: error.message,
        statusCode: error instanceof ApiError ? error.statusCode : 500,
      });
    }
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    logger.error("Auth middleware error:", error);
    return res.status(500).json({ error: "Authentication failed" });
  }
};

module.exports = authMiddleware;
