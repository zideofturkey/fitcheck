const {
  inviteLinkListViewAggregateData,
} = require("aggregates/inviteLinkListView.aggregate");
const _ = require("lodash");

module.exports = {
  topic: "elastic-index-lrmwufitcheck_invitelink-created",
  handle: async (event) => {
    const referenceValue = _.get(event, "id");
    await inviteLinkListViewAggregateData(referenceValue);
    console.log("elastic-index-lrmwufitcheck_invitelink-created:", event);
  },
};
