module.exports = {
  // main Database Crud Object Routes Manager Layer Classes
  // Sys_agentOverride Db Object
  GetAgentOverrideManager: require("./sys_agentOverride/get-agentoverride-api"),
  ListAgentOverridesManager: require("./sys_agentOverride/list-agentoverrides-api"),
  CreateAgentOverrideManager: require("./sys_agentOverride/create-agentoverride-api"),
  UpdateAgentOverrideManager: require("./sys_agentOverride/update-agentoverride-api"),
  DeleteAgentOverrideManager: require("./sys_agentOverride/delete-agentoverride-api"),
  _fetchListSys_agentOverrideManager: require("./sys_agentOverride/_fetch-listsys_agentoverride-api"),
  // Sys_agentExecution Db Object
  ListAgentExecutionsManager: require("./sys_agentExecution/list-agentexecutions-api"),
  GetAgentExecutionManager: require("./sys_agentExecution/get-agentexecution-api"),
  _fetchListSys_agentExecutionManager: require("./sys_agentExecution/_fetch-listsys_agentexecution-api"),
  // Sys_toolCatalog Db Object
  ListToolCatalogManager: require("./sys_toolCatalog/list-toolcatalog-api"),
  GetToolCatalogEntryManager: require("./sys_toolCatalog/get-toolcatalogentry-api"),
  _fetchListSys_toolCatalogManager: require("./sys_toolCatalog/_fetch-listsys_toolcatalog-api"),
  // Sys_agentConversation Db Object
  ListAgentChatsManager: require("./sys_agentConversation/list-agentchats-api"),
  GetAgentChatMessagesManager: require("./sys_agentConversation/get-agentchatmessages-api"),
  _fetchListSys_agentConversationManager: require("./sys_agentConversation/_fetch-listsys_agentconversation-api"),
};
