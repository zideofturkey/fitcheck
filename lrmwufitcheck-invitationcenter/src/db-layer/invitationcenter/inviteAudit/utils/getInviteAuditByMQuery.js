const {
  HttpServerError,
  BadRequestError,
  convertUserQueryToSequelizeQuery,
} = require("common");

const { InviteAudit } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Retrieves a single InviteAudit matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @returns {Promise<Object|null>} Matching record or null
 */
const getInviteAuditByMQuery = async (mQuery) => {
  try {
    if (!mQuery || typeof mQuery !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const query = convertUserQueryToSequelizeQuery(mQuery);

    const whereClause = query;

    const inviteAudit = await InviteAudit.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!inviteAudit) return null;
    return inviteAudit.getData();
  } catch (err) {
    console.log("errMsg_dbErrorWhenRequestingInviteAuditByMQuery", err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingInviteAuditByMQuery",
      err,
    );
  }
};

module.exports = getInviteAuditByMQuery;
