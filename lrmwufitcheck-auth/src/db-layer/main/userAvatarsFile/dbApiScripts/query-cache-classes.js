const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class UserAvatarsFileQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("userAvatarsFile", [], Op.and, Op.eq, input, wClause);
  }
}

class UserAvatarsFileQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("userAvatarsFile", []);
  }
}

module.exports = {
  UserAvatarsFileQueryCache,
  UserAvatarsFileQueryCacheInvalidator,
};
