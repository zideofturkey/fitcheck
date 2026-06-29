const { elasticClient } = require("common/elasticsearch");

const {
  inviteLinkDeliveredNotificationViewAggregateData,
} = require("aggregates/inviteLinkDeliveredNotificationView.aggregate");

const {
  inviteLinkListViewAggregateData,
} = require("aggregates/inviteLinkListView.aggregate");

const {
  presetMealWithLinesAggregateData,
} = require("aggregates/presetMealWithLines.aggregate");

const {
  foodItemListAggregateData,
} = require("aggregates/foodItemList.aggregate");

const {
  aiCandidateMealWithLinesAggregateData,
} = require("aggregates/aiCandidateMealWithLines.aggregate");

const {
  mealLogWithLinesAggregateData,
} = require("aggregates/mealLogWithLines.aggregate");

const {
  aiSessionHistoryAggregateData,
} = require("aggregates/aiSessionHistory.aggregate");

const {
  dailyProgressViewAggregateData,
} = require("aggregates/dailyProgressView.aggregate");

const {
  weeklyAnalyticsViewAggregateData,
} = require("aggregates/weeklyAnalyticsView.aggregate");

const {
  monthlyAnalyticsViewAggregateData,
} = require("aggregates/monthlyAnalyticsView.aggregate");

const {
  dailyNutritionSummaryNotificationViewAggregateData,
} = require("aggregates/dailyNutritionSummaryNotificationView.aggregate");

const {
  dailyMealReminderNotificationViewAggregateData,
} = require("aggregates/dailyMealReminderNotificationView.aggregate");

const SCROLL_TIMEOUT = "2m";
const SCROLL_SIZE = 1000;
const BATCH_SIZE = 100;

/**
 * Scroll through all documents in an index using Elasticsearch Scroll API
 * @param {string} indexName - The index to scroll through
 * @returns {Promise<string[]>} - Array of document IDs
 */
const scrollAllDocuments = async (indexName) => {
  const allIds = [];

  // Initial search with scroll
  let response = await elasticClient.search({
    index: indexName,
    scroll: SCROLL_TIMEOUT,
    size: SCROLL_SIZE,
    body: {
      query: { match_all: {} },
      _source: ["id"],
    },
  });

  let scrollId = response._scroll_id;
  let hits = response.hits.hits;

  // Collect IDs from first batch
  while (hits && hits.length > 0) {
    const ids = hits.map((hit) => hit._source.id).filter(Boolean);
    allIds.push(...ids);

    // Continue scrolling
    response = await elasticClient.scroll({
      scroll_id: scrollId,
      scroll: SCROLL_TIMEOUT,
    });

    scrollId = response._scroll_id;
    hits = response.hits.hits;
  }

  // Clear scroll context to free resources
  if (scrollId) {
    try {
      await elasticClient.clearScroll({ scroll_id: scrollId });
    } catch (err) {
      console.warn("Failed to clear scroll context:", err.message);
    }
  }

  return allIds;
};

/**
 * Process IDs in batches to avoid memory issues
 * @param {string[]} ids - Array of IDs to process
 * @param {Function} aggregateFn - Aggregation function to call
 * @param {string} viewName - Name of the view for logging
 */
const processBatches = async (ids, aggregateFn, viewName) => {
  const totalBatches = Math.ceil(ids.length / BATCH_SIZE);

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    try {
      await aggregateFn(batch);
      console.log(
        `${viewName}: Batch ${batchNum}/${totalBatches} completed (${batch.length} items)`,
      );
    } catch (error) {
      console.error(
        `${viewName}: Batch ${batchNum}/${totalBatches} failed:`,
        error.message,
      );
      // Continue with next batch instead of failing completely
    }
  }
};

const runAllRepair = async () => {
  console.group("Repair started at ", new Date());

  await inviteLinkDeliveredNotificationViewRepair();

  await inviteLinkListViewRepair();

  await presetMealWithLinesRepair();

  await foodItemListRepair();

  await aiCandidateMealWithLinesRepair();

  await mealLogWithLinesRepair();

  await aiSessionHistoryRepair();

  await dailyProgressViewRepair();

  await weeklyAnalyticsViewRepair();

  await monthlyAnalyticsViewRepair();

  await dailyNutritionSummaryNotificationViewRepair();

  await dailyMealReminderNotificationViewRepair();

  console.groupEnd();
};

const inviteLinkDeliveredNotificationViewRepair = async () => {
  try {
    console.group(
      "inviteLinkDeliveredNotificationViewRepair started at ",
      new Date(),
    );
    await checkIndex("lrmwufitcheck_invitelinkdeliverednotificationview");

    const indexName = "lrmwufitcheck_invitelink";
    const indexExists = await elasticClient.indices.exists({
      index: indexName,
    });

    if (!indexExists) {
      console.log(`Source index ${indexName} does not exist, skipping repair`);
      return;
    }

    // Use scroll API to get all document IDs
    const ids = await scrollAllDocuments(indexName);

    if (ids.length === 0) {
      console.log(
        "No documents found to repair for invitelinkdeliverednotificationview",
      );
      return;
    }

    console.log(
      `Found ${ids.length} documents to repair for invitelinkdeliverednotificationview`,
    );

    // Process in batches
    await processBatches(
      ids,
      inviteLinkDeliveredNotificationViewAggregateData,
      "inviteLinkDeliveredNotificationView",
    );

    console.log("Repair completed for invitelinkdeliverednotificationview");
  } catch (error) {
    console.error(
      "inviteLinkDeliveredNotificationViewRepair failed at ",
      new Date(),
      error,
    );
    //**errorLog
  } finally {
    console.groupEnd();
  }
};

const inviteLinkListViewRepair = async () => {
  try {
    console.group("inviteLinkListViewRepair started at ", new Date());
    await checkIndex("lrmwufitcheck_invitelinklistview");

    const indexName = "lrmwufitcheck_invitelink";
    const indexExists = await elasticClient.indices.exists({
      index: indexName,
    });

    if (!indexExists) {
      console.log(`Source index ${indexName} does not exist, skipping repair`);
      return;
    }

    // Use scroll API to get all document IDs
    const ids = await scrollAllDocuments(indexName);

    if (ids.length === 0) {
      console.log("No documents found to repair for invitelinklistview");
      return;
    }

    console.log(
      `Found ${ids.length} documents to repair for invitelinklistview`,
    );

    // Process in batches
    await processBatches(
      ids,
      inviteLinkListViewAggregateData,
      "inviteLinkListView",
    );

    console.log("Repair completed for invitelinklistview");
  } catch (error) {
    console.error("inviteLinkListViewRepair failed at ", new Date(), error);
    //**errorLog
  } finally {
    console.groupEnd();
  }
};

const presetMealWithLinesRepair = async () => {
  try {
    console.group("presetMealWithLinesRepair started at ", new Date());
    await checkIndex("lrmwufitcheck_presetmealwithlines");

    const indexName = "lrmwufitcheck_presetmeal";
    const indexExists = await elasticClient.indices.exists({
      index: indexName,
    });

    if (!indexExists) {
      console.log(`Source index ${indexName} does not exist, skipping repair`);
      return;
    }

    // Use scroll API to get all document IDs
    const ids = await scrollAllDocuments(indexName);

    if (ids.length === 0) {
      console.log("No documents found to repair for presetmealwithlines");
      return;
    }

    console.log(
      `Found ${ids.length} documents to repair for presetmealwithlines`,
    );

    // Process in batches
    await processBatches(
      ids,
      presetMealWithLinesAggregateData,
      "presetMealWithLines",
    );

    console.log("Repair completed for presetmealwithlines");
  } catch (error) {
    console.error("presetMealWithLinesRepair failed at ", new Date(), error);
    //**errorLog
  } finally {
    console.groupEnd();
  }
};

const foodItemListRepair = async () => {
  try {
    console.group("foodItemListRepair started at ", new Date());
    await checkIndex("lrmwufitcheck_fooditemlist");

    const indexName = "lrmwufitcheck_fooditem";
    const indexExists = await elasticClient.indices.exists({
      index: indexName,
    });

    if (!indexExists) {
      console.log(`Source index ${indexName} does not exist, skipping repair`);
      return;
    }

    // Use scroll API to get all document IDs
    const ids = await scrollAllDocuments(indexName);

    if (ids.length === 0) {
      console.log("No documents found to repair for fooditemlist");
      return;
    }

    console.log(`Found ${ids.length} documents to repair for fooditemlist`);

    // Process in batches
    await processBatches(ids, foodItemListAggregateData, "foodItemList");

    console.log("Repair completed for fooditemlist");
  } catch (error) {
    console.error("foodItemListRepair failed at ", new Date(), error);
    //**errorLog
  } finally {
    console.groupEnd();
  }
};

const aiCandidateMealWithLinesRepair = async () => {
  try {
    console.group("aiCandidateMealWithLinesRepair started at ", new Date());
    await checkIndex("lrmwufitcheck_aicandidatemealwithlines");

    const indexName = "lrmwufitcheck_aicandidatemeal";
    const indexExists = await elasticClient.indices.exists({
      index: indexName,
    });

    if (!indexExists) {
      console.log(`Source index ${indexName} does not exist, skipping repair`);
      return;
    }

    // Use scroll API to get all document IDs
    const ids = await scrollAllDocuments(indexName);

    if (ids.length === 0) {
      console.log("No documents found to repair for aicandidatemealwithlines");
      return;
    }

    console.log(
      `Found ${ids.length} documents to repair for aicandidatemealwithlines`,
    );

    // Process in batches
    await processBatches(
      ids,
      aiCandidateMealWithLinesAggregateData,
      "aiCandidateMealWithLines",
    );

    console.log("Repair completed for aicandidatemealwithlines");
  } catch (error) {
    console.error(
      "aiCandidateMealWithLinesRepair failed at ",
      new Date(),
      error,
    );
    //**errorLog
  } finally {
    console.groupEnd();
  }
};

const mealLogWithLinesRepair = async () => {
  try {
    console.group("mealLogWithLinesRepair started at ", new Date());
    await checkIndex("lrmwufitcheck_meallogwithlines");

    const indexName = "lrmwufitcheck_meallog";
    const indexExists = await elasticClient.indices.exists({
      index: indexName,
    });

    if (!indexExists) {
      console.log(`Source index ${indexName} does not exist, skipping repair`);
      return;
    }

    // Use scroll API to get all document IDs
    const ids = await scrollAllDocuments(indexName);

    if (ids.length === 0) {
      console.log("No documents found to repair for meallogwithlines");
      return;
    }

    console.log(`Found ${ids.length} documents to repair for meallogwithlines`);

    // Process in batches
    await processBatches(
      ids,
      mealLogWithLinesAggregateData,
      "mealLogWithLines",
    );

    console.log("Repair completed for meallogwithlines");
  } catch (error) {
    console.error("mealLogWithLinesRepair failed at ", new Date(), error);
    //**errorLog
  } finally {
    console.groupEnd();
  }
};

const aiSessionHistoryRepair = async () => {
  try {
    console.group("aiSessionHistoryRepair started at ", new Date());
    await checkIndex("lrmwufitcheck_aisessionhistory");

    const indexName = "lrmwufitcheck_aisession";
    const indexExists = await elasticClient.indices.exists({
      index: indexName,
    });

    if (!indexExists) {
      console.log(`Source index ${indexName} does not exist, skipping repair`);
      return;
    }

    // Use scroll API to get all document IDs
    const ids = await scrollAllDocuments(indexName);

    if (ids.length === 0) {
      console.log("No documents found to repair for aisessionhistory");
      return;
    }

    console.log(`Found ${ids.length} documents to repair for aisessionhistory`);

    // Process in batches
    await processBatches(
      ids,
      aiSessionHistoryAggregateData,
      "aiSessionHistory",
    );

    console.log("Repair completed for aisessionhistory");
  } catch (error) {
    console.error("aiSessionHistoryRepair failed at ", new Date(), error);
    //**errorLog
  } finally {
    console.groupEnd();
  }
};

const dailyProgressViewRepair = async () => {
  try {
    console.group("dailyProgressViewRepair started at ", new Date());
    await checkIndex("lrmwufitcheck_dailyprogressview");

    const indexName = "lrmwufitcheck_nutritionday";
    const indexExists = await elasticClient.indices.exists({
      index: indexName,
    });

    if (!indexExists) {
      console.log(`Source index ${indexName} does not exist, skipping repair`);
      return;
    }

    // Use scroll API to get all document IDs
    const ids = await scrollAllDocuments(indexName);

    if (ids.length === 0) {
      console.log("No documents found to repair for dailyprogressview");
      return;
    }

    console.log(
      `Found ${ids.length} documents to repair for dailyprogressview`,
    );

    // Process in batches
    await processBatches(
      ids,
      dailyProgressViewAggregateData,
      "dailyProgressView",
    );

    console.log("Repair completed for dailyprogressview");
  } catch (error) {
    console.error("dailyProgressViewRepair failed at ", new Date(), error);
    //**errorLog
  } finally {
    console.groupEnd();
  }
};

const weeklyAnalyticsViewRepair = async () => {
  try {
    console.group("weeklyAnalyticsViewRepair started at ", new Date());
    await checkIndex("lrmwufitcheck_weeklyanalyticsview");

    const indexName = "lrmwufitcheck_nutritionday";
    const indexExists = await elasticClient.indices.exists({
      index: indexName,
    });

    if (!indexExists) {
      console.log(`Source index ${indexName} does not exist, skipping repair`);
      return;
    }

    // Use scroll API to get all document IDs
    const ids = await scrollAllDocuments(indexName);

    if (ids.length === 0) {
      console.log("No documents found to repair for weeklyanalyticsview");
      return;
    }

    console.log(
      `Found ${ids.length} documents to repair for weeklyanalyticsview`,
    );

    // Process in batches
    await processBatches(
      ids,
      weeklyAnalyticsViewAggregateData,
      "weeklyAnalyticsView",
    );

    console.log("Repair completed for weeklyanalyticsview");
  } catch (error) {
    console.error("weeklyAnalyticsViewRepair failed at ", new Date(), error);
    //**errorLog
  } finally {
    console.groupEnd();
  }
};

const monthlyAnalyticsViewRepair = async () => {
  try {
    console.group("monthlyAnalyticsViewRepair started at ", new Date());
    await checkIndex("lrmwufitcheck_monthlyanalyticsview");

    const indexName = "lrmwufitcheck_nutritionday";
    const indexExists = await elasticClient.indices.exists({
      index: indexName,
    });

    if (!indexExists) {
      console.log(`Source index ${indexName} does not exist, skipping repair`);
      return;
    }

    // Use scroll API to get all document IDs
    const ids = await scrollAllDocuments(indexName);

    if (ids.length === 0) {
      console.log("No documents found to repair for monthlyanalyticsview");
      return;
    }

    console.log(
      `Found ${ids.length} documents to repair for monthlyanalyticsview`,
    );

    // Process in batches
    await processBatches(
      ids,
      monthlyAnalyticsViewAggregateData,
      "monthlyAnalyticsView",
    );

    console.log("Repair completed for monthlyanalyticsview");
  } catch (error) {
    console.error("monthlyAnalyticsViewRepair failed at ", new Date(), error);
    //**errorLog
  } finally {
    console.groupEnd();
  }
};

const dailyNutritionSummaryNotificationViewRepair = async () => {
  try {
    console.group(
      "dailyNutritionSummaryNotificationViewRepair started at ",
      new Date(),
    );
    await checkIndex("lrmwufitcheck_dailynutritionsummarynotificationview");

    const indexName = "lrmwufitcheck_nutritionday";
    const indexExists = await elasticClient.indices.exists({
      index: indexName,
    });

    if (!indexExists) {
      console.log(`Source index ${indexName} does not exist, skipping repair`);
      return;
    }

    // Use scroll API to get all document IDs
    const ids = await scrollAllDocuments(indexName);

    if (ids.length === 0) {
      console.log(
        "No documents found to repair for dailynutritionsummarynotificationview",
      );
      return;
    }

    console.log(
      `Found ${ids.length} documents to repair for dailynutritionsummarynotificationview`,
    );

    // Process in batches
    await processBatches(
      ids,
      dailyNutritionSummaryNotificationViewAggregateData,
      "dailyNutritionSummaryNotificationView",
    );

    console.log("Repair completed for dailynutritionsummarynotificationview");
  } catch (error) {
    console.error(
      "dailyNutritionSummaryNotificationViewRepair failed at ",
      new Date(),
      error,
    );
    //**errorLog
  } finally {
    console.groupEnd();
  }
};

const dailyMealReminderNotificationViewRepair = async () => {
  try {
    console.group(
      "dailyMealReminderNotificationViewRepair started at ",
      new Date(),
    );
    await checkIndex("lrmwufitcheck_dailymealremindernotificationview");

    const indexName = "lrmwufitcheck_user";
    const indexExists = await elasticClient.indices.exists({
      index: indexName,
    });

    if (!indexExists) {
      console.log(`Source index ${indexName} does not exist, skipping repair`);
      return;
    }

    // Use scroll API to get all document IDs
    const ids = await scrollAllDocuments(indexName);

    if (ids.length === 0) {
      console.log(
        "No documents found to repair for dailymealremindernotificationview",
      );
      return;
    }

    console.log(
      `Found ${ids.length} documents to repair for dailymealremindernotificationview`,
    );

    // Process in batches
    await processBatches(
      ids,
      dailyMealReminderNotificationViewAggregateData,
      "dailyMealReminderNotificationView",
    );

    console.log("Repair completed for dailymealremindernotificationview");
  } catch (error) {
    console.error(
      "dailyMealReminderNotificationViewRepair failed at ",
      new Date(),
      error,
    );
    //**errorLog
  } finally {
    console.groupEnd();
  }
};

// check index is exists and create if not exists
const checkIndex = async (index) => {
  const result = await elasticClient.indices.exists({ index });
  if (!result) {
    console.log("Index not found, creating index", index);
    await elasticClient.indices.create({ index });
    return;
  }
  console.log("Index found, skipping creation", index);
};

module.exports = { runAllRepair };
