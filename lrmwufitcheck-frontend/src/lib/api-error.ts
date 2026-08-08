// The backend's shared validateNutritionValues.js throws these errMsg_ codes
// when a manual-entry submission (including the "Anlıyorum, bu değerlerle
// devam et" override, which only bypasses the frontend's *softer* warning
// threshold) is still too inconsistent for the backend's own, looser check.
// Map them to the same Turkish copy the frontend's own pre-submit validator
// uses so a rejected override doesn't just silently do nothing.
const KNOWN_ERROR_MESSAGES: Record<string, string> = {
  errMsg_sugarPer100gCannotExceedCarbohydratePer100g:
    "Şeker miktarı karbonhidrat miktarını aşamaz.",
  errMsg_fiberPer100gCannotExceedCarbohydratePer100g:
    "Lif miktarı karbonhidrat miktarını aşamaz.",
  errMsg_macroSumPer100gCannotExceed100:
    "Protein + karbonhidrat + yağ toplamı 100g'ı aşamaz.",
  errMsg_caloriePer100gInconsistentWithMacros:
    "Kalori değeri girilen makro değerleriyle çok tutarsız görünüyor, lütfen değerleri kontrol edin.",
};

export function extractApiErrorMessage(err: unknown, fallback: string): string {
  const message = (err as { message?: string } | undefined)?.message;
  if (!message) return fallback;
  if (KNOWN_ERROR_MESSAGES[message]) return KNOWN_ERROR_MESSAGES[message];
  return message.startsWith("errMsg_") ? fallback : message;
}
