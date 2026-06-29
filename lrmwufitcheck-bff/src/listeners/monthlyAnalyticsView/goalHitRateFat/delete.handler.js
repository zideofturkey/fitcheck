const {
  goalHitRateFatReMonthlyAnalyticsView,
} = require("aggregates/monthlyAnalyticsView.aggregate");
const _ = require("lodash");

module.exports = {
  topic: "elastic-index-lrmwufitcheck_nutritionDay-deleted",
  handle: async (event) => {
    const referenceValue = _.get(event, "userId");
    await goalHitRateFatReMonthlyAnalyticsView(referenceValue);
    console.log("elastic-index-lrmwufitcheck_nutritionDay-deleted:", event);
  },
};
