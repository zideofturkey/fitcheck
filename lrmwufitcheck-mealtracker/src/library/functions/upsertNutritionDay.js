/**
 * upsertNutritionDay(userId, date)
 * Fetches all mealLog rows for the user+date, sums macros, counts meals,
 * calls nutritionLibrary to get macro targets, computes exceededMetrics,
 * then upserts the nutritionDay record.
 */
const {
  getMealLogListByMQuery,
  getNutritionDayListByMQuery,
  createNutritionDay,
  updateNutritionDayByMQuery,
} = require("dbLayer");
const { fetchRemoteObjectByMQuery } = require("serviceCommon");

module.exports = async function upsertNutritionDay(
  userId,
  date,
  context = null,
) {
  if (!userId || !date) return null;

  // Normalize once, here, regardless of what the caller passed in: some
  // call sites pass a real Date instance, others pass the raw "YYYY-MM-DD"
  // string straight from a request body. Sequelize's DATE serializer
  // re-parses plain strings using local-timezone semantics (unlike native
  // `new Date()`, which parses ISO date-only strings as UTC), so on a
  // non-UTC host a string value silently misses the row a Date instance
  // would have matched - turning "update existing day" into "insert a
  // duplicate" and tripping the (userId, summaryDate) unique constraint.
  date = date instanceof Date ? date : new Date(date);

  // Sum all mealLogs for this user+date
  const logs = (await getMealLogListByMQuery({ userId, mealDate: date })) || [];
  const mealCount = logs.length;

  let consumed = {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    sugar: 0,
    fiber: 0,
  };
  for (const log of logs) {
    consumed.calories += log.totalCalories || 0;
    consumed.protein += log.totalProtein || 0;
    consumed.carbohydrates += log.totalCarbohydrates || 0;
    consumed.fat += log.totalFat || 0;
    consumed.sugar += log.totalSugar || 0;
    consumed.fiber += log.totalFiber || 0;
  }
  const round = (n) => Math.round(n * 100) / 100;
  consumed.calories = round(consumed.calories);
  consumed.protein = round(consumed.protein);
  consumed.carbohydrates = round(consumed.carbohydrates);
  consumed.fat = round(consumed.fat);
  consumed.sugar = round(consumed.sugar);
  consumed.fiber = round(consumed.fiber);

  // Fetch macro targets from nutritionLibrary service
  let targets = {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    sugar: 0,
    fiber: 0,
  };
  try {
    const macroTarget = await fetchRemoteObjectByMQuery("macroTarget", {
      userId,
      isActive: true,
    });
    if (macroTarget) {
      // macroTarget's real fields are suffixed (calorieTarget, proteinTarget,
      // ...) not prefixed - reading the wrong names here silently produced
      // undefined || 0 every time, so targets were always zero even once
      // the macroTarget document itself was found successfully.
      targets.calories = macroTarget.calorieTarget || 0;
      targets.protein = macroTarget.proteinTarget || 0;
      targets.carbohydrates = macroTarget.carbohydrateTarget || 0;
      targets.fat = macroTarget.fatTarget || 0;
      targets.sugar = macroTarget.sugarTarget || 0;
      targets.fiber = macroTarget.fiberTarget || 0;
    }
  } catch (e) {
    console.log("upsertNutritionDay: failed to fetch macroTarget:", e.message);
    //**errorLog
  }

  // Compute exceededMetrics
  const exceeded = [];
  if (targets.calories > 0 && consumed.calories > targets.calories)
    exceeded.push("calories");
  if (targets.protein > 0 && consumed.protein > targets.protein)
    exceeded.push("protein");
  if (
    targets.carbohydrates > 0 &&
    consumed.carbohydrates > targets.carbohydrates
  )
    exceeded.push("carbohydrates");
  if (targets.fat > 0 && consumed.fat > targets.fat) exceeded.push("fat");
  if (targets.sugar > 0 && consumed.sugar > targets.sugar)
    exceeded.push("sugar");
  if (targets.fiber > 0 && consumed.fiber > targets.fiber)
    exceeded.push("fiber");
  const exceededMetrics = exceeded.join(",") || null;

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
    mealCount,
  };

  // Upsert: check if exists
  const existing =
    (await getNutritionDayListByMQuery({
      userId,
      summaryDate: date,
    })) || [];
  if (existing.length > 0) {
    await updateNutritionDayByMQuery(
      payload,
      { userId, summaryDate: date },
      context,
    );
    return { ...existing[0], ...payload };
  } else {
    const created = await createNutritionDay(payload, context);
    return created;
  }
};
