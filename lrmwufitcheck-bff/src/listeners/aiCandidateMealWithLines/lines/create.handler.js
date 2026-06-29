const {
  linesReAiCandidateMealWithLines,
} = require("aggregates/aiCandidateMealWithLines.aggregate");
const _ = require("lodash");

module.exports = {
  topic: "elastic-index-lrmwufitcheck_aicandidateline-created",
  handle: async (event) => {
    const referenceValue = _.get(event, "id");
    await linesReAiCandidateMealWithLines(referenceValue);
    console.log("elastic-index-lrmwufitcheck_aicandidateline-created:", event);
  },
};
