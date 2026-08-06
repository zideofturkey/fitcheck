const { BadRequestError } = require("common");

function validateNutritionValues({
  caloriePer100g,
  proteinPer100g,
  carbohydratePer100g,
  fatPer100g,
  sugarPer100g,
  fiberPer100g,
} = {}) {
  const hasCarb = carbohydratePer100g != null;
  const hasSugar = sugarPer100g != null;
  const hasFiber = fiberPer100g != null;
  const hasProtein = proteinPer100g != null;
  const hasFat = fatPer100g != null;
  const hasCalorie = caloriePer100g != null;

  if (hasSugar && hasCarb && sugarPer100g > carbohydratePer100g + 0.01) {
    throw new BadRequestError("errMsg_sugarPer100gCannotExceedCarbohydratePer100g");
  }
  if (hasFiber && hasCarb && fiberPer100g > carbohydratePer100g + 0.01) {
    throw new BadRequestError("errMsg_fiberPer100gCannotExceedCarbohydratePer100g");
  }
  if (hasProtein && hasCarb && hasFat) {
    const macroSum = proteinPer100g + carbohydratePer100g + fatPer100g;
    if (macroSum > 100.01) {
      throw new BadRequestError("errMsg_macroSumPer100gCannotExceed100");
    }
  }
  if (hasCalorie && hasProtein && hasCarb && hasFat) {
    const expectedCalories = 4 * proteinPer100g + 4 * carbohydratePer100g + 9 * fatPer100g;
    const tolerance = Math.max(expectedCalories * 0.1, 5);
    if (Math.abs(caloriePer100g - expectedCalories) > tolerance) {
      throw new BadRequestError("errMsg_caloriePer100gInconsistentWithMacros");
    }
  }
}

module.exports = validateNutritionValues;
