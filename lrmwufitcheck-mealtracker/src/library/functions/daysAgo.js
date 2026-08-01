/**
 * daysAgo(n, fromDate)
 * Returns the ISO 8601 date string for the date n days before fromDate
 * (defaults to today, accepts an ISO "YYYY-MM-DD" string or Date).
 * Uses UTC date math throughout so a plain "YYYY-MM-DD" string (parsed by
 * Date as UTC midnight, per spec) isn't silently shifted by the host's
 * local timezone offset.
 */
module.exports = function daysAgo(n, fromDate) {
  const d = fromDate
    ? new Date(
        typeof fromDate === "string" && !fromDate.includes("T")
          ? fromDate + "T00:00:00.000Z"
          : fromDate,
      )
    : new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
};
