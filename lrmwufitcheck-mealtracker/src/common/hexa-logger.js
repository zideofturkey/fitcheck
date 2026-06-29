const { elasticClient, isElasticAvailable } = require("./elastic");
const { v4 } = require("uuid");

const loggerType = "ELASTIC";

const createHexCode = () => {
  const code = v4();
  return code.replace(/-/g, "");
};

const HexaLogTypes = {
  logTypeInfo: 0,
  logTypeWarning: 1,
  logTypeError: 2,
};

const HexaLogTypeNames = ["INFO", "WARNING", "ERROR"];

const msInDay = 24 * 60 * 60 * 1000;

// Console logs have a shorter retention period (2 days)
const CONSOLE_LOG_RETENTION_DAYS = 2;

const elasticMappings = {
  properties: {
    date: { type: "date" },
    logSource: { type: "keyword" },
    logType: { type: "integer" },
    logTypeName: { type: "keyword" },
    logLevel: { type: "integer" },
    requestId: { type: "keyword" },
    location: { type: "keyword" },
    subject: { type: "keyword" },
    params: { type: "object", enabled: false },
    data: { type: "object", enabled: false },
  },
};

class HexaLog {
  constructor(
    logType,
    logLevel,
    logSource,
    subject,
    params,
    location,
    data,
    requestId,
  ) {
    this.date = new Date();
    this.logType = logType;
    this.logLevel = logLevel;
    this.logSource = logSource;
    this.subject = subject;
    this.location = location;
    this.params = params;
    this.data = data;
    this.requestId = requestId;
    this.id = createHexCode();
  }

  logLevelX() {
    if (this.logLevel < 10) return "0" + this.logLevel.toString();
    return this.logLevel.toString();
  }

  logTypeName() {
    return HexaLogTypeNames[this.logType];
  }

  logTypeNameX() {
    return HexaLogTypeNames[this.logType];
  }

  getLogHeader() {
    return `${this.logTypeNameX()}:${this.logLevelX()}`;
  }

  toObject() {
    return {
      date: this.date,
      requestId: this.requestId,
      logType: this.logType,
      logTypeName: this.logTypeName(),
      logLevel: this.logLevel,
      logSource: this.logSource,
      subject: this.subject,
      location: this.location,
      params: this.params,
      data: this.data,
    };
  }

  toJSON() {
    return JSON.stringify(this.toObject());
  }
}

class HexaLogger {
  constructor() {
    this.projectName = process.env.PROJECT_CODENAME ?? "hexalogger";
    this.logSource = process.env.SERVICE_NAME ?? "hexalogger";
    this.writeDetail = true;
    this.logPeriod = 30;
  }

  async _emit(newLog, waitForWrite) {
    if (waitForWrite) {
      await this.writeLog(newLog);
    } else {
      // Fire-and-forget; never retain the log in memory after dispatch.
      this.writeLog(newLog).catch(() => {});
    }
  }

  async insertLog(
    logType,
    logLevel,
    subject,
    params,
    location,
    data,
    requestId,
    waitForWrite,
  ) {
    const newLog = new HexaLog(
      logType,
      logLevel,
      this.logSource,
      subject,
      params,
      location,
      data,
      requestId,
    );
    await this._emit(newLog, waitForWrite);
  }

  async insertError(subject, params, location, data, requestId, waitForWrite) {
    if (data instanceof Error) {
      data = {
        message: data.message,
        stack: data.stack,
        name: data.name,
        cause: data.cause,
      };
    }

    const newLog = new HexaLog(
      HexaLogTypes.logTypeError,
      1,
      this.logSource,
      subject,
      params,
      location,
      data,
      requestId,
    );
    await this._emit(newLog, waitForWrite);
  }

  async insertWarning(
    subject,
    params,
    location,
    data,
    requestId,
    waitForWrite,
  ) {
    const newLog = new HexaLog(
      HexaLogTypes.logTypeWarning,
      1,
      this.logSource,
      subject,
      params,
      location,
      data,
      requestId,
    );
    await this._emit(newLog, waitForWrite);
  }

  async insertInfo(subject, params, location, data, requestId, waitForWrite) {
    const newLog = new HexaLog(
      HexaLogTypes.logTypeInfo,
      1,
      this.logSource,
      subject,
      params,
      location,
      data,
      requestId,
    );
    await this._emit(newLog, waitForWrite);
  }

  async writeLog(hexaLog) {
    console.log(
      `${hexaLog.date.toISOString()}:${
        this.projectName
      }.${hexaLog.getLogHeader()}>>${hexaLog.logSource}:${hexaLog.subject}`,
    );
    if (this.writeDetail) console.log(hexaLog.data);
    return true;
  }

  async clearLogStore() {}
  async clearAgedLogs() {}
}

class ElasticSearchLogger extends HexaLogger {
  _isReady() {
    return elasticClient && isElasticAvailable();
  }

  async updateLoggerMappings() {
    if (!this._isReady()) return;
    const indexName = this.projectName + "_logs";

    // check if index exists
    const indexExists = await elasticClient.indices.exists({
      index: indexName,
    });
    if (!indexExists) {
      // create index with mappings
      await elasticClient.indices.create({
        index: indexName,
        body: {
          mappings: elasticMappings,
        },
      });
    }

    await elasticClient.indices.putMapping({
      index: indexName,
      properties: elasticMappings.properties,
    });
  }

  async writeLog(hexaLog) {
    const indexName = this.projectName + "_logs";

    // Also write to console for real-time console log streaming
    // This enables logs to appear in both ES log viewer and console stream
    // Set DISABLE_CONSOLE_LOG_MIRROR=true to disable this
    if (process.env.DISABLE_CONSOLE_LOG_MIRROR !== "true") {
      const logTypeLabels = ["INFO", "WARN", "ERROR", "DEBUG"];
      const logLabel = logTypeLabels[hexaLog.logType] || "LOG";
      console.log(
        `[${logLabel}] ${hexaLog.logSource}:${hexaLog.subject} @ ${hexaLog.location}`,
      );
    }

    if (!this._isReady()) return true;

    try {
      await this.updateLoggerMappings();
    } catch (err) {
      console.log("Error updating logger mappings:", err.message);
      return false;
    }

    try {
      let result = await elasticClient.index({
        index: indexName,
        id: hexaLog.id,
        body: hexaLog.toObject(),
      });
      return (
        result &&
        result._id &&
        (result.result == "created" || result.result == "updated")
      );
    } catch (err) {
      //console.log('Can not write log ->', hexaLog.subject ,  hexaLog.location, err.toString());
      return false;
    }
  }

  async clearLogStore() {
    if (!this._isReady()) return 0;
    const indexName = this.projectName + "_logs";
    try {
      const result = await elasticClient.deleteByQuery({
        index: indexName,
        query: {
          match_all: {},
        },
      });
      return result && result.deleted ? result.deleted : 0;
    } catch (err) {
      console.log(err);
      return 0;
    }
  }

  async clearAgedLogs() {
    if (!this._isReady()) return 0;
    try {
      const dateLimit = new Date(Date.now() - this.logPeriod * msInDay);
      const indexName = this.projectName + "_logs";
      const result = await elasticClient.deleteByQuery({
        index: indexName,
        query: {
          range: { date: { lte: dateLimit } },
        },
      });
      return result && result.deleted ? result.deleted : 0;
    } catch (err) {
      console.log(err);
      return 0;
    }
  }

  /**
   * Ensure console log index exists with mappings
   */
  async ensureConsoleLogIndex() {
    if (!this._isReady()) return;
    const indexName = this.projectName + "_console_log";

    try {
      const indexExists = await elasticClient.indices.exists({
        index: indexName,
      });

      if (!indexExists) {
        await elasticClient.indices.create({
          index: indexName,
          body: {
            mappings: elasticMappings,
          },
        });
      }
    } catch (err) {
      // Index might already exist, ignore
    }
  }

  /**
   * Write a console log entry to the dedicated console_log index
   * This is separate from regular logs for better performance and management
   */
  async writeConsoleLog(hexaLog) {
    if (!this._isReady()) return false;
    const indexName = this.projectName + "_console_log";

    try {
      await this.ensureConsoleLogIndex();
    } catch (err) {
      // Continue even if index creation fails
    }

    try {
      let result = await elasticClient.index({
        index: indexName,
        id: hexaLog.id,
        body: hexaLog.toObject(),
      });
      return (
        result &&
        result._id &&
        (result.result == "created" || result.result == "updated")
      );
    } catch (err) {
      // Silently fail for console logs
      return false;
    }
  }

  /**
   * Insert a console log entry
   * Similar to insertLog but writes to dedicated console_log index
   */
  async insertConsoleLog(
    logType,
    logLevel,
    subject,
    params,
    location,
    data,
    requestId,
    waitForWrite,
  ) {
    const newLog = new HexaLog(
      logType,
      logLevel,
      this.logSource,
      subject,
      params,
      location,
      data,
      requestId,
    );

    // Write to console_log index (don't add to logs array)
    if (waitForWrite) {
      return await this.writeConsoleLog(newLog);
    } else {
      // Fire and forget
      this.writeConsoleLog(newLog).catch(() => {});
      return true;
    }
  }

  /**
   * Clear console output logs older than 2 days
   * Console logs have a shorter retention period than regular logs
   */
  async clearAgedConsoleLogs() {
    if (!this._isReady()) return 0;
    try {
      const dateLimit = new Date(
        Date.now() - CONSOLE_LOG_RETENTION_DAYS * msInDay,
      );
      const indexName = this.projectName + "_console_log";
      const result = await elasticClient.deleteByQuery({
        index: indexName,
        refresh: false, // Don't wait for refresh for better performance
        query: {
          range: { date: { lte: dateLimit } },
        },
      });
      return result && result.deleted ? result.deleted : 0;
    } catch (err) {
      // Silently fail - this is a cleanup operation
      return 0;
    }
  }

  async getLastLogs(logCount, allServices, onlyErrors) {
    if (!this._isReady()) return [];
    try {
      const indexName = this.projectName + "_logs";

      let result = null;

      let query = null;

      if (allServices && !onlyErrors) {
        query = { match_all: { boost: 1.2 } };
      } else if (!allServices && onlyErrors) {
        query = {
          bool: {
            must: [
              { term: { logSource: process.env.SERVICE_NAME } },
              { term: { logType: 2 } },
            ],
          },
        };
      } else if (!allServices) {
        query = { term: { logSource: process.env.SERVICE_NAME } };
      } else if (onlyErrors) {
        query = { term: { logType: 2 } };
      }

      const document = await elasticClient.search(
        {
          index: indexName,
          from: 0,
          size: logCount,
          query: query,
          sort: [{ date: { order: "desc" } }],
        },
        { signal: new AbortController().signal },
      );

      if (document && document.hits && document.hits.hits) {
        result = document.hits.hits.map((source) => {
          const log = source._source;
          return log;
        });
      }

      return result ?? [];
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  // class end
}

let hexaLogger = null;
const createHexaLogger = () => {
  if (hexaLogger) return hexaLogger;
  if (loggerType == "ELASTIC") {
    hexaLogger = new ElasticSearchLogger();
  } else {
    hexaLogger = new HexaLogger();
  }
  return hexaLogger;
};

module.exports = {
  hexaLogger: createHexaLogger(),
  HexaLogTypes,
};
