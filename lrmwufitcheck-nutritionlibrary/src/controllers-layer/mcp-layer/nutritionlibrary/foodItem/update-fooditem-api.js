const { UpdateFoodItemManager } = require("apiLayer");
const { z } = require("zod");

const NutritionLibraryServiceMcpController = require("../../NutritionLibraryServiceMcpController");

class UpdateFoodItemMcpController extends NutritionLibraryServiceMcpController {
  constructor(params) {
    super("updateFoodItem", "updatefooditem", params);
    this.dataName = "foodItem";
    this.crudType = "update";
  }

  createApiManager() {
    return new UpdateFoodItemManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        foodItem: z
          .object({
            id: z
              .string()
              .uuid()
              .describe("The unique primary key of the data object as UUID"),
            userId: z.string().uuid().describe(""),
            foodName: z.string().max(255).describe(""),
            caloriePer100g: z.number().describe(""),
            proteinPer100g: z.number().describe(""),
            carbohydratePer100g: z.number().describe(""),
            fatPer100g: z.number().describe(""),
            sugarPer100g: z.number().describe(""),
            fiberPer100g: z.number().describe(""),
            brandName: z.string().max(255).optional().nullable().describe(""),
            foodCategory: z
              .string()
              .max(255)
              .optional()
              .nullable()
              .describe(""),
            creationSource: z.enum(["manualEntry", "aiAssistant"]).describe(""),
            isActive: z
              .boolean()
              .describe(
                "The active status of the data object to manage soft delete. False when deleted.",
              ),
          })
          .describe(
            "A private, reusable food definition in the user's personal food library. Stores per-100g nutrition values. Editable at any time without affecting historical meal log snapshots.",
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
      foodItemId: z
        .string()
        .uuid()
        .describe(
          "This id paremeter is used to select the required data object that will be updated",
        ),

      foodName: z.string().max(255).optional().describe(""),

      caloriePer100g: z.number().optional().describe(""),

      proteinPer100g: z.number().optional().describe(""),

      carbohydratePer100g: z.number().optional().describe(""),

      fatPer100g: z.number().optional().describe(""),

      sugarPer100g: z.number().optional().describe(""),

      fiberPer100g: z.number().optional().describe(""),

      brandName: z.string().max(255).optional().describe(""),

      foodCategory: z.string().max(255).optional().describe(""),
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
    name: "updateFoodItem",
    description:
      "Update a food item&#39;s fields. All fields are optional (partial update). Ownership enforced." +
      requiredRolesMarker,
    requiredRoles,
    parameters: UpdateFoodItemMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      console.log("Mcp Request Received", mcpParams);
      mcpParams.headers = headers;
      const controller = new UpdateFoodItemMcpController(mcpParams);
      try {
        const result = await controller.processRequest();
        //return UpdateFoodItemMcpController.getOutputSchema().parse(result);
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
