/**
 * BFF-level Data Visualization MCP Tools
 *
 * These tools are defined at the MCP-BFF level (not per-service) so the AI
 * sees a single, cross-service API catalog instead of per-service duplicates.
 *
 * Tools:
 *  - showQrCode
 *  - showBusinessApiListInFrontEnd
 *  - showBusinessApiGalleryInFrontEnd
 *  - showBusinessApiMapInFrontEnd
 */

const logger = require("../common/logger");

let apiDocs;
try {
  apiDocs = require("../data/api-docs");
} catch (err) {
  logger.warn(
    "[VisualizationTools] api-docs.js not found, visualization tools will have no API catalog",
  );
  apiDocs = { API_DOCS: {} };
}

// ---------------------------------------------------------------------------
// Build cross-service list-API catalog from api-docs.js
// ---------------------------------------------------------------------------
function buildListApiCatalog() {
  const catalog = {};
  const docs = apiDocs.API_DOCS || {};

  for (const [serviceName, service] of Object.entries(docs)) {
    const apis = service.apis || {};
    for (const [apiName, api] of Object.entries(apis)) {
      if (api.crudType !== "list") continue;
      catalog[apiName] = {
        apiName,
        serviceName,
        routePath: api.routePath || "",
        httpMethod: (api.method || "GET").toUpperCase(),
        description: api.description || "",
        dataName: null,
      };
    }
  }

  return catalog;
}

const LIST_API_CATALOG = buildListApiCatalog();
const AVAILABLE_LIST_APIS = Object.keys(LIST_API_CATALOG);

const LIST_API_CATALOG_TEXT = Object.values(LIST_API_CATALOG)
  .map((api) => {
    const parts = [
      `${api.apiName} [service: ${api.serviceName}] (${api.httpMethod} ${api.routePath})`,
      api.dataName ? `dataField=${api.dataName}` : null,
      api.description ? `desc=${api.description}` : null,
    ].filter(Boolean);
    return `- ${parts.join(" | ")}`;
  })
  .join("\n");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function successResponse(data) {
  return {
    success: true,
    service: "bff",
    result: {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    },
  };
}

function errorResponse(error) {
  return {
    success: false,
    service: "bff",
    result: {
      isError: true,
      content: [{ type: "text", text: `Error: ${error.message || error}` }],
    },
  };
}

// ---------------------------------------------------------------------------
// Tool definitions  (JSON Schema inputSchema, like DOCS_SEARCH_TOOL)
// ---------------------------------------------------------------------------

const SHOW_QR_CODE_TOOL = {
  name: "showQrCode",
  description:
    "Render any string value as a QR code in the frontend chat UI. Use for links, invitation codes, tokens, payment strings, or any user-requested QR output.",
  inputSchema: {
    type: "object",
    properties: {
      value: {
        type: "string",
        minLength: 1,
        maxLength: 4096,
        description: "String value to encode as QR code",
      },
      title: {
        type: "string",
        description: "Optional title displayed above the QR code card",
      },
      subtitle: {
        type: "string",
        description: "Optional subtitle text shown in the card",
      },
    },
    required: ["value"],
  },
};

const SHOW_LIST_TOOL = {
  name: "showBusinessApiListInFrontEnd",
  description:
    AVAILABLE_LIST_APIS.length > 0
      ? `Prepare a frontend data grid from a real Business API list endpoint. Frontend will call the selected API with the logged-in user's bearer token and render rows/columns.\nAvailable list APIs:\n${LIST_API_CATALOG_TEXT}`
      : "No list APIs are available.",
  inputSchema: {
    type: "object",
    properties: {
      apiName: {
        type: "string",
        description:
          AVAILABLE_LIST_APIS.length > 0
            ? `Business API name. Must be one of: ${AVAILABLE_LIST_APIS.join(", ")}.\nCatalog:\n${LIST_API_CATALOG_TEXT}`
            : "Business API name",
      },
      title: { type: "string", description: "Optional card title" },
      queryParams: {
        type: "object",
        description:
          "Query parameters to send in the API call (pagination/filter/sort etc.)",
        additionalProperties: true,
      },
      columns: {
        type: "array",
        description:
          "Optional grid columns. If omitted, frontend auto-detects columns from data.",
        items: {
          type: "object",
          properties: {
            field: {
              type: "string",
              description: "Field name from result row",
            },
            label: { type: "string", description: "Column title for UI" },
            format: {
              type: "string",
              enum: [
                "text",
                "date",
                "datetime",
                "number",
                "currency",
                "boolean",
              ],
              description: "Optional formatting hint",
            },
          },
          required: ["field"],
        },
      },
      dataField: {
        type: "string",
        description:
          "Optional response key that contains the array (if not provided, frontend auto-detects).",
      },
    },
    required: ["apiName"],
  },
};

const SHOW_GALLERY_TOOL = {
  name: "showBusinessApiGalleryInFrontEnd",
  description:
    AVAILABLE_LIST_APIS.length > 0
      ? `Prepare a frontend gallery view from a real Business API list endpoint. Frontend will call selected API with user bearer token.\nAvailable list APIs:\n${LIST_API_CATALOG_TEXT}`
      : "No list APIs are available.",
  inputSchema: {
    type: "object",
    properties: {
      apiName: {
        type: "string",
        description:
          AVAILABLE_LIST_APIS.length > 0
            ? `Business API name. Must be one of: ${AVAILABLE_LIST_APIS.join(", ")}.\nCatalog:\n${LIST_API_CATALOG_TEXT}`
            : "Business API name",
      },
      title: { type: "string", description: "Optional gallery card title" },
      queryParams: {
        type: "object",
        description: "Query parameters to send in the API call",
        additionalProperties: true,
      },
      imageField: {
        type: "string",
        description:
          "Image field in each row. If omitted, frontend tries common image fields.",
      },
      titleField: { type: "string", description: "Title field in each row" },
      subtitleField: {
        type: "string",
        description: "Subtitle/description field in each row",
      },
      dataField: {
        type: "string",
        description: "Optional response key that contains the array",
      },
    },
    required: ["apiName"],
  },
};

const SHOW_MAP_TOOL = {
  name: "showBusinessApiMapInFrontEnd",
  description:
    AVAILABLE_LIST_APIS.length > 0
      ? `Prepare a frontend map view from a real Business API list endpoint. Use when rows contain GeoPoint-like location data. Frontend will call selected API with user bearer token and render a map with list grid.\nAvailable list APIs:\n${LIST_API_CATALOG_TEXT}`
      : "No list APIs are available.",
  inputSchema: {
    type: "object",
    properties: {
      apiName: {
        type: "string",
        description:
          AVAILABLE_LIST_APIS.length > 0
            ? `Business API name. Must be one of: ${AVAILABLE_LIST_APIS.join(", ")}.\nCatalog:\n${LIST_API_CATALOG_TEXT}`
            : "Business API name",
      },
      title: { type: "string", description: "Optional map title" },
      queryParams: {
        type: "object",
        description: "Query parameters to send in the API call",
        additionalProperties: true,
      },
      geoField: {
        type: "string",
        description: "GeoPoint field name in each row (e.g. location)",
      },
      titleField: {
        type: "string",
        description: "Field used as marker title in tooltip",
      },
      dataField: {
        type: "string",
        description: "Optional response key that contains the array",
      },
    },
    required: ["apiName"],
  },
};

// Collect all tool definitions for getAllTools()
const VISUALIZATION_TOOLS = [
  SHOW_QR_CODE_TOOL,
  ...(AVAILABLE_LIST_APIS.length > 0
    ? [SHOW_LIST_TOOL, SHOW_GALLERY_TOOL, SHOW_MAP_TOOL]
    : []),
];

// ---------------------------------------------------------------------------
// Tool handlers (called by EnhancedMcpManager.callTool)
// ---------------------------------------------------------------------------

function handleShowQrCode(args) {
  const { value, title, subtitle } = args;
  if (!value) return errorResponse("value is required");
  return successResponse({
    __frontendAction: {
      type: "qrcode",
      value: String(value),
      title: title || "QR Code",
      subtitle: subtitle || null,
    },
    message: "QR code is ready below.",
  });
}

function handleShowList(args) {
  const { apiName, title, queryParams, columns, dataField } = args;
  const apiConfig = LIST_API_CATALOG[apiName];
  if (!apiConfig) {
    return errorResponse(
      `Unknown list apiName: ${apiName}. Available: ${AVAILABLE_LIST_APIS.join(", ")}`,
    );
  }
  return successResponse({
    __frontendAction: {
      type: "dataView",
      viewType: "grid",
      title: title || `${apiConfig.apiName} results`,
      serviceName: apiConfig.serviceName,
      apiName: apiConfig.apiName,
      routePath: apiConfig.routePath,
      httpMethod: apiConfig.httpMethod,
      queryParams: queryParams || {},
      columns: Array.isArray(columns) ? columns : [],
      dataField: dataField || apiConfig.dataName || null,
    },
    message: `Prepared data grid for ${apiConfig.apiName}.`,
  });
}

function handleShowGallery(args) {
  const {
    apiName,
    title,
    queryParams,
    imageField,
    titleField,
    subtitleField,
    dataField,
  } = args;
  const apiConfig = LIST_API_CATALOG[apiName];
  if (!apiConfig) {
    return errorResponse(
      `Unknown list apiName: ${apiName}. Available: ${AVAILABLE_LIST_APIS.join(", ")}`,
    );
  }
  return successResponse({
    __frontendAction: {
      type: "dataView",
      viewType: "gallery",
      title: title || `${apiConfig.apiName} gallery`,
      serviceName: apiConfig.serviceName,
      apiName: apiConfig.apiName,
      routePath: apiConfig.routePath,
      httpMethod: apiConfig.httpMethod,
      queryParams: queryParams || {},
      imageField: imageField || null,
      titleField: titleField || null,
      subtitleField: subtitleField || null,
      dataField: dataField || apiConfig.dataName || null,
    },
    message: `Prepared gallery view for ${apiConfig.apiName}.`,
  });
}

function handleShowMap(args) {
  const { apiName, title, queryParams, geoField, titleField, dataField } = args;
  const apiConfig = LIST_API_CATALOG[apiName];
  if (!apiConfig) {
    return errorResponse(
      `Unknown list apiName: ${apiName}. Available: ${AVAILABLE_LIST_APIS.join(", ")}`,
    );
  }
  return successResponse({
    __frontendAction: {
      type: "dataView",
      viewType: "map",
      title: title || `${apiConfig.apiName} map`,
      serviceName: apiConfig.serviceName,
      apiName: apiConfig.apiName,
      routePath: apiConfig.routePath,
      httpMethod: apiConfig.httpMethod,
      queryParams: queryParams || {},
      geoField: geoField || "location",
      titleField: titleField || "name",
      dataField: dataField || apiConfig.dataName || null,
    },
    message: `Prepared map view for ${apiConfig.apiName}.`,
  });
}

const TOOL_HANDLERS = {
  showQrCode: handleShowQrCode,
  showBusinessApiListInFrontEnd: handleShowList,
  showBusinessApiGalleryInFrontEnd: handleShowGallery,
  showBusinessApiMapInFrontEnd: handleShowMap,
};

module.exports = {
  VISUALIZATION_TOOLS,
  TOOL_HANDLERS,
  VISUALIZATION_TOOL_NAMES: new Set(Object.keys(TOOL_HANDLERS)),
};
