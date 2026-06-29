const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const { InviteLink, InviteAudit } = require("models");
const { Op } = require("sequelize");

const getInviteAuditAggById = async (inviteAuditId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const inviteAudit = Array.isArray(inviteAuditId)
      ? await InviteAudit.findAll({
          where: {
            id: { [Op.in]: inviteAuditId },
          },
          include: includes,
        })
      : await InviteAudit.findByPk(inviteAuditId, { include: includes });

    if (!inviteAudit) {
      return null;
    }

    const inviteAuditData =
      Array.isArray(inviteAuditId) && inviteAuditId.length > 0
        ? inviteAudit.map((item) => item.getData())
        : inviteAudit.getData();
    await InviteAudit.getCqrsJoins(inviteAuditData);
    return inviteAuditData;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingInviteAuditAggById",
      err,
    );
  }
};

module.exports = getInviteAuditAggById;
