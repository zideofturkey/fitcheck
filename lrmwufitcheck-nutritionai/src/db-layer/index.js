const nutritionaiFunctions = require("./nutritionai");

module.exports = {
  // nutritionai Database
  createAiSession: nutritionaiFunctions.createAiSession,
  createBulkAiSession: nutritionaiFunctions.createBulkAiSession,
  getIdListOfAiSessionByField: nutritionaiFunctions.getIdListOfAiSessionByField,
  getAiSessionById: nutritionaiFunctions.getAiSessionById,
  getAiSessionAggById: nutritionaiFunctions.getAiSessionAggById,
  getAiSessionListByQuery: nutritionaiFunctions.getAiSessionListByQuery,
  getAiSessionListByMQuery: nutritionaiFunctions.getAiSessionListByMQuery,
  getAiSessionStatsByQuery: nutritionaiFunctions.getAiSessionStatsByQuery,
  getAiSessionStatsByMQuery: nutritionaiFunctions.getAiSessionStatsByMQuery,
  getAiSessionByQuery: nutritionaiFunctions.getAiSessionByQuery,
  getAiSessionByMQuery: nutritionaiFunctions.getAiSessionByMQuery,
  updateAiSessionById: nutritionaiFunctions.updateAiSessionById,
  updateAiSessionByIdList: nutritionaiFunctions.updateAiSessionByIdList,
  updateAiSessionByQuery: nutritionaiFunctions.updateAiSessionByQuery,
  updateAiSessionByMQuery: nutritionaiFunctions.updateAiSessionByMQuery,
  deleteAiSessionById: nutritionaiFunctions.deleteAiSessionById,
  deleteAiSessionByQuery: nutritionaiFunctions.deleteAiSessionByQuery,
  deleteAiSessionByMQuery: nutritionaiFunctions.deleteAiSessionByMQuery,
  dbScriptParseMeal: nutritionaiFunctions.dbScriptParseMeal,
  dbScriptAskNutritionquestion:
    nutritionaiFunctions.dbScriptAskNutritionquestion,
  dbScriptGetAisession: nutritionaiFunctions.dbScriptGetAisession,
  dbScriptListAisessions: nutritionaiFunctions.dbScriptListAisessions,
  dbScript_fetchListaisession: nutritionaiFunctions.dbScript_fetchListaisession,
  createAiCandidateMeal: nutritionaiFunctions.createAiCandidateMeal,
  createBulkAiCandidateMeal: nutritionaiFunctions.createBulkAiCandidateMeal,
  getIdListOfAiCandidateMealByField:
    nutritionaiFunctions.getIdListOfAiCandidateMealByField,
  getAiCandidateMealById: nutritionaiFunctions.getAiCandidateMealById,
  getAiCandidateMealAggById: nutritionaiFunctions.getAiCandidateMealAggById,
  getAiCandidateMealListByQuery:
    nutritionaiFunctions.getAiCandidateMealListByQuery,
  getAiCandidateMealListByMQuery:
    nutritionaiFunctions.getAiCandidateMealListByMQuery,
  getAiCandidateMealStatsByQuery:
    nutritionaiFunctions.getAiCandidateMealStatsByQuery,
  getAiCandidateMealStatsByMQuery:
    nutritionaiFunctions.getAiCandidateMealStatsByMQuery,
  getAiCandidateMealByQuery: nutritionaiFunctions.getAiCandidateMealByQuery,
  getAiCandidateMealByMQuery: nutritionaiFunctions.getAiCandidateMealByMQuery,
  updateAiCandidateMealById: nutritionaiFunctions.updateAiCandidateMealById,
  updateAiCandidateMealByIdList:
    nutritionaiFunctions.updateAiCandidateMealByIdList,
  updateAiCandidateMealByQuery:
    nutritionaiFunctions.updateAiCandidateMealByQuery,
  updateAiCandidateMealByMQuery:
    nutritionaiFunctions.updateAiCandidateMealByMQuery,
  deleteAiCandidateMealById: nutritionaiFunctions.deleteAiCandidateMealById,
  deleteAiCandidateMealByQuery:
    nutritionaiFunctions.deleteAiCandidateMealByQuery,
  deleteAiCandidateMealByMQuery:
    nutritionaiFunctions.deleteAiCandidateMealByMQuery,
  dbScriptConfirmCandidatemeal:
    nutritionaiFunctions.dbScriptConfirmCandidatemeal,
  dbScriptGetAicandidatemeal: nutritionaiFunctions.dbScriptGetAicandidatemeal,
  dbScriptListAicandidatemeals:
    nutritionaiFunctions.dbScriptListAicandidatemeals,
  dbScriptRejectCandidatemeal: nutritionaiFunctions.dbScriptRejectCandidatemeal,
  dbScript_fetchListaicandidatemeal:
    nutritionaiFunctions.dbScript_fetchListaicandidatemeal,
  createAiCandidateLine: nutritionaiFunctions.createAiCandidateLine,
  createBulkAiCandidateLine: nutritionaiFunctions.createBulkAiCandidateLine,
  getIdListOfAiCandidateLineByField:
    nutritionaiFunctions.getIdListOfAiCandidateLineByField,
  getAiCandidateLineById: nutritionaiFunctions.getAiCandidateLineById,
  getAiCandidateLineAggById: nutritionaiFunctions.getAiCandidateLineAggById,
  getAiCandidateLineListByQuery:
    nutritionaiFunctions.getAiCandidateLineListByQuery,
  getAiCandidateLineListByMQuery:
    nutritionaiFunctions.getAiCandidateLineListByMQuery,
  getAiCandidateLineStatsByQuery:
    nutritionaiFunctions.getAiCandidateLineStatsByQuery,
  getAiCandidateLineStatsByMQuery:
    nutritionaiFunctions.getAiCandidateLineStatsByMQuery,
  getAiCandidateLineByQuery: nutritionaiFunctions.getAiCandidateLineByQuery,
  getAiCandidateLineByMQuery: nutritionaiFunctions.getAiCandidateLineByMQuery,
  updateAiCandidateLineById: nutritionaiFunctions.updateAiCandidateLineById,
  updateAiCandidateLineByIdList:
    nutritionaiFunctions.updateAiCandidateLineByIdList,
  updateAiCandidateLineByQuery:
    nutritionaiFunctions.updateAiCandidateLineByQuery,
  updateAiCandidateLineByMQuery:
    nutritionaiFunctions.updateAiCandidateLineByMQuery,
  deleteAiCandidateLineById: nutritionaiFunctions.deleteAiCandidateLineById,
  deleteAiCandidateLineByQuery:
    nutritionaiFunctions.deleteAiCandidateLineByQuery,
  deleteAiCandidateLineByMQuery:
    nutritionaiFunctions.deleteAiCandidateLineByMQuery,
  dbScriptUpdateAicandidateline:
    nutritionaiFunctions.dbScriptUpdateAicandidateline,
  dbScript_fetchListaicandidateline:
    nutritionaiFunctions.dbScript_fetchListaicandidateline,
  createAiGuidanceNote: nutritionaiFunctions.createAiGuidanceNote,
  createBulkAiGuidanceNote: nutritionaiFunctions.createBulkAiGuidanceNote,
  getIdListOfAiGuidanceNoteByField:
    nutritionaiFunctions.getIdListOfAiGuidanceNoteByField,
  getAiGuidanceNoteById: nutritionaiFunctions.getAiGuidanceNoteById,
  getAiGuidanceNoteAggById: nutritionaiFunctions.getAiGuidanceNoteAggById,
  getAiGuidanceNoteListByQuery:
    nutritionaiFunctions.getAiGuidanceNoteListByQuery,
  getAiGuidanceNoteListByMQuery:
    nutritionaiFunctions.getAiGuidanceNoteListByMQuery,
  getAiGuidanceNoteStatsByQuery:
    nutritionaiFunctions.getAiGuidanceNoteStatsByQuery,
  getAiGuidanceNoteStatsByMQuery:
    nutritionaiFunctions.getAiGuidanceNoteStatsByMQuery,
  getAiGuidanceNoteByQuery: nutritionaiFunctions.getAiGuidanceNoteByQuery,
  getAiGuidanceNoteByMQuery: nutritionaiFunctions.getAiGuidanceNoteByMQuery,
  updateAiGuidanceNoteById: nutritionaiFunctions.updateAiGuidanceNoteById,
  updateAiGuidanceNoteByIdList:
    nutritionaiFunctions.updateAiGuidanceNoteByIdList,
  updateAiGuidanceNoteByQuery: nutritionaiFunctions.updateAiGuidanceNoteByQuery,
  updateAiGuidanceNoteByMQuery:
    nutritionaiFunctions.updateAiGuidanceNoteByMQuery,
  deleteAiGuidanceNoteById: nutritionaiFunctions.deleteAiGuidanceNoteById,
  deleteAiGuidanceNoteByQuery: nutritionaiFunctions.deleteAiGuidanceNoteByQuery,
  deleteAiGuidanceNoteByMQuery:
    nutritionaiFunctions.deleteAiGuidanceNoteByMQuery,
  dbScriptGetAiguidancenote: nutritionaiFunctions.dbScriptGetAiguidancenote,
  dbScriptListAiguidancenotes: nutritionaiFunctions.dbScriptListAiguidancenotes,
  dbScript_fetchListaiguidancenote:
    nutritionaiFunctions.dbScript_fetchListaiguidancenote,
};
