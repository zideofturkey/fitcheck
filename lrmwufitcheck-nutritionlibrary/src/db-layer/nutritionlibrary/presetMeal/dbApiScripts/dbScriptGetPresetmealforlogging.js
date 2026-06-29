// This script is written as api-specific
// This script is called from the GetPresetMealForLoggingManager

const { PresetMeal } = require("models");
const { HttpServerError, HttpError } = require("common");

const { Op } = require("sequelize");

function normalizeSequalizeOps(seqObj) {
  if (typeof seqObj !== "object") return seqObj;
  if (!seqObj) return null;
  const keys = Object.keys(seqObj);
  const symbolKeys = Object.getOwnPropertySymbols(seqObj);
  const newObj = {};
  for (const key of keys) {
    seqObj[key] = normalizeSequalizeOps(seqObj[key]);
  }

  for (const key of symbolKeys) {
    let index = 0;
    let newKey = "";
    if (key == Op.eq) newKey = "$op.eq";
    if (key == Op.in) newKey = "$op.in";
    if (key == Op.and) newKey = "$op.and";
    if (key == Op.or) newKey = "$op.or";
    if (key == Op.notIn) newKey = "$op.notIn";
    if (key == Op.not) newKey = "$op.not";
    if (key == Op.ne) newKey = "$op.ne";
    if (newKey) {
      seqObj[newKey] = seqObj[key];
      delete seqObj[key];
    } else {
      newKey = key;
    }
    if (Array.isArray(seqObj[newKey])) {
      seqObj[newKey] = seqObj[newKey].map((item) =>
        normalizeSequalizeOps(item),
      );
    } else {
      seqObj[newKey] = normalizeSequalizeOps(seqObj[newKey]);
    }
  }
  return seqObj;
}

const dbScriptGetPresetmealforlogging = async (apiManager) => {
  const rawWhereClause = apiManager.whereClause;

  // Default soft-delete filter only when the caller did not explicitly set isActive
  const whereClause =
    rawWhereClause &&
    Object.prototype.hasOwnProperty.call(rawWhereClause, "isActive")
      ? rawWhereClause
      : { [Op.and]: [rawWhereClause, { isActive: true }] };

  try {
    const options = { where: whereClause, include: null };

    const selectList = apiManager.getSelectList() ?? [];
    if (selectList.length) {
      options.attributes = selectList;
    }
    options.limit = null;

    options.order = [["createdAt", "DESC"]];

    let rowData = await PresetMeal.findOne(options);
    if (Array.isArray(rowData)) rowData = rowData[0];

    if (!rowData) return null;

    const dbData = rowData.getData();
    apiManager.presetMeal = dbData;

    return dbData;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    console.log(err);
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenExecuting_dbScriptGetPresetmealforlogging",
      {
        whereClause: normalizeSequalizeOps(whereClause),
        errorName: err.name,
        errorMessage: err.message,
        errorStack: err.stack,
      },
    );
  }
};

module.exports = dbScriptGetPresetmealforlogging;
