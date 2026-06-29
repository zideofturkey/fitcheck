const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class AiSessionQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("aiSession", [], Op.and, Op.eq, input, wClause);
  }
}

class AiSessionQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("aiSession", []);
  }
}

module.exports = {
  AiSessionQueryCache,
  AiSessionQueryCacheInvalidator,
};
