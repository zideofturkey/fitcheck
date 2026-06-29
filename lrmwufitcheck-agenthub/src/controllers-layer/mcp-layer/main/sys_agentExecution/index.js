module.exports = (headers) => {
  // Sys_agentExecution Db Object Rest Api Router
  const sys_agentExecutionMcpRouter = [];

  // listAgentExecutions controller
  sys_agentExecutionMcpRouter.push(
    require("./list-agentexecutions-api")(headers),
  );
  // getAgentExecution controller
  sys_agentExecutionMcpRouter.push(
    require("./get-agentexecution-api")(headers),
  );
  // _fetchListSys_agentExecution controller
  sys_agentExecutionMcpRouter.push(
    require("./_fetch-listsys_agentexecution-api")(headers),
  );

  return sys_agentExecutionMcpRouter;
};
