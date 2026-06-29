const { getPresetLineListByMQuery, updatePresetMealById } = require("dbLayer");

module.exports = async function recalculatePresetTotals(presetMealId) {
  const lines = await getPresetLineListByMQuery({
    presetMealId,
    isActive: true,
  });
  const totals = {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbohydrates: 0,
    totalFat: 0,
    totalSugar: 0,
    totalFiber: 0,
  };
  if (lines && lines.length > 0) {
    for (const line of lines) {
      totals.totalCalories += line.lineCalories || 0;
      totals.totalProtein += line.lineProtein || 0;
      totals.totalCarbohydrates += line.lineCarbohydrates || 0;
      totals.totalFat += line.lineFat || 0;
      totals.totalSugar += line.lineSugar || 0;
      totals.totalFiber += line.lineFiber || 0;
    }
  }
  // Round to 2 decimal places
  totals.totalCalories = Math.round(totals.totalCalories * 100) / 100;
  totals.totalProtein = Math.round(totals.totalProtein * 100) / 100;
  totals.totalCarbohydrates = Math.round(totals.totalCarbohydrates * 100) / 100;
  totals.totalFat = Math.round(totals.totalFat * 100) / 100;
  totals.totalSugar = Math.round(totals.totalSugar * 100) / 100;
  totals.totalFiber = Math.round(totals.totalFiber * 100) / 100;
  await updatePresetMealById(presetMealId, totals);
};
