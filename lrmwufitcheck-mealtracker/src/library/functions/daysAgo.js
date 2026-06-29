/**
 * daysAgo(n)
 * Returns the ISO 8601 date string for the date n days before today.
 */
module.exports = function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};
