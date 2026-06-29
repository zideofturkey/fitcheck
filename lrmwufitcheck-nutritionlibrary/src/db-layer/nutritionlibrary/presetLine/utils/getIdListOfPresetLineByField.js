const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { PresetLine } = require("models");
const { Op } = require("sequelize");

const getIdListOfPresetLineByField = async (fieldName, fieldValue, isArray) => {
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

    let presetLineIdList = await PresetLine.findAll(options);

    if (!presetLineIdList) {
      throw new NotFoundError(
        `PresetLine with the specified criteria not found`,
      );
    }

    presetLineIdList = presetLineIdList.map((item) => item.id);
    return presetLineIdList;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingPresetLineIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfPresetLineByField;
