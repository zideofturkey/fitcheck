export interface NutritionValues {
  caloriePer100g: number;
  proteinPer100g: number;
  carbohydratePer100g: number;
  fatPer100g: number;
  sugarPer100g: number;
  fiberPer100g: number;
}

/**
 * Shared cross-field sanity checks for per-100g nutrition values - the same
 * 4 rules enforced server-side in nutritionlibrary's validateNutritionValues.js,
 * kept here so every entry form (Food Library create/edit, ManualNutritionForm's
 * manual/direct tabs) can reject an impossible record before it ever reaches
 * the API, with a clear Turkish message instead of a raw errMsg_ code.
 */
export function validateNutritionValues(values: NutritionValues): string[] {
  const {
    caloriePer100g,
    proteinPer100g,
    carbohydratePer100g,
    fatPer100g,
    sugarPer100g,
    fiberPer100g,
  } = values;
  const errors: string[] = [];

  if (sugarPer100g > carbohydratePer100g + 0.01) {
    errors.push("Şeker miktarı karbonhidrat miktarını aşamaz.");
  }

  if (fiberPer100g > carbohydratePer100g + 0.01) {
    errors.push("Lif miktarı karbonhidrat miktarını aşamaz.");
  }

  const macroSum = proteinPer100g + carbohydratePer100g + fatPer100g;
  if (macroSum > 100.01) {
    errors.push(
      `Protein + karbonhidrat + yağ toplamı 100g'ı aşamaz (şu an ${macroSum.toFixed(1)}g, 100g bazında).`,
    );
  }

  const expectedCalories =
    4 * proteinPer100g + 4 * carbohydratePer100g + 9 * fatPer100g;
  const tolerance = Math.max(expectedCalories * 0.1, 5);
  if (Math.abs(caloriePer100g - expectedCalories) > tolerance) {
    errors.push(
      `Kalori değeri makrolarla tutarsız - girilen protein/karbonhidrat/yağ değerlerine göre yaklaşık ${Math.round(expectedCalories)} kcal beklenir.`,
    );
  }

  return errors;
}
