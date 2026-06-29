const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class MacroTargetQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("macroTarget", [], Op.and, Op.eq, input, wClause);
  }
}

class MacroTargetQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("macroTarget", []);
  }
}

module.exports = {
  MacroTargetQueryCache,
  MacroTargetQueryCacheInvalidator,
};
