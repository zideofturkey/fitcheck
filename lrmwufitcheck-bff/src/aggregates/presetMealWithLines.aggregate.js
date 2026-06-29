const { elasticClient } = require("common/elasticsearch");
const _ = require("lodash");

const presetMealWithLinesAggregateData = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];

    const result = await elasticClient.search({
      index: "lrmwufitcheck_presetmeal",
      body: {
        query: { terms: { _id: idList } },
        _source: [
          "id",
          "userId",
          "templateName",
          "descriptionText",
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

      promises.push(foodItemsAggregateDataFromIndex(source));

      promises.push(linesAggregateDataFromIndex(source));

      await Promise.all(promises);

      await elasticClient.index({
        index: "lrmwufitcheck_presetmealwithlines",
        id: source["id"],
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in presetmealAggregateData", error);
    //**errorLog
  }
};

const foodItemsAggregateDataFromIndex = async (source) => {
  try {
    if (!_.get(source, "foodItemId")) return;
    const aggregation = await elasticClient.search({
      index: "lrmwufitcheck_fooditem",
      body: {
        query: {
          match: {
            id: _.get(source, "foodItemId"),
          },
        },
        _source: [
          "id",
          "foodName",
          "caloriePer100g",
          "proteinPer100g",
          "carbohydratePer100g",
          "fatPer100g",
          "sugarPer100g",
          "fiberPer100g",
          "brandName",
          "foodCategory",
        ],
      },
    });

    source["foodItems"] = aggregation.hits.hits.map((hit) => hit._source);
  } catch (error) {
    console.log("Error in foodItemsAggregateDataFromIndex", error);
    //**errorLog
  }
};

const foodItemsRePresetMealWithLines = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    if (idList.length === 0) return;
    const result = await elasticClient.search({
      index: "lrmwufitcheck_presetmealwithlines",
      body: {
        query: { terms: { "fooditem.id": idList } },
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(foodItemsAggregateDataFromIndex(source));

      await Promise.all(promises);
      await elasticClient.index({
        index: "lrmwufitcheck_presetmealwithlines",
        id: hit.id,
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in fooditemReAggregatepresetMealWithLines", error);
    //**errorLog
  }
};

const linesAggregateDataFromIndex = async (source) => {
  try {
    if (!_.get(source, "id")) return;
    const aggregation = await elasticClient.search({
      index: "lrmwufitcheck_presetline",
      body: {
        query: {
          match: {
            presetMealId: _.get(source, "id"),
          },
        },
        _source: [
          "id",
          "foodItemId",
          "lineFoodName",
          "gramAmount",
          "lineCalories",
          "lineProtein",
          "lineCarbohydrates",
          "lineFat",
          "lineSugar",
          "lineFiber",
        ],
      },
    });

    source["lines"] = aggregation.hits.hits.map((hit) => hit._source);
  } catch (error) {
    console.log("Error in linesAggregateDataFromIndex", error);
    //**errorLog
  }
};

const linesRePresetMealWithLines = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    if (idList.length === 0) return;
    const result = await elasticClient.search({
      index: "lrmwufitcheck_presetmealwithlines",
      body: {
        query: { terms: { "presetline.presetMealId": idList } },
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(linesAggregateDataFromIndex(source));

      await Promise.all(promises);
      await elasticClient.index({
        index: "lrmwufitcheck_presetmealwithlines",
        id: hit.id,
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in presetlineReAggregatepresetMealWithLines", error);
    //**errorLog
  }
};

module.exports = {
  presetMealWithLinesAggregateData,

  foodItemsRePresetMealWithLines,
  linesRePresetMealWithLines,

  foodItemsAggregateDataFromIndex,
  linesAggregateDataFromIndex,
};
