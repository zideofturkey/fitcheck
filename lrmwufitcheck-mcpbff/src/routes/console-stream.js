/**
 * Console Stream Routes
 *
 * WebSocket-based real-time console log streaming for FitCheck
 *
 * This module handles:
 * 1. WebSocket connections from Frontgate for live console log viewing
 * 2. Redis pub/sub subscription to receive logs from business services
 * 3. Log filtering and broadcasting to connected clients
 */

const { WebSocketServer } = require("ws");
const { createClient } = require("redis");
const logger = require("../common/logger");

// Project-specific Redis channel (new — services publish here after rebuild)
const PROJECT_CODENAME = "lrmwufitcheck";
const CONSOLE_LOG_CHANNEL = `console-logs:${PROJECT_CODENAME}`;

// Legacy shared channel (deprecated — kept for backward compat with old services)
const CONSOLE_LOG_CHANNEL_LEGACY = "console-logs";

// Track connected WebSocket clients
const clients = new Map(); // Map<ws, { filters: { service?: string } }>

// Track connected SSE clients
const sseClients = new Map(); // Map<res, { filters: { service?: string, logType?: string } }>

// Track service heartbeats (which services are actively publishing)
const serviceHeartbeats = new Map(); // Map<serviceName, { lastSeen: Date, stats: Object }>

// Redis subscriber client
let redisSubscriber = null;
let isRedisConnected = false;
let redisRetryTimeout = null;
let redisRetryCount = 0;
const MAX_RETRY_DELAY = 60000; // Max 60 seconds between retries

/**
 * Initialize Redis subscriber for console logs
 * With automatic retry on failure
 */
async function initRedisSubscriber() {
  const redisHost = process.env.REDIS_HOST || "redis";
  const redisPort = process.env.REDIS_PORT || 6379;
  const redisUser = process.env.REDIS_USER || null;
  const redisPwd = process.env.REDIS_PWD || null;

  // Clear any existing retry timeout
  if (redisRetryTimeout) {
    clearTimeout(redisRetryTimeout);
    redisRetryTimeout = null;
  }

  // Close existing connection if any
  if (redisSubscriber) {
    try {
      await redisSubscriber.quit();
    } catch (e) {
      // Ignore
    }
    redisSubscriber = null;
  }

  try {
    logger.info(
      `[ConsoleStream] Connecting to Redis at ${redisHost}:${redisPort}...`,
    );

    redisSubscriber = createClient({
      socket: {
        host: redisHost,
        port: parseInt(redisPort),
        reconnectStrategy: (retries) => {
          // Exponential backoff with max delay
          const delay = Math.min(retries * 1000, MAX_RETRY_DELAY);
          logger.info(
            `[ConsoleStream] Redis reconnect attempt ${retries}, delay: ${delay}ms`,
          );
          return delay;
        },
      },
      username: redisUser || undefined,
      password: redisPwd || undefined,
    });

    redisSubscriber.on("error", (err) => {
      logger.error("[ConsoleStream] Redis subscriber error:", err.message);
      isRedisConnected = false;
    });

    redisSubscriber.on("reconnecting", () => {
      logger.info("[ConsoleStream] Redis subscriber reconnecting...");
      isRedisConnected = false;
    });

    // Handler for the project-specific channel (trusted, no filtering needed)
    const messageHandler = (message) => {
      try {
        const logEntry = JSON.parse(message);
        broadcastLog(logEntry);
      } catch (err) {
        logger.error(
          "[ConsoleStream] Failed to parse log message:",
          err.message,
        );
      }
    };

    // Handler for the legacy shared channel (needs project filtering)
    const legacyMessageHandler = (message) => {
      try {
        const logEntry = JSON.parse(message);
        if (
          logEntry.projectCodename &&
          logEntry.projectCodename !== PROJECT_CODENAME
        ) {
          return;
        }
        broadcastLog(logEntry);
      } catch (err) {
        logger.error(
          "[ConsoleStream] Failed to parse legacy log message:",
          err.message,
        );
      }
    };

    redisSubscriber.on("ready", async () => {
      logger.info("[ConsoleStream] Redis subscriber ready");
      isRedisConnected = true;
      redisRetryCount = 0;

      // Re-subscribe after reconnection (Redis client may lose subscriptions)
      try {
        await redisSubscriber.subscribe(CONSOLE_LOG_CHANNEL, messageHandler);
        await redisSubscriber.subscribe(
          CONSOLE_LOG_CHANNEL_LEGACY,
          legacyMessageHandler,
        );
        logger.info(
          `[ConsoleStream] Re-subscribed to channels: ${CONSOLE_LOG_CHANNEL}, ${CONSOLE_LOG_CHANNEL_LEGACY}`,
        );
      } catch (err) {
        logger.error("[ConsoleStream] Failed to re-subscribe:", err.message);
      }
    });

    await redisSubscriber.connect();
    isRedisConnected = true;
    redisRetryCount = 0;
    logger.info(
      `[ConsoleStream] Redis subscriber connected to ${redisHost}:${redisPort}`,
    );

    // Subscribe to project-specific channel
    await redisSubscriber.subscribe(CONSOLE_LOG_CHANNEL, messageHandler);
    // Subscribe to legacy shared channel (deprecated, for old services not yet rebuilt)
    await redisSubscriber.subscribe(
      CONSOLE_LOG_CHANNEL_LEGACY,
      legacyMessageHandler,
    );

    logger.info(
      `[ConsoleStream] Subscribed to channels: ${CONSOLE_LOG_CHANNEL}, ${CONSOLE_LOG_CHANNEL_LEGACY} (legacy)`,
    );
  } catch (err) {
    logger.error(
      "[ConsoleStream] Failed to connect Redis subscriber:",
      err.message,
    );
    isRedisConnected = false;

    // Schedule retry with exponential backoff
    redisRetryCount++;
    const retryDelay = Math.min(redisRetryCount * 5000, MAX_RETRY_DELAY);
    logger.info(
      `[ConsoleStream] Will retry Redis connection in ${retryDelay}ms (attempt ${redisRetryCount})`,
    );

    redisRetryTimeout = setTimeout(() => {
      initRedisSubscriber();
    }, retryDelay);
  }
}

/**
 * Broadcast a log entry to all connected clients (WebSocket and SSE)
 * Applies per-client filters
 * Also tracks service heartbeats
 */
function broadcastLog(logEntry) {
  // Check if this is a service heartbeat
  if (logEntry.type === "heartbeat") {
    const serviceName = logEntry.logSource;
    serviceHeartbeats.set(serviceName, {
      lastSeen: new Date(),
      stats: logEntry.stats || {},
      projectCodename: logEntry.projectCodename,
    });
    // Don't broadcast heartbeats to clients (they're internal)
    logger.debug(`[ConsoleStream] Service heartbeat from ${serviceName}`);
    return;
  }

  // Track regular log activity from services
  if (logEntry.logSource) {
    const existing = serviceHeartbeats.get(logEntry.logSource);
    serviceHeartbeats.set(logEntry.logSource, {
      lastSeen: new Date(),
      stats: existing?.stats || {},
      projectCodename: logEntry.projectCodename || existing?.projectCodename,
    });
  }

  // Send to WebSocket clients
  const wsMessage = JSON.stringify({
    type: "console-log",
    data: logEntry,
  });

  clients.forEach((clientData, ws) => {
    if (ws.readyState === 1) {
      // WebSocket.OPEN
      // Apply service filter if set
      if (
        clientData.filters?.service &&
        clientData.filters.service !== "all" &&
        logEntry.logSource !== clientData.filters.service
      ) {
        return; // Skip this client - doesn't match filter
      }

      try {
        ws.send(wsMessage);
      } catch (err) {
        logger.error(
          "[ConsoleStream] Failed to send to WS client:",
          err.message,
        );
      }
    }
  });

  // Send to SSE clients
  sseClients.forEach((clientData, res) => {
    // Apply service filter if set
    if (
      clientData.filters?.service &&
      clientData.filters.service !== "all" &&
      logEntry.logSource !== clientData.filters.service
    ) {
      return; // Skip this client - doesn't match filter
    }

    // Apply logType filter if set
    if (
      clientData.filters?.logType !== undefined &&
      clientData.filters.logType !== "all" &&
      logEntry.logType !== parseInt(clientData.filters.logType)
    ) {
      return; // Skip this client - doesn't match filter
    }

    try {
      // SSE format: event: type\ndata: json\n\n
      res.write(`event: console-log\ndata: ${JSON.stringify(logEntry)}\n\n`);
    } catch (err) {
      logger.error(
        "[ConsoleStream] Failed to send to SSE client:",
        err.message,
      );
      // Remove dead client
      sseClients.delete(res);
    }
  });
}

// Heartbeat interval (30 seconds - must be less than proxy timeout, typically 60s)
const HEARTBEAT_INTERVAL_MS = 30000;
let heartbeatInterval = null;

/**
 * Send heartbeat to all connected clients (WebSocket and SSE)
 * This keeps the connection alive through proxies and lets clients know the server is healthy
 */
function sendHeartbeat() {
  const heartbeatData = {
    timestamp: Date.now(),
    redisConnected: isRedisConnected,
    wsClients: clients.size,
    sseClients: sseClients.size,
  };

  // Send to WebSocket clients
  const wsMessage = JSON.stringify({
    type: "heartbeat",
    data: heartbeatData,
  });

  clients.forEach((clientData, ws) => {
    if (ws.readyState === 1) {
      // WebSocket.OPEN
      try {
        ws.send(wsMessage);
      } catch (err) {
        // Client might be disconnecting
      }
    }
  });

  // Send to SSE clients (as comment to keep connection alive)
  sseClients.forEach((clientData, res) => {
    try {
      res.write(`event: heartbeat\ndata: ${JSON.stringify(heartbeatData)}\n\n`);
    } catch (err) {
      // Client might be disconnecting, remove it
      sseClients.delete(res);
    }
  });
}

/**
 * Setup WebSocket server for console log streaming
 *
 * @param {Object} server - HTTP server instance
 */
function setupConsoleStreamWebSocket(server) {
  // Use noServer mode to handle path matching manually
  // This allows flexibility with reverse proxy configurations
  const wss = new WebSocketServer({ noServer: true });

  // Handle upgrade requests manually to support both direct and proxied paths
  server.on("upgrade", (request, socket, head) => {
    const fullUrl = request.url || "";
    const pathname = fullUrl.split("?")[0] || "";

    logger.info(
      `[ConsoleStream] Upgrade request received - URL: ${fullUrl}, pathname: ${pathname}`,
    );
    logger.info(
      `[ConsoleStream] Request headers: ${JSON.stringify({
        host: request.headers?.host,
        upgrade: request.headers?.upgrade,
        connection: request.headers?.connection,
        origin: request.headers?.origin,
      })}`,
    );

    // Accept /ws/console-logs or paths ending with /ws/console-logs (for reverse proxy)
    // e.g., /ws/console-logs, /mcpbff-api/ws/console-logs, etc.
    if (
      pathname === "/ws/console-logs" ||
      pathname.endsWith("/ws/console-logs")
    ) {
      logger.info(`[ConsoleStream] Path matched, handling WebSocket upgrade`);
      try {
        wss.handleUpgrade(request, socket, head, (ws) => {
          logger.info(
            `[ConsoleStream] Upgrade successful, emitting connection event`,
          );
          wss.emit("connection", ws, request);
        });
      } catch (upgradeErr) {
        logger.error(`[ConsoleStream] Upgrade failed: ${upgradeErr.message}`);
        socket.destroy();
      }
    } else {
      // Not for us - log and close
      logger.info(
        `[ConsoleStream] Path not matched (${pathname}), destroying socket`,
      );
      socket.destroy();
    }
  });

  logger.info(
    "[ConsoleStream] WebSocket server initialized (handles /ws/console-logs with any prefix)",
  );

  // Start heartbeat interval to keep connections alive through proxies
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }
  heartbeatInterval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
  logger.info(
    `[ConsoleStream] Heartbeat interval started (${HEARTBEAT_INTERVAL_MS}ms)`,
  );

  // Handle WebSocket-level ping/pong for connection health
  wss.on("connection", (ws, req) => {
    logger.info(`[ConsoleStream] Connection event fired, req.url: ${req?.url}`);

    // Parse query params for initial filters
    let serviceFilter = "all";
    try {
      const url = new URL(
        req.url || "/ws/console-logs",
        `http://${req.headers?.host || "localhost"}`,
      );
      serviceFilter = url.searchParams.get("service") || "all";
    } catch (parseErr) {
      logger.warn(
        `[ConsoleStream] Failed to parse URL: ${parseErr.message}, using defaults`,
      );
    }

    // Mark connection as alive
    ws.isAlive = true;

    // Handle pong responses (from ws.ping())
    ws.on("pong", () => {
      ws.isAlive = true;
    });

    // Store client with filters
    clients.set(ws, {
      filters: { service: serviceFilter },
      connectedAt: new Date(),
    });

    logger.info(
      `[ConsoleStream] Client connected (total: ${clients.size}), filter: service=${serviceFilter}`,
    );

    // Send welcome message immediately
    try {
      const welcomeMessage = JSON.stringify({
        type: "connected",
        data: {
          message: "Connected to console log stream",
          filters: { service: serviceFilter },
          redisConnected: isRedisConnected,
          heartbeatInterval: HEARTBEAT_INTERVAL_MS,
          serverTime: Date.now(),
        },
      });
      logger.info(
        `[ConsoleStream] Sending welcome message: ${welcomeMessage.substring(0, 100)}...`,
      );
      ws.send(welcomeMessage);
      logger.info(`[ConsoleStream] Welcome message sent successfully`);
    } catch (sendErr) {
      logger.error(
        `[ConsoleStream] Failed to send welcome message: ${sendErr.message}`,
      );
    }

    // Log socket errors
    ws.on("error", (err) => {
      logger.error(
        `[ConsoleStream] WebSocket error for client: ${err.message}`,
      );
    });

    // Handle messages from client (for filter updates)
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type === "set-filter") {
          const clientData = clients.get(ws);
          if (clientData) {
            clientData.filters = { ...clientData.filters, ...data.filters };
            logger.info(
              `[ConsoleStream] Client updated filters:`,
              clientData.filters,
            );

            ws.send(
              JSON.stringify({
                type: "filter-updated",
                data: { filters: clientData.filters },
              }),
            );
          }
        } else if (data.type === "ping") {
          // Application-level ping
          ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
        }
      } catch (err) {
        logger.error(
          "[ConsoleStream] Failed to parse client message:",
          err.message,
        );
      }
    });

    // Handle client disconnect
    ws.on("close", () => {
      clients.delete(ws);
      logger.info(
        `[ConsoleStream] Client disconnected (remaining: ${clients.size})`,
      );
    });

    ws.on("error", (err) => {
      logger.error("[ConsoleStream] WebSocket error:", err.message);
      clients.delete(ws);
    });
  });

  // WebSocket-level ping to detect dead connections (every 30 seconds)
  const pingInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        logger.info("[ConsoleStream] Terminating inactive client");
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping(); // ws library will handle pong automatically
    });
  }, HEARTBEAT_INTERVAL_MS);

  wss.on("close", () => {
    clearInterval(pingInterval);
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  });

  // Initialize Redis subscriber
  initRedisSubscriber();

  return wss;
}

/**
 * Register an SSE client for console log streaming
 * @param {Object} res - Express response object
 * @param {Object} filters - Initial filters { service?: string, logType?: string }
 * @returns {Function} Cleanup function to call when connection closes
 */
function registerSseClient(res, filters = {}) {
  sseClients.set(res, {
    filters,
    connectedAt: new Date(),
  });
  logger.info(
    `[ConsoleStream] SSE client connected (total: ${sseClients.size}), filters: ${JSON.stringify(filters)}`,
  );

  // Return cleanup function
  return () => {
    sseClients.delete(res);
    logger.info(
      `[ConsoleStream] SSE client disconnected (remaining: ${sseClients.size})`,
    );
  };
}

/**
 * Check if Redis is connected
 */
function isRedisReady() {
  return isRedisConnected;
}

/**
 * Get list of active services (for dropdown filter)
 * Returns array of { name: string, count: number } for compatibility with ES-based endpoint
 */
function getActiveServices() {
  const now = Date.now();
  const services = [];

  serviceHeartbeats.forEach((data, serviceName) => {
    const lastSeenMs = now - data.lastSeen.getTime();
    const isActive = lastSeenMs < 120000; // Consider active if seen in last 2 minutes

    if (isActive) {
      services.push({
        name: serviceName,
        count: data.stats?.logsPublished || 0,
        lastSeen: data.lastSeen.toISOString(),
        isActive: true,
      });
    }
  });

  // Sort by name for consistent ordering
  services.sort((a, b) => a.name.localeCompare(b.name));

  return services;
}

/**
 * Get console stream status
 */
function getConsoleStreamStatus() {
  // Get WebSocket client details
  const wsClientDetails = [];
  clients.forEach((data, ws) => {
    wsClientDetails.push({
      type: "websocket",
      filters: data.filters,
      connectedAt: data.connectedAt,
      readyState: ws.readyState,
      readyStateLabel:
        ["CONNECTING", "OPEN", "CLOSING", "CLOSED"][ws.readyState] || "UNKNOWN",
      isAlive: ws.isAlive,
    });
  });

  // Get SSE client details
  const sseClientDetails = [];
  sseClients.forEach((data, res) => {
    sseClientDetails.push({
      type: "sse",
      filters: data.filters,
      connectedAt: data.connectedAt,
    });
  });

  // Get service heartbeat details
  const now = Date.now();
  const serviceDetails = [];
  serviceHeartbeats.forEach((data, serviceName) => {
    const lastSeenMs = now - data.lastSeen.getTime();
    const isActive = lastSeenMs < 60000; // Consider active if seen in last 60 seconds
    serviceDetails.push({
      serviceName,
      lastSeen: data.lastSeen.toISOString(),
      lastSeenAgo: `${Math.round(lastSeenMs / 1000)}s ago`,
      isActive,
      stats: data.stats,
      projectCodename: data.projectCodename,
    });
  });

  return {
    websocket: {
      connectedClients: clients.size,
      clients: wsClientDetails,
      heartbeatIntervalMs: HEARTBEAT_INTERVAL_MS,
    },
    sse: {
      connectedClients: sseClients.size,
      clients: sseClientDetails,
    },
    redis: {
      connected: isRedisConnected,
      channel: CONSOLE_LOG_CHANNEL,
      legacyChannel: CONSOLE_LOG_CHANNEL_LEGACY + " (deprecated)",
      host: process.env.REDIS_HOST || "redis",
      port: process.env.REDIS_PORT || 6379,
    },
    services: {
      count: serviceHeartbeats.size,
      activeCount: serviceDetails.filter((s) => s.isActive).length,
      details: serviceDetails,
    },
    server: {
      uptime: process.uptime(),
      timestamp: Date.now(),
    },
  };
}

/**
 * Graceful shutdown
 */
async function closeConsoleStream() {
  // Clear retry timeout
  if (redisRetryTimeout) {
    clearTimeout(redisRetryTimeout);
    redisRetryTimeout = null;
  }

  // Close all WebSocket connections
  clients.forEach((_, ws) => {
    try {
      ws.close(1001, "Server shutting down");
    } catch (err) {
      // Ignore close errors
    }
  });
  clients.clear();

  // End all SSE connections
  sseClients.forEach((_, res) => {
    try {
      res.end();
    } catch (err) {
      // Ignore close errors
    }
  });
  sseClients.clear();

  // Disconnect Redis subscriber
  if (redisSubscriber) {
    try {
      await redisSubscriber.unsubscribe(CONSOLE_LOG_CHANNEL);
      await redisSubscriber.unsubscribe(CONSOLE_LOG_CHANNEL_LEGACY);
      await redisSubscriber.quit();
    } catch (err) {
      logger.error(
        "[ConsoleStream] Error closing Redis subscriber:",
        err.message,
      );
    }
  }

  logger.info("[ConsoleStream] Console stream closed");
}

module.exports = {
  setupConsoleStreamWebSocket,
  getConsoleStreamStatus,
  getActiveServices,
  closeConsoleStream,
  registerSseClient,
  isRedisReady,
  CONSOLE_LOG_CHANNEL,
};
