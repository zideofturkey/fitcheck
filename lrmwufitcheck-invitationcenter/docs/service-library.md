# Service Library - `invitationCenter`

This document provides a complete reference of the custom code library for the `invitationCenter` service. It includes all library functions, edge functions with their REST endpoints, templates, and assets.

## Library Functions

Library functions are reusable modules available to all business APIs and other custom code within the service via `require("lib/<moduleName>")`.

### `generateInviteCode.js`

```js
const crypto = require("crypto");

/**
 * Generates a cryptographically strong, URL-safe, hard-to-guess unique token
 * suitable for use as a registration invite link token.
 * Returns a 32-character URL-safe base64 string (43 chars with padding stripped).
 */
module.exports = function generateInviteCode() {
  return crypto.randomBytes(24).toString("base64url");
};
```

### `resolveInviteStateAfterUse.js`

```js
/**
 * Given an inviteLink record (with usageMode, usageCount, usageLimit),
 * returns the correct new inviteState after a validation/use event.
 *
 * - singleUse → always 'consumed'
 * - limitedUse and usageCount + 1 >= usageLimit → 'exhausted'
 * - limitedUse with remaining uses → 'active'
 *
 * @param {object} inviteLink - The current inviteLink record
 * @returns {string} The new inviteState value
 */
module.exports = function resolveInviteStateAfterUse(inviteLink) {
  if (!inviteLink) return "consumed";
  if (inviteLink.usageMode === "singleUse") {
    return "consumed";
  }
  // limitedUse
  const newCount = (inviteLink.usageCount || 0) + 1;
  if (inviteLink.usageLimit && newCount >= inviteLink.usageLimit) {
    return "exhausted";
  }
  return "active";
};
```

### `now.js`

```js
/**
 * Returns the current UTC timestamp as an ISO 8601 string.
 * Used across multiple APIs and actions for consistent timestamp injection.
 *
 * @returns {string} ISO 8601 timestamp string
 */
module.exports = function now() {
  return new Date().toISOString();
};
```

---

_This document was generated from the service library configuration and should be kept in sync with design changes._
