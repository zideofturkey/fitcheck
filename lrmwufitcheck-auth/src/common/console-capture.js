/**
 * Console Capture Module
 *
 * Captures console.log, console.error, console.warn, console.info, console.debug
 * and streams them to:
 * 1. Elasticsearch via hexaLogger (persistent storage, 2-day retention)
 * 2. Redis pub/sub for real-time streaming to MCP-BFF
 *
 * Usage:
 *   const { initConsoleCapture } = require('./common/console-capture');
 *   initConsoleCapture({ hexaLogger, redisClient });
 */

// We use direct console method overriding instead of patch-console for reliability

// Console log retention period in days
const CONSOLE_LOG_RETENTION_DAYS = 2;

// Legacy Redis channel (deprecated — kept only for reference)
const CONSOLE_LOG_CHANNEL = "console-logs";

// Project-specific channel — set during init from PROJECT_CODENAME env var
let _projectChannel = null;

// Throttle cleanup to run at most once per hour
let lastCleanupTime = 0;
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

// Buffer for batching logs to Redis (reduces publish frequency)
let logBuffer = [];
let flushTimeout = null;
const FLUSH_INTERVAL_MS = 100; // Flush every 100ms if there are buffered logs

// Store hexaLogger reference for cleanup
let _hexaLogger = null;

// Heartbeat interval for service status (30 seconds)
const HEARTBEAT_INTERVAL_MS = 30000;
let heartbeatInterval = null;
let _redisClient = null;
let _serviceName = null;
let _projectName = null;

// Track Redis publish failures for debugging
let lastPublishError = null;
let publishErrorCount = 0;

// Track log processing stats
let logsProcessed = 0;
let logsPublished = 0;
let logsSkipped = 0;
let logsDroppedNoRedis = 0;

/**
 * Get caller location from stack trace
 * Skips internal frames to find the actual caller
 */
function getCallerLocation() {
  const err = new Error();
  const stack = err.stack?.split("\n") || [];

  // Skip: Error, getCallerLocation, console method override, patchConsole internals
  // Look for the first line that's not from console-capture.js or patch-console
  for (let i = 3; i < stack.length; i++) {
    const line = stack[i];
    if (
      line &&
      !line.includes("console-capture.js") &&
      !line.includes("patch-console") &&
      !line.includes("node:internal")
    ) {
      // Extract file:line from stack trace
      const match = line.match(/at\s+(?:.*?\s+\()?(.+?):(\d+):\d+\)?/);
      if (match) {
        const file = match[1].replace(/.*[/\\]/, ""); // Get filename only
        const lineNum = match[2];
        return `${file}:${lineNum}`;
      }
    }
  }
  return "unknown";
}

/**
 * Format console arguments to string
 */
function formatArgs(args) {
  return args
    .map((arg) => {
      if (arg === undefined) return "undefined";
      if (arg === null) return "null";
      if (typeof arg === "object") {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    })
    .join(" ");
}

/**
 * Flush buffered logs to Redis
 */
async function flushLogBuffer(redisClient) {
  if (logBuffer.length === 0) return;

  const logsToSend = [...logBuffer];
  logBuffer = [];

  try {
    if (redisClient && redisClient.isOpen) {
      const channel = _projectChannel || CONSOLE_LOG_CHANNEL;
      // Send each log individually for real-time streaming
      for (const log of logsToSend) {
        await redisClient.publish(channel, JSON.stringify(log));
        logsPublished++;
      }
      // Reset error count on success
      if (publishErrorCount > 0) {
        publishErrorCount = 0;
        lastPublishError = null;
      }
    } else {
      // Track when Redis is not open
      publishErrorCount++;
      lastPublishError = "Redis client not open";
    }
  } catch (err) {
    // Track publish errors (but don't log to avoid infinite loop)
    publishErrorCount++;
    lastPublishError = err.message;
  }
}

/**
 * Send periodic heartbeat to indicate service is alive and publishing
 */
async function sendServiceHeartbeat() {
  if (!_redisClient || !_redisClient.isOpen) return;

  const heartbeat = {
    type: "heartbeat",
    logSource: _serviceName || "unknown",
    projectCodename: _projectName || "unknown",
    timestamp: Date.now(),
    date: new Date().toISOString(),
    stats: {
      publishErrorCount,
      lastPublishError,
      logsProcessed,
      logsPublished,
      logsSkipped,
      logsDroppedNoRedis,
      bufferSize: logBuffer.length,
      redisOpen: _redisClient?.isOpen ?? false,
      uptime: process.uptime(),
    },
  };

  try {
    const channel = _projectChannel || CONSOLE_LOG_CHANNEL;
    await _redisClient.publish(channel, JSON.stringify(heartbeat));
  } catch (err) {
    // Silently fail - don't log to avoid infinite loop
  }
}

/**
 * Cleanup old console logs from Elasticsearch
 * Only runs at most once per hour
 * Uses hexaLogger.clearAgedConsoleLogs() which handles 2-day retention
 */
async function maybeCleanupOldLogs() {
  const now = Date.now();
  if (now - lastCleanupTime < CLEANUP_INTERVAL_MS) {
    return;
  }
  lastCleanupTime = now;

  if (_hexaLogger && typeof _hexaLogger.clearAgedConsoleLogs === "function") {
    try {
      await _hexaLogger.clearAgedConsoleLogs();
    } catch (err) {
      // Silently fail cleanup - non-critical operation
    }
  }
}

/**
 * Initialize console capture
 * Call this early in application startup, after Redis and Elasticsearch are connected
 *
 * Uses direct console method overriding (more reliable than patch-console)
 *
 * @param {Object} options
 * @param {Object} options.hexaLogger - HexaLogger instance
 * @param {Object} options.redisClient - Redis client for pub/sub (optional)
 */
function initConsoleCapture(options = {}) {
  const { hexaLogger, redisClient } = options;

  if (!hexaLogger) {
    console.error("[ConsoleCapture] hexaLogger is required");
    return null;
  }

  // Store references for cleanup and heartbeat
  _hexaLogger = hexaLogger;
  _redisClient = redisClient;
  _projectName = process.env.PROJECT_CODENAME || "unknown";
  _serviceName = process.env.SERVICE_NAME || "unknown";
  _projectChannel = `console-logs:${_projectName}`;

  const projectName = _projectName;
  const serviceName = _serviceName;

  // Start heartbeat interval to indicate service is alive
  if (redisClient) {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
    }
    heartbeatInterval = setInterval(
      sendServiceHeartbeat,
      HEARTBEAT_INTERVAL_MS,
    );
    // Send initial heartbeat
    sendServiceHeartbeat();
  }

  // Map console method to log type
  const methodToLogType = {
    log: 0, // INFO
    info: 0, // INFO
    debug: 0, // INFO
    warn: 1, // WARNING
    error: 2, // ERROR
    trace: 0, // INFO
  };

  // Store original console methods
  const originalMethods = {};
  const methodsToOverride = ["log", "info", "debug", "warn", "error"];

  methodsToOverride.forEach((method) => {
    originalMethods[method] = console[method].bind(console);
  });

  /**
   * Process and stream a console log entry
   * Uses module-level _redisClient to ensure consistency with heartbeat
   */
  function processLog(method, args) {
    try {
      // Format args to string
      const message = args
        .map((arg) => {
          if (arg === undefined) return "undefined";
          if (arg === null) return "null";
          if (typeof arg === "object") {
            try {
              return JSON.stringify(arg);
            } catch (e) {
              return String(arg);
            }
          }
          return String(arg);
        })
        .join(" ");

      // Skip empty or internal messages
      if (!message || message.includes("[ConsoleCapture]")) {
        logsSkipped++;
        return;
      }

      logsProcessed++;

      const now = new Date();
      const logType = methodToLogType[method] ?? 0;

      // Create log entry for Redis streaming
      const logEntry = {
        date: now.toISOString(),
        logType,
        logTypeName: ["INFO", "WARNING", "ERROR"][logType],
        logSource: _serviceName,
        subject: "ConsoleOutput",
        location: getCallerLocation(),
        data: {
          method,
          message,
          timestamp: now.getTime(),
        },
        requestId: null,
        projectCodename: _projectName,
      };

      // Add to buffer for Redis streaming (use module-level _redisClient)
      // We add to buffer if _redisClient exists, even if not currently open
      // flushLogBuffer will check isOpen before actually publishing
      if (_redisClient) {
        logBuffer.push(logEntry);

        // Schedule flush if not already scheduled
        if (!flushTimeout) {
          flushTimeout = setTimeout(() => {
            flushTimeout = null;
            flushLogBuffer(_redisClient);
          }, FLUSH_INTERVAL_MS);
        }
      } else {
        logsDroppedNoRedis++;
      }

      // Also persist to Elasticsearch for 2-day retention (fire and forget, silent failure)
      // This allows historical search of console logs
      if (_hexaLogger && typeof _hexaLogger.insertConsoleLog === "function") {
        _hexaLogger
          .insertConsoleLog(
            logType, // logType (0=INFO, 1=WARNING, 2=ERROR)
            0, // logLevel
            "ConsoleOutput", // subject
            { method }, // params
            getCallerLocation(), // location
            { message }, // data
            null, // requestId
            false, // waitForWrite = false (fire and forget)
          )
          .catch(() => {
            // Silently ignore ES write failures - don't affect other operations
          });
      }
    } catch (err) {
      // Silently fail - never interrupt the original console output
    }
  }

  // Override each console method
  methodsToOverride.forEach((method) => {
    console[method] = function (...args) {
      // ALWAYS call original first to ensure output is never lost
      originalMethods[method](...args);

      // Then process for streaming (async, non-blocking)
      processLog(method, args);
    };
  });

  // Log initialization (use originalMethods to avoid self-referencing issues)
  originalMethods.log(
    "[ConsoleCapture] Console capture initialized for service:",
    _serviceName,
  );
  originalMethods.log(
    "[ConsoleCapture] Redis client available:",
    !!_redisClient,
    "isOpen:",
    _redisClient?.isOpen,
  );

  // Return unpatch function for cleanup
  return function unpatch() {
    methodsToOverride.forEach((method) => {
      console[method] = originalMethods[method];
    });
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  };
}

/**
 * Get the Redis channel name for console logs
 * Returns project-specific channel if initialized, otherwise legacy channel
 */
function getConsoleLogChannel() {
  return _projectChannel || CONSOLE_LOG_CHANNEL;
}

module.exports = {
  initConsoleCapture,
  getConsoleLogChannel,
  CONSOLE_LOG_RETENTION_DAYS,
  CONSOLE_LOG_CHANNEL,
};
