/**
 * API Documentation Routes
 *
 * Provides endpoints to access auto-generated API documentation
 * for all business services in the project.
 *
 * Documentation includes:
 * - JSON metadata (api-docs.js) for quick listing and search
 * - Full Markdown documentation (data/docs/*.md) for detailed specs
 */

const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const apiDocs = require("../data/api-docs");

// Path to the markdown documentation files
const DOCS_PATH = path.join(__dirname, "..", "data", "docs");

// Load docs index if available
let docsIndex = null;
try {
  const indexPath = path.join(DOCS_PATH, "index.json");
  if (fs.existsSync(indexPath)) {
    docsIndex = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  }
} catch (err) {
  console.warn("[Docs] Failed to load docs index:", err.message);
}

/**
 * GET /api/docs/services
 *
 * List all services with their API counts
 */
router.get("/services", (req, res) => {
  try {
    const services = apiDocs.getAllServices();
    res.json({
      project: "fitcheck",
      services,
      hasMarkdownDocs: docsIndex !== null,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to get services", message: error.message });
  }
});

/**
 * GET /api/docs/services/:serviceName
 *
 * Get all APIs for a specific service
 */
router.get("/services/:serviceName", (req, res) => {
  try {
    const { serviceName } = req.params;
    const service = apiDocs.getServiceApis(serviceName);

    if (!service) {
      return res
        .status(404)
        .json({ error: `Service '${serviceName}' not found` });
    }

    res.json(service);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to get service APIs", message: error.message });
  }
});

/**
 * GET /api/docs/services/:serviceName/grouped
 *
 * Get APIs for a service grouped by data object
 */
router.get("/services/:serviceName/grouped", (req, res) => {
  try {
    const { serviceName } = req.params;
    const grouped = apiDocs.getApisByDataObject(serviceName);

    if (!grouped) {
      return res
        .status(404)
        .json({ error: `Service '${serviceName}' not found` });
    }

    res.json({
      serviceName,
      groups: grouped,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to get grouped APIs", message: error.message });
  }
});

/**
 * GET /api/docs/services/:serviceName/apis/:apiName
 *
 * Get documentation for a specific API (JSON metadata)
 */
router.get("/services/:serviceName/apis/:apiName", (req, res) => {
  try {
    const { serviceName, apiName } = req.params;
    const api = apiDocs.getApiDoc(serviceName, apiName);

    if (!api) {
      return res.status(404).json({
        error: `API '${apiName}' not found in service '${serviceName}'`,
      });
    }

    const lowerServiceName = serviceName.toLowerCase();

    // Check if HTML doc exists (pre-rendered with syntax highlighting)
    const htmlFileName = `${lowerServiceName}-${apiName}.html`;
    const htmlPath = path.join(DOCS_PATH, htmlFileName);
    const hasHtml = fs.existsSync(htmlPath);

    // Check if OpenAPI spec exists
    const specFileName = `${lowerServiceName}-${apiName}.openapi.json`;
    const specPath = path.join(DOCS_PATH, specFileName);
    const hasOpenApi = fs.existsSync(specPath);

    // Check if Scalar HTML exists
    const scalarFileName = `${lowerServiceName}-${apiName}.scalar.html`;
    const scalarPath = path.join(DOCS_PATH, scalarFileName);
    const hasScalar = fs.existsSync(scalarPath);

    res.json({
      ...api,
      hasHtml,
      htmlUrl: hasHtml
        ? `/api/docs/services/${serviceName}/apis/${apiName}/html`
        : null,
      hasOpenApi,
      openApiUrl: hasOpenApi
        ? `/api/docs/services/${serviceName}/apis/${apiName}/openapi`
        : null,
      hasScalar,
      scalarUrl: hasScalar
        ? `/api/docs/services/${serviceName}/apis/${apiName}/scalar`
        : null,
      // Legacy support
      hasMarkdown: hasHtml,
      markdownUrl: hasHtml
        ? `/api/docs/services/${serviceName}/apis/${apiName}/html`
        : null,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to get API documentation",
        message: error.message,
      });
  }
});

/**
 * GET /api/docs/services/:serviceName/apis/:apiName/html
 *
 * Get the pre-rendered HTML documentation for a specific API
 * HTML is generated at build time with syntax highlighting via highlight.js
 */
router.get("/services/:serviceName/apis/:apiName/html", (req, res) => {
  try {
    const { serviceName, apiName } = req.params;
    const { format } = req.query; // 'raw' or 'json' (default)

    const htmlFileName = `${serviceName.toLowerCase()}-${apiName}.html`;
    const htmlPath = path.join(DOCS_PATH, htmlFileName);

    if (!fs.existsSync(htmlPath)) {
      return res.status(404).json({
        error: `HTML documentation not found for '${apiName}' in service '${serviceName}'`,
        hint: "Regenerate the project to create API documentation",
      });
    }

    const html = fs.readFileSync(htmlPath, "utf8");

    if (format === "raw") {
      res.setHeader("Content-Type", "text/html");
      res.send(html);
    } else {
      res.json({
        serviceName,
        apiName,
        html,
        generatedAt: docsIndex?.generatedAt || null,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to get HTML documentation",
        message: error.message,
      });
  }
});

/**
 * GET /api/docs/services/:serviceName/apis/:apiName/openapi
 *
 * Get the OpenAPI 3.0 specification for a specific API
 */
router.get("/services/:serviceName/apis/:apiName/openapi", (req, res) => {
  try {
    const { serviceName, apiName } = req.params;

    const specFileName = `${serviceName.toLowerCase()}-${apiName}.openapi.json`;
    const specPath = path.join(DOCS_PATH, specFileName);

    if (!fs.existsSync(specPath)) {
      return res.status(404).json({
        error: `OpenAPI spec not found for '${apiName}' in service '${serviceName}'`,
        hint: "Regenerate the project to create OpenAPI specifications",
      });
    }

    const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));
    res.json(spec);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to get OpenAPI spec", message: error.message });
  }
});

/**
 * GET /api/docs/services/:serviceName/apis/:apiName/scalar
 *
 * Get the Scalar API Reference HTML for interactive API testing
 */
router.get("/services/:serviceName/apis/:apiName/scalar", (req, res) => {
  try {
    const { serviceName, apiName } = req.params;

    const scalarFileName = `${serviceName.toLowerCase()}-${apiName}.scalar.html`;
    const scalarPath = path.join(DOCS_PATH, scalarFileName);

    if (!fs.existsSync(scalarPath)) {
      return res.status(404).json({
        error: `Scalar HTML not found for '${apiName}' in service '${serviceName}'`,
        hint: "Regenerate the project to create API testing interface",
      });
    }

    const html = fs.readFileSync(scalarPath, "utf8");
    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to get Scalar HTML", message: error.message });
  }
});

/**
 * GET /api/docs/services/:serviceName/openapi
 *
 * Get the combined OpenAPI 3.0 specification for all APIs in a service
 */
router.get("/services/:serviceName/openapi", (req, res) => {
  try {
    const { serviceName } = req.params;

    const specFileName = `${serviceName.toLowerCase()}.openapi.json`;
    const specPath = path.join(DOCS_PATH, specFileName);

    if (!fs.existsSync(specPath)) {
      return res.status(404).json({
        error: `OpenAPI spec not found for service '${serviceName}'`,
        hint: "Regenerate the project to create OpenAPI specifications",
      });
    }

    const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));
    res.json(spec);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to get service OpenAPI spec",
        message: error.message,
      });
  }
});

/**
 * GET /api/docs/services/:serviceName/scalar
 *
 * Get the Scalar API Reference HTML for all APIs in a service
 */
router.get("/services/:serviceName/scalar", (req, res) => {
  try {
    const { serviceName } = req.params;

    const scalarFileName = `${serviceName.toLowerCase()}.scalar.html`;
    const scalarPath = path.join(DOCS_PATH, scalarFileName);

    if (!fs.existsSync(scalarPath)) {
      return res.status(404).json({
        error: `Scalar HTML not found for service '${serviceName}'`,
        hint: "Regenerate the project to create API testing interface",
      });
    }

    const html = fs.readFileSync(scalarPath, "utf8");
    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to get service Scalar HTML",
        message: error.message,
      });
  }
});

/**
 * GET /api/docs/services/:serviceName/apis/:apiName/markdown
 *
 * Legacy endpoint - redirects to HTML
 * @deprecated Use /html endpoint instead
 */
router.get("/services/:serviceName/apis/:apiName/markdown", (req, res) => {
  const { serviceName, apiName } = req.params;
  res.redirect(`/api/docs/services/${serviceName}/apis/${apiName}/html`);
});

// ============================================================================
// Prompt Documentation Endpoints
// ============================================================================

// Path to the prompt documentation files
const PROMPTS_PATH = path.join(__dirname, "..", "data", "prompts");

// Load prompts index if available
let promptsIndex = null;
try {
  const promptsIndexPath = path.join(PROMPTS_PATH, "index.json");
  if (fs.existsSync(promptsIndexPath)) {
    promptsIndex = JSON.parse(fs.readFileSync(promptsIndexPath, "utf8"));
  }
} catch (err) {
  console.warn("[Docs] Failed to load prompts index:", err.message);
}

/**
 * GET /api/docs/prompts
 *
 * List all available frontend prompt documents with their metadata
 */
router.get("/prompts", (req, res) => {
  try {
    if (!promptsIndex) {
      return res.status(404).json({
        error: "Prompts index not found",
        hint: "Regenerate the project to create prompt documentation",
      });
    }

    res.json(promptsIndex);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to list prompts", message: error.message });
  }
});

/**
 * GET /api/docs/prompts/:promptName
 *
 * Get a specific prompt document by name (without .md extension)
 * Returns the markdown content as JSON or raw text based on format query param
 */
router.get("/prompts/:promptName", (req, res) => {
  try {
    const { promptName } = req.params;
    const { format } = req.query; // 'raw' returns plain text, default returns JSON

    // Try with and without .md extension
    let mdPath = path.join(PROMPTS_PATH, `${promptName}.md`);
    if (!fs.existsSync(mdPath)) {
      mdPath = path.join(PROMPTS_PATH, promptName);
    }

    if (!fs.existsSync(mdPath)) {
      return res.status(404).json({
        error: `Prompt '${promptName}' not found`,
        available: promptsIndex?.prompts?.map((p) => p.name) || [],
      });
    }

    const content = fs.readFileSync(mdPath, "utf8");

    // Find metadata from index
    const meta = promptsIndex?.prompts?.find(
      (p) =>
        p.name === promptName ||
        p.fileName === promptName ||
        p.fileName === `${promptName}.md`,
    );

    if (format === "raw") {
      res.setHeader("Content-Type", "text/markdown");
      res.send(content);
    } else {
      res.json({
        name: meta?.name || promptName,
        docName: meta?.docName || promptName,
        docIndex: meta?.docIndex || null,
        service: meta?.service || null,
        content,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to get prompt", message: error.message });
  }
});

// ============================================================================
// Search & Misc Endpoints
// ============================================================================

/**
 * GET /api/docs/search
 *
 * Search APIs across all services
 * Query params:
 *   - q: search query (searches name, description, route, dataObject)
 */
router.get("/search", (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res
        .status(400)
        .json({ error: "Search query must be at least 2 characters" });
    }

    const results = apiDocs.searchApis(q);
    res.json({
      query: q,
      count: results.length,
      results,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to search APIs", message: error.message });
  }
});

/**
 * GET /api/docs/all
 *
 * Get complete API documentation for all services
 * Warning: This can be a large response
 */
router.get("/all", (req, res) => {
  try {
    res.json({
      project: "fitcheck",
      services: apiDocs.API_DOCS,
      docsIndex,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to get all documentation",
        message: error.message,
      });
  }
});

/**
 * GET /api/docs/index
 *
 * Get the documentation index with all available markdown files
 */
router.get("/index", (req, res) => {
  try {
    if (!docsIndex) {
      return res.status(404).json({
        error: "Documentation index not found",
        hint: "Regenerate the project to create documentation",
      });
    }

    res.json(docsIndex);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to get documentation index",
        message: error.message,
      });
  }
});

module.exports = router;
