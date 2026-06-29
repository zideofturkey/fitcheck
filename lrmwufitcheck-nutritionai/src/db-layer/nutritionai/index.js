const aiSessionFunctions = require("./aiSession");
const aiCandidateMealFunctions = require("./aiCandidateMeal");
const aiCandidateLineFunctions = require("./aiCandidateLine");
const aiGuidanceNoteFunctions = require("./aiGuidanceNote");

module.exports = {
  // nutritionai Database
  createAiSession: aiSessionFunctions.createAiSession,
  createBulkAiSession: aiSessionFunctions.createBulkAiSession,
  getIdListOfAiSessionByField: aiSessionFunctions.getIdListOfAiSessionByField,
  getAiSessionById: aiSessionFunctions.getAiSessionById,
  getAiSessionAggById: aiSessionFunctions.getAiSessionAggById,
  getAiSessionListByQuery: aiSessionFunctions.getAiSessionListByQuery,
  getAiSessionListByMQuery: aiSessionFunctions.getAiSessionListByMQuery,
  getAiSessionStatsByQuery: aiSessionFunctions.getAiSessionStatsByQuery,
  getAiSessionStatsByMQuery: aiSessionFunctions.getAiSessionStatsByMQuery,
  getAiSessionByQuery: aiSessionFunctions.getAiSessionByQuery,
  getAiSessionByMQuery: aiSessionFunctions.getAiSessionByMQuery,
  updateAiSessionById: aiSessionFunctions.updateAiSessionById,
  updateAiSessionByIdList: aiSessionFunctions.updateAiSessionByIdList,
  updateAiSessionByQuery: aiSessionFunctions.updateAiSessionByQuery,
  updateAiSessionByMQuery: aiSessionFunctions.updateAiSessionByMQuery,
  deleteAiSessionById: aiSessionFunctions.deleteAiSessionById,
  deleteAiSessionByQuery: aiSessionFunctions.deleteAiSessionByQuery,
  deleteAiSessionByMQuery: aiSessionFunctions.deleteAiSessionByMQuery,
  dbScriptParseMeal: aiSessionFunctions.dbScriptParseMeal,
  dbScriptAskNutritionquestion: aiSessionFunctions.dbScriptAskNutritionquestion,
  dbScriptGetAisession: aiSessionFunctions.dbScriptGetAisession,
  dbScriptListAisessions: aiSessionFunctions.dbScriptListAisessions,
  dbScript_fetchListaisession: aiSessionFunctions.dbScript_fetchListaisession,
  createAiCandidateMeal: aiCandidateMealFunctions.createAiCandidateMeal,
  createBulkAiCandidateMeal: aiCandidateMealFunctions.createBulkAiCandidateMeal,
  getIdListOfAiCandidateMealByField:
    aiCandidateMealFunctions.getIdListOfAiCandidateMealByField,
  getAiCandidateMealById: aiCandidateMealFunctions.getAiCandidateMealById,
  getAiCandidateMealAggById: aiCandidateMealFunctions.getAiCandidateMealAggById,
  getAiCandidateMealListByQuery:
    aiCandidateMealFunctions.getAiCandidateMealListByQuery,
  getAiCandidateMealListByMQuery:
    aiCandidateMealFunctions.getAiCandidateMealListByMQuery,
  getAiCandidateMealStatsByQuery:
    aiCandidateMealFunctions.getAiCandidateMealStatsByQuery,
  getAiCandidateMealStatsByMQuery:
    aiCandidateMealFunctions.getAiCandidateMealStatsByMQuery,
  getAiCandidateMealByQuery: aiCandidateMealFunctions.getAiCandidateMealByQuery,
  getAiCandidateMealByMQuery:
    aiCandidateMealFunctions.getAiCandidateMealByMQuery,
  updateAiCandidateMealById: aiCandidateMealFunctions.updateAiCandidateMealById,
  updateAiCandidateMealByIdList:
    aiCandidateMealFunctions.updateAiCandidateMealByIdList,
  updateAiCandidateMealByQuery:
    aiCandidateMealFunctions.updateAiCandidateMealByQuery,
  updateAiCandidateMealByMQuery:
    aiCandidateMealFunctions.updateAiCandidateMealByMQuery,
  deleteAiCandidateMealById: aiCandidateMealFunctions.deleteAiCandidateMealById,
  deleteAiCandidateMealByQuery:
    aiCandidateMealFunctions.deleteAiCandidateMealByQuery,
  deleteAiCandidateMealByMQuery:
    aiCandidateMealFunctions.deleteAiCandidateMealByMQuery,
  dbScriptConfirmCandidatemeal:
    aiCandidateMealFunctions.dbScriptConfirmCandidatemeal,
  dbScriptGetAicandidatemeal:
    aiCandidateMealFunctions.dbScriptGetAicandidatemeal,
  dbScriptListAicandidatemeals:
    aiCandidateMealFunctions.dbScriptListAicandidatemeals,
  dbScriptRejectCandidatemeal:
    aiCandidateMealFunctions.dbScriptRejectCandidatemeal,
  dbScript_fetchListaicandidatemeal:
    aiCandidateMealFunctions.dbScript_fetchListaicandidatemeal,
  createAiCandidateLine: aiCandidateLineFunctions.createAiCandidateLine,
  createBulkAiCandidateLine: aiCandidateLineFunctions.createBulkAiCandidateLine,
  getIdListOfAiCandidateLineByField:
    aiCandidateLineFunctions.getIdListOfAiCandidateLineByField,
  getAiCandidateLineById: aiCandidateLineFunctions.getAiCandidateLineById,
  getAiCandidateLineAggById: aiCandidateLineFunctions.getAiCandidateLineAggById,
  getAiCandidateLineListByQuery:
    aiCandidateLineFunctions.getAiCandidateLineListByQuery,
  getAiCandidateLineListByMQuery:
    aiCandidateLineFunctions.getAiCandidateLineListByMQuery,
  getAiCandidateLineStatsByQuery:
    aiCandidateLineFunctions.getAiCandidateLineStatsByQuery,
  getAiCandidateLineStatsByMQuery:
    aiCandidateLineFunctions.getAiCandidateLineStatsByMQuery,
  getAiCandidateLineByQuery: aiCandidateLineFunctions.getAiCandidateLineByQuery,
  getAiCandidateLineByMQuery:
    aiCandidateLineFunctions.getAiCandidateLineByMQuery,
  updateAiCandidateLineById: aiCandidateLineFunctions.updateAiCandidateLineById,
  updateAiCandidateLineByIdList:
    aiCandidateLineFunctions.updateAiCandidateLineByIdList,
  updateAiCandidateLineByQuery:
    aiCandidateLineFunctions.updateAiCandidateLineByQuery,
  updateAiCandidateLineByMQuery:
    aiCandidateLineFunctions.updateAiCandidateLineByMQuery,
  deleteAiCandidateLineById: aiCandidateLineFunctions.deleteAiCandidateLineById,
  deleteAiCandidateLineByQuery:
    aiCandidateLineFunctions.deleteAiCandidateLineByQuery,
  deleteAiCandidateLineByMQuery:
    aiCandidateLineFunctions.deleteAiCandidateLineByMQuery,
  dbScriptUpdateAicandidateline:
    aiCandidateLineFunctions.dbScriptUpdateAicandidateline,
  dbScript_fetchListaicandidateline:
    aiCandidateLineFunctions.dbScript_fetchListaicandidateline,
  createAiGuidanceNote: aiGuidanceNoteFunctions.createAiGuidanceNote,
  createBulkAiGuidanceNote: aiGuidanceNoteFunctions.createBulkAiGuidanceNote,
  getIdListOfAiGuidanceNoteByField:
    aiGuidanceNoteFunctions.getIdListOfAiGuidanceNoteByField,
  getAiGuidanceNoteById: aiGuidanceNoteFunctions.getAiGuidanceNoteById,
  getAiGuidanceNoteAggById: aiGuidanceNoteFunctions.getAiGuidanceNoteAggById,
  getAiGuidanceNoteListByQuery:
    aiGuidanceNoteFunctions.getAiGuidanceNoteListByQuery,
  getAiGuidanceNoteListByMQuery:
    aiGuidanceNoteFunctions.getAiGuidanceNoteListByMQuery,
  getAiGuidanceNoteStatsByQuery:
    aiGuidanceNoteFunctions.getAiGuidanceNoteStatsByQuery,
  getAiGuidanceNoteStatsByMQuery:
    aiGuidanceNoteFunctions.getAiGuidanceNoteStatsByMQuery,
  getAiGuidanceNoteByQuery: aiGuidanceNoteFunctions.getAiGuidanceNoteByQuery,
  getAiGuidanceNoteByMQuery: aiGuidanceNoteFunctions.getAiGuidanceNoteByMQuery,
  updateAiGuidanceNoteById: aiGuidanceNoteFunctions.updateAiGuidanceNoteById,
  updateAiGuidanceNoteByIdList:
    aiGuidanceNoteFunctions.updateAiGuidanceNoteByIdList,
  updateAiGuidanceNoteByQuery:
    aiGuidanceNoteFunctions.updateAiGuidanceNoteByQuery,
  updateAiGuidanceNoteByMQuery:
    aiGuidanceNoteFunctions.updateAiGuidanceNoteByMQuery,
  deleteAiGuidanceNoteById: aiGuidanceNoteFunctions.deleteAiGuidanceNoteById,
  deleteAiGuidanceNoteByQuery:
    aiGuidanceNoteFunctions.deleteAiGuidanceNoteByQuery,
  deleteAiGuidanceNoteByMQuery:
    aiGuidanceNoteFunctions.deleteAiGuidanceNoteByMQuery,
  dbScriptGetAiguidancenote: aiGuidanceNoteFunctions.dbScriptGetAiguidancenote,
  dbScriptListAiguidancenotes:
    aiGuidanceNoteFunctions.dbScriptListAiguidancenotes,
  dbScript_fetchListaiguidancenote:
    aiGuidanceNoteFunctions.dbScript_fetchListaiguidancenote,
};
