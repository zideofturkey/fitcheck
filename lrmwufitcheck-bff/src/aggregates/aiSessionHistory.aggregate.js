const { elasticClient } = require("common/elasticsearch");
const _ = require("lodash");

const aiSessionHistoryAggregateData = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];

    const result = await elasticClient.search({
      index: "lrmwufitcheck_aisession",
      body: {
        query: { terms: { _id: idList } },
        _source: [
          "id",
          "userId",
          "sessionType",
          "inputText",
          "detectedLanguage",
          "sessionState",
          "confidenceScore",
          "finalResponseText",
          "createdAt",
          "updatedAt",
        ],
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(guidanceNoteAggregateDataFromIndex(source));

      promises.push(candidateMealAggregateDataFromIndex(source));

      await Promise.all(promises);

      await elasticClient.index({
        index: "lrmwufitcheck_aisessionhistory",
        id: source["id"],
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in aisessionAggregateData", error);
    //**errorLog
  }
};

const guidanceNoteAggregateDataFromIndex = async (source) => {
  try {
    if (!_.get(source, "id")) return;
    const aggregation = await elasticClient.search({
      index: "lrmwufitcheck_aiguidancenote",
      body: {
        query: {
          match: {
            aiSessionId: _.get(source, "id"),
          },
        },
        _source: [
          "id",
          "questionType",
          "contextRange",
          "answerSummary",
          "cautionText",
        ],
      },
    });

    if (aggregation.hits.hits.length > 0) {
      source["guidanceNote"] = aggregation.hits.hits[0]?._source;
    }
  } catch (error) {
    console.log("Error in guidanceNoteAggregateDataFromIndex", error);
    //**errorLog
  }
};

const guidanceNoteReAiSessionHistory = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    if (idList.length === 0) return;
    const result = await elasticClient.search({
      index: "lrmwufitcheck_aisessionhistory",
      body: {
        query: { terms: { "aiguidancenote.aiSessionId": idList } },
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(guidanceNoteAggregateDataFromIndex(source));

      await Promise.all(promises);
      await elasticClient.index({
        index: "lrmwufitcheck_aisessionhistory",
        id: hit.id,
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in aiguidancenoteReAggregateaiSessionHistory", error);
    //**errorLog
  }
};

const candidateMealAggregateDataFromIndex = async (source) => {
  try {
    if (!_.get(source, "id")) return;
    const aggregation = await elasticClient.search({
      index: "lrmwufitcheck_aicandidatemeal",
      body: {
        query: {
          match: {
            aiSessionId: _.get(source, "id"),
          },
        },
        _source: [
          "id",
          "proposedMealDate",
          "proposedSlotName",
          "totalCalories",
          "confirmationRequired",
          "warningText",
        ],
      },
    });

    if (aggregation.hits.hits.length > 0) {
      source["candidateMeal"] = aggregation.hits.hits[0]?._source;
    }
  } catch (error) {
    console.log("Error in candidateMealAggregateDataFromIndex", error);
    //**errorLog
  }
};

const candidateMealReAiSessionHistory = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    if (idList.length === 0) return;
    const result = await elasticClient.search({
      index: "lrmwufitcheck_aisessionhistory",
      body: {
        query: { terms: { "aicandidatemeal.aiSessionId": idList } },
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(candidateMealAggregateDataFromIndex(source));

      await Promise.all(promises);
      await elasticClient.index({
        index: "lrmwufitcheck_aisessionhistory",
        id: hit.id,
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in aicandidatemealReAggregateaiSessionHistory", error);
    //**errorLog
  }
};

module.exports = {
  aiSessionHistoryAggregateData,

  guidanceNoteReAiSessionHistory,
  candidateMealReAiSessionHistory,

  guidanceNoteAggregateDataFromIndex,
  candidateMealAggregateDataFromIndex,
};
