const {
  monthlyAnalyticsViewAggregateData,
} = require("aggregates/monthlyAnalyticsView.aggregate");
const _ = require("lodash");

module.exports = {
  topic: "elastic-index-lrmwufitcheck_nutritionday-deleted",
  handle: async (event) => {
    const referenceValue = _.get(event, "id");
    await monthlyAnalyticsViewAggregateData(referenceValue);
    console.log("elastic-index-lrmwufitcheck_nutritionday-deleted:", event);
  },
};
