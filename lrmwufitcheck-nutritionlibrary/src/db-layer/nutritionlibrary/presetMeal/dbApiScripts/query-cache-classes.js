const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class PresetMealQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("presetMeal", [], Op.and, Op.eq, input, wClause);
  }
}

class PresetMealQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("presetMeal", []);
  }
}

module.exports = {
  PresetMealQueryCache,
  PresetMealQueryCacheInvalidator,
};
