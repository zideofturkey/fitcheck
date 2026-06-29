const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class AiCandidateMealQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("aiCandidateMeal", [], Op.and, Op.eq, input, wClause);
  }
}

class AiCandidateMealQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("aiCandidateMeal", []);
  }
}

module.exports = {
  AiCandidateMealQueryCache,
  AiCandidateMealQueryCacheInvalidator,
};
