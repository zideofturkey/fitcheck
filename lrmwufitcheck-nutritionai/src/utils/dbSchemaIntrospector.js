const { sequelize } = require("common");

function ensureArray(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === "string" && val.startsWith("{") && val.endsWith("}")) {
    return val
      .slice(1, -1)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return val ? [val] : [];
}

class DbSchemaIntrospector {
  /**
   * Get full table schema from PostgreSQL including columns, indexes, constraints, and foreign keys
   */
  async getTableSchema(tableName) {
    const [columns, indexes, constraints, foreignKeys] = await Promise.all([
      this.getColumns(tableName),
      this.getIndexes(tableName),
      this.getConstraints(tableName),
      this.getForeignKeys(tableName),
    ]);

    return {
      tableName,
      exists: columns.length > 0,
      columns,
      indexes,
      constraints,
      foreignKeys,
      introspectedAt: new Date().toISOString(),
    };
  }

  async getColumns(tableName) {
    const [results] = await sequelize.query(
      `
      SELECT
        c.column_name,
        c.data_type,
        c.udt_name,
        c.column_default,
        c.is_nullable,
        c.character_maximum_length,
        c.numeric_precision,
        c.numeric_scale,
        c.ordinal_position
      FROM information_schema.columns c
      WHERE c.table_name = :tableName
        AND c.table_schema = 'public'
      ORDER BY c.ordinal_position
    `,
      { replacements: { tableName } },
    );

    return results.map((col) => ({
      name: col.column_name,
      dataType: col.data_type,
      udtName: col.udt_name,
      defaultValue: col.column_default,
      nullable: col.is_nullable === "YES",
      maxLength: col.character_maximum_length,
      numericPrecision: col.numeric_precision,
      numericScale: col.numeric_scale,
      position: col.ordinal_position,
    }));
  }

  async getIndexes(tableName) {
    const [results] = await sequelize.query(
      `
      SELECT
        i.relname AS index_name,
        ix.indisunique AS is_unique,
        ix.indisprimary AS is_primary,
        am.amname AS index_type,
        pg_get_indexdef(ix.indexrelid) AS index_definition,
        ARRAY(
          SELECT a.attname
          FROM unnest(ix.indkey) WITH ORDINALITY AS k(attnum, ord)
          JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = k.attnum
          ORDER BY k.ord
        ) AS column_names
      FROM pg_index ix
      JOIN pg_class t ON t.oid = ix.indrelid
      JOIN pg_class i ON i.oid = ix.indexrelid
      JOIN pg_am am ON am.oid = i.relam
      JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE t.relname = :tableName
        AND n.nspname = 'public'
      ORDER BY i.relname
    `,
      { replacements: { tableName } },
    );

    return results.map((idx) => ({
      name: idx.index_name,
      unique: idx.is_unique,
      primary: idx.is_primary,
      type: idx.index_type,
      definition: idx.index_definition,
      columns: ensureArray(idx.column_names),
    }));
  }

  async getConstraints(tableName) {
    const [results] = await sequelize.query(
      `
      SELECT
        tc.constraint_name,
        tc.constraint_type,
        ARRAY_AGG(kcu.column_name ORDER BY kcu.ordinal_position) AS column_names
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON kcu.constraint_name = tc.constraint_name
        AND kcu.table_schema = tc.table_schema
      WHERE tc.table_name = :tableName
        AND tc.table_schema = 'public'
      GROUP BY tc.constraint_name, tc.constraint_type
      ORDER BY tc.constraint_type, tc.constraint_name
    `,
      { replacements: { tableName } },
    );

    return results.map((c) => ({
      name: c.constraint_name,
      type: c.constraint_type,
      columns: ensureArray(c.column_names),
    }));
  }

  async getForeignKeys(tableName) {
    const [results] = await sequelize.query(
      `
      SELECT
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table,
        ccu.column_name AS foreign_column
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON kcu.constraint_name = tc.constraint_name
        AND kcu.table_schema = tc.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = :tableName
        AND tc.table_schema = 'public'
      ORDER BY tc.constraint_name
    `,
      { replacements: { tableName } },
    );

    return results.map((fk) => ({
      name: fk.constraint_name,
      column: fk.column_name,
      foreignTable: fk.foreign_table,
      foreignColumn: fk.foreign_column,
    }));
  }

  /**
   * Check if a table exists
   */
  async tableExists(tableName) {
    const [results] = await sequelize.query(
      `
      SELECT 1 FROM information_schema.tables
      WHERE table_name = :tableName AND table_schema = 'public'
    `,
      { replacements: { tableName } },
    );
    return results.length > 0;
  }

  /**
   * List all tables in the database
   */
  async listTables() {
    const [results] = await sequelize.query(`
      SELECT table_name,
        pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) AS total_size,
        (SELECT COUNT(*) FROM information_schema.columns c
         WHERE c.table_name = t.table_name AND c.table_schema = 'public') AS column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    return results;
  }

  /**
   * Get database status info
   */
  async getDatabaseStatus() {
    const dbName = sequelize.config.database;
    const [sizeResult] = await sequelize.query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) AS db_size
    `);
    const tables = await this.listTables();

    return {
      database: dbName,
      host: sequelize.config.host,
      port: sequelize.config.port,
      size: sizeResult[0]?.db_size || "unknown",
      tableCount: tables.length,
      tables: tables.map((t) => ({
        name: t.table_name,
        size: t.total_size,
        columnCount: parseInt(t.column_count, 10),
      })),
      connected: true,
      checkedAt: new Date().toISOString(),
    };
  }

  /**
   * Normalize DB introspection result to a format comparable with model schema.
   * Maps PostgreSQL types to Sequelize DataTypes-like strings.
   */
  normalizeDbSchema(dbSchema) {
    const columns = {};
    for (const col of dbSchema.columns) {
      columns[col.name] = {
        type: this.pgTypeToSequelizeType(
          col.udtName,
          col.dataType,
          col.maxLength,
        ),
        allowNull: col.nullable,
        defaultValue: this.parseDefault(col.defaultValue),
        primaryKey: dbSchema.constraints.some(
          (c) => c.type === "PRIMARY KEY" && c.columns.includes(col.name),
        ),
      };
    }

    const indexes = dbSchema.indexes
      .filter((idx) => !idx.primary)
      .map((idx) => ({
        name: idx.name,
        unique: idx.unique,
        using: idx.type,
        fields: idx.columns,
      }));

    return {
      objectName: dbSchema.tableName,
      dbType: "postgresql",
      columns,
      indexes,
    };
  }

  pgTypeToSequelizeType(udtName, dataType, maxLength) {
    const map = {
      uuid: "UUID",
      varchar: maxLength ? `STRING(${maxLength})` : "STRING",
      text: "TEXT",
      int4: "INTEGER",
      int8: "BIGINT",
      float4: "FLOAT",
      float8: "DOUBLE PRECISION",
      numeric: "DECIMAL",
      bool: "BOOLEAN",
      date: "DATEONLY",
      timestamp: "DATE",
      timestamptz: "DATE",
      json: "JSON",
      jsonb: "JSONB",
      geometry: "GEOMETRY",
      geography: "GEOGRAPHY",
      // Array types (PostgreSQL _ prefix convention)
      _text: "ARRAY(TEXT)",
      _int4: "ARRAY(INTEGER)",
      _int8: "ARRAY(BIGINT)",
      _uuid: "ARRAY(UUID)",
      _varchar: "ARRAY(STRING)",
      _bool: "ARRAY(BOOLEAN)",
      _float4: "ARRAY(FLOAT)",
      _float8: "ARRAY(DOUBLE PRECISION)",
      _numeric: "ARRAY(DECIMAL)",
      _json: "ARRAY(JSON)",
      _jsonb: "ARRAY(JSONB)",
    };
    // Fallback: if udtName starts with _ and not in map, treat as array of the base type
    if (udtName?.startsWith("_") && !map[udtName]) {
      const baseType = map[udtName.slice(1)];
      if (baseType) return `ARRAY(${baseType})`;
    }
    return map[udtName] || dataType?.toUpperCase() || "STRING";
  }

  parseDefault(rawDefault) {
    if (rawDefault == null) return undefined;
    if (rawDefault === "true") return true;
    if (rawDefault === "false") return false;
    if (rawDefault.startsWith("'") && rawDefault.includes("'::")) {
      return rawDefault.split("'::")[0].slice(1);
    }
    if (rawDefault.startsWith("NULL")) return null;
    if (/^-?\d+(\.\d+)?$/.test(rawDefault)) return Number(rawDefault);
    return rawDefault;
  }
}

module.exports = new DbSchemaIntrospector();
