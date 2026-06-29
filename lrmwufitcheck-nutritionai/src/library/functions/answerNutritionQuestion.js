/**
 * answerNutritionQuestion
 * Primary export: parseGeminiGuidanceResponse — parses raw Gemini text into structured guidance JSON.
 * Also exposes buildGuidancePromptText as a named sub-function for use in IntegrationAction prompts.
 *
 * Usage from IntegrationAction parameter:
 *   LIB.answerNutritionQuestion.buildGuidancePromptText(this.inputText, this.macroTargets, this.nutritionContext, this.contextRange || 'today')
 *
 * Usage from FunctionCallAction to parse the Gemini response:
 *   LIB.answerNutritionQuestion(rawText, contextRange)
 *
 * @param {string} rawText - Raw text response from Gemini
 * @param {string} contextRange - 'today' | 'week' | 'month'
 * @returns {Object} Structured guidance result
 */

function buildGuidancePromptText(
  inputText,
  macroTargets,
  nutritionContext,
  contextRange,
) {
  const contextRangeLabel =
    contextRange === "week"
      ? "bu hafta"
      : contextRange === "month"
        ? "bu ay"
        : "bug\u00fcn";

  const macroSummary = macroTargets
    ? `G\u00fcnl\u00fck hedefler: Kalori: ${macroTargets.targetCalories || "belirsiz"} kcal, Protein: ${macroTargets.targetProtein || "belirsiz"}g, Karbonhidrat: ${macroTargets.targetCarbohydrates || "belirsiz"}g, Ya\u011f: ${macroTargets.targetFat || "belirsiz"}g`
    : "Kullan\u0131c\u0131 hen\u00fcz makro hedef belirlememi\u015f.";

  const nutritionSummary = nutritionContext
    ? `${contextRangeLabel.charAt(0).toUpperCase() + contextRangeLabel.slice(1)} t\u00fcketim: Kalori: ${nutritionContext.totalCalories || 0} kcal, Protein: ${nutritionContext.totalProtein || 0}g, Karbonhidrat: ${nutritionContext.totalCarbohydrates || 0}g, Ya\u011f: ${nutritionContext.totalFat || 0}g`
    : `${contextRangeLabel.charAt(0).toUpperCase() + contextRangeLabel.slice(1)} i\u00e7in kay\u0131tl\u0131 \u00f6\u011f\u00fcn verisi yok.`;

  const systemPrompt = `Sen bir ki\u015fiselle\u015ftirilmi\u015f beslenme dan\u0131\u015fman\u0131 AI asistan\u0131s\u0131n. Kullan\u0131c\u0131n\u0131n sorusunu T\u00fcrk\u00e7e olarak yan\u0131tlamal\u0131s\u0131n.\n\nKullan\u0131c\u0131 verileri:\n${macroSummary}\n${nutritionSummary}\n\nSoru t\u00fcrleri:\n- targetCheck: Hedef a\u015f\u0131ld\u0131 m\u0131? (kalori, protein, ya\u011f, karbonhidrat)\n- intakeSummary: Ne kadar t\u00fckettim?\n- healthiestOption: En sa\u011fl\u0131kl\u0131 se\u00e7enek hangisi?\n\nSadece a\u015fa\u011f\u0131daki JSON format\u0131nda yan\u0131t ver, ba\u015fka hi\u00e7bir \u015fey yazma:\n{\n  "questionType": "targetCheck",\n  "contextRange": "today",\n  "answerSummary": "Bug\u00fcn ya\u011f limitinizi a\u015fmad\u0131n\u0131z. 45g ya\u011f t\u00fckettiniz, hedefiniz 65g.",\n  "rationaleText": "G\u00fcnl\u00fck ya\u011f hedefinizin %69'\u0131n\u0131 t\u00fckettiniz.",\n  "referencedMetricKeys": "fat,targetFat",\n  "cautionText": null,\n  "finalResponseText": "Bug\u00fcn ya\u011f limitinizi a\u015fmad\u0131n\u0131z! 45g/65g hedefledi\u011finizin %69'\u0131. Devam edin!",\n  "confidenceScore": 0.95\n}`;

  return `${systemPrompt}\n\nKullan\u0131c\u0131 sorusu: ${inputText}`;
}

function parseGeminiGuidanceResponse(rawText, contextRange) {
  try {
    if (!rawText) throw new Error("Empty response from Gemini");

    let jsonText = rawText;
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    } else {
      const objMatch = rawText.match(/\{[\s\S]*\}/);
      if (objMatch) jsonText = objMatch[0];
    }

    const result = JSON.parse(jsonText);
    result.contextRange = contextRange || "today";
    result.confidenceScore =
      typeof result.confidenceScore === "number" ? result.confidenceScore : 0.8;
    return result;
  } catch (err) {
    console.error("parseGeminiGuidanceResponse error:", err.message);
    return {
      questionType: "unknown",
      contextRange: contextRange || "today",
      answerSummary: "Sorunuzu yan\u0131tlayamad\u0131m.",
      rationaleText: null,
      referencedMetricKeys: null,
      cautionText: null,
      finalResponseText:
        "\u00dczg\u00fcn\u00fcm, beslenme sorunuzu yan\u0131tlayamad\u0131m. L\u00fctfen tekrar deneyin.",
      confidenceScore: 0,
    };
  }
}

// Primary export is the parser function (satisfies module.exports = function requirement)
// Prompt builder attached as a property for use in IntegrationAction parameterValues
module.exports = parseGeminiGuidanceResponse;
module.exports.buildGuidancePromptText = buildGuidancePromptText;
module.exports.parseGeminiGuidanceResponse = parseGeminiGuidanceResponse;
