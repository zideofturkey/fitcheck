const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class Sys_agentOverrideQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("sys_agentOverride", [], Op.and, Op.eq, input, wClause);
  }
}

class Sys_agentOverrideQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("sys_agentOverride", []);
  }
}

module.exports = {
  Sys_agentOverrideQueryCache,
  Sys_agentOverrideQueryCacheInvalidator,
};
