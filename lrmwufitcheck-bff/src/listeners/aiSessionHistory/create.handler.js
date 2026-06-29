const {
  aiSessionHistoryAggregateData,
} = require("aggregates/aiSessionHistory.aggregate");
const _ = require("lodash");

module.exports = {
  topic: "elastic-index-lrmwufitcheck_aisession-created",
  handle: async (event) => {
    const referenceValue = _.get(event, "id");
    await aiSessionHistoryAggregateData(referenceValue);
    console.log("elastic-index-lrmwufitcheck_aisession-created:", event);
  },
};
