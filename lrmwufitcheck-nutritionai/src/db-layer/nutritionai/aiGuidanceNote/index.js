const utils = require("./utils");
const dbApiScripts = require("./dbApiScripts");

module.exports = {
  createAiGuidanceNote: utils.createAiGuidanceNote,
  createBulkAiGuidanceNote: utils.createBulkAiGuidanceNote,
  getIdListOfAiGuidanceNoteByField: utils.getIdListOfAiGuidanceNoteByField,
  getAiGuidanceNoteById: utils.getAiGuidanceNoteById,
  getAiGuidanceNoteAggById: utils.getAiGuidanceNoteAggById,
  getAiGuidanceNoteListByQuery: utils.getAiGuidanceNoteListByQuery,
  getAiGuidanceNoteListByMQuery: utils.getAiGuidanceNoteListByMQuery,
  getAiGuidanceNoteStatsByQuery: utils.getAiGuidanceNoteStatsByQuery,
  getAiGuidanceNoteStatsByMQuery: utils.getAiGuidanceNoteStatsByMQuery,
  getAiGuidanceNoteByQuery: utils.getAiGuidanceNoteByQuery,
  getAiGuidanceNoteByMQuery: utils.getAiGuidanceNoteByMQuery,
  updateAiGuidanceNoteById: utils.updateAiGuidanceNoteById,
  updateAiGuidanceNoteByIdList: utils.updateAiGuidanceNoteByIdList,
  updateAiGuidanceNoteByQuery: utils.updateAiGuidanceNoteByQuery,
  updateAiGuidanceNoteByMQuery: utils.updateAiGuidanceNoteByMQuery,
  deleteAiGuidanceNoteById: utils.deleteAiGuidanceNoteById,
  deleteAiGuidanceNoteByQuery: utils.deleteAiGuidanceNoteByQuery,
  deleteAiGuidanceNoteByMQuery: utils.deleteAiGuidanceNoteByMQuery,
  dbScriptGetAiguidancenote: dbApiScripts.dbScriptGetAiguidancenote,
  dbScriptListAiguidancenotes: dbApiScripts.dbScriptListAiguidancenotes,
  dbScript_fetchListaiguidancenote:
    dbApiScripts.dbScript_fetchListaiguidancenote,
};
