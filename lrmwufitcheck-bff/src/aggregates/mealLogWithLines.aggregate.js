const { elasticClient } = require("common/elasticsearch");
const _ = require("lodash");

const mealLogWithLinesAggregateData = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];

    const result = await elasticClient.search({
      index: "lrmwufitcheck_meallog",
      body: {
        query: { terms: { _id: idList } },
        _source: [
          "id",
          "userId",
          "mealDate",
          "mealTime",
          "slotName",
          "logSource",
          "noteText",
          "totalCalories",
          "totalProtein",
          "totalCarbohydrates",
          "totalFat",
          "totalSugar",
          "totalFiber",
          "createdAt",
          "updatedAt",
        ],
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(mealLinesAggregateDataFromIndex(source));

      await Promise.all(promises);

      await elasticClient.index({
        index: "lrmwufitcheck_meallogwithlines",
        id: source["id"],
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in meallogAggregateData", error);
    //**errorLog
  }
};

const mealLinesAggregateDataFromIndex = async (source) => {
  try {
    if (!_.get(source, "id")) return;
    const aggregation = await elasticClient.search({
      index: "lrmwufitcheck_mealline",
      body: {
        query: {
          match: {
            mealLogId: _.get(source, "id"),
          },
        },
        _source: [
          "id",
          "itemName",
          "consumedGrams",
          "itemCalories",
          "itemProtein",
          "itemCarbohydrates",
          "itemFat",
          "itemSugar",
          "itemFiber",
          "lineSource",
          "sourceFoodItemId",
          "sourcePresetMealId",
        ],
      },
    });

    source["mealLines"] = aggregation.hits.hits.map((hit) => hit._source);
  } catch (error) {
    console.log("Error in mealLinesAggregateDataFromIndex", error);
    //**errorLog
  }
};

const mealLinesReMealLogWithLines = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    if (idList.length === 0) return;
    const result = await elasticClient.search({
      index: "lrmwufitcheck_meallogwithlines",
      body: {
        query: { terms: { "mealline.mealLogId": idList } },
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(mealLinesAggregateDataFromIndex(source));

      await Promise.all(promises);
      await elasticClient.index({
        index: "lrmwufitcheck_meallogwithlines",
        id: hit.id,
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in meallineReAggregatemealLogWithLines", error);
    //**errorLog
  }
};

module.exports = {
  mealLogWithLinesAggregateData,

  mealLinesReMealLogWithLines,

  mealLinesAggregateDataFromIndex,
};
