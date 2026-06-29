const { CreateInviteLinkManager } = require("apiLayer");
const { z } = require("zod");

const InvitationCenterServiceMcpController = require("../../InvitationCenterServiceMcpController");

class CreateInviteLinkMcpController extends InvitationCenterServiceMcpController {
  constructor(params) {
    super("createInviteLink", "createinvitelink", params);
    this.dataName = "inviteLink";
    this.crudType = "create";
  }

  createApiManager() {
    return new CreateInviteLinkManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        inviteLink: z
          .object({
            id: z
              .string()
              .uuid()
              .describe("The unique primary key of the data object as UUID"),
            ownerUserId: z.string().uuid().describe(""),
            inviteCode: z.string().max(255).describe(""),
            invitedEmail: z
              .string()
              .max(255)
              .optional()
              .nullable()
              .describe(""),
            usageMode: z.enum(["singleUse", "limitedUse"]).describe(""),
            usageLimit: z.number().int().optional().nullable().describe(""),
            usageCount: z.number().int().describe(""),
            inviteState: z
              .enum([
                "draft",
                "active",
                "exhausted",
                "revoked",
                "expired",
                "consumed",
              ])
              .describe(""),
            expiresAt: z.string().optional().nullable().describe(""),
            lastUsedAt: z.string().optional().nullable().describe(""),
            registeredUserId: z
              .string()
              .uuid()
              .optional()
              .nullable()
              .describe(""),
            deliveryRequestedAt: z.string().optional().nullable().describe(""),
            lastDeliveredAt: z.string().optional().nullable().describe(""),
          })
          .describe(
            "Stores a unique invite registration token with usage rules, lifecycle state, delivery tracking, and a reference to the registered user created as a result of the invite.",
          ),
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
      invitedEmail: z
        .string()
        .max(255)
        .optional()
        .describe("Optional intended recipient email address"),

      usageMode: z
        .enum(["singleUse", "limitedUse"])
        .describe(
          "Whether the invite can be used once (singleUse) or a limited number of times (limitedUse)",
        ),

      usageLimit: z
        .number()
        .int()
        .optional()
        .describe(
          "Maximum number of allowed uses; required when usageMode=limitedUse",
        ),

      expiresAt: z
        .string()
        .datetime()
        .optional()
        .describe("Optional expiry date; null means no expiry"),
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
    name: "createInviteLink",
    description:
      "Creates a new invite link with a generated unique code. Restricted to admins. The invite starts in &#39;draft&#39; state and must be explicitly activated before use." +
      requiredRolesMarker,
    requiredRoles,
    parameters: CreateInviteLinkMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      console.log("Mcp Request Received", mcpParams);
      mcpParams.headers = headers;
      const controller = new CreateInviteLinkMcpController(mcpParams);
      try {
        const result = await controller.processRequest();
        //return CreateInviteLinkMcpController.getOutputSchema().parse(result);
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
