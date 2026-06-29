const { elasticClient } = require("common/elasticsearch");
const _ = require("lodash");

const foodItemListAggregateData = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];

    const result = await elasticClient.search({
      index: "lrmwufitcheck_fooditem",
      body: {
        query: { terms: { _id: idList } },
        _source: [
          "id",
          "userId",
          "foodName",
          "caloriePer100g",
          "proteinPer100g",
          "carbohydratePer100g",
          "fatPer100g",
          "sugarPer100g",
          "fiberPer100g",
          "brandName",
          "foodCategory",
          "creationSource",
          "createdAt",
          "updatedAt",
        ],
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(rowCountStatDataFromIndex(source));

      await Promise.all(promises);

      await elasticClient.index({
        index: "lrmwufitcheck_fooditemlist",
        id: source["id"],
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in fooditemAggregateData", error);
    //**errorLog
  }
};

const rowCountStatDataFromIndex = async (source) => {
  try {
    const parentKeyValue = _.get(source, "userId");
    if (!parentKeyValue) return;

    let aggs = {
      rowCount: {
        value_count: {
          field: "id",
        },
      },
    };

    const statObject = await elasticClient.search({
      index: "lrmwufitcheck_fooditem",
      body: {
        size: 0,
        query: {
          term: {
            userId: parentKeyValue,
          },
        },
        aggs: aggs,
      },
    });

    if (!source["rowCount"]) source["rowCount"] = {};

    source["rowCount"]["rowCount"] = _.get(
      statObject.aggregations,
      "rowCount.value",
    );
  } catch (error) {
    console.log("Error in rowCountStatDataFromIndex", error);
    //**errorLog
  }
};

const rowCountReFoodItemList = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    const result = await elasticClient.search({
      index: "lrmwufitcheck_fooditemlist",
      body: {
        query: { terms: { userId: idList } },
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(rowCountStatDataFromIndex(source));

      await Promise.all(promises);
      await elasticClient.index({
        index: "lrmwufitcheck_fooditemlist",
        id: hit.id,
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in rowCountReFoodItemList", error);
    //**errorLog
  }
};

module.exports = {
  foodItemListAggregateData,

  rowCountReFoodItemList,

  rowCountStatDataFromIndex,
};
