const { HttpServerError, BadRequestError } = require("common");

const { InviteAudit } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getInviteAuditListByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getInviteAuditListByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const inviteAudit = await InviteAudit.findAll({
      where: query,
    });

    //should i add not found error or only return empty array?
    if (!inviteAudit || inviteAudit.length === 0) return [];

    return inviteAudit.map((item) => item.getData());
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingInviteAuditListByQuery",
      err,
    );
  }
};

module.exports = getInviteAuditListByQuery;
