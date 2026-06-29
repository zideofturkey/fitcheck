const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { MacroTarget } = require("models");
const { Op } = require("sequelize");

const getIdListOfMacroTargetByField = async (
  fieldName,
  fieldValue,
  isArray,
) => {
  try {
    const options = {
      where: { isActive: true },
      attributes: ["id"],
    };
    if (fieldName) {
      options.where = isArray
        ? { [fieldName]: { [Op.contains]: [fieldValue] }, isActive: true }
        : { [fieldName]: fieldValue, isActive: true };
    }

    let macroTargetIdList = await MacroTarget.findAll(options);

    if (!macroTargetIdList) {
      throw new NotFoundError(
        `MacroTarget with the specified criteria not found`,
      );
    }

    macroTargetIdList = macroTargetIdList.map((item) => item.id);
    return macroTargetIdList;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingMacroTargetIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfMacroTargetByField;
