const { elasticClient } = require("common/elasticsearch");
const _ = require("lodash");

const inviteLinkDeliveredNotificationViewAggregateData = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];

    const result = await elasticClient.search({
      index: "lrmwufitcheck_invitelink",
      body: {
        query: { terms: { _id: idList } },
        _source: [
          "id",
          "inviteCode",
          "invitedEmail",
          "usageMode",
          "usageLimit",
          "inviteState",
          "expiresAt",
        ],
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      await Promise.all(promises);

      await elasticClient.index({
        index: "lrmwufitcheck_invitelinkdeliverednotificationview",
        id: source["id"],
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in invitelinkAggregateData", error);
    //**errorLog
  }
};

module.exports = {
  inviteLinkDeliveredNotificationViewAggregateData,
};
