const { _fetchListUserAvatarsFileManager } = require("apiLayer");
const { z } = require("zod");

const AuthServiceMcpController = require("../../AuthServiceMcpController");

class _fetchListUserAvatarsFileMcpController extends AuthServiceMcpController {
  constructor(params) {
    super("_fetchListUserAvatarsFile", "_fetchlistuseravatarsfile", params);
    this.dataName = "userAvatarsFiles";
    this.crudType = "list";
  }

  createApiManager() {
    return new _fetchListUserAvatarsFileManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        userAvatarsFiles: z
          .object({
            id: z
              .string()
              .uuid()
              .describe("The unique primary key of the data object as UUID"),
            fileName: z
              .string()
              .max(255)
              .describe("Original file name as uploaded by the client."),
            mimeType: z
              .string()
              .max(255)
              .describe(
                "MIME type of the uploaded file (e.g., image/png, application/pdf).",
              ),
            fileSize: z.number().int().describe("File size in bytes."),
            accessKey: z
              .string()
              .max(255)
              .describe(
                "12-character random key for shareable access. Auto-generated on upload.",
              ),
            ownerId: z
              .string()
              .uuid()
              .optional()
              .nullable()
              .describe("ID of the user who uploaded the file (from session)."),
            fileData: z
              .any()
              .describe(
                "Binary file content. Stored as BYTEA in PostgreSQL or Buffer in MongoDB.",
              ),
            metadata: z
              .object()
              .optional()
              .nullable()
              .describe(
                "Optional JSON metadata for the file (tags, alt text, etc.).",
              ),
            scanStatus: z
              .string()
              .max(255)
              .describe(
                "ClamAV scan result: 'clean' (safe), 'infected' (signature matched), 'error' (scan failed). 'pending' is reserved for async-scan modes not yet supported.",
              ),
            scanResult: z
              .string()
              .optional()
              .nullable()
              .describe(
                "Detail of the scan outcome — virus signature name when infected, transport-level error message when scan failed, null when clean.",
              ),
            scannedAt: z
              .string()
              .optional()
              .nullable()
              .describe("Timestamp of the most recent ClamAV scan attempt."),
            userId: z
              .string()
              .uuid()
              .optional()
              .nullable()
              .describe("Reference to the owner user record."),
          })
          .describe(
            "Auto-generated file storage for the userAvatars database bucket. Files are stored as BYTEA in PostgreSQL.",
          )
          .array(),
      })
      .describe("The response object of the crud route");
  }

  static getInputScheme() {
    return {
      // Always include accessToken - it authenticates the request on behalf of the logged-in user
      accessToken: z
        .string()
        .optional()
        .describe(
          "The access token of the logged-in user. Pass this to authenticate API calls on behalf of the user. Required for protected routes, optional for public routes.",
        ),
      mimeType: z
        .string()
        .max(255)
        .optional()
        .describe(
          "MIME type of the uploaded file (e.g., image/png, application/pdf).",
        ),

      ownerId: z
        .string()
        .uuid()
        .optional()
        .describe("ID of the user who uploaded the file (from session)."),

      scanStatus: z
        .string()
        .max(255)
        .optional()
        .describe(
          "ClamAV scan result: 'clean' (safe), 'infected' (signature matched), 'error' (scan failed). 'pending' is reserved for async-scan modes not yet supported.",
        ),

      userId: z
        .string()
        .uuid()
        .optional()
        .describe("Reference to the owner user record."),
    };
  }
}

module.exports = (headers) => {
  const requiredRoles = [];
  const requiredRolesMarker =
    requiredRoles.length > 0
      ? ` [MBX_REQUIRED_ROLES:${requiredRoles.join("|")}]`
      : "";
  return {
    name: "_fetchListUserAvatarsFile",
    description:
      "System API to fetch list of userAvatarsFile records for frontend application. Auto-generated, not visible in design." +
      requiredRolesMarker,
    requiredRoles,
    parameters: _fetchListUserAvatarsFileMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      console.log("Mcp Request Received", mcpParams);
      mcpParams.headers = headers;
      const controller = new _fetchListUserAvatarsFileMcpController(mcpParams);
      try {
        const result = await controller.processRequest();
        //return _fetchListUserAvatarsFileMcpController.getOutputSchema().parse(result);
        console.log("Mcp Response Ready", JSON.stringify(result));
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result),
            },
          ],
        };
      } catch (err) {
        console.log("Mcp Error Occured", err.message);
        //**errorLog
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error: ${err.message}`,
            },
          ],
        };
      }
    },
  };
};
