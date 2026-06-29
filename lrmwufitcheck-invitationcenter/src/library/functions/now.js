/**
 * Returns the current UTC timestamp as an ISO 8601 string.
 * Used across multiple APIs and actions for consistent timestamp injection.
 *
 * @returns {string} ISO 8601 timestamp string
 */
module.exports = function now() {
  return new Date().toISOString();
};
