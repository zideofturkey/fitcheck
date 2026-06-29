module.exports = {
  // nutritionai Database Crud Object Routes Manager Layer Classes
  // AiSession Db Object
  ParseMealManager: require("./aiSession/parse-meal-api"),
  AskNutritionQuestionManager: require("./aiSession/ask-nutritionquestion-api"),
  GetAiSessionManager: require("./aiSession/get-aisession-api"),
  ListAiSessionsManager: require("./aiSession/list-aisessions-api"),
  _fetchListAiSessionManager: require("./aiSession/_fetch-listaisession-api"),
  // AiCandidateMeal Db Object
  ConfirmCandidateMealManager: require("./aiCandidateMeal/confirm-candidatemeal-api"),
  GetAiCandidateMealManager: require("./aiCandidateMeal/get-aicandidatemeal-api"),
  ListAiCandidateMealsManager: require("./aiCandidateMeal/list-aicandidatemeals-api"),
  RejectCandidateMealManager: require("./aiCandidateMeal/reject-candidatemeal-api"),
  _fetchListAiCandidateMealManager: require("./aiCandidateMeal/_fetch-listaicandidatemeal-api"),
  // AiCandidateLine Db Object
  UpdateAiCandidateLineManager: require("./aiCandidateLine/update-aicandidateline-api"),
  _fetchListAiCandidateLineManager: require("./aiCandidateLine/_fetch-listaicandidateline-api"),
  // AiGuidanceNote Db Object
  GetAiGuidanceNoteManager: require("./aiGuidanceNote/get-aiguidancenote-api"),
  ListAiGuidanceNotesManager: require("./aiGuidanceNote/list-aiguidancenotes-api"),
  _fetchListAiGuidanceNoteManager: require("./aiGuidanceNote/_fetch-listaiguidancenote-api"),
};
