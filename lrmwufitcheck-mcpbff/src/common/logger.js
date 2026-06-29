/**
 * Logger Configuration
 */

const winston = require("winston");
const Transport = winston.Transport;
const path = require("path");
const fs = require("fs");
const { Client } = require("@elastic/elasticsearch");
const { createClient } = require("redis");

// Ensure logs directory exists
const logsDir = path.join(__dirname, "..", "..", "logs");
try {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
} catch (err) {
  console.error("[Logger] Failed to create logs directory:", err.message);
}

const CONSOLE_LOG_CHANNEL = "console-logs:lrmwufitcheck";
const CONSOLE_LOGS_INDEX = "lrmwufitcheck_console_log";
const MCP_TAG_PATTERN = /^\[MCP-/;

let redisPublisher = null;
let redisReady = false;
let elasticClient = null;

async function initLogInfra() {
  const redisHost = process.env.REDIS_HOST || "redis";
  const redisPort = process.env.REDIS_PORT || 6379;
  const redisUser = process.env.REDIS_USER || null;
  const redisPwd = process.env.REDIS_PWD || null;

  try {
    redisPublisher = createClient({
      socket: { host: redisHost, port: parseInt(redisPort) },
      username: redisUser || undefined,
      password: redisPwd || undefined,
    });
    redisPublisher.on("error", () => {
      redisReady = false;
    });
    redisPublisher.on("ready", () => {
      redisReady = true;
    });
    await redisPublisher.connect();
    redisReady = true;
  } catch (err) {
    console.error("[Logger] Redis publisher init failed:", err.message);
  }

  const elasticUri =
    process.env.ELASTIC_URI ||
    process.env.ELASTICSEARCH_NODE ||
    "http://elasticsearch:9200";
  const elasticUser = process.env.ELASTIC_USER || "elastic";
  const elasticPwd = process.env.ELASTIC_PWD || "";

  try {
    elasticClient = new Client({
      node: elasticUri,
      requestTimeout: 5000,
      ...(elasticUser && elasticPwd
        ? { auth: { username: elasticUser, password: elasticPwd } }
        : {}),
      tls: { rejectUnauthorized: false },
    });
    console.log("[Logger] Elasticsearch client created for:", elasticUri);
  } catch (err) {
    console.error("[Logger] Elasticsearch client init failed:", err.message);
  }
}

initLogInfra();

/**
 * Custom transport that publishes MCP-tagged log entries to Redis (live stream)
 * and Elasticsearch (history) so the MCP Logs page can display them.
 */
class McpLogBroadcastTransport extends Transport {
  log(info, callback) {
    setImmediate(() => this.emit("logged", info));
    const msg = info.message || "";
    if (!MCP_TAG_PATTERN.test(msg)) {
      callback();
      return;
    }

    const entry = {
      date: info.timestamp || new Date().toISOString(),
      logSource: "mcpbff",
      logType: info.level === "error" ? 2 : 0,
      projectCodename: "lrmwufitcheck",
      data: {
        level: info.level,
        message: msg,
        timestamp: info.timestamp || new Date().toISOString(),
        ...Object.fromEntries(
          Object.entries(info).filter(
            ([k]) => !["level", "message", "timestamp", "service"].includes(k),
          ),
        ),
      },
    };

    if (redisReady && redisPublisher) {
      redisPublisher
        .publish(CONSOLE_LOG_CHANNEL, JSON.stringify(entry))
        .catch(() => {});
    }

    if (elasticClient) {
      elasticClient
        .index({ index: CONSOLE_LOGS_INDEX, body: entry })
        .catch(() => {});
    }

    callback();
  }
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: "mcpbff" },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    new winston.transports.File({
      filename: path.join(logsDir, "mcpbff.log"),
      maxsize: 5 * 1024 * 1024,
      maxFiles: 3,
      tailable: true,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, "mcpbff-error.log"),
      level: "error",
      maxsize: 5 * 1024 * 1024,
      maxFiles: 3,
      tailable: true,
    }),
    new McpLogBroadcastTransport(),
  ],
});

logger.info("Logger initialized", {
  logsDir,
  logLevel: process.env.LOG_LEVEL || "info",
  pid: process.pid,
  nodeVersion: process.version,
});

module.exports = logger;
