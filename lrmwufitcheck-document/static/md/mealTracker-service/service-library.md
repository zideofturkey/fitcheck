
# Service Library - `mealTracker`

This document provides a complete reference of the custom code library for the `mealTracker` service. It includes all library functions, edge functions with their REST endpoints, templates, and assets.


## Library Functions

Library functions are reusable modules available to all business APIs and other custom code within the service via `require("lib/<moduleName>")`.


### `upsertNutritionDay.js`

```js
/**
 * upsertNutritionDay(userId, date)
 * Fetches all mealLog rows for the user+date, sums macros, counts meals,
 * calls nutritionLibrary to get macro targets, computes exceededMetrics,
 * then upserts the nutritionDay record.
 */
const { getMealLogListByMQuery, getNutritionDayListByMQuery, createNutritionDay, updateNutritionDayByMQuery } = require('dbLayer');
const { fetchRemoteObjectByMQuery } = require('serviceCommon');

module.exports = async function upsertNutritionDay(userId, date, context = null) {
  if (!userId || !date) return null;

  // Sum all mealLogs for this user+date
  const logs = await getMealLogListByMQuery({ userId, mealDate: date });
  const mealCount = (logs && logs.items) ? logs.items.length : 0;

  let consumed = { calories: 0, protein: 0, carbohydrates: 0, fat: 0, sugar: 0, fiber: 0 };
  if (logs && logs.items) {
    for (const log of logs.items) {
      consumed.calories += (log.totalCalories || 0);
      consumed.protein += (log.totalProtein || 0);
      consumed.carbohydrates += (log.totalCarbohydrates || 0);
      consumed.fat += (log.totalFat || 0);
      consumed.sugar += (log.totalSugar || 0);
      consumed.fiber += (log.totalFiber || 0);
    }
  }

  // Fetch macro targets from nutritionLibrary service
  let targets = { calories: 0, protein: 0, carbohydrates: 0, fat: 0, sugar: 0, fiber: 0 };
  try {
    const macroTarget = await fetchRemoteObjectByMQuery('macroTarget', { userId });
    if (macroTarget) {
      targets.calories = macroTarget.targetCalories || 0;
      targets.protein = macroTarget.targetProtein || 0;
      targets.carbohydrates = macroTarget.targetCarbohydrates || 0;
      targets.fat = macroTarget.targetFat || 0;
      targets.sugar = macroTarget.targetSugar || 0;
      targets.fiber = macroTarget.targetFiber || 0;
    }
  } catch (e) {
    // nutritionLibrary may not be available — proceed with zero targets
  }

  // Compute exceededMetrics
  const exceeded = [];
  if (targets.calories > 0 && consumed.calories > targets.calories) exceeded.push('calories');
  if (targets.protein > 0 && consumed.protein > targets.protein) exceeded.push('protein');
  if (targets.carbohydrates > 0 && consumed.carbohydrates > targets.carbohydrates) exceeded.push('carbohydrates');
  if (targets.fat > 0 && consumed.fat > targets.fat) exceeded.push('fat');
  if (targets.sugar > 0 && consumed.sugar > targets.sugar) exceeded.push('sugar');
  if (targets.fiber > 0 && consumed.fiber > targets.fiber) exceeded.push('fiber');
  const exceededMetrics = exceeded.join(',') || null;

  const payload = {
    userId,
    summaryDate: date,
    consumedCalories: consumed.calories,
    consumedProtein: consumed.protein,
    consumedCarbohydrates: consumed.carbohydrates,
    consumedFat: consumed.fat,
    consumedSugar: consumed.sugar,
    consumedFiber: consumed.fiber,
    targetCalories: targets.calories,
    targetProtein: targets.protein,
    targetCarbohydrates: targets.carbohydrates,
    targetFat: targets.fat,
    targetSugar: targets.sugar,
    targetFiber: targets.fiber,
    exceededMetrics,
    mealCount
  };

  // Upsert: check if exists
  const existing = await getNutritionDayListByMQuery({ userId, summaryDate: date });
  if (existing && existing.items && existing.items.length > 0) {
    await updateNutritionDayByMQuery({ userId, summaryDate: date }, payload, context);
    return { ...existing.items[0], ...payload };
  } else {
    const created = await createNutritionDay(payload, context);
    return created;
  }
};

```


### `recalculateMealTotals.js`

```js
/**
 * recalculateMealTotals(mealLogId)
 * Sums all mealLine nutrition values for a given mealLogId
 * and updates the parent mealLog record with recomputed totals.
 */
const { getMealLineListByMQuery, updateMealLogById } = require('dbLayer');

module.exports = async function recalculateMealTotals(mealLogId, context = null) {
  if (!mealLogId) return null;

  const linesResult = await getMealLineListByMQuery({ mealLogId });
  const lines = (linesResult && linesResult.items) ? linesResult.items : [];

  const totals = {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbohydrates: 0,
    totalFat: 0,
    totalSugar: 0,
    totalFiber: 0
  };

  for (const line of lines) {
    totals.totalCalories += (line.itemCalories || 0);
    totals.totalProtein += (line.itemProtein || 0);
    totals.totalCarbohydrates += (line.itemCarbohydrates || 0);
    totals.totalFat += (line.itemFat || 0);
    totals.totalSugar += (line.itemSugar || 0);
    totals.totalFiber += (line.itemFiber || 0);
  }

  await updateMealLogById(mealLogId, totals, context);
  return totals;
};

```


### `buildWeeklyAnalytics.js`

```js
/**
 * buildWeeklyAnalytics(userId)
 * Queries the last 7 nutritionDay rows, computes per-macro averages,
 * goal hit rates, and a caloriesTrend array.
 */
const { getNutritionDayListByMQuery } = require('dbLayer');

module.exports = async function buildWeeklyAnalytics(userId) {
  if (!userId) return null;

  const result = await getNutritionDayListByMQuery(
    { userId, summaryDate: { $gte: daysAgoDate(7) } },
    { sortBy: [{ property: 'summaryDate', order: 'asc' }], limit: 7 }
  );
  const days = (result && result.items) ? result.items : [];
  const n = days.length || 1;

  const macros = ['calories', 'protein', 'carbohydrates', 'fat', 'sugar', 'fiber'];
  const avgs = {};
  const hitRates = {};

  for (const macro of macros) {
    const consumed = `consumed${capitalize(macro)}`;
    const target = `target${capitalize(macro)}`;
    const total = days.reduce((s, d) => s + (d[consumed] || 0), 0);
    avgs[`avgDaily${capitalize(macro)}`] = total / n;
    const hits = days.filter(d => (d[target] || 0) === 0 || (d[consumed] || 0) <= (d[target] || 0)).length;
    hitRates[`${macro}HitRate`] = days.length > 0 ? (hits / days.length) * 100 : 100;
  }

  const caloriesTrend = days.map(d => ({ date: d.summaryDate, consumed: d.consumedCalories || 0 }));

  return { ...avgs, ...hitRates, caloriesTrend, dayCount: days.length };
};

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function daysAgoDate(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

```


### `buildMonthlyAnalytics.js`

```js
/**
 * buildMonthlyAnalytics(userId)
 * Queries the last 30 nutritionDay rows, computes per-macro averages,
 * goal hit rates, and trend arrays for all six macros.
 */
const { getNutritionDayListByMQuery } = require('dbLayer');

module.exports = async function buildMonthlyAnalytics(userId) {
  if (!userId) return null;

  const result = await getNutritionDayListByMQuery(
    { userId, summaryDate: { $gte: daysAgoDate(30) } },
    { sortBy: [{ property: 'summaryDate', order: 'asc' }], limit: 30 }
  );
  const days = (result && result.items) ? result.items : [];
  const n = days.length || 1;

  const macros = ['calories', 'protein', 'carbohydrates', 'fat', 'sugar', 'fiber'];
  const avgs = {};
  const hitRates = {};
  const trends = {};

  for (const macro of macros) {
    const consumed = `consumed${capitalize(macro)}`;
    const target = `target${capitalize(macro)}`;
    const total = days.reduce((s, d) => s + (d[consumed] || 0), 0);
    avgs[`avgDaily${capitalize(macro)}`] = total / n;
    const hits = days.filter(d => (d[target] || 0) === 0 || (d[consumed] || 0) <= (d[target] || 0)).length;
    hitRates[`${macro}HitRate`] = days.length > 0 ? (hits / days.length) * 100 : 100;
    trends[`${macro}Trend`] = days.map(d => ({ date: d.summaryDate, consumed: d[consumed] || 0 }));
  }

  return { ...avgs, ...hitRates, ...trends, dayCount: days.length };
};

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function daysAgoDate(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

```


### `todayDate.js`

```js
/**
 * todayDate()
 * Returns today's date as an ISO 8601 date string (YYYY-MM-DD) in server local time.
 */
module.exports = function todayDate() {
  return new Date().toISOString().slice(0, 10);
};

```


### `daysAgo.js`

```js
/**
 * daysAgo(n)
 * Returns the ISO 8601 date string for the date n days before today.
 */
module.exports = function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

```


### `getUsersWithNoMealsToday.js`

```js
/**
 * getUsersWithNoMealsToday()
 * Returns users who have no mealLog for today or whose nutritionDay.mealCount === 0.
 * Enriches each with fullName and email via inter-service auth lookup.
 */
const { getNutritionDayListByMQuery } = require('dbLayer');
const { fetchRemoteListByMQuery } = require('serviceCommon');

module.exports = async function getUsersWithNoMealsToday() {
  const today = new Date().toISOString().slice(0, 10);

  // Get all nutritionDay records for today with mealCount === 0
  const zeroResult = await getNutritionDayListByMQuery({ summaryDate: today, mealCount: 0 });
  const zeroUserIds = (zeroResult && zeroResult.items) ? zeroResult.items.map(d => d.userId) : [];

  // Also get all users from auth service and subtract those who have logged meals today
  let allUsers = [];
  try {
    const usersResult = await fetchRemoteListByMQuery('user', {});
    allUsers = (usersResult && usersResult.items) ? usersResult.items : [];
  } catch (e) {
    allUsers = [];
  }

  const todayResult = await getNutritionDayListByMQuery({ summaryDate: today });
  const todayUserIds = new Set((todayResult && todayResult.items) ? todayResult.items.filter(d => d.mealCount > 0).map(d => d.userId) : []);

  const usersWithNoMeals = allUsers.filter(u => !todayUserIds.has(u.id));

  return usersWithNoMeals.map(u => ({
    userId: u.id,
    fullName: u.fullname || u.name || '',
    email: u.email || '',
    todayDate: today
  }));
};

```


### `getUsersWithMealsToday.js`

```js
/**
 * getUsersWithMealsToday()
 * Returns nutritionDay rows for today where mealCount > 0,
 * enriched with fullName and email from auth service.
 */
const { getNutritionDayListByMQuery } = require('dbLayer');
const { fetchRemoteObjectByMQuery } = require('serviceCommon');

module.exports = async function getUsersWithMealsToday() {
  const today = new Date().toISOString().slice(0, 10);

  const result = await getNutritionDayListByMQuery({ summaryDate: today, mealCount: { $gt: 0 } });
  const days = (result && result.items) ? result.items : [];

  const enriched = await Promise.all(days.map(async (day) => {
    let fullName = '';
    let email = '';
    try {
      const user = await fetchRemoteObjectByMQuery('user', { id: day.userId });
      if (user) {
        fullName = user.fullname || user.name || '';
        email = user.email || '';
      }
    } catch (e) {}
    return { ...day, fullName, email };
  }));

  return enriched;
};

```














---

*This document was generated from the service library configuration and should be kept in sync with design changes.*
