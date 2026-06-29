const { SetMacroTargetManager } = require("apiLayer");
const { z } = require("zod");

const NutritionLibraryServiceMcpController = require("../../NutritionLibraryServiceMcpController");

class SetMacroTargetMcpController extends NutritionLibraryServiceMcpController {
  constructor(params) {
    super("setMacroTarget", "setmacrotarget", params);
    this.dataName = "macroTarget";
    this.crudType = "create";
  }

  createApiManager() {
    return new SetMacroTargetManager(this.request, "mcp");
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
      calorieTarget: z.number().describe(""),

      proteinTarget: z.number().describe(""),

      carbohydrateTarget: z.number().describe(""),

      fatTarget: z.number().describe(""),

      sugarTarget: z.number().describe(""),

      fiberTarget: z.number().describe(""),
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
    name: "setMacroTarget",
    description:
      "Upsert-style API: soft-deletes any existing active macro target for the user before creating a fresh one." +
      requiredRolesMarker,
    requiredRoles,
    parameters: SetMacroTargetMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      console.log("Mcp Request Received", mcpParams);
      mcpParams.headers = headers;
      const controller = new SetMacroTargetMcpController(mcpParams);
      try {
        const result = await controller.processRequest();
        //return SetMacroTargetMcpController.getOutputSchema().parse(result);
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
