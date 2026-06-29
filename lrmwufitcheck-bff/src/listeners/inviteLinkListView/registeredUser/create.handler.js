const {
  registeredUserReInviteLinkListView,
} = require("aggregates/inviteLinkListView.aggregate");
const _ = require("lodash");

module.exports = {
  topic: "elastic-index-lrmwufitcheck_user-created",
  handle: async (event) => {
    const referenceValue = _.get(event, "id");
    await registeredUserReInviteLinkListView(referenceValue);
    console.log("elastic-index-lrmwufitcheck_user-created:", event);
  },
};
