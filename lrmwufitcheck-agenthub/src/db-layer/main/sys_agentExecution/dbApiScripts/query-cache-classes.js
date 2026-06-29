const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class Sys_agentExecutionQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("sys_agentExecution", [], Op.and, Op.eq, input, wClause);
  }
}

class Sys_agentExecutionQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("sys_agentExecution", []);
  }
}

module.exports = {
  Sys_agentExecutionQueryCache,
  Sys_agentExecutionQueryCacheInvalidator,
};
