/**
 * Cron Job Utilities
 *
 * Elasticsearch sync cron jobs are now optional.
 * Prefer using the /admin/elastic/rebuild API for manual rebuilds
 * or migrations for schema-driven rebuilds.
 */

const cron = require("node-cron");
const { hexaLogger } = require("common");

const elasticSyncUtils = require("./syncElasticData");

/**
 * Start a scheduled cron job to sync Elasticsearch indexes
 * This does NOT run an initial sync - use the API or call syncElasticIndexData directly if needed
 *
 * @param {Object} options
 * @param {string} options.schedule - Cron schedule expression (default: every hour at minute 0)
 * @param {boolean} options.runInitialSync - Whether to run a sync immediately (default: false)
 * @returns {Object} The cron job instance
 */
const startElasticSyncCron = async (options = {}) => {
  const {
    schedule = "0 0 * * * *", // Every hour at minute 0
    runInitialSync = false,
  } = options;

  // Run initial sync if requested
  if (runInitialSync) {
    try {
      console.log("[CRON] Running initial Elasticsearch sync...");
      await elasticSyncUtils.syncElasticIndexData();
      console.log("[CRON] Initial Elasticsearch sync completed");
    } catch (err) {
      console.error("[CRON] Initial Elasticsearch sync failed:", err.message);
      hexaLogger.insertError(
        "ElasticSyncCronInitError",
        {},
        "crons->startElasticSyncCron",
        err,
      );
    }
  }

  // Schedule the cron job
  const cronJob = cron.schedule(
    schedule,
    async () => {
      console.log(
        "[CRON] Scheduled Elasticsearch sync started",
        new Date().toISOString(),
      );

      try {
        const result = await elasticSyncUtils.syncElasticIndexData();
        console.log(
          `[CRON] Scheduled sync completed: ${result.totalIndexed} indexed, ${result.totalErrors} errors`,
        );

        hexaLogger.insertInfo(
          "ElasticSyncCronCompleted",
          {
            totalIndexed: result.totalIndexed,
            totalErrors: result.totalErrors,
            durationMs: result.durationMs,
          },
          "crons->scheduledSync",
        );
      } catch (err) {
        console.error(
          "[CRON] Scheduled Elasticsearch sync failed:",
          err.message,
        );
        hexaLogger.insertError(
          "ElasticSyncCronError",
          {},
          "crons->scheduledSync",
          err,
        );
      }
    },
    {
      scheduled: true,
      timezone: process.env.CRON_TIMEZONE || "UTC",
    },
  );

  console.log(`[CRON] Elasticsearch sync scheduled: ${schedule}`);

  return cronJob;
};

/**
 * @deprecated Use startElasticSyncCron or the /admin/elastic/rebuild API instead
 * Kept for backwards compatibility - now just schedules the cron without initial sync
 */
const startRepairElastic = async () => {
  console.log(
    "[DEPRECATED] startRepairElastic is deprecated. Use /admin/elastic/rebuild API or startElasticSyncCron instead.",
  );
  return startElasticSyncCron({ runInitialSync: false });
};

module.exports = {
  startRepairElastic,
  startElasticSyncCron,
};
