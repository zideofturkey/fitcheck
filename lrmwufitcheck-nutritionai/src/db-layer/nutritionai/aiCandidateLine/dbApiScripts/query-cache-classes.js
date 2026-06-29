const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class AiCandidateLineQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("aiCandidateLine", [], Op.and, Op.eq, input, wClause);
  }
}

class AiCandidateLineQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("aiCandidateLine", []);
  }
}

module.exports = {
  AiCandidateLineQueryCache,
  AiCandidateLineQueryCacheInvalidator,
};
