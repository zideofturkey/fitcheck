const { elasticClient } = require("common/elasticsearch");
const _ = require("lodash");

const monthlyAnalyticsViewAggregateData = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];

    const result = await elasticClient.search({
      index: "lrmwufitcheck_nutritionday",
      body: {
        query: { terms: { _id: idList } },
        _source: [
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

      promises.push(avgDailyCaloriesStatDataFromIndex(source));

      promises.push(avgDailyProteinStatDataFromIndex(source));

      promises.push(avgDailyCarbohydratesStatDataFromIndex(source));

      promises.push(avgDailySugarStatDataFromIndex(source));

      promises.push(avgDailyFatStatDataFromIndex(source));

      promises.push(avgDailyFiberStatDataFromIndex(source));

      promises.push(goalHitRateProteinStatDataFromIndex(source));

      promises.push(goalHitRateCarbohydratesStatDataFromIndex(source));

      promises.push(goalHitRateCaloriesStatDataFromIndex(source));

      promises.push(goalHitRateFatStatDataFromIndex(source));

      promises.push(goalHitRateSugarStatDataFromIndex(source));

      promises.push(goalHitRateFiberStatDataFromIndex(source));

      await Promise.all(promises);

      await elasticClient.index({
        index: "lrmwufitcheck_monthlyanalyticsview",
        id: source["id"],
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in nutritiondayAggregateData", error);
    //**errorLog
  }
};

const avgDailyCaloriesStatDataFromIndex = async (source) => {
  try {
    const parentKeyValue = _.get(source, "userId");
    if (!parentKeyValue) return;

    let aggs = {
      avgDailyCalories: {
        avg: {
          field: "consumedCalories",
        },
      },
    };

    const statObject = await elasticClient.search({
      index: "lrmwufitcheck_nutritionday",
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

    if (!source["avgDailyCalories"]) source["avgDailyCalories"] = {};

    source["avgDailyCalories"]["avgDailyCalories"] = _.get(
      statObject.aggregations,
      "avgDailyCalories.value",
    );
  } catch (error) {
    console.log("Error in avgDailyCaloriesStatDataFromIndex", error);
    //**errorLog
  }
};

const avgDailyCaloriesReMonthlyAnalyticsView = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    const result = await elasticClient.search({
      index: "lrmwufitcheck_monthlyanalyticsview",
      body: {
        query: { terms: { userId: idList } },
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(avgDailyCaloriesStatDataFromIndex(source));

      await Promise.all(promises);
      await elasticClient.index({
        index: "lrmwufitcheck_monthlyanalyticsview",
        id: hit.id,
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in avgDailyCaloriesReMonthlyAnalyticsView", error);
    //**errorLog
  }
};

const avgDailyProteinStatDataFromIndex = async (source) => {
  try {
    const parentKeyValue = _.get(source, "userId");
    if (!parentKeyValue) return;

    let aggs = {
      avgDailyProtein: {
        avg: {
          field: "consumedProtein",
        },
      },
    };

    const statObject = await elasticClient.search({
      index: "lrmwufitcheck_nutritionday",
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

    if (!source["avgDailyProtein"]) source["avgDailyProtein"] = {};

    source["avgDailyProtein"]["avgDailyProtein"] = _.get(
      statObject.aggregations,
      "avgDailyProtein.value",
    );
  } catch (error) {
    console.log("Error in avgDailyProteinStatDataFromIndex", error);
    //**errorLog
  }
};

const avgDailyProteinReMonthlyAnalyticsView = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    const result = await elasticClient.search({
      index: "lrmwufitcheck_monthlyanalyticsview",
      body: {
        query: { terms: { userId: idList } },
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(avgDailyProteinStatDataFromIndex(source));

      await Promise.all(promises);
      await elasticClient.index({
        index: "lrmwufitcheck_monthlyanalyticsview",
        id: hit.id,
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in avgDailyProteinReMonthlyAnalyticsView", error);
    //**errorLog
  }
};

const avgDailyCarbohydratesStatDataFromIndex = async (source) => {
  try {
    const parentKeyValue = _.get(source, "userId");
    if (!parentKeyValue) return;

    let aggs = {
      avgDailyCarbohydrates: {
        avg: {
          field: "consumedCarbohydrates",
        },
      },
    };

    const statObject = await elasticClient.search({
      index: "lrmwufitcheck_nutritionday",
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

    if (!source["avgDailyCarbohydrates"]) source["avgDailyCarbohydrates"] = {};

    source["avgDailyCarbohydrates"]["avgDailyCarbohydrates"] = _.get(
      statObject.aggregations,
      "avgDailyCarbohydrates.value",
    );
  } catch (error) {
    console.log("Error in avgDailyCarbohydratesStatDataFromIndex", error);
    //**errorLog
  }
};

const avgDailyCarbohydratesReMonthlyAnalyticsView = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    const result = await elasticClient.search({
      index: "lrmwufitcheck_monthlyanalyticsview",
      body: {
        query: { terms: { userId: idList } },
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(avgDailyCarbohydratesStatDataFromIndex(source));

      await Promise.all(promises);
      await elasticClient.index({
        index: "lrmwufitcheck_monthlyanalyticsview",
        id: hit.id,
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in avgDailyCarbohydratesReMonthlyAnalyticsView", error);
    //**errorLog
  }
};

const avgDailySugarStatDataFromIndex = async (source) => {
  try {
    const parentKeyValue = _.get(source, "userId");
    if (!parentKeyValue) return;

    let aggs = {
      avgDailySugar: {
        avg: {
          field: "consumedSugar",
        },
      },
    };

    const statObject = await elasticClient.search({
      index: "lrmwufitcheck_nutritionday",
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

    if (!source["avgDailySugar"]) source["avgDailySugar"] = {};

    source["avgDailySugar"]["avgDailySugar"] = _.get(
      statObject.aggregations,
      "avgDailySugar.value",
    );
  } catch (error) {
    console.log("Error in avgDailySugarStatDataFromIndex", error);
    //**errorLog
  }
};

const avgDailySugarReMonthlyAnalyticsView = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    const result = await elasticClient.search({
      index: "lrmwufitcheck_monthlyanalyticsview",
      body: {
        query: { terms: { userId: idList } },
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(avgDailySugarStatDataFromIndex(source));

      await Promise.all(promises);
      await elasticClient.index({
        index: "lrmwufitcheck_monthlyanalyticsview",
        id: hit.id,
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in avgDailySugarReMonthlyAnalyticsView", error);
    //**errorLog
  }
};

const avgDailyFatStatDataFromIndex = async (source) => {
  try {
    const parentKeyValue = _.get(source, "userId");
    if (!parentKeyValue) return;

    let aggs = {
      avgDailyFat: {
        avg: {
          field: "consumedFat",
        },
      },
    };

    const statObject = await elasticClient.search({
      index: "lrmwufitcheck_nutritionday",
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

    if (!source["avgDailyFat"]) source["avgDailyFat"] = {};

    source["avgDailyFat"]["avgDailyFat"] = _.get(
      statObject.aggregations,
      "avgDailyFat.value",
    );
  } catch (error) {
    console.log("Error in avgDailyFatStatDataFromIndex", error);
    //**errorLog
  }
};

const avgDailyFatReMonthlyAnalyticsView = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    const result = await elasticClient.search({
      index: "lrmwufitcheck_monthlyanalyticsview",
      body: {
        query: { terms: { userId: idList } },
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(avgDailyFatStatDataFromIndex(source));

      await Promise.all(promises);
      await elasticClient.index({
        index: "lrmwufitcheck_monthlyanalyticsview",
        id: hit.id,
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in avgDailyFatReMonthlyAnalyticsView", error);
    //**errorLog
  }
};

const avgDailyFiberStatDataFromIndex = async (source) => {
  try {
    const parentKeyValue = _.get(source, "userId");
    if (!parentKeyValue) return;

    let aggs = {
      avgDailyFiber: {
        avg: {
          field: "consumedFiber",
        },
      },
    };

    const statObject = await elasticClient.search({
      index: "lrmwufitcheck_nutritionday",
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

    if (!source["avgDailyFiber"]) source["avgDailyFiber"] = {};

    source["avgDailyFiber"]["avgDailyFiber"] = _.get(
      statObject.aggregations,
      "avgDailyFiber.value",
    );
  } catch (error) {
    console.log("Error in avgDailyFiberStatDataFromIndex", error);
    //**errorLog
  }
};

const avgDailyFiberReMonthlyAnalyticsView = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    const result = await elasticClient.search({
      index: "lrmwufitcheck_monthlyanalyticsview",
      body: {
        query: { terms: { userId: idList } },
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(avgDailyFiberStatDataFromIndex(source));

      await Promise.all(promises);
      await elasticClient.index({
        index: "lrmwufitcheck_monthlyanalyticsview",
        id: hit.id,
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in avgDailyFiberReMonthlyAnalyticsView", error);
    //**errorLog
  }
};

const goalHitRateProteinStatDataFromIndex = async (source) => {
  try {
    const parentKeyValue = _.get(source, "userId");
    if (!parentKeyValue) return;

    let aggs = {
      goalHitRateProtein: {
        avg: {
          field: "consumedProtein",
        },
      },
    };

    const statObject = await elasticClient.search({
      index: "lrmwufitcheck_nutritionday",
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

    if (!source["goalHitRateProtein"]) source["goalHitRateProtein"] = {};

    source["goalHitRateProtein"]["goalHitRateProtein"] = _.get(
      statObject.aggregations,
      "goalHitRateProtein.value",
    );
  } catch (error) {
    console.log("Error in goalHitRateProteinStatDataFromIndex", error);
    //**errorLog
  }
};

const goalHitRateProteinReMonthlyAnalyticsView = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    const result = await elasticClient.search({
      index: "lrmwufitcheck_monthlyanalyticsview",
      body: {
        query: { terms: { userId: idList } },
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(goalHitRateProteinStatDataFromIndex(source));

      await Promise.all(promises);
      await elasticClient.index({
        index: "lrmwufitcheck_monthlyanalyticsview",
        id: hit.id,
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in goalHitRateProteinReMonthlyAnalyticsView", error);
    //**errorLog
  }
};

const goalHitRateCarbohydratesStatDataFromIndex = async (source) => {
  try {
    const parentKeyValue = _.get(source, "userId");
    if (!parentKeyValue) return;

    let aggs = {
      goalHitRateCarbohydrates: {
        avg: {
          field: "consumedCarbohydrates",
        },
      },
    };

    const statObject = await elasticClient.search({
      index: "lrmwufitcheck_nutritionday",
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

    if (!source["goalHitRateCarbohydrates"])
      source["goalHitRateCarbohydrates"] = {};

    source["goalHitRateCarbohydrates"]["goalHitRateCarbohydrates"] = _.get(
      statObject.aggregations,
      "goalHitRateCarbohydrates.value",
    );
  } catch (error) {
    console.log("Error in goalHitRateCarbohydratesStatDataFromIndex", error);
    //**errorLog
  }
};

const goalHitRateCarbohydratesReMonthlyAnalyticsView = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    const result = await elasticClient.search({
      index: "lrmwufitcheck_monthlyanalyticsview",
      body: {
        query: { terms: { userId: idList } },
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(goalHitRateCarbohydratesStatDataFromIndex(source));

      await Promise.all(promises);
      await elasticClient.index({
        index: "lrmwufitcheck_monthlyanalyticsview",
        id: hit.id,
        body: source,
      });
    }
  } catch (error) {
    console.log(
      "Error in goalHitRateCarbohydratesReMonthlyAnalyticsView",
      error,
    );
    //**errorLog
  }
};

const goalHitRateCaloriesStatDataFromIndex = async (source) => {
  try {
    const parentKeyValue = _.get(source, "userId");
    if (!parentKeyValue) return;

    let aggs = {
      goalHitRateCalories: {
        avg: {
          field: "consumedCalories",
        },
      },
    };

    const statObject = await elasticClient.search({
      index: "lrmwufitcheck_nutritionday",
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

    if (!source["goalHitRateCalories"]) source["goalHitRateCalories"] = {};

    source["goalHitRateCalories"]["goalHitRateCalories"] = _.get(
      statObject.aggregations,
      "goalHitRateCalories.value",
    );
  } catch (error) {
    console.log("Error in goalHitRateCaloriesStatDataFromIndex", error);
    //**errorLog
  }
};

const goalHitRateCaloriesReMonthlyAnalyticsView = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    const result = await elasticClient.search({
      index: "lrmwufitcheck_monthlyanalyticsview",
      body: {
        query: { terms: { userId: idList } },
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(goalHitRateCaloriesStatDataFromIndex(source));

      await Promise.all(promises);
      await elasticClient.index({
        index: "lrmwufitcheck_monthlyanalyticsview",
        id: hit.id,
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in goalHitRateCaloriesReMonthlyAnalyticsView", error);
    //**errorLog
  }
};

const goalHitRateFatStatDataFromIndex = async (source) => {
  try {
    const parentKeyValue = _.get(source, "userId");
    if (!parentKeyValue) return;

    let aggs = {
      goalHitRateFat: {
        avg: {
          field: "consumedFat",
        },
      },
    };

    const statObject = await elasticClient.search({
      index: "lrmwufitcheck_nutritionday",
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

    if (!source["goalHitRateFat"]) source["goalHitRateFat"] = {};

    source["goalHitRateFat"]["goalHitRateFat"] = _.get(
      statObject.aggregations,
      "goalHitRateFat.value",
    );
  } catch (error) {
    console.log("Error in goalHitRateFatStatDataFromIndex", error);
    //**errorLog
  }
};

const goalHitRateFatReMonthlyAnalyticsView = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    const result = await elasticClient.search({
      index: "lrmwufitcheck_monthlyanalyticsview",
      body: {
        query: { terms: { userId: idList } },
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(goalHitRateFatStatDataFromIndex(source));

      await Promise.all(promises);
      await elasticClient.index({
        index: "lrmwufitcheck_monthlyanalyticsview",
        id: hit.id,
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in goalHitRateFatReMonthlyAnalyticsView", error);
    //**errorLog
  }
};

const goalHitRateSugarStatDataFromIndex = async (source) => {
  try {
    const parentKeyValue = _.get(source, "userId");
    if (!parentKeyValue) return;

    let aggs = {
      goalHitRateSugar: {
        avg: {
          field: "consumedSugar",
        },
      },
    };

    const statObject = await elasticClient.search({
      index: "lrmwufitcheck_nutritionday",
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

    if (!source["goalHitRateSugar"]) source["goalHitRateSugar"] = {};

    source["goalHitRateSugar"]["goalHitRateSugar"] = _.get(
      statObject.aggregations,
      "goalHitRateSugar.value",
    );
  } catch (error) {
    console.log("Error in goalHitRateSugarStatDataFromIndex", error);
    //**errorLog
  }
};

const goalHitRateSugarReMonthlyAnalyticsView = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    const result = await elasticClient.search({
      index: "lrmwufitcheck_monthlyanalyticsview",
      body: {
        query: { terms: { userId: idList } },
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(goalHitRateSugarStatDataFromIndex(source));

      await Promise.all(promises);
      await elasticClient.index({
        index: "lrmwufitcheck_monthlyanalyticsview",
        id: hit.id,
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in goalHitRateSugarReMonthlyAnalyticsView", error);
    //**errorLog
  }
};

const goalHitRateFiberStatDataFromIndex = async (source) => {
  try {
    const parentKeyValue = _.get(source, "userId");
    if (!parentKeyValue) return;

    let aggs = {
      goalHitRateFiber: {
        avg: {
          field: "consumedFiber",
        },
      },
    };

    const statObject = await elasticClient.search({
      index: "lrmwufitcheck_nutritionday",
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

    if (!source["goalHitRateFiber"]) source["goalHitRateFiber"] = {};

    source["goalHitRateFiber"]["goalHitRateFiber"] = _.get(
      statObject.aggregations,
      "goalHitRateFiber.value",
    );
  } catch (error) {
    console.log("Error in goalHitRateFiberStatDataFromIndex", error);
    //**errorLog
  }
};

const goalHitRateFiberReMonthlyAnalyticsView = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    const result = await elasticClient.search({
      index: "lrmwufitcheck_monthlyanalyticsview",
      body: {
        query: { terms: { userId: idList } },
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(goalHitRateFiberStatDataFromIndex(source));

      await Promise.all(promises);
      await elasticClient.index({
        index: "lrmwufitcheck_monthlyanalyticsview",
        id: hit.id,
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in goalHitRateFiberReMonthlyAnalyticsView", error);
    //**errorLog
  }
};

module.exports = {
  monthlyAnalyticsViewAggregateData,

  avgDailyCaloriesReMonthlyAnalyticsView,
  avgDailyProteinReMonthlyAnalyticsView,
  avgDailyCarbohydratesReMonthlyAnalyticsView,
  avgDailySugarReMonthlyAnalyticsView,
  avgDailyFatReMonthlyAnalyticsView,
  avgDailyFiberReMonthlyAnalyticsView,
  goalHitRateProteinReMonthlyAnalyticsView,
  goalHitRateCarbohydratesReMonthlyAnalyticsView,
  goalHitRateCaloriesReMonthlyAnalyticsView,
  goalHitRateFatReMonthlyAnalyticsView,
  goalHitRateSugarReMonthlyAnalyticsView,
  goalHitRateFiberReMonthlyAnalyticsView,

  avgDailyCaloriesStatDataFromIndex,
  avgDailyProteinStatDataFromIndex,
  avgDailyCarbohydratesStatDataFromIndex,
  avgDailySugarStatDataFromIndex,
  avgDailyFatStatDataFromIndex,
  avgDailyFiberStatDataFromIndex,
  goalHitRateProteinStatDataFromIndex,
  goalHitRateCarbohydratesStatDataFromIndex,
  goalHitRateCaloriesStatDataFromIndex,
  goalHitRateFatStatDataFromIndex,
  goalHitRateSugarStatDataFromIndex,
  goalHitRateFiberStatDataFromIndex,
};
