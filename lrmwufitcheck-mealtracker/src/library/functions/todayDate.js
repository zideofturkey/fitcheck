/**
 * todayDate()
 * Returns today's date as an ISO 8601 date string (YYYY-MM-DD) in server local time.
 */
module.exports = function todayDate() {
  return new Date().toISOString().slice(0, 10);
};
