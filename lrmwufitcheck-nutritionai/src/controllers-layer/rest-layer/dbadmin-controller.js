const express = require("express");
const router = express.Router();
const { sequelize, checkDatabaseExists } = require("common");
const dbIntrospector = require("../../utils/dbSchemaIntrospector");
const dbSchemaDiffer = require("../../utils/dbSchemaDiffer");
const dbMigrationGenerator = require("../../utils/dbMigrationGenerator");

const createServiceController = require("./create-service-controller");

const ADMIN_ROLES = ["superAdmin", "admin", "saasAdmin"];

const initWithRestController = async (req, res) => {
  const restController = createServiceController(
    "dbadmin",
    "dbadmin",
    req,
    res,
  );
  await restController.init();
};

async function requireDbAdmin(req, res, next) {
  try {
    await initWithRestController(req, res);
  } catch (err) {
    return res
      .status(401)
      .json({
        error: "Authentication failed: " + (err.message || "invalid token"),
      });
  }

  const session = req.session;
  if (!session || !session.roleId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const roleId = Array.isArray(session.roleId)
    ? session.roleId[0]
    : session.roleId;
  if (!ADMIN_ROLES.includes(roleId)) {
    return res
      .status(403)
      .json({
        error: "Insufficient permissions. Required: " + ADMIN_ROLES.join(", "),
      });
  }
  next();
}

router.use("/v1/_dbadmin", requireDbAdmin);

const MODEL_REGISTRY = {
  aiSession: {
    modelName: "AiSession",
    objectName: "aiSession",
    schemaPath: "../../models/schemas/aiSession.schema",
    getModel: () => require("../../models").AiSession,
    getTableName: () => {
      try {
        const Model = require("../../models").AiSession;
        return Model?.getTableName?.() || "aiSession";
      } catch {
        return "aiSession";
      }
    },
  },
  aiCandidateMeal: {
    modelName: "AiCandidateMeal",
    objectName: "aiCandidateMeal",
    schemaPath: "../../models/schemas/aiCandidateMeal.schema",
    getModel: () => require("../../models").AiCandidateMeal,
    getTableName: () => {
      try {
        const Model = require("../../models").AiCandidateMeal;
        return Model?.getTableName?.() || "aiCandidateMeal";
      } catch {
        return "aiCandidateMeal";
      }
    },
  },
  aiCandidateLine: {
    modelName: "AiCandidateLine",
    objectName: "aiCandidateLine",
    schemaPath: "../../models/schemas/aiCandidateLine.schema",
    getModel: () => require("../../models").AiCandidateLine,
    getTableName: () => {
      try {
        const Model = require("../../models").AiCandidateLine;
        return Model?.getTableName?.() || "aiCandidateLine";
      } catch {
        return "aiCandidateLine";
      }
    },
  },
  aiGuidanceNote: {
    modelName: "AiGuidanceNote",
    objectName: "aiGuidanceNote",
    schemaPath: "../../models/schemas/aiGuidanceNote.schema",
    getModel: () => require("../../models").AiGuidanceNote,
    getTableName: () => {
      try {
        const Model = require("../../models").AiGuidanceNote;
        return Model?.getTableName?.() || "aiGuidanceNote";
      } catch {
        return "aiGuidanceNote";
      }
    },
  },
};

// GET /v1/_dbadmin/objects -- list all data objects
router.get("/v1/_dbadmin/objects", async (req, res) => {
  try {
    const result = [];
    for (const [objectName, info] of Object.entries(MODEL_REGISTRY)) {
      const tableName = info.getTableName();
      const tableExists = await dbIntrospector.tableExists(tableName);
      result.push({
        objectName,
        modelName: info.modelName,
        tableName,
        tableExists,
      });
    }
    res.json({ objects: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /v1/_dbadmin/objects/:objectName/model-schema
router.get(
  "/v1/_dbadmin/objects/:objectName/model-schema",
  async (req, res) => {
    try {
      const info = MODEL_REGISTRY[req.params.objectName];
      if (!info) return res.status(404).json({ error: "Object not found" });

      const schemaDef = require(info.schemaPath);
      const serialized =
        typeof schemaDef.serialize === "function"
          ? schemaDef.serialize()
          : schemaDef;

      res.json({ objectName: req.params.objectName, schema: serialized });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// GET /v1/_dbadmin/objects/:objectName/db-schema
router.get("/v1/_dbadmin/objects/:objectName/db-schema", async (req, res) => {
  try {
    const info = MODEL_REGISTRY[req.params.objectName];
    if (!info) return res.status(404).json({ error: "Object not found" });

    const tableName = info.getTableName();
    const dbSchema = await dbIntrospector.getTableSchema(tableName);

    res.json({
      objectName: req.params.objectName,
      tableName,
      schema: dbSchema,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /v1/_dbadmin/objects/:objectName/compare
router.get("/v1/_dbadmin/objects/:objectName/compare", async (req, res) => {
  try {
    const info = MODEL_REGISTRY[req.params.objectName];
    if (!info) return res.status(404).json({ error: "Object not found" });

    const schemaDef = require(info.schemaPath);
    const serialized =
      typeof schemaDef.serialize === "function"
        ? schemaDef.serialize()
        : schemaDef;

    const tableName = info.getTableName();
    const dbSchema = await dbIntrospector.getTableSchema(tableName);

    if (!dbSchema.exists) {
      return res.json({
        objectName: req.params.objectName,
        tableName,
        inSync: false,
        tableExists: false,
        message: "Table does not exist in database",
      });
    }

    const normalizedDb = dbIntrospector.normalizeDbSchema(dbSchema);
    const diff = dbSchemaDiffer.diff(serialized, normalizedDb);

    res.json({
      objectName: req.params.objectName,
      tableName,
      tableExists: true,
      ...diff,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /v1/_dbadmin/objects/:objectName/sync -- safe sync (alter: true, force: false)
router.post("/v1/_dbadmin/objects/:objectName/sync", async (req, res) => {
  try {
    const info = MODEL_REGISTRY[req.params.objectName];
    if (!info) return res.status(404).json({ error: "Object not found" });

    const Model = info.getModel();
    await Model.sync({ force: false, alter: true });

    res.json({
      status: "success",
      objectName: req.params.objectName,
      message: "Table synced with model (alter mode)",
    });
  } catch (err) {
    res.status(500).json({ status: "failed", error: err.message });
  }
});

// POST /v1/_dbadmin/objects/:objectName/sync-force -- DANGER: force sync (drops and recreates)
router.post("/v1/_dbadmin/objects/:objectName/sync-force", async (req, res) => {
  try {
    const info = MODEL_REGISTRY[req.params.objectName];
    if (!info) return res.status(404).json({ error: "Object not found" });

    const { confirmation } = req.body;
    const expectedConfirmation = `DROP TABLE ${req.params.objectName}`;
    if (confirmation !== expectedConfirmation) {
      return res.status(400).json({
        error: "Confirmation required",
        expectedConfirmation,
        message: `Send { "confirmation": "${expectedConfirmation}" } to confirm`,
      });
    }

    const Model = info.getModel();
    await Model.sync({ force: true });

    res.json({
      status: "success",
      objectName: req.params.objectName,
      message: "Table dropped and recreated (force mode) - ALL DATA LOST",
    });
  } catch (err) {
    res.status(500).json({ status: "failed", error: err.message });
  }
});

// POST /v1/_dbadmin/objects/:objectName/migration/generate -- smart sync step 1
router.post(
  "/v1/_dbadmin/objects/:objectName/migration/generate",
  async (req, res) => {
    try {
      const info = MODEL_REGISTRY[req.params.objectName];
      if (!info) return res.status(404).json({ error: "Object not found" });

      const schemaDef = require(info.schemaPath);
      const serialized =
        typeof schemaDef.serialize === "function"
          ? schemaDef.serialize()
          : schemaDef;

      const tableName = info.getTableName();
      const dbSchema = await dbIntrospector.getTableSchema(tableName);

      if (!dbSchema.exists) {
        return res.json({
          status: "no_table",
          message: "Table does not exist. Use sync instead.",
        });
      }

      const normalizedDb = dbIntrospector.normalizeDbSchema(dbSchema);
      const diff = dbSchemaDiffer.diff(serialized, normalizedDb);

      if (diff.inSync) {
        return res.json({
          status: "in_sync",
          message: "Schemas are already in sync. No migration needed.",
        });
      }

      const migration = dbMigrationGenerator.generate(tableName, diff);

      res.json({
        status: "migration_generated",
        objectName: req.params.objectName,
        tableName,
        migration,
        diff,
      });
    } catch (err) {
      res.status(500).json({ status: "failed", error: err.message });
    }
  },
);

// POST /v1/_dbadmin/objects/:objectName/migration/execute -- smart sync step 2
router.post(
  "/v1/_dbadmin/objects/:objectName/migration/execute",
  async (req, res) => {
    try {
      const { migrationCode } = req.body;
      if (!migrationCode) {
        return res
          .status(400)
          .json({ error: "migrationCode is required in request body" });
      }

      const result = await dbMigrationGenerator.execute(migrationCode);
      res.json(result);
    } catch (err) {
      res.status(500).json({ status: "failed", error: err.message });
    }
  },
);

// POST /v1/_dbadmin/objects/:objectName/drop-recreate -- DANGER: drop table and recreate
router.post(
  "/v1/_dbadmin/objects/:objectName/drop-recreate",
  async (req, res) => {
    try {
      const info = MODEL_REGISTRY[req.params.objectName];
      if (!info) return res.status(404).json({ error: "Object not found" });

      const { confirmation } = req.body;
      const expectedConfirmation = `DROP AND RECREATE ${req.params.objectName}`;
      if (confirmation !== expectedConfirmation) {
        return res.status(400).json({
          error: "Confirmation required",
          expectedConfirmation,
          message: `Send { "confirmation": "${expectedConfirmation}" } to confirm`,
        });
      }

      const Model = info.getModel();
      const tableName = info.getTableName();

      await sequelize.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);
      await Model.sync({ force: true });

      res.json({
        status: "success",
        objectName: req.params.objectName,
        message: "Table dropped and recreated - ALL DATA LOST",
      });
    } catch (err) {
      res.status(500).json({ status: "failed", error: err.message });
    }
  },
);

// GET /v1/_dbadmin/database/status
router.get("/v1/_dbadmin/database/status", async (req, res) => {
  try {
    const status = await dbIntrospector.getDatabaseStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message, connected: false });
  }
});

// POST /v1/_dbadmin/database/reset -- DANGER: drop ALL service tables and
// recreate them from the current model definitions. Used by the test
// runner / change worker to recover from schema drift (e.g. a column the
// generated code expects but the migration never added). Strictly limited
// to ephemeral environments — `dev` (local) and `test` (preview deployments
// run `npm run start-test` which sets SERVICE_CONFIG=test). Stage / beta /
// prod hold real user data and this endpoint refuses there.
//
// Note: gate is on SERVICE_CONFIG (Mindbricks' canonical environment
// selector — see src/index.ejs), NOT NODE_ENV.
//
// Required body: { confirmation: "RESET DATABASE <serviceName>" } — the
// caller has to know the service name to invoke it, which prevents an
// agent that's confused about which service is broken from nuking the
// wrong one.
router.post("/v1/_dbadmin/database/reset", async (req, res) => {
  const env = (process.env.SERVICE_CONFIG || "").toLowerCase();
  // Only ephemeral, non-user-data environments. Stage / beta / prod
  // are explicitly NOT allowed — those carry real customer state.
  const allowedEnvs = new Set(["dev", "test"]);
  if (!allowedEnvs.has(env)) {
    return res.status(403).json({
      status: "refused",
      reason: "environment_not_allowed",
      env: env || "(unset)",
      message: `database reset is disabled when SERVICE_CONFIG is "${env || "(unset)"}". Allowed: ${Array.from(allowedEnvs).join(", ")}.`,
    });
  }

  // The confirmation phrase MUST identify the target service so an
  // orchestrator confused about which service is broken can't nuke the
  // wrong one. Two names map onto the same service:
  //
  //   - SERVICE_NAME      — the long, codename-qualified form the
  //                          preview deployment sets, e.g.
  //                          `cheesychess1-auth-service`.
  //                          Source of truth for logs / DB names.
  //   - SERVICE_SHORT_NAME — the design-level short name from the
  //                          spec, e.g. `auth`. The same string the
  //                          orchestrator's resetServiceDatabase()
  //                          derives from the preview status route
  //                          (`auth-api` → `auth`).
  //
  // Historically the endpoint accepted only the long form, which the
  // orchestrator never sent — every preview reset returned 400
  // confirmation_required and was logged as failed silently. The
  // visible symptom was "test data persists across runs / populate
  // tasks": auth had test users from prior runs alongside the new
  // ones because auth's reset never actually executed.
  //
  // Accept either form. Surface both in the error response when
  // neither matches, so any future drift in the orchestrator's
  // expected phrasing is debuggable in one shot.
  const fullName = process.env.SERVICE_NAME || "(unknown)";
  const shortName = process.env.SERVICE_SHORT_NAME || "";
  // Single label for response payloads + error messages. Prefer the
  // short name (matches the orchestrator's resetServiceDatabase()
  // logging shape — e.g. `auth`, `actionFlow`) and fall back to the
  // env-qualified long name only when SERVICE_SHORT_NAME isn't set.
  // Without this declaration the success / failure branches below
  // reference an undefined `serviceName` and crash the process with
  // a 500 + ReferenceError, blocking every subsequent dbadmin call
  // until the service restarts (observed on every preview that hit
  // the reset endpoint pre-2026-05-18).
  const serviceName = shortName || fullName;
  const expectedFull = `RESET DATABASE ${fullName}`;
  const expectedShort = shortName ? `RESET DATABASE ${shortName}` : null;
  const confirmation = req.body && req.body.confirmation;
  const matches =
    confirmation === expectedFull ||
    (expectedShort !== null && confirmation === expectedShort);
  if (!matches) {
    return res.status(400).json({
      status: "refused",
      reason: "confirmation_required",
      expectedConfirmation: expectedFull,
      acceptedConfirmations: expectedShort
        ? [expectedFull, expectedShort]
        : [expectedFull],
      message:
        `Send { "confirmation": "${expectedShort || expectedFull}" } in the body to authorise the reset. ` +
        (expectedShort
          ? `The long form "${expectedFull}" is also accepted. `
          : "") +
        `ALL DATA in the ${fullName} service's database will be lost.`,
    });
  }

  const startedAt = new Date();
  try {
    // sync({ force: true }) on the sequelize instance drops every model's
    // table and recreates them from the current schema definitions. This
    // is what we'd run on a fresh DB at first boot — same path, same
    // ordering, same constraints. After it returns the service has the
    // schema the code expects.
    await sequelize.sync({ force: true });

    // Refresh the connection pool. After a destructive sync the pool can
    // hold connections that referenced now-dropped tables — subsequent
    // queries on those connections fail with cached relation OIDs even
    // though the new tables exist.
    //
    // History: the original fix here called
    //   await sequelize.connectionManager.close();
    //   await sequelize.authenticate();
    // That seemed correct but is fundamentally broken in Sequelize 6:
    //   - connectionManager.close() REPLACES the manager's
    //     `getConnection` function with one that throws
    //     "ConnectionManager.getConnection was called after the
    //     connection manager was closed!", AND calls
    //     pool.drain() which sets the underlying sequelize-pool's
    //     `_draining = true` permanently. Once draining, new acquires
    //     are rejected with "pool is draining and cannot accept work".
    //   - The follow-up authenticate() therefore always fails, so the
    //     reconnect status reads "failed" and the agent has to restart
    //     the service anyway. Verified against
    //     node_modules/sequelize/lib/dialects/abstract/connection-manager.js
    //     line 68-73 + node_modules/sequelize-pool/lib/Pool.js line
    //     188-189 (2026-05-11, actionman z88qb test surfaced the
    //     persistent failure).
    //
    // The right primitive is the pool's own `destroyAllNow()` —
    // closes every idle connection without flipping `_draining`, so
    // the pool stays usable and the next acquire opens a fresh
    // connection with no stale OID cache. We handle both single-pool
    // and replicated-pool shapes (the connection-manager exposes the
    // same `destroyAllNow` method on the replication wrapper too).
    let reconnect = "ok";
    try {
      const pool =
        sequelize.connectionManager && sequelize.connectionManager.pool;
      if (pool) {
        if (typeof pool.destroyAllNow === "function") {
          await pool.destroyAllNow();
        } else if (pool.read && pool.write) {
          if (typeof pool.read.destroyAllNow === "function")
            await pool.read.destroyAllNow();
          if (typeof pool.write.destroyAllNow === "function")
            await pool.write.destroyAllNow();
        }
      }
      // Confirm the pool can serve a fresh connection after the
      // destroy — opens one new connection (no stale OIDs) and runs
      // the underlying SELECT 1.
      await sequelize.authenticate();
    } catch (poolErr) {
      reconnect =
        "failed: " +
        (poolErr && poolErr.message ? poolErr.message : String(poolErr));
    }

    // Wipe Elasticsearch indices for every data object. Without this step
    // the panel (and every list/search API that reads through ES) would
    // still see all pre-reset documents — sequelize.sync only touches PG.
    // rebuildAllIndexes drops + recreates each index with its mapping and
    // re-indexes from PG; since PG was just truncated, the re-index pass
    // is a no-op past the drop-and-create. The util also calls
    // ElasticIndexer.deleteRedisCache() per object, which clears the
    // `elasticCache:*` keys that mirror ES query results.
    let elasticReset = "ok";
    try {
      const { rebuildAllIndexes } = require("../../utils");
      const elasticResult = await rebuildAllIndexes();
      if (!elasticResult || elasticResult.success === false) {
        const errCount = elasticResult ? elasticResult.totalErrors : "unknown";
        elasticReset = `partial: ${errCount} index errors`;
      }
    } catch (esErr) {
      elasticReset =
        "failed: " + (esErr && esErr.message ? esErr.message : String(esErr));
    }

    // Wipe QueryCache + EntityCache entries per data object. Stale qcache
    // entries (keyed by query-shape hash, not row id) would otherwise
    // return old list results until their TTL; ecache entries (off by
    // default but used by hot-path getById callers when enabled) would
    // survive the PG reset entirely. QueryCacheInvalidator.invalidateAll
    // handles qcache via its own SCAN+DEL; for ecache we scan the three
    // key patterns (object key, by-index key, indexKeys set) directly.
    let cacheReset = "ok";
    const cacheErrors = [];
    try {
      const { QueryCacheInvalidator, redisClient } = require("common");
      for (const objectName of Object.keys(MODEL_REGISTRY)) {
        try {
          const invalidator = new QueryCacheInvalidator(objectName, []);
          await invalidator.invalidateAll();
        } catch (qerr) {
          cacheErrors.push(
            `qcache ${objectName}: ${qerr && qerr.message ? qerr.message : String(qerr)}`,
          );
        }
        try {
          const ecachePatterns = [
            `ecache:${objectName}:*`,
            `ecache:${objectName}-by-*:*`,
            `ecache:entityKeys:${objectName}:*`,
          ];
          for (const pattern of ecachePatterns) {
            for await (const key of redisClient.scanIterator({
              MATCH: pattern,
            })) {
              if (!key) continue;
              if (Array.isArray(key)) {
                for (const k of key) await redisClient.del(k);
              } else {
                await redisClient.del(key);
              }
            }
          }
        } catch (eerr) {
          cacheErrors.push(
            `ecache ${objectName}: ${eerr && eerr.message ? eerr.message : String(eerr)}`,
          );
        }
      }
      if (cacheErrors.length) cacheReset = "partial: " + cacheErrors.join("; ");
    } catch (cerr) {
      cacheReset =
        "failed: " + (cerr && cerr.message ? cerr.message : String(cerr));
    }

    const elapsedMs = new Date().getTime() - startedAt.getTime();
    res.json({
      status: "success",
      serviceName,
      env,
      elapsedMs,
      tablesRecreated: Object.keys(MODEL_REGISTRY).length,
      reconnect,
      elasticReset,
      cacheReset,
      message:
        `Database for ${serviceName} dropped and recreated. All previous data is gone.` +
        (reconnect === "ok"
          ? " Connection pool refreshed — service is ready."
          : " WARNING: connection pool refresh failed; restart the service if subsequent queries error.") +
        (elasticReset === "ok"
          ? " Elasticsearch indices wiped."
          : ` WARNING: elastic reset ${elasticReset}.`) +
        (cacheReset === "ok"
          ? " Redis caches cleared."
          : ` WARNING: cache reset ${cacheReset}.`),
    });
  } catch (err) {
    res.status(500).json({
      status: "failed",
      serviceName,
      env,
      error: err && err.message ? err.message : String(err),
    });
  }
});

module.exports = { dbAdminRouter: router };
