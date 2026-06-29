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
    name: "fitcheck - mealTracker",
    brand: {
      name: "fitcheck",
      image: "https://minioapi.masaupp.com/mindbricks/favico.ico",
      moduleName: "mealTracker",
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
        name: "MealLog",
        description:
          "A single meal entry for a user on a given date and time, tagged with a slot name and source, storing meal-level nutrition totals.",
        reference: {
          tableName: "mealLog",
          properties: [
            {
              name: "userId",
              type: "ID",
            },

            {
              name: "mealDate",
              type: "Date",
            },

            {
              name: "mealTime",
              type: "String",
            },

            {
              name: "slotName",
              type: "String",
            },

            {
              name: "logSource",
              type: "Enum",
            },

            {
              name: "noteText",
              type: "String",
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
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "POST",
            url: `${basePath}/v1/meal-logs`,
            title: "Create Meallog",
            query: [],

            body: {
              type: "json",
              content: {
                mealDate: "Date",
                mealTime: "String",
                slotName: "String",
                logSource: "Enum",
                noteText: "String",
                totalCalories: "Double",
                totalProtein: "Double",
                totalCarbohydrates: "Double",
                totalFat: "Double",
                totalSugar: "Double",
                totalFiber: "Double",
                lines: ["Object"],
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/meal-logs/{mealLogId}`,
            title: "Get Meallog",
            query: [],

            parameters: [
              {
                key: "mealLogId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/meal-logs`,
            title: "List Meallogs",
            query: [
              {
                key: "fromDate",
                value: "",
                description: "Optional range start for multi-day queries",
              },
              {
                key: "toDate",
                value: "",
                description: "Optional range end for multi-day queries",
              },
              {
                key: "mealDate",
                value: "",
                description: "",
              },
              {
                key: "logSource",
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
            url: `${basePath}/v1/meal-logs/{mealLogId}`,
            title: "Update Meallog",
            query: [],

            body: {
              type: "json",
              content: {
                mealTime: "String",
                slotName: "String",
                noteText: "String",
                totalCalories: "Double",
                totalProtein: "Double",
                totalCarbohydrates: "Double",
                totalFat: "Double",
                totalSugar: "Double",
                totalFiber: "Double",
              },
            },

            parameters: [
              {
                key: "mealLogId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "DELETE",
            url: `${basePath}/v1/meal-logs/{mealLogId}`,
            title: "Delete Meallog",
            query: [],

            body: {
              type: "json",
              content: {},
            },

            parameters: [
              {
                key: "mealLogId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/_fetchlistmeallog`,
            title: "_fetch Listmeallog",
            query: [
              {
                key: "mealDate",
                value: "",
                description: "",
              },
              {
                key: "logSource",
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
        name: "MealLine",
        description:
          "An individual food item within a meal log, storing the consumed gram amount and snapshot nutrition values calculated at log time — immutable with respect to food library changes.",
        reference: {
          tableName: "mealLine",
          properties: [
            {
              name: "userId",
              type: "ID",
            },

            {
              name: "mealLogId",
              type: "ID",
            },

            {
              name: "sourceFoodItemId",
              type: "ID",
            },

            {
              name: "sourcePresetMealId",
              type: "ID",
            },

            {
              name: "itemName",
              type: "String",
            },

            {
              name: "consumedGrams",
              type: "Double",
            },

            {
              name: "itemCalories",
              type: "Double",
            },

            {
              name: "itemProtein",
              type: "Double",
            },

            {
              name: "itemCarbohydrates",
              type: "Double",
            },

            {
              name: "itemFat",
              type: "Double",
            },

            {
              name: "itemSugar",
              type: "Double",
            },

            {
              name: "itemFiber",
              type: "Double",
            },

            {
              name: "lineSource",
              type: "Enum",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "POST",
            url: `${basePath}/v1/meal-lines`,
            title: "Create Mealline",
            query: [],

            body: {
              type: "json",
              content: {
                mealLogId: "ID",
                itemName: "String",
                consumedGrams: "Double",
                itemCalories: "Double",
                itemProtein: "Double",
                itemCarbohydrates: "Double",
                itemFat: "Double",
                itemSugar: "Double",
                itemFiber: "Double",
                lineSource: "Enum",
                sourceFoodItemId: "ID",
                sourcePresetMealId: "ID",
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "PATCH",
            url: `${basePath}/v1/meal-lines/{mealLineId}`,
            title: "Update Mealline",
            query: [],

            body: {
              type: "json",
              content: {
                itemName: "String",
                consumedGrams: "Double",
                itemCalories: "Double",
                itemProtein: "Double",
                itemCarbohydrates: "Double",
                itemFat: "Double",
                itemSugar: "Double",
                itemFiber: "Double",
              },
            },

            parameters: [
              {
                key: "mealLineId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "DELETE",
            url: `${basePath}/v1/meal-lines/{mealLineId}`,
            title: "Delete Mealline",
            query: [],

            body: {
              type: "json",
              content: {},
            },

            parameters: [
              {
                key: "mealLineId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/meal-lines`,
            title: "List Meallines",
            query: [
              {
                key: "mealLogId",
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
            url: `${basePath}/v1/_fetchlistmealline`,
            title: "_fetch Listmealline",
            query: [
              {
                key: "mealLogId",
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
        name: "NutritionDay",
        description:
          "A daily rollup record per user storing consumed totals for all six macros alongside the target values active on that day, plus exceeded metric flags and meal count. Created/updated whenever meals are logged or edited.",
        reference: {
          tableName: "nutritionDay",
          properties: [
            {
              name: "userId",
              type: "ID",
            },

            {
              name: "summaryDate",
              type: "Date",
            },

            {
              name: "consumedCalories",
              type: "Double",
            },

            {
              name: "consumedProtein",
              type: "Double",
            },

            {
              name: "consumedCarbohydrates",
              type: "Double",
            },

            {
              name: "consumedFat",
              type: "Double",
            },

            {
              name: "consumedSugar",
              type: "Double",
            },

            {
              name: "consumedFiber",
              type: "Double",
            },

            {
              name: "targetCalories",
              type: "Double",
            },

            {
              name: "targetProtein",
              type: "Double",
            },

            {
              name: "targetCarbohydrates",
              type: "Double",
            },

            {
              name: "targetFat",
              type: "Double",
            },

            {
              name: "targetSugar",
              type: "Double",
            },

            {
              name: "targetFiber",
              type: "Double",
            },

            {
              name: "exceededMetrics",
              type: "String",
            },

            {
              name: "mealCount",
              type: "Integer",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/nutrition-days/daily-progress`,
            title: "Get Dailyprogress",
            query: [
              {
                key: "targetDate",
                value: "",
                description:
                  "The day to retrieve progress for; defaults to today",
              },
            ],

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/nutrition-days/{nutritionDayId}`,
            title: "Get Nutritionday",
            query: [],

            parameters: [
              {
                key: "nutritionDayId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/nutrition-days`,
            title: "List Nutritiondays",
            query: [
              {
                key: "fromDate",
                value: "",
                description: "Range start",
              },
              {
                key: "toDate",
                value: "",
                description: "Range end",
              },
              {
                key: "summaryDate",
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
            url: `${basePath}/v1/analytics/weekly`,
            title: "Get Weeklyanalytics",
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
            method: "GET",
            url: `${basePath}/v1/analytics/monthly`,
            title: "Get Monthlyanalytics",
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
            url: `${basePath}/v1/scheduled/daily-reminder-check`,
            title: "Trigger Dailyremindercheck",
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
            url: `${basePath}/v1/scheduled/daily-summary`,
            title: "Trigger Dailysummary",
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
            method: "GET",
            url: `${basePath}/v1/_fetchlistnutritionday`,
            title: "_fetch Listnutritionday",
            query: [
              {
                key: "summaryDate",
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
