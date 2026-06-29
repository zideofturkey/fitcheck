
# Service Library - `nutritionLibrary`

This document provides a complete reference of the custom code library for the `nutritionLibrary` service. It includes all library functions, edge functions with their REST endpoints, templates, and assets.


## Library Functions

Library functions are reusable modules available to all business APIs and other custom code within the service via `require("lib/<moduleName>")`.


### `recalculatePresetTotals.js`

```js
const { getPresetLineListByMQuery, updatePresetMealById } = require('dbLayer');

module.exports = async function recalculatePresetTotals(presetMealId) {
  const lines = await getPresetLineListByMQuery({ presetMealId, isActive: true });
  const totals = {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbohydrates: 0,
    totalFat: 0,
    totalSugar: 0,
    totalFiber: 0
  };
  if (lines && lines.length > 0) {
    for (const line of lines) {
      totals.totalCalories += (line.lineCalories || 0);
      totals.totalProtein += (line.lineProtein || 0);
      totals.totalCarbohydrates += (line.lineCarbohydrates || 0);
      totals.totalFat += (line.lineFat || 0);
      totals.totalSugar += (line.lineSugar || 0);
      totals.totalFiber += (line.lineFiber || 0);
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
```


### `calculateLineNutrition.js`

```js
module.exports = function calculateLineNutrition(caloriePer100g, proteinPer100g, carbohydratePer100g, fatPer100g, sugarPer100g, fiberPer100g, gramAmount) {
  const factor = gramAmount / 100;
  const round2 = (v) => Math.round(v * 100) / 100;
  return {
    lineCalories: round2(caloriePer100g * factor),
    lineProtein: round2(proteinPer100g * factor),
    lineCarbohydrates: round2(carbohydratePer100g * factor),
    lineFat: round2(fatPer100g * factor),
    lineSugar: round2(sugarPer100g * factor),
    lineFiber: round2(fiberPer100g * factor)
  };
};
```














---

*This document was generated from the service library configuration and should be kept in sync with design changes.*
