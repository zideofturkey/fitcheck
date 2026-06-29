const { HttpServerError, BadRequestError } = require("common");

const { InviteAudit } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getInviteAuditByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getInviteAuditByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const whereClause = query;

    const inviteAudit = await InviteAudit.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!inviteAudit) return null;
    return inviteAudit.getData();
  } catch (err) {
    console.log("errMsg_dbErrorWhenRequestingInviteAuditByQuery", err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingInviteAuditByQuery",
      err,
    );
  }
};

module.exports = getInviteAuditByQuery;
