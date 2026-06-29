const { GetMyMacroTargetForLoggingManager } = require("apiLayer");
const { z } = require("zod");

const NutritionLibraryServiceMcpController = require("../../NutritionLibraryServiceMcpController");

class GetMyMacroTargetForLoggingMcpController extends NutritionLibraryServiceMcpController {
  constructor(params) {
    super("getMyMacroTargetForLogging", "getmymacrotargetforlogging", params);
    this.dataName = "macroTarget";
    this.crudType = "get";
  }

  createApiManager() {
    return new GetMyMacroTargetForLoggingManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        macroTarget: z
          .object({
            id: z
              .string()
              .uuid()
              .describe("The unique primary key of the data object as UUID"),
            userId: z.string().uuid().describe(""),
            calorieTarget: z.number().describe(""),
            proteinTarget: z.number().describe(""),
            carbohydrateTarget: z.number().describe(""),
            fatTarget: z.number().describe(""),
            sugarTarget: z.number().describe(""),
            fiberTarget: z.number().describe(""),
            effectiveFrom: z.string().describe(""),
            isActive: z
              .boolean()
              .describe(
                "The active status of the data object to manage soft delete. False when deleted.",
              ),
          })
          .describe(
            "Stores the authenticated user's six daily macro targets (calories, protein, carbohydrates, fat, sugar, fiber). Each user has one active target record; updating replaces the effective values.",
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
    name: "getMyMacroTargetForLogging",
    description:
      "Dedicated read API for mealTracker (dashboard progress) and nutritionAi (context-aware guidance). Fetches the authenticated user&#39;s current macro targets." +
      requiredRolesMarker,
    requiredRoles,
    parameters: GetMyMacroTargetForLoggingMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      console.log("Mcp Request Received", mcpParams);
      mcpParams.headers = headers;
      const controller = new GetMyMacroTargetForLoggingMcpController(mcpParams);
      try {
        const result = await controller.processRequest();
        //return GetMyMacroTargetForLoggingMcpController.getOutputSchema().parse(result);
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
