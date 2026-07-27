// Lightweight auth middleware for simple Express routes (src/routes/*).
// Reuses the same session/JWT verification the heavy Mindbricks REST
// controllers use (sessionLayer -> FitcheckSession), without the Manager
// ceremony. Populates req.session on success, exactly like the heavy path.
const { createSessionManager } = require("sessionLayer");

function readToken(req) {
  if (req.query?.access_token) return req.query.access_token;
  const authHeader = req.headers?.authorization || "";
  if (authHeader.startsWith("Bearer ")) return authHeader.slice(7);
  return null;
}

module.exports = async function requireAuth(req, res, next) {
  try {
    req.sessionToken = readToken(req);
    const sessionManager = createSessionManager(req);
    await sessionManager.verifySessionToken(req);

    if (!req.session) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    next();
  } catch (err) {
    res.status(401).json({ error: err.message || "Authentication failed" });
  }
};
