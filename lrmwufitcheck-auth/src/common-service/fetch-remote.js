const ElasticIndexer = require("./service-indexer");
const { convertUserQueryToElasticQuery } = require("common");

// Cross-service runtime calls take a BARE object name (e.g. "Artwork").
// The "service:Object" form is a declarative-pattern convention only — passing
// it here would leak the colon into the Elasticsearch index name and trigger
// "Cross-cluster calls are not supported". Normalize defensively + warn the
// caller so the wrong shape doesn't silently corrupt the index name.
function _normalizeObjectName(name) {
  if (typeof name !== "string") return name;
  const idx = name.indexOf(":");
  if (idx < 0) return name;
  console.warn(
    `fetchRemote*: object name "${name}" looks like "service:Object". ` +
      `Cross-service runtime calls take the bare object name — using "${name.slice(idx + 1)}" instead.`,
  );
  return name.slice(idx + 1);
}

/**
 * Fetches a single remote object by MQuery (Mindbricks query format)
 * @param {String} objectName - The name of the remote data object
 * @param {Object} query - MQuery object (will be converted to Elasticsearch query)
 * @returns {Promise<Object|null>} The fetched object or null if not found
 */
async function fetchRemoteObjectByMQuery(objectName, query) {
  try {
    if (!objectName) {
      console.error("fetchRemoteObjectByMQuery: objectName is required");
      return null;
    }

    if (!query) {
      console.error("fetchRemoteObjectByMQuery: query is required");
      return null;
    }

    objectName = _normalizeObjectName(objectName);

    // Create indexer instance for the remote object
    const indexer = new ElasticIndexer(objectName);

    // Optimize: if the query is a simple { id: "..." } lookup, use getDataById
    // which fetches by Elasticsearch _id (exact match, no term query issues)
    const queryKeys = Object.keys(query);
    if (
      queryKeys.length === 1 &&
      queryKeys[0] === "id" &&
      typeof query.id === "string"
    ) {
      const result = await indexer.getDataById(query.id);
      return result || null;
    }

    // Convert MQuery to Elasticsearch query format
    const elasticQuery = convertUserQueryToElasticQuery(query);
    if (!elasticQuery) {
      console.error(
        "fetchRemoteObjectByMQuery: Failed to convert query to Elasticsearch format",
      );
      return null;
    }

    // getOne returns a single object or null
    const result = await indexer.getOne(elasticQuery);
    return result || null;
  } catch (err) {
    console.error(
      `fetchRemoteObjectByMQuery error for ${objectName}:`,
      err.message,
    );
    //**errorLog
    return null;
  }
}

/**
 * Fetches a single remote object by Elasticsearch query
 * @param {String} objectName - The name of the remote data object
 * @param {Object} elasticQuery - Elasticsearch query object
 * @returns {Promise<Object|null>} The fetched object or null if not found
 */
async function fetchRemoteObjectByElasticQuery(objectName, elasticQuery) {
  try {
    if (!objectName) {
      console.error("fetchRemoteObjectByElasticQuery: objectName is required");
      return null;
    }

    if (!elasticQuery) {
      console.error(
        "fetchRemoteObjectByElasticQuery: elasticQuery is required",
      );
      return null;
    }

    objectName = _normalizeObjectName(objectName);

    // Create indexer instance for the remote object
    const indexer = new ElasticIndexer(objectName);

    // getOne returns a single object or null
    const result = await indexer.getOne(elasticQuery);
    return result || null;
  } catch (err) {
    console.error(
      `fetchRemoteObjectByElasticQuery error for ${objectName}:`,
      err.message,
    );
    //**errorLog
    return null;
  }
}

/**
 * Fetches a list of remote objects by MQuery (Mindbricks query format)
 * @param {String} objectName - The name of the remote data object
 * @param {Object} query - MQuery object (will be converted to Elasticsearch query)
 * @param {Number} from - Starting index for pagination (default: 0)
 * @param {Number} size - Number of results to return (default: 100)
 * @param {Array} sort - Sort configuration (optional)
 * @returns {Promise<Array>} Array of fetched objects
 */
async function fetchRemoteListByMQuery(
  objectName,
  query,
  from = 0,
  size = 100,
  sort = null,
) {
  try {
    if (!objectName) {
      console.error("fetchRemoteListByMQuery: objectName is required");
      return [];
    }

    if (!query) {
      console.error("fetchRemoteListByMQuery: query is required");
      return [];
    }

    objectName = _normalizeObjectName(objectName);

    // Convert MQuery to Elasticsearch query format
    const elasticQuery = convertUserQueryToElasticQuery(query);
    if (!elasticQuery) {
      console.error(
        "fetchRemoteListByMQuery: Failed to convert query to Elasticsearch format",
      );
      return [];
    }

    // Create indexer instance for the remote object
    const indexer = new ElasticIndexer(objectName);

    // Fetch list using getDataByPage
    const result = await indexer.getDataByPage(
      from,
      size,
      elasticQuery,
      sort,
      false,
    );

    return result || [];
  } catch (err) {
    console.error(
      `fetchRemoteListByMQuery error for ${objectName}:`,
      err.message,
    );
    //**errorLog
    return [];
  }
}

/**
 * Fetches a list of remote objects by Elasticsearch query
 * @param {String} objectName - The name of the remote data object
 * @param {Object} elasticQuery - Elasticsearch query object
 * @param {Number} from - Starting index for pagination (default: 0)
 * @param {Number} size - Number of results to return (default: 100)
 * @param {Array} sort - Sort configuration (optional)
 * @returns {Promise<Array>} Array of fetched objects
 */
async function fetchRemoteListByElasticQuery(
  objectName,
  elasticQuery,
  from = 0,
  size = 100,
  sort = null,
) {
  try {
    if (!objectName) {
      console.error("fetchRemoteListByElasticQuery: objectName is required");
      return [];
    }

    if (!elasticQuery) {
      console.error("fetchRemoteListByElasticQuery: elasticQuery is required");
      return [];
    }

    objectName = _normalizeObjectName(objectName);

    // Create indexer instance for the remote object
    const indexer = new ElasticIndexer(objectName);

    // Fetch list using getDataByPage
    const result = await indexer.getDataByPage(
      from,
      size,
      elasticQuery,
      sort,
      false,
    );

    return result || [];
  } catch (err) {
    console.error(
      `fetchRemoteListByElasticQuery error for ${objectName}:`,
      err.message,
    );
    //**errorLog
    return [];
  }
}

module.exports = {
  fetchRemoteObjectByMQuery,
  fetchRemoteObjectByElasticQuery,
  fetchRemoteListByMQuery,
  fetchRemoteListByElasticQuery,
};
