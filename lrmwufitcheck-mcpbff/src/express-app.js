/**
 * Express Application Configuration
 *
 * MCP-BFF Service for FitCheck
 */

const express = require("express");
const cors = require("cors");
const { getDomain } = require("tldts");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const path = require("path");

const authMiddleware = require("./middlewares/auth");
const packageJson = require("../package.json");
const errorHandler = require("./middlewares/error-handler");
const chatRoutes = require("./routes/chat");
const toolsRoutes = require("./routes/tools");
const healthRoutes = require("./routes/health");
const elasticRoutes = require("./routes/elastic");
const logsRoutes = require("./routes/logs");
const docsRoutes = require("./routes/docs");
const aiCompleteRoutes = require("./routes/ai-complete");
const mcpServerRoutes = require("./routes/mcp-server");

const app = express();
const roleGuard =
  (allowedRoles = []) =>
  (req, res, next) => {
    const roleId = Array.isArray(req.user?.roleId)
      ? req.user.roleId[0]
      : req.user?.roleId;
    if (!allowedRoles.includes(roleId)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return next();
  };
const logsElasticRoleGuard = roleGuard(["superAdmin", "saasAdmin", "admin"]);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Adjust for SSE
  }),
);

// CORS configuration
const CORS_CONTROL_ACTIVE = process.env.CORS_CONTROL_ACTIVE === "true";
const corsOrigins = process.env.ALLOWED_ORIGINS ?? "";
const allowAllSubdomains = process.env.ALLOW_SUBDOMAINS === "true";

const parseOrigins = (str) =>
  (str || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const envOrigins = new Set(parseOrigins(corsOrigins));

const sameBaseDomain = (origin) => {
  try {
    const serviceUrl = process.env.SERVICE_URL;
    const { hostname, protocol } = new URL(serviceUrl);
    const { hostname: oHost, protocol: oProto } = new URL(origin);
    if (protocol !== oProto) return false;
    const base = getDomain(hostname);
    const apiBase = getDomain(oHost);
    return base && apiBase && base === apiBase;
  } catch {
    return false;
  }
};

for (let p = 5170; p <= 5190; p++) {
  envOrigins.add(`http://localhost:${p}`);
  envOrigins.add(`http://127.0.0.1:${p}`);
  envOrigins.add(`https://localhost:${p}`);
  envOrigins.add(`https://127.0.0.1:${p}`);
}

const allowed = [...envOrigins];

const exposedHeaders = ["lrmwufitcheck-access-token"];

const corsOptions = {
  origin(origin, cb) {
    if (!CORS_CONTROL_ACTIVE) return cb(null, true);

    if (!origin) return cb(null, true);

    if (allowed.includes(origin)) return cb(null, true);

    const subdomainOK = allowAllSubdomains && sameBaseDomain(origin);
    if (subdomainOK) return cb(null, true);

    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "lrmwufitcheck-access-token",
  ],
  exposedHeaders,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Compression - skip SSE streams to allow real-time delivery
app.use(
  compression({
    filter: (req, res) => {
      // Don't compress SSE responses
      if (res.getHeader("Content-Type") === "text/event-stream") {
        return false;
      }
      // Use default compression filter for other responses
      return compression.filter(req, res);
    },
  }),
);

// MCP server endpoint — MUST be before body parser
// SSE /messages needs raw request stream; StreamableHTTP uses inline express.json()
app.use("/mcp", authMiddleware);
app.use("/mcp", mcpServerRoutes);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/*
// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);
*/

// Root route - welcome message with service status (no auth required)
app.get("/", (req, res) => {
  const mcpManager = req.app.get("mcpManager");

  // Get connection status and tools from MCP manager
  let connectionStatus = {};
  let registeredTools = [];

  try {
    if (mcpManager) {
      connectionStatus = mcpManager.getConnectionStatus() || {};
      registeredTools = mcpManager.getAllTools() || [];
    }
  } catch (err) {
    // Ignore errors during startup
  }

  // Group tools by service
  const toolsByService = {};
  for (const tool of registeredTools) {
    const service = tool.service || "unknown";
    if (!toolsByService[service]) {
      toolsByService[service] = [];
    }
    toolsByService[service].push({
      name: tool.name,
      description: tool.description,
    });
  }

  // Get console stream status
  let consoleStreamStatus = null;
  try {
    const getStatus = req.app.get("consoleStreamStatus");
    if (getStatus) {
      consoleStreamStatus = getStatus();
    }
  } catch (err) {
    // Ignore errors
  }

  // Read startup logs
  let startupLogs = [];
  try {
    const startupLogPath = path.join(__dirname, "..", "logs", "startup.log");
    if (fs.existsSync(startupLogPath)) {
      const content = fs.readFileSync(startupLogPath, "utf8");
      startupLogs = content
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => {
          try {
            return JSON.parse(line);
          } catch {
            return { raw: line };
          }
        });
    }
  } catch (err) {
    startupLogs = [
      { error: "Failed to read startup logs", message: err.message },
    ];
  }

  // Read recent error logs (last 20 lines)
  let recentErrors = [];
  try {
    const errorLogPath = path.join(__dirname, "..", "logs", "mcpbff-error.log");
    if (fs.existsSync(errorLogPath)) {
      const content = fs.readFileSync(errorLogPath, "utf8");
      recentErrors = content
        .split("\n")
        .filter((line) => line.trim())
        .slice(-20)
        .map((line) => {
          try {
            return JSON.parse(line);
          } catch {
            return { raw: line };
          }
        });
    }
  } catch (err) {
    // Ignore errors reading error log
  }

  // Registry diagnostics from MCP manager (refresh lock, per-service tool source)
  let registryDiag = null;
  try {
    if (mcpManager?.getRegistryDiagnostics) {
      registryDiag = mcpManager.getRegistryDiagnostics();
    }
  } catch (err) {
    // Ignore
  }

  res.json({
    service: "lrmwufitcheck-mcpbff-service",
    name: "MCP-BFF Service",
    description:
      "Model Context Protocol Backend-for-Frontend service for FitCheck",
    status: "running",
    version: packageJson.version,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    endpoints: {
      health: "/api/health",
      chat: "/api/chat",
      tools: "/api/tools",
      elastic: "/api/elastic",
      logs: "/api/logs",
      docs: "/api/docs",
      consoleStream: "/ws/console-logs",
      consoleStreamStatus: "/api/console-logs/status",
      mcpServer: "/mcp (StreamableHTTP primary, /mcp/sse SSE fallback)",
    },
    documentation:
      "POST /api/chat to start a conversation with the AI assistant",
    consoleStream: consoleStreamStatus,
    mcpServices: connectionStatus,
    toolsSummary: {
      total: registeredTools.length,
      byService: Object.fromEntries(
        Object.keys(connectionStatus).map((service) => [
          service,
          {
            connected: connectionStatus[service]?.connected || false,
            url: connectionStatus[service]?.url || "unknown",
            toolCount: toolsByService[service]?.length || 0,
            cachedToolCount: connectionStatus[service]?.toolCount || 0,
            registryToolCount:
              connectionStatus[service]?.registryToolCount ?? "n/a",
            toolSource: connectionStatus[service]?.toolSource || "unknown",
            lastError: connectionStatus[service]?.lastError || null,
            lastFetchAt: connectionStatus[service]?.lastFetchAt || null,
          },
        ]),
      ),
    },
    registryDiagnostics: registryDiag,
    registeredTools: toolsByService,
    startupLogs,
    recentErrors: recentErrors.length > 0 ? recentErrors : undefined,
  });
});

app.get("/api", (req, res) => {
  res.json({
    service: "lrmwufitcheck-mcpbff-service",
    status: "running",
    endpoints: [
      "GET  /api/health - Health check",
      "POST /api/chat - Send chat message (SSE stream)",
      "GET  /api/tools - List available MCP tools",
      "POST /api/tools/call - Call specific MCP tool",
      "GET  /api/elastic/* - Elasticsearch queries",
      "GET  /api/logs/* - Log queries",
      "GET  /api/docs/* - API documentation",
      "WS   /ws/console-logs - Real-time console log stream",
      "GET  /api/console-logs/status - Console stream status",
      "POST /mcp - MCP server (StreamableHTTP)",
      "GET  /mcp/sse - MCP server (SSE fallback)",
    ],
  });
});

// Console logs stream status endpoint (no auth required for status)
app.get("/api/console-logs/status", (req, res) => {
  const getStatus = req.app.get("consoleStreamStatus");
  const status = getStatus
    ? getStatus()
    : { error: "Console stream not initialized" };
  res.json({
    ...status,
    websocketUrl: "/ws/console-logs",
    usage: {
      connect:
        "Connect to ws://<host>/ws/console-logs for real-time console logs",
      filter: "Add ?service=<service-name> to filter by service",
      setFilter:
        'Send { type: "set-filter", filters: { service: "..." } } to update filters',
    },
  });
});

// Health check (no auth required)
app.use("/api/health", healthRoutes);
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "lrmwufitcheck-mcpbff-service",
    timestamp: new Date().toISOString(),
  });
});

// Authentication middleware for protected routes
app.use("/api/chat", authMiddleware);
app.use("/api/tools", authMiddleware);
app.use("/api/elastic", authMiddleware);
app.use("/api/logs", authMiddleware);
app.use("/api/docs", authMiddleware);
app.use("/api/elastic", logsElasticRoleGuard);
app.use("/api/logs", logsElasticRoleGuard);

// Routes
app.use("/api/chat", chatRoutes);
app.use("/api/tools", toolsRoutes);
app.use("/api/elastic", elasticRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/docs", docsRoutes);
app.use("/api/ai-complete", aiCompleteRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
app.use(errorHandler);

module.exports = app;
