const utils = require("./utils");
const dbApiScripts = require("./dbApiScripts");

module.exports = {
  createMacroTarget: utils.createMacroTarget,
  createBulkMacroTarget: utils.createBulkMacroTarget,
  getIdListOfMacroTargetByField: utils.getIdListOfMacroTargetByField,
  getMacroTargetById: utils.getMacroTargetById,
  getMacroTargetAggById: utils.getMacroTargetAggById,
  getMacroTargetListByQuery: utils.getMacroTargetListByQuery,
  getMacroTargetListByMQuery: utils.getMacroTargetListByMQuery,
  getMacroTargetStatsByQuery: utils.getMacroTargetStatsByQuery,
  getMacroTargetStatsByMQuery: utils.getMacroTargetStatsByMQuery,
  getMacroTargetByQuery: utils.getMacroTargetByQuery,
  getMacroTargetByMQuery: utils.getMacroTargetByMQuery,
  updateMacroTargetById: utils.updateMacroTargetById,
  updateMacroTargetByIdList: utils.updateMacroTargetByIdList,
  updateMacroTargetByQuery: utils.updateMacroTargetByQuery,
  updateMacroTargetByMQuery: utils.updateMacroTargetByMQuery,
  deleteMacroTargetById: utils.deleteMacroTargetById,
  deleteMacroTargetByQuery: utils.deleteMacroTargetByQuery,
  deleteMacroTargetByMQuery: utils.deleteMacroTargetByMQuery,
  dbScriptSetMacrotarget: dbApiScripts.dbScriptSetMacrotarget,
  dbScriptGetMymacrotarget: dbApiScripts.dbScriptGetMymacrotarget,
  dbScriptGetMymacrotargetforlogging:
    dbApiScripts.dbScriptGetMymacrotargetforlogging,
  dbScript_fetchListmacrotarget: dbApiScripts.dbScript_fetchListmacrotarget,
};
