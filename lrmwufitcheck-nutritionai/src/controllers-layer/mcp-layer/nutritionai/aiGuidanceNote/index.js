module.exports = (headers) => {
  // AiGuidanceNote Db Object Rest Api Router
  const aiGuidanceNoteMcpRouter = [];

  // getAiGuidanceNote controller
  aiGuidanceNoteMcpRouter.push(require("./get-aiguidancenote-api")(headers));
  // listAiGuidanceNotes controller
  aiGuidanceNoteMcpRouter.push(require("./list-aiguidancenotes-api")(headers));
  // _fetchListAiGuidanceNote controller
  aiGuidanceNoteMcpRouter.push(
    require("./_fetch-listaiguidancenote-api")(headers),
  );

  return aiGuidanceNoteMcpRouter;
};
