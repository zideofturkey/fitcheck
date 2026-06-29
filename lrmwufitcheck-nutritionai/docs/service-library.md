# Service Library - `nutritionAi`

This document provides a complete reference of the custom code library for the `nutritionAi` service. It includes all library functions, edge functions with their REST endpoints, templates, and assets.

## Library Functions

Library functions are reusable modules available to all business APIs and other custom code within the service via `require("lib/<moduleName>")`.

### `parseMealWithAI.js`

````js
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
  const systemPrompt = `Sen bir T\u00fcrk beslenme uzman\u0131 AI asistan\u0131s\u0131n. Kullan\u0131c\u0131n\u0131n T\u00fcrk\u00e7e yemek a\u00e7\u0131klamas\u0131n\u0131 analiz ederek yap\u0131land\u0131r\u0131lm\u0131\u015f bir JSON nesnesi d\u00f6nd\u00fcrmelisin.\n\nG\u00f6revin:\n1. Yemekteki her bir besin \u00f6\u011fesini tespit et\n2. Gram miktarlar\u0131n\u0131 tahmin et (belirtilmemi\u015fse standart T\u00fcrk porsiyon referanslar\u0131n\u0131 kullan)\n3. Her besin i\u00e7in USDA/T\u00fcrkiye TBDF verilerinden kalori ve makro besin de\u011ferlerini tahmin et\n4. Uygun T\u00fcrk\u00e7e \u00f6\u011f\u00fcn ismini ata (Kahvalt\u0131, \u00d6\u011fle Yeme\u011fi, Ak\u015fam Yeme\u011fi, At\u0131\u015ft\u0131rmal\u0131k)\n5. \u015e\u00fcpheli miktarlar\u0131 tespit et (\u00f6rn. 1000g pilav)\n6. Genel g\u00fcven skoru hesapla (0.0-1.0)\n\nSadece a\u015fa\u011f\u0131daki JSON format\u0131nda yan\u0131t ver, ba\u015fka hi\u00e7bir \u015fey yazma:\n{\n  "detectedLanguage": "tr",\n  "confidenceScore": 0.85,\n  "sessionState": "completed",\n  "warningText": null,\n  "confirmationRequired": false,\n  "proposedMealDate": null,\n  "proposedMealTime": null,\n  "proposedSlotName": "\u00d6\u011fle Yeme\u011fi",\n  "totalCalories": 650.0,\n  "totalProtein": 35.0,\n  "totalCarbohydrates": 80.0,\n  "totalFat": 18.0,\n  "totalSugar": 5.0,\n  "totalFiber": 4.0,\n  "finalResponseText": "\u00d6\u011flenin analiz edildi: 2 k\u00f6fte (120g) ve pilav (150g). Toplam yakla\u015f\u0131k 650 kalori.",\n  "lines": [\n    {\n      "detectedFoodName": "K\u00f6fte",\n      "estimatedGrams": 120.0,\n      "estimatedCalories": 320.0,\n      "estimatedProtein": 24.0,\n      "estimatedCarbohydrates": 12.0,\n      "estimatedFat": 18.0,\n      "estimatedSugar": 1.0,\n      "estimatedFiber": 0.5,\n      "quantityConfidence": 0.8,\n      "nutritionReference": "USDA"\n    }\n  ]\n}`;

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
    result.confidenceScore =
      typeof result.confidenceScore === "number" ? result.confidenceScore : 0.8;

    return result;
  } catch (err) {
    console.error("parseGeminiMealResponse error:", err.message);
    return {
      detectedLanguage: "tr",
      confidenceScore: 0,
      sessionState: "failed",
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
````

### `answerNutritionQuestion.js`

````js
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
````

### `applyLineAdjustments.js`

```js
/**
 * applyLineAdjustments
 * Pure function. Merges per-line adjustments (estimatedGrams, saveAsFood)
 * from the request onto the candidateLines array.
 *
 * @param {Array} candidateLines - Current aiCandidateLine records
 * @param {Array|null} lineAdjustments - Array of { aiCandidateLineId, estimatedGrams, saveAsFood }
 * @returns {Array} Merged line array
 */
module.exports = function applyLineAdjustments(
  candidateLines,
  lineAdjustments,
) {
  if (!candidateLines || !Array.isArray(candidateLines)) return [];
  if (
    !lineAdjustments ||
    !Array.isArray(lineAdjustments) ||
    lineAdjustments.length === 0
  ) {
    return candidateLines;
  }

  const adjustmentMap = {};
  lineAdjustments.forEach((adj) => {
    if (adj.aiCandidateLineId) {
      adjustmentMap[adj.aiCandidateLineId] = adj;
    }
  });

  return candidateLines.map((line) => {
    const adj = adjustmentMap[line.id];
    if (!adj) return { ...line };

    const updated = { ...line };
    if (adj.estimatedGrams !== undefined && adj.estimatedGrams !== null) {
      updated.estimatedGrams = adj.estimatedGrams;
    }
    if (adj.saveAsFood !== undefined && adj.saveAsFood !== null) {
      updated.saveAsFood = adj.saveAsFood;
    }
    return updated;
  });
};
```

### `recalculateMealTotals.js`

```js
/**
 * recalculateMealTotals
 * Pure function. Sums the six nutrition values across all lines.
 *
 * @param {Array} lines - Array of aiCandidateLine objects
 * @returns {Object} { totalCalories, totalProtein, totalCarbohydrates, totalFat, totalSugar, totalFiber }
 */
module.exports = function recalculateMealTotals(lines) {
  if (!lines || !Array.isArray(lines) || lines.length === 0) {
    return {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbohydrates: 0,
      totalFat: 0,
      totalSugar: 0,
      totalFiber: 0,
    };
  }

  return lines.reduce(
    (acc, line) => {
      acc.totalCalories += line.estimatedCalories || 0;
      acc.totalProtein += line.estimatedProtein || 0;
      acc.totalCarbohydrates += line.estimatedCarbohydrates || 0;
      acc.totalFat += line.estimatedFat || 0;
      acc.totalSugar += line.estimatedSugar || 0;
      acc.totalFiber += line.estimatedFiber || 0;
      return acc;
    },
    {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbohydrates: 0,
      totalFat: 0,
      totalSugar: 0,
      totalFiber: 0,
    },
  );
};
```

### `recalculateLineNutrition.js`

```js
/**
 * recalculateLineNutrition
 * Pure function. Scales each of the six nutrition values proportionally
 * from the original gram amount to the new gram amount.
 *
 * @param {Object} line - The aiCandidateLine object with current values
 * @param {number} newGrams - The new gram amount
 * @returns {Object} Updated nutrition fields
 */
module.exports = function recalculateLineNutrition(line, newGrams) {
  if (
    !line ||
    !newGrams ||
    newGrams <= 0 ||
    !line.estimatedGrams ||
    line.estimatedGrams <= 0
  ) {
    return {
      estimatedCalories: line ? line.estimatedCalories : 0,
      estimatedProtein: line ? line.estimatedProtein : 0,
      estimatedCarbohydrates: line ? line.estimatedCarbohydrates : 0,
      estimatedFat: line ? line.estimatedFat : 0,
      estimatedSugar: line ? line.estimatedSugar : 0,
      estimatedFiber: line ? line.estimatedFiber : 0,
    };
  }

  const ratio = newGrams / line.estimatedGrams;
  const round2 = (v) => Math.round((v || 0) * ratio * 100) / 100;

  return {
    estimatedCalories: round2(line.estimatedCalories),
    estimatedProtein: round2(line.estimatedProtein),
    estimatedCarbohydrates: round2(line.estimatedCarbohydrates),
    estimatedFat: round2(line.estimatedFat),
    estimatedSugar: round2(line.estimatedSugar),
    estimatedFiber: round2(line.estimatedFiber),
  };
};
```

### `per100g.js`

```js
/**
 * per100g
 * Pure function. Converts a nutrition value for a specific gram amount
 * back to a per-100g figure.
 *
 * @param {number} nutritionValueForGrams - Nutrition value for the consumed portion
 * @param {number} grams - The gram amount the value was estimated for
 * @returns {number} Per-100g nutrition value, rounded to 2 decimal places
 */
module.exports = function per100g(nutritionValueForGrams, grams) {
  if (
    !grams ||
    grams <= 0 ||
    nutritionValueForGrams === null ||
    nutritionValueForGrams === undefined
  ) {
    return 0;
  }
  return Math.round((nutritionValueForGrams / grams) * 100 * 100) / 100;
};
```

### `callGeminiParseMeal.js`

```js
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
```

### `callGeminiAskNutrition.js`

```js
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
```

---

_This document was generated from the service library configuration and should be kept in sync with design changes._
