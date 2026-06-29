const {
  dailyMealReminderNotificationViewAggregateData,
} = require("aggregates/dailyMealReminderNotificationView.aggregate");
const _ = require("lodash");

module.exports = {
  topic: "elastic-index-lrmwufitcheck_user-created",
  handle: async (event) => {
    const referenceValue = _.get(event, "id");
    await dailyMealReminderNotificationViewAggregateData(referenceValue);
    console.log("elastic-index-lrmwufitcheck_user-created:", event);
  },
};
