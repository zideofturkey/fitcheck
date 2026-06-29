
# Service Library - `nutritionAi`

This document provides a complete reference of the custom code library for the `nutritionAi` service. It includes all library functions, edge functions with their REST endpoints, templates, and assets.


## Library Functions

Library functions are reusable modules available to all business APIs and other custom code within the service via `require("lib/<moduleName>")`.


### `parseMealWithAI.js`

```js
/**
 * parseMealWithAI
 * Invokes OpenAI to parse a Turkish natural-language meal description into
 * structured nutrition data. Returns a safe error structure if the AI call fails.
 *
 * @param {string} inputText - Raw Turkish meal description
 * @param {string|null} proposedDate - Optional date hint (ISO date string)
 * @param {string|null} proposedTime - Optional time hint (HH:MM)
 * @param {string|null} proposedSlotName - Optional meal slot override
 * @returns {Object} Structured parse result
 */
const { OpenAI } = require('openai');

module.exports = async function parseMealWithAI(inputText, proposedDate, proposedTime, proposedSlotName) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const systemPrompt = `Sen bir Türk beslenme uzmanı AI asistanısın. Kullanıcının Türkçe yemek açıklamasını analiz ederek yapılandırılmış bir JSON nesnesi döndürmelisin.

Görevin:
1. Yemekteki her bir besin öğesini tespit et
2. Gram miktarlarını tahmin et (belirtilmemişse standart Türk porsiyon referanslarını kullan)
3. Her besin için USDA/Türkiye TBDF verilerinden kalori ve makro besin değerlerini tahmin et
4. Uygun Türkçe öğün ismini ata (Kahvaltı, Öğle Yemeği, Akşam Yemeği, Atıştırmalık)
5. Şüpheli miktarları tespit et (örn. 1000g pilav)
6. Genel güven skoru hesapla (0.0-1.0)

JSON formatı (kesinlikle bu yapıya uy):
{
  "detectedLanguage": "tr",
  "confidenceScore": 0.85,
  "sessionState": "completed",
  "warningText": null,
  "confirmationRequired": false,
  "proposedMealDate": null,
  "proposedMealTime": null,
  "proposedSlotName": "Öğle Yemeği",
  "totalCalories": 650.0,
  "totalProtein": 35.0,
  "totalCarbohydrates": 80.0,
  "totalFat": 18.0,
  "totalSugar": 5.0,
  "totalFiber": 4.0,
  "finalResponseText": "Öğlenin analiz edildi: 2 köfte (120g) ve pilav (150g). Toplam yaklaşık 650 kalori.",
  "lines": [
    {
      "detectedFoodName": "Köfte",
      "estimatedGrams": 120.0,
      "estimatedCalories": 320.0,
      "estimatedProtein": 24.0,
      "estimatedCarbohydrates": 12.0,
      "estimatedFat": 18.0,
      "estimatedSugar": 1.0,
      "estimatedFiber": 0.5,
      "quantityConfidence": 0.8,
      "nutritionReference": "USDA"
    }
  ]
}`;

  const userMessage = `Yemek açıklaması: ${inputText}${proposedDate ? `\nTarih ipucu: ${proposedDate}` : ''}${proposedTime ? `\nSaat ipucu: ${proposedTime}` : ''}${proposedSlotName ? `\nÖğün ipucu: ${proposedSlotName}` : ''}`;

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 2000
    });

    const result = JSON.parse(completion.choices[0].message.content);

    // Override with user-supplied hints if provided
    if (proposedDate) result.proposedMealDate = proposedDate;
    if (proposedTime) result.proposedMealTime = proposedTime;
    if (proposedSlotName) result.proposedSlotName = proposedSlotName;

    // Ensure required fields have defaults
    result.sessionState = result.confirmationRequired ? 'needsConfirmation' : 'completed';
    result.lines = result.lines || [];

    return result;
  } catch (err) {
    console.error('parseMealWithAI error:', err.message);
    return {
      detectedLanguage: 'tr',
      confidenceScore: 0,
      sessionState: 'failed',
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
      finalResponseText: 'Üzgünüm, yemek analizinde bir hata oluştu. Lütfen tekrar deneyin.',
      lines: []
    };
  }
};
```


### `answerNutritionQuestion.js`

```js
/**
 * answerNutritionQuestion
 * Invokes OpenAI to answer a Turkish nutrition question using user's macro
 * targets and meal context as grounding data.
 *
 * @param {string} inputText - Natural-language question in Turkish
 * @param {Object|null} macroTargets - User's current macro targets
 * @param {Object|null} nutritionContext - User's meal summary for the context range
 * @param {string} contextRange - 'today' | 'week' | 'month'
 * @returns {Object} Structured guidance result
 */
const { OpenAI } = require('openai');

module.exports = async function answerNutritionQuestion(inputText, macroTargets, nutritionContext, contextRange) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const contextRangeLabel = contextRange === 'week' ? 'bu hafta' : contextRange === 'month' ? 'bu ay' : 'bugün';

  const macroSummary = macroTargets
    ? `Günlük hedefler: Kalori: ${macroTargets.targetCalories || 'belirsiz'} kcal, Protein: ${macroTargets.targetProtein || 'belirsiz'}g, Karbonhidrat: ${macroTargets.targetCarbohydrates || 'belirsiz'}g, Yağ: ${macroTargets.targetFat || 'belirsiz'}g`
    : 'Kullanıcı henüz makro hedef belirlememiş.';

  const nutritionSummary = nutritionContext
    ? `${contextRangeLabel.charAt(0).toUpperCase() + contextRangeLabel.slice(1)} tüketim: Kalori: ${nutritionContext.totalCalories || 0} kcal, Protein: ${nutritionContext.totalProtein || 0}g, Karbonhidrat: ${nutritionContext.totalCarbohydrates || 0}g, Yağ: ${nutritionContext.totalFat || 0}g`
    : `${contextRangeLabel.charAt(0).toUpperCase() + contextRangeLabel.slice(1)} için kayıtlı öğün verisi yok.`;

  const systemPrompt = `Sen bir kişiselleştirilmiş beslenme danışmanı AI asistanısın. Kullanıcının sorusunu Türkçe olarak yanıtlamalısın.

Kullanıcı verileri:
${macroSummary}
${nutritionSummary}

Soru türleri:
- targetCheck: Hedef aşıldı mı? (kalori, protein, yağ, karbonhidrat)
- intakeSummary: Ne kadar tükettim?
- healthiestOption: En sağlıklı seçenek hangisi?

JSON formatı (kesinlikle bu yapıya uy):
{
  "questionType": "targetCheck",
  "contextRange": "today",
  "answerSummary": "Bugün yağ limitinizi aşmadınız. 45g yağ tükettiniz, hedefiniz 65g.",
  "rationaleText": "Günlük yağ hedefinizin %69'ını tükettiniz.",
  "referencedMetricKeys": "fat,targetFat",
  "cautionText": null,
  "finalResponseText": "Bugün yağ limitinizi aşmadınız! 45g/65g hedeflediğinizin %69'ı. Devam edin!",
  "confidenceScore": 0.95
}`;

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: inputText }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
      max_tokens: 1000
    });

    const result = JSON.parse(completion.choices[0].message.content);
    result.contextRange = contextRange || 'today';
    return result;
  } catch (err) {
    console.error('answerNutritionQuestion error:', err.message);
    return {
      questionType: 'unknown',
      contextRange: contextRange || 'today',
      answerSummary: 'Sorunuzu yanıtlayamadım.',
      rationaleText: null,
      referencedMetricKeys: null,
      cautionText: null,
      finalResponseText: 'Üzgünüm, beslenme sorunuzu yanıtlayamadım. Lütfen tekrar deneyin.',
      confidenceScore: 0
    };
  }
};
```


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
module.exports = function applyLineAdjustments(candidateLines, lineAdjustments) {
  if (!candidateLines || !Array.isArray(candidateLines)) return [];
  if (!lineAdjustments || !Array.isArray(lineAdjustments) || lineAdjustments.length === 0) {
    return candidateLines;
  }

  const adjustmentMap = {};
  lineAdjustments.forEach(adj => {
    if (adj.aiCandidateLineId) {
      adjustmentMap[adj.aiCandidateLineId] = adj;
    }
  });

  return candidateLines.map(line => {
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
    return { totalCalories: 0, totalProtein: 0, totalCarbohydrates: 0, totalFat: 0, totalSugar: 0, totalFiber: 0 };
  }

  return lines.reduce((acc, line) => {
    acc.totalCalories += line.estimatedCalories || 0;
    acc.totalProtein += line.estimatedProtein || 0;
    acc.totalCarbohydrates += line.estimatedCarbohydrates || 0;
    acc.totalFat += line.estimatedFat || 0;
    acc.totalSugar += line.estimatedSugar || 0;
    acc.totalFiber += line.estimatedFiber || 0;
    return acc;
  }, { totalCalories: 0, totalProtein: 0, totalCarbohydrates: 0, totalFat: 0, totalSugar: 0, totalFiber: 0 });
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
  if (!line || !newGrams || newGrams <= 0 || !line.estimatedGrams || line.estimatedGrams <= 0) {
    return {
      estimatedCalories: line ? line.estimatedCalories : 0,
      estimatedProtein: line ? line.estimatedProtein : 0,
      estimatedCarbohydrates: line ? line.estimatedCarbohydrates : 0,
      estimatedFat: line ? line.estimatedFat : 0,
      estimatedSugar: line ? line.estimatedSugar : 0,
      estimatedFiber: line ? line.estimatedFiber : 0
    };
  }

  const ratio = newGrams / line.estimatedGrams;
  const round2 = v => Math.round((v || 0) * ratio * 100) / 100;

  return {
    estimatedCalories: round2(line.estimatedCalories),
    estimatedProtein: round2(line.estimatedProtein),
    estimatedCarbohydrates: round2(line.estimatedCarbohydrates),
    estimatedFat: round2(line.estimatedFat),
    estimatedSugar: round2(line.estimatedSugar),
    estimatedFiber: round2(line.estimatedFiber)
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
  if (!grams || grams <= 0 || nutritionValueForGrams === null || nutritionValueForGrams === undefined) {
    return 0;
  }
  return Math.round((nutritionValueForGrams / grams) * 100 * 100) / 100;
};
```














---

*This document was generated from the service library configuration and should be kept in sync with design changes.*
