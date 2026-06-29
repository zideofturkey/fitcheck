const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class AiGuidanceNoteQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("aiGuidanceNote", [], Op.and, Op.eq, input, wClause);
  }
}

class AiGuidanceNoteQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("aiGuidanceNote", []);
  }
}

module.exports = {
  AiGuidanceNoteQueryCache,
  AiGuidanceNoteQueryCacheInvalidator,
};
