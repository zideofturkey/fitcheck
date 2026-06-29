const { elasticClient } = require("common/elasticsearch");
const _ = require("lodash");

const inviteLinkListViewAggregateData = async (id) => {
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
          "usageCount",
          "inviteState",
          "expiresAt",
          "lastUsedAt",
          "registeredUserId",
          "deliveryRequestedAt",
          "lastDeliveredAt",
          "createdAt",
          "updatedAt",
          "isActive",
        ],
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(registeredUserAggregateDataFromIndex(source));

      await Promise.all(promises);

      await elasticClient.index({
        index: "lrmwufitcheck_invitelinklistview",
        id: source["id"],
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in invitelinkAggregateData", error);
    //**errorLog
  }
};

const registeredUserAggregateDataFromIndex = async (source) => {
  try {
    if (!_.get(source, "registeredUserId")) return;
    const aggregation = await elasticClient.search({
      index: "lrmwufitcheck_user",
      body: {
        query: {
          match: {
            id: _.get(source, "registeredUserId"),
          },
        },
        _source: ["id", "fullname", "email"],
      },
    });

    if (aggregation.hits.hits.length > 0) {
      if (registeredUserId != null) {
        source["registeredUser"] = aggregation.hits.hits[0]?._source;
      }
    }
  } catch (error) {
    console.log("Error in registeredUserAggregateDataFromIndex", error);
    //**errorLog
  }
};

const registeredUserReInviteLinkListView = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    if (idList.length === 0) return;
    const result = await elasticClient.search({
      index: "lrmwufitcheck_invitelinklistview",
      body: {
        query: { terms: { "user.id": idList } },
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(registeredUserAggregateDataFromIndex(source));

      await Promise.all(promises);
      await elasticClient.index({
        index: "lrmwufitcheck_invitelinklistview",
        id: hit.id,
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in userReAggregateinviteLinkListView", error);
    //**errorLog
  }
};

module.exports = {
  inviteLinkListViewAggregateData,

  registeredUserReInviteLinkListView,

  registeredUserAggregateDataFromIndex,
};
