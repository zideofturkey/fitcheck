const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class NutritionDayQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("nutritionDay", [], Op.and, Op.eq, input, wClause);
  }
}

class NutritionDayQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("nutritionDay", []);
  }
}

module.exports = {
  NutritionDayQueryCache,
  NutritionDayQueryCacheInvalidator,
};
