const { AddPresetLineManager } = require("apiLayer");
const { z } = require("zod");

const NutritionLibraryServiceMcpController = require("../../NutritionLibraryServiceMcpController");

class AddPresetLineMcpController extends NutritionLibraryServiceMcpController {
  constructor(params) {
    super("addPresetLine", "addpresetline", params);
    this.dataName = "presetLine";
    this.crudType = "create";
  }

  createApiManager() {
    return new AddPresetLineManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        presetLine: z
          .object({
            id: z
              .string()
              .uuid()
              .describe("The unique primary key of the data object as UUID"),
            presetMealId: z.string().uuid().describe(""),
            foodItemId: z.string().uuid().describe(""),
            lineFoodName: z.string().max(255).describe(""),
            gramAmount: z.number().describe(""),
            lineCalories: z.number().describe(""),
            lineProtein: z.number().describe(""),
            lineCarbohydrates: z.number().describe(""),
            lineFat: z.number().describe(""),
            lineSugar: z.number().describe(""),
            lineFiber: z.number().describe(""),
            isActive: z
              .boolean()
              .describe(
                "The active status of the data object to manage soft delete. False when deleted.",
              ),
          })
          .describe(
            "A single food item entry within a preset meal template. Stores a gram amount and snapshot nutrition values calculated at line creation. Lines are created or deleted to modify a preset; individual lines are not edited (replace pattern).",
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
      foodItemId: z.string().uuid().describe(""),

      gramAmount: z.number().describe(""),

      presetMealId: z
        .string()
        .max(255)
        .describe(
          "This URL path parameter scopes the create operation to a parent record (typically the parent object's id).",
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
    name: "addPresetLine",
    description:
      "Add a food item line to a preset meal. Validates preset ownership and food item ownership, calculates nutrition snapshot, creates the line, then recalculates parent preset totals." +
      requiredRolesMarker,
    requiredRoles,
    parameters: AddPresetLineMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      console.log("Mcp Request Received", mcpParams);
      mcpParams.headers = headers;
      const controller = new AddPresetLineMcpController(mcpParams);
      try {
        const result = await controller.processRequest();
        //return AddPresetLineMcpController.getOutputSchema().parse(result);
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
