const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class PresetLineQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("presetLine", [], Op.and, Op.eq, input, wClause);
  }
}

class PresetLineQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("presetLine", []);
  }
}

module.exports = {
  PresetLineQueryCache,
  PresetLineQueryCacheInvalidator,
};
