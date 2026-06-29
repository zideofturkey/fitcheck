const {
  mealLogWithLinesAggregateData,
} = require("aggregates/mealLogWithLines.aggregate");
const _ = require("lodash");

module.exports = {
  topic: "elastic-index-lrmwufitcheck_meallog-updated",
  handle: async (event) => {
    const referenceValue = _.get(event, "id");
    await mealLogWithLinesAggregateData(referenceValue);
    console.log("elastic-index-lrmwufitcheck_meallog-updated:", event);
  },
};
