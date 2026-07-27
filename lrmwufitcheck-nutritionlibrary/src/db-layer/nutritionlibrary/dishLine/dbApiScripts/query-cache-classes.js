const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class DishLineQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("dishLine", [], Op.and, Op.eq, input, wClause);
  }
}

class DishLineQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("dishLine", []);
  }
}

module.exports = {
  DishLineQueryCache,
  DishLineQueryCacheInvalidator,
};
