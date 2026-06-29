/**
 * callGeminiParseMeal
 * NOTE: This library function is no longer used for the Gemini API call.
 * The googleGemini integration is now declared as an IntegrationAction named
 * `callGeminiParseMeal` directly on the parseMeal Business API, which is the
 * correct Mindbricks pattern for wiring AI integrations.
 *
 * The prompt is built using LIB.parseMealWithAI.buildFullPromptText(...)
 * directly in the IntegrationAction's `prompt` parameter.
 *
 * @deprecated Use the IntegrationAction on parseMeal instead.
 */
module.exports = async function callGeminiParseMeal(prompt) {
  throw new Error(
    "callGeminiParseMeal library function is deprecated. Use the googleGemini IntegrationAction declared on the parseMeal Business API.",
  );
};
