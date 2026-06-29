const { HttpServerError, BadRequestError } = require("common");

const { InviteLink } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getInviteLinkListByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getInviteLinkListByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const inviteLink = await InviteLink.findAll({
      where: query,
    });

    //should i add not found error or only return empty array?
    if (!inviteLink || inviteLink.length === 0) return [];

    return inviteLink.map((item) => item.getData());
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingInviteLinkListByQuery",
      err,
    );
  }
};

module.exports = getInviteLinkListByQuery;
