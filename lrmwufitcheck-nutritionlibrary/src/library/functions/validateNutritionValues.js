const { BadRequestError } = require("common");

// Shared cross-field sanity checks for per-100g nutrition values, used by
// every entry point that accepts caloriePer100g/proteinPer100g/etc (foodItem
// create/update, dishLine/presetLine manual entries) so an impossible record
// (e.g. 900g sugar per 100g of food) can't be saved regardless of which API
// path it comes in through. Only checks the rules a given call actually has
// enough fields to evaluate - callers with a partial patch (e.g. update)
// should merge in the existing record's values first so the full set is
// available here.
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
    throw new BadRequestError(
      "errMsg_sugarPer100gCannotExceedCarbohydratePer100g",
    );
  }

  if (hasFiber && hasCarb && fiberPer100g > carbohydratePer100g + 0.01) {
    throw new BadRequestError(
      "errMsg_fiberPer100gCannotExceedCarbohydratePer100g",
    );
  }

  if (hasProtein && hasCarb && hasFat) {
    const macroSum = proteinPer100g + carbohydratePer100g + fatPer100g;
    if (macroSum > 100.01) {
      throw new BadRequestError("errMsg_macroSumPer100gCannotExceed100");
    }
  }

  if (hasCalorie && hasProtein && hasCarb && hasFat) {
    const expectedCalories =
      4 * proteinPer100g + 4 * carbohydratePer100g + 9 * fatPer100g;
    // Deliberately looser than the frontend's 25% soft-warning band: the
    // UI already nudges the user and offers an explicit "devam et"
    // override, so the backend only rejects wildly inconsistent values.
    const tolerance = Math.max(expectedCalories * 0.5, 20);
    if (Math.abs(caloriePer100g - expectedCalories) > tolerance) {
      throw new BadRequestError(
        "errMsg_caloriePer100gInconsistentWithMacros",
      );
    }
  }
}

module.exports = validateNutritionValues;
