const {
  aiCandidateMealWithLinesAggregateData,
} = require("aggregates/aiCandidateMealWithLines.aggregate");
const _ = require("lodash");

module.exports = {
  topic: "elastic-index-lrmwufitcheck_aicandidatemeal-updated",
  handle: async (event) => {
    const referenceValue = _.get(event, "id");
    await aiCandidateMealWithLinesAggregateData(referenceValue);
    console.log("elastic-index-lrmwufitcheck_aicandidatemeal-updated:", event);
  },
};
