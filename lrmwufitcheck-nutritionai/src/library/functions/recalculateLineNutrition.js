/**
 * recalculateLineNutrition
 * Pure function. Scales each of the six nutrition values proportionally
 * from the original gram amount to the new gram amount.
 *
 * @param {Object} line - The aiCandidateLine object with current values
 * @param {number} newGrams - The new gram amount
 * @returns {Object} Updated nutrition fields
 */
module.exports = function recalculateLineNutrition(line, newGrams) {
  if (
    !line ||
    !newGrams ||
    newGrams <= 0 ||
    !line.estimatedGrams ||
    line.estimatedGrams <= 0
  ) {
    return {
      estimatedCalories: line ? line.estimatedCalories : 0,
      estimatedProtein: line ? line.estimatedProtein : 0,
      estimatedCarbohydrates: line ? line.estimatedCarbohydrates : 0,
      estimatedFat: line ? line.estimatedFat : 0,
      estimatedSugar: line ? line.estimatedSugar : 0,
      estimatedFiber: line ? line.estimatedFiber : 0,
    };
  }

  const ratio = newGrams / line.estimatedGrams;
  const round2 = (v) => Math.round((v || 0) * ratio * 100) / 100;

  return {
    estimatedCalories: round2(line.estimatedCalories),
    estimatedProtein: round2(line.estimatedProtein),
    estimatedCarbohydrates: round2(line.estimatedCarbohydrates),
    estimatedFat: round2(line.estimatedFat),
    estimatedSugar: round2(line.estimatedSugar),
    estimatedFiber: round2(line.estimatedFiber),
  };
};
