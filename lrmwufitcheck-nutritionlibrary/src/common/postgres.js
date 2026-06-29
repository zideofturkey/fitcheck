const { Sequelize, Model, DataTypes } = require("sequelize");

let dbName = process.env.DB_NAME ?? process.env.SERVICE_CODENAME ?? "test";
let dbUser = process.env.PG_USER;
let dbPass = process.env.PG_PASSWORD;
let dbHost = process.env.PG_HOST;
let dbPort = process.env.PG_PORT ?? 5432;

const sequelize = new Sequelize(dbName, dbUser, dbPass, {
  host: dbHost,
  port: dbPort,
  dialect: "postgres",
  logging: false,
  pool: {
    max: 9,
    min: 0,
    idle: 10000,
  },
});

const closePostgres = async () => {
  console.log("Disconnecting PostgresDb");
  await sequelize.close();
};
const connectToDb = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to PostgreSql:", dbHost + "/" + dbName);
    return null;
  } catch (err) {
    //**errorLog
    console.log(
      "Can not connect to PostgreSql:",
      dbHost + "/" + dbName,
      ":",
      err.message,
    );
    return err;
  }
};

const postGisExtension = async () => {
  if (!dbName) return;
  const { Client } = require("pg");
  const client = new Client({
    user: dbUser,
    password: dbPass,
    host: dbHost,
    port: dbPort,
    database: dbName,
  });

  try {
    await client.connect();
    await client.query("CREATE EXTENSION IF NOT EXISTS postgis;");
    await client.end();
    console.log("created postgis extension:", dbName);
  } catch (err) {
    //**errorLog
    if (err) console.log(err.message);
    client.end();
  }
};

/**
 * Check if database exists by querying pg_database
 * @returns {Promise<boolean>} true if database exists
 */
const checkDatabaseExists = async () => {
  if (!dbName) return false;
  const { Client } = require("pg");

  const client = new Client({
    user: dbUser,
    password: dbPass,
    host: dbHost,
    port: dbPort,
    database: "postgres", // Connect to system database
  });

  try {
    await client.connect();
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName],
    );
    await client.end();
    return result.rowCount > 0;
  } catch (err) {
    console.log("Error checking database existence:", err.message);
    try {
      client.end();
    } catch (e) {
      /* ignore */
    }
    return false;
  }
};

// PostgreSQL marks a database "invalid" (error code 55000, message
// "cannot connect to invalid database <name>") when a CREATE/ALTER DATABASE
// is interrupted mid-operation — common in ephemeral preview environments
// when the Postgres server or the genesis preview crashes mid-provision.
// PG itself instructs the operator to DROP and recreate the database; that
// is exactly what the recovery path below does, gated to ephemeral envs.
const PG_INVALID_DATABASE_CODE = "55000";
const RECOVERABLE_ENVS = new Set(["dev", "test"]);
const RESERVED_DB_NAMES = new Set(["postgres", "template0", "template1", ""]);

const isInvalidDatabaseError = (err) => {
  if (!err) return false;
  const code = err?.parent?.code || err?.original?.code || err?.code;
  if (code === PG_INVALID_DATABASE_CODE) return true;
  const msg = String(err?.message || "");
  return msg.includes("cannot connect to invalid database");
};

/**
 * Drop the database. Terminates any lingering backends first so DROP can
 * succeed. Refuses to operate on reserved system databases.
 * @returns {Promise<boolean>} true if the database is gone (dropped or
 *   already absent)
 */
const dropPostgresDb = async () => {
  if (!dbName || RESERVED_DB_NAMES.has(dbName)) {
    console.error(
      "[POSTGRES-REPAIR] Refusing to drop reserved/empty db name:",
      dbName,
    );
    return false;
  }
  const { Client } = require("pg");
  const client = new Client({
    user: dbUser,
    password: dbPass,
    host: dbHost,
    port: dbPort,
    database: "postgres",
  });
  try {
    await client.connect();
    // Kick off any backends still attached (own pool, leftover from previous
    // runs, etc.) so DROP DATABASE doesn't fail with "database is being
    // accessed by other users".
    await client.query(
      "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()",
      [dbName],
    );
    await client.query('DROP DATABASE IF EXISTS "' + dbName + '"');
    await client.end();
    console.log("[POSTGRES-REPAIR] Dropped PostgreSQL database:", dbName);
    return true;
  } catch (err) {
    try {
      client.end();
    } catch (e) {
      /* ignore */
    }
    console.error("[POSTGRES-REPAIR] Error dropping database:", err.message);
    return false;
  }
};

/**
 * Create the database if it doesn't exist
 * @returns {Promise<boolean>} true if database was created or already exists
 */
const createPostgresDb = async () => {
  if (!dbName) return false;
  const { Client } = require("pg");

  const client = new Client({
    user: dbUser,
    password: dbPass,
    host: dbHost,
    port: dbPort,
    database: "postgres",
  });

  try {
    await client.connect();
    await client.query('CREATE DATABASE "' + dbName + '"');
    await client.end();
    console.log("Created PostgreSQL database:", dbName);
    return true;
  } catch (err) {
    try {
      client.end();
    } catch (e) {
      /* ignore */
    }
    // Check if error is "database already exists" (race condition)
    if (err.code === "42P04") {
      console.log("Database already exists:", dbName);
      return true;
    }
    console.log("Error creating database:", err.message);
    return false;
  }
};

const startPostgres = async () => {
  // First, check if database exists (safer than catching connection error)
  const dbExists = await checkDatabaseExists();

  let databaseJustCreated = false;

  if (!dbExists) {
    console.log("Database does not exist, creating:", dbName);
    const created = await createPostgresDb();
    if (!created) {
      console.error("Failed to create database:", dbName);
      return;
    }
    databaseJustCreated = true;
  }

  // Now connect to the database
  const err = await connectToDb();
  let databaseRecovered = false;
  if (err) {
    // Recovery path: PG marked the database "invalid" (error 55000) — usually
    // a CREATE/ALTER interrupted mid-flight. PG's own remediation is "drop
    // and recreate". We only do this in ephemeral envs (dev/test) where data
    // loss is acceptable; stage/beta/prod surface the original error.
    const env = (process.env.SERVICE_CONFIG || "").toLowerCase();
    if (isInvalidDatabaseError(err) && RECOVERABLE_ENVS.has(env)) {
      console.warn(
        '[POSTGRES-REPAIR] Database "' +
          dbName +
          '" is marked invalid by PostgreSQL (error 55000). ' +
          'SERVICE_CONFIG="' +
          env +
          '" — dropping and recreating.',
      );
      const dropped = await dropPostgresDb();
      if (!dropped) {
        console.error("[POSTGRES-REPAIR] Drop failed; aborting recovery.");
        return;
      }
      const created = await createPostgresDb();
      if (!created) {
        console.error("[POSTGRES-REPAIR] Recreate failed; aborting recovery.");
        return;
      }
      const retryErr = await connectToDb();
      if (retryErr) {
        console.error(
          "[POSTGRES-REPAIR] Reconnect after rebuild still failed:",
          retryErr.message,
        );
        return;
      }
      console.log(
        "[POSTGRES-REPAIR] Database rebuilt successfully — continuing startup.",
      );
      databaseRecovered = true;
    } else {
      console.error("Failed to connect to database after creation check");
      return;
    }
  }

  // Create PostGIS extension if needed
  await postGisExtension();

  // Model syncing is now handled by migration system in runMigrations
  if (databaseJustCreated || databaseRecovered) {
    await syncModels();
  }
};

const syncModels = async (force = false) => {
  //call this function when you are sure all sequelize models are defined
  //
  // Per-model sync (not whole-tree `sequelize.sync()`).
  //
  // Whole-tree sync is fail-fast: one bad CREATE INDEX (e.g. PG identifier
  // truncated to 63 chars colliding with an existing one — error 42P07
  // "relation already exists") aborts the entire boot, and every model
  // declared AFTER the failing one in the loop order never gets its
  // schema applied. The previous implementation tried to recover by
  // re-running `sequelize.sync({ alter: false })`, but that's still
  // whole-tree and explodes the same way the moment a single index
  // collides.
  //
  // Walk `sequelize.models` and sync each model in isolation. Per-model
  // failures are logged with the model name + SQL state and the loop
  // continues. The service still boots; the broken-table is the only
  // surface that's degraded, not the whole API. Force mode (used by the
  // dbadmin database/reset endpoint) keeps whole-tree atomicity because
  // partial force-sync is genuinely worse than nothing — caller is
  // explicitly nuking the DB and any half-state is a bug.
  if (force) {
    await sequelize.sync({ force: true });
    console.log("Postgres db tables synced with sequelize models (force)");
    return;
  }

  const modelEntries = Object.entries(sequelize.models || {});
  const failures = [];
  let okCount = 0;

  for (const [modelName, Model] of modelEntries) {
    try {
      await Model.sync({ force: false, alter: true });
      okCount += 1;
    } catch (err) {
      const code = err?.original?.code || err?.parent?.code || null;
      const origMsg =
        err?.original?.message || err?.parent?.message || err?.message;
      const sql = err?.sql || err?.original?.sql || null;
      const isAlreadyExists = code === "42P07"; // duplicate relation/index
      failures.push({
        modelName,
        code,
        message: origMsg,
        sql,
        benign: isAlreadyExists,
      });
      if (isAlreadyExists) {
        console.warn(
          `[POSTGRES-SYNC] ${modelName}: relation already exists — skipping (${origMsg || code}). Service continues; this index/table is presumed correct from a prior boot.`,
        );
      } else {
        console.error(
          `[POSTGRES-SYNC] ${modelName}: sync FAILED (code=${code || "unknown"}) — ${origMsg}. Subsequent models will still attempt to sync.`,
        );
        if (sql) console.error(`[POSTGRES-SYNC]   sql: ${sql}`);
      }
    }
  }

  const benignCount = failures.filter((f) => f.benign).length;
  const errorCount = failures.filter((f) => !f.benign).length;
  if (errorCount === 0 && benignCount === 0) {
    console.log(
      `Postgres db tables synced with sequelize models (${okCount}/${modelEntries.length})`,
    );
  } else {
    console.log(
      `Postgres db sync complete: ${okCount} ok, ${benignCount} already-exists, ${errorCount} hard error(s). Service is starting; degraded tables: ${
        failures
          .filter((f) => !f.benign)
          .map((f) => f.modelName)
          .join(", ") || "(none)"
      }.`,
    );
  }
};

module.exports = {
  startPostgres,
  syncModels,
  closePostgres,
  sequelize,
  checkDatabaseExists,
};
