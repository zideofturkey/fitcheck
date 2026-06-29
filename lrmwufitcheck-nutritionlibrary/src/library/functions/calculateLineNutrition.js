module.exports = function calculateLineNutrition(
  caloriePer100g,
  proteinPer100g,
  carbohydratePer100g,
  fatPer100g,
  sugarPer100g,
  fiberPer100g,
  gramAmount,
) {
  const factor = gramAmount / 100;
  const round2 = (v) => Math.round(v * 100) / 100;
  return {
    lineCalories: round2(caloriePer100g * factor),
    lineProtein: round2(proteinPer100g * factor),
    lineCarbohydrates: round2(carbohydratePer100g * factor),
    lineFat: round2(fatPer100g * factor),
    lineSugar: round2(sugarPer100g * factor),
    lineFiber: round2(fiberPer100g * factor),
  };
};
