const crypto = require("crypto");

/**
 * Generates a cryptographically strong, URL-safe, hard-to-guess unique token
 * suitable for use as a registration invite link token.
 * Returns a 32-character URL-safe base64 string (43 chars with padding stripped).
 */
module.exports = function generateInviteCode() {
  return crypto.randomBytes(24).toString("base64url");
};
