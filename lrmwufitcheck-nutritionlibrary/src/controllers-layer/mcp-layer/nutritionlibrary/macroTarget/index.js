module.exports = (headers) => {
  // MacroTarget Db Object Rest Api Router
  const macroTargetMcpRouter = [];

  // setMacroTarget controller
  macroTargetMcpRouter.push(require("./set-macrotarget-api")(headers));
  // getMyMacroTarget controller
  macroTargetMcpRouter.push(require("./get-mymacrotarget-api")(headers));
  // getMyMacroTargetForLogging controller
  macroTargetMcpRouter.push(
    require("./get-mymacrotargetforlogging-api")(headers),
  );
  // _fetchListMacroTarget controller
  macroTargetMcpRouter.push(require("./_fetch-listmacrotarget-api")(headers));

  return macroTargetMcpRouter;
};
