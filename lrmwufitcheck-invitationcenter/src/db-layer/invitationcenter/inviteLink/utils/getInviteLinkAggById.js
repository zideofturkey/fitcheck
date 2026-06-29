const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const { InviteLink, InviteAudit } = require("models");
const { Op } = require("sequelize");

const getInviteLinkAggById = async (inviteLinkId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const inviteLink = Array.isArray(inviteLinkId)
      ? await InviteLink.findAll({
          where: {
            id: { [Op.in]: inviteLinkId },
          },
          include: includes,
        })
      : await InviteLink.findByPk(inviteLinkId, { include: includes });

    if (!inviteLink) {
      return null;
    }

    const inviteLinkData =
      Array.isArray(inviteLinkId) && inviteLinkId.length > 0
        ? inviteLink.map((item) => item.getData())
        : inviteLink.getData();
    await InviteLink.getCqrsJoins(inviteLinkData);
    return inviteLinkData;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingInviteLinkAggById",
      err,
    );
  }
};

module.exports = getInviteLinkAggById;
