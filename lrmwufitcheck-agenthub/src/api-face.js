const { inject } = require("mindbricks-api-face");

module.exports = (app) => {
  const basePath =
    process.env.SERVICE_URL_SUFFIX ?? `${process.env.SERVICE_SHORT_NAME}-api`;
  const baseUrl = process.env.SERVICE_URL ?? "mindbricks.com";
  const shortName = process.env.SERVICE_SHORT_NAME?.toLowerCase();
  const authUrl = shortName
    ? baseUrl.replace(shortName + "-api", "auth-api")
    : baseUrl;

  const config = {
    basePath: basePath,
    name: "fitcheck - agentHub",
    brand: {
      name: "fitcheck",
      image: "https://minioapi.masaupp.com/mindbricks/favico.ico",
      moduleName: "agentHub",
      version: process.env.SERVICE_VERSION || "1.0.0",
    },
    auth: {
      url: authUrl,
      loginPath: "/login",
      logoutPath: "/logout",
      currentUserPath: "/currentuser",
      authStrategy: "external",
      initialAuth: true,
    },
    dataObjects: [
      {
        name: "Admin",
        description:
          "An API tool set to get administrative data from the service",
        reference: {
          tableName: "Admin",
          properties: [],
        },
        endpoints: [
          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/admin/logs`,
            title: "Get Logs",
            query: [
              {
                key: "logCount",
                value: 20,
                description: "The number of last logs to retreive",
              },
              {
                key: "allServices",
                value: "false",
                description:
                  "Set true if you want to fetch logs of all services",
              },
              {
                key: "onlyErrors",
                value: "false",
                description: "Set true if you want to fetch only error logs",
              },
            ],
            headers: [],
          },
          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/currentuser`,
            title: "Get Current Session",
            query: [],
            headers: [],
          },
          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/integrations/testconnect/{provider}`,
            title: "Test Provider Connection",
            query: [],
            parameters: [
              {
                key: "provider",
                value: "",
                description:
                  "enter the code name of the API provider integrated to your project.eg. googleMaps",
              },
            ],
            headers: [],
          },
          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/integrations/testall/{provider}`,
            title: "Test Provider Methods",
            query: [],
            parameters: [
              {
                key: "provider",
                value: "",
                description:
                  "enter the code name of the API provider integrated to your project.eg. googleMaps",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "POST",
            url: `${basePath}/rawsearch/{index}`,
            title: "Search In ElasticSearch",
            query: [],
            parameters: [
              {
                key: "index",
                value: "",
                description:
                  "Enter the name of the elasticIndex to make search",
              },
            ],
            body: {
              type: "json",
              content: {
                query: {},
                aggregations: [],
              },
            },
            headers: [],
          },
          // ===== Elasticsearch Index Management Endpoints =====
          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/admin/elastic/objects`,
            title: "List DataObjects",
            description:
              "Get list of all DataObjects available for Elasticsearch index operations",
            query: [],
            headers: [],
          },
          {
            isAuth: true,
            method: "POST",
            url: `${basePath}/admin/elastic/rebuild/{dataObjectName}`,
            title: "Rebuild Index",
            description:
              "Delete and rebuild Elasticsearch index for a specific DataObject. Uses dynamic chunk sizing.",
            query: [],
            parameters: [
              {
                key: "dataObjectName",
                value: "",
                description: "Name of the DataObject (case-insensitive)",
              },
            ],
            body: {
              type: "json",
              content: {
                deleteOldIndex: true,
              },
            },
            headers: [],
          },
          {
            isAuth: true,
            method: "POST",
            url: `${basePath}/admin/elastic/sync/{dataObjectName}`,
            title: "Sync Index",
            description:
              "Sync data to existing Elasticsearch index without deleting (incremental update).",
            query: [],
            parameters: [
              {
                key: "dataObjectName",
                value: "",
                description: "Name of the DataObject (case-insensitive)",
              },
            ],
            headers: [],
          },
          {
            isAuth: true,
            method: "POST",
            url: `${basePath}/admin/elastic/rebuild-all`,
            title: "Rebuild All Indexes",
            description:
              "Delete and rebuild all Elasticsearch indexes. Warning: Long operation for large datasets.",
            query: [],
            body: {
              type: "json",
              content: {},
            },
            headers: [],
          },
          {
            isAuth: true,
            method: "POST",
            url: `${basePath}/admin/elastic/sync-all`,
            title: "Sync All Indexes",
            description:
              "Sync data to all existing Elasticsearch indexes without deleting (incremental update).",
            query: [],
            body: {
              type: "json",
              content: {},
            },
            headers: [],
          },
        ],
      },

      {
        name: "Sys_agentOverride",
        description:
          "Runtime overrides for design-time agents. Null fields use the design default.",
        reference: {
          tableName: "sys_agentOverride",
          properties: [
            {
              name: "agentName",
              type: "String",
            },

            {
              name: "provider",
              type: "String",
            },

            {
              name: "model",
              type: "String",
            },

            {
              name: "systemPrompt",
              type: "Text",
            },

            {
              name: "temperature",
              type: "Double",
            },

            {
              name: "maxTokens",
              type: "Integer",
            },

            {
              name: "responseFormat",
              type: "String",
            },

            {
              name: "selectedTools",
              type: "Object",
            },

            {
              name: "guardrails",
              type: "Object",
            },

            {
              name: "enabled",
              type: "Boolean",
            },

            {
              name: "updatedBy",
              type: "ID",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/agentoverride/{sys_agentOverrideId}`,
            title: "Get Agentoverride",
            query: [],

            parameters: [
              {
                key: "sys_agentOverrideId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/agentoverrides`,
            title: "List Agentoverrides",
            query: [],

            body: {
              type: "json",
              content: {},
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "POST",
            url: `${basePath}/v1/agentoverride`,
            title: "Create Agentoverride",
            query: [],

            body: {
              type: "json",
              content: {
                agentName: "String",
                provider: "String",
                model: "String",
                systemPrompt: "Text",
                temperature: "Double",
                maxTokens: "Integer",
                responseFormat: "String",
                selectedTools: "Object",
                guardrails: "Object",
                enabled: "Boolean",
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "PATCH",
            url: `${basePath}/v1/agentoverride/{sys_agentOverrideId}`,
            title: "Update Agentoverride",
            query: [],

            body: {
              type: "json",
              content: {
                provider: "String",
                model: "String",
                systemPrompt: "Text",
                temperature: "Double",
                maxTokens: "Integer",
                responseFormat: "String",
                selectedTools: "Object",
                guardrails: "Object",
                enabled: "Boolean",
              },
            },

            parameters: [
              {
                key: "sys_agentOverrideId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "DELETE",
            url: `${basePath}/v1/agentoverride/{sys_agentOverrideId}`,
            title: "Delete Agentoverride",
            query: [],

            body: {
              type: "json",
              content: {},
            },

            parameters: [
              {
                key: "sys_agentOverrideId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/_fetchlistsys_agentoverride`,
            title: "_fetch Listsys_agentoverride",
            query: [],

            body: {
              type: "json",
              content: {},
            },

            parameters: [],
            headers: [],
          },

          // geo api
        ],
      },

      {
        name: "Sys_agentExecution",
        description:
          "Agent execution log. Records each agent invocation with input, output, and performance metrics.",
        reference: {
          tableName: "sys_agentExecution",
          properties: [
            {
              name: "agentName",
              type: "String",
            },

            {
              name: "agentType",
              type: "Enum",
            },

            {
              name: "source",
              type: "Enum",
            },

            {
              name: "userId",
              type: "ID",
            },

            {
              name: "input",
              type: "Object",
            },

            {
              name: "output",
              type: "Object",
            },

            {
              name: "toolCalls",
              type: "Integer",
            },

            {
              name: "tokenUsage",
              type: "Object",
            },

            {
              name: "durationMs",
              type: "Integer",
            },

            {
              name: "status",
              type: "Enum",
            },

            {
              name: "error",
              type: "Text",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/agentexecutions`,
            title: "List Agentexecutions",
            query: [
              {
                key: "agentName",
                value: "",
                description: "Agent that was executed.",
              },
              {
                key: "agentType",
                value: "",
                description: "Whether this was a design-time or dynamic agent.",
              },
              {
                key: "source",
                value: "",
                description: "How the agent was triggered.",
              },
              {
                key: "userId",
                value: "",
                description: "User who triggered the execution.",
              },
              {
                key: "status",
                value: "",
                description: "Execution status.",
              },
            ],

            body: {
              type: "json",
              content: {},
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/agentexecution/{sys_agentExecutionId}`,
            title: "Get Agentexecution",
            query: [],

            parameters: [
              {
                key: "sys_agentExecutionId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/_fetchlistsys_agentexecution`,
            title: "_fetch Listsys_agentexecution",
            query: [
              {
                key: "agentName",
                value: "",
                description: "Agent that was executed.",
              },
              {
                key: "agentType",
                value: "",
                description: "Whether this was a design-time or dynamic agent.",
              },
              {
                key: "source",
                value: "",
                description: "How the agent was triggered.",
              },
              {
                key: "userId",
                value: "",
                description: "User who triggered the execution.",
              },
              {
                key: "status",
                value: "",
                description: "Execution status.",
              },
            ],

            body: {
              type: "json",
              content: {},
            },

            parameters: [],
            headers: [],
          },

          // geo api
        ],
      },

      {
        name: "Sys_toolCatalog",
        description:
          "Cached tool catalog discovered from project services. Refreshed periodically.",
        reference: {
          tableName: "sys_toolCatalog",
          properties: [
            {
              name: "toolName",
              type: "String",
            },

            {
              name: "serviceName",
              type: "String",
            },

            {
              name: "description",
              type: "Text",
            },

            {
              name: "parameters",
              type: "Object",
            },

            {
              name: "lastRefreshed",
              type: "Date",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/toolcatalog`,
            title: "List Toolcatalog",
            query: [
              {
                key: "serviceName",
                value: "",
                description: "Source service name.",
              },
            ],

            body: {
              type: "json",
              content: {},
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/toolcatalogentry/{sys_toolCatalogId}`,
            title: "Get Toolcatalogentry",
            query: [],

            parameters: [
              {
                key: "sys_toolCatalogId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/_fetchlistsys_toolcatalog`,
            title: "_fetch Listsys_toolcatalog",
            query: [
              {
                key: "serviceName",
                value: "",
                description: "Source service name.",
              },
            ],

            body: {
              type: "json",
              content: {},
            },

            parameters: [],
            headers: [],
          },

          // geo api
        ],
      },

      {
        name: "Sys_agentConversation",
        description:
          "Conversation history for chat-mode AI agents. One record per session, keyed by sessionId.",
        reference: {
          tableName: "sys_agentConversation",
          properties: [
            {
              name: "sessionId",
              type: "String",
            },

            {
              name: "agentName",
              type: "String",
            },

            {
              name: "userId",
              type: "ID",
            },

            {
              name: "messages",
              type: "Object",
            },

            {
              name: "messageCount",
              type: "Integer",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/agentchats`,
            title: "List Agentchats",
            query: [
              {
                key: "agentName",
                value: "",
                description: "Name of the agent this conversation belongs to.",
              },
              {
                key: "userId",
                value: "",
                description: "User who owns this conversation.",
              },
            ],

            body: {
              type: "json",
              content: {},
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/agentchatmessages/{sys_agentConversationId}`,
            title: "Get Agentchatmessages",
            query: [],

            parameters: [
              {
                key: "sys_agentConversationId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/_fetchlistsys_agentconversation`,
            title: "_fetch Listsys_agentconversation",
            query: [
              {
                key: "agentName",
                value: "",
                description: "Name of the agent this conversation belongs to.",
              },
              {
                key: "userId",
                value: "",
                description: "User who owns this conversation.",
              },
            ],

            body: {
              type: "json",
              content: {},
            },

            parameters: [],
            headers: [],
          },

          // geo api
        ],
      },
    ],
  };

  inject(app, config);
};
