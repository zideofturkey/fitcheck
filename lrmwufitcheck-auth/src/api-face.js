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
    name: "fitcheck - auth",
    brand: {
      name: "fitcheck",
      image: "https://minioapi.masaupp.com/mindbricks/favico.ico",
      moduleName: "auth",
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
            url: `${basePath}/getusersessions`,
            title: "Get User Acive Sessions",
            query: [],
            headers: [],
          },
          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/getuserhistory`,
            title: "Get User Location History",
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
        name: "User",
        description:
          "A data object that stores the user information and handles login settings.",
        reference: {
          tableName: "user",
          properties: [
            {
              name: "email",
              type: "String",
            },

            {
              name: "password",
              type: "String",
            },

            {
              name: "fullname",
              type: "String",
            },

            {
              name: "avatar",
              type: "String",
            },

            {
              name: "roleId",
              type: "String",
            },

            {
              name: "emailVerified",
              type: "Boolean",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/users/{userId}`,
            title: "Get User",
            query: [],

            parameters: [
              {
                key: "userId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "PATCH",
            url: `${basePath}/v1/users/{userId}`,
            title: "Update User",
            query: [],

            body: {
              type: "json",
              content: {
                fullname: "String",
                avatar: "String",
              },
            },

            parameters: [
              {
                key: "userId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "PATCH",
            url: `${basePath}/v1/profile`,
            title: "Update Profile",
            query: [],

            body: {
              type: "json",
              content: {
                fullname: "String",
                avatar: "String",
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "POST",
            url: `${basePath}/v1/users`,
            title: "Create User",
            query: [],

            body: {
              type: "json",
              content: {
                email: "String",
                password: "String",
                fullname: "String",
                avatar: "String",
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "DELETE",
            url: `${basePath}/v1/users/{userId}`,
            title: "Delete User",
            query: [],

            body: {
              type: "json",
              content: {},
            },

            parameters: [
              {
                key: "userId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "DELETE",
            url: `${basePath}/v1/archiveprofile`,
            title: "Archive Profile",
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
            url: `${basePath}/v1/users`,
            title: "List Users",
            query: [
              {
                key: "email",
                value: "",
                description:
                  " A string value to represent the user&#39;s email.",
              },
              {
                key: "fullname",
                value: "",
                description:
                  "A string value to represent the fullname of the user",
              },
              {
                key: "roleId",
                value: "",
                description:
                  "A string value to represent the roleId of the user.",
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
            url: `${basePath}/v1/searchusers`,
            title: "Search Users",
            query: [
              {
                key: "keyword",
                value: "",
                description: "",
              },
              {
                key: "roleId",
                value: "",
                description:
                  "A string value to represent the roleId of the user.",
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
            url: `${basePath}/v1/userrole/{userId}`,
            title: "Update Userrole",
            query: [],

            body: {
              type: "json",
              content: {
                roleId: "String",
              },
            },

            parameters: [
              {
                key: "userId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "PATCH",
            url: `${basePath}/v1/userpassword`,
            title: "Update Userpassword",
            query: [],

            body: {
              type: "json",
              content: {
                oldPassword: "String",
                newPassword: "String",
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "PATCH",
            url: `${basePath}/v1/userpasswordbyadmin/{userId}`,
            title: "Update Userpasswordbyadmin",
            query: [],

            body: {
              type: "json",
              content: {
                password: "String",
              },
            },

            parameters: [
              {
                key: "userId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: false,
            method: "GET",
            url: `${basePath}/v1/briefuser/{userId}`,
            title: "Get Briefuser",
            query: [],

            parameters: [
              {
                key: "userId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/streamtest/{userId}`,
            title: "Stream Test",
            query: [],

            parameters: [
              {
                key: "userId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: false,
            method: "POST",
            url: `${basePath}/login`,
            title: "Login To Application",
            query: [],
            body: {
              type: "json",
              content: {
                username: "admin@admin.com",
                password: "superadmin",
              },
            },
            headers: [],
          },

          // geo api
        ],
      },

      {
        name: "UserAvatarsFile",
        description:
          "Auto-generated file storage for the userAvatars database bucket. Files are stored as BYTEA in PostgreSQL.",
        reference: {
          tableName: "userAvatarsFile",
          properties: [
            {
              name: "fileName",
              type: "String",
            },

            {
              name: "mimeType",
              type: "String",
            },

            {
              name: "fileSize",
              type: "Integer",
            },

            {
              name: "accessKey",
              type: "String",
            },

            {
              name: "ownerId",
              type: "ID",
            },

            {
              name: "fileData",
              type: "Blob",
            },

            {
              name: "metadata",
              type: "Object",
            },

            {
              name: "scanStatus",
              type: "String",
            },

            {
              name: "scanResult",
              type: "Text",
            },

            {
              name: "scannedAt",
              type: "Date",
            },

            {
              name: "userId",
              type: "ID",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/useravatarsfiles/{userAvatarsFileId}`,
            title: "Get Useravatarsfile",
            query: [],

            parameters: [
              {
                key: "userAvatarsFileId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/useravatarsfiles`,
            title: "List Useravatarsfiles",
            query: [
              {
                key: "mimeType",
                value: "",
                description:
                  "MIME type of the uploaded file (e.g., image/png, application/pdf).",
              },
              {
                key: "ownerId",
                value: "",
                description:
                  "ID of the user who uploaded the file (from session).",
              },
              {
                key: "scanStatus",
                value: "",
                description:
                  "ClamAV scan result: &#39;clean&#39; (safe), &#39;infected&#39; (signature matched), &#39;error&#39; (scan failed). &#39;pending&#39; is reserved for async-scan modes not yet supported.",
              },
              {
                key: "userId",
                value: "",
                description: "Reference to the owner user record.",
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
            method: "DELETE",
            url: `${basePath}/v1/useravatarsfiles/{userAvatarsFileId}`,
            title: "Delete Useravatarsfile",
            query: [],

            body: {
              type: "json",
              content: {},
            },

            parameters: [
              {
                key: "userAvatarsFileId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/v1/_fetchlistuseravatarsfile`,
            title: "_fetch Listuseravatarsfile",
            query: [
              {
                key: "mimeType",
                value: "",
                description:
                  "MIME type of the uploaded file (e.g., image/png, application/pdf).",
              },
              {
                key: "ownerId",
                value: "",
                description:
                  "ID of the user who uploaded the file (from session).",
              },
              {
                key: "scanStatus",
                value: "",
                description:
                  "ClamAV scan result: &#39;clean&#39; (safe), &#39;infected&#39; (signature matched), &#39;error&#39; (scan failed). &#39;pending&#39; is reserved for async-scan modes not yet supported.",
              },
              {
                key: "userId",
                value: "",
                description: "Reference to the owner user record.",
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
