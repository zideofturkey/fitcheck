const { sequelize } = require("common");

const TYPE_DEFAULTS = {
  string: "''",
  varchar: "''",
  text: "''",
  integer: "0",
  int: "0",
  bigint: "0",
  smallint: "0",
  number: "0",
  float: "0",
  double: "0",
  decimal: "0",
  boolean: "false",
  bool: "false",
  uuid: "gen_random_uuid()",
  date: "CURRENT_DATE",
  timestamp: "NOW()",
  timestamptz: "NOW()",
  json: "'{}'::json",
  jsonb: "'{}'::jsonb",
};

function getTypeDefault(type) {
  return TYPE_DEFAULTS[(type || "string").toLowerCase()] || "''";
}

const STRATEGY_DEFS = {
  typeChange: {
    string_to_uuid: {
      label: "String → UUID",
      risk: "high",
      autoSelect: (ctx) =>
        ctx.nullable ? "set_null_for_invalid" : "generate_new_uuids",
      strategies: {
        set_null_for_invalid: {
          name: "Set NULL for invalid UUIDs",
          backup:
            'CREATE TABLE IF NOT EXISTS "{table}_{field}_backup" AS SELECT id, "{field}" FROM "{table}" WHERE NOT "{field}" ~ \'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$\'',
          preFix:
            'UPDATE "{table}" SET "{field}" = NULL WHERE NOT "{field}" ~ \'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$\'',
          migrate: `ALTER TABLE "{table}" ALTER COLUMN "{field}" TYPE UUID USING "{field}"::uuid`,
          down: `ALTER TABLE "{table}" ALTER COLUMN "{field}" TYPE VARCHAR(255)`,
        },
        generate_new_uuids: {
          name: "Generate new UUIDs for invalid values",
          backup:
            'CREATE TABLE IF NOT EXISTS "{table}_{field}_backup" AS SELECT id, "{field}" FROM "{table}" WHERE "{field}" IS NULL OR NOT "{field}" ~ \'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$\'',
          preFix:
            'UPDATE "{table}" SET "{field}" = gen_random_uuid()::text WHERE "{field}" IS NULL OR NOT "{field}" ~ \'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$\'',
          migrate: `ALTER TABLE "{table}" ALTER COLUMN "{field}" TYPE UUID USING "{field}"::uuid`,
          down: `ALTER TABLE "{table}" ALTER COLUMN "{field}" TYPE VARCHAR(255)`,
        },
      },
    },
    string_to_integer: {
      label: "String → Integer",
      risk: "high",
      autoSelect: (ctx) =>
        ctx.nullable ? "set_null_for_invalid" : "set_zero_for_invalid",
      strategies: {
        set_null_for_invalid: {
          name: "Set NULL for non-numeric values",
          backup: `CREATE TABLE IF NOT EXISTS "{table}_{field}_backup" AS SELECT id, "{field}" FROM "{table}" WHERE "{field}" !~ '^-?[0-9]+$'`,
          preFix: `UPDATE "{table}" SET "{field}" = NULL WHERE "{field}" !~ '^-?[0-9]+$'`,
          migrate: `ALTER TABLE "{table}" ALTER COLUMN "{field}" TYPE INTEGER USING NULLIF("{field}", '')::integer`,
          down: `ALTER TABLE "{table}" ALTER COLUMN "{field}" TYPE VARCHAR(255)`,
        },
        set_zero_for_invalid: {
          name: "Set 0 for non-numeric values",
          backup: `CREATE TABLE IF NOT EXISTS "{table}_{field}_backup" AS SELECT id, "{field}" FROM "{table}" WHERE "{field}" IS NULL OR "{field}" !~ '^-?[0-9]+$'`,
          preFix: `UPDATE "{table}" SET "{field}" = '0' WHERE "{field}" IS NULL OR "{field}" !~ '^-?[0-9]+$'`,
          migrate: `ALTER TABLE "{table}" ALTER COLUMN "{field}" TYPE INTEGER USING "{field}"::integer`,
          down: `ALTER TABLE "{table}" ALTER COLUMN "{field}" TYPE VARCHAR(255)`,
        },
      },
    },
    string_to_boolean: {
      label: "String → Boolean",
      risk: "medium",
      autoSelect: (ctx) => (ctx.nullable ? "default_null" : "default_false"),
      strategies: {
        default_null: {
          name: "Map known values, set unknown to NULL",
          backup: `CREATE TABLE IF NOT EXISTS "{table}_{field}_backup" AS SELECT id, "{field}" FROM "{table}" WHERE "{field}" IS NOT NULL AND LOWER("{field}") NOT IN ('true','false','1','0','yes','no','t','f')`,
          migrate: `ALTER TABLE "{table}" ALTER COLUMN "{field}" TYPE BOOLEAN USING CASE WHEN LOWER("{field}") IN ('true','1','yes','t') THEN true WHEN LOWER("{field}") IN ('false','0','no','f') THEN false ELSE NULL END`,
          down: `ALTER TABLE "{table}" ALTER COLUMN "{field}" TYPE VARCHAR(10)`,
        },
        default_false: {
          name: "Map truthy to true, everything else to false",
          backup: `CREATE TABLE IF NOT EXISTS "{table}_{field}_backup" AS SELECT id, "{field}" FROM "{table}" WHERE "{field}" IS NOT NULL AND LOWER("{field}") NOT IN ('true','false','1','0','yes','no','t','f')`,
          migrate: `ALTER TABLE "{table}" ALTER COLUMN "{field}" TYPE BOOLEAN USING CASE WHEN LOWER("{field}") IN ('true','1','yes','t') THEN true ELSE false END`,
          down: `ALTER TABLE "{table}" ALTER COLUMN "{field}" TYPE VARCHAR(10)`,
        },
      },
    },
    text_to_string: {
      label: "Text → String (truncate)",
      risk: "medium",
      autoSelect: () => "truncate",
      strategies: {
        truncate: {
          name: "Truncate long values to fit",
          backup: `CREATE TABLE IF NOT EXISTS "{table}_{field}_backup" AS SELECT id, "{field}" FROM "{table}" WHERE LENGTH("{field}") > 255`,
          preFix: `UPDATE "{table}" SET "{field}" = LEFT("{field}", 255) WHERE LENGTH("{field}") > 255`,
          migrate: `ALTER TABLE "{table}" ALTER COLUMN "{field}" TYPE VARCHAR(255)`,
          down: `ALTER TABLE "{table}" ALTER COLUMN "{field}" TYPE TEXT`,
        },
      },
    },
    json_to_array: {
      label: "JSON → Text Array",
      risk: "medium",
      autoSelect: () => "convert_or_default",
      strategies: {
        convert_or_default: {
          name: "Convert valid JSON arrays, default invalid to empty",
          backup: `CREATE TABLE IF NOT EXISTS "{table}_{field}_backup" AS SELECT id, "{field}" as original_value FROM "{table}" WHERE "{field}" IS NULL OR jsonb_typeof("{field}") != 'array'`,
          preFix: `UPDATE "{table}" SET "{field}" = '[]'::jsonb WHERE "{field}" IS NULL OR jsonb_typeof("{field}") != 'array'`,
          migrate: `ALTER TABLE "{table}" ALTER COLUMN "{field}" TYPE TEXT[] USING ARRAY(SELECT jsonb_array_elements_text("{field}"))`,
          down: `ALTER TABLE "{table}" ALTER COLUMN "{field}" TYPE JSONB USING to_jsonb("{field}")`,
        },
      },
    },
    array_to_json: {
      label: "Array → JSON",
      risk: "low",
      autoSelect: () => "convert_direct",
      strategies: {
        convert_direct: {
          name: "Direct conversion (always succeeds)",
          backup: `CREATE TABLE IF NOT EXISTS "{table}_{field}_backup" AS SELECT id, "{field}" as original_value FROM "{table}" WHERE "{field}" IS NOT NULL`,
          migrate: `ALTER TABLE "{table}" ALTER COLUMN "{field}" TYPE JSONB USING to_jsonb("{field}")`,
          down: `ALTER TABLE "{table}" ALTER COLUMN "{field}" TYPE TEXT[] USING ARRAY(SELECT jsonb_array_elements_text("{field}"))`,
        },
      },
    },
  },

  nullableChange: {
    null_to_not_null: {
      label: "NULL → NOT NULL",
      risk: "high",
      autoSelect: (ctx) => {
        if (
          ctx.type === "boolean" ||
          ctx.type === "integer" ||
          ctx.type === "number"
        )
          return "set_type_default";
        if (ctx.hasDefault) return "set_type_default";
        return "set_empty_string";
      },
      strategies: {
        set_type_default: {
          name: "Set type-appropriate default for NULLs",
          backup: `CREATE TABLE IF NOT EXISTS "{table}_{field}_null_backup" AS SELECT id FROM "{table}" WHERE "{field}" IS NULL`,
          preFixTemplate: true,
          migrate: `ALTER TABLE "{table}" ALTER COLUMN "{field}" SET NOT NULL`,
          down: `ALTER TABLE "{table}" ALTER COLUMN "{field}" DROP NOT NULL`,
        },
        set_empty_string: {
          name: "Set empty string for NULLs",
          backup: `CREATE TABLE IF NOT EXISTS "{table}_{field}_null_backup" AS SELECT id FROM "{table}" WHERE "{field}" IS NULL`,
          preFix: `UPDATE "{table}" SET "{field}" = '' WHERE "{field}" IS NULL`,
          migrate: `ALTER TABLE "{table}" ALTER COLUMN "{field}" SET NOT NULL`,
          down: `ALTER TABLE "{table}" ALTER COLUMN "{field}" DROP NOT NULL`,
        },
      },
    },
  },

  uniqueChange: {
    add_unique: {
      label: "Add UNIQUE constraint",
      risk: "high",
      autoSelect: () => "append_random_suffix",
      strategies: {
        append_random_suffix: {
          name: "Append random suffix to duplicates (keep all data)",
          backup: `CREATE TABLE IF NOT EXISTS "{table}_{field}_dup_backup" AS SELECT * FROM "{table}" WHERE id NOT IN (SELECT MIN(id) FROM "{table}" GROUP BY "{field}")`,
          preFix: `UPDATE "{table}" SET "{field}" = "{field}" || '_' || SUBSTRING(MD5(RANDOM()::text), 1, 6) WHERE id NOT IN (SELECT MIN(id) FROM "{table}" GROUP BY "{field}")`,
          migrate: `ALTER TABLE "{table}" ADD CONSTRAINT "{table}_{field}_unique" UNIQUE ("{field}")`,
          down: `ALTER TABLE "{table}" DROP CONSTRAINT IF EXISTS "{table}_{field}_unique"`,
        },
        soft_delete_duplicates: {
          name: "Soft delete duplicate rows (mark isActive=false)",
          backup: `CREATE TABLE IF NOT EXISTS "{table}_{field}_dup_backup" AS SELECT * FROM "{table}" WHERE id NOT IN (SELECT MIN(id) FROM "{table}" GROUP BY "{field}")`,
          preFix: `UPDATE "{table}" SET "isActive" = false WHERE id NOT IN (SELECT MIN(id) FROM "{table}" GROUP BY "{field}")`,
          migrate: `ALTER TABLE "{table}" ADD CONSTRAINT "{table}_{field}_unique" UNIQUE ("{field}")`,
          down: `ALTER TABLE "{table}" DROP CONSTRAINT IF EXISTS "{table}_{field}_unique"`,
        },
      },
    },
  },

  fieldRemoval: {
    remove_field: {
      label: "Remove field",
      risk: "critical",
      autoSelect: () => "backup_then_delete",
      strategies: {
        backup_then_delete: {
          name: "Backup data, then drop column",
          backup: `CREATE TABLE IF NOT EXISTS "{table}_{field}_removed_backup" AS SELECT id, "{field}", NOW() as removed_at FROM "{table}"`,
          migrate: `ALTER TABLE "{table}" DROP COLUMN "{field}"`,
          down: `ALTER TABLE "{table}" ADD COLUMN "{field}" {originalType}`,
        },
        soft_delete_rename: {
          name: "Rename column with _deleted_ prefix (keep data in table)",
          migrate: `ALTER TABLE "{table}" RENAME COLUMN "{field}" TO "_deleted_{field}"`,
          down: `ALTER TABLE "{table}" RENAME COLUMN "_deleted_{field}" TO "{field}"`,
        },
      },
    },
  },

  indexChange: {
    add_index: {
      label: "Add index",
      risk: "low",
      autoSelect: () => "create_concurrently",
      strategies: {
        create_concurrently: {
          name: "Create index concurrently (non-blocking)",
          migrate: `CREATE INDEX CONCURRENTLY IF NOT EXISTS "{indexName}" ON "{table}" ("{field}")`,
          down: `DROP INDEX CONCURRENTLY IF EXISTS "{indexName}"`,
        },
      },
    },
    remove_index: {
      label: "Remove index",
      risk: "low",
      autoSelect: () => "drop_concurrently",
      strategies: {
        drop_concurrently: {
          name: "Drop index concurrently (non-blocking)",
          migrate: `DROP INDEX CONCURRENTLY IF EXISTS "{indexName}"`,
          down: `CREATE INDEX CONCURRENTLY IF NOT EXISTS "{indexName}" ON "{table}" ("{field}")`,
        },
      },
    },
  },
};

function normalizeTypeChangeKey(oldType, newType) {
  const old = (oldType || "").toLowerCase();
  const newT = (newType || "").toLowerCase();
  if (
    (old === "json" || old === "jsonb" || old === "object") &&
    (newT.includes("[]") || newT === "array")
  )
    return "json_to_array";
  if (
    (old.includes("[]") || old === "array") &&
    (newT === "json" || newT === "jsonb" || newT === "object")
  )
    return "array_to_json";
  return `${old}_to_${newT}`;
}

function fillTemplate(sql, vars) {
  if (!sql) return null;
  let result = sql;
  for (const [key, val] of Object.entries(vars)) {
    result = result.split(`{${key}}`).join(val || "");
  }
  return result;
}

class DbMigrationGenerator {
  /**
   * Generate a strategy-based migration from a schema diff.
   * Returns { code, steps, warnings, strategies, backupTables, downCode }
   */
  generate(tableName, diff) {
    const steps = [];
    const warnings = [];
    const backupTables = [];
    const strategySummary = [];

    // 1. Added columns
    for (const col of diff.addedColumns || []) {
      const def = col.modelDefinition || {};
      const sqlType = this.toSqlType(def.type);
      const nullable = def.allowNull !== false ? "" : " NOT NULL";
      const defaultClause =
        def.defaultValue != null
          ? ` DEFAULT ${this.toSqlDefault(def.defaultValue, def.type)}`
          : "";
      steps.push({
        phase: "add_column",
        action: "ADD COLUMN",
        sql: `ALTER TABLE "${tableName}" ADD COLUMN "${col.name}" ${sqlType}${nullable}${defaultClause};`,
        downSql: `ALTER TABLE "${tableName}" DROP COLUMN IF EXISTS "${col.name}";`,
        description: `Add column "${col.name}" (${sqlType})`,
        risk: "safe",
      });
    }

    // 2. Modified columns - with strategies
    for (const col of diff.modifiedColumns || []) {
      for (const change of col.changes || []) {
        if (change.field === "type") {
          this._addTypeChangeSteps(
            tableName,
            col.name,
            change,
            col,
            steps,
            warnings,
            backupTables,
            strategySummary,
          );
        }
        if (change.field === "nullable") {
          this._addNullableChangeSteps(
            tableName,
            col.name,
            change,
            col,
            steps,
            warnings,
            backupTables,
            strategySummary,
          );
        }
      }
    }

    // 3. Index differences
    for (const idxDiff of diff.indexDifferences || []) {
      if (idxDiff.type === "missing_in_db") {
        const idxFields = Array.isArray(idxDiff.fields) ? idxDiff.fields : [];
        const fields = idxFields.map((f) => `"${f}"`).join(", ");
        const unique = idxDiff.unique ? "UNIQUE " : "";
        const idxName = `idx_${tableName}_${idxFields.join("_")}`;
        steps.push({
          phase: "index",
          action: "CREATE INDEX",
          sql: `CREATE ${unique}INDEX CONCURRENTLY IF NOT EXISTS "${idxName}" ON "${tableName}" (${fields});`,
          downSql: `DROP INDEX CONCURRENTLY IF EXISTS "${idxName}";`,
          description: `Create ${unique}index on [${idxFields.join(", ")}]`,
          risk: "safe",
        });
      }
    }

    // 4. Removed columns (extra in DB, not in model) - only if explicitly requested
    // We don't auto-remove columns in the generated migration since they may be intentional

    const code = this._buildCode(tableName, steps);
    const downCode = this._buildDownCode(tableName, steps);

    return {
      code,
      steps,
      warnings,
      backupTables,
      strategies: strategySummary,
      downCode,
      tableName,
    };
  }

  _addTypeChangeSteps(
    tableName,
    fieldName,
    change,
    colContext,
    steps,
    warnings,
    backupTables,
    strategySummary,
  ) {
    const changeKey = normalizeTypeChangeKey(
      change.normalizedDb || change.dbValue,
      change.normalizedModel || change.modelValue,
    );
    const reversedKey = normalizeTypeChangeKey(
      change.normalizedModel || change.modelValue,
      change.normalizedDb || change.dbValue,
    );

    const typeDef =
      STRATEGY_DEFS.typeChange[changeKey] ||
      STRATEGY_DEFS.typeChange[reversedKey];

    if (typeDef) {
      const nullable = colContext.dbDefinition?.allowNull !== false;
      const selectedId = typeDef.autoSelect({
        nullable,
        type: change.modelValue,
      });
      const strategy = typeDef.strategies[selectedId];

      if (!strategy) {
        this._addGenericTypeChange(
          tableName,
          fieldName,
          change,
          steps,
          warnings,
        );
        return;
      }

      const vars = { table: tableName, field: fieldName };
      strategySummary.push({
        field: fieldName,
        category: "typeChange",
        changeKey,
        label: typeDef.label,
        risk: typeDef.risk,
        selectedStrategy: selectedId,
        strategyName: strategy.name,
        autoReason: nullable ? "Field allows NULL" : "Field NOT NULL",
      });

      if (strategy.backup) {
        const backupSql = fillTemplate(strategy.backup, vars);
        const backupTable = `${tableName}_${fieldName}_backup`;
        backupTables.push(backupTable);
        steps.push({
          phase: "backup",
          action: "BACKUP",
          sql: backupSql + ";",
          description: `Backup "${fieldName}" data before type change (${typeDef.label})`,
          risk: "safe",
        });
      }

      if (strategy.preFix) {
        const preFixSql = fillTemplate(strategy.preFix, vars);
        steps.push({
          phase: "pre_fix",
          action: "PRE-MIGRATION FIX",
          sql: preFixSql + ";",
          description: `${strategy.name} for "${fieldName}"`,
          risk: "moderate",
        });
      }

      const migrateSql = fillTemplate(strategy.migrate, vars);
      const downSql = fillTemplate(strategy.down, vars);
      steps.push({
        phase: "alter",
        action: "ALTER COLUMN TYPE",
        sql: migrateSql + ";",
        downSql: downSql ? downSql + ";" : null,
        description: `${typeDef.label}: change "${fieldName}" type`,
        risk: typeDef.risk === "high" ? "dangerous" : "moderate",
      });
    } else {
      this._addGenericTypeChange(tableName, fieldName, change, steps, warnings);
    }
  }

  _addGenericTypeChange(tableName, fieldName, change, steps, warnings) {
    const newType = this.toSqlType(change.modelValue);
    steps.push({
      phase: "alter",
      action: "ALTER COLUMN TYPE",
      sql: `ALTER TABLE "${tableName}" ALTER COLUMN "${fieldName}" TYPE ${newType} USING "${fieldName}"::${newType};`,
      downSql: `ALTER TABLE "${tableName}" ALTER COLUMN "${fieldName}" TYPE ${this.toSqlType(change.dbValue)};`,
      description: `Change type of "${fieldName}" from ${change.dbValue} to ${change.modelValue}`,
      risk: change.severity === "error" ? "dangerous" : "moderate",
    });
    warnings.push(
      `Type change on "${fieldName}" (${change.dbValue} → ${change.modelValue}) has no specific strategy. Using generic USING cast which may fail.`,
    );
  }

  _addNullableChangeSteps(
    tableName,
    fieldName,
    change,
    colContext,
    steps,
    warnings,
    backupTables,
    strategySummary,
  ) {
    if (change.modelValue === true || change.modelValue === "yes") {
      steps.push({
        phase: "alter",
        action: "DROP NOT NULL",
        sql: `ALTER TABLE "${tableName}" ALTER COLUMN "${fieldName}" DROP NOT NULL;`,
        downSql: `ALTER TABLE "${tableName}" ALTER COLUMN "${fieldName}" SET NOT NULL;`,
        description: `Allow NULL on "${fieldName}"`,
        risk: "safe",
      });
      return;
    }

    // Making NOT NULL - need strategy
    const typeDef = STRATEGY_DEFS.nullableChange.null_to_not_null;
    const colType = (colContext.dbDefinition?.type || "string").toLowerCase();
    const hasDefault = colContext.modelDefinition?.defaultValue != null;
    const selectedId = typeDef.autoSelect({ type: colType, hasDefault });
    const strategy = typeDef.strategies[selectedId];

    if (!strategy) {
      steps.push({
        phase: "alter",
        action: "SET NOT NULL",
        sql: `ALTER TABLE "${tableName}" ALTER COLUMN "${fieldName}" SET NOT NULL;`,
        downSql: `ALTER TABLE "${tableName}" ALTER COLUMN "${fieldName}" DROP NOT NULL;`,
        description: `Set NOT NULL on "${fieldName}"`,
        risk: "moderate",
      });
      warnings.push(
        `Setting NOT NULL on "${fieldName}" will fail if NULL values exist.`,
      );
      return;
    }

    const vars = { table: tableName, field: fieldName };
    const typeDefault = getTypeDefault(colType);

    strategySummary.push({
      field: fieldName,
      category: "nullableChange",
      changeKey: "null_to_not_null",
      label: typeDef.label,
      risk: typeDef.risk,
      selectedStrategy: selectedId,
      strategyName: strategy.name,
      autoReason: `Use default ${typeDefault} for type ${colType}`,
    });

    if (strategy.backup) {
      steps.push({
        phase: "backup",
        action: "BACKUP",
        sql: fillTemplate(strategy.backup, vars) + ";",
        description: `Backup NULL row IDs for "${fieldName}" before NOT NULL`,
        risk: "safe",
      });
      backupTables.push(`${tableName}_${fieldName}_null_backup`);
    }

    const preFixSql = strategy.preFixTemplate
      ? `UPDATE "${tableName}" SET "${fieldName}" = ${typeDefault} WHERE "${fieldName}" IS NULL;`
      : strategy.preFix
        ? fillTemplate(strategy.preFix, vars) + ";"
        : null;

    if (preFixSql) {
      steps.push({
        phase: "pre_fix",
        action: "PRE-MIGRATION FIX",
        sql: preFixSql,
        description: `${strategy.name}: set NULL "${fieldName}" to ${typeDefault}`,
        risk: "moderate",
      });
    }

    steps.push({
      phase: "alter",
      action: "SET NOT NULL",
      sql: fillTemplate(strategy.migrate, vars) + ";",
      downSql: fillTemplate(strategy.down, vars) + ";",
      description: `Add NOT NULL constraint to "${fieldName}"`,
      risk: "moderate",
    });
  }

  _buildCode(tableName, steps) {
    if (steps.length === 0) return "-- No migration steps needed";
    const backupSteps = steps.filter((s) => s.phase === "backup");
    const preFixSteps = steps.filter((s) => s.phase === "pre_fix");
    const alterSteps = steps.filter(
      (s) =>
        s.phase !== "backup" && s.phase !== "pre_fix" && s.phase !== "index",
    );
    const indexSteps = steps.filter((s) => s.phase === "index");

    const sections = [];
    if (backupSteps.length) {
      sections.push(
        `-- ═══════════════════════════════════════\n-- PHASE 1: Backup data before changes\n-- ═══════════════════════════════════════`,
      );
      backupSteps.forEach((s, i) =>
        sections.push(`-- ${s.description}\n${s.sql}`),
      );
    }
    if (preFixSteps.length || alterSteps.length) {
      sections.push(
        `\n-- ═══════════════════════════════════════\n-- PHASE 2: Pre-migration fixes & schema changes (transactional)\n-- ═══════════════════════════════════════\nBEGIN;`,
      );
      preFixSteps.forEach((s) =>
        sections.push(`\n-- Pre-fix: ${s.description}\n${s.sql}`),
      );
      alterSteps.forEach((s) =>
        sections.push(`\n-- ${s.description}\n${s.sql}`),
      );
      sections.push(`\nCOMMIT;`);
    }
    if (indexSteps.length) {
      sections.push(
        `\n-- ═══════════════════════════════════════\n-- PHASE 3: Index changes (non-blocking, outside transaction)\n-- ═══════════════════════════════════════`,
      );
      indexSteps.forEach((s) =>
        sections.push(`\n-- ${s.description}\n${s.sql}`),
      );
    }
    return sections.join("\n");
  }

  _buildDownCode(tableName, steps) {
    const downSteps = steps.filter((s) => s.downSql).reverse();
    if (downSteps.length === 0) return "-- No rollback steps";
    const lines = downSteps.map(
      (s) => `-- Rollback: ${s.description}\n${s.downSql}`,
    );
    return `-- ROLLBACK MIGRATION for "${tableName}"\nBEGIN;\n\n${lines.join("\n\n")}\n\nCOMMIT;`;
  }

  /**
   * Execute a generated migration (runs SQL phases in order)
   */
  async execute(migrationCode) {
    const rawStatements = migrationCode
      .split(";")
      .map((s) => s.replace(/--[^\n]*/g, "").trim())
      .filter((s) => s && s !== "BEGIN" && s !== "COMMIT");

    const backupStatements = [];
    const transactionalStatements = [];
    const indexStatements = [];

    for (const stmt of rawStatements) {
      if (
        stmt.toUpperCase().startsWith("CREATE TABLE IF NOT EXISTS") &&
        stmt.includes("_backup")
      ) {
        backupStatements.push(stmt);
      } else if (
        stmt.toUpperCase().startsWith("CREATE INDEX CONCURRENTLY") ||
        stmt.toUpperCase().startsWith("DROP INDEX CONCURRENTLY")
      ) {
        indexStatements.push(stmt);
      } else {
        transactionalStatements.push(stmt);
      }
    }

    const results = [];

    // Phase 1: Backups (outside transaction, OK to fail individually)
    for (const stmt of backupStatements) {
      try {
        await sequelize.query(stmt + ";");
        results.push({ sql: stmt, status: "success", phase: "backup" });
      } catch (err) {
        results.push({
          sql: stmt,
          status: "warning",
          phase: "backup",
          error: err.message,
        });
      }
    }

    // Phase 2: Transactional changes
    if (transactionalStatements.length > 0) {
      const transaction = await sequelize.transaction();
      try {
        for (const stmt of transactionalStatements) {
          await sequelize.query(stmt + ";", { transaction });
          results.push({
            sql: stmt,
            status: "success",
            phase: "transactional",
          });
        }
        await transaction.commit();
      } catch (err) {
        await transaction.rollback();
        results.push({
          sql: "ROLLBACK",
          status: "error",
          phase: "transactional",
          error: err.message,
        });
        return {
          status: "failed",
          error: err.message,
          results,
          phase: "transactional",
        };
      }
    }

    // Phase 3: Index changes (outside transaction, non-blocking)
    for (const stmt of indexStatements) {
      try {
        await sequelize.query(stmt + ";");
        results.push({ sql: stmt, status: "success", phase: "index" });
      } catch (err) {
        results.push({
          sql: stmt,
          status: "warning",
          phase: "index",
          error: err.message,
        });
      }
    }

    return { status: "success", results };
  }

  toSqlType(seqType) {
    if (!seqType) return "VARCHAR(255)";
    const upper = String(seqType).toUpperCase();

    // Handle array types: ARRAY(X) syntax — extract inner type and convert to SQL X[]
    if (upper.startsWith("ARRAY(")) {
      const inner = (upper.match(/^ARRAY\((.+)\)$/)?.[1] || "").trim();
      const innerSql = this.toSqlType(inner); // recursively resolve the element type
      return `${innerSql}[]`;
    }
    // Handle array types: X[] syntax — already valid PostgreSQL, pass through
    if (upper.endsWith("[]")) return upper;

    const map = {
      UUID: "UUID",
      STRING: "VARCHAR(255)",
      TEXT: "TEXT",
      INTEGER: "INTEGER",
      BIGINT: "BIGINT",
      FLOAT: "REAL",
      DOUBLE: "DOUBLE PRECISION",
      "DOUBLE PRECISION": "DOUBLE PRECISION",
      DECIMAL: "NUMERIC",
      BOOLEAN: "BOOLEAN",
      DATE: "DATE",
      DATEONLY: "DATE",
      TIMESTAMP: "TIMESTAMP WITH TIME ZONE",
      JSON: "JSON",
      JSONB: "JSONB",
      GEOMETRY: "GEOMETRY",
      GEOGRAPHY: "GEOGRAPHY",
    };
    const base = upper.replace(/\(.+\)/, "").trim();
    if (upper.startsWith("STRING(")) {
      const len = upper.match(/\((\d+)\)/)?.[1] || "255";
      return `VARCHAR(${len})`;
    }
    return map[base] || map[upper] || "VARCHAR(255)";
  }

  toSqlDefault(value, type) {
    if (value === null) return "NULL";
    if (value === true) return "TRUE";
    if (value === false) return "FALSE";
    if (typeof value === "number") return String(value);
    return `'${String(value).replace(/'/g, "''")}'`;
  }
}

module.exports = new DbMigrationGenerator();
