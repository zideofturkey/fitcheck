/**
 * applyLineAdjustments
 * Pure function. Merges per-line adjustments (estimatedGrams, saveAsFood,
 * and optionally the six macro fields) from the request onto the
 * candidateLines array.
 *
 * The frontend is the source of truth for proportional gram->macro
 * scaling (it knows about user-overridden macro densities), so when it
 * sends explicit macro values alongside a gram change we just use them
 * directly rather than re-deriving a ratio here. If the macro fields are
 * omitted (older client, or no gram change), we fall back to scaling the
 * line's original per-gram density by the new gram amount so totals never
 * silently go stale.
 *
 * @param {Array} candidateLines - Current aiCandidateLine records
 * @param {Array|null} lineAdjustments - Array of { aiCandidateLineId, estimatedGrams, saveAsFood, estimatedCalories?, estimatedProtein?, estimatedCarbohydrates?, estimatedFat?, estimatedSugar?, estimatedFiber? }
 * @returns {Array} Merged line array
 */
const MACRO_FIELDS = [
  "estimatedCalories",
  "estimatedProtein",
  "estimatedCarbohydrates",
  "estimatedFat",
  "estimatedSugar",
  "estimatedFiber",
];

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
    const gramsChanged =
      adj.estimatedGrams !== undefined &&
      adj.estimatedGrams !== null &&
      adj.estimatedGrams !== line.estimatedGrams;
    const originalGrams = line.estimatedGrams || 0;

    if (adj.estimatedGrams !== undefined && adj.estimatedGrams !== null) {
      updated.estimatedGrams = adj.estimatedGrams;
    }
    if (adj.saveAsFood !== undefined && adj.saveAsFood !== null) {
      updated.saveAsFood = adj.saveAsFood;
    }

    const hasExplicitMacros = MACRO_FIELDS.some(
      (field) => adj[field] !== undefined && adj[field] !== null,
    );

    if (hasExplicitMacros) {
      // Client sent final absolute values (already scaled/edited) - use
      // them directly.
      MACRO_FIELDS.forEach((field) => {
        if (adj[field] !== undefined && adj[field] !== null) {
          updated[field] = adj[field];
        }
      });
    } else if (gramsChanged && originalGrams > 0) {
      // No explicit macros from the client - scale the original per-gram
      // density by the new gram amount so calories/macros stay accurate.
      const ratio = updated.estimatedGrams / originalGrams;
      MACRO_FIELDS.forEach((field) => {
        updated[field] = (line[field] || 0) * ratio;
      });
    }

    return updated;
  });
};
