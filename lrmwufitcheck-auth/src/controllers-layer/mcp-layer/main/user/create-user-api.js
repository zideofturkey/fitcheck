const { CreateUserManager } = require("apiLayer");
const { z } = require("zod");

const AuthServiceMcpController = require("../../AuthServiceMcpController");

class CreateUserMcpController extends AuthServiceMcpController {
  constructor(params) {
    super("createUser", "createuser", params);
    this.dataName = "user";
    this.crudType = "create";
  }

  createApiManager() {
    return new CreateUserManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        user: z
          .object({
            id: z
              .string()
              .uuid()
              .describe("The unique primary key of the data object as UUID"),
            email: z
              .string()
              .max(255)
              .describe(" A string value to represent the user's email."),
            password: z
              .string()
              .max(255)
              .describe(
                " A string value to represent the user's password. It will be stored as hashed.",
              ),
            fullname: z
              .string()
              .max(255)
              .describe("A string value to represent the fullname of the user"),
            avatar: z
              .string()
              .max(255)
              .optional()
              .nullable()
              .describe(
                "The avatar url of the user. A random avatar will be generated if not provided",
              ),
            roleId: z
              .string()
              .max(255)
              .describe("A string value to represent the roleId of the user."),
            emailVerified: z
              .boolean()
              .describe(
                "A boolean value to represent the email verification status of the user.",
              ),
            isActive: z
              .boolean()
              .describe(
                "The active status of the data object to manage soft delete. False when deleted.",
              ),
          })
          .describe(
            "A data object that stores the user information and handles login settings.",
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
      email: z.string().max(255).describe("User's email address."),

      password: z
        .string()
        .max(255)
        .describe("User's password (will be hashed at write time)."),

      fullname: z.string().max(255).describe("User's full name."),

      avatar: z
        .string()
        .max(255)
        .optional()
        .describe(
          "The avatar url of the user. If not sent, a default random one will be generated.",
        ),
    };
  }
}

module.exports = (headers) => {
  const requiredRoles = [
    "superAdmin",
    "admin",
    "saasAdmin",
    "tenantAdmin",
    "tenantOwner",
  ];
  const requiredRolesMarker =
    requiredRoles.length > 0
      ? ` [MBX_REQUIRED_ROLES:${requiredRoles.join("|")}]`
      : "";
  return {
    name: "createUser",
    description:
      "This api is used by admin roles to create a new user manually from admin panels" +
      requiredRolesMarker,
    requiredRoles,
    parameters: CreateUserMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      console.log("Mcp Request Received", mcpParams);
      mcpParams.headers = headers;
      const controller = new CreateUserMcpController(mcpParams);
      try {
        const result = await controller.processRequest();
        //return CreateUserMcpController.getOutputSchema().parse(result);
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
