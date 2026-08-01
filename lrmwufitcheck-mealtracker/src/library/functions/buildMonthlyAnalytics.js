const buildPeriodAnalytics = require("./buildPeriodAnalytics");

/**
 * buildMonthlyAnalytics(userId, referenceDate)
 * 30-day window ending on referenceDate (defaults to today). See
 * buildPeriodAnalytics.js for the full computed shape.
 */
module.exports = async function buildMonthlyAnalytics(userId, referenceDate) {
  return buildPeriodAnalytics(userId, referenceDate, 30);
};
