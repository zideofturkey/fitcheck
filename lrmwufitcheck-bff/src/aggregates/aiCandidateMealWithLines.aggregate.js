const { elasticClient } = require("common/elasticsearch");
const _ = require("lodash");

const aiCandidateMealWithLinesAggregateData = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];

    const result = await elasticClient.search({
      index: "lrmwufitcheck_aicandidatemeal",
      body: {
        query: { terms: { _id: idList } },
        _source: [
          "id",
          "userId",
          "aiSessionId",
          "proposedMealDate",
          "proposedMealTime",
          "proposedSlotName",
          "candidateSource",
          "warningText",
          "confirmationRequired",
          "isConfirmed",
          "isCommitted",
          "totalCalories",
          "totalProtein",
          "totalCarbohydrates",
          "totalFat",
          "totalSugar",
          "totalFiber",
          "committedMealLogId",
          "createdAt",
          "updatedAt",
        ],
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(sessionAggregateDataFromIndex(source));

      promises.push(linesAggregateDataFromIndex(source));

      await Promise.all(promises);

      await elasticClient.index({
        index: "lrmwufitcheck_aicandidatemealwithlines",
        id: source["id"],
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in aicandidatemealAggregateData", error);
    //**errorLog
  }
};

const sessionAggregateDataFromIndex = async (source) => {
  try {
    if (!_.get(source, "aiSessionId")) return;
    const aggregation = await elasticClient.search({
      index: "lrmwufitcheck_aisession",
      body: {
        query: {
          match: {
            id: _.get(source, "aiSessionId"),
          },
        },
        _source: [
          "id",
          "sessionType",
          "inputText",
          "sessionState",
          "confidenceScore",
          "detectedLanguage",
        ],
      },
    });

    if (aggregation.hits.hits.length > 0) {
      source["session"] = aggregation.hits.hits[0]?._source;
    }
  } catch (error) {
    console.log("Error in sessionAggregateDataFromIndex", error);
    //**errorLog
  }
};

const sessionReAiCandidateMealWithLines = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    if (idList.length === 0) return;
    const result = await elasticClient.search({
      index: "lrmwufitcheck_aicandidatemealwithlines",
      body: {
        query: { terms: { "aisession.id": idList } },
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(sessionAggregateDataFromIndex(source));

      await Promise.all(promises);
      await elasticClient.index({
        index: "lrmwufitcheck_aicandidatemealwithlines",
        id: hit.id,
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in aisessionReAggregateaiCandidateMealWithLines", error);
    //**errorLog
  }
};

const linesAggregateDataFromIndex = async (source) => {
  try {
    if (!_.get(source, "id")) return;
    const aggregation = await elasticClient.search({
      index: "lrmwufitcheck_aicandidateline",
      body: {
        query: {
          match: {
            aiCandidateMealId: _.get(source, "id"),
          },
        },
        _source: [
          "id",
          "detectedFoodName",
          "estimatedGrams",
          "estimatedCalories",
          "estimatedProtein",
          "estimatedCarbohydrates",
          "estimatedFat",
          "estimatedSugar",
          "estimatedFiber",
          "quantityConfidence",
          "nutritionReference",
          "saveAsFood",
        ],
      },
    });

    source["lines"] = aggregation.hits.hits.map((hit) => hit._source);
  } catch (error) {
    console.log("Error in linesAggregateDataFromIndex", error);
    //**errorLog
  }
};

const linesReAiCandidateMealWithLines = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    if (idList.length === 0) return;
    const result = await elasticClient.search({
      index: "lrmwufitcheck_aicandidatemealwithlines",
      body: {
        query: { terms: { "aicandidateline.aiCandidateMealId": idList } },
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(linesAggregateDataFromIndex(source));

      await Promise.all(promises);
      await elasticClient.index({
        index: "lrmwufitcheck_aicandidatemealwithlines",
        id: hit.id,
        body: source,
      });
    }
  } catch (error) {
    console.log(
      "Error in aicandidatelineReAggregateaiCandidateMealWithLines",
      error,
    );
    //**errorLog
  }
};

module.exports = {
  aiCandidateMealWithLinesAggregateData,

  sessionReAiCandidateMealWithLines,
  linesReAiCandidateMealWithLines,

  sessionAggregateDataFromIndex,
  linesAggregateDataFromIndex,
};
