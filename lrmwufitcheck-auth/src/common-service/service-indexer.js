const { ElasticIndexer, hexaLogger } = require("common");

const ServicePublisher = require("./service-publisher");

const MAPPINGS = {};

class ServiceIndexer extends ElasticIndexer {
  constructor(indexName, session, requestId) {
    // Defensive: a colon in the index name is parsed by Elasticsearch as a
    // cross-cluster separator (cluster:index) and triggers
    // "Cross-cluster calls are not supported". Callers occasionally pass
    // declarative-style "service:Object" here — strip the prefix so the
    // index resolves to "<codename>_<object>" as intended.
    let normalizedName = indexName;
    if (typeof normalizedName === "string" && normalizedName.includes(":")) {
      const stripped = normalizedName.slice(normalizedName.indexOf(":") + 1);
      console.warn(
        `ServiceIndexer: index name "${normalizedName}" contains ":" — ` +
          `using "${stripped}" instead. Pass the bare object name, not "service:Object".`,
      );
      normalizedName = stripped;
    }
    const serviceIndexName = "lrmwufitcheck_" + normalizedName.toLowerCase();
    super(serviceIndexName, {
      mapping: MAPPINGS[normalizedName] ?? MAPPINGS[indexName],
    });
    this.session = session;
    this.requestId = requestId;
  }

  static addMapping(indexName, mapping) {
    MAPPINGS[indexName] = mapping;
  }

  async logResult(logType, subject, params, location, data) {
    return hexaLogger.insertLog(logType, 1, subject, params, location, data);
  }

  async publishEvent(eventName, data) {
    const _publisher = new ServicePublisher(
      eventName,
      data,
      this.session,
      this.requestId,
    );
    return _publisher.publish();
  }
}

module.exports = ServiceIndexer;
