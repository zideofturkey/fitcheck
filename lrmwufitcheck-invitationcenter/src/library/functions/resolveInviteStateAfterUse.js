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
