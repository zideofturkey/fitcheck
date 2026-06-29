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
