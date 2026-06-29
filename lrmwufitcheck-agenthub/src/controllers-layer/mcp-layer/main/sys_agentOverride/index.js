module.exports = (headers) => {
  // Sys_agentOverride Db Object Rest Api Router
  const sys_agentOverrideMcpRouter = [];

  // getAgentOverride controller
  sys_agentOverrideMcpRouter.push(require("./get-agentoverride-api")(headers));
  // listAgentOverrides controller
  sys_agentOverrideMcpRouter.push(
    require("./list-agentoverrides-api")(headers),
  );
  // createAgentOverride controller
  sys_agentOverrideMcpRouter.push(
    require("./create-agentoverride-api")(headers),
  );
  // updateAgentOverride controller
  sys_agentOverrideMcpRouter.push(
    require("./update-agentoverride-api")(headers),
  );
  // deleteAgentOverride controller
  sys_agentOverrideMcpRouter.push(
    require("./delete-agentoverride-api")(headers),
  );
  // _fetchListSys_agentOverride controller
  sys_agentOverrideMcpRouter.push(
    require("./_fetch-listsys_agentoverride-api")(headers),
  );

  return sys_agentOverrideMcpRouter;
};
