const { HttpServerError, BadRequestError } = require("common");

const { InviteLink } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getInviteLinkByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getInviteLinkByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const whereClause = query;

    const inviteLink = await InviteLink.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!inviteLink) return null;
    return inviteLink.getData();
  } catch (err) {
    console.log("errMsg_dbErrorWhenRequestingInviteLinkByQuery", err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingInviteLinkByQuery",
      err,
    );
  }
};

module.exports = getInviteLinkByQuery;
