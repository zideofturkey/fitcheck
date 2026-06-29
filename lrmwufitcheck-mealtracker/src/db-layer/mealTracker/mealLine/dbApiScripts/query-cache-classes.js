const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class MealLineQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("mealLine", [], Op.and, Op.eq, input, wClause);
  }
}

class MealLineQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("mealLine", []);
  }
}

module.exports = {
  MealLineQueryCache,
  MealLineQueryCacheInvalidator,
};
