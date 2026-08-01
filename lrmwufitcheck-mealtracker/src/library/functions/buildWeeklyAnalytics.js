const buildPeriodAnalytics = require("./buildPeriodAnalytics");

/**
 * buildWeeklyAnalytics(userId, referenceDate)
 * 7-day window ending on referenceDate (defaults to today). See
 * buildPeriodAnalytics.js for the full computed shape.
 */
module.exports = async function buildWeeklyAnalytics(userId, referenceDate) {
  return buildPeriodAnalytics(userId, referenceDate, 7);
};
