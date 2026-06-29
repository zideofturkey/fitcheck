/**
 * Migration Runner
 *
 * Executes pending database and Elasticsearch migrations at service startup.
 *
 * Strategy:
 * 1. FIRST DEPLOYMENT (no schema version record):
 *    - Use ORM sync (sequelize.sync / mongoose auto-create) to create tables
 *    - This is simpler and safer than generating a migration for brand new DB
 *    - Set initial schema version after sync
 *
 * 2. SUBSEQUENT DEPLOYMENTS (schema version exists):
 *    - Never use ORM sync (could destroy data with alter/force)
 *    - Compare SERVICE_VERSION with DB-stored version
 *    - If versions differ AND migration file exists → run migration
 *    - After successful migration → update DB version
 *
 * Migration file structure:
 * - migrations/pending-migration.js - Current pending migration
 * - migrations/archive/ - Archive of migration files (committed by deployer)
 */

const fs = require("fs");
const path = require("path");
const { hexaLogger } = require("common");

const MIGRATIONS_DIR = path.join(__dirname, "../migrations");
const ARCHIVE_DIR = path.join(MIGRATIONS_DIR, "archive");

// CONFIG_ENV values: local, preview, staging, prod
// Used for archive naming (all envs share git, so archive folder has all history)
const getEnvironment = () => {
  return process.env.CONFIG_ENV || "local";
};

// Pending migration file is always generic (one file per server)
// Environment is only used when archiving to archive/ folder
const PENDING_MIGRATION_FILE = path.join(
  MIGRATIONS_DIR,
  "pending-migration.js",
);

const getPendingMigrationFile = () => {
  return PENDING_MIGRATION_FILE;
};

// Service version from environment or package.json
const getTargetVersion = () => {
  return (
    process.env.SERVICE_VERSION ||
    require("../../package.json").version ||
    "0.0.0"
  );
};

// Get unique service identifier (project + service)
const getServiceIdentifier = () => {
  const projectName =
    process.env.PROJECT_NAME ||
    process.env.PROJECT_CODENAME ||
    "unknown_project";
  const serviceName = process.env.SERVICE_NAME || "unknown_service";
  // Unique identifier: project_service (e.g., "coffeebreak_auth", "coffeebreak_order")
  return `${projectName}_${serviceName}`;
};

// Schema version table name
const SCHEMA_VERSION_TABLE = "_schema_versions";

/**
 * Ensure the schema version tracking table exists
 * @param {Object} context - Migration context with sequelize or mongoose
 * @returns {Promise<boolean>} true if table exists/created, false on error
 */
const ensureSchemaVersionTable = async (context) => {
  const { sequelize } = context;
  if (!sequelize) {
    console.log("[MIGRATION] No sequelize instance in context");
    return false;
  }

  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS ${SCHEMA_VERSION_TABLE} (
        id SERIAL PRIMARY KEY,
        service_id VARCHAR(200) NOT NULL UNIQUE,
        project_name VARCHAR(100),
        service_name VARCHAR(100),
        current_version VARCHAR(50) NOT NULL,
        schema_hash VARCHAR(64),
        last_migration_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        migration_history JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    return true;
  } catch (err) {
    console.error(
      "[MIGRATION] Error creating schema version table:",
      err.message,
    );
    return false;
  }
};

/**
 * Get current schema version from database
 * @param {Object} context - Migration context with sequelize or mongoose
 * @returns {Object|null} Current version info or null if not found
 */
const getCurrentSchemaVersion = async (context) => {
  const serviceId = getServiceIdentifier(); // e.g., "coffeebreak_auth"

  // Ensure table exists first
  const tableReady = await ensureSchemaVersionTable(context);
  if (!tableReady) return null;

  const { sequelize } = context;

  try {
    // Get current version for this service (using unique service_id)
    const result = await sequelize.query(
      `
      SELECT * FROM ${SCHEMA_VERSION_TABLE} WHERE service_id = :serviceId
    `,
      {
        replacements: { serviceId },
        type: sequelize.QueryTypes.SELECT,
      },
    );

    // result is an array of rows when using QueryTypes.SELECT
    const rows = Array.isArray(result) ? result : [];
    return rows.length > 0 ? rows[0] : null;
  } catch (err) {
    console.error("[MIGRATION] Error getting schema version:", err.message);
    return null;
  }
};

/**
 * Update schema version in database after successful migration
 * @param {Object} context - Migration context
 * @param {string} newVersion - New version to set
 * @param {Object} migrationInfo - Migration info to add to history
 */
const updateSchemaVersion = async (context, newVersion, migrationInfo = {}) => {
  const serviceId = getServiceIdentifier(); // e.g., "coffeebreak_auth"
  const projectName =
    process.env.PROJECT_NAME ||
    process.env.PROJECT_CODENAME ||
    "unknown_project";
  const serviceName = process.env.SERVICE_NAME || "unknown_service";

  // Ensure table exists first
  const tableReady = await ensureSchemaVersionTable(context);
  if (!tableReady) {
    console.log("[MIGRATION] Cannot update schema version - table not ready");
    return;
  }

  const { sequelize } = context;

  try {
    const historyEntry = JSON.stringify({
      version: newVersion,
      migratedAt: new Date().toISOString(),
      fromVersion: migrationInfo.fromVersion,
      description: migrationInfo.description,
    });

    await sequelize.query(
      `
      INSERT INTO ${SCHEMA_VERSION_TABLE} (service_id, project_name, service_name, current_version, schema_hash, migration_history)
      VALUES (:serviceId, :projectName, :serviceName, :version, :hash, :history::jsonb)
      ON CONFLICT (service_id) 
      DO UPDATE SET 
        current_version = :version,
        schema_hash = :hash,
        last_migration_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP,
        migration_history = ${SCHEMA_VERSION_TABLE}.migration_history || :history::jsonb
    `,
      {
        replacements: {
          serviceId,
          projectName,
          serviceName,
          version: newVersion,
          hash: migrationInfo.schemaHash || null,
          history: `[${historyEntry}]`,
        },
      },
    );

    console.log(
      `[MIGRATION] Updated schema version to ${newVersion} for ${serviceId}`,
    );
  } catch (err) {
    console.error("[MIGRATION] Error updating schema version:", err.message);
  }
};

/**
 * Check if there's a pending migration file (environment-specific or generic)
 * @returns {boolean}
 */
const hasPendingMigrationFile = () => {
  const migrationFile = getPendingMigrationFile();
  return fs.existsSync(migrationFile);
};

/**
 * Determine if migration is needed
 * @param {Object} context - Migration context
 * @returns {Object} { needed: boolean, reason: string, currentVersion, targetVersion }
 */
const checkMigrationNeeded = async (context) => {
  const targetVersion = getTargetVersion();
  const currentVersionRecord = await getCurrentSchemaVersion(context);
  const currentVersion = currentVersionRecord?.current_version || "0.0.0";
  const hasMigrationFile = hasPendingMigrationFile();

  // Case 1: No version record → first deployment, need ORM sync
  if (!currentVersionRecord) {
    return {
      needed: false,
      reason: "first_deployment",
      currentVersion,
      targetVersion,
      action: "initial_sync",
      isFirstDeployment: true,
    };
  }

  // Case 2: Versions match → no migration needed
  if (currentVersion === targetVersion) {
    return {
      needed: false,
      reason: "versions_match",
      currentVersion,
      targetVersion,
    };
  }

  // Case 3: Versions differ but no migration file → version mismatch warning
  if (currentVersion !== targetVersion && !hasMigrationFile) {
    return {
      needed: false,
      reason: "version_mismatch_no_file",
      currentVersion,
      targetVersion,
      warning: `Schema version mismatch: DB has ${currentVersion}, service expects ${targetVersion}, but no migration file found`,
    };
  }

  // Case 4: Versions differ and migration file exists → run migration
  if (currentVersion !== targetVersion && hasMigrationFile) {
    return {
      needed: true,
      reason: "version_mismatch_with_file",
      currentVersion,
      targetVersion,
    };
  }

  // Case 5: Migration file exists but versions match → stale file, archive it
  if (hasMigrationFile && currentVersion === targetVersion) {
    return {
      needed: false,
      reason: "stale_migration_file",
      currentVersion,
      targetVersion,
      action: "archive_stale_file",
    };
  }

  return {
    needed: false,
    reason: "unknown",
    currentVersion,
    targetVersion,
  };
};

/**
 * Run pending migrations
 *
 * @param {Object} context - Migration context
 * @param {Object} context.sequelize - Sequelize instance (for PostgreSQL)
 * @param {Object} context.mongoose - Mongoose instance (for MongoDB)
 * @param {Object} context.elasticClient - Elasticsearch client
 * @param {Function} context.rebuildIndex - Function to rebuild elastic index
 * @returns {Object} Migration result
 */
const runMigrations = async (context = {}) => {
  const result = {
    success: true,
    isFirstDeployment: false,
    initialSyncDone: false,
    hasMigration: false,
    migrationFile: null,
    steps: [],
    errors: [],
    durationMs: 0,
    currentVersion: null,
    targetVersion: null,
  };

  const startTime = Date.now();

  console.log("═".repeat(60));
  console.log("[MIGRATION] Checking for pending migrations...");

  // Check if migration is needed using version comparison
  const migrationCheck = await checkMigrationNeeded(context);
  result.currentVersion = migrationCheck.currentVersion;
  result.targetVersion = migrationCheck.targetVersion;

  console.log(
    `[MIGRATION] Current DB version: ${migrationCheck.currentVersion}`,
  );
  console.log(`[MIGRATION] Target version: ${migrationCheck.targetVersion}`);
  console.log(`[MIGRATION] Check result: ${migrationCheck.reason}`);

  // Handle warnings
  if (migrationCheck.warning) {
    console.warn(`[MIGRATION] WARNING: ${migrationCheck.warning}`);
    hexaLogger.insertInfo(
      "MigrationWarning",
      {
        warning: migrationCheck.warning,
        currentVersion: migrationCheck.currentVersion,
        targetVersion: migrationCheck.targetVersion,
      },
      "runMigrations",
    );
  }

  // Handle special actions
  if (migrationCheck.action === "initial_sync") {
    result.isFirstDeployment = true;
    console.log(
      "[MIGRATION] First deployment detected - using ORM sync to create tables",
    );

    try {
      const { sequelize } = context;
      if (sequelize) {
        // Use alter:true for safe initial creation (won't drop existing tables)
        // force:false ensures we never destroy data
        await sequelize.sync({ force: false, alter: true });
        console.log("[MIGRATION] PostgreSQL tables synced via Sequelize");
        result.initialSyncDone = true;
      }

      // Set initial version after successful sync
      await updateSchemaVersion(context, migrationCheck.targetVersion, {
        description: "Initial deployment - tables created via ORM sync",
      });

      console.log("[MIGRATION] Initial deployment complete");
      hexaLogger.insertInfo(
        "InitialDeployment",
        {
          targetVersion: migrationCheck.targetVersion,
        },
        "runMigrations",
      );
    } catch (syncErr) {
      console.error("[MIGRATION] Initial sync failed:", syncErr.message);
      result.success = false;
      result.errors.push(`Initial sync failed: ${syncErr.message}`);

      hexaLogger.insertError(
        "InitialSyncFailed",
        {
          error: syncErr.message,
        },
        "runMigrations",
        syncErr,
      );
    }

    result.durationMs = Date.now() - startTime;
    console.log("═".repeat(60));
    return result;
  }

  if (migrationCheck.action === "archive_stale_file") {
    const staleMigrationFile = getPendingMigrationFile();
    console.log(
      "[MIGRATION] Found stale migration file, archiving:",
      staleMigrationFile,
    );
    try {
      const migration = require(staleMigrationFile);
      await archiveMigration(staleMigrationFile, {
        ...migration.info,
        skipped: true,
        reason: "stale_file_versions_match",
      });
    } catch (err) {
      console.warn("[MIGRATION] Could not archive stale file:", err.message);
    }
    console.log("═".repeat(60));
    return result;
  }

  // If no migration needed, exit early
  if (!migrationCheck.needed) {
    console.log("[MIGRATION] No migration needed");
    console.log("═".repeat(60));
    return result;
  }

  // Migration is needed - proceed
  const pendingMigrationFile = getPendingMigrationFile();
  result.hasMigration = true;
  result.migrationFile = pendingMigrationFile;

  const env = getEnvironment();
  console.log(`[MIGRATION] Environment: ${env}`);
  console.log("[MIGRATION] Migration needed, loading:", pendingMigrationFile);

  try {
    // Load the migration module
    const migration = require(pendingMigrationFile);

    // Validate migration structure
    if (!migration || typeof migration.run !== "function") {
      throw new Error("Invalid migration file: missing run() function");
    }

    // Log migration info
    if (migration.info) {
      console.log("[MIGRATION] Migration info:");
      console.log(
        `  - From version: ${migration.info.fromVersion || "unknown"}`,
      );
      console.log(`  - To version: ${migration.info.toVersion || "unknown"}`);
      console.log(`  - Generated: ${migration.info.generatedAt || "unknown"}`);
      console.log(
        `  - Description: ${migration.info.description || "No description"}`,
      );
    }

    // Run the migration
    console.log("[MIGRATION] Running migration...");

    const migrationResult = await migration.run(context);

    result.steps = migrationResult?.steps || [];

    if (migrationResult?.success === false) {
      result.success = false;
      result.errors = migrationResult?.errors || ["Migration failed"];
    }

    // On success: update version and archive
    if (result.success) {
      // Update schema version in database
      await updateSchemaVersion(context, migrationCheck.targetVersion, {
        fromVersion: migration.info?.fromVersion,
        schemaHash: migration.info?.schemaHash,
        description: migration.info?.description,
      });

      // Archive the completed migration
      await archiveMigration(pendingMigrationFile, migration.info);
      console.log("[MIGRATION] Migration completed successfully");

      hexaLogger.insertInfo(
        "MigrationCompleted",
        {
          fromVersion: migration.info?.fromVersion,
          toVersion: migration.info?.toVersion,
          steps: result.steps.length,
        },
        "runMigrations",
      );
    } else {
      console.error("[MIGRATION] Migration failed:", result.errors);

      hexaLogger.insertError(
        "MigrationFailed",
        {
          fromVersion: migration.info?.fromVersion,
          toVersion: migration.info?.toVersion,
          errors: result.errors,
        },
        "runMigrations",
      );
    }
  } catch (err) {
    result.success = false;
    result.errors.push(err.message);

    console.error("[MIGRATION] Migration error:", err.message);
    console.error(err.stack);

    hexaLogger.insertError(
      "MigrationError",
      {
        error: err.message,
      },
      "runMigrations",
      err,
    );
  }

  result.durationMs = Date.now() - startTime;

  console.log(`[MIGRATION] Completed in ${result.durationMs}ms`);
  console.log("═".repeat(60));

  return result;
};

/**
 * Clean up completed migration file
 *
 * NOTE: Archive/history is handled at DEPLOY TIME (before server receives code).
 * The deployer commits the archive to git, then the server just runs and deletes.
 * This keeps history in git (accessible to all environments) rather than on server.
 *
 * @param {string} migrationFile - Path to migration file
 * @param {Object} info - Migration info (for logging)
 */
const cleanupMigration = async (migrationFile, info = {}) => {
  try {
    const env = getEnvironment();
    const fromVersion = info.fromVersion || "unknown";
    const toVersion = info.toVersion || "unknown";

    // Simply delete the file - archive was done at deploy time
    if (fs.existsSync(migrationFile)) {
      fs.unlinkSync(migrationFile);
      console.log(`[MIGRATION] Cleaned up: ${migrationFile}`);
      console.log(
        `[MIGRATION] Migration ${fromVersion} → ${toVersion} completed on ${env}`,
      );
    }
  } catch (err) {
    console.error("[MIGRATION] Failed to cleanup migration file:", err.message);
    // Don't throw - cleanup failure shouldn't fail the migration
  }
};

// Alias for backwards compatibility
const archiveMigration = cleanupMigration;

/**
 * Skip the current pending migration (delete without running)
 * Use this if you want to skip a migration without running it
 */
const skipMigration = async () => {
  if (!hasPendingMigrationFile()) {
    return { success: false, error: "No pending migration to skip" };
  }

  const pendingMigrationFile = getPendingMigrationFile();

  try {
    const migration = require(pendingMigrationFile);
    const env = getEnvironment();

    console.log(`[MIGRATION] Skipping migration on ${env}:`, migration.info);

    // Clear require cache
    delete require.cache[require.resolve(pendingMigrationFile)];

    // Delete the file
    await cleanupMigration(pendingMigrationFile, {
      ...migration.info,
      skipped: true,
    });

    return { success: true, file: pendingMigrationFile, skipped: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Get list of archived migrations
 */
const getArchivedMigrations = () => {
  if (!fs.existsSync(ARCHIVE_DIR)) {
    return [];
  }

  return fs
    .readdirSync(ARCHIVE_DIR)
    .filter((f) => f.endsWith(".js"))
    .sort()
    .reverse();
};

module.exports = {
  runMigrations,
  checkMigrationNeeded,
  ensureSchemaVersionTable,
  getCurrentSchemaVersion,
  updateSchemaVersion,
  hasPendingMigrationFile,
  hasPendingMigration: hasPendingMigrationFile, // alias for backwards compatibility
  skipMigration,
  getArchivedMigrations,
  getTargetVersion,
  getServiceIdentifier,
  getEnvironment,
  getPendingMigrationFile,
  MIGRATIONS_DIR,
  PENDING_MIGRATION_FILE, // generic path for backwards compatibility
  ARCHIVE_DIR,
  SCHEMA_VERSION_TABLE,
};
