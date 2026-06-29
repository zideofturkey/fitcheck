const {
  candidateMealReAiSessionHistory,
} = require("aggregates/aiSessionHistory.aggregate");
const _ = require("lodash");

module.exports = {
  topic: "elastic-index-lrmwufitcheck_aicandidatemeal-deleted",
  handle: async (event) => {
    const referenceValue = _.get(event, "id");
    await candidateMealReAiSessionHistory(referenceValue);
    console.log("elastic-index-lrmwufitcheck_aicandidatemeal-deleted:", event);
  },
};
