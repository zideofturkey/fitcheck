/**
 * recalculateMealTotals(mealLogId)
 * Sums all mealLine nutrition values for a given mealLogId
 * and updates the parent mealLog record with recomputed totals.
 */
const { getMealLineListByMQuery, updateMealLogById } = require("dbLayer");

module.exports = async function recalculateMealTotals(
  mealLogId,
  context = null,
) {
  if (!mealLogId) return null;

  const lines = (await getMealLineListByMQuery({ mealLogId })) || [];

  const totals = {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbohydrates: 0,
    totalFat: 0,
    totalSugar: 0,
    totalFiber: 0,
  };

  for (const line of lines) {
    totals.totalCalories += line.itemCalories || 0;
    totals.totalProtein += line.itemProtein || 0;
    totals.totalCarbohydrates += line.itemCarbohydrates || 0;
    totals.totalFat += line.itemFat || 0;
    totals.totalSugar += line.itemSugar || 0;
    totals.totalFiber += line.itemFiber || 0;
  }

  const round = (n) => Math.round(n * 100) / 100;
  totals.totalCalories = round(totals.totalCalories);
  totals.totalProtein = round(totals.totalProtein);
  totals.totalCarbohydrates = round(totals.totalCarbohydrates);
  totals.totalFat = round(totals.totalFat);
  totals.totalSugar = round(totals.totalSugar);
  totals.totalFiber = round(totals.totalFiber);

  await updateMealLogById(mealLogId, totals, context);
  return totals;
};
