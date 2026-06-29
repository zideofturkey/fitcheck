const {
  weeklyAnalyticsViewAggregateData,
} = require("aggregates/weeklyAnalyticsView.aggregate");
const _ = require("lodash");

module.exports = {
  topic: "elastic-index-lrmwufitcheck_nutritionday-updated",
  handle: async (event) => {
    const referenceValue = _.get(event, "id");
    await weeklyAnalyticsViewAggregateData(referenceValue);
    console.log("elastic-index-lrmwufitcheck_nutritionday-updated:", event);
  },
};
