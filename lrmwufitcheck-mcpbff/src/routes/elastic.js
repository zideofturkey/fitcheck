/**
 * Elasticsearch Routes
 *
 * Raw Elasticsearch query endpoints for FitCheck
 */

const express = require("express");
const router = express.Router();
const axios = require("axios");
const { Client } = require("@elastic/elasticsearch");
const Anthropic = require("@anthropic-ai/sdk");
const OpenAI = require("openai");
const {
  isAvailable,
  getActiveProvider,
  AI_CONFIG,
} = require("../services/ai-service");

// Service URLs for admin API calls (all services)
// Uses {SERVICE}_SERVICE_URL env vars — same base URLs used for MCP connections
const SERVICE_URLS = {
  invitationcenter:
    process.env.INVITATIONCENTER_SERVICE_URL || "http://localhost:3050",
  nutritionlibrary:
    process.env.NUTRITIONLIBRARY_SERVICE_URL || "http://localhost:3051",
  mealtracker: process.env.MEALTRACKER_SERVICE_URL || "http://localhost:3052",
  nutritionai: process.env.NUTRITIONAI_SERVICE_URL || "http://localhost:3053",
  agenthub: process.env.AGENTHUB_SERVICE_URL || "http://localhost:3006",
};

// Get service URL by name (case-insensitive)
const getServiceUrl = (serviceName) => {
  if (!serviceName) {
    // Return first available service as default
    const firstKey = Object.keys(SERVICE_URLS)[0];
    return SERVICE_URLS[firstKey];
  }
  return (
    SERVICE_URLS[serviceName.toLowerCase()] ||
    SERVICE_URLS[Object.keys(SERVICE_URLS)[0]]
  );
};

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

const PROJECT_PREFIX = "lrmwufitcheck_";

/**
 * GET /allIndices
 * Get all available Elasticsearch indices for this project
 */
router.get("/allIndices", async (req, res) => {
  try {
    const indices = await elasticClient.cat.indices({ format: "json" });

    // Filter to only project indices and extract names
    const projectIndices = indices
      .filter((idx) => idx.index.startsWith(PROJECT_PREFIX))
      .map((idx) => idx.index);

    res.json(projectIndices);
  } catch (error) {
    console.error("Error fetching indices:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch indices", message: error.message });
  }
});

/**
 * POST /:indexName/rawsearch
 * Execute raw Elasticsearch query
 */
router.post("/:indexName/rawsearch", async (req, res) => {
  try {
    const { indexName } = req.params;
    const queryBody = req.body;

    // Add project prefix to index name
    const fullIndexName = indexName.startsWith(PROJECT_PREFIX)
      ? indexName
      : `${PROJECT_PREFIX}${indexName}`;

    // Check if index exists
    const indexExists = await elasticClient.indices.exists({
      index: fullIndexName,
    });
    if (!indexExists) {
      return res.status(404).json({ error: `Index '${indexName}' not found` });
    }

    // Build search params
    const searchParams = {
      index: fullIndexName,
      body: queryBody.query ? queryBody : { query: queryBody },
    };

    // Add size/from if provided
    if (queryBody.size !== undefined) {
      searchParams.size = queryBody.size;
    }
    if (queryBody.from !== undefined) {
      searchParams.from = queryBody.from;
    }

    // Execute search
    const response = await elasticClient.search(searchParams);

    // Normalize result
    const hits = response.hits?.hits || [];
    const total = response.hits?.total?.value ?? response.hits?.total ?? 0;

    res.json({
      total,
      hits: hits.map((hit) => ({
        _id: hit._id,
        _index: hit._index,
        _score: hit._score,
        _source: hit._source,
      })),
      aggregations: response.aggregations || null,
      took: response.took,
      timed_out: response.timed_out,
    });
  } catch (error) {
    console.error("Elasticsearch search error:", error);

    // Handle ES-specific errors
    if (error.meta?.body?.error) {
      const esError = error.meta.body.error;
      return res.status(400).json({
        error: "Elasticsearch query error",
        type: esError.type,
        reason: esError.reason,
      });
    }

    res.status(500).json({ error: "Search failed", message: error.message });
  }
});

/**
 * GET /:indexName/schema
 * Get index mapping/schema
 */
router.get("/:indexName/schema", async (req, res) => {
  try {
    const { indexName } = req.params;
    const fullIndexName = indexName.startsWith(PROJECT_PREFIX)
      ? indexName
      : `${PROJECT_PREFIX}${indexName}`;

    const indexExists = await elasticClient.indices.exists({
      index: fullIndexName,
    });
    if (!indexExists) {
      return res.status(404).json({ error: `Index '${indexName}' not found` });
    }

    const mapping = await elasticClient.indices.getMapping({
      index: fullIndexName,
    });

    res.json(mapping[fullIndexName]?.mappings || {});
  } catch (error) {
    console.error("Error fetching schema:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch schema", message: error.message });
  }
});

/**
 * POST /query-builder
 * AI-powered Elasticsearch query builder
 * Takes a natural language prompt and returns an ES query
 */
router.post("/query-builder", async (req, res) => {
  try {
    const { prompt, indexName } = req.body;

    if (!prompt || prompt.trim().length < 3) {
      return res
        .status(400)
        .json({
          error: "Please provide a prompt describing what you want to query",
        });
    }

    // Get index mapping if provided
    let mappingInfo = "";
    if (indexName) {
      try {
        const fullIndexName = indexName.startsWith(PROJECT_PREFIX)
          ? indexName
          : `${PROJECT_PREFIX}${indexName}`;

        const indexExists = await elasticClient.indices.exists({
          index: fullIndexName,
        });
        if (indexExists) {
          const mapping = await elasticClient.indices.getMapping({
            index: fullIndexName,
          });
          const indexMapping = mapping[fullIndexName]?.mappings || {};
          mappingInfo = `\n\nIndex "${indexName}" has the following mapping:\n\`\`\`json\n${JSON.stringify(indexMapping, null, 2)}\n\`\`\``;
        }
      } catch (mappingError) {
        console.warn(
          "Failed to fetch mapping for query builder:",
          mappingError.message,
        );
      }
    }

    // System prompt for the AI
    const systemPrompt = `You are an Elasticsearch query builder assistant. Your job is to convert natural language requests into valid Elasticsearch Query DSL JSON.

IMPORTANT RULES:
1. Always respond with a brief explanation followed by the JSON query
2. The JSON query MUST be wrapped in a code block with \`\`\`json and \`\`\` markers
3. Use Elasticsearch 8.x Query DSL syntax
4. Keep queries efficient and well-structured
5. If the user's request is ambiguous, make reasonable assumptions and explain them
6. For text searches, prefer "match" for full-text or "term"/"keyword" for exact matches
7. For date ranges, use the "range" query with "gte", "lte", "gt", "lt"
8. For sorting, add a "sort" array at the query root level
9. For limiting results, use "size" at the query root level
10. For pagination, use "from" and "size"

QUERY STRUCTURE EXAMPLES:

Simple match query:
\`\`\`json
{
  "query": {
    "match": {
      "fieldName": "search text"
    }
  }
}
\`\`\`

Bool query with filters:
\`\`\`json
{
  "query": {
    "bool": {
      "must": [
        { "match": { "title": "search text" } }
      ],
      "filter": [
        { "term": { "status": "active" } },
        { "range": { "date": { "gte": "2024-01-01" } } }
      ]
    }
  },
  "sort": [{ "date": { "order": "desc" } }],
  "size": 20
}
\`\`\`

Aggregation query:
\`\`\`json
{
  "query": { "match_all": {} },
  "size": 0,
  "aggs": {
    "by_status": {
      "terms": { "field": "status.keyword", "size": 10 }
    }
  }
}
\`\`\`
${mappingInfo}`;

    // Check if AI is available
    if (!isAvailable()) {
      return res.status(503).json({
        error: "AI service not configured",
        message:
          "Please configure OPENAI_API_KEY or ANTHROPIC_API_KEY in environment variables",
      });
    }

    // Call AI to generate query
    const userMessage = `Generate an Elasticsearch query for the following request:\n\n${prompt}`;
    const provider = getActiveProvider();

    let aiResponse;

    if (provider === "anthropic") {
      // Anthropic API
      const client = new Anthropic({ apiKey: AI_CONFIG.anthropicApiKey });
      const response = await client.messages.create({
        model: AI_CONFIG.model.anthropic,
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      });
      aiResponse = response.content[0]?.text || "";
    } else {
      // OpenAI API
      const client = new OpenAI({ apiKey: AI_CONFIG.openaiApiKey });
      const response = await client.chat.completions.create({
        model: AI_CONFIG.model.openai,
        max_tokens: 2048,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      });
      aiResponse = response.choices[0]?.message?.content || "";
    }

    // Extract JSON from the response
    let extractedQuery = null;
    const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        extractedQuery = JSON.parse(jsonMatch[1].trim());
      } catch (parseError) {
        console.warn("Failed to parse extracted JSON:", parseError.message);
      }
    }

    res.json({
      explanation: aiResponse,
      query: extractedQuery,
      hasQuery: extractedQuery !== null,
    });
  } catch (error) {
    console.error("Query builder error:", error);
    res.status(500).json({
      error: "Failed to generate query",
      message: error.message,
    });
  }
});

// ============================================
// INDEX MANAGEMENT APIs (proxy to service)
// ============================================

/**
 * GET /admin/objects
 * Get list of available DataObjects for rebuild
 * Query params: ?service=serviceName (optional)
 */
router.get("/admin/objects", async (req, res) => {
  const { service } = req.query;
  const serviceUrl = getServiceUrl(service);
  const targetUrl = `${serviceUrl}/admin/elastic/objects`;

  try {
    console.log(
      `[ELASTIC ADMIN] Fetching objects from service: ${service || "default"} -> ${targetUrl}`,
    );

    const response = await axios.get(targetUrl, {
      timeout: 10000,
    });
    res.json(response.data);
  } catch (error) {
    console.error(
      `[ELASTIC ADMIN] Error fetching objects:`,
      error.message,
      error.code || "",
      `url: ${targetUrl}`,
    );
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        error: "Failed to fetch DataObjects",
        message: error.message || error.code || "Unknown error",
        code: error.code,
        service: service || "default",
        attemptedUrl: targetUrl,
        availableServices: Object.keys(SERVICE_URLS),
      });
    }
  }
});

/**
 * POST /admin/rebuild/:indexName
 * Rebuild (delete + recreate) Elasticsearch index for a DataObject
 * Query params: ?service=serviceName (required - specifies which service owns the DataObject)
 */
router.post("/admin/rebuild/:indexName", async (req, res) => {
  const { indexName } = req.params;
  const { service } = req.query;
  const serviceUrl = getServiceUrl(service);
  const targetUrl = `${serviceUrl}/admin/elastic/rebuild/${indexName}`;

  try {
    const { deleteOldIndex = true } = req.body || {};

    console.log(
      `[ELASTIC ADMIN] Triggering rebuild for: ${indexName} on service: ${service || "default"} -> ${targetUrl}`,
    );

    const response = await axios.post(
      targetUrl,
      { deleteOldIndex },
      { timeout: 300000 }, // 5 min timeout for large indexes
    );

    res.json(response.data);
  } catch (error) {
    console.error(
      `[ELASTIC ADMIN] Error rebuilding index ${indexName}:`,
      error.message,
      error.code || "",
      `url: ${targetUrl}`,
    );
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        error: "Failed to rebuild index",
        message: error.message || error.code || "Unknown error",
        code: error.code,
        indexName,
        service: service || "default",
        attemptedUrl: targetUrl,
        availableServices: Object.keys(SERVICE_URLS),
      });
    }
  }
});

/**
 * POST /admin/sync/:indexName
 * Sync (add data without deleting) Elasticsearch index for a DataObject
 * Query params: ?service=serviceName (required - specifies which service owns the DataObject)
 */
router.post("/admin/sync/:indexName", async (req, res) => {
  const { indexName } = req.params;
  const { service } = req.query;
  const serviceUrl = getServiceUrl(service);
  const targetUrl = `${serviceUrl}/admin/elastic/sync/${indexName}`;

  try {
    console.log(
      `[ELASTIC ADMIN] Triggering sync for: ${indexName} on service: ${service || "default"} -> ${targetUrl}`,
    );

    const response = await axios.post(targetUrl, {}, { timeout: 300000 });

    res.json(response.data);
  } catch (error) {
    console.error(
      `[ELASTIC ADMIN] Error syncing index ${indexName}:`,
      error.message,
      error.code || "",
      `url: ${targetUrl}`,
    );
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        error: "Failed to sync index",
        message: error.message || error.code || "Unknown error",
        code: error.code,
        indexName,
        service: service || "default",
        attemptedUrl: targetUrl,
        availableServices: Object.keys(SERVICE_URLS),
      });
    }
  }
});

/**
 * POST /admin/rebuild-all
 * Rebuild all Elasticsearch indexes across all services
 */
router.post("/admin/rebuild-all", async (req, res) => {
  try {
    console.log(
      "[ELASTIC ADMIN] Triggering rebuild for ALL indexes across all services",
    );

    const results = {
      success: true,
      services: [],
      totalIndexed: 0,
      totalErrors: 0,
    };

    // Call rebuild-all on each service
    for (const [serviceName, serviceUrl] of Object.entries(SERVICE_URLS)) {
      try {
        console.log(
          `[ELASTIC ADMIN] Rebuilding indexes on service: ${serviceName}`,
        );
        const response = await axios.post(
          `${serviceUrl}/admin/elastic/rebuild-all`,
          {},
          { timeout: 600000 },
        );

        results.services.push({
          service: serviceName,
          ...response.data,
        });
        results.totalIndexed += response.data.totalIndexed || 0;
        results.totalErrors += response.data.totalErrors || 0;

        if (!response.data.success) {
          results.success = false;
        }
      } catch (err) {
        console.error(
          `[ELASTIC ADMIN] Failed to rebuild on service ${serviceName}:`,
          err.message,
        );
        results.services.push({
          service: serviceName,
          success: false,
          error: err.response?.data?.error || err.message,
        });
        results.success = false;
      }
    }

    res.json(results);
  } catch (error) {
    console.error("Error rebuilding all indexes:", error.message);
    res.status(500).json({
      error: "Failed to rebuild all indexes",
      message: error.message,
    });
  }
});

/**
 * POST /admin/sync-all
 * Sync all Elasticsearch indexes across all services
 */
router.post("/admin/sync-all", async (req, res) => {
  try {
    console.log(
      "[ELASTIC ADMIN] Triggering sync for ALL indexes across all services",
    );

    const results = {
      success: true,
      services: [],
      totalIndexed: 0,
      totalErrors: 0,
    };

    // Call sync-all on each service
    for (const [serviceName, serviceUrl] of Object.entries(SERVICE_URLS)) {
      try {
        console.log(
          `[ELASTIC ADMIN] Syncing indexes on service: ${serviceName}`,
        );
        const response = await axios.post(
          `${serviceUrl}/admin/elastic/sync-all`,
          {},
          { timeout: 600000 },
        );

        results.services.push({
          service: serviceName,
          ...response.data,
        });
        results.totalIndexed += response.data.totalIndexed || 0;
        results.totalErrors += response.data.totalErrors || 0;

        if (!response.data.success) {
          results.success = false;
        }
      } catch (err) {
        console.error(
          `[ELASTIC ADMIN] Failed to sync on service ${serviceName}:`,
          err.message,
        );
        results.services.push({
          service: serviceName,
          success: false,
          error: err.response?.data?.error || err.message,
        });
        results.success = false;
      }
    }

    res.json(results);
  } catch (error) {
    console.error("Error syncing all indexes:", error.message);
    res.status(500).json({
      error: "Failed to sync all indexes",
      message: error.message,
    });
  }
});

/**
 * DELETE /:indexName
 * Delete an Elasticsearch index directly
 */
router.delete("/:indexName", async (req, res) => {
  try {
    const { indexName } = req.params;
    const fullIndexName = indexName.startsWith(PROJECT_PREFIX)
      ? indexName
      : `${PROJECT_PREFIX}${indexName}`;

    console.log(`[ELASTIC ADMIN] Deleting index: ${fullIndexName}`);

    const indexExists = await elasticClient.indices.exists({
      index: fullIndexName,
    });
    if (!indexExists) {
      return res.status(404).json({ error: `Index '${indexName}' not found` });
    }

    await elasticClient.indices.delete({ index: fullIndexName });

    res.json({
      success: true,
      message: `Index '${fullIndexName}' deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting index:", error.message);
    res.status(500).json({
      error: "Failed to delete index",
      message: error.message,
    });
  }
});

/**
 * GET /:indexName/stats
 * Get index statistics (doc count, size, etc.)
 */
router.get("/:indexName/stats", async (req, res) => {
  try {
    const { indexName } = req.params;
    const fullIndexName = indexName.startsWith(PROJECT_PREFIX)
      ? indexName
      : `${PROJECT_PREFIX}${indexName}`;

    const indexExists = await elasticClient.indices.exists({
      index: fullIndexName,
    });
    if (!indexExists) {
      return res.status(404).json({ error: `Index '${indexName}' not found` });
    }

    const stats = await elasticClient.indices.stats({ index: fullIndexName });
    const indexStats = stats.indices[fullIndexName];

    res.json({
      index: fullIndexName,
      docCount: indexStats?.primaries?.docs?.count || 0,
      deletedDocs: indexStats?.primaries?.docs?.deleted || 0,
      sizeInBytes: indexStats?.primaries?.store?.size_in_bytes || 0,
      sizeFormatted: formatBytes(
        indexStats?.primaries?.store?.size_in_bytes || 0,
      ),
    });
  } catch (error) {
    console.error("Error fetching index stats:", error.message);
    res.status(500).json({
      error: "Failed to fetch index stats",
      message: error.message,
    });
  }
});

// Helper to format bytes
function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

module.exports = router;
