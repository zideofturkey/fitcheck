const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { InviteLink } = require("models");
const { Op } = require("sequelize");

const getIdListOfInviteLinkByField = async (fieldName, fieldValue, isArray) => {
  try {
    const options = {
      attributes: ["id"],
    };
    if (fieldName) {
      options.where = isArray
        ? { [fieldName]: { [Op.contains]: [fieldValue] } }
        : { [fieldName]: fieldValue };
    }

    let inviteLinkIdList = await InviteLink.findAll(options);

    if (!inviteLinkIdList) {
      throw new NotFoundError(
        `InviteLink with the specified criteria not found`,
      );
    }

    inviteLinkIdList = inviteLinkIdList.map((item) => item.id);
    return inviteLinkIdList;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingInviteLinkIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfInviteLinkByField;
