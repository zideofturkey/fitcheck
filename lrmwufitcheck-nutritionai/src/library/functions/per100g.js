/**
 * per100g
 * Pure function. Converts a nutrition value for a specific gram amount
 * back to a per-100g figure.
 *
 * @param {number} nutritionValueForGrams - Nutrition value for the consumed portion
 * @param {number} grams - The gram amount the value was estimated for
 * @returns {number} Per-100g nutrition value, rounded to 2 decimal places
 */
module.exports = function per100g(nutritionValueForGrams, grams) {
  if (
    !grams ||
    grams <= 0 ||
    nutritionValueForGrams === null ||
    nutritionValueForGrams === undefined
  ) {
    return 0;
  }
  return Math.round((nutritionValueForGrams / grams) * 100 * 100) / 100;
};
