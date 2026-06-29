const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class Sys_toolCatalogQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("sys_toolCatalog", [], Op.and, Op.eq, input, wClause);
  }
}

class Sys_toolCatalogQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("sys_toolCatalog", []);
  }
}

module.exports = {
  Sys_toolCatalogQueryCache,
  Sys_toolCatalogQueryCacheInvalidator,
};
