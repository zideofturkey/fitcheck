const { ServicePublisher } = require("serviceCommon");

// Sys_agentOverride Event Publisher Classes

// Publisher class for getAgentOverride api
const { AgentoverrideRetrivedTopic } = require("./topics");
class AgentoverrideRetrivedPublisher extends ServicePublisher {
  constructor(agentoverride, session, requestId) {
    super(AgentoverrideRetrivedTopic, agentoverride, session, requestId);
  }

  static async Publish(agentoverride, session, requestId) {
    const _publisher = new AgentoverrideRetrivedPublisher(
      agentoverride,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Publisher class for listAgentOverrides api
const { AgentoverridesListedTopic } = require("./topics");
class AgentoverridesListedPublisher extends ServicePublisher {
  constructor(agentoverrides, session, requestId) {
    super(AgentoverridesListedTopic, agentoverrides, session, requestId);
  }

  static async Publish(agentoverrides, session, requestId) {
    const _publisher = new AgentoverridesListedPublisher(
      agentoverrides,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Publisher class for createAgentOverride api
const { AgentoverrideCreatedTopic } = require("./topics");
class AgentoverrideCreatedPublisher extends ServicePublisher {
  constructor(agentoverride, session, requestId) {
    super(AgentoverrideCreatedTopic, agentoverride, session, requestId);
  }

  static async Publish(agentoverride, session, requestId) {
    const _publisher = new AgentoverrideCreatedPublisher(
      agentoverride,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Publisher class for updateAgentOverride api
const { AgentoverrideUpdatedTopic } = require("./topics");
class AgentoverrideUpdatedPublisher extends ServicePublisher {
  constructor(agentoverride, session, requestId) {
    super(AgentoverrideUpdatedTopic, agentoverride, session, requestId);
  }

  static async Publish(agentoverride, session, requestId) {
    const _publisher = new AgentoverrideUpdatedPublisher(
      agentoverride,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Publisher class for deleteAgentOverride api
const { AgentoverrideDeletedTopic } = require("./topics");
class AgentoverrideDeletedPublisher extends ServicePublisher {
  constructor(agentoverride, session, requestId) {
    super(AgentoverrideDeletedTopic, agentoverride, session, requestId);
  }

  static async Publish(agentoverride, session, requestId) {
    const _publisher = new AgentoverrideDeletedPublisher(
      agentoverride,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Sys_agentExecution Event Publisher Classes

// Publisher class for listAgentExecutions api
const { AgentexecutionsListedTopic } = require("./topics");
class AgentexecutionsListedPublisher extends ServicePublisher {
  constructor(agentexecutions, session, requestId) {
    super(AgentexecutionsListedTopic, agentexecutions, session, requestId);
  }

  static async Publish(agentexecutions, session, requestId) {
    const _publisher = new AgentexecutionsListedPublisher(
      agentexecutions,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Publisher class for getAgentExecution api
const { AgentexecutionRetrivedTopic } = require("./topics");
class AgentexecutionRetrivedPublisher extends ServicePublisher {
  constructor(agentexecution, session, requestId) {
    super(AgentexecutionRetrivedTopic, agentexecution, session, requestId);
  }

  static async Publish(agentexecution, session, requestId) {
    const _publisher = new AgentexecutionRetrivedPublisher(
      agentexecution,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Sys_toolCatalog Event Publisher Classes

// Publisher class for listToolCatalog api
const { ToolcatalogListedTopic } = require("./topics");
class ToolcatalogListedPublisher extends ServicePublisher {
  constructor(toolcatalog, session, requestId) {
    super(ToolcatalogListedTopic, toolcatalog, session, requestId);
  }

  static async Publish(toolcatalog, session, requestId) {
    const _publisher = new ToolcatalogListedPublisher(
      toolcatalog,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Publisher class for getToolCatalogEntry api
const { ToolcatalogentryRetrivedTopic } = require("./topics");
class ToolcatalogentryRetrivedPublisher extends ServicePublisher {
  constructor(toolcatalogentry, session, requestId) {
    super(ToolcatalogentryRetrivedTopic, toolcatalogentry, session, requestId);
  }

  static async Publish(toolcatalogentry, session, requestId) {
    const _publisher = new ToolcatalogentryRetrivedPublisher(
      toolcatalogentry,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Sys_agentConversation Event Publisher Classes

// Publisher class for listAgentChats api
const { AgentchatsListedTopic } = require("./topics");
class AgentchatsListedPublisher extends ServicePublisher {
  constructor(agentchats, session, requestId) {
    super(AgentchatsListedTopic, agentchats, session, requestId);
  }

  static async Publish(agentchats, session, requestId) {
    const _publisher = new AgentchatsListedPublisher(
      agentchats,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Publisher class for getAgentChatMessages api
const { AgentchatmessagesRetrivedTopic } = require("./topics");
class AgentchatmessagesRetrivedPublisher extends ServicePublisher {
  constructor(agentchatmessages, session, requestId) {
    super(
      AgentchatmessagesRetrivedTopic,
      agentchatmessages,
      session,
      requestId,
    );
  }

  static async Publish(agentchatmessages, session, requestId) {
    const _publisher = new AgentchatmessagesRetrivedPublisher(
      agentchatmessages,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

module.exports = {
  AgentoverrideRetrivedPublisher,
  AgentoverridesListedPublisher,
  AgentoverrideCreatedPublisher,
  AgentoverrideUpdatedPublisher,
  AgentoverrideDeletedPublisher,

  AgentexecutionsListedPublisher,
  AgentexecutionRetrivedPublisher,

  ToolcatalogListedPublisher,
  ToolcatalogentryRetrivedPublisher,

  AgentchatsListedPublisher,
  AgentchatmessagesRetrivedPublisher,
};
