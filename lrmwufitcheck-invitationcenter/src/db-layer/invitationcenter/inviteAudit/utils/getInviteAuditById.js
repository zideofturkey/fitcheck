const { HttpServerError } = require("common");

let { InviteAudit } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getInviteAuditById = async (inviteAuditId) => {
  try {
    const inviteAudit = Array.isArray(inviteAuditId)
      ? await InviteAudit.findAll({
          where: {
            id: { [Op.in]: inviteAuditId },
          },
        })
      : await InviteAudit.findByPk(inviteAuditId);

    if (!inviteAudit) {
      return null;
    }
    return Array.isArray(inviteAuditId)
      ? inviteAudit.map((item) => item.getData())
      : inviteAudit.getData();
  } catch (err) {
    console.log(err);
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingInviteAuditById",
      err,
    );
  }
};

module.exports = getInviteAuditById;
