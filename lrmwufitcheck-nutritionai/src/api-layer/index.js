module.exports = {
  NutritionAiServiceManager: require("./service-manager/NutritionAiServiceManager"),
  // nutritionai Database Crud Object Routes Manager Layer Classes
  // AiSession Db Object
  ParseMealManager: require("./nutritionai/aiSession/parse-meal-api"),
  AskNutritionQuestionManager: require("./nutritionai/aiSession/ask-nutritionquestion-api"),
  GetAiSessionManager: require("./nutritionai/aiSession/get-aisession-api"),
  ListAiSessionsManager: require("./nutritionai/aiSession/list-aisessions-api"),
  _fetchListAiSessionManager: require("./nutritionai/aiSession/_fetch-listaisession-api"),
  // AiCandidateMeal Db Object
  ConfirmCandidateMealManager: require("./nutritionai/aiCandidateMeal/confirm-candidatemeal-api"),
  GetAiCandidateMealManager: require("./nutritionai/aiCandidateMeal/get-aicandidatemeal-api"),
  ListAiCandidateMealsManager: require("./nutritionai/aiCandidateMeal/list-aicandidatemeals-api"),
  RejectCandidateMealManager: require("./nutritionai/aiCandidateMeal/reject-candidatemeal-api"),
  _fetchListAiCandidateMealManager: require("./nutritionai/aiCandidateMeal/_fetch-listaicandidatemeal-api"),
  // AiCandidateLine Db Object
  UpdateAiCandidateLineManager: require("./nutritionai/aiCandidateLine/update-aicandidateline-api"),
  ListAiCandidateLinesManager: require("./nutritionai/aiCandidateLine/list-aicandidatelines-api"),
  _fetchListAiCandidateLineManager: require("./nutritionai/aiCandidateLine/_fetch-listaicandidateline-api"),
  // AiGuidanceNote Db Object
  GetAiGuidanceNoteManager: require("./nutritionai/aiGuidanceNote/get-aiguidancenote-api"),
  ListAiGuidanceNotesManager: require("./nutritionai/aiGuidanceNote/list-aiguidancenotes-api"),
  _fetchListAiGuidanceNoteManager: require("./nutritionai/aiGuidanceNote/_fetch-listaiguidancenote-api"),
  integrationRouter: require("./integrations/testRouter"),
};
