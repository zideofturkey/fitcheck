/**
 * Logs Routes
 *
 * Log viewing and filtering endpoints for FitCheck
 */

const express = require("express");
const router = express.Router();
const { Client } = require("@elastic/elasticsearch");
const {
  registerSseClient,
  isRedisReady,
  getActiveServices,
} = require("./console-stream");

// Elasticsearch client configuration
const elasticUri = process.env.ELASTIC_URI || "http://localhost:9200";
const elasticUser = process.env.ELASTIC_USER || "elastic";
const elasticPwd = process.env.ELASTIC_PWD || "";

const elasticClient = new Client({
  node: elasticUri,
  requestTimeout: 10000,
  ...(elasticUser && elasticPwd
    ? {
        auth: { username: elasticUser, password: elasticPwd },
      }
    : {}),
  tls: {
    rejectUnauthorized: false,
  },
});

const LOGS_INDEX = "lrmwufitcheck_logs";
const CONSOLE_LOGS_INDEX = "lrmwufitcheck_console_log";

/**
 * GET /logs
 * Get logs with filtering and pagination
 * Query params:
 *   - page: page number (default 1)
 *   - limit: items per page (default 50)
 *   - logType: filter by log type (0=INFO, 1=WARNING, 2=ERROR)
 *   - service: filter by service/logSource
 *   - search: search in subject and message
 *   - from: start date (ISO string)
 *   - to: end date (ISO string)
 *   - requestId: filter by requestId
 */
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      logType,
      service,
      search,
      from,
      to,
      requestId,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 200); // Max 200 per page
    const offset = (pageNum - 1) * limitNum;

    // Build query
    const must = [];
    const filter = [];

    // Filter by logType
    if (logType !== undefined && logType !== "" && logType !== "all") {
      filter.push({ term: { logType: parseInt(logType) } });
    }

    // Filter by service
    if (service && service !== "all") {
      filter.push({ term: { logSource: service } });
    }

    // Filter by requestId
    if (requestId) {
      filter.push({ term: { requestId: requestId } });
    }

    // Date range filter
    if (from || to) {
      const range = { date: {} };
      if (from) range.date.gte = from;
      if (to) range.date.lte = to;
      filter.push({ range });
    }

    // Search in subject and data.message
    if (search && search.length >= 2) {
      must.push({
        bool: {
          should: [
            { wildcard: { subject: `*${search.toLowerCase()}*` } },
            { match: { "data.message": search } },
            { match: { location: search } },
          ],
          minimum_should_match: 1,
        },
      });
    }

    const query = {
      bool: {
        must: must.length > 0 ? must : [{ match_all: {} }],
        filter,
      },
    };

    // Execute search
    const response = await elasticClient.search({
      index: LOGS_INDEX,
      from: offset,
      size: limitNum,
      query,
      sort: [{ date: { order: "desc" } }],
    });

    const hits = response.hits?.hits || [];
    const total = response.hits?.total?.value || 0;

    res.json({
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      items: hits.map((hit) => ({
        id: hit._id,
        ...hit._source,
      })),
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
    if (error.meta?.statusCode === 404) {
      return res.json({
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
        items: [],
      });
    }
    res
      .status(500)
      .json({ error: "Failed to fetch logs", message: error.message });
  }
});

/**
 * GET /services
 * Get list of all services that have logs
 */
router.get("/services", async (req, res) => {
  try {
    const response = await elasticClient.search({
      index: LOGS_INDEX,
      size: 0,
      aggs: {
        services: {
          terms: {
            field: "logSource",
            size: 100,
          },
        },
      },
    });

    const buckets = response.aggregations?.services?.buckets || [];
    const services = buckets.map((b) => ({
      name: b.key,
      count: b.doc_count,
    }));

    res.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    if (error.meta?.statusCode === 404) {
      return res.json([]);
    }
    res
      .status(500)
      .json({ error: "Failed to fetch services", message: error.message });
  }
});

/**
 * GET /stats
 * Get log statistics
 */
router.get("/stats", async (req, res) => {
  try {
    const { from, to } = req.query;

    const filter = [];
    if (from || to) {
      const range = { date: {} };
      if (from) range.date.gte = from;
      if (to) range.date.lte = to;
      filter.push({ range });
    }

    const response = await elasticClient.search({
      index: LOGS_INDEX,
      size: 0,
      query: filter.length > 0 ? { bool: { filter } } : { match_all: {} },
      aggs: {
        byType: {
          terms: { field: "logType" },
        },
        byService: {
          terms: { field: "logSource", size: 20 },
        },
        byHour: {
          date_histogram: {
            field: "date",
            calendar_interval: "hour",
          },
        },
      },
    });

    const aggs = response.aggregations || {};

    res.json({
      total: response.hits?.total?.value || 0,
      byType: (aggs.byType?.buckets || []).map((b) => ({
        type: b.key,
        typeName: ["INFO", "WARNING", "ERROR"][b.key] || "UNKNOWN",
        count: b.doc_count,
      })),
      byService: (aggs.byService?.buckets || []).map((b) => ({
        service: b.key,
        count: b.doc_count,
      })),
      byHour: (aggs.byHour?.buckets || []).slice(-24).map((b) => ({
        time: b.key_as_string,
        count: b.doc_count,
      })),
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    if (error.meta?.statusCode === 404) {
      return res.json({ total: 0, byType: [], byService: [], byHour: [] });
    }
    res
      .status(500)
      .json({ error: "Failed to fetch stats", message: error.message });
  }
});

/**
 * GET /console/status
 * Get console log stream status (Redis connection, WebSocket clients)
 */
router.get("/console/status", async (req, res) => {
  try {
    // Get console stream status from app
    const getStatus = req.app.get("consoleStreamStatus");
    const status = getStatus
      ? getStatus()
      : { error: "Console stream not initialized" };

    // Also check if console_log index exists
    let indexExists = false;
    let indexStats = null;
    try {
      indexExists = await elasticClient.indices.exists({
        index: CONSOLE_LOGS_INDEX,
      });
      if (indexExists) {
        const stats = await elasticClient.indices.stats({
          index: CONSOLE_LOGS_INDEX,
        });
        indexStats = {
          docsCount: stats._all?.primaries?.docs?.count || 0,
          sizeInBytes: stats._all?.primaries?.store?.size_in_bytes || 0,
        };
      }
    } catch (err) {
      // Index might not exist yet
    }

    res.json({
      ...status,
      elasticsearchIndex: CONSOLE_LOGS_INDEX,
      indexExists,
      indexStats,
    });
  } catch (error) {
    console.error("Error getting console status:", error);
    res
      .status(500)
      .json({ error: "Failed to get console status", message: error.message });
  }
});

/**
 * GET /console/stream
 * SSE endpoint for real-time console log streaming
 * Query params:
 *   - service: filter by service/logSource (default 'all')
 *   - logType: filter by log type - 0=stdout/INFO, 2=stderr/ERROR (default 'all')
 *
 * To change filters, close the connection and reconnect with new query params.
 */
router.get("/console/stream", async (req, res) => {
  const { service = "all", logType = "all" } = req.query;

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering
  res.flushHeaders();

  // Send initial connection message
  const connectionData = {
    message: "Connected to console log stream",
    filters: { service, logType },
    redisConnected: isRedisReady(),
    timestamp: Date.now(),
  };
  res.write(`event: connected\ndata: ${JSON.stringify(connectionData)}\n\n`);

  // Register this SSE client
  const cleanup = registerSseClient(res, { service, logType });

  // Handle client disconnect
  req.on("close", () => {
    cleanup();
  });

  req.on("error", (err) => {
    console.error("SSE client error:", err.message);
    cleanup();
  });

  // Keep the connection open - heartbeats are sent by console-stream module
});

/**
 * GET /console
 * Get console logs from dedicated console_log index
 * Query params:
 *   - page: page number (default 1)
 *   - limit: items per page (default 100)
 *   - service: filter by service/logSource
 *   - logType: filter by log type (0=stdout, 2=stderr)
 *   - search: search in message
 *   - from: start date (ISO string)
 *   - to: end date (ISO string)
 */
router.get("/console", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 100,
      logType,
      service,
      search,
      from,
      to,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 500); // Max 500 per page for console logs
    const offset = (pageNum - 1) * limitNum;

    // Build query
    const must = [];
    const filter = [];

    // Filter by logType (0=stdout/INFO, 2=stderr/ERROR)
    if (logType !== undefined && logType !== "" && logType !== "all") {
      filter.push({ term: { logType: parseInt(logType) } });
    }

    // Filter by service
    if (service && service !== "all") {
      filter.push({ term: { logSource: service } });
    }

    // Date range filter
    if (from || to) {
      const range = { date: {} };
      if (from) range.date.gte = from;
      if (to) range.date.lte = to;
      filter.push({ range });
    }

    // Search in message
    if (search && search.length >= 2) {
      must.push({
        bool: {
          should: [
            { match: { "data.message": search } },
            { wildcard: { "data.message": `*${search.toLowerCase()}*` } },
          ],
          minimum_should_match: 1,
        },
      });
    }

    const query = {
      bool: {
        must: must.length > 0 ? must : [{ match_all: {} }],
        filter,
      },
    };

    // Execute search
    const response = await elasticClient.search({
      index: CONSOLE_LOGS_INDEX,
      from: offset,
      size: limitNum,
      query,
      sort: [{ date: { order: "desc" } }],
    });

    const hits = response.hits?.hits || [];
    const total = response.hits?.total?.value || 0;

    res.json({
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      items: hits.map((hit) => ({
        id: hit._id,
        ...hit._source,
      })),
    });
  } catch (error) {
    // Handle index not found or no shards available (index empty/not created yet)
    const errorMsg = (error.message || "").toLowerCase();
    const statusCode = error.meta?.statusCode || error.statusCode;
    const isIndexError =
      statusCode === 404 ||
      statusCode === 503 ||
      errorMsg.includes("index_not_found") ||
      errorMsg.includes("no_shard_available") ||
      errorMsg.includes("search_phase_execution_exception");
    if (isIndexError) {
      // Don't log expected errors when index doesn't exist
      console.log("[logs/console] Index not ready, returning empty result");
      return res.json({
        total: 0,
        page: 1,
        limit: 100,
        totalPages: 0,
        items: [],
        hint: "Console log index not yet created. Logs will appear once services start writing console output.",
      });
    }
    console.error("Error fetching console logs:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch console logs", message: error.message });
  }
});

/**
 * GET /console/services
 * Get list of active services from heartbeat tracking (not Elasticsearch)
 * This returns services that are currently sending logs via Redis pub/sub
 */
router.get("/console/services", async (req, res) => {
  try {
    // Get services from heartbeat tracking instead of Elasticsearch
    // This provides real-time list of active services
    const services = getActiveServices();
    res.json(services);
  } catch (error) {
    console.error("Error fetching console services:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch services", message: error.message });
  }
});

/**
 * GET /requests
 * Get HTTP requests grouped by requestId
 * This aggregates logs with the same requestId to show request/response pairs
 */
router.get("/requests", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      service,
      status, // 'success', 'error', 'all'
      requestType: filterRequestType, // 'REST', 'MCP', 'GRPC', 'KAFKA', 'all'
      search,
      from,
      to,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 100);
    const offset = (pageNum - 1) * limitNum;

    // Build filter for requests (logs that have requestId)
    const filter = [{ exists: { field: "requestId" } }];

    if (service && service !== "all") {
      filter.push({ term: { logSource: service } });
    }

    if (from || to) {
      const range = { date: {} };
      if (from) range.date.gte = from;
      if (to) range.date.lte = to;
      filter.push({ range });
    }

    // Get unique requestIds with their data
    const response = await elasticClient.search({
      index: LOGS_INDEX,
      size: 0,
      query: { bool: { filter } },
      aggs: {
        requests: {
          terms: {
            field: "requestId",
            size: 10000,
            order: { maxDate: "desc" },
          },
          aggs: {
            minDate: { min: { field: "date" } },
            maxDate: { max: { field: "date" } },
            hasError: {
              filter: { term: { logType: 2 } },
            },
            services: {
              terms: { field: "logSource", size: 5 },
            },
            subjects: {
              terms: { field: "subject", size: 10 },
            },
            // Get the first log (request)
            requestLog: {
              top_hits: {
                size: 1,
                sort: [{ date: "asc" }],
                _source: ["subject", "data", "params", "date"],
              },
            },
            // Get the last log (usually response)
            responseLog: {
              top_hits: {
                size: 1,
                sort: [{ date: "desc" }],
                _source: ["subject", "data", "params", "logType", "date"],
              },
            },
          },
        },
        totalRequests: {
          cardinality: { field: "requestId" },
        },
      },
    });

    const buckets = response.aggregations?.requests?.buckets || [];

    // Process buckets into request summaries
    const processedRequests = buckets.map((b) => {
      const requestLogHit = b.requestLog?.hits?.hits?.[0]?._source;
      const responseLogHit = b.responseLog?.hits?.hits?.[0]?._source;
      const requestData = requestLogHit?.data || {};
      const requestParams = requestLogHit?.params || {};
      const responseData = responseLogHit?.data || {};

      // Detect request type from subject patterns or data
      let requestType =
        requestData.requestType || requestParams.requestType || null;
      if (!requestType) {
        const subjects = b.subjects.buckets.map((s) => s.key).join(" ");
        if (subjects.includes("Rest") || subjects.includes("REST"))
          requestType = "REST";
        else if (subjects.includes("Mcp") || subjects.includes("MCP"))
          requestType = "MCP";
        else if (subjects.includes("Grpc") || subjects.includes("GRPC"))
          requestType = "GRPC";
        else if (subjects.includes("Kafka") || subjects.includes("KAFKA"))
          requestType = "KAFKA";
        else requestType = "UNKNOWN";
      }

      // Calculate duration
      let duration = null;
      if (b.minDate?.value && b.maxDate?.value) {
        duration = b.maxDate.value - b.minDate.value;
      }

      // Build summary based on request type
      const summary = {
        requestId: b.key,
        requestType,
        logCount: b.doc_count,
        timestamp: b.minDate.value_as_string,
        lastActivity: b.maxDate.value_as_string,
        duration,
        hasError: b.hasError.doc_count > 0,
        errorCount: b.hasError.doc_count,
        services: b.services.buckets.map((s) => s.key),
      };

      // Add type-specific fields
      switch (requestType) {
        case "REST":
          summary.method = requestData.method || null;
          summary.url = requestData.url || null;
          summary.path = requestData.url?.split("?")[0] || null;
          summary.displayTitle = summary.url || "REST Request";
          summary.displaySubtitle = summary.method;
          // Try to get response status from response log
          summary.statusCode =
            responseData.statusCode || (b.hasError.doc_count > 0 ? 500 : 200);
          break;

        case "MCP":
          summary.toolName =
            requestData.toolName ||
            requestParams.toolName ||
            requestParams.function ||
            "unknown";
          summary.displayTitle = summary.toolName;
          summary.displaySubtitle = "MCP Tool";
          break;

        case "GRPC":
          summary.service =
            requestData.service || requestParams.service || null;
          summary.method = requestData.method || requestParams.method || null;
          summary.displayTitle = `${summary.service || "GRPC"}/${summary.method || "call"}`;
          summary.displaySubtitle = "GRPC";
          break;

        case "KAFKA":
          summary.topic = requestData.topic || requestParams.topic || null;
          summary.displayTitle = summary.topic || "Kafka Message";
          summary.displaySubtitle = "KAFKA";
          break;

        default:
          summary.displayTitle = requestLogHit?.subject || "Request";
          summary.displaySubtitle = requestType;
      }

      return summary;
    });

    // Apply filters
    let filteredRequests = processedRequests;

    // Filter by status
    if (status === "error") {
      filteredRequests = filteredRequests.filter((r) => r.hasError);
    } else if (status === "success") {
      filteredRequests = filteredRequests.filter((r) => !r.hasError);
    }

    // Filter by request type
    if (filterRequestType && filterRequestType !== "all") {
      filteredRequests = filteredRequests.filter(
        (r) => r.requestType === filterRequestType,
      );
    }

    // Filter by search
    if (search && search.length >= 2) {
      const searchLower = search.toLowerCase();
      filteredRequests = filteredRequests.filter(
        (r) =>
          r.requestId.toLowerCase().includes(searchLower) ||
          r.displayTitle?.toLowerCase().includes(searchLower) ||
          r.toolName?.toLowerCase().includes(searchLower) ||
          r.url?.toLowerCase().includes(searchLower),
      );
    }

    // Paginate
    const paginatedRequests = filteredRequests.slice(offset, offset + limitNum);

    res.json({
      total: filteredRequests.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(filteredRequests.length / limitNum),
      items: paginatedRequests,
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
    if (error.meta?.statusCode === 404) {
      return res.json({
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
        items: [],
      });
    }
    res
      .status(500)
      .json({ error: "Failed to fetch requests", message: error.message });
  }
});

/**
 * GET /requests/:requestId
 * Get all logs for a specific requestId, packaged as request/response pair
 */
router.get("/requests/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;

    const response = await elasticClient.search({
      index: LOGS_INDEX,
      size: 200,
      query: {
        term: { requestId },
      },
      sort: [{ date: { order: "asc" } }],
    });

    const hits = response.hits?.hits || [];
    const logs = hits.map((hit) => ({
      id: hit._id,
      ...hit._source,
    }));

    if (logs.length === 0) {
      return res.json({ requestId, total: 0, package: null, timeline: [] });
    }

    // Detect request type from logs
    const detectRequestType = () => {
      for (const log of logs) {
        if (log.data?.requestType) return log.data.requestType;
        if (log.params?.requestType) return log.params.requestType;
        if (log.subject?.includes("Rest")) return "REST";
        if (log.subject?.includes("Mcp") || log.subject?.includes("MCP"))
          return "MCP";
        if (log.subject?.includes("Grpc") || log.subject?.includes("GRPC"))
          return "GRPC";
        if (log.subject?.includes("Kafka") || log.subject?.includes("KAFKA"))
          return "KAFKA";
      }
      return "UNKNOWN";
    };

    const requestType = detectRequestType();

    // Find request and response logs based on type
    let requestLog = null;
    let responseLog = null;
    const errorLogs = logs.filter((l) => l.logType === 2);

    // Pattern-based detection
    const requestPatterns = ["Received", "Request", "Incoming"];
    const responsePatterns = ["Responded", "Response", "Outgoing"];

    for (const log of logs) {
      const subject = log.subject || "";

      // Find request log
      if (!requestLog && requestPatterns.some((p) => subject.includes(p))) {
        requestLog = log;
      }

      // Find response log
      if (!responseLog && responsePatterns.some((p) => subject.includes(p))) {
        responseLog = log;
      }
    }

    // Fallback: use first/last log
    if (!requestLog) requestLog = logs[0];
    if (!responseLog && logs.length > 1) {
      // Find last non-error log
      responseLog =
        [...logs].reverse().find((l) => l.logType !== 2) ||
        logs[logs.length - 1];
      // Don't use same log as both request and response
      if (responseLog === requestLog && logs.length > 1) {
        responseLog =
          logs[logs.length - 1] !== requestLog ? logs[logs.length - 1] : null;
      }
    }

    // Build packaged response based on request type
    const buildPackage = () => {
      const pkg = {
        requestType,
        requestId,
        timestamp: requestLog?.date,
        duration: null,
        hasError: errorLogs.length > 0,
        errorCount: errorLogs.length,
      };

      // Calculate duration if we have both request and response
      if (requestLog?.date && responseLog?.date) {
        const start = new Date(requestLog.date).getTime();
        const end = new Date(responseLog.date).getTime();
        pkg.duration = end - start;
      }

      // Build request/response based on type
      switch (requestType) {
        case "REST":
          pkg.request = {
            method: requestLog?.data?.method || null,
            url: requestLog?.data?.url || null,
            path: requestLog?.data?.url?.split("?")[0] || null,
            query: requestLog?.data?.query || {},
            params: requestLog?.data?.params || {},
            body: requestLog?.data?.body || null,
            headers: sanitizeHeaders(requestLog?.data?.headers),
          };
          pkg.response = responseLog
            ? {
                data: responseLog?.data?.response || responseLog?.data || null,
                statusCode:
                  responseLog?.data?.statusCode ||
                  (errorLogs.length > 0 ? 500 : 200),
              }
            : null;
          pkg.displayTitle = pkg.request.url || "REST Request";
          pkg.displaySubtitle = pkg.request.method;
          break;

        case "MCP":
          const toolName =
            requestLog?.data?.toolName ||
            requestLog?.params?.toolName ||
            requestLog?.params?.function ||
            "unknown";
          pkg.request = {
            toolName,
            params: requestLog?.data?.params || requestLog?.params || {},
          };
          pkg.response = responseLog
            ? {
                data: responseLog?.data?.response || responseLog?.data || null,
              }
            : null;
          pkg.displayTitle = toolName;
          pkg.displaySubtitle = "MCP Tool";
          break;

        case "GRPC":
          pkg.request = {
            service:
              requestLog?.data?.service || requestLog?.params?.service || null,
            method:
              requestLog?.data?.method || requestLog?.params?.method || null,
            payload:
              requestLog?.data?.payload ||
              requestLog?.data?.body ||
              requestLog?.params ||
              {},
          };
          pkg.response = responseLog
            ? {
                data: responseLog?.data?.response || responseLog?.data || null,
              }
            : null;
          pkg.displayTitle = `${pkg.request.service || "GRPC"}/${pkg.request.method || "call"}`;
          pkg.displaySubtitle = "GRPC";
          break;

        case "KAFKA":
          pkg.request = {
            topic: requestLog?.data?.topic || requestLog?.params?.topic || null,
            partition: requestLog?.data?.partition || null,
            key: requestLog?.data?.key || null,
            payload:
              requestLog?.data?.payload ||
              requestLog?.data?.message ||
              requestLog?.data ||
              {},
          };
          pkg.response = responseLog
            ? {
                data: responseLog?.data?.response || responseLog?.data || null,
              }
            : null;
          pkg.displayTitle = pkg.request.topic || "Kafka Message";
          pkg.displaySubtitle = "KAFKA";
          break;

        default:
          pkg.request = {
            data: requestLog?.data || requestLog?.params || {},
          };
          pkg.response = responseLog
            ? {
                data: responseLog?.data || null,
              }
            : null;
          pkg.displayTitle = requestLog?.subject || "Request";
          pkg.displaySubtitle = requestType;
      }

      // Add errors
      if (errorLogs.length > 0) {
        pkg.errors = errorLogs.map((e) => ({
          subject: e.subject,
          message:
            e.data?.message || e.data?.error?.message || e.params?.err || null,
          stack: e.data?.error?.stack || e.data?.stack || null,
          data: e.data,
          timestamp: e.date,
        }));
      }

      return pkg;
    };

    // Sanitize headers (remove sensitive info)
    const sanitizeHeaders = (headers) => {
      if (!headers) return null;
      const sanitized = { ...headers };
      const sensitiveKeys = ["authorization", "cookie", "x-api-key", "api-key"];
      for (const key of Object.keys(sanitized)) {
        if (sensitiveKeys.includes(key.toLowerCase())) {
          sanitized[key] = "[REDACTED]";
        }
      }
      return sanitized;
    };

    // Build timeline for detail view
    const timeline = logs.map((log) => ({
      id: log.id,
      timestamp: log.date,
      subject: log.subject,
      logType: log.logType,
      logTypeName: ["INFO", "WARNING", "ERROR"][log.logType] || "UNKNOWN",
      location: log.location,
      hasData: !!(log.data && Object.keys(log.data).length > 0),
    }));

    const result = {
      requestId,
      total: logs.length,
      package: buildPackage(),
      timeline,
      // Keep raw logs for detailed inspection
      _raw: {
        request: requestLog,
        response: responseLog,
        errors: errorLogs,
        all: logs,
      },
    };

    res.json(result);
  } catch (error) {
    console.error("Error fetching request details:", error);
    res
      .status(500)
      .json({
        error: "Failed to fetch request details",
        message: error.message,
      });
  }
});

/**
 * GET /events
 * Get event logs (EventRaised and EventReceived) with pagination
 * Query params:
 *   - page: page number (default 1)
 *   - limit: items per page (default 50)
 *   - eventType: filter by event type ('raised', 'received', 'all')
 *   - service: filter by service/logSource
 *   - search: search in eventName
 *   - eventId: filter by specific eventId (to see event lifecycle)
 *   - from: start date (ISO string)
 *   - to: end date (ISO string)
 */
router.get("/events", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      eventType = "all",
      service,
      search,
      eventId,
      from,
      to,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 200);
    const offset = (pageNum - 1) * limitNum;

    // Build query - filter for EventRaised and EventReceived subjects
    const must = [];
    const filter = [];

    // Filter for event subjects
    // EventRaised = event published to Kafka
    // NewEventArrived = event received from Kafka
    // EventIsProcessed = event successfully processed
    // EventCanNotProcessed = event processing failed
    const eventSubjects = [];
    if (eventType === "raised" || eventType === "all") {
      eventSubjects.push("EventRaised");
    }
    if (eventType === "received" || eventType === "all") {
      eventSubjects.push("NewEventArrived");
      eventSubjects.push("EventIsProcessed");
      eventSubjects.push("EventCanNotProcessed");
    }

    filter.push({
      bool: {
        should: eventSubjects.map((s) => ({ term: { subject: s } })),
        minimum_should_match: 1,
      },
    });

    // Filter by service
    if (service && service !== "all") {
      filter.push({ term: { logSource: service } });
    }

    // Filter by eventId (to trace a specific event's lifecycle)
    // eventId is in params.eventId, but also check data._eventId for payload
    if (eventId) {
      filter.push({
        bool: {
          should: [
            { term: { "params.eventId": eventId } },
            { term: { "data._eventId": eventId } },
          ],
          minimum_should_match: 1,
        },
      });
    }

    // Date range filter
    if (from || to) {
      const range = { date: {} };
      if (from) range.date.gte = from;
      if (to) range.date.lte = to;
      filter.push({ range });
    }

    // Note: Search filtering is done after fetching results
    // because params/data fields have enabled:false in ES mappings (stored but not indexed)
    const hasSearch = search && search.length >= 2;
    const searchLower = hasSearch ? search.toLowerCase() : "";

    const query = {
      bool: {
        must: must.length > 0 ? must : [{ match_all: {} }],
        filter,
      },
    };

    // When searching, fetch more results since we'll filter in app layer
    // Without search, use normal pagination
    const fetchSize = hasSearch ? 1000 : limitNum;
    const fetchOffset = hasSearch ? 0 : offset;

    // Execute search
    const response = await elasticClient.search({
      index: LOGS_INDEX,
      from: fetchOffset,
      size: fetchSize,
      query,
      sort: [{ date: { order: "desc" } }],
    });

    const hits = response.hits?.hits || [];

    // Process hits to extract event info
    // Note: hexaLogger.insertInfo(subject, params, location, data, requestId)
    // - params = { event/topic, eventId, ... } (metadata)
    // - data = full payload
    let items = hits.map((hit) => {
      const log = hit._source;
      const isRaised = log.subject === "EventRaised";

      // Topic name is in params.event (for EventRaised) or params.topic (for listeners)
      const eventName = isRaised
        ? log.params?.event || "Unknown Event"
        : log.params?.topic || "Unknown Event";

      // eventId is in params.eventId (set by our updated kafka-publisher/listener)
      let eventId = log.params?.eventId || null;

      // Fallback: for older logs or if eventId is in the payload
      if (!eventId && log.data) {
        // Check in the full payload (data contains this.data which has _eventId)
        eventId = log.data?._eventId || null;
        // For listener logs, payload might be nested under topic name in data
        if (!eventId && log.params?.topic && log.data[log.params.topic]) {
          eventId = log.data[log.params.topic]?._eventId || null;
        }
      }

      // Determine event status
      let eventStatus = "received";
      if (isRaised) {
        eventStatus = "raised";
      } else if (log.subject === "NewEventArrived") {
        eventStatus = "arrived";
      } else if (log.subject === "EventIsProcessed") {
        eventStatus = "processed";
      } else if (log.subject === "EventCanNotProcessed") {
        eventStatus = "failed";
      }

      return {
        id: hit._id,
        eventName,
        eventId, // UUID that connects publish and receive
        eventType: isRaised ? "raised" : "received",
        eventStatus,
        subject: log.subject,
        logSource: log.logSource,
        date: log.date,
        logType: log.logType,
        data: log.data,
        params: log.params,
        requestId: log.requestId, // Connects event with HTTP request logs
      };
    });

    // Apply search filter in app layer (case-insensitive partial match on eventName)
    if (hasSearch) {
      items = items.filter((item) =>
        item.eventName.toLowerCase().includes(searchLower),
      );
    }

    // Calculate totals and pagination
    const filteredTotal = hasSearch
      ? items.length
      : response.hits?.total?.value || 0;
    const totalPages = Math.ceil(filteredTotal / limitNum);

    // Apply pagination to filtered results
    const paginatedItems = hasSearch
      ? items.slice(offset, offset + limitNum)
      : items;

    res.json({
      total: filteredTotal,
      page: pageNum,
      limit: limitNum,
      totalPages,
      items: paginatedItems,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    if (error.meta?.statusCode === 404) {
      return res.json({
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
        items: [],
      });
    }
    res
      .status(500)
      .json({ error: "Failed to fetch events", message: error.message });
  }
});

/**
 * GET /events/stats
 * Get event statistics
 */
router.get("/events/stats", async (req, res) => {
  try {
    const { from, to } = req.query;

    const filter = [
      {
        bool: {
          should: [
            { term: { subject: "EventRaised" } },
            { term: { subject: "NewEventArrived" } },
            { term: { subject: "EventIsProcessed" } },
            { term: { subject: "EventCanNotProcessed" } },
          ],
          minimum_should_match: 1,
        },
      },
    ];

    if (from || to) {
      const range = { date: {} };
      if (from) range.date.gte = from;
      if (to) range.date.lte = to;
      filter.push({ range });
    }

    const response = await elasticClient.search({
      index: LOGS_INDEX,
      size: 0,
      query: { bool: { filter } },
      aggs: {
        bySubject: {
          terms: { field: "subject" },
        },
        byEventNameRaised: {
          terms: {
            field: "data.event",
            size: 50,
          },
        },
        byEventNameReceived: {
          terms: {
            field: "data.topic",
            size: 50,
          },
        },
        byService: {
          terms: { field: "logSource", size: 20 },
        },
        byHour: {
          date_histogram: {
            field: "date",
            calendar_interval: "hour",
          },
        },
      },
    });

    const aggs = response.aggregations || {};

    // Merge event names from both raised (data.event) and received (data.topic)
    const raisedEvents = (aggs.byEventNameRaised?.buckets || []).map((b) => ({
      eventName: b.key,
      count: b.doc_count,
      type: "raised",
    }));
    const receivedEvents = (aggs.byEventNameReceived?.buckets || []).map(
      (b) => ({
        eventName: b.key,
        count: b.doc_count,
        type: "received",
      }),
    );
    const allEvents = [...raisedEvents, ...receivedEvents];

    res.json({
      total: response.hits?.total?.value || 0,
      bySubject: (aggs.bySubject?.buckets || []).map((b) => ({
        subject: b.key,
        count: b.doc_count,
      })),
      byEventName: allEvents,
      byService: (aggs.byService?.buckets || []).map((b) => ({
        service: b.key,
        count: b.doc_count,
      })),
      byHour: (aggs.byHour?.buckets || []).slice(-24).map((b) => ({
        time: b.key_as_string,
        count: b.doc_count,
      })),
    });
  } catch (error) {
    console.error("Error fetching event stats:", error);
    if (error.meta?.statusCode === 404) {
      return res.json({
        total: 0,
        bySubject: [],
        byEventName: [],
        byService: [],
        byHour: [],
      });
    }
    res
      .status(500)
      .json({ error: "Failed to fetch event stats", message: error.message });
  }
});

/**
 * DELETE /clear
 * Clear old logs (admin only)
 */
router.delete("/clear", async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysNum = parseInt(days);
    const dateLimit = new Date(Date.now() - daysNum * 24 * 60 * 60 * 1000);

    const response = await elasticClient.deleteByQuery({
      index: LOGS_INDEX,
      query: {
        range: { date: { lte: dateLimit.toISOString() } },
      },
    });

    res.json({
      deleted: response.deleted || 0,
      message: `Deleted logs older than ${daysNum} days`,
    });
  } catch (error) {
    console.error("Error clearing logs:", error);
    res
      .status(500)
      .json({ error: "Failed to clear logs", message: error.message });
  }
});

module.exports = router;
