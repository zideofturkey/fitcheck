/**
 * callGeminiAskNutrition
 * NOTE: This library function is no longer used for the Gemini API call.
 * The googleGemini integration is now declared as an IntegrationAction named
 * `callGeminiAskNutrition` directly on the askNutritionQuestion Business API,
 * which is the correct Mindbricks pattern for wiring AI integrations.
 *
 * The prompt is built using LIB.answerNutritionQuestion.buildGuidancePromptText(...)
 * directly in the IntegrationAction's `prompt` parameter.
 *
 * @deprecated Use the IntegrationAction on askNutritionQuestion instead.
 */
module.exports = async function callGeminiAskNutrition(prompt) {
  throw new Error(
    "callGeminiAskNutrition library function is deprecated. Use the googleGemini IntegrationAction declared on the askNutritionQuestion Business API.",
  );
};
