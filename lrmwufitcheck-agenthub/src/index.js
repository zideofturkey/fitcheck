require("module-alias/register");

const serviceConfig = process.env.SERVICE_CONFIG ?? "test";

require("dotenv").config({ path: `.${serviceConfig}.env` });

console.log("Starting fitcheck-agenthub-service service...");
console.log(`Loaded .${serviceConfig}.env file`);

const { hexaLogger, HexaLogTypes } = require("common");

/// build version ...
const { version } = require("../package.json");

const {
  connectToKafka,
  closeKafka,
  registerTopicAliasResolver,
  connectToElastic,
  getElasticParams,
  closeElastic,
  connectToRedis,
  redisClient,
  setRedisData,
  getRedisData,
  initConsoleCapture,
  startPostgres,
  closePostgres,
} = require("./common");

const { ElasticIndexer } = require("serviceCommon");

const startKafkaListeners = require("./controllers-layer/kafka-layer");

const {
  initService,
  getPublicKey,
  setCurrentKeyId,
  runMigrations,
  rebuildIndexByName,
  smartSyncOnStartup,
  startElasticSyncCron,
  afterPaymentDoneUtils,
} = require("utils");

let processActive = false;
let expressServer = null;

const start = async () => {
  process.title = "node-lrmwufitcheck-agenthub-service";

  const today = new Date();

  try {
    await connectToElastic();
  } catch (err) {
    console.log("Starting ElasticSearch failed..", err.message);
    hexaLogger.insertError(
      "ElasticConnectionFailedError",
      getElasticParams(true),
      "index.js->start",
      err,
    );
  }

  try {
    await connectToRedis();
    console.log("Testing Redis....");
    await setRedisData(
      "lrmwufitcheck-agenthub-service:start",
      today.toUTCString(),
    );
    console.log(
      "Service start datetime is written to Redis key lrmwufitcheck-agenthub-service:start",
      today.toUTCString(),
    );
  } catch (err) {
    console.log("Redis test failed:", err);
    hexaLogger.insertError(
      "RedisConnectionFailedError",
      {},
      "index.js->start",
      err,
    );
  }

  // Initialize console capture for streaming to MCP-BFF
  // This captures console.log/error/warn/info and streams them via Redis pub/sub
  try {
    initConsoleCapture({
      hexaLogger,
      redisClient,
    });
    console.log(
      "[ConsoleCapture] Console capture initialized - logs will stream to MCP-BFF",
    );
  } catch (err) {
    console.log(
      "[ConsoleCapture] Failed to initialize console capture:",
      err.message,
    );
  }

  try {
    await hexaLogger.updateLoggerMappings();
    await hexaLogger.insertInfo(
      "LoadingService",
      { time: today.toUTCString() },
      "index.js->start",
    );
  } catch (err) {
    console.log("Error while loading logger mappings", err.message);
  }

  try {
    await startPostgres();
  } catch (err) {
    console.log("Database start failed ", err);
    hexaLogger.insertError("DatabaseStartError", {}, "index.js->start", err);
  }

  // ═══════════════════════════════════════════════════════════════
  // RUN MIGRATIONS - After all connections are established
  // Only in staging and production environments
  // ═══════════════════════════════════════════════════════════════
  if (
    process.env.CONFIG_ENV === "staging" ||
    process.env.CONFIG_ENV === "prod"
  ) {
    let needsSyncFallback = false;

    try {
      const { sequelize, Sequelize } = require("./models");
      const { elasticClient } = require("./common");

      const migrationResult = await runMigrations({
        sequelize,
        Sequelize, // Sequelize class for DataTypes (STRING, INTEGER, etc.)
        elasticClient,
        rebuildIndex: rebuildIndexByName,
      });

      if (migrationResult.isFirstDeployment) {
        if (migrationResult.success) {
          console.log(
            `[STARTUP] First deployment: tables created via ORM sync in ${migrationResult.durationMs}ms`,
          );
        } else {
          console.error(
            "[STARTUP] First deployment sync failed:",
            migrationResult.errors,
          );
          needsSyncFallback = true;
          if (process.env.EXIT_ON_MIGRATION_FAILURE === "true") {
            console.error("[STARTUP] Exiting due to initial sync failure");
            process.exit(1);
          }
        }
      } else if (migrationResult.hasMigration) {
        if (migrationResult.success) {
          console.log(
            `[STARTUP] Migration completed: ${migrationResult.steps.length} steps in ${migrationResult.durationMs}ms`,
          );
        } else {
          console.error("[STARTUP] Migration failed:", migrationResult.errors);
          needsSyncFallback = true;
          if (process.env.EXIT_ON_MIGRATION_FAILURE === "true") {
            console.error("[STARTUP] Exiting due to migration failure");
            process.exit(1);
          }
        }
      } else {
        console.log(
          "[STARTUP] No migration script found, will attempt schema sync fallback",
        );
        needsSyncFallback = true;
      }
    } catch (err) {
      console.error("[STARTUP] Migration runner error:", err.message);
      hexaLogger.insertError(
        "MigrationRunnerError",
        {},
        "index.js->start",
        err,
      );
      needsSyncFallback = true;

      if (process.env.EXIT_ON_MIGRATION_FAILURE === "true") {
        console.error("[STARTUP] Exiting due to migration error");
        process.exit(1);
      }
    }

    if (needsSyncFallback) {
      try {
        console.log(
          "[STARTUP] Fallback: running syncModels with alter:true, force:false",
        );
        const { syncModels } = require("common");
        await syncModels(false);
        console.log("[STARTUP] Fallback syncModels completed successfully");
      } catch (syncErr) {
        console.log(
          "[STARTUP] Fallback syncModels failed, skipping:",
          syncErr.message,
        );
      }
    }
  } else {
    console.log(
      "[STARTUP] Skipping migrations in development and preview environment",
    );
    // run sequelize sync
    console.log("[STARTUP] Running sequelize sync with force: false");
    // Load all model files BEFORE calling syncModels so the shared Sequelize
    // instance has every model registered. Without this, `common.syncModels`
    // walks an empty (or partially-populated) model registry and only
    // creates the tables that some other code path happened to register
    // earlier — observed bug: services with >2 data objects deploy with
    // only a subset of their tables, then the first request for a missing
    // table 500s with "relation does not exist". The fix mirrors what the
    // staging/prod branch above already does at line 127: require('./models')
    // imports the index that pulls every model file, each of which calls
    // sequelize.define()/init() and registers itself.
    require("./models");
    const { syncModels } = require("common");
    try {
      await syncModels(false);
      console.log("[STARTUP] Sequelize sync completed with force: false");
    } catch (err) {
      console.log(
        "[STARTUP] Sequelize sync failed with force: false, trying with force: true",
      );
      try {
        await syncModels(true);
        console.log("[STARTUP] Sequelize sync completed with force: true");
        console.log(
          "[STARTUP] Your db is up to date, some tables may have been dropped and recreated",
        );
      } catch (err) {
        console.error("[STARTUP] Sequelize sync failed:", err.message);
        hexaLogger.insertError(
          "SequelizeSyncFailedError",
          {},
          "index.js->start",
          err,
        );
      }
    }
  }

  global.LIB = {};
  try {
    global.LIB = require("./library");
  } catch (err) {
    console.log("Librrary cannot be loaded", err);
    hexaLogger.insertError("LibrarryError", {}, "index.js->start", err);
  }

  global.LIB.common = global.LIB.common ?? require("common");
  global.LIB.geoFilters = global.LIB.geoFilters ?? require("common").geoFilters;
  global.LIB.dateFilters =
    global.LIB.dateFilters ?? require("common").dateFilters;

  try {
    await initService();
  } catch (err) {
    console.log("Service init failed", err);
    hexaLogger.insertError("ServiceInitError", {}, "index.js->start", err);
  }

  // Apply Elasticsearch index mappings
  // This registers mappings in MAPPINGS object and applies them to indexes
  // Note: putMapping can only add new fields, not change existing field types
  // Use /admin/elastic/rebuild API to rebuild indexes with wrong mappings
  try {
    const { updateElasticIndexMappings } = require("models");
    await updateElasticIndexMappings();
    console.log("Elasticsearch index mappings applied");
  } catch (err) {
    console.log("Elasticsearch mapping update failed (non-fatal)", err.message);
    hexaLogger.insertError("ElasticMappingError", {}, "index.js->start", err);
  }

  // ═══════════════════════════════════════════════════════════════
  // SMART ELASTICSEARCH SYNC
  // Check each index — if empty, sync from database.
  // Preview: startup sync only (services don't live long)
  // Stage/Prod: startup sync + daily cron to keep indexes fresh
  // ═══════════════════════════════════════════════════════════════
  const configEnv = process.env.CONFIG_ENV || "dev";

  try {
    console.log(
      `[STARTUP] Running smart Elasticsearch sync (env: ${configEnv})...`,
    );
    await smartSyncOnStartup();
  } catch (err) {
    console.log(
      "[STARTUP] Smart Elasticsearch sync failed (non-fatal):",
      err.message,
    );
    hexaLogger.insertError("SmartSyncStartupError", {}, "index.js->start", err);
  }

  // Schedule daily cron for stage and prod environments
  if (
    configEnv === "staging" ||
    configEnv === "stage" ||
    configEnv === "prod"
  ) {
    try {
      startElasticSyncCron({
        schedule: "0 0 3 * * *", // Daily at 03:00 UTC
        runInitialSync: false, // Already ran smart sync above
      });
      console.log(
        "[STARTUP] Daily Elasticsearch sync cron scheduled (03:00 UTC)",
      );
    } catch (err) {
      console.log(
        "[STARTUP] Failed to start Elasticsearch sync cron (non-fatal):",
        err.message,
      );
      hexaLogger.insertError(
        "ElasticCronStartError",
        {},
        "index.js->start",
        err,
      );
    }
  }

  const expressApp = require("./express-app");
  const mcpSessions = require("./mcp-app");

  const servicePort = process.env.HTTP_PORT ?? 3000;

  expressServer = expressApp.listen(servicePort);
  console.log(
    "fitcheck-agenthub-service is listening HTTP/REST port " +
      servicePort.toString(),
  );

  console.log(
    "This service is built by Mindbricks Genesis Engine, version:",
    "1.3.0",
  );
  console.log(
    "Project is designed with Mindbricks Pattern Ontology, version:",
    "1.0.0",
  );
  console.log("Project version:", process.env.PROJECT_VERSION);
  console.log("SERVICE VERSION:", process.env.SERVICE_VERSION);
  await hexaLogger.insertInfo(
    "ListeningHttpPort",
    { port: servicePort },
    "index.js->start",
    { date: today.toUTCString() },
  );

  if (process.env.GRPC_ACTIVE) {
    const grpc = require("@grpc/grpc-js");
    const grpcServer = require("./grpc-app");
    grpcServer.bindAsync(
      "0.0.0.0:50000",
      grpc.ServerCredentials.createInsecure(),
      (error, port) => {
        if (!error) {
          grpcServer.start();
          console.log(`gRPC server is listening on port ${port}`);
        } else {
          console.log(`gRPC server failed with eror`, error.message);
        }
      },
    );
  }

  let edheKafkaListenerStarter = null;

  try {
    const { startKafkaListenersForEdge } = require("edgeLayer");
    edheKafkaListenerStarter = startKafkaListenersForEdge;
  } catch (err) {
    console.log("Kafka Edge Layer cannot be loaded", err);
    hexaLogger.insertError("LibrarryError", {}, "index.js->start", err);
  }

  if (process.env.NODE_ENV !== "development") {
    try {
      // connect to kafka and register topic alias resolver
      await connectToKafka();
      try {
        const { resolveTopicAlias } = require("serviceCommon");
        registerTopicAliasResolver(resolveTopicAlias);
      } catch (_) {
        /* alias resolver not available */
      }
      await startKafkaListeners();
      await edheKafkaListenerStarter();
      // AgentHub: start periodic tool catalog refresh + dynamic Kafka consumers
      try {
        const {
          startCatalogRefresh,
        } = require("hubLayer/tool-catalog-manager");
        const {
          startDynamicKafkaConsumers,
        } = require("hubLayer/kafka-consumer-manager");
        startCatalogRefresh(5);
        await startDynamicKafkaConsumers();
        console.log(
          "AgentHub: tool catalog refresh and dynamic Kafka consumers started",
        );
      } catch (hubErr) {
        console.error("AgentHub startup error:", hubErr.message);
      }
      if (afterPaymentDoneUtils?.startListener) {
        await afterPaymentDoneUtils.startListener();
      }
      console.log("Kafka listeners are started...");
    } catch (err) {
      console.log("Kafka cant be connected", err.message);
      hexaLogger.insertError(
        "KafkaConnectionFailedError",
        {},
        "index.js->",
        err,
      );
    }
  }

  // get public key from auth service
  let tryCount = 0;
  async function fetchAndStorePublicKey() {
    while (true) {
      const key = await getPublicKey();
      tryCount++;
      if (key) {
        break;
      }
      if (tryCount >= 5) {
        console.log(
          "Public key could not be fetched from auth service, giving up...",
        );
        hexaLogger.insertError(
          "PublicKeyFetchFailedError",
          { function: "fetchAndStorePublicKey" },
          "index.js->fetchAndStorePublicKey",
        );
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 60 * 1000));
    }
  }

  fetchAndStorePublicKey();

  processActive = true;
};

const signals = ["SIGINT", "SIGTERM", "SIGQUIT"];

const secureClose = async (message, promise) => {
  try {
    console.log("closing message", message);
    await Promise.all([promise]);
  } catch (err) {
    console.log("closingg error", err);
    hexaLogger.insertError(
      "SecureCloseFailedError",
      { function: "secureClose" },
      "index.js->secureClose",
      err,
    );
  }
};

const close = async (signal) => {
  try {
    console.log("Caught termination signal:", signal);
    if (processActive) {
      console.log("Closing all connections...");
      processActive = false;
      await secureClose("Closing express server...", expressServer.close());
      await secureClose("Closing kafka connection...", closeKafka());
      if (redisClient.isOpen) {
        await secureClose("Closing Redis connection...", redisClient.quit());
      }
      const insertCloseLogPromise = hexaLogger.insertInfo(
        "ClosingApp",
        { active_handles: process.getActiveResourcesInfo().length },
        "index.js->close",
      );
      await secureClose("Inserting exit log...", insertCloseLogPromise);
      await secureClose("Clearing old logs...", hexaLogger.clearAgedLogs());
      await secureClose("Closing elasticsearch connection...", closeElastic());
      console.log("Closed all connections gracefully...Bye!");
      process.exit();
    } else {
      console.log("Connections already closed...");
    }
  } catch (err) {
    hexaLogger.insertError(
      "CloseProcessFailedError",
      { function: "close" },
      "index.js->close",
      err,
    );
    process.exit();
  }
};

for (const signal of signals) {
  process.on(signal, async () => {
    if (!signals.includes(signal)) return;
    await close(signal);
  });
}

/* starting the server fitcheck-agenthub-service .... */
start();

/* this project is created by MindBricks */
