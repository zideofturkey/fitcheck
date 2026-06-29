class DbSchemaDiffer {
  /**
   * Compare model schema (from schema-def) with actual DB schema (from introspector).
   * Both inputs should be normalized to { columns: {name: {type, allowNull, ...}}, indexes: [...] } format.
   */
  diff(modelSchema, dbSchema) {
    const modelCols = modelSchema.columns || {};
    const dbCols = dbSchema.columns || {};

    const modelColNames = new Set(Object.keys(modelCols));
    const dbColNames = new Set(Object.keys(dbCols));

    const result = {
      inSync: true,
      addedColumns: [],
      removedColumns: [],
      modifiedColumns: [],
      indexDifferences: [],
      summary: { totalDifferences: 0 },
    };

    for (const name of modelColNames) {
      if (!dbColNames.has(name)) {
        result.addedColumns.push({
          name,
          severity: "warning",
          message: `Column "${name}" exists in model but not in database`,
          modelDefinition: modelCols[name],
        });
      }
    }

    for (const name of dbColNames) {
      if (!modelColNames.has(name)) {
        if (name === "createdAt" || name === "updatedAt") continue;
        result.removedColumns.push({
          name,
          severity: "info",
          message: `Column "${name}" exists in database but not in model`,
          dbDefinition: dbCols[name],
        });
      }
    }

    for (const name of modelColNames) {
      if (!dbColNames.has(name)) continue;
      const modelCol = modelCols[name];
      const dbCol = dbCols[name];
      const changes = this.compareColumn(name, modelCol, dbCol);
      if (changes.length > 0) {
        result.modifiedColumns.push({
          name,
          changes,
          modelDefinition: modelCol,
          dbDefinition: dbCol,
        });
      }
    }

    result.indexDifferences = this.compareIndexes(
      modelSchema.indexes || [],
      dbSchema.indexes || [],
    );

    result.summary.totalDifferences =
      result.addedColumns.length +
      result.removedColumns.length +
      result.modifiedColumns.length +
      result.indexDifferences.length;

    result.inSync = result.summary.totalDifferences === 0;

    return result;
  }

  compareColumn(name, modelCol, dbCol) {
    const changes = [];

    const modelType = this.normalizeType(modelCol.type);
    const dbType = this.normalizeType(dbCol.type);
    if (modelType !== dbType) {
      changes.push({
        field: "type",
        modelValue: modelCol.type,
        dbValue: dbCol.type,
        normalizedModel: modelType,
        normalizedDb: dbType,
        severity: this.typeSeverity(modelType, dbType),
        message: `Type mismatch: model="${modelCol.type}" db="${dbCol.type}"`,
      });
    }

    const modelNullable = modelCol.primaryKey
      ? false
      : modelCol.allowNull !== false;
    const dbNullable = dbCol.primaryKey ? false : dbCol.allowNull !== false;
    if (modelNullable !== dbNullable) {
      changes.push({
        field: "nullable",
        modelValue: modelNullable,
        dbValue: dbNullable,
        severity: !modelNullable && dbNullable ? "warning" : "info",
        message: modelNullable
          ? `Model allows NULL but DB has NOT NULL`
          : `Model requires NOT NULL but DB allows NULL`,
      });
    }

    return changes;
  }

  _toArray(val) {
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

  compareIndexes(modelIndexes, dbIndexes) {
    const differences = [];

    const modelIndexMap = new Map();
    for (const idx of modelIndexes) {
      const key = this._toArray(idx.fields).sort().join(",");
      modelIndexMap.set(key, idx);
    }

    const dbIndexMap = new Map();
    for (const idx of dbIndexes) {
      const key = this._toArray(idx.fields || idx.columns)
        .sort()
        .join(",");
      dbIndexMap.set(key, idx);
    }

    for (const [key, modelIdx] of modelIndexMap) {
      if (!dbIndexMap.has(key)) {
        const fields = this._toArray(modelIdx.fields);
        differences.push({
          type: "missing_in_db",
          severity: "warning",
          fields,
          unique: modelIdx.unique,
          message: `Index on [${fields.join(", ")}] exists in model but not in database`,
        });
      }
    }

    for (const [key, dbIdx] of dbIndexMap) {
      if (!modelIndexMap.has(key)) {
        const fields = this._toArray(dbIdx.fields || dbIdx.columns);
        differences.push({
          type: "extra_in_db",
          severity: "info",
          fields,
          name: dbIdx.name,
          message: `Index "${dbIdx.name}" exists in database but not in model`,
        });
      }
    }

    return differences;
  }

  normalizeType(type) {
    if (!type) return "STRING";
    const str = String(type).toUpperCase().trim();

    // Scalar type normalization map (reused for array element types)
    const scalarMap = {
      UUID: "UUID",
      STRING: "STRING",
      VARCHAR: "STRING",
      "CHARACTER VARYING": "STRING",
      TEXT: "TEXT",
      INTEGER: "INTEGER",
      INT: "INTEGER",
      INT4: "INTEGER",
      BIGINT: "BIGINT",
      INT8: "BIGINT",
      FLOAT: "FLOAT",
      FLOAT4: "FLOAT",
      REAL: "FLOAT",
      DOUBLE: "DOUBLE",
      FLOAT8: "DOUBLE",
      "DOUBLE PRECISION": "DOUBLE",
      DECIMAL: "DECIMAL",
      NUMERIC: "DECIMAL",
      BOOLEAN: "BOOLEAN",
      BOOL: "BOOLEAN",
      DATE: "DATE",
      DATEONLY: "DATE",
      TIMESTAMP: "TIMESTAMP",
      TIMESTAMPTZ: "TIMESTAMP",
      "TIMESTAMP WITH TIME ZONE": "TIMESTAMP",
      "TIMESTAMP WITHOUT TIME ZONE": "TIMESTAMP",
      JSON: "JSON",
      JSONB: "JSONB",
      BLOB: "BYTEA",
      BYTEA: "BYTEA",
      GEOMETRY: "GEOMETRY",
      GEOGRAPHY: "GEOGRAPHY",
      "USER-DEFINED": "USER-DEFINED",
    };

    // Handle array types first: ARRAY(X) syntax
    if (str.startsWith("ARRAY(")) {
      const inner = (str.match(/^ARRAY\((.+)\)$/)?.[1] || "").trim();
      const normalizedInner = scalarMap[inner] || inner;
      return `ARRAY_${normalizedInner}`;
    }
    // Handle array types: X[] syntax (e.g. VARCHAR(255)[], TEXT[], INTEGER[])
    if (str.endsWith("[]")) {
      const base = str
        .slice(0, -2)
        .replace(/\(.+\)/, "")
        .trim();
      const normalizedInner = scalarMap[base] || base;
      return `ARRAY_${normalizedInner}`;
    }

    const upper = str.replace(/\(.+\)/, "").trim();
    return scalarMap[upper] || upper;
  }

  typeSeverity(modelType, dbType) {
    // Array types: same element type is always compatible
    if (modelType.startsWith("ARRAY_") && modelType === dbType) return "info";
    // Array element type widening (e.g. ARRAY_STRING vs ARRAY_TEXT) is compatible
    if (modelType.startsWith("ARRAY_") && dbType.startsWith("ARRAY_")) {
      const mInner = modelType.slice(6);
      const dInner = dbType.slice(6);
      const scalarCompat = {
        STRING: ["TEXT", "STRING"],
        TEXT: ["STRING", "TEXT"],
        INTEGER: ["BIGINT", "INTEGER"],
        BIGINT: ["INTEGER", "BIGINT"],
        FLOAT: ["DOUBLE", "FLOAT", "DECIMAL"],
        DOUBLE: ["FLOAT", "DOUBLE", "DECIMAL"],
      };
      if (scalarCompat[mInner]?.includes(dInner)) return "info";
      return "error";
    }
    const compatible = {
      STRING: ["TEXT", "STRING"],
      TEXT: ["STRING", "TEXT"],
      INTEGER: ["BIGINT", "INTEGER"],
      FLOAT: ["DOUBLE", "FLOAT", "DECIMAL"],
      DOUBLE: ["FLOAT", "DOUBLE", "DECIMAL"],
      DATE: ["TIMESTAMP", "DATE"],
      TIMESTAMP: ["DATE", "TIMESTAMP"],
      JSON: ["JSONB", "JSON"],
      JSONB: ["JSON", "JSONB"],
      GEOMETRY: ["GEOGRAPHY", "USER-DEFINED"],
      GEOGRAPHY: ["GEOMETRY", "USER-DEFINED"],
    };
    if (compatible[modelType]?.includes(dbType)) return "info";
    return "error";
  }
}

module.exports = new DbSchemaDiffer();
