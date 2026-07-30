/**
 * parseMealWithAI
 * Primary export: parseGeminiMealResponse — parses raw Gemini text into structured nutrition JSON.
 * Also exposes buildFullPromptText as a named sub-function for use in IntegrationAction prompts.
 *
 * Usage from IntegrationAction parameter:
 *   LIB.parseMealWithAI.buildFullPromptText(this.inputText, ...)
 *
 * Usage from FunctionCallAction to parse the Gemini response:
 *   LIB.parseMealWithAI(rawText, proposedDate, proposedTime, proposedSlotName)
 *
 * @param {string} rawText - Raw text response from Gemini
 * @param {string|null} proposedDate
 * @param {string|null} proposedTime
 * @param {string|null} proposedSlotName
 * @returns {Object} Structured parse result
 */

function buildFullPromptText(
  inputText,
  proposedDate,
  proposedTime,
  proposedSlotName,
) {
  const systemPrompt = `Sen bir T\u00fcrk beslenme uzman\u0131 AI asistan\u0131s\u0131n. Kullan\u0131c\u0131n\u0131n T\u00fcrk\u00e7e yemek a\u00e7\u0131klamas\u0131n\u0131 analiz ederek yap\u0131land\u0131r\u0131lm\u0131\u015f bir JSON nesnesi d\u00f6nd\u00fcrmelisin.\n\nG\u00f6revin:\n1. Yemekteki her bir besin \u00f6\u011fesini tespit et\n2. Gram miktarlar\u0131n\u0131 tahmin et (belirtilmemi\u015fse standart T\u00fcrk porsiyon referanslar\u0131n\u0131 kullan)\n3. Her besin i\u00e7in USDA/T\u00fcrkiye TBDF verilerinden kalori ve makro besin de\u011ferlerini tahmin et\n4. Uygun T\u00fcrk\u00e7e \u00f6\u011f\u00fcn ismini ata (Kahvalt\u0131, \u00d6\u011fle Yeme\u011fi, Ak\u015fam Yeme\u011fi, At\u0131\u015ft\u0131rmal\u0131k)\n5. Bu spesifik \u00f6\u011f\u00fcn i\u00e7in k\u0131sa (2-4 kelime), ak\u0131lda kal\u0131c\u0131 ve ay\u0131rt edici bir T\u00fcrk\u00e7e ba\u015fl\u0131k \u00fcret (\u00f6rn. \"Yumurtal\u0131 & Sucuklu Tost\", \"Tavuklu Pilav Kasesi\") - bu, kullan\u0131c\u0131n\u0131n ge\u00e7mi\u015f oturumlar\u0131n\u0131 birbirinden ay\u0131rt etmesi i\u00e7in kullan\u0131lacak\n6. \u015e\u00fcpheli miktarlar\u0131 tespit et (\u00f6rn. 1000g pilav)\n7. Genel g\u00fcven skoru hesapla (0.0-1.0)\n\nSadece a\u015fa\u011f\u0131daki JSON format\u0131nda yan\u0131t ver, ba\u015fka hi\u00e7bir \u015fey yazma:\n{\n  "detectedLanguage": "tr",\n  "confidenceScore": 0.85,\n  "sessionState": "completed",\n  "sessionName": "K\u00f6fteli Pilav",\n  "warningText": null,\n  "confirmationRequired": false,\n  "proposedMealDate": null,\n  "proposedMealTime": null,\n  "proposedSlotName": "\u00d6\u011fle Yeme\u011fi",\n  "totalCalories": 650.0,\n  "totalProtein": 35.0,\n  "totalCarbohydrates": 80.0,\n  "totalFat": 18.0,\n  "totalSugar": 5.0,\n  "totalFiber": 4.0,\n  "finalResponseText": "\u00d6\u011flenin analiz edildi: 2 k\u00f6fte (120g) ve pilav (150g). Toplam yakla\u015f\u0131k 650 kalori.",\n  "lines": [\n    {\n      "detectedFoodName": "K\u00f6fte",\n      "estimatedGrams": 120.0,\n      "estimatedCalories": 320.0,\n      "estimatedProtein": 24.0,\n      "estimatedCarbohydrates": 12.0,\n      "estimatedFat": 18.0,\n      "estimatedSugar": 1.0,\n      "estimatedFiber": 0.5,\n      "quantityConfidence": 0.8,\n      "nutritionReference": "USDA"\n    }\n  ]\n}`;

  const userMessage = `Yemek a\u00e7\u0131klamas\u0131: ${inputText}${proposedDate ? `\nTarih ipucu: ${proposedDate}` : ""}${proposedTime ? `\nSaat ipucu: ${proposedTime}` : ""}${proposedSlotName ? `\n\u00d6\u011f\u00fcn ipucu: ${proposedSlotName}` : ""}`;

  return `${systemPrompt}\n\nKullan\u0131c\u0131 giri\u015fi:\n${userMessage}`;
}

function parseGeminiMealResponse(
  rawText,
  proposedDate,
  proposedTime,
  proposedSlotName,
) {
  try {
    let jsonText = rawText;
    if (!rawText) throw new Error("Empty response from Gemini");

    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    } else {
      const objMatch = rawText.match(/\{[\s\S]*\}/);
      if (objMatch) jsonText = objMatch[0];
    }

    const result = JSON.parse(jsonText);

    if (proposedDate) result.proposedMealDate = proposedDate;
    if (proposedTime) result.proposedMealTime = proposedTime;
    if (proposedSlotName) result.proposedSlotName = proposedSlotName;

    result.sessionState = result.confirmationRequired
      ? "needsConfirmation"
      : "completed";
    result.lines = result.lines || [];
    result.detectedLanguage = result.detectedLanguage || "tr";
    result.sessionName = result.sessionName || null;
    result.confidenceScore =
      typeof result.confidenceScore === "number" ? result.confidenceScore : 0.8;

    return result;
  } catch (err) {
    console.error("parseGeminiMealResponse error:", err.message);
    return {
      detectedLanguage: "tr",
      confidenceScore: 0,
      sessionState: "failed",
      sessionName: null,
      warningText: null,
      confirmationRequired: false,
      proposedMealDate: proposedDate || null,
      proposedMealTime: proposedTime || null,
      proposedSlotName: proposedSlotName || null,
      totalCalories: 0,
      totalProtein: 0,
      totalCarbohydrates: 0,
      totalFat: 0,
      totalSugar: 0,
      totalFiber: 0,
      finalResponseText:
        "\u00dczg\u00fcn\u00fcm, yemek analizinde bir hata olu\u015ftu. L\u00fctfen tekrar deneyin.",
      lines: [],
    };
  }
}

// Primary export is the parser function (satisfies module.exports = function requirement)
// Helper for building the Gemini prompt is attached as a property
module.exports = parseGeminiMealResponse;
module.exports.buildFullPromptText = buildFullPromptText;
module.exports.parseGeminiMealResponse = parseGeminiMealResponse;
