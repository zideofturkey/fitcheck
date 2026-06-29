const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class MealLogQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("mealLog", [], Op.and, Op.eq, input, wClause);
  }
}

class MealLogQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("mealLog", []);
  }
}

module.exports = {
  MealLogQueryCache,
  MealLogQueryCacheInvalidator,
};
