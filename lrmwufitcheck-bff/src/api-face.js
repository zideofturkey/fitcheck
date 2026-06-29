const { inject } = require("mindbricks-api-face");

module.exports = (app) => {
  const basePath =
    process.env.SERVICE_URL_SUFFIX ?? `${process.env.SERVICE_SHORT_NAME}-api`;
  const baseUrl = process.env.SERVICE_URL ?? "mindbricks.com";
  const shortName = process.env.SERVICE_SHORT_NAME?.toLowerCase();
  const authUrl = shortName ? baseUrl.replace(shortName, "auth") : baseUrl;

  const config = {
    basePath: basePath,
    name: "fitcheck - bff",
    brand: {
      name: "fitcheck",
      image: "https://minioapi.masaupp.com/mindbricks/favico.ico",
      moduleName: "bff",
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
        name: "Dynamic All Index",
        description: "Dynamic All Index for all elasticsearch index",
        reference: {
          tableName: "Dynamic All Index",
          properties: [],
        },
        endpoints: [
          {
            isAuth: false,
            method: "GET",
            url: `${basePath}/dynamic/allIndices`,
            title: "All Indices",
            query: [],
            body: {},
            parameters: [],
            headers: [],
          },
          {
            isAuth: false,
            method: "POST",
            url: `${basePath}/dynamic/{indexName}/list`,
            title: "List",
            query: [
              {
                key: "page",
                value: "1",
                description: "Page number",
              },
              {
                key: "limit",
                value: "10",
                description: "Limit number",
              },
              {
                key: "sortBy",
                value: "createdAt",
                description: "Sort by",
              },
              {
                key: "sortOrder",
                value: "desc",
                description: "Sort order",
              },
              {
                key: "q",
                value: "",
                description: "Search",
                active: false,
              },
            ],
            body: {
              type: "json",
              content: {
                field: {
                  //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
                  operator: "eq",
                  value: "string",
                  //if operator is range, values: [min, max]
                },
              },
            },
            parameters: [
              {
                key: "indexName",
                value: "string",
                description: "Index Name",
              },
            ],
            headers: [],
          },
          {
            isAuth: false,
            method: "GET",
            url: `${basePath}/dynamic/{indexName}/list`,
            title: "List",
            query: [
              {
                key: "page",
                value: "1",
                description: "Page number",
              },
              {
                key: "limit",
                value: "10",
                description: "Limit number",
              },
              {
                key: "sortBy",
                value: "createdAt",
                description: "Sort by",
              },
              {
                key: "sortOrder",
                value: "desc",
                description: "Sort order",
              },
              {
                key: "q",
                value: "",
                description: "Search",
                active: false,
              },
            ],
            body: {},
            parameters: [
              {
                key: "indexName",
                value: "string",
                description: "Index Name",
              },
            ],
            headers: [],
          },
          {
            isAuth: false,
            method: "POST",
            url: `${basePath}/dynamic/{indexName}/count`,
            title: "Count",
            query: [
              {
                key: "q",
                value: "",
                description: "Search",
                active: false,
              },
            ],
            body: {
              type: "json",
              content: {
                field: {
                  //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
                  operator: "eq",
                  value: "string",
                  //if operator is range, values: [min, max]
                },
              },
            },
            parameters: [
              {
                key: "indexName",
                value: "string",
                description: "Index Name",
              },
            ],
            headers: [],
          },
          {
            isAuth: false,
            method: "GET",
            url: `${basePath}/dynamic/{indexName}/count`,
            title: "Count",
            query: [
              {
                key: "q",
                value: "",
                description: "Search",
                active: false,
              },
            ],
            body: {},
            parameters: [
              {
                key: "indexName",
                value: "string",
                description: "Index Name",
              },
            ],
            headers: [],
          },
          {
            isAuth: false,
            method: "GET",
            url: `${basePath}/dynamic/{indexName}/schema`,
            title: "Schema",
            query: [],
            body: {},
            parameters: [
              {
                key: "indexName",
                value: "string",
                description: "Index Name",
              },
            ],
            headers: [],
          },
          {
            isAuth: false,
            method: "GET",
            url: `${basePath}/dynamic/{indexName}/{id}`,
            title: "Get",
            query: [],
            body: {},
            parameters: [
              {
                key: "indexName",
                value: "string",
                description: "Index Name",
              },
              {
                key: "id",
                value: "string",
                description: "Id",
              },
            ],
            headers: [],
          },
        ],
      },
    ],
  };

  config.dataObjects.push({
    name: "inviteLinkDeliveredNotificationView",
    description: "",
    reference: {
      tableName: "inviteLinkDeliveredNotificationView",
      properties: [],
    },
    endpoints: [
      {
        isAuth: false,
        method: "POST",
        url: `${basePath}/inviteLinkDeliveredNotificationView/list`,
        title: "List",
        query: [
          {
            key: "page",
            value: "1",
            description: "Page number",
            active: true,
          },
          {
            key: "limit",
            value: "10",
            description: "Limit number",
            active: true,
          },
          {
            key: "sortBy",
            value: "createdAt",
            description: "Sort by",
            active: true,
          },
          {
            key: "sortOrder",
            value: "desc",
            description: "Sort order",
            active: true,
          },
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {
          type: "json",
          content: {
            field: {
              //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
              operator: "eq",
              value: "string",
              //if operator is range, values: [min, max]
            },
          },
        },
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/inviteLinkDeliveredNotificationView/list`,
        title: "List",
        query: [
          {
            key: "page",
            value: "1",
            description: "Page number",
            active: true,
          },
          {
            key: "limit",
            value: "10",
            description: "Limit number",
            active: true,
          },
          {
            key: "sortBy",
            value: "createdAt",
            description: "Sort by",
            active: true,
          },
          {
            key: "sortOrder",
            value: "desc",
            description: "Sort order",
            active: true,
          },
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "POST",
        url: `${basePath}/inviteLinkDeliveredNotificationView/count`,
        title: "Count",
        query: [
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {
          type: "json",
          content: {
            field: {
              //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
              operator: "eq",
              value: "string",
              //if operator is range, values: [min, max]
            },
          },
        },
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/inviteLinkDeliveredNotificationView/count`,
        title: "Count",
        query: [
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/inviteLinkDeliveredNotificationView/schema`,
        title: "Schema",
        query: [],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/inviteLinkDeliveredNotificationView/{id}`,
        title: "Get",
        query: [],
        body: {},
        parameters: [
          {
            key: "id",
            value: "string",
            description: "Id",
          },
        ],
        headers: [],
      },
    ],
  });

  config.dataObjects.push({
    name: "inviteLinkListView",
    description: "",
    reference: {
      tableName: "inviteLinkListView",
      properties: [],
    },
    endpoints: [
      {
        isAuth: false,
        method: "POST",
        url: `${basePath}/inviteLinkListView/list`,
        title: "List",
        query: [
          {
            key: "page",
            value: "1",
            description: "Page number",
            active: true,
          },
          {
            key: "limit",
            value: "10",
            description: "Limit number",
            active: true,
          },
          {
            key: "sortBy",
            value: "createdAt",
            description: "Sort by",
            active: true,
          },
          {
            key: "sortOrder",
            value: "desc",
            description: "Sort order",
            active: true,
          },
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {
          type: "json",
          content: {
            field: {
              //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
              operator: "eq",
              value: "string",
              //if operator is range, values: [min, max]
            },
          },
        },
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/inviteLinkListView/list`,
        title: "List",
        query: [
          {
            key: "page",
            value: "1",
            description: "Page number",
            active: true,
          },
          {
            key: "limit",
            value: "10",
            description: "Limit number",
            active: true,
          },
          {
            key: "sortBy",
            value: "createdAt",
            description: "Sort by",
            active: true,
          },
          {
            key: "sortOrder",
            value: "desc",
            description: "Sort order",
            active: true,
          },
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "POST",
        url: `${basePath}/inviteLinkListView/count`,
        title: "Count",
        query: [
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {
          type: "json",
          content: {
            field: {
              //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
              operator: "eq",
              value: "string",
              //if operator is range, values: [min, max]
            },
          },
        },
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/inviteLinkListView/count`,
        title: "Count",
        query: [
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/inviteLinkListView/schema`,
        title: "Schema",
        query: [],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/inviteLinkListView/{id}`,
        title: "Get",
        query: [],
        body: {},
        parameters: [
          {
            key: "id",
            value: "string",
            description: "Id",
          },
        ],
        headers: [],
      },
    ],
  });

  config.dataObjects.push({
    name: "presetMealWithLines",
    description: "",
    reference: {
      tableName: "presetMealWithLines",
      properties: [],
    },
    endpoints: [
      {
        isAuth: false,
        method: "POST",
        url: `${basePath}/presetMealWithLines/list`,
        title: "List",
        query: [
          {
            key: "page",
            value: "1",
            description: "Page number",
            active: true,
          },
          {
            key: "limit",
            value: "10",
            description: "Limit number",
            active: true,
          },
          {
            key: "sortBy",
            value: "createdAt",
            description: "Sort by",
            active: true,
          },
          {
            key: "sortOrder",
            value: "desc",
            description: "Sort order",
            active: true,
          },
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {
          type: "json",
          content: {
            field: {
              //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
              operator: "eq",
              value: "string",
              //if operator is range, values: [min, max]
            },
          },
        },
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/presetMealWithLines/list`,
        title: "List",
        query: [
          {
            key: "page",
            value: "1",
            description: "Page number",
            active: true,
          },
          {
            key: "limit",
            value: "10",
            description: "Limit number",
            active: true,
          },
          {
            key: "sortBy",
            value: "createdAt",
            description: "Sort by",
            active: true,
          },
          {
            key: "sortOrder",
            value: "desc",
            description: "Sort order",
            active: true,
          },
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "POST",
        url: `${basePath}/presetMealWithLines/count`,
        title: "Count",
        query: [
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {
          type: "json",
          content: {
            field: {
              //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
              operator: "eq",
              value: "string",
              //if operator is range, values: [min, max]
            },
          },
        },
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/presetMealWithLines/count`,
        title: "Count",
        query: [
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/presetMealWithLines/schema`,
        title: "Schema",
        query: [],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/presetMealWithLines/{id}`,
        title: "Get",
        query: [],
        body: {},
        parameters: [
          {
            key: "id",
            value: "string",
            description: "Id",
          },
        ],
        headers: [],
      },
    ],
  });

  config.dataObjects.push({
    name: "foodItemList",
    description: "",
    reference: {
      tableName: "foodItemList",
      properties: [],
    },
    endpoints: [
      {
        isAuth: false,
        method: "POST",
        url: `${basePath}/foodItemList/list`,
        title: "List",
        query: [
          {
            key: "page",
            value: "1",
            description: "Page number",
            active: true,
          },
          {
            key: "limit",
            value: "10",
            description: "Limit number",
            active: true,
          },
          {
            key: "sortBy",
            value: "createdAt",
            description: "Sort by",
            active: true,
          },
          {
            key: "sortOrder",
            value: "desc",
            description: "Sort order",
            active: true,
          },
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {
          type: "json",
          content: {
            field: {
              //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
              operator: "eq",
              value: "string",
              //if operator is range, values: [min, max]
            },
          },
        },
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/foodItemList/list`,
        title: "List",
        query: [
          {
            key: "page",
            value: "1",
            description: "Page number",
            active: true,
          },
          {
            key: "limit",
            value: "10",
            description: "Limit number",
            active: true,
          },
          {
            key: "sortBy",
            value: "createdAt",
            description: "Sort by",
            active: true,
          },
          {
            key: "sortOrder",
            value: "desc",
            description: "Sort order",
            active: true,
          },
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "POST",
        url: `${basePath}/foodItemList/count`,
        title: "Count",
        query: [
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {
          type: "json",
          content: {
            field: {
              //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
              operator: "eq",
              value: "string",
              //if operator is range, values: [min, max]
            },
          },
        },
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/foodItemList/count`,
        title: "Count",
        query: [
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/foodItemList/schema`,
        title: "Schema",
        query: [],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/foodItemList/{id}`,
        title: "Get",
        query: [],
        body: {},
        parameters: [
          {
            key: "id",
            value: "string",
            description: "Id",
          },
        ],
        headers: [],
      },
    ],
  });

  config.dataObjects.push({
    name: "aiCandidateMealWithLines",
    description: "",
    reference: {
      tableName: "aiCandidateMealWithLines",
      properties: [],
    },
    endpoints: [
      {
        isAuth: false,
        method: "POST",
        url: `${basePath}/aiCandidateMealWithLines/list`,
        title: "List",
        query: [
          {
            key: "page",
            value: "1",
            description: "Page number",
            active: true,
          },
          {
            key: "limit",
            value: "10",
            description: "Limit number",
            active: true,
          },
          {
            key: "sortBy",
            value: "createdAt",
            description: "Sort by",
            active: true,
          },
          {
            key: "sortOrder",
            value: "desc",
            description: "Sort order",
            active: true,
          },
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {
          type: "json",
          content: {
            field: {
              //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
              operator: "eq",
              value: "string",
              //if operator is range, values: [min, max]
            },
          },
        },
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/aiCandidateMealWithLines/list`,
        title: "List",
        query: [
          {
            key: "page",
            value: "1",
            description: "Page number",
            active: true,
          },
          {
            key: "limit",
            value: "10",
            description: "Limit number",
            active: true,
          },
          {
            key: "sortBy",
            value: "createdAt",
            description: "Sort by",
            active: true,
          },
          {
            key: "sortOrder",
            value: "desc",
            description: "Sort order",
            active: true,
          },
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "POST",
        url: `${basePath}/aiCandidateMealWithLines/count`,
        title: "Count",
        query: [
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {
          type: "json",
          content: {
            field: {
              //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
              operator: "eq",
              value: "string",
              //if operator is range, values: [min, max]
            },
          },
        },
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/aiCandidateMealWithLines/count`,
        title: "Count",
        query: [
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/aiCandidateMealWithLines/schema`,
        title: "Schema",
        query: [],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/aiCandidateMealWithLines/{id}`,
        title: "Get",
        query: [],
        body: {},
        parameters: [
          {
            key: "id",
            value: "string",
            description: "Id",
          },
        ],
        headers: [],
      },
    ],
  });

  config.dataObjects.push({
    name: "mealLogWithLines",
    description: "",
    reference: {
      tableName: "mealLogWithLines",
      properties: [],
    },
    endpoints: [
      {
        isAuth: false,
        method: "POST",
        url: `${basePath}/mealLogWithLines/list`,
        title: "List",
        query: [
          {
            key: "page",
            value: "1",
            description: "Page number",
            active: true,
          },
          {
            key: "limit",
            value: "10",
            description: "Limit number",
            active: true,
          },
          {
            key: "sortBy",
            value: "createdAt",
            description: "Sort by",
            active: true,
          },
          {
            key: "sortOrder",
            value: "desc",
            description: "Sort order",
            active: true,
          },
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {
          type: "json",
          content: {
            field: {
              //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
              operator: "eq",
              value: "string",
              //if operator is range, values: [min, max]
            },
          },
        },
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/mealLogWithLines/list`,
        title: "List",
        query: [
          {
            key: "page",
            value: "1",
            description: "Page number",
            active: true,
          },
          {
            key: "limit",
            value: "10",
            description: "Limit number",
            active: true,
          },
          {
            key: "sortBy",
            value: "createdAt",
            description: "Sort by",
            active: true,
          },
          {
            key: "sortOrder",
            value: "desc",
            description: "Sort order",
            active: true,
          },
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "POST",
        url: `${basePath}/mealLogWithLines/count`,
        title: "Count",
        query: [
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {
          type: "json",
          content: {
            field: {
              //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
              operator: "eq",
              value: "string",
              //if operator is range, values: [min, max]
            },
          },
        },
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/mealLogWithLines/count`,
        title: "Count",
        query: [
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/mealLogWithLines/schema`,
        title: "Schema",
        query: [],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/mealLogWithLines/{id}`,
        title: "Get",
        query: [],
        body: {},
        parameters: [
          {
            key: "id",
            value: "string",
            description: "Id",
          },
        ],
        headers: [],
      },
    ],
  });

  config.dataObjects.push({
    name: "aiSessionHistory",
    description: "",
    reference: {
      tableName: "aiSessionHistory",
      properties: [],
    },
    endpoints: [
      {
        isAuth: false,
        method: "POST",
        url: `${basePath}/aiSessionHistory/list`,
        title: "List",
        query: [
          {
            key: "page",
            value: "1",
            description: "Page number",
            active: true,
          },
          {
            key: "limit",
            value: "10",
            description: "Limit number",
            active: true,
          },
          {
            key: "sortBy",
            value: "createdAt",
            description: "Sort by",
            active: true,
          },
          {
            key: "sortOrder",
            value: "desc",
            description: "Sort order",
            active: true,
          },
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {
          type: "json",
          content: {
            field: {
              //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
              operator: "eq",
              value: "string",
              //if operator is range, values: [min, max]
            },
          },
        },
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/aiSessionHistory/list`,
        title: "List",
        query: [
          {
            key: "page",
            value: "1",
            description: "Page number",
            active: true,
          },
          {
            key: "limit",
            value: "10",
            description: "Limit number",
            active: true,
          },
          {
            key: "sortBy",
            value: "createdAt",
            description: "Sort by",
            active: true,
          },
          {
            key: "sortOrder",
            value: "desc",
            description: "Sort order",
            active: true,
          },
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "POST",
        url: `${basePath}/aiSessionHistory/count`,
        title: "Count",
        query: [
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {
          type: "json",
          content: {
            field: {
              //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
              operator: "eq",
              value: "string",
              //if operator is range, values: [min, max]
            },
          },
        },
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/aiSessionHistory/count`,
        title: "Count",
        query: [
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/aiSessionHistory/schema`,
        title: "Schema",
        query: [],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/aiSessionHistory/{id}`,
        title: "Get",
        query: [],
        body: {},
        parameters: [
          {
            key: "id",
            value: "string",
            description: "Id",
          },
        ],
        headers: [],
      },
    ],
  });

  config.dataObjects.push({
    name: "dailyProgressView",
    description: "",
    reference: {
      tableName: "dailyProgressView",
      properties: [],
    },
    endpoints: [
      {
        isAuth: false,
        method: "POST",
        url: `${basePath}/dailyProgressView/list`,
        title: "List",
        query: [
          {
            key: "page",
            value: "1",
            description: "Page number",
            active: true,
          },
          {
            key: "limit",
            value: "10",
            description: "Limit number",
            active: true,
          },
          {
            key: "sortBy",
            value: "createdAt",
            description: "Sort by",
            active: true,
          },
          {
            key: "sortOrder",
            value: "desc",
            description: "Sort order",
            active: true,
          },
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {
          type: "json",
          content: {
            field: {
              //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
              operator: "eq",
              value: "string",
              //if operator is range, values: [min, max]
            },
          },
        },
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/dailyProgressView/list`,
        title: "List",
        query: [
          {
            key: "page",
            value: "1",
            description: "Page number",
            active: true,
          },
          {
            key: "limit",
            value: "10",
            description: "Limit number",
            active: true,
          },
          {
            key: "sortBy",
            value: "createdAt",
            description: "Sort by",
            active: true,
          },
          {
            key: "sortOrder",
            value: "desc",
            description: "Sort order",
            active: true,
          },
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "POST",
        url: `${basePath}/dailyProgressView/count`,
        title: "Count",
        query: [
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {
          type: "json",
          content: {
            field: {
              //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
              operator: "eq",
              value: "string",
              //if operator is range, values: [min, max]
            },
          },
        },
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/dailyProgressView/count`,
        title: "Count",
        query: [
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/dailyProgressView/schema`,
        title: "Schema",
        query: [],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/dailyProgressView/{id}`,
        title: "Get",
        query: [],
        body: {},
        parameters: [
          {
            key: "id",
            value: "string",
            description: "Id",
          },
        ],
        headers: [],
      },
    ],
  });

  config.dataObjects.push({
    name: "weeklyAnalyticsView",
    description: "",
    reference: {
      tableName: "weeklyAnalyticsView",
      properties: [],
    },
    endpoints: [
      {
        isAuth: false,
        method: "POST",
        url: `${basePath}/weeklyAnalyticsView/list`,
        title: "List",
        query: [
          {
            key: "page",
            value: "1",
            description: "Page number",
            active: true,
          },
          {
            key: "limit",
            value: "10",
            description: "Limit number",
            active: true,
          },
          {
            key: "sortBy",
            value: "createdAt",
            description: "Sort by",
            active: true,
          },
          {
            key: "sortOrder",
            value: "desc",
            description: "Sort order",
            active: true,
          },
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {
          type: "json",
          content: {
            field: {
              //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
              operator: "eq",
              value: "string",
              //if operator is range, values: [min, max]
            },
          },
        },
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/weeklyAnalyticsView/list`,
        title: "List",
        query: [
          {
            key: "page",
            value: "1",
            description: "Page number",
            active: true,
          },
          {
            key: "limit",
            value: "10",
            description: "Limit number",
            active: true,
          },
          {
            key: "sortBy",
            value: "createdAt",
            description: "Sort by",
            active: true,
          },
          {
            key: "sortOrder",
            value: "desc",
            description: "Sort order",
            active: true,
          },
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "POST",
        url: `${basePath}/weeklyAnalyticsView/count`,
        title: "Count",
        query: [
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {
          type: "json",
          content: {
            field: {
              //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
              operator: "eq",
              value: "string",
              //if operator is range, values: [min, max]
            },
          },
        },
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/weeklyAnalyticsView/count`,
        title: "Count",
        query: [
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/weeklyAnalyticsView/schema`,
        title: "Schema",
        query: [],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/weeklyAnalyticsView/{id}`,
        title: "Get",
        query: [],
        body: {},
        parameters: [
          {
            key: "id",
            value: "string",
            description: "Id",
          },
        ],
        headers: [],
      },
    ],
  });

  config.dataObjects.push({
    name: "monthlyAnalyticsView",
    description: "",
    reference: {
      tableName: "monthlyAnalyticsView",
      properties: [],
    },
    endpoints: [
      {
        isAuth: false,
        method: "POST",
        url: `${basePath}/monthlyAnalyticsView/list`,
        title: "List",
        query: [
          {
            key: "page",
            value: "1",
            description: "Page number",
            active: true,
          },
          {
            key: "limit",
            value: "10",
            description: "Limit number",
            active: true,
          },
          {
            key: "sortBy",
            value: "createdAt",
            description: "Sort by",
            active: true,
          },
          {
            key: "sortOrder",
            value: "desc",
            description: "Sort order",
            active: true,
          },
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {
          type: "json",
          content: {
            field: {
              //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
              operator: "eq",
              value: "string",
              //if operator is range, values: [min, max]
            },
          },
        },
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/monthlyAnalyticsView/list`,
        title: "List",
        query: [
          {
            key: "page",
            value: "1",
            description: "Page number",
            active: true,
          },
          {
            key: "limit",
            value: "10",
            description: "Limit number",
            active: true,
          },
          {
            key: "sortBy",
            value: "createdAt",
            description: "Sort by",
            active: true,
          },
          {
            key: "sortOrder",
            value: "desc",
            description: "Sort order",
            active: true,
          },
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "POST",
        url: `${basePath}/monthlyAnalyticsView/count`,
        title: "Count",
        query: [
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {
          type: "json",
          content: {
            field: {
              //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
              operator: "eq",
              value: "string",
              //if operator is range, values: [min, max]
            },
          },
        },
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/monthlyAnalyticsView/count`,
        title: "Count",
        query: [
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/monthlyAnalyticsView/schema`,
        title: "Schema",
        query: [],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/monthlyAnalyticsView/{id}`,
        title: "Get",
        query: [],
        body: {},
        parameters: [
          {
            key: "id",
            value: "string",
            description: "Id",
          },
        ],
        headers: [],
      },
    ],
  });

  config.dataObjects.push({
    name: "dailyNutritionSummaryNotificationView",
    description: "",
    reference: {
      tableName: "dailyNutritionSummaryNotificationView",
      properties: [],
    },
    endpoints: [
      {
        isAuth: false,
        method: "POST",
        url: `${basePath}/dailyNutritionSummaryNotificationView/list`,
        title: "List",
        query: [
          {
            key: "page",
            value: "1",
            description: "Page number",
            active: true,
          },
          {
            key: "limit",
            value: "10",
            description: "Limit number",
            active: true,
          },
          {
            key: "sortBy",
            value: "createdAt",
            description: "Sort by",
            active: true,
          },
          {
            key: "sortOrder",
            value: "desc",
            description: "Sort order",
            active: true,
          },
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {
          type: "json",
          content: {
            field: {
              //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
              operator: "eq",
              value: "string",
              //if operator is range, values: [min, max]
            },
          },
        },
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/dailyNutritionSummaryNotificationView/list`,
        title: "List",
        query: [
          {
            key: "page",
            value: "1",
            description: "Page number",
            active: true,
          },
          {
            key: "limit",
            value: "10",
            description: "Limit number",
            active: true,
          },
          {
            key: "sortBy",
            value: "createdAt",
            description: "Sort by",
            active: true,
          },
          {
            key: "sortOrder",
            value: "desc",
            description: "Sort order",
            active: true,
          },
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "POST",
        url: `${basePath}/dailyNutritionSummaryNotificationView/count`,
        title: "Count",
        query: [
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {
          type: "json",
          content: {
            field: {
              //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
              operator: "eq",
              value: "string",
              //if operator is range, values: [min, max]
            },
          },
        },
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/dailyNutritionSummaryNotificationView/count`,
        title: "Count",
        query: [
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/dailyNutritionSummaryNotificationView/schema`,
        title: "Schema",
        query: [],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/dailyNutritionSummaryNotificationView/{id}`,
        title: "Get",
        query: [],
        body: {},
        parameters: [
          {
            key: "id",
            value: "string",
            description: "Id",
          },
        ],
        headers: [],
      },
    ],
  });

  config.dataObjects.push({
    name: "dailyMealReminderNotificationView",
    description: "",
    reference: {
      tableName: "dailyMealReminderNotificationView",
      properties: [],
    },
    endpoints: [
      {
        isAuth: false,
        method: "POST",
        url: `${basePath}/dailyMealReminderNotificationView/list`,
        title: "List",
        query: [
          {
            key: "page",
            value: "1",
            description: "Page number",
            active: true,
          },
          {
            key: "limit",
            value: "10",
            description: "Limit number",
            active: true,
          },
          {
            key: "sortBy",
            value: "createdAt",
            description: "Sort by",
            active: true,
          },
          {
            key: "sortOrder",
            value: "desc",
            description: "Sort order",
            active: true,
          },
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {
          type: "json",
          content: {
            field: {
              //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
              operator: "eq",
              value: "string",
              //if operator is range, values: [min, max]
            },
          },
        },
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/dailyMealReminderNotificationView/list`,
        title: "List",
        query: [
          {
            key: "page",
            value: "1",
            description: "Page number",
            active: true,
          },
          {
            key: "limit",
            value: "10",
            description: "Limit number",
            active: true,
          },
          {
            key: "sortBy",
            value: "createdAt",
            description: "Sort by",
            active: true,
          },
          {
            key: "sortOrder",
            value: "desc",
            description: "Sort order",
            active: true,
          },
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "POST",
        url: `${basePath}/dailyMealReminderNotificationView/count`,
        title: "Count",
        query: [
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {
          type: "json",
          content: {
            field: {
              //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
              operator: "eq",
              value: "string",
              //if operator is range, values: [min, max]
            },
          },
        },
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/dailyMealReminderNotificationView/count`,
        title: "Count",
        query: [
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/dailyMealReminderNotificationView/schema`,
        title: "Schema",
        query: [],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: `${basePath}/dailyMealReminderNotificationView/{id}`,
        title: "Get",
        query: [],
        body: {},
        parameters: [
          {
            key: "id",
            value: "string",
            description: "Id",
          },
        ],
        headers: [],
      },
    ],
  });

  inject(app, config);
};
