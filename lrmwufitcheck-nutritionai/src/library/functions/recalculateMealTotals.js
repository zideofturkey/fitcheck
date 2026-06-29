/**
 * recalculateMealTotals
 * Pure function. Sums the six nutrition values across all lines.
 *
 * @param {Array} lines - Array of aiCandidateLine objects
 * @returns {Object} { totalCalories, totalProtein, totalCarbohydrates, totalFat, totalSugar, totalFiber }
 */
module.exports = function recalculateMealTotals(lines) {
  if (!lines || !Array.isArray(lines) || lines.length === 0) {
    return {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbohydrates: 0,
      totalFat: 0,
      totalSugar: 0,
      totalFiber: 0,
    };
  }

  return lines.reduce(
    (acc, line) => {
      acc.totalCalories += line.estimatedCalories || 0;
      acc.totalProtein += line.estimatedProtein || 0;
      acc.totalCarbohydrates += line.estimatedCarbohydrates || 0;
      acc.totalFat += line.estimatedFat || 0;
      acc.totalSugar += line.estimatedSugar || 0;
      acc.totalFiber += line.estimatedFiber || 0;
      return acc;
    },
    {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbohydrates: 0,
      totalFat: 0,
      totalSugar: 0,
      totalFiber: 0,
    },
  );
};
