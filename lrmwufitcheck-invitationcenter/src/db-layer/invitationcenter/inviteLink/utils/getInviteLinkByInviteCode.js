const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { hexaLogger } = require("common");
const { InviteLink } = require("models");
const { Op } = require("sequelize");

const getInviteLinkByInviteCode = async (inviteCode) => {
  try {
    const inviteLink = await InviteLink.findOne({
      where: { inviteCode: inviteCode },
    });

    if (!inviteLink) {
      return null;
    }
    return inviteLink.getData();
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingInviteLinkByInviteCode",
      err,
    );
  }
};

module.exports = getInviteLinkByInviteCode;
