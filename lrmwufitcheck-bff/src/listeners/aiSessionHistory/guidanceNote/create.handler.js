const {
  guidanceNoteReAiSessionHistory,
} = require("aggregates/aiSessionHistory.aggregate");
const _ = require("lodash");

module.exports = {
  topic: "elastic-index-lrmwufitcheck_aiguidancenote-created",
  handle: async (event) => {
    const referenceValue = _.get(event, "id");
    await guidanceNoteReAiSessionHistory(referenceValue);
    console.log("elastic-index-lrmwufitcheck_aiguidancenote-created:", event);
  },
};
