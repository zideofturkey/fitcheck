const {
  inviteLinkDeliveredNotificationViewAggregateData,
} = require("aggregates/inviteLinkDeliveredNotificationView.aggregate");
const _ = require("lodash");

module.exports = {
  topic: "elastic-index-lrmwufitcheck_invitelink-deleted",
  handle: async (event) => {
    const referenceValue = _.get(event, "id");
    await inviteLinkDeliveredNotificationViewAggregateData(referenceValue);
    console.log("elastic-index-lrmwufitcheck_invitelink-deleted:", event);
  },
};
