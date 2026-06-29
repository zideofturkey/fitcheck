const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class Sys_agentConversationQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("sys_agentConversation", [], Op.and, Op.eq, input, wClause);
  }
}

class Sys_agentConversationQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("sys_agentConversation", []);
  }
}

module.exports = {
  Sys_agentConversationQueryCache,
  Sys_agentConversationQueryCacheInvalidator,
};
