const { Client } = require("@elastic/elasticsearch");
const elasticUri = process.env.ELASTIC_URI || "http://localhost:9200";
const elasticUser = process.env.ELASTIC_USER || "elastic";
const elasticPwd = process.env.ELASTIC_PWD || "zci+imLCfkbSC=RxLHjH";

const elasticClient = new Client({
  node: elasticUri,
  requestTimeout: 10000,
  auth: { username: elasticUser, password: elasticPwd },
  ssl: {
    ca: process.env.ELASTIC_CERT,
    rejectUnauthorized: false,
  },
});

const getAllIndices = async function () {
  return await elasticClient.cat.indices({ format: "json" });
};

const checkIndexExists = async function (indexName) {
  return await elasticClient.indices.exists({
    index: indexName,
  });
};

const createIndex = async function (indexName) {
  return await elasticClient.indices.create({
    index: indexName,
  });
};

const checkIndexMapping = async function (indexName) {
  return await elasticClient.indices.getMapping({
    index: indexName,
  });
};

const putMapping = async function (indexName, mapping) {
  return await elasticClient.indices.putMapping({
    index: indexName,
    body: mapping,
  });
};

const search = async function (indexName, searchQuery, page = 1, limit = 100) {
  return await elasticClient.search({
    index: indexName,
    body: searchQuery,
    from: (page - 1) * limit,
    size: limit,
  });
};

const multiSearch = async function (searchQuery, limit = 100) {
  return await elasticClient.search({
    body: searchQuery,
    size: limit,
  });
};

/**
 * Scroll through all documents in an index using Elasticsearch Scroll API
 * Handles large datasets that exceed the default 10,000 document limit
 *
 * @param {string} indexName - The index to scroll through
 * @param {object} options - Scroll options
 * @param {object} options.query - Elasticsearch query (default: match_all)
 * @param {string[]} options._source - Fields to return (default: all fields)
 * @param {number} options.batchSize - Documents per scroll batch (default: 1000)
 * @param {string} options.scrollTimeout - Scroll context timeout (default: "2m")
 * @param {object} options.sort - Sort configuration (optional)
 * @returns {Promise<object[]>} - Array of document _source objects
 */
const scrollSearch = async function (indexName, options = {}) {
  const {
    query = { match_all: {} },
    _source = null,
    batchSize = 1000,
    scrollTimeout = "2m",
    sort = null,
  } = options;

  const allDocuments = [];

  // Build search body
  const searchBody = { query };
  if (_source) searchBody._source = _source;
  if (sort) searchBody.sort = sort;

  // Initial search with scroll
  let response = await elasticClient.search({
    index: indexName,
    scroll: scrollTimeout,
    size: batchSize,
    body: searchBody,
  });

  let scrollId = response._scroll_id;
  let hits = response.hits.hits;

  // Collect documents from all batches
  while (hits && hits.length > 0) {
    allDocuments.push(
      ...hits.map((hit) => ({
        _id: hit._id,
        _source: hit._source,
      })),
    );

    // Continue scrolling
    response = await elasticClient.scroll({
      scroll_id: scrollId,
      scroll: scrollTimeout,
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

  return allDocuments;
};

/**
 * Scroll and process documents in batches with a callback function
 * Useful for memory-efficient processing of large datasets
 *
 * @param {string} indexName - The index to scroll through
 * @param {object} options - Scroll options (same as scrollSearch)
 * @param {Function} processBatch - Async callback function to process each batch
 * @returns {Promise<{processed: number, batches: number, errors: number}>} - Processing statistics
 */
const scrollAndProcess = async function (
  indexName,
  options = {},
  processBatch,
) {
  const {
    query = { match_all: {} },
    _source = null,
    batchSize = 1000,
    scrollTimeout = "2m",
    sort = null,
  } = options;

  const stats = { processed: 0, batches: 0, errors: 0 };

  // Build search body
  const searchBody = { query };
  if (_source) searchBody._source = _source;
  if (sort) searchBody.sort = sort;

  // Initial search with scroll
  let response = await elasticClient.search({
    index: indexName,
    scroll: scrollTimeout,
    size: batchSize,
    body: searchBody,
  });

  let scrollId = response._scroll_id;
  let hits = response.hits.hits;

  // Process documents batch by batch
  while (hits && hits.length > 0) {
    const documents = hits.map((hit) => ({
      _id: hit._id,
      _source: hit._source,
    }));

    try {
      await processBatch(documents);
      stats.processed += documents.length;
      stats.batches++;
    } catch (err) {
      console.error(
        `Error processing batch ${stats.batches + 1}:`,
        err.message,
      );
      stats.errors++;
    }

    // Continue scrolling
    response = await elasticClient.scroll({
      scroll_id: scrollId,
      scroll: scrollTimeout,
    });

    scrollId = response._scroll_id;
    hits = response.hits.hits;
  }

  // Clear scroll context
  if (scrollId) {
    try {
      await elasticClient.clearScroll({ scroll_id: scrollId });
    } catch (err) {
      console.warn("Failed to clear scroll context:", err.message);
    }
  }

  return stats;
};

const count = async function (indexName, searchQuery) {
  return await elasticClient.count({
    index: indexName,
    body: searchQuery,
  });
};

const deleteIndex = async function (indexName) {
  return await elasticClient.indices.delete({
    index: indexName,
  });
};

const getDocumentById = async function (indexName, id) {
  return await elasticClient.get({
    index: indexName,
    id: id,
  });
};

const createDocument = async function (indexName, body, id) {
  return await elasticClient.index({
    index: indexName,
    body: body,
    id: id,
  });
};

const deleteDocument = async function (indexName, id) {
  return await elasticClient.delete({
    index: indexName,
    id: id,
  });
};

const updateDocument = async function (indexName, id, body) {
  return await elasticClient.update({
    index: indexName,
    id: id,
    body: body,
  });
};

const bulk = async function (indexName, body) {
  return await elasticClient.bulk({
    index: indexName,
    body: body,
  });
};

/**
 * Build Elasticsearch bool query from filter objects
 *
 * Supported operators:
 * - eq: Exact match (term query)
 * - noteq: Not equal (must_not term)
 * - match: Full-text search (match query)
 * - in: Match any of multiple values (terms query) - use filter.values array
 * - range: Between two values - use filter.values [min, max]
 * - gt: Greater than - use filter.value
 * - gte: Greater than or equal - use filter.value
 * - lt: Less than - use filter.value
 * - lte: Less than or equal - use filter.value
 * - exists: Field exists
 * - missing: Field does not exist
 * - prefix: Starts with
 * - wildcard: Wildcard pattern (* and ? supported)
 * - wildcard_contains: Contains text (auto-wraps with *)
 * - regexp: Regular expression
 * - match_phrase: Exact phrase match
 * - match_phrase_prefix: Phrase prefix match
 *
 * @param {object} filters - Filter object { fieldName: { operator, value/values } }
 * @returns {object} - Elasticsearch bool query
 */
const queryBuilder = function (filters) {
  let query = {
    bool: {
      must: [],
      must_not: [],
      filter: [],
      should: [],
    },
  };

  Object.keys(filters).forEach((key) => {
    if (filters[key]) {
      const filter = filters[key];
      const operator = filter.operator ? filter.operator.toLowerCase() : null;
      const value = filter.value;
      const values = filter.values;

      if (!operator) {
        return;
      }

      switch (operator) {
        // Exact match (for keyword fields)
        case "eq":
          query.bool.filter.push({ term: { [key]: value } });
          break;

        // Not equal
        case "noteq":
          query.bool.must_not.push({ term: { [key]: value } });
          break;

        // Full-text search (for text fields)
        case "match":
          query.bool.must.push({ match: { [key]: value } });
          break;

        // Match any of multiple values
        case "in":
          if (values && Array.isArray(values) && values.length > 0) {
            query.bool.filter.push({ terms: { [key]: values } });
          }
          break;

        // Not in multiple values
        case "notin":
          if (values && Array.isArray(values) && values.length > 0) {
            query.bool.must_not.push({ terms: { [key]: values } });
          }
          break;

        // Range between two values [min, max]
        case "range":
          if (values && values.length === 2) {
            query.bool.filter.push({
              range: {
                [key]: { gte: values[0], lte: values[1] },
              },
            });
          }
          break;

        // Greater than
        case "gt":
          query.bool.filter.push({
            range: { [key]: { gt: value } },
          });
          break;

        // Greater than or equal
        case "gte":
          query.bool.filter.push({
            range: { [key]: { gte: value } },
          });
          break;

        // Less than
        case "lt":
          query.bool.filter.push({
            range: { [key]: { lt: value } },
          });
          break;

        // Less than or equal
        case "lte":
          query.bool.filter.push({
            range: { [key]: { lte: value } },
          });
          break;

        // Field exists
        case "exists":
          query.bool.filter.push({ exists: { field: key } });
          break;

        // Field does not exist
        case "missing":
          query.bool.must_not.push({ exists: { field: key } });
          break;

        // Starts with
        case "prefix":
          query.bool.filter.push({ prefix: { [key]: value } });
          break;

        // Wildcard pattern (user provides full pattern with * and ?)
        case "wildcard":
          query.bool.filter.push({ wildcard: { [key]: value } });
          break;

        // Contains text (auto-wraps with *)
        case "wildcard_contains":
          query.bool.filter.push({ wildcard: { [key]: `*${value}*` } });
          break;

        // Regular expression
        case "regexp":
          query.bool.filter.push({ regexp: { [key]: value } });
          break;

        // Exact phrase match
        case "match_phrase":
          query.bool.filter.push({ match_phrase: { [key]: value } });
          break;

        // Phrase prefix match
        case "match_phrase_prefix":
          query.bool.filter.push({ match_phrase_prefix: { [key]: value } });
          break;

        default:
          console.error("Geçersiz operatör:", operator);
      }
    }
  });

  return query;
};

const aggBuilder = function (aggs) {
  let queryAggs = {};

  for (const key of aggs) {
    queryAggs[key] = {
      terms: {
        field: key,
        size: 10000,
      },
    };
  }
  return queryAggs;
};

/**
 * Add full-text search to an existing query
 *
 * @param {object} query - Existing bool query from queryBuilder
 * @param {string} text - Search text
 * @param {object} options - Search options
 * @param {string[]} options.fields - Fields to search in (default: ["*"])
 * @param {number} options.fuzziness - Fuzziness level ("AUTO", 0, 1, 2) (default: "AUTO")
 * @param {number} options.boost - Boost for exact matches (default: 2)
 * @returns {object} - Modified query with search clauses
 */
const searchBuilder = function (query, text, options = {}) {
  if (!text) return query;

  const { fields = ["*"], fuzziness = "AUTO", boost = 2 } = options;

  // Multi-match across specified fields (or all fields)
  query.bool.should.push({
    multi_match: {
      query: text,
      fields: fields,
      type: "best_fields",
      operator: "AND",
    },
  });

  // Fuzzy match for typo tolerance
  query.bool.should.push({
    multi_match: {
      query: text,
      fields: fields,
      fuzziness: fuzziness,
      prefix_length: 2,
    },
  });

  // Exact phrase match with higher boost
  query.bool.should.push({
    multi_match: {
      query: text,
      fields: fields,
      type: "phrase",
      boost: boost,
    },
  });

  query.bool.should.push({
    multi_match: {
      query: text,
      fields: fields,
      type: "phrase_prefix",
    },
  });

  // Only apply if text is at least 3 characters to avoid performance issues
  if (text.length >= 3) {
    query.bool.should.push({
      query_string: {
        query: `*${text}*`,
        fields: fields,
        analyze_wildcard: true,
        default_operator: "AND",
      },
    });
  }

  // Ensure at least one should clause matches when search text is provided
  if (!query.bool.minimum_should_match) {
    query.bool.minimum_should_match = 1;
  }

  return query;
};

const negativeParams = ["page", "limit", "sortBy", "sortOrder", "q"];
const filterBuilder = function (query) {
  let filters = {};
  Object.keys(query).forEach((key) => {
    if (!negativeParams.includes(key)) {
      filters[key] = {
        operator: "eq",
        value: query[key],
      };
    }
  });

  return filters;
};

const sortAndFilterTypes = [
  "keyword",
  "date",
  "long",
  "integer",
  "short",
  "byte",
  "double",
  "float",
  "boolean",
  "ip",
  "geo-point",
];

const fieldBuilder = function (properties, parent = null) {
  if (!properties) {
    return [];
  }

  let fields = [];
  Object.keys(properties).forEach((key) => {
    const type = properties[key].type;
    if (sortAndFilterTypes.includes(type)) {
      fields.push(parent != null ? `${parent}.${key}` : key);
    }

    if (properties[key].properties) {
      fields.push(
        ...fieldBuilder(
          properties[key].properties,
          parent != null ? `${parent}.${key}` : key,
        ),
      );
    }
  });

  return fields;
};

const multiSearchBuilder = function (settings, text) {
  const shouldQueries = settings.map((item) => ({
    multi_match: {
      query: text,
      fields: item.fields,
      boost: item.boost,
    },
  }));

  const indices_boost = [];
  settings.forEach((item) => {
    indices_boost.push({
      [`${item.index}`]: item.boost,
    });
  });
  return {
    query: {
      bool: {
        should: shouldQueries,
      },
    },
    indices_boost: indices_boost,
  };
};

module.exports = {
  elasticClient,
  getAllIndices,
  search,
  multiSearch,
  scrollSearch,
  scrollAndProcess,
  count,
  putMapping,
  checkIndexExists,
  createIndex,
  deleteIndex,
  deleteDocument,
  updateDocument,
  bulk,
  createDocument,
  checkIndexMapping,
  queryBuilder,
  aggBuilder,
  searchBuilder,
  filterBuilder,
  getDocumentById,
  fieldBuilder,
  multiSearchBuilder,
};
