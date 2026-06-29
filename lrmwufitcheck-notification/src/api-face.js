const { inject } = require("mindbricks-api-face");

module.exports = (app) => {
  const basePath =
    process.env.SERVICE_URL_SUFFIX ?? `${process.env.SERVICE_SHORT_NAME}-api`;
  const baseUrl = process.env.SERVICE_URL ?? "mindbricks.com";
  const shortName = process.env.SERVICE_SHORT_NAME?.toLowerCase();
  const authUrl = shortName ? baseUrl.replace(shortName, "auth") : baseUrl;

  inject(app, {
    basePath: basePath,
    name: "fitcheck - notification",
    brand: {
      name: "fitcheck",
      image: "https://minioapi.masaupp.com/mindbricks/favico.ico",
      moduleName: "notification",
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
        name: "notification",
        description: "notification",
        reference: {
          tableName: "notification",
          properties: [
            {
              name: "id",
              type: "uuid",
            },
            {
              name: "userId",
              type: "uuid",
            },
            {
              name: "title",
              type: "string",
            },
            {
              name: "body",
              type: "string",
            },
            {
              name: "isSeen",
              type: "boolean",
            },
            {
              name: "metadata",
              type: "json",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "GET",
            url: `${basePath}/notifications`,
            title: "Get Notifications",
            query: [
              {
                key: "sortBy",
                value: "createdAt",
                description: "Sort by",
              },
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
            ],
            body: {},
            parameters: [],
            headers: [],
          },
          {
            isAuth: true,
            method: "POST",
            url: `${basePath}/notifications`,
            title: "Send Notification",
            query: [],
            body: {
              type: "json",
              content: {
                types: ["email"],
                template: "NONE",
                userId: "uuid",
                email: "test@test.com",
                phoneNumber: "",
                title: "Test Title",
                body: "Test Body",
                isStored: true,
                metadata: {},
              },
            },
            parameters: [],
            headers: [],
          },
          {
            isAuth: true,
            method: "POST",
            url: `${basePath}/notifications/seen`,
            title: "Seen Notification",
            query: [],
            body: {
              type: "json",
              content: {
                notificationIds: ["uuid"],
              },
            },
            parameters: [],
            headers: [],
          },
        ],
      },
      {
        name: "deviceToken",
        description: "deviceToken",
        reference: {
          tableName: "deviceToken",
          properties: [
            {
              name: "id",
              type: "uuid",
            },
            {
              name: "userId",
              type: "uuid",
            },
            {
              name: "deviceId",
              type: "string",
            },
            {
              name: "notificationToken",
              type: "string",
            },
            {
              name: "os",
              type: "enum(IOS, ANDROID, WEB)",
            },
            {
              name: "osVersion",
              type: "string",
            },
            {
              name: "osModel",
              type: "string",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "POST",
            url: `${basePath}/devices/register`,
            title: "Register Device",
            query: [],
            body: {
              type: "json",
              content: {
                deviceId: "string",
                notificationToken: "string",
                os: "enum(IOS, ANDROID, WEB)",
                osVersion: "string",
                osModel: "string",
              },
            },
            parameters: [],
            headers: [],
          },
          {
            isAuth: true,
            method: "DELETE",
            url: `${basePath}/devices/unregister/{deviceId}`,
            title: "Unregister Device",
            query: [],
            parameters: [
              {
                key: "deviceId",
                value: "string",
                description: "Device ID",
              },
            ],
            body: {},
            headers: [],
          },
        ],
      },
    ],
  });
};
