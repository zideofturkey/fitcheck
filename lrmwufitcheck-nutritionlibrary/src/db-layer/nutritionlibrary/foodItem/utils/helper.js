const { ElasticIndexer, ServicePublisher } = require("serviceCommon");
const {
  FoodItemQueryCacheInvalidator,
} = require("../dbApiScripts/query-cache-classes");

const objectName = "foodItem";
const serviceCodename = "lrmwufitcheck-nutritionlibrary-service";

/**
 * Indexes data to Elasticsearch
 * @param {Object} data - The data to index
 * @param {Object} context - Optional context object with session and requestId
 */
const indexDataToElastic = async (data, context = null) => {
  const session = context?.session || null;
  const requestId = context?.requestId || null;
  const elasticIndexer = new ElasticIndexer(objectName, session, requestId);
  await elasticIndexer.indexData(data);
};

/**
 * Deletes data from Elasticsearch
 * @param {String} id - The ID of the record to delete
 * @param {Object} context - Optional context object with session and requestId
 */
const deleteDataFromElastic = async (id, context = null) => {
  const session = context?.session || null;
  const requestId = context?.requestId || null;
  const elasticIndexer = new ElasticIndexer(objectName, session, requestId);
  await elasticIndexer.deleteData(id);
};

/**
 * Builds old data values for update events
 * @param {Object} dataClause - The data clause with updated fields
 * @param {Object} oldDbData - The old database data
 * @returns {Object} Object with old values
 */
const getOldDataValues = (dataClause, oldDbData) => {
  const values = {};
  for (const propName of Object.keys(dataClause ?? {})) {
    values[propName] = oldDbData ? oldDbData[propName] : undefined;
  }
  return values;
};

/**
 * Builds new data values for update events
 * @param {Object} dataClause - The data clause with updated fields
 * @param {Object} newDbData - The new database data
 * @returns {Object} Object with new values
 */
const getNewDataValues = (dataClause, newDbData) => {
  const values = {};
  for (const propName of Object.keys(dataClause ?? {})) {
    values[propName] = newDbData ? newDbData[propName] : undefined;
  }
  return values;
};

/**
 * Raises a database event for create operations
 * @param {Object} data - The created data
 * @param {Object} context - Optional context object with session and requestId
 */
const raiseDbEventCreate = async (data, context = null) => {
  const session = context?.session || null;
  const requestId = context?.requestId || null;
  const dbEvent = `${serviceCodename}-dbevent-${objectName.toLowerCase()}-created`;

  try {
    const _publisher = new ServicePublisher(dbEvent, data, session, requestId);
    await _publisher.publish();
  } catch (err) {
    //**errorLog
    console.log("DbEvent cant be published", dbEvent, err);
  }
};

/**
 * Raises a database event for update operations
 * @param {Object} newData - The updated data
 * @param {Object} oldData - The old data (before update)
 * @param {Object} dataClause - The data clause with updated fields
 * @param {Object} context - Optional context object with session and requestId
 */
const raiseDbEventUpdate = async (
  newData,
  oldData,
  dataClause,
  context = null,
) => {
  const session = context?.session || null;
  const requestId = context?.requestId || null;
  const dbEvent = `${serviceCodename}-dbevent-${objectName.toLowerCase()}-updated`;

  const eventData = {
    old_foodItem: oldData,
    foodItem: newData,
    oldDataValues: getOldDataValues(dataClause, oldData),
    newDataValues: getNewDataValues(dataClause, newData),
  };

  try {
    const _publisher = new ServicePublisher(
      dbEvent,
      eventData,
      session,
      requestId,
    );
    await _publisher.publish();
  } catch (err) {
    //**errorLog
    console.log("DbEvent cant be published", dbEvent, err);
  }
};

/**
 * Raises a database event for delete operations
 * @param {Object} data - The deleted data
 * @param {Object} context - Optional context object with session and requestId
 */
const raiseDbEventDelete = async (data, context = null) => {
  const session = context?.session || null;
  const requestId = context?.requestId || null;
  const dbEvent = `${serviceCodename}-dbevent-${objectName.toLowerCase()}-deleted`;

  try {
    const _publisher = new ServicePublisher(dbEvent, data, session, requestId);
    await _publisher.publish();
  } catch (err) {
    //**errorLog
    console.log("DbEvent cant be published", dbEvent, err);
  }
};

/**
 * Writes an entity into the entity cache (Redis). Internal helper used by
 * createEntityCache / updateEntityCache below. No-op when entity caching is
 * disabled for this data object.
 * @param {Object} data - The entity row (must include id)
 */
const _saveEntityToCache = async (data) => {
  // entity caching is disabled for foodItem — no-op
};

/**
 * Adds a freshly-created entity to the entity cache. Use AFTER a raw create
 * outside the managed CRUD path. No-op when entity caching is disabled.
 * @param {Object} data - The created entity row (must include id)
 */
const createEntityCache = async (data) => {
  await _saveEntityToCache(data);
};

/**
 * Reads an entity directly from the entity cache (Redis). Returns null on a
 * miss or when entity caching is disabled — this helper does NOT fall through
 * to the database. For the typical "cache first, DB on miss, populate cache
 * on miss" pattern, use getCachedFoodItemById instead.
 * @param {String} id - The id of the entity to fetch from cache
 * @returns {Promise<Object|null>} Cached entity row, or null on miss
 */
const getEntityFromCache = async (id) => {
  // entity caching is disabled for foodItem
  return null;
};

/**
 * Refreshes an existing entity in the entity cache after an update. Use AFTER
 * any raw update outside the managed CRUD path. No-op when entity caching is
 * disabled.
 * @param {Object} data - The updated entity row (must include id)
 */
const updateEntityCache = async (data) => {
  await _saveEntityToCache(data);
};

/**
 * Removes an entity from the entity cache (Redis) when entity caching is
 * enabled for this data object. No-op when entity caching is disabled.
 * Use AFTER any raw DB delete outside the managed CRUD path.
 * @param {String} id - The id of the entity to evict
 */
const deleteEntityCache = async (id) => {
  // entity caching is disabled for foodItem — no-op
};

/**
 * Invalidates query-cache entries for this data object. The query cache keys
 * each list-API result by a hash of (cluster props + query params), so a single
 * write can affect many cached entries. We invalidate the clusters that
 * matched the row's NEW state and (if provided) its OLD state — the latter
 * matters when an update moves the row out of one cluster and into another.
 *
 * Use AFTER any raw DB write (create/update/delete) outside the managed CRUD
 * path. The managed CRUD scripts already call this themselves; this helper
 * exists so LIB writers (update<Object>ById, custom direct writes from
 * FunctionCallActions, etc.) don't leave stale list reads behind.
 *
 * @param {Object} newData - Row state after the write (or before delete). null is allowed for unknown.
 * @param {Object} [oldData] - Row state before the write, when known
 */
const invalidateQueryCache = async (newData, oldData = null) => {
  try {
    const invalidator = new FoodItemQueryCacheInvalidator();
    if (newData) await invalidator.invalidateCache(newData);
    if (oldData) await invalidator.invalidateCache(oldData);
  } catch (err) {
    //**errorLog
    console.error(
      `QueryCache invalidate failed for ${objectName}:`,
      err.message,
    );
  }
};

module.exports = {
  indexDataToElastic,
  deleteDataFromElastic,
  raiseDbEventCreate,
  raiseDbEventUpdate,
  raiseDbEventDelete,
  getOldDataValues,
  getNewDataValues,
  createEntityCache,
  updateEntityCache,
  deleteEntityCache,
  getEntityFromCache,
  invalidateQueryCache,
};
