const { elasticClient } = require("common/elasticsearch");
const _ = require("lodash");

const dailyNutritionSummaryNotificationViewAggregateData = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];

    const result = await elasticClient.search({
      index: "lrmwufitcheck_nutritionday",
      body: {
        query: { terms: { _id: idList } },
        _source: [
          "userId",
          "summaryDate",
          "consumedCalories",
          "consumedProtein",
          "consumedCarbohydrates",
          "consumedFat",
          "consumedSugar",
          "consumedFiber",
          "targetCalories",
          "targetProtein",
          "targetCarbohydrates",
          "targetFat",
          "targetSugar",
          "targetFiber",
          "exceededMetrics",
          "mealCount",
        ],
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(userProfileAggregateDataFromIndex(source));

      await Promise.all(promises);

      await elasticClient.index({
        index: "lrmwufitcheck_dailynutritionsummarynotificationview",
        id: source["id"],
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in nutritiondayAggregateData", error);
    //**errorLog
  }
};

const userProfileAggregateDataFromIndex = async (source) => {
  try {
    if (!_.get(source, "userId")) return;
    const aggregation = await elasticClient.search({
      index: "lrmwufitcheck_user",
      body: {
        query: {
          match: {
            id: _.get(source, "userId"),
          },
        },
        _source: ["id", "fullname", "email"],
      },
    });

    if (aggregation.hits.hits.length > 0) {
      source["userProfile"] = aggregation.hits.hits[0]?._source;
    }
  } catch (error) {
    console.log("Error in userProfileAggregateDataFromIndex", error);
    //**errorLog
  }
};

const userProfileReDailyNutritionSummaryNotificationView = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    if (idList.length === 0) return;
    const result = await elasticClient.search({
      index: "lrmwufitcheck_dailynutritionsummarynotificationview",
      body: {
        query: { terms: { "user.id": idList } },
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(userProfileAggregateDataFromIndex(source));

      await Promise.all(promises);
      await elasticClient.index({
        index: "lrmwufitcheck_dailynutritionsummarynotificationview",
        id: hit.id,
        body: source,
      });
    }
  } catch (error) {
    console.log(
      "Error in userReAggregatedailyNutritionSummaryNotificationView",
      error,
    );
    //**errorLog
  }
};

module.exports = {
  dailyNutritionSummaryNotificationViewAggregateData,

  userProfileReDailyNutritionSummaryNotificationView,

  userProfileAggregateDataFromIndex,
};
