const {
  HttpServerError,
  BadRequestError,
  convertUserQueryToSequelizeQuery,
} = require("common");

const { InviteLink } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Retrieves a single InviteLink matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @returns {Promise<Object|null>} Matching record or null
 */
const getInviteLinkByMQuery = async (mQuery) => {
  try {
    if (!mQuery || typeof mQuery !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const query = convertUserQueryToSequelizeQuery(mQuery);

    const whereClause = query;

    const inviteLink = await InviteLink.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!inviteLink) return null;
    return inviteLink.getData();
  } catch (err) {
    console.log("errMsg_dbErrorWhenRequestingInviteLinkByMQuery", err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingInviteLinkByMQuery",
      err,
    );
  }
};

module.exports = getInviteLinkByMQuery;
