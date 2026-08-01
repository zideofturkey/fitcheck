const {
  getNutritionDayListByMQuery,
  getMealLogListByMQuery,
} = require("dbLayer");

const MACROS = ["calories", "protein", "carbohydrates", "fat", "sugar", "fiber"];
const SLOT_ORDER = ["breakfast", "lunch", "dinner", "snack"];

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

function addDays(iso, n) {
  const d = new Date(iso + "T00:00:00.000Z");
  d.setUTCDate(d.getUTCDate() + n);
  return isoDate(d);
}

async function fetchDays(userId, startIso, endIso) {
  // Pass actual Date instances, not raw "YYYY-MM-DD" strings, and use an
  // exclusive upper bound: Sequelize's DATE serializer re-parses plain date
  // strings using local-timezone semantics, which silently shifts the value
  // by the host's UTC offset and can drop rows stored at true UTC midnight
  // (see the identical workaround in get-dailyprogress-api.js).
  const endExclusive = addDays(endIso, 1);
  const days = await getNutritionDayListByMQuery({
    $and: [
      { userId },
      { summaryDate: { $gte: new Date(startIso + "T00:00:00.000Z") } },
      { summaryDate: { $lt: new Date(endExclusive + "T00:00:00.000Z") } },
    ],
  });
  return days
    .slice()
    .sort((a, b) => (a.summaryDate < b.summaryDate ? -1 : 1));
}

function computeAveragesAndHitRates(days) {
  const n = days.length || 1;
  const avgs = {};
  const hitRates = {};
  for (const macro of MACROS) {
    const consumed = `consumed${capitalize(macro)}`;
    const target = `target${capitalize(macro)}`;
    const total = days.reduce((s, d) => s + (d[consumed] || 0), 0);
    avgs[`avgDaily${capitalize(macro)}`] = total / n;
    const hits = days.filter(
      (d) => (d[target] || 0) === 0 || (d[consumed] || 0) <= (d[target] || 0),
    ).length;
    hitRates[`${macro}HitRate`] =
      days.length > 0 ? (hits / days.length) * 100 : 100;
  }
  return { avgs, hitRates };
}

function computeBestWorstDay(days) {
  const eligible = days
    .filter((d) => (d.targetCalories || 0) > 0)
    .map((d) => ({
      date: d.summaryDate,
      consumedCalories: d.consumedCalories || 0,
      targetCalories: d.targetCalories || 0,
      diffPct:
        ((d.consumedCalories || 0) - d.targetCalories) / d.targetCalories,
    }));
  if (eligible.length === 0) return { bestDay: null, worstDay: null };
  const bestDay = eligible.reduce((a, b) => (b.diffPct < a.diffPct ? b : a));
  const worstDay = eligible.reduce((a, b) => (b.diffPct > a.diffPct ? b : a));
  return { bestDay, worstDay };
}

function computeStreak(days, referenceDateIso) {
  // summaryDate comes back from Sequelize as a native Date instance (not a
  // string), while referenceDateIso and the cursor below are plain
  // "YYYY-MM-DD" strings - String(dateObj) gives its default
  // "Sat Aug 01 2026 ..." form, not ISO, so every map lookup would miss.
  // Route through toISOString() explicitly instead.
  const byDate = new Map(
    days.map((d) => [new Date(d.summaryDate).toISOString().slice(0, 10), d]),
  );
  let streak = 0;
  let cursor = referenceDateIso;
  while (true) {
    const d = byDate.get(cursor);
    if (!d) break;
    const met = (d.targetCalories || 0) === 0 || (d.consumedCalories || 0) <= d.targetCalories;
    if (!met) break;
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

async function computeSlotBreakdown(userId, startIso, endIso) {
  const endExclusive = addDays(endIso, 1);
  const mealLogs = await getMealLogListByMQuery({
    $and: [
      { userId },
      { mealDate: { $gte: new Date(startIso + "T00:00:00.000Z") } },
      { mealDate: { $lt: new Date(endExclusive + "T00:00:00.000Z") } },
    ],
  });

  const bySlot = new Map();
  for (const m of mealLogs) {
    const slot = (m.slotName || "other").toLowerCase();
    const entry = bySlot.get(slot) || {
      slotName: slot,
      totalCalories: 0,
      totalProtein: 0,
      totalCarbohydrates: 0,
      totalFat: 0,
      mealCount: 0,
    };
    entry.totalCalories += m.totalCalories || 0;
    entry.totalProtein += m.totalProtein || 0;
    entry.totalCarbohydrates += m.totalCarbohydrates || 0;
    entry.totalFat += m.totalFat || 0;
    entry.mealCount += 1;
    bySlot.set(slot, entry);
  }

  const grandTotalCalories = Array.from(bySlot.values()).reduce(
    (s, e) => s + e.totalCalories,
    0,
  );

  const slots = Array.from(bySlot.values())
    .map((e) => ({
      ...e,
      percentage:
        grandTotalCalories > 0
          ? (e.totalCalories / grandTotalCalories) * 100
          : 0,
    }))
    .sort((a, b) => {
      const ai = SLOT_ORDER.indexOf(a.slotName);
      const bi = SLOT_ORDER.indexOf(b.slotName);
      if (ai === -1 && bi === -1) return a.slotName.localeCompare(b.slotName);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

  return slots;
}

/**
 * buildPeriodAnalytics(userId, referenceDate, periodDays)
 * Computes averages, hit-rates, a period-over-period comparison, the
 * best/worst day, a per-meal-slot breakdown, and a target-adherence streak
 * for the `periodDays`-day window ending on referenceDate.
 */
module.exports = async function buildPeriodAnalytics(
  userId,
  referenceDate,
  periodDays,
) {
  if (!userId) return null;

  const refIso = referenceDate
    ? new Date(referenceDate).toISOString().slice(0, 10)
    : isoDate(new Date());

  const currentStart = addDays(refIso, -(periodDays - 1));
  const currentEnd = refIso;
  const previousEnd = addDays(currentStart, -1);
  const previousStart = addDays(previousEnd, -(periodDays - 1));

  const [currentDays, previousDays, slotBreakdown] = await Promise.all([
    fetchDays(userId, currentStart, currentEnd),
    fetchDays(userId, previousStart, previousEnd),
    computeSlotBreakdown(userId, currentStart, currentEnd),
  ]);

  const { avgs, hitRates } = computeAveragesAndHitRates(currentDays);
  const { avgs: prevAvgs } = computeAveragesAndHitRates(previousDays);

  const deltaPct = {};
  for (const macro of MACROS) {
    const key = `avgDaily${capitalize(macro)}`;
    const cur = avgs[key];
    const prev = prevAvgs[key];
    deltaPct[`${macro}DeltaPct`] =
      prev > 0 ? ((cur - prev) / prev) * 100 : cur > 0 ? null : 0;
  }

  const caloriesTrend = currentDays.map((d) => ({
    date: d.summaryDate,
    consumed: d.consumedCalories || 0,
    target: d.targetCalories || 0,
  }));

  const trends = {};
  for (const macro of MACROS) {
    const consumed = `consumed${capitalize(macro)}`;
    trends[`${macro}Trend`] = currentDays.map((d) => ({
      date: d.summaryDate,
      consumed: d[consumed] || 0,
    }));
  }

  const { bestDay, worstDay } = computeBestWorstDay(currentDays);
  const streak = computeStreak(currentDays, refIso);

  return {
    ...avgs,
    ...hitRates,
    ...trends,
    caloriesTrend,
    dayCount: currentDays.length,
    referenceDate: refIso,
    periodStart: currentStart,
    periodEnd: currentEnd,
    previousPeriodStart: previousStart,
    previousPeriodEnd: previousEnd,
    previous: prevAvgs,
    deltaPct,
    bestDay,
    worstDay,
    slotBreakdown,
    streak,
  };
};
