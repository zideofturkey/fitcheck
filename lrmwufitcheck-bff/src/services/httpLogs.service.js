const httpStatus = require("http-status");
const ApiError = require("common/ApiError");
const {
  search,
  count,
  checkIndexExists,
  createIndex,
  queryBuilder,
  searchBuilder,
} = require("common/elasticsearch");

const LOG_INDEX = "lrmwufitcheck_logs";

const searchLogs = async (options = {}) => {
  const {
    page = 1,
    limit = 100,
    q = "",
    subject,
    method,
    status,
    logSource,
    startDate,
    endDate,
    url,
    requestId,
    sortBy = "date",
    sortOrder = "desc",
    minResponseTime,
    maxResponseTime,
    logType,
    userAgent,
  } = options;

  const indexExists = await checkIndexExists(LOG_INDEX);

  // OGUZHAN should i create index if it doesn't exist and return empty array or throw error?
  if (!indexExists) {
    await createIndex(LOG_INDEX);
    return {
      logs: [],
      total: 0,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: 0,
    };
  }

  let filters = {};

  if (subject) {
    filters.subject = { operator: "eq", value: subject };
  }

  if (method) {
    filters["data.method"] = { operator: "eq", value: method.toUpperCase() };
  }

  if (status) {
    filters["data.httpStatus"] = { operator: "eq", value: parseInt(status) };
  }
  if (logSource) {
    filters.logSource = { operator: "eq", value: logSource };
  }

  if (requestId) {
    filters.requestId = { operator: "eq", value: requestId };
  }

  if (logType) {
    filters.logType = { operator: "eq", value: parseInt(logType) };
  }

  if (startDate || endDate) {
    filters.date = {
      operator: "range",
      values: [
        startDate || "2025-01-01T00:00:00.000Z",
        endDate || new Date().toISOString(),
      ],
    };
  }

  if (url) {
    filters["data.url"] = { operator: "wildcard", value: url };
  }

  if (userAgent) {
    filters["data.headers.user-agent"] = {
      operator: "wildcard",
      value: userAgent,
    };
  }

  if (minResponseTime || maxResponseTime) {
    const responseTimeQuery = {
      bool: {
        must: [],
      },
    };

    if (minResponseTime) {
      responseTimeQuery.bool.must.push({
        range: {
          "data.elapsedMs": {
            gte: parseInt(minResponseTime),
          },
        },
      });
    }

    if (maxResponseTime) {
      responseTimeQuery.bool.must.push({
        range: {
          "data.elapsedMs": {
            lte: parseInt(maxResponseTime),
          },
        },
      });
    }

    filters._responseTimeRange = responseTimeQuery;
  }

  let query = queryBuilder(filters);

  if (q) {
    query = searchBuilder(query, q);
  }

  if (filters._responseTimeRange) {
    query.bool.must.push(filters._responseTimeRange);
    delete filters._responseTimeRange;
  }

  const sort = {};
  sort[sortBy] = { order: sortOrder };

  const searchBody = {
    query:
      Object.keys(query.bool.must).length === 0 &&
      Object.keys(query.bool.filter).length === 0 &&
      Object.keys(query.bool.should).length === 0 &&
      Object.keys(query.bool.must_not).length === 0
        ? { match_all: {} }
        : query,
    sort: [sort],
  };

  try {
    const searchResult = await search(
      LOG_INDEX,
      searchBody,
      parseInt(page),
      parseInt(limit),
    );

    const countResult = await count(LOG_INDEX, { query: searchBody.query });

    const logs = searchResult.hits.hits.map((hit) => ({
      ...hit._source,
      _id: hit._id,
      _score: hit._score,
    }));

    const total = countResult.count;
    const totalPages = Math.ceil(total / parseInt(limit));

    return {
      logs,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages,
      filters: {
        subject,
        method,
        status,
        logSource,
        startDate,
        endDate,
        url,
        requestId,
        minResponseTime,
        maxResponseTime,
        logType,
        userAgent,
        q,
      },
      sorting: {
        sortBy,
        sortOrder,
      },
    };
  } catch (error) {
    console.error("Error searching HTTP logs:", error);
    //**errorLog
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to search HTTP logs",
    );
  }
};

const getLogsStats = async (options = {}) => {
  const indexExists = await checkIndexExists(LOG_INDEX);
  if (!indexExists) {
    return {
      totalLogs: 0,
      totalRequests: 0,
      totalResponses: 0,
      totalErrors: 0,
    };
  }

  try {
    const statsQuery = {
      aggs: {
        by_subject: {
          terms: {
            field: "subject.keyword",
            size: 10,
          },
        },
        by_method: {
          terms: {
            field: "data.method.keyword",
            size: 20,
          },
        },
        by_status: {
          terms: {
            field: "data.statusCode",
            size: 50,
          },
        },
      },
      size: 0,
    };

    const result = await search(LOG_INDEX, statsQuery);

    return {
      totalLogs: result.hits.total.value,
      aggregations: {
        bySubject: result.aggregations.by_subject.buckets,
        byMethod: result.aggregations.by_method.buckets,
        byStatus: result.aggregations.by_status.buckets,
      },
    };
  } catch (error) {
    console.error("Error getting logs stats:", error);
    //**errorLog
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to get logs statistics",
    );
  }
};

const getPairedLogs = async (requestId) => {
  const indexExists = await checkIndexExists(LOG_INDEX);

  if (!indexExists) {
    throw new ApiError(httpStatus.NOT_FOUND, "Logs index not found");
  }

  try {
    const searchBody = {
      query: {
        bool: {
          must: [
            {
              term: {
                "requestId.keyword": requestId,
              },
            },
          ],
        },
      },
      sort: [{ date: { order: "asc" } }],
      size: 1000,
    };

    const searchResult = await search(LOG_INDEX, searchBody, 1, 1000);

    if (searchResult.hits.hits.length === 0) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "No logs found for the given request ID",
      );
    }

    const logs = searchResult.hits.hits.map((hit) => hit._source);

    const pairedLogs = [];
    const logsBySource = {};

    logs.forEach((log) => {
      if (!logsBySource[log.logSource]) {
        logsBySource[log.logSource] = [];
      }
      logsBySource[log.logSource].push(log);
    });

    Object.keys(logsBySource).forEach((logSource) => {
      const sourceLogs = logsBySource[logSource];
      let request = null;
      let response = null;
      let error = null;

      sourceLogs.forEach((log) => {
        if (log.subject === "RestRequestReceived") {
          request = log;
        } else if (log.subject === "RestRequestResponded") {
          response = log;
        } else if (log.subject === "HttpError") {
          error = log;
        }
      });

      const pairedLog = {
        requestId: requestId,
        logSource: logSource,
      };

      if (request) {
        pairedLog.request = request;
      }

      if (response) {
        pairedLog.response = response;
      } else if (error) {
        pairedLog.error = error;
      }

      pairedLogs.push(pairedLog);
    });

    return pairedLogs;
  } catch (error) {
    //**errorLog
    if (error instanceof ApiError) {
      throw error;
    }
    console.error("Error getting paired logs:", error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to get paired logs",
    );
  }
};

module.exports = {
  searchLogs,
  getLogsStats,
  getPairedLogs,
};
