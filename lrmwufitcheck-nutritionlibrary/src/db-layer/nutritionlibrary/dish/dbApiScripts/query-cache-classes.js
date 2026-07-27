const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class DishQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("dish", [], Op.and, Op.eq, input, wClause);
  }
}

class DishQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("dish", []);
  }
}

module.exports = {
  DishQueryCache,
  DishQueryCacheInvalidator,
};
