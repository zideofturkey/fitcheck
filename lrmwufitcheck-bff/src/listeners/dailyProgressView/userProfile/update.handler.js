const {
  userProfileReDailyProgressView,
} = require("aggregates/dailyProgressView.aggregate");
const _ = require("lodash");

module.exports = {
  topic: "elastic-index-lrmwufitcheck_user-updated",
  handle: async (event) => {
    const referenceValue = _.get(event, "id");
    await userProfileReDailyProgressView(referenceValue);
    console.log("elastic-index-lrmwufitcheck_user-updated:", event);
  },
};
