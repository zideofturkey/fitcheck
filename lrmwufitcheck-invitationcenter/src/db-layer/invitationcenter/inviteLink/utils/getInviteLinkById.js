const { HttpServerError } = require("common");

let { InviteLink } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getInviteLinkById = async (inviteLinkId) => {
  try {
    const inviteLink = Array.isArray(inviteLinkId)
      ? await InviteLink.findAll({
          where: {
            id: { [Op.in]: inviteLinkId },
          },
        })
      : await InviteLink.findByPk(inviteLinkId);

    if (!inviteLink) {
      return null;
    }
    return Array.isArray(inviteLinkId)
      ? inviteLink.map((item) => item.getData())
      : inviteLink.getData();
  } catch (err) {
    console.log(err);
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingInviteLinkById",
      err,
    );
  }
};

module.exports = getInviteLinkById;
