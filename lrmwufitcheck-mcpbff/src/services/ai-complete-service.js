/**
 * AI Complete Service
 *
 * Uses AI with MCP tools to intelligently generate API request bodies.
 * The AI has access to all service tools and can fetch real data.
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 */

const logger = require("../common/logger");

// Import API docs for parameter info
let apiDocs;
try {
  apiDocs = require("../data/api-docs");
} catch (err) {
  logger.warn("[AI Complete] api-docs.js not found");
  apiDocs = {
    getApiDoc: () => null,
  };
}

/**
 * Complete an API request body using AI with MCP tools
 *
 * @param {string} serviceName - The service name
 * @param {string} apiName - The API name
 * @param {Object} currentBody - Current partial body (optional)
 * @param {Object} userContext - User context with session info
 * @param {string} authToken - Auth token for fetching related data
 * @param {Object} mcpManager - MCP manager instance for tool access
 * @returns {Object} Completed body or error
 */
const completeApiBody = async (
  serviceName,
  apiName,
  currentBody = {},
  userContext = {},
  authToken = null,
  mcpManager = null,
) => {
  logger.info(
    `[AI Complete] Completing body for ${serviceName}/${apiName} using MCP tools`,
  );

  const aiService = require("./ai-service");

  // Check if AI is available
  if (!aiService.isAvailable()) {
    return {
      success: false,
      error:
        "AI service is not available. Please configure OPENAI_API_KEY or ANTHROPIC_API_KEY.",
    };
  }

  // Get API documentation for context
  const apiDoc = apiDocs.getApiDoc(serviceName, apiName);

  // Build parameter info for the prompt
  let parameterInfo = "";
  if (apiDoc?.parameters?.length > 0) {
    const bodyParams = apiDoc.parameters.filter(
      (p) =>
        p.httpLocation === "body" ||
        (!p.httpLocation &&
          !["query", "urlpath", "path", "header", "session"].includes(
            p.httpLocation,
          )),
    );

    if (bodyParams.length > 0) {
      parameterInfo =
        "\n\nAPI Parameters:\n" +
        bodyParams
          .map((p) => {
            let desc = `- ${p.name} (${p.type || "String"})`;
            if (p.required) desc += " [required]";
            if (p.description) desc += `: ${p.description}`;
            return desc;
          })
          .join("\n");
    }
  }

  // Build the prompt for the AI
  const randomSeed = Math.random().toString(36).substring(2, 10);

  const prompt = `Generate a realistic JSON request body for the "${apiName}" API in the "${serviceName}" service.

IMPORTANT INSTRUCTIONS:
1. Use the available tools to fetch REAL IDs for any foreign key fields (fields ending with "Id" like categoryId, locationId, etc.)
2. For categoryId: Use listCategories or similar tool to get real category IDs
3. For locationId: Use listCities, listLocations or similar tool to get real location IDs  
4. For any other *Id field: Find and use the appropriate list tool to get real IDs
5. Generate realistic, creative content for text fields (titles, descriptions)
6. Use Turkish language for content if this appears to be a Turkish marketplace
7. Use realistic prices, dates, and other values
8. Request seed: ${randomSeed} - generate unique content each time
${parameterInfo}

After fetching real IDs using tools, respond with ONLY a valid JSON object that can be used as the request body.

RESPONSE FORMAT:
- If successful: Return ONLY the JSON object, no explanation, no markdown code blocks
- If there's an error: Return JSON like {"error": "description of the problem"}

Generate the JSON now:`;

  try {
    // Get MCP tools if manager is available
    let mcpTools = [];
    if (mcpManager) {
      try {
        mcpTools = await mcpManager.getAllTools();
        logger.info(`[AI Complete] Using ${mcpTools.length} MCP tools`);
      } catch (err) {
        logger.warn(`[AI Complete] Could not get MCP tools: ${err.message}`);
      }
    }

    // Use the AI chat with tools
    const messages = [{ role: "user", content: prompt }];

    const response = await aiService.chat(
      messages,
      mcpTools,
      mcpManager,
      userContext,
    );

    logger.info(
      `[AI Complete] AI response received, tool calls: ${response.toolCalls?.length || 0}`,
    );

    // Extract JSON from the response
    const content = response.content || "";

    // Try to parse the JSON
    let jsonBody = null;

    // First try to find a JSON object in the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        jsonBody = JSON.parse(jsonMatch[0]);
      } catch (parseErr) {
        logger.warn(`[AI Complete] Failed to parse JSON: ${parseErr.message}`);
      }
    }

    if (jsonBody) {
      // Check if it's an error response
      if (jsonBody.error && Object.keys(jsonBody).length <= 2) {
        return {
          success: false,
          error: jsonBody.error,
          aiResponse: content,
        };
      }

      return {
        success: true,
        body: jsonBody,
        toolCalls: response.toolCalls,
      };
    }

    // If no valid JSON found, return error with the AI response
    return {
      success: false,
      error: "AI did not return valid JSON",
      aiResponse: content,
    };
  } catch (err) {
    logger.error(`[AI Complete] Error: ${err.message}`);
    return {
      success: false,
      error: err.message,
    };
  }
};

module.exports = {
  completeApiBody,
};
