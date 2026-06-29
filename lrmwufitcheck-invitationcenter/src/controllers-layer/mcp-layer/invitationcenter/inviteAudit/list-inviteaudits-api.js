const { ListInviteAuditsManager } = require("apiLayer");
const { z } = require("zod");

const InvitationCenterServiceMcpController = require("../../InvitationCenterServiceMcpController");

class ListInviteAuditsMcpController extends InvitationCenterServiceMcpController {
  constructor(params) {
    super("listInviteAudits", "listinviteaudits", params);
    this.dataName = "inviteAudits";
    this.crudType = "list";
  }

  createApiManager() {
    return new ListInviteAuditsManager(this.request, "mcp");
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
  const requiredRoles = [];
  const requiredRolesMarker =
    requiredRoles.length > 0
      ? ` [MBX_REQUIRED_ROLES:${requiredRoles.join("|")}]`
      : "";
  return {
    name: "listInviteAudits",
    description:
      "Admin endpoint to list audit log entries for invite links. Filterable by inviteLinkId and eventType." +
      requiredRolesMarker,
    requiredRoles,
    parameters: ListInviteAuditsMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      console.log("Mcp Request Received", mcpParams);
      mcpParams.headers = headers;
      const controller = new ListInviteAuditsMcpController(mcpParams);
      try {
        const result = await controller.processRequest();
        //return ListInviteAuditsMcpController.getOutputSchema().parse(result);
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
