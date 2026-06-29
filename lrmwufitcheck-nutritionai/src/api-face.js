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
    name: "fitcheck - nutritionAi",
    brand: {
      name: "fitcheck",
      image: "https://minioapi.masaupp.com/mindbricks/favico.ico",
      moduleName: "nutritionAi",
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
        name: "AiSession",
        description:
          "Records every AI interaction initiated by a user — either a meal-parsing request or a nutrition guidance question — capturing the raw input, detected language, processing state, and final localized response.",
        reference: {
          tableName: "aiSession",
          properties: [
            {
              name: "userId",
              type: "ID",
            },

            {
              name: "sessionType",
              type: "Enum",
            },

            {
              name: "inputText",
              type: "Text",
            },

            {
              name: "detectedLanguage",
              type: "String",
            },

            {
              name: "sessionState",
              type: "Enum",
            },

            {
              name: "confidenceScore",
              type: "Double",
            },

            {
              name: "finalResponseText",
              type: "Text",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "POST",
            url: `${basePath}/v1/ai-sessions/parse-meal`,
            title: "Parse Meal",
            query: [],

            body: {
              type: "json",
              content: {
                inputText: "Text",
                proposedMealDate: "Date",
                proposedMealTime: "String",
                proposedSlotName: "String",
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "POST",
            url: `${basePath}/v1/ai-sessions/ask`,
            title: "Ask Nutritionquestion",
            query: [],

            body: {
              type: "json",
              content: {
                inputText: "Text",
                contextRange: "String",
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/ai-sessions/{aiSessionId}`,
            title: "Get Aisession",
            query: [],

            parameters: [
              {
                key: "aiSessionId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/ai-sessions`,
            title: "List Aisessions",
            query: [
              {
                key: "userId",
                value: "",
                description: "",
              },
              {
                key: "sessionType",
                value: "",
                description: "",
              },
              {
                key: "sessionState",
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
            url: `${basePath}/v1/_fetchlistaisession`,
            title: "_fetch Listaisession",
            query: [
              {
                key: "userId",
                value: "",
                description: "",
              },
              {
                key: "sessionType",
                value: "",
                description: "",
              },
              {
                key: "sessionState",
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
        name: "AiCandidateMeal",
        description:
          "Stores the structured meal proposal produced by AI parsing of a user&#39;s natural-language input — holds proposed slot, date, nutrition totals, warning flags, and a confirmation status before the meal is committed to mealTracker.",
        reference: {
          tableName: "aiCandidateMeal",
          properties: [
            {
              name: "userId",
              type: "ID",
            },

            {
              name: "aiSessionId",
              type: "ID",
            },

            {
              name: "proposedMealDate",
              type: "Date",
            },

            {
              name: "proposedMealTime",
              type: "String",
            },

            {
              name: "proposedSlotName",
              type: "String",
            },

            {
              name: "candidateSource",
              type: "Enum",
            },

            {
              name: "warningText",
              type: "Text",
            },

            {
              name: "confirmationRequired",
              type: "Boolean",
            },

            {
              name: "isConfirmed",
              type: "Boolean",
            },

            {
              name: "isCommitted",
              type: "Boolean",
            },

            {
              name: "totalCalories",
              type: "Double",
            },

            {
              name: "totalProtein",
              type: "Double",
            },

            {
              name: "totalCarbohydrates",
              type: "Double",
            },

            {
              name: "totalFat",
              type: "Double",
            },

            {
              name: "totalSugar",
              type: "Double",
            },

            {
              name: "totalFiber",
              type: "Double",
            },

            {
              name: "committedMealLogId",
              type: "ID",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "PATCH",
            url: `${basePath}/v1/ai-candidate-meals/{aiCandidateMealId}/confirm`,
            title: "Confirm Candidatemeal",
            query: [],

            body: {
              type: "json",
              content: {
                proposedMealDate: "Date",
                proposedMealTime: "String",
                proposedSlotName: "String",
                lineAdjustments: ["Object"],
              },
            },

            parameters: [
              {
                key: "aiCandidateMealId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/ai-candidate-meals/{aiCandidateMealId}`,
            title: "Get Aicandidatemeal",
            query: [],

            parameters: [
              {
                key: "aiCandidateMealId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/ai-candidate-meals`,
            title: "List Aicandidatemeals",
            query: [
              {
                key: "userId",
                value: "",
                description: "",
              },
              {
                key: "aiSessionId",
                value: "",
                description: "",
              },
              {
                key: "isConfirmed",
                value: "",
                description: "",
              },
              {
                key: "isCommitted",
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
            method: "PATCH",
            url: `${basePath}/v1/ai-candidate-meals/{aiCandidateMealId}/reject`,
            title: "Reject Candidatemeal",
            query: [],

            body: {
              type: "json",
              content: {},
            },

            parameters: [
              {
                key: "aiCandidateMealId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/_fetchlistaicandidatemeal`,
            title: "_fetch Listaicandidatemeal",
            query: [
              {
                key: "userId",
                value: "",
                description: "",
              },
              {
                key: "aiSessionId",
                value: "",
                description: "",
              },
              {
                key: "isConfirmed",
                value: "",
                description: "",
              },
              {
                key: "isCommitted",
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
        name: "AiCandidateLine",
        description:
          "Represents a single food item detected within an AI candidate meal — stores AI-estimated gram amounts and nutrition values as a snapshot, along with confidence, reference source, and user&#39;s choice to save the food to their library.",
        reference: {
          tableName: "aiCandidateLine",
          properties: [
            {
              name: "userId",
              type: "ID",
            },

            {
              name: "aiCandidateMealId",
              type: "ID",
            },

            {
              name: "detectedFoodName",
              type: "String",
            },

            {
              name: "estimatedGrams",
              type: "Double",
            },

            {
              name: "estimatedCalories",
              type: "Double",
            },

            {
              name: "estimatedProtein",
              type: "Double",
            },

            {
              name: "estimatedCarbohydrates",
              type: "Double",
            },

            {
              name: "estimatedFat",
              type: "Double",
            },

            {
              name: "estimatedSugar",
              type: "Double",
            },

            {
              name: "estimatedFiber",
              type: "Double",
            },

            {
              name: "quantityConfidence",
              type: "Double",
            },

            {
              name: "nutritionReference",
              type: "String",
            },

            {
              name: "saveAsFood",
              type: "Boolean",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "PATCH",
            url: `${basePath}/v1/ai-candidate-lines/{aiCandidateLineId}`,
            title: "Update Aicandidateline",
            query: [],

            body: {
              type: "json",
              content: {
                estimatedGrams: "Double",
                saveAsFood: "Boolean",
                detectedFoodName: "String",
              },
            },

            parameters: [
              {
                key: "aiCandidateLineId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/_fetchlistaicandidateline`,
            title: "_fetch Listaicandidateline",
            query: [
              {
                key: "userId",
                value: "",
                description: "",
              },
              {
                key: "aiCandidateMealId",
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
        name: "AiGuidanceNote",
        description:
          "Persists the structured outcome of a nutrition guidance Q&amp;A interaction — stores question classification, time range context, the summarized answer, rationale, referenced metrics, and any caution text, linked to the parent aiSession.",
        reference: {
          tableName: "aiGuidanceNote",
          properties: [
            {
              name: "userId",
              type: "ID",
            },

            {
              name: "aiSessionId",
              type: "ID",
            },

            {
              name: "questionType",
              type: "String",
            },

            {
              name: "contextRange",
              type: "String",
            },

            {
              name: "answerSummary",
              type: "Text",
            },

            {
              name: "rationaleText",
              type: "Text",
            },

            {
              name: "referencedMetricKeys",
              type: "String",
            },

            {
              name: "cautionText",
              type: "Text",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/ai-guidance-notes/{aiGuidanceNoteId}`,
            title: "Get Aiguidancenote",
            query: [],

            parameters: [
              {
                key: "aiGuidanceNoteId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/ai-guidance-notes`,
            title: "List Aiguidancenotes",
            query: [
              {
                key: "userId",
                value: "",
                description: "",
              },
              {
                key: "questionType",
                value: "",
                description: "",
              },
              {
                key: "contextRange",
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
            url: `${basePath}/v1/_fetchlistaiguidancenote`,
            title: "_fetch Listaiguidancenote",
            query: [
              {
                key: "userId",
                value: "",
                description: "",
              },
              {
                key: "questionType",
                value: "",
                description: "",
              },
              {
                key: "contextRange",
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
