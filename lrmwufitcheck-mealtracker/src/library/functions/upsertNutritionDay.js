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

  // Sum all mealLogs for this user+date
  const logs = await getMealLogListByMQuery({ userId, mealDate: date });
  const mealCount = logs && logs.items ? logs.items.length : 0;

  let consumed = {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    sugar: 0,
    fiber: 0,
  };
  if (logs && logs.items) {
    for (const log of logs.items) {
      consumed.calories += log.totalCalories || 0;
      consumed.protein += log.totalProtein || 0;
      consumed.carbohydrates += log.totalCarbohydrates || 0;
      consumed.fat += log.totalFat || 0;
      consumed.sugar += log.totalSugar || 0;
      consumed.fiber += log.totalFiber || 0;
    }
  }

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
    });
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
  const existing = await getNutritionDayListByMQuery({
    userId,
    summaryDate: date,
  });
  if (existing && existing.items && existing.items.length > 0) {
    await updateNutritionDayByMQuery(
      { userId, summaryDate: date },
      payload,
      context,
    );
    return { ...existing.items[0], ...payload };
  } else {
    const created = await createNutritionDay(payload, context);
    return created;
  }
};
