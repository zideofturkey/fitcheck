const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class InviteLinkQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("inviteLink", [], Op.and, Op.eq, input, wClause);
  }
}

class InviteLinkQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("inviteLink", []);
  }
}

module.exports = {
  InviteLinkQueryCache,
  InviteLinkQueryCacheInvalidator,
};
