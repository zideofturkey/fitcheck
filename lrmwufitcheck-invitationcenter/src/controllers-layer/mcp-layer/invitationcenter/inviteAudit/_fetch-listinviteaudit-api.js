const { _fetchListInviteAuditManager } = require("apiLayer");
const { z } = require("zod");

const InvitationCenterServiceMcpController = require("../../InvitationCenterServiceMcpController");

class _fetchListInviteAuditMcpController extends InvitationCenterServiceMcpController {
  constructor(params) {
    super("_fetchListInviteAudit", "_fetchlistinviteaudit", params);
    this.dataName = "inviteAudits";
    this.crudType = "list";
  }

  createApiManager() {
    return new _fetchListInviteAuditManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        inviteAudits: z
          .object({
            id: z
              .string()
              .uuid()
              .describe("The unique primary key of the data object as UUID"),
            inviteLinkId: z.string().uuid().describe(""),
            eventType: z
              .enum([
                "created",
                "activated",
                "delivered",
                "validated",
                "consumed",
                "revoked",
                "expired",
              ])
              .describe(""),
            eventAt: z.string().describe(""),
            actorUserId: z.string().uuid().optional().nullable().describe(""),
            eventNote: z.string().max(255).optional().nullable().describe(""),
            relatedEmail: z
              .string()
              .max(255)
              .optional()
              .nullable()
              .describe(""),
          })
          .describe(
            "Append-only audit log capturing every lifecycle event on an invite link, including who acted, what happened, and optional contextual notes.",
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
      inviteLinkId: z.string().uuid().optional().describe(""),

      eventType: z
        .enum([
          "created",
          "activated",
          "delivered",
          "validated",
          "consumed",
          "revoked",
          "expired",
        ])
        .optional()
        .describe(""),
    };
  }
}

module.exports = (headers) => {
  const requiredRoles = ["superAdmin", "admin"];
  const requiredRolesMarker =
    requiredRoles.length > 0
      ? ` [MBX_REQUIRED_ROLES:${requiredRoles.join("|")}]`
      : "";
  return {
    name: "_fetchListInviteAudit",
    description:
      "System API to fetch list of inviteAudit records for frontend application. Auto-generated, not visible in design." +
      requiredRolesMarker,
    requiredRoles,
    parameters: _fetchListInviteAuditMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      console.log("Mcp Request Received", mcpParams);
      mcpParams.headers = headers;
      const controller = new _fetchListInviteAuditMcpController(mcpParams);
      try {
        const result = await controller.processRequest();
        //return _fetchListInviteAuditMcpController.getOutputSchema().parse(result);
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
