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
    name: "fitcheck - invitationCenter",
    brand: {
      name: "fitcheck",
      image: "https://minioapi.masaupp.com/mindbricks/favico.ico",
      moduleName: "invitationCenter",
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
        name: "InviteLink",
        description:
          "Stores a unique invite registration token with usage rules, lifecycle state, delivery tracking, and a reference to the registered user created as a result of the invite.",
        reference: {
          tableName: "inviteLink",
          properties: [
            {
              name: "ownerUserId",
              type: "ID",
            },

            {
              name: "inviteCode",
              type: "String",
            },

            {
              name: "invitedEmail",
              type: "String",
            },

            {
              name: "usageMode",
              type: "Enum",
            },

            {
              name: "usageLimit",
              type: "Integer",
            },

            {
              name: "usageCount",
              type: "Integer",
            },

            {
              name: "inviteState",
              type: "Enum",
            },

            {
              name: "expiresAt",
              type: "Date",
            },

            {
              name: "lastUsedAt",
              type: "Date",
            },

            {
              name: "registeredUserId",
              type: "ID",
            },

            {
              name: "deliveryRequestedAt",
              type: "Date",
            },

            {
              name: "lastDeliveredAt",
              type: "Date",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "POST",
            url: `${basePath}/v1/invite-links`,
            title: "Create Invitelink",
            query: [],

            body: {
              type: "json",
              content: {
                invitedEmail: "String",
                usageMode: "Enum",
                usageLimit: "Integer",
                expiresAt: "Date",
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "PATCH",
            url: `${basePath}/v1/invite-links/{inviteLinkId}/activate`,
            title: "Activate Invitelink",
            query: [],

            body: {
              type: "json",
              content: {},
            },

            parameters: [
              {
                key: "inviteLinkId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "PATCH",
            url: `${basePath}/v1/invite-links/{inviteLinkId}/revoke`,
            title: "Revoke Invitelink",
            query: [],

            body: {
              type: "json",
              content: {
                eventNote: "String",
              },
            },

            parameters: [
              {
                key: "inviteLinkId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "POST",
            url: `${basePath}/v1/invite-links/{inviteLinkId}/deliver`,
            title: "Deliver Inviteemail",
            query: [],

            body: {
              type: "json",
              content: {},
            },

            parameters: [
              {
                key: "inviteLinkId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: false,
            method: "POST",
            url: `${basePath}/v1/invite-links/validate`,
            title: "Validate Invitecode",
            query: [],

            body: {
              type: "json",
              content: {
                inviteCode: "String",
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "PATCH",
            url: `${basePath}/v1/invite-links/{inviteLinkId}/consume`,
            title: "Consume Invitelink",
            query: [],

            body: {
              type: "json",
              content: {
                registeredUserId: "ID",
                relatedEmail: "String",
              },
            },

            parameters: [
              {
                key: "inviteLinkId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: false,
            method: "GET",
            url: `${basePath}/v1/invite-links/by-code/{inviteCode}`,
            title: "Get Invitelinkbycode",
            query: [],

            parameters: [
              {
                key: "inviteCode",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/invite-links/{inviteLinkId}`,
            title: "Get Invitelink",
            query: [],

            parameters: [
              {
                key: "inviteLinkId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/invite-links`,
            title: "List Invitelinks",
            query: [
              {
                key: "usageMode",
                value: "",
                description: "",
              },
              {
                key: "inviteState",
                value: "",
                description: "",
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
            url: `${basePath}/v1/_fetchlistinvitelink`,
            title: "_fetch Listinvitelink",
            query: [
              {
                key: "usageMode",
                value: "",
                description: "",
              },
              {
                key: "inviteState",
                value: "",
                description: "",
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
        name: "InviteAudit",
        description:
          "Append-only audit log capturing every lifecycle event on an invite link, including who acted, what happened, and optional contextual notes.",
        reference: {
          tableName: "inviteAudit",
          properties: [
            {
              name: "inviteLinkId",
              type: "ID",
            },

            {
              name: "eventType",
              type: "Enum",
            },

            {
              name: "eventAt",
              type: "Date",
            },

            {
              name: "actorUserId",
              type: "ID",
            },

            {
              name: "eventNote",
              type: "String",
            },

            {
              name: "relatedEmail",
              type: "String",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/invite-audits`,
            title: "List Inviteaudits",
            query: [
              {
                key: "inviteLinkId",
                value: "",
                description: "",
              },
              {
                key: "eventType",
                value: "",
                description: "",
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
            url: `${basePath}/v1/_fetchlistinviteaudit`,
            title: "_fetch Listinviteaudit",
            query: [
              {
                key: "inviteLinkId",
                value: "",
                description: "",
              },
              {
                key: "eventType",
                value: "",
                description: "",
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
