const {
  sessionReAiCandidateMealWithLines,
} = require("aggregates/aiCandidateMealWithLines.aggregate");
const _ = require("lodash");

module.exports = {
  topic: "elastic-index-lrmwufitcheck_aisession-created",
  handle: async (event) => {
    const referenceValue = _.get(event, "id");
    await sessionReAiCandidateMealWithLines(referenceValue);
    console.log("elastic-index-lrmwufitcheck_aisession-created:", event);
  },
};
