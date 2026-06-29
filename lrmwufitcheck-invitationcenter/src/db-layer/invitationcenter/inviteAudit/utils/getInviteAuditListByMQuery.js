const { HttpServerError, BadRequestError, convertUserQueryToSequelizeQuery } =
  require("common");

const { InviteAudit } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Retrieves multiple InviteAudit records matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @returns {Promise<Array<Object>>} Array of matching records
 */
const getInviteAuditListByMQuery = async (mQuery) => {
  try {
    if (!mQuery || typeof mQuery !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const query = convertUserQueryToSequelizeQuery(mQuery);

    const inviteAudit = await InviteAudit.findAll({
      where: query,
    });

    if (!inviteAudit || inviteAudit.length === 0) return [];

    return inviteAudit.map((item) => item.getData());
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingInviteAuditListByMQuery",
      err,
    );
  }
};

module.exports = getInviteAuditListByMQuery;
