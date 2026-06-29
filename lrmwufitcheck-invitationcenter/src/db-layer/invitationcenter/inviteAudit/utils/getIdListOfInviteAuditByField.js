const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { InviteAudit } = require("models");
const { Op } = require("sequelize");

const getIdListOfInviteAuditByField = async (
  fieldName,
  fieldValue,
  isArray,
) => {
  try {
    const options = {
      attributes: ["id"],
    };
    if (fieldName) {
      options.where = isArray
        ? { [fieldName]: { [Op.contains]: [fieldValue] } }
        : { [fieldName]: fieldValue };
    }

    let inviteAuditIdList = await InviteAudit.findAll(options);

    if (!inviteAuditIdList) {
      throw new NotFoundError(
        `InviteAudit with the specified criteria not found`,
      );
    }

    inviteAuditIdList = inviteAuditIdList.map((item) => item.id);
    return inviteAuditIdList;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingInviteAuditIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfInviteAuditByField;
