/**
 * MCP-BFF Service Entry Point
 *
 * FitCheck - AI Chat Interface Backend
 *
 * This service acts as an MCP client hub, connecting to various MCP servers
 * in the project and exposing a unified interface for the frontend chat UI.
 */

const path = require("path");
const fs = require("fs");

// Early startup logging - write to file before winston is loaded
const startupLogPath = path.join(__dirname, "..", "logs", "startup.log");
function logStartup(message, data = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    message,
    ...data,
  };
  const line = JSON.stringify(entry) + "\n";
  console.log(`[STARTUP] ${message}`, data);
  try {
    // Ensure logs directory exists
    const logsDir = path.dirname(startupLogPath);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    fs.appendFileSync(startupLogPath, line);
  } catch (err) {
    console.error("[STARTUP] Failed to write startup log:", err.message);
  }
}

// Clear previous startup log and start fresh
try {
  const logsDir = path.join(__dirname, "..", "logs");
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  fs.writeFileSync(startupLogPath, "");
} catch (err) {
  console.error("[STARTUP] Failed to clear startup log:", err.message);
}

logStartup("MCP-BFF starting", {
  pid: process.pid,
  nodeVersion: process.version,
  cwd: process.cwd(),
});

// Load environment variables
// Priority: .env.local > .env > .<SERVICE_CONFIG>.env (e.g. .test.env, .stage.env, .prod.env)
// SERVICE_CONFIG defaults to "test" to match business service convention
const envLocalPath = path.join(__dirname, "..", ".env.local");
const envPath = path.join(__dirname, "..", ".env");
const serviceConfig =
  process.env.SERVICE_CONFIG || process.env.CONFIG_ENV || "test";
const serviceConfigPath = path.join(__dirname, "..", `.${serviceConfig}.env`);

if (fs.existsSync(envLocalPath)) {
  logStartup("Loading .env.local", { path: envLocalPath });
  require("dotenv").config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  logStartup("Loading .env", { path: envPath });
  require("dotenv").config({ path: envPath });
} else if (fs.existsSync(serviceConfigPath)) {
  logStartup(`Loading .${serviceConfig}.env`, { path: serviceConfigPath });
  require("dotenv").config({ path: serviceConfigPath });
} else {
  logStartup("No .env file found, using environment variables");
  require("dotenv").config();
}

logStartup("Environment loaded", {
  HTTP_PORT: process.env.HTTP_PORT,
  HOST: process.env.HOST,
  REDIS_HOST: process.env.REDIS_HOST,
  ELASTICSEARCH_NODE: process.env.ELASTICSEARCH_NODE ? "set" : "not set",
});

let http,
  app,
  McpClientManager,
  logger,
  setupConsoleStreamWebSocket,
  closeConsoleStream,
  getConsoleStreamStatus;

try {
  logStartup("Loading http module");
  http = require("http");

  logStartup("Loading express-app");
  app = require("./express-app");

  logStartup("Loading mcp-client-manager");
  ({ McpClientManager } = require("./mcp-client-manager"));

  logStartup("Loading logger");
  logger = require("./common/logger");

  logStartup("Loading console-stream");
  ({
    setupConsoleStreamWebSocket,
    closeConsoleStream,
    getConsoleStreamStatus,
  } = require("./routes/console-stream"));

  logStartup("All modules loaded successfully");
} catch (err) {
  logStartup("FATAL: Failed to load modules", {
    error: err.message,
    stack: err.stack,
    code: err.code,
  });
  process.exit(1);
}

const HTTP_PORT = process.env.HTTP_PORT || 3005;
const HOST = process.env.HOST || "0.0.0.0";

// Service URLs — base URLs for all services (MCP endpoint is SERVICE_URL + '/mcp')
// Dev ports: auth=3001, system services 3002-3004, mcp-bff=3005, frontend=5173, business=3050+
const SERVICE_ENDPOINTS = {
  auth: process.env.AUTH_SERVICE_URL || "http://localhost:3001",
  invitationCenter:
    process.env.INVITATIONCENTER_SERVICE_URL || "http://localhost:3050",
  nutritionLibrary:
    process.env.NUTRITIONLIBRARY_SERVICE_URL || "http://localhost:3051",
  mealTracker: process.env.MEALTRACKER_SERVICE_URL || "http://localhost:3052",
  nutritionAi: process.env.NUTRITIONAI_SERVICE_URL || "http://localhost:3053",
  agentHub: process.env.AGENTHUB_SERVICE_URL || "http://localhost:3006",
};

// Service endpoints are used directly — the RestServiceClient appends /api/mcp-tools internally
const MCP_ENDPOINTS = { ...SERVICE_ENDPOINTS };

async function startServer() {
  try {
    logStartup("startServer() called");

    // Initialize MCP Client Manager
    logStartup("Initializing MCP Client Manager", {
      endpoints: Object.keys(MCP_ENDPOINTS),
    });
    const mcpManager = new McpClientManager(MCP_ENDPOINTS);

    // Make MCP manager available to routes
    app.set("mcpManager", mcpManager);
    logStartup("MCP manager set on app");

    // Connect to MCP servers
    logStartup("Connecting to MCP servers...");
    logger.info("Connecting to MCP servers...");
    await mcpManager.connectAll();
    logStartup("MCP connections established");
    logger.info("MCP connections established");

    // Start health check to reconnect services that start later
    mcpManager.startHealthCheck(30000); // Check every 30 seconds
    logStartup("MCP health check started");
    logger.info("MCP health check started (30s interval)");

    // Create HTTP server
    logStartup("Creating HTTP server");
    const server = http.createServer(app);

    // Setup WebSocket server for console log streaming
    logStartup("Setting up WebSocket server for console logs");
    const wss = setupConsoleStreamWebSocket(server);
    app.set("consoleStreamStatus", getConsoleStreamStatus);
    logStartup("WebSocket server initialized");
    logger.info("Console log WebSocket stream initialized");

    // Start listening
    logStartup("Starting HTTP server", { port: HTTP_PORT, host: HOST });
    server.listen(HTTP_PORT, HOST, () => {
      logStartup("HTTP server started successfully", {
        port: HTTP_PORT,
        host: HOST,
      });
      logger.info(`MCP-BFF Service started on ${HOST}:${HTTP_PORT}`);
      logger.info(`Project: lrmwufitcheck`);
      logger.info("Available endpoints:");
      logger.info("  POST /api/chat - Send chat message");
      logger.info("  GET  /api/tools - List available MCP tools");
      logger.info("  POST /api/tools/call - Call specific MCP tool");
      logger.info("  GET  /api/health - Health check");
      logger.info("  WS   /ws/console-logs - Real-time console log stream");
    });

    server.on("error", (err) => {
      logStartup("HTTP server error", {
        error: err.message,
        code: err.code,
        stack: err.stack,
      });
      logger.error("HTTP server error:", err);
    });

    // Graceful shutdown
    const shutdown = async () => {
      logStartup("Shutdown signal received");
      logger.info("Shutting down MCP-BFF service...");
      mcpManager.stopHealthCheck();
      await mcpManager.disconnectAll();
      await closeConsoleStream();
      server.close(() => {
        logStartup("Server closed");
        logger.info("Server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    logStartup("FATAL: Failed to start server", {
      error: error.message,
      stack: error.stack,
      code: error.code,
    });
    logger.error("Failed to start MCP-BFF service:", error);
    process.exit(1);
  }
}

startServer();
