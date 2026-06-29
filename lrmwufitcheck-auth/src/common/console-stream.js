/**
 * Console Stream Module
 *
 * WebSocket-based real-time console log streaming for business services.
 *
 * This module handles:
 * 1. WebSocket connections from clients for live console log viewing
 * 2. Redis pub/sub subscription to receive logs from all services
 * 3. Log filtering and broadcasting to connected clients
 */

const { WebSocketServer } = require("ws");
const { redisClient, connectToRedis } = require("./redis");
const { createClient } = require("redis");

// Legacy Redis channel (deprecated — kept for backward compat with old services)
const CONSOLE_LOG_CHANNEL = "console-logs";

// Project-specific channel — resolved at runtime from PROJECT_CODENAME env var
function getProjectChannel() {
  const codename = process.env.PROJECT_CODENAME;
  return codename ? `console-logs:${codename}` : null;
}

// Track connected WebSocket clients
const clients = new Map(); // Map<ws, { filters: { service?: string } }>

// Redis subscriber client (separate from main client for pub/sub)
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
    console.log(
      `[ConsoleStream] Connecting to Redis at ${redisHost}:${redisPort}...`,
    );

    redisSubscriber = createClient({
      socket: {
        host: redisHost,
        port: parseInt(redisPort),
        reconnectStrategy: (retries) => {
          // Exponential backoff with max delay
          const delay = Math.min(retries * 1000, MAX_RETRY_DELAY);
          console.log(
            `[ConsoleStream] Redis reconnect attempt ${retries}, delay: ${delay}ms`,
          );
          return delay;
        },
      },
      username: redisUser || undefined,
      password: redisPwd || undefined,
    });

    redisSubscriber.on("error", (err) => {
      console.log("[ConsoleStream] Redis subscriber error:", err.message);
      isRedisConnected = false;
    });

    redisSubscriber.on("reconnecting", () => {
      console.log("[ConsoleStream] Redis subscriber reconnecting...");
      isRedisConnected = false;
    });

    redisSubscriber.on("ready", () => {
      console.log("[ConsoleStream] Redis subscriber ready");
      isRedisConnected = true;
      redisRetryCount = 0;
    });

    await redisSubscriber.connect();
    isRedisConnected = true;
    redisRetryCount = 0;
    console.log(
      `[ConsoleStream] Redis subscriber connected to ${redisHost}:${redisPort}`,
    );

    const messageHandler = (message) => {
      try {
        const logEntry = JSON.parse(message);
        broadcastLog(logEntry);
      } catch (err) {
        // Silently fail - don't log to avoid loops
      }
    };

    // Subscribe to project-specific channel (primary)
    const projectChannel = getProjectChannel();
    if (projectChannel) {
      await redisSubscriber.subscribe(projectChannel, messageHandler);
      console.log(
        `[ConsoleStream] Subscribed to project channel: ${projectChannel}`,
      );
    }
    // Subscribe to legacy shared channel (deprecated, for old services not yet rebuilt)
    await redisSubscriber.subscribe(CONSOLE_LOG_CHANNEL, messageHandler);
    console.log(
      `[ConsoleStream] Subscribed to legacy channel: ${CONSOLE_LOG_CHANNEL}`,
    );
  } catch (err) {
    console.log(
      "[ConsoleStream] Failed to connect Redis subscriber:",
      err.message,
    );
    isRedisConnected = false;

    // Schedule retry with exponential backoff
    redisRetryCount++;
    const retryDelay = Math.min(redisRetryCount * 5000, MAX_RETRY_DELAY);
    console.log(
      `[ConsoleStream] Will retry Redis connection in ${retryDelay}ms (attempt ${redisRetryCount})`,
    );

    redisRetryTimeout = setTimeout(() => {
      initRedisSubscriber();
    }, retryDelay);
  }
}

/**
 * Broadcast a log entry to all connected WebSocket clients
 * Applies per-client filters
 */
function broadcastLog(logEntry) {
  const message = JSON.stringify({
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
        ws.send(message);
      } catch (err) {
        // Silently fail - don't log to avoid loops
      }
    }
  });
}

/**
 * Setup WebSocket server for console log streaming
 *
 * @param {Object} server - HTTP server instance
 * @returns {WebSocketServer} - The WebSocket server instance
 */
function setupConsoleStreamWebSocket(server) {
  const wss = new WebSocketServer({
    server,
    path: "/ws/console-logs",
  });

  console.log(
    "[ConsoleStream] WebSocket server initialized at /ws/console-logs",
  );

  wss.on("connection", (ws, req) => {
    // Parse query params for initial filters
    const url = new URL(req.url, `http://${req.headers.host}`);
    const serviceFilter = url.searchParams.get("service") || "all";

    // Store client with filters
    clients.set(ws, {
      filters: { service: serviceFilter },
      connectedAt: new Date(),
    });

    console.log(
      `[ConsoleStream] Client connected (total: ${clients.size}), filter: service=${serviceFilter}`,
    );

    // Send welcome message
    ws.send(
      JSON.stringify({
        type: "connected",
        data: {
          message: "Connected to console log stream",
          service: process.env.SERVICE_NAME || "unknown",
          filters: { service: serviceFilter },
          redisConnected: isRedisConnected,
        },
      }),
    );

    // Handle messages from client (for filter updates)
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type === "set-filter") {
          const clientData = clients.get(ws);
          if (clientData) {
            clientData.filters = { ...clientData.filters, ...data.filters };
            console.log(
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
          ws.send(JSON.stringify({ type: "pong" }));
        }
      } catch (err) {
        // Silently fail
      }
    });

    // Handle client disconnect
    ws.on("close", () => {
      clients.delete(ws);
      console.log(
        `[ConsoleStream] Client disconnected (remaining: ${clients.size})`,
      );
    });

    ws.on("error", (err) => {
      console.log("[ConsoleStream] WebSocket error:", err.message);
      clients.delete(ws);
    });
  });

  // Initialize Redis subscriber
  initRedisSubscriber();

  return wss;
}

/**
 * Get console stream status
 */
function getConsoleStreamStatus() {
  return {
    connectedClients: clients.size,
    redisConnected: isRedisConnected,
    channel: getProjectChannel() || CONSOLE_LOG_CHANNEL,
    legacyChannel: CONSOLE_LOG_CHANNEL,
    service: process.env.SERVICE_NAME || "unknown",
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

  // Disconnect Redis subscriber
  if (redisSubscriber) {
    try {
      const projectChannel = getProjectChannel();
      if (projectChannel) {
        await redisSubscriber.unsubscribe(projectChannel);
      }
      await redisSubscriber.unsubscribe(CONSOLE_LOG_CHANNEL);
      await redisSubscriber.quit();
    } catch (err) {
      console.log(
        "[ConsoleStream] Error closing Redis subscriber:",
        err.message,
      );
    }
  }

  console.log("[ConsoleStream] Console stream closed");
}

module.exports = {
  setupConsoleStreamWebSocket,
  getConsoleStreamStatus,
  closeConsoleStream,
  CONSOLE_LOG_CHANNEL,
};
