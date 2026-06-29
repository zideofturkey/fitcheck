const utils = require("./utils");
const dbApiScripts = require("./dbApiScripts");

module.exports = {
  createPresetLine: utils.createPresetLine,
  createBulkPresetLine: utils.createBulkPresetLine,
  getIdListOfPresetLineByField: utils.getIdListOfPresetLineByField,
  getPresetLineById: utils.getPresetLineById,
  getPresetLineAggById: utils.getPresetLineAggById,
  getPresetLineListByQuery: utils.getPresetLineListByQuery,
  getPresetLineListByMQuery: utils.getPresetLineListByMQuery,
  getPresetLineStatsByQuery: utils.getPresetLineStatsByQuery,
  getPresetLineStatsByMQuery: utils.getPresetLineStatsByMQuery,
  getPresetLineByQuery: utils.getPresetLineByQuery,
  getPresetLineByMQuery: utils.getPresetLineByMQuery,
  updatePresetLineById: utils.updatePresetLineById,
  updatePresetLineByIdList: utils.updatePresetLineByIdList,
  updatePresetLineByQuery: utils.updatePresetLineByQuery,
  updatePresetLineByMQuery: utils.updatePresetLineByMQuery,
  deletePresetLineById: utils.deletePresetLineById,
  deletePresetLineByQuery: utils.deletePresetLineByQuery,
  deletePresetLineByMQuery: utils.deletePresetLineByMQuery,
  dbScriptAddPresetline: dbApiScripts.dbScriptAddPresetline,
  dbScriptListPresetlines: dbApiScripts.dbScriptListPresetlines,
  dbScriptDeletePresetline: dbApiScripts.dbScriptDeletePresetline,
  dbScript_fetchListpresetline: dbApiScripts.dbScript_fetchListpresetline,
};
