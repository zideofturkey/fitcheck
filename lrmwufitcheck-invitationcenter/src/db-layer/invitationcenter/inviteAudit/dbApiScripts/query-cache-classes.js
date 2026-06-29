const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class InviteAuditQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("inviteAudit", [], Op.and, Op.eq, input, wClause);
  }
}

class InviteAuditQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("inviteAudit", []);
  }
}

module.exports = {
  InviteAuditQueryCache,
  InviteAuditQueryCacheInvalidator,
};
