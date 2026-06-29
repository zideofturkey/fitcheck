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
    name: "fitcheck - nutritionLibrary",
    brand: {
      name: "fitcheck",
      image: "https://minioapi.masaupp.com/mindbricks/favico.ico",
      moduleName: "nutritionLibrary",
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
        name: "MacroTarget",
        description:
          "Stores the authenticated user&#39;s six daily macro targets (calories, protein, carbohydrates, fat, sugar, fiber). Each user has one active target record; updating replaces the effective values.",
        reference: {
          tableName: "macroTarget",
          properties: [
            {
              name: "userId",
              type: "ID",
            },

            {
              name: "calorieTarget",
              type: "Double",
            },

            {
              name: "proteinTarget",
              type: "Double",
            },

            {
              name: "carbohydrateTarget",
              type: "Double",
            },

            {
              name: "fatTarget",
              type: "Double",
            },

            {
              name: "sugarTarget",
              type: "Double",
            },

            {
              name: "fiberTarget",
              type: "Double",
            },

            {
              name: "effectiveFrom",
              type: "Date",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "POST",
            url: `${basePath}/v1/macro-targets`,
            title: "Set Macrotarget",
            query: [],

            body: {
              type: "json",
              content: {
                calorieTarget: "Double",
                proteinTarget: "Double",
                carbohydrateTarget: "Double",
                fatTarget: "Double",
                sugarTarget: "Double",
                fiberTarget: "Double",
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/macro-targets/me`,
            title: "Get Mymacrotarget",
            query: [],

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/macro-targets/me/for-logging`,
            title: "Get Mymacrotargetforlogging",
            query: [],

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/_fetchlistmacrotarget`,
            title: "_fetch Listmacrotarget",
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
        name: "FoodItem",
        description:
          "A private, reusable food definition in the user&#39;s personal food library. Stores per-100g nutrition values. Editable at any time without affecting historical meal log snapshots.",
        reference: {
          tableName: "foodItem",
          properties: [
            {
              name: "userId",
              type: "ID",
            },

            {
              name: "foodName",
              type: "String",
            },

            {
              name: "caloriePer100g",
              type: "Double",
            },

            {
              name: "proteinPer100g",
              type: "Double",
            },

            {
              name: "carbohydratePer100g",
              type: "Double",
            },

            {
              name: "fatPer100g",
              type: "Double",
            },

            {
              name: "sugarPer100g",
              type: "Double",
            },

            {
              name: "fiberPer100g",
              type: "Double",
            },

            {
              name: "brandName",
              type: "String",
            },

            {
              name: "foodCategory",
              type: "String",
            },

            {
              name: "creationSource",
              type: "Enum",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "POST",
            url: `${basePath}/v1/food-items`,
            title: "Create Fooditem",
            query: [],

            body: {
              type: "json",
              content: {
                foodName: "String",
                caloriePer100g: "Double",
                proteinPer100g: "Double",
                carbohydratePer100g: "Double",
                fatPer100g: "Double",
                sugarPer100g: "Double",
                fiberPer100g: "Double",
                brandName: "String",
                foodCategory: "String",
                creationSource: "Enum",
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/food-items/{foodItemId}`,
            title: "Get Fooditem",
            query: [],

            parameters: [
              {
                key: "foodItemId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/food-items`,
            title: "List Fooditems",
            query: [
              {
                key: "searchTerm",
                value: "",
                description: "Optional partial match on foodName",
              },
              {
                key: "foodCategory",
                value: "",
                description: "",
              },
              {
                key: "creationSource",
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
            url: `${basePath}/v1/food-items/{foodItemId}`,
            title: "Update Fooditem",
            query: [],

            body: {
              type: "json",
              content: {
                foodName: "String",
                caloriePer100g: "Double",
                proteinPer100g: "Double",
                carbohydratePer100g: "Double",
                fatPer100g: "Double",
                sugarPer100g: "Double",
                fiberPer100g: "Double",
                brandName: "String",
                foodCategory: "String",
              },
            },

            parameters: [
              {
                key: "foodItemId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "DELETE",
            url: `${basePath}/v1/food-items/{foodItemId}`,
            title: "Delete Fooditem",
            query: [],

            body: {
              type: "json",
              content: {},
            },

            parameters: [
              {
                key: "foodItemId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/food-items/{foodItemId}/for-logging`,
            title: "Get Fooditemforlogging",
            query: [],

            parameters: [
              {
                key: "foodItemId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/_fetchlistfooditem`,
            title: "_fetch Listfooditem",
            query: [
              {
                key: "foodCategory",
                value: "",
                description: "",
              },
              {
                key: "creationSource",
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
        name: "PresetMeal",
        description:
          "A reusable preset meal template owned by a user. Stores auto-calculated aggregate nutrition totals derived from its constituent preset lines. Mutations during meal logging must never affect this record.",
        reference: {
          tableName: "presetMeal",
          properties: [
            {
              name: "userId",
              type: "ID",
            },

            {
              name: "templateName",
              type: "String",
            },

            {
              name: "descriptionText",
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
            url: `${basePath}/v1/preset-meals`,
            title: "Create Presetmeal",
            query: [],

            body: {
              type: "json",
              content: {
                templateName: "String",
                descriptionText: "String",
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/preset-meals/{presetMealId}`,
            title: "Get Presetmeal",
            query: [],

            parameters: [
              {
                key: "presetMealId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/preset-meals`,
            title: "List Presetmeals",
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
            method: "PATCH",
            url: `${basePath}/v1/preset-meals/{presetMealId}`,
            title: "Update Presetmeal",
            query: [],

            body: {
              type: "json",
              content: {
                templateName: "String",
                descriptionText: "String",
              },
            },

            parameters: [
              {
                key: "presetMealId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "DELETE",
            url: `${basePath}/v1/preset-meals/{presetMealId}`,
            title: "Delete Presetmeal",
            query: [],

            body: {
              type: "json",
              content: {},
            },

            parameters: [
              {
                key: "presetMealId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/preset-meals/{presetMealId}/for-logging`,
            title: "Get Presetmealforlogging",
            query: [],

            parameters: [
              {
                key: "presetMealId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/_fetchlistpresetmeal`,
            title: "_fetch Listpresetmeal",
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
        name: "PresetLine",
        description:
          "A single food item entry within a preset meal template. Stores a gram amount and snapshot nutrition values calculated at line creation. Lines are created or deleted to modify a preset; individual lines are not edited (replace pattern).",
        reference: {
          tableName: "presetLine",
          properties: [
            {
              name: "presetMealId",
              type: "ID",
            },

            {
              name: "foodItemId",
              type: "ID",
            },

            {
              name: "lineFoodName",
              type: "String",
            },

            {
              name: "gramAmount",
              type: "Double",
            },

            {
              name: "lineCalories",
              type: "Double",
            },

            {
              name: "lineProtein",
              type: "Double",
            },

            {
              name: "lineCarbohydrates",
              type: "Double",
            },

            {
              name: "lineFat",
              type: "Double",
            },

            {
              name: "lineSugar",
              type: "Double",
            },

            {
              name: "lineFiber",
              type: "Double",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "POST",
            url: `${basePath}/v1/preset-meals/{presetMealId}/lines`,
            title: "Add Presetline",
            query: [],

            body: {
              type: "json",
              content: {
                foodItemId: "ID",
                gramAmount: "Double",
              },
            },

            parameters: [
              {
                key: "presetMealId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/preset-meals/{presetMealId}/lines`,
            title: "List Presetlines",
            query: [],

            body: {
              type: "json",
              content: {},
            },

            parameters: [
              {
                key: "presetMealId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "DELETE",
            url: `${basePath}/v1/preset-meals/{presetMealId}/lines/{presetLineId}`,
            title: "Delete Presetline",
            query: [],

            body: {
              type: "json",
              content: {},
            },

            parameters: [
              {
                key: "presetLineId",
                value: "",
                description: "",
              },
              {
                key: "presetMealId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/_fetchlistpresetline`,
            title: "_fetch Listpresetline",
            query: [
              {
                key: "presetMealId",
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
