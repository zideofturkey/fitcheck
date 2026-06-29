const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class FoodItemQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("foodItem", [], Op.and, Op.eq, input, wClause);
  }
}

class FoodItemQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("foodItem", []);
  }
}

module.exports = {
  FoodItemQueryCache,
  FoodItemQueryCacheInvalidator,
};
