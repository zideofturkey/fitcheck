/**
 * buildMonthlyAnalytics(userId)
 * Queries the last 30 nutritionDay rows, computes per-macro averages,
 * goal hit rates, and trend arrays for all six macros.
 */
const { getNutritionDayListByMQuery } = require("dbLayer");

module.exports = async function buildMonthlyAnalytics(userId) {
  if (!userId) return null;

  const result = await getNutritionDayListByMQuery(
    { userId, summaryDate: { $gte: daysAgoDate(30) } },
    { sortBy: [{ property: "summaryDate", order: "asc" }], limit: 30 },
  );
  const days = result && result.items ? result.items : [];
  const n = days.length || 1;

  const macros = [
    "calories",
    "protein",
    "carbohydrates",
    "fat",
    "sugar",
    "fiber",
  ];
  const avgs = {};
  const hitRates = {};
  const trends = {};

  for (const macro of macros) {
    const consumed = `consumed${capitalize(macro)}`;
    const target = `target${capitalize(macro)}`;
    const total = days.reduce((s, d) => s + (d[consumed] || 0), 0);
    avgs[`avgDaily${capitalize(macro)}`] = total / n;
    const hits = days.filter(
      (d) => (d[target] || 0) === 0 || (d[consumed] || 0) <= (d[target] || 0),
    ).length;
    hitRates[`${macro}HitRate`] =
      days.length > 0 ? (hits / days.length) * 100 : 100;
    trends[`${macro}Trend`] = days.map((d) => ({
      date: d.summaryDate,
      consumed: d[consumed] || 0,
    }));
  }

  return { ...avgs, ...hitRates, ...trends, dayCount: days.length };
};

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function daysAgoDate(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
