const { elasticClient } = require("common/elasticsearch");
const _ = require("lodash");

const dailyMealReminderNotificationViewAggregateData = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];

    const result = await elasticClient.search({
      index: "lrmwufitcheck_user",
      body: {
        query: { terms: { _id: idList } },
        _source: ["id", "fullname", "email"],
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(todayNutritionDayAggregateDataFromIndex(source));

      await Promise.all(promises);

      await elasticClient.index({
        index: "lrmwufitcheck_dailymealremindernotificationview",
        id: source["id"],
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in userAggregateData", error);
    //**errorLog
  }
};

const todayNutritionDayAggregateDataFromIndex = async (source) => {
  try {
    if (!_.get(source, "id")) return;
    const aggregation = await elasticClient.search({
      index: "lrmwufitcheck_nutritionday",
      body: {
        query: {
          match: {
            userId: _.get(source, "id"),
          },
        },
        _source: ["mealCount"],
      },
    });

    if (aggregation.hits.hits.length > 0) {
      if (summaryDate == today) {
        source["todayNutritionDay"] = aggregation.hits.hits[0]?._source;
      }
    }
  } catch (error) {
    console.log("Error in todayNutritionDayAggregateDataFromIndex", error);
    //**errorLog
  }
};

const todayNutritionDayReDailyMealReminderNotificationView = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    if (idList.length === 0) return;
    const result = await elasticClient.search({
      index: "lrmwufitcheck_dailymealremindernotificationview",
      body: {
        query: { terms: { "nutritionday.userId": idList } },
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(todayNutritionDayAggregateDataFromIndex(source));

      await Promise.all(promises);
      await elasticClient.index({
        index: "lrmwufitcheck_dailymealremindernotificationview",
        id: hit.id,
        body: source,
      });
    }
  } catch (error) {
    console.log(
      "Error in nutritiondayReAggregatedailyMealReminderNotificationView",
      error,
    );
    //**errorLog
  }
};

module.exports = {
  dailyMealReminderNotificationViewAggregateData,

  todayNutritionDayReDailyMealReminderNotificationView,

  todayNutritionDayAggregateDataFromIndex,
};
