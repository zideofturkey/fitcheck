const { ConsumeInviteLinkManager } = require("apiLayer");
const { z } = require("zod");

const InvitationCenterServiceMcpController = require("../../InvitationCenterServiceMcpController");

class ConsumeInviteLinkMcpController extends InvitationCenterServiceMcpController {
  constructor(params) {
    super("consumeInviteLink", "consumeinvitelink", params);
    this.dataName = "inviteLink";
    this.crudType = "update";
  }

  createApiManager() {
    return new ConsumeInviteLinkManager(this.request, "mcp");
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
      inviteLinkId: z
        .string()
        .uuid()
        .describe(
          "This id paremeter is used to select the required data object that will be updated",
        ),

      registeredUserId: z
        .string()
        .uuid()
        .describe("The auth user id created from this invite"),

      relatedEmail: z
        .string()
        .max(255)
        .optional()
        .describe("Registered email for audit record"),
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
    name: "consumeInviteLink",
    description:
      "Marks an invite link as consumed and records the registered user ID. Called by the auth service or an admin workflow after successful user registration. Raises an API event." +
      requiredRolesMarker,
    requiredRoles,
    parameters: ConsumeInviteLinkMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      console.log("Mcp Request Received", mcpParams);
      mcpParams.headers = headers;
      const controller = new ConsumeInviteLinkMcpController(mcpParams);
      try {
        const result = await controller.processRequest();
        //return ConsumeInviteLinkMcpController.getOutputSchema().parse(result);
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
