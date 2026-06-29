/**
 * Elastic Index Sync & Rebuild Utilities
 *
 * Features:
 * - Dynamic chunk sizing for optimal performance
 * - Single generic rebuild function
 * - API-accessible rebuild endpoint
 * - Progress tracking and logging
 */

const {
  getMacroTargetById,
  getIdListOfMacroTargetByField,
  countMacroTarget,
  getFoodItemById,
  getIdListOfFoodItemByField,
  countFoodItem,
  getPresetMealById,
  getIdListOfPresetMealByField,
  countPresetMeal,
  getPresetLineById,
  getIdListOfPresetLineByField,
  countPresetLine,
} = require("dbLayer");

const { ElasticIndexer } = require("serviceCommon");
const { hexaLogger, isElasticAvailable } = require("common");
const { getElasticMapping, ELASTIC_MAPPINGS } = require("models");

// ============================================
// DYNAMIC CHUNK SIZE CONFIGURATION
// ============================================
const TARGET_BULK_SIZE_MB = 7; // Target 7MB per bulk request (ES sweet spot)
const MIN_CHUNK_SIZE = 100;
const MAX_CHUNK_SIZE = 5000;
const INITIAL_CHUNK_SIZE = 500;

/**
 * Calculate optimal chunk size based on sample data
 * @param {Array} sampleData - Sample records to measure
 * @returns {number} Optimal chunk size
 */
const calculateOptimalChunkSize = (sampleData) => {
  if (!sampleData || sampleData.length === 0) return INITIAL_CHUNK_SIZE;

  const sampleSize = Buffer.byteLength(JSON.stringify(sampleData), "utf8");
  const avgDocSize = sampleSize / sampleData.length;
  const targetBytes = TARGET_BULK_SIZE_MB * 1024 * 1024;
  const optimalSize = Math.floor(targetBytes / avgDocSize);

  return Math.max(MIN_CHUNK_SIZE, Math.min(MAX_CHUNK_SIZE, optimalSize));
};

// ============================================
// DATAOBJECT FUNCTION REGISTRY
// ============================================

const dataObjectRegistry = {
  macroTarget: {
    name: "macroTarget",
    modelName: "MacroTarget",
    pluralName: "macroTargets",
    getById: getMacroTargetById,
    getIdList: getIdListOfMacroTargetByField,
    count: countMacroTarget,
  },
  foodItem: {
    name: "foodItem",
    modelName: "FoodItem",
    pluralName: "foodItems",
    getById: getFoodItemById,
    getIdList: getIdListOfFoodItemByField,
    count: countFoodItem,
  },
  presetMeal: {
    name: "presetMeal",
    modelName: "PresetMeal",
    pluralName: "presetMeals",
    getById: getPresetMealById,
    getIdList: getIdListOfPresetMealByField,
    count: countPresetMeal,
  },
  presetLine: {
    name: "presetLine",
    modelName: "PresetLine",
    pluralName: "presetLines",
    getById: getPresetLineById,
    getIdList: getIdListOfPresetLineByField,
    count: countPresetLine,
  },
};

// Create lowercase lookup map
const registryByLowerName = {};
for (const [key, value] of Object.entries(dataObjectRegistry)) {
  registryByLowerName[key.toLowerCase()] = value;
  registryByLowerName[value.modelName.toLowerCase()] = value;
}

// ============================================
// GENERIC REBUILD FUNCTION
// ============================================

/**
 * Rebuild Elasticsearch index for any DataObject
 * Uses dynamic chunk sizing for optimal performance
 *
 * @param {Object} params
 * @param {string} params.dataObjectName - Name of the index/DataObject
 * @param {Function} params.getById - Function to fetch records by ID array
 * @param {Function} params.getIdList - Function to get all record IDs
 * @param {Function} params.count - Function to count records (optional)
 * @param {Object} options
 * @param {boolean} options.deleteOldIndex - Delete old index before rebuild (default: true)
 * @param {Function} options.onProgress - Progress callback (indexed, total, percent)
 * @returns {Object} { success, indexed, errors, durationMs, avgDocSize, optimalChunkSize }
 */
const rebuildIndex = async (params, options = {}) => {
  const { dataObjectName, getById, getIdList, count } = params;

  const { deleteOldIndex = true, onProgress = null } = options;

  const startTime = Date.now();
  const stats = {
    dataObject: dataObjectName,
    success: false,
    indexed: 0,
    errors: 0,
    batches: 0,
    totalRecords: 0,
    avgDocSize: 0,
    optimalChunkSize: INITIAL_CHUNK_SIZE,
    errorDetails: [],
  };

  console.log(`[REBUILD] Starting index rebuild for ${dataObjectName}...`);

  try {
    // Get mapping for this data object
    const mapping = getElasticMapping(dataObjectName);
    if (mapping) {
      // Register mapping with ServiceIndexer so it's available when creating new instances
      ElasticIndexer.addMapping(dataObjectName, mapping);
      console.log(`[REBUILD] Mapping loaded for ${dataObjectName}`);
    } else {
      console.warn(
        `[REBUILD] No mapping found for ${dataObjectName}, using dynamic mapping`,
      );
    }

    // Create indexer with mapping
    const indexer = new ElasticIndexer(dataObjectName, { isSilent: false });

    // Get total count for progress tracking
    if (count) {
      stats.totalRecords = (await count({ isActive: true })) || 0;
    }
    console.log(`[REBUILD] Total records to index: ${stats.totalRecords}`);

    // Delete old index if requested
    if (deleteOldIndex) {
      try {
        await indexer.deleteIndex();
        console.log("[REBUILD] Old index deleted");
      } catch (err) {
        console.log("[REBUILD] No existing index to delete");
      }

      // Recreate index with mapping
      await indexer.createIndex();

      // Explicitly apply mapping if available (ensures correct field types)
      if (mapping) {
        await indexer.updateMapping(mapping);
        console.log("[REBUILD] Mapping applied to index");
      }
      console.log("[REBUILD] New index created with mapping");
    }

    // Get all IDs
    const idList = (await getIdList()) ?? [];

    if (idList.length === 0) {
      console.log("[REBUILD] No records to index");
      stats.success = true;
      stats.durationMs = Date.now() - startTime;
      return stats;
    }

    // Update total if count wasn't available
    if (!stats.totalRecords) {
      stats.totalRecords = idList.length;
    }

    let chunkSize = INITIAL_CHUNK_SIZE;
    let offset = 0;

    while (offset < idList.length) {
      // Get chunk of IDs
      const chunkIds = idList.slice(offset, offset + chunkSize);

      // Fetch data for chunk
      const dataList = await getById(chunkIds);

      if (dataList.length === 0) {
        offset += chunkSize;
        continue;
      }

      // Calculate optimal chunk size after first batch
      if (stats.batches === 0) {
        const oldChunkSize = chunkSize;
        chunkSize = calculateOptimalChunkSize(dataList);
        stats.optimalChunkSize = chunkSize;

        const batchSize = Buffer.byteLength(JSON.stringify(dataList), "utf8");
        stats.avgDocSize = Math.round(batchSize / dataList.length);

        console.log(
          `[REBUILD] Avg doc size: ${(stats.avgDocSize / 1024).toFixed(2)}KB, optimal chunk: ${chunkSize} (was ${oldChunkSize})`,
        );
      }

      // Bulk index
      try {
        await indexer.indexBulkData(dataList);
        stats.indexed += dataList.length;
      } catch (err) {
        stats.errors += dataList.length;
        if (stats.errorDetails.length < 10) {
          stats.errorDetails.push({
            offset,
            count: dataList.length,
            error: err.message,
          });
        }
        console.error(
          `[REBUILD] Batch error at offset ${offset}:`,
          err.message,
        );
      }

      stats.batches++;
      offset += chunkSize;

      // Progress callback
      if (onProgress) {
        const percent = Math.round((stats.indexed / stats.totalRecords) * 100);
        onProgress(stats.indexed, stats.totalRecords, percent);
      }

      // Log progress every 10 batches
      if (stats.batches % 10 === 0) {
        const percent = Math.round((stats.indexed / stats.totalRecords) * 100);
        console.log(
          `[REBUILD] Progress: ${stats.indexed}/${stats.totalRecords} (${percent}%)`,
        );
      }
    }

    // Clear Redis cache
    await indexer.deleteRedisCache();

    stats.success = stats.errors === 0;
    stats.durationMs = Date.now() - startTime;
    stats.docsPerSecond = Math.round(stats.indexed / (stats.durationMs / 1000));

    console.log(
      `[REBUILD] Completed ${dataObjectName}: ${stats.indexed} docs in ${stats.durationMs}ms (${stats.docsPerSecond} docs/sec)`,
    );

    return stats;
  } catch (err) {
    console.error("[REBUILD] Fatal error:", err);
    stats.error = err.message;
    stats.durationMs = Date.now() - startTime;

    hexaLogger.insertError(
      "ElasticRebuildError",
      { dataObject: dataObjectName },
      "syncElasticData->rebuildIndex",
      err,
    );

    return stats;
  }
};

// ============================================
// PUBLIC API FUNCTIONS
// ============================================

/**
 * Rebuild index for a specific DataObject by name
 *
 * @param {string} dataObjectName - Name of the DataObject (case-insensitive)
 * @param {Object} options - Rebuild options
 * @returns {Object} Rebuild result
 */
const rebuildIndexByName = async (dataObjectName, options = {}) => {
  const normalizedName = dataObjectName.toLowerCase();
  const registry = registryByLowerName[normalizedName];

  if (!registry) {
    const availableObjects = Object.keys(dataObjectRegistry);
    return {
      success: false,
      error: `Unknown DataObject: ${dataObjectName}`,
      availableObjects,
    };
  }

  return rebuildIndex(
    {
      dataObjectName: registry.name,
      getById: registry.getById,
      getIdList: registry.getIdList,
      count: registry.count,
    },
    options,
  );
};

/**
 * Sync index (no deletion) for a specific DataObject by name
 *
 * @param {string} dataObjectName - Name of the DataObject (case-insensitive)
 * @returns {Object} Sync result
 */
const syncIndexByName = async (dataObjectName) => {
  return rebuildIndexByName(dataObjectName, { deleteOldIndex: false });
};

/**
 * Get list of available DataObjects for rebuild
 */
const getAvailableDataObjects = () => {
  return Object.values(dataObjectRegistry).map((r) => ({
    name: r.name,
    modelName: r.modelName,
    pluralName: r.pluralName,
  }));
};

/**
 * Sync all Elasticsearch indexes (without deleting)
 * Used for initial data sync or repair
 */
const syncElasticIndexData = async () => {
  if (!isElasticAvailable()) {
    console.log("[SYNC] Elasticsearch not available — skipping sync");
    return {
      success: true,
      objects: [],
      totalIndexed: 0,
      totalErrors: 0,
      durationMs: 0,
    };
  }

  const startTime = Date.now();
  const results = {
    success: true,
    objects: [],
    totalIndexed: 0,
    totalErrors: 0,
  };

  console.log("═".repeat(60));
  console.log("[SYNC] Starting full Elasticsearch sync...");
  console.log("═".repeat(60));

  for (const [name, registry] of Object.entries(dataObjectRegistry)) {
    try {
      console.log(`[SYNC] Syncing ${registry.modelName}...`);

      const result = await rebuildIndex(
        {
          dataObjectName: registry.name,
          getById: registry.getById,
          getIdList: registry.getIdList,
          count: registry.count,
        },
        { deleteOldIndex: false },
      );

      results.objects.push({
        name: registry.modelName,
        ...result,
      });
      results.totalIndexed += result.indexed || 0;
      results.totalErrors += result.errors || 0;

      if (!result.success) {
        results.success = false;
      }

      console.log(
        `[SYNC] ${registry.modelName}: ${result.indexed} indexed, ${result.errors} errors`,
      );
    } catch (err) {
      console.error(`[SYNC] Error syncing ${registry.modelName}:`, err.message);
      results.objects.push({
        name: registry.modelName,
        success: false,
        error: err.message,
      });
      results.success = false;

      hexaLogger.insertError(
        "ElasticSyncError",
        { dataObject: registry.modelName },
        "syncElasticData->syncElasticIndexData",
        err,
      );
    }
  }

  results.durationMs = Date.now() - startTime;

  console.log("═".repeat(60));
  console.log(
    `[SYNC] Completed: ${results.totalIndexed} total indexed, ${results.totalErrors} errors in ${results.durationMs}ms`,
  );
  console.log("═".repeat(60));

  return results;
};

/**
 * Rebuild all Elasticsearch indexes (with deletion)
 */
const rebuildAllIndexes = async () => {
  if (!isElasticAvailable()) {
    console.log("[REBUILD-ALL] Elasticsearch not available — skipping rebuild");
    return {
      success: true,
      objects: [],
      totalIndexed: 0,
      totalErrors: 0,
      durationMs: 0,
    };
  }

  const startTime = Date.now();
  const results = {
    success: true,
    objects: [],
    totalIndexed: 0,
    totalErrors: 0,
  };

  console.log("═".repeat(60));
  console.log("[REBUILD-ALL] Starting full Elasticsearch rebuild...");
  console.log("═".repeat(60));

  for (const [name, registry] of Object.entries(dataObjectRegistry)) {
    try {
      console.log(`[REBUILD-ALL] Rebuilding ${registry.modelName}...`);

      const result = await rebuildIndex(
        {
          dataObjectName: registry.name,
          getById: registry.getById,
          getIdList: registry.getIdList,
          count: registry.count,
        },
        { deleteOldIndex: true },
      );

      results.objects.push({
        name: registry.modelName,
        ...result,
      });
      results.totalIndexed += result.indexed || 0;
      results.totalErrors += result.errors || 0;

      if (!result.success) {
        results.success = false;
      }

      console.log(
        `[REBUILD-ALL] ${registry.modelName}: ${result.indexed} indexed, ${result.errors} errors`,
      );
    } catch (err) {
      console.error(
        `[REBUILD-ALL] Error rebuilding ${registry.modelName}:`,
        err.message,
      );
      results.objects.push({
        name: registry.modelName,
        success: false,
        error: err.message,
      });
      results.success = false;

      hexaLogger.insertError(
        "ElasticRebuildError",
        { dataObject: registry.modelName },
        "syncElasticData->rebuildAllIndexes",
        err,
      );
    }
  }

  results.durationMs = Date.now() - startTime;

  console.log("═".repeat(60));
  console.log(
    `[REBUILD-ALL] Completed: ${results.totalIndexed} total indexed, ${results.totalErrors} errors in ${results.durationMs}ms`,
  );
  console.log("═".repeat(60));

  return results;
};

// ============================================
// SMART STARTUP SYNC
// ============================================

/**
 * Check if an Elasticsearch index is empty (zero documents)
 * @param {string} indexName - The DataObject name (will be lowercased for ES)
 * @returns {boolean} true if empty or missing, false if has data
 */
const isIndexEmpty = async (indexName) => {
  try {
    const indexer = new ElasticIndexer(indexName, { isSilent: true });
    const exists = await indexer.checkIndex();
    if (!exists) return true;

    const count = await indexer.getCount({ match_all: {} });
    return !count || count === 0;
  } catch (err) {
    console.log(`[SMART-SYNC] Error checking index ${indexName}:`, err.message);
    return true; // Assume empty on error — safer to sync
  }
};

/**
 * Smart startup sync: only syncs indexes that are empty.
 * Skips indexes that already have data to avoid unnecessary work.
 *
 * @returns {Object} { synced: [...], skipped: [...], errors: [...], durationMs }
 */
const smartSyncOnStartup = async () => {
  if (!isElasticAvailable()) {
    console.log(
      "[SMART-SYNC] Elasticsearch not available — skipping startup sync",
    );
    return { synced: [], skipped: [], errors: [], durationMs: 0 };
  }

  const startTime = Date.now();
  const results = {
    synced: [],
    skipped: [],
    errors: [],
  };

  console.log("═".repeat(60));
  console.log("[SMART-SYNC] Checking Elasticsearch indexes on startup...");
  console.log("═".repeat(60));

  for (const [name, registry] of Object.entries(dataObjectRegistry)) {
    try {
      const empty = await isIndexEmpty(registry.name);

      if (!empty) {
        results.skipped.push(registry.modelName);
        continue;
      }

      console.log(
        `[SMART-SYNC] Index '${registry.modelName}' is empty — syncing from database...`,
      );

      const result = await rebuildIndex(
        {
          dataObjectName: registry.name,
          getById: registry.getById,
          getIdList: registry.getIdList,
          count: registry.count,
        },
        { deleteOldIndex: false },
      );

      if (result.success) {
        results.synced.push({
          name: registry.modelName,
          indexed: result.indexed,
          durationMs: result.durationMs,
        });
        console.log(
          `[SMART-SYNC] ${registry.modelName}: ${result.indexed} docs synced in ${result.durationMs}ms`,
        );
      } else {
        results.errors.push({ name: registry.modelName, error: result.error });
        console.error(
          `[SMART-SYNC] ${registry.modelName}: sync failed — ${result.error}`,
        );
      }
    } catch (err) {
      results.errors.push({ name: registry.modelName, error: err.message });
      console.error(
        `[SMART-SYNC] Error syncing ${registry.modelName}:`,
        err.message,
      );
      hexaLogger.insertError(
        "SmartSyncError",
        { dataObject: registry.modelName },
        "syncElasticData->smartSyncOnStartup",
        err,
      );
    }
  }

  results.durationMs = Date.now() - startTime;

  console.log("═".repeat(60));
  console.log(
    `[SMART-SYNC] Done in ${results.durationMs}ms — synced: ${results.synced.length}, skipped: ${results.skipped.length}, errors: ${results.errors.length}`,
  );
  if (results.skipped.length) {
    console.log(
      `[SMART-SYNC] Skipped (already have data): ${results.skipped.join(", ")}`,
    );
  }
  console.log("═".repeat(60));

  return results;
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Main functions
  syncElasticIndexData,
  rebuildAllIndexes,
  smartSyncOnStartup,

  // By-name functions for API
  rebuildIndexByName,
  syncIndexByName,
  getAvailableDataObjects,

  // Generic function for custom usage
  rebuildIndex,

  // Registry for advanced usage
  dataObjectRegistry,

  // Configuration
  CHUNK_CONFIG: {
    TARGET_BULK_SIZE_MB,
    MIN_CHUNK_SIZE,
    MAX_CHUNK_SIZE,
    INITIAL_CHUNK_SIZE,
  },
};
