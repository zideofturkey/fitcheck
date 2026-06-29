import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Play,
  Loader2,
  X,
  ChevronDown,
  Copy,
  Check,
  Send,
  Sparkles,
  Database,
  Terminal,
  Trash2,
  FileJson,
  RefreshCw,
  RotateCcw,
  AlertTriangle,
  Settings,
  BarChart3,
} from "lucide-react";
import { createMcpBffClient } from "../services/apiClient";
import { cn } from "../utils/cn";

// Static list of elastic indexes from project model (fallback)
const STATIC_ELASTIC_INDEXES = [
  {
    serviceName: "auth",
    objectName: "user",
    indexName: "user",
    modelName: "User",
    properties: [
      {
        name: "email",
        type: "String",
        fulltextSearch: true,
      },
      {
        name: "password",
        type: "String",
        fulltextSearch: false,
      },
      {
        name: "fullname",
        type: "String",
        fulltextSearch: true,
      },
      {
        name: "avatar",
        type: "String",
        fulltextSearch: false,
      },
      {
        name: "roleId",
        type: "String",
        fulltextSearch: false,
      },
      {
        name: "emailVerified",
        type: "Boolean",
        fulltextSearch: false,
      },
    ],
  },
  {
    serviceName: "auth",
    objectName: "userAvatarsFile",
    indexName: "useravatarsfile",
    modelName: "UserAvatarsFile",
    properties: [
      {
        name: "fileName",
        type: "String",
        fulltextSearch: false,
      },
      {
        name: "mimeType",
        type: "String",
        fulltextSearch: false,
      },
      {
        name: "fileSize",
        type: "Integer",
        fulltextSearch: false,
      },
      {
        name: "accessKey",
        type: "String",
        fulltextSearch: false,
      },
      {
        name: "ownerId",
        type: "ID",
        fulltextSearch: false,
      },
      {
        name: "fileData",
        type: "Blob",
        fulltextSearch: false,
      },
      {
        name: "metadata",
        type: "Object",
        fulltextSearch: false,
      },
      {
        name: "scanStatus",
        type: "String",
        fulltextSearch: false,
      },
      {
        name: "scanResult",
        type: "Text",
        fulltextSearch: false,
      },
      {
        name: "scannedAt",
        type: "Date",
        fulltextSearch: false,
      },
      {
        name: "userId",
        type: "ID",
        fulltextSearch: false,
      },
    ],
  },
  {
    serviceName: "invitationcenter",
    objectName: "inviteLink",
    indexName: "invitelink",
    modelName: "InviteLink",
    properties: [
      {
        name: "ownerUserId",
        type: "ID",
        fulltextSearch: false,
      },
      {
        name: "inviteCode",
        type: "String",
        fulltextSearch: false,
      },
      {
        name: "invitedEmail",
        type: "String",
        fulltextSearch: false,
      },
      {
        name: "usageMode",
        type: "Enum",
        fulltextSearch: false,
      },
      {
        name: "usageLimit",
        type: "Integer",
        fulltextSearch: false,
      },
      {
        name: "usageCount",
        type: "Integer",
        fulltextSearch: false,
      },
      {
        name: "inviteState",
        type: "Enum",
        fulltextSearch: false,
      },
      {
        name: "expiresAt",
        type: "Date",
        fulltextSearch: false,
      },
      {
        name: "lastUsedAt",
        type: "Date",
        fulltextSearch: false,
      },
      {
        name: "registeredUserId",
        type: "ID",
        fulltextSearch: false,
      },
      {
        name: "deliveryRequestedAt",
        type: "Date",
        fulltextSearch: false,
      },
      {
        name: "lastDeliveredAt",
        type: "Date",
        fulltextSearch: false,
      },
    ],
  },
  {
    serviceName: "invitationcenter",
    objectName: "inviteAudit",
    indexName: "inviteaudit",
    modelName: "InviteAudit",
    properties: [
      {
        name: "inviteLinkId",
        type: "ID",
        fulltextSearch: false,
      },
      {
        name: "eventType",
        type: "Enum",
        fulltextSearch: false,
      },
      {
        name: "eventAt",
        type: "Date",
        fulltextSearch: false,
      },
      {
        name: "actorUserId",
        type: "ID",
        fulltextSearch: false,
      },
      {
        name: "eventNote",
        type: "String",
        fulltextSearch: false,
      },
      {
        name: "relatedEmail",
        type: "String",
        fulltextSearch: false,
      },
    ],
  },
  {
    serviceName: "nutritionlibrary",
    objectName: "macroTarget",
    indexName: "macrotarget",
    modelName: "MacroTarget",
    properties: [
      {
        name: "userId",
        type: "ID",
        fulltextSearch: false,
      },
      {
        name: "calorieTarget",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "proteinTarget",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "carbohydrateTarget",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "fatTarget",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "sugarTarget",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "fiberTarget",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "effectiveFrom",
        type: "Date",
        fulltextSearch: false,
      },
    ],
  },
  {
    serviceName: "nutritionlibrary",
    objectName: "foodItem",
    indexName: "fooditem",
    modelName: "FoodItem",
    properties: [
      {
        name: "userId",
        type: "ID",
        fulltextSearch: false,
      },
      {
        name: "foodName",
        type: "String",
        fulltextSearch: true,
      },
      {
        name: "caloriePer100g",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "proteinPer100g",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "carbohydratePer100g",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "fatPer100g",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "sugarPer100g",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "fiberPer100g",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "brandName",
        type: "String",
        fulltextSearch: false,
      },
      {
        name: "foodCategory",
        type: "String",
        fulltextSearch: false,
      },
      {
        name: "creationSource",
        type: "Enum",
        fulltextSearch: false,
      },
    ],
  },
  {
    serviceName: "nutritionlibrary",
    objectName: "presetMeal",
    indexName: "presetmeal",
    modelName: "PresetMeal",
    properties: [
      {
        name: "userId",
        type: "ID",
        fulltextSearch: false,
      },
      {
        name: "templateName",
        type: "String",
        fulltextSearch: true,
      },
      {
        name: "descriptionText",
        type: "String",
        fulltextSearch: false,
      },
      {
        name: "totalCalories",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "totalProtein",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "totalCarbohydrates",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "totalFat",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "totalSugar",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "totalFiber",
        type: "Double",
        fulltextSearch: false,
      },
    ],
  },
  {
    serviceName: "nutritionlibrary",
    objectName: "presetLine",
    indexName: "presetline",
    modelName: "PresetLine",
    properties: [
      {
        name: "presetMealId",
        type: "ID",
        fulltextSearch: false,
      },
      {
        name: "foodItemId",
        type: "ID",
        fulltextSearch: false,
      },
      {
        name: "lineFoodName",
        type: "String",
        fulltextSearch: false,
      },
      {
        name: "gramAmount",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "lineCalories",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "lineProtein",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "lineCarbohydrates",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "lineFat",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "lineSugar",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "lineFiber",
        type: "Double",
        fulltextSearch: false,
      },
    ],
  },
  {
    serviceName: "mealtracker",
    objectName: "mealLog",
    indexName: "meallog",
    modelName: "MealLog",
    properties: [
      {
        name: "userId",
        type: "ID",
        fulltextSearch: false,
      },
      {
        name: "mealDate",
        type: "Date",
        fulltextSearch: false,
      },
      {
        name: "mealTime",
        type: "String",
        fulltextSearch: false,
      },
      {
        name: "slotName",
        type: "String",
        fulltextSearch: false,
      },
      {
        name: "logSource",
        type: "Enum",
        fulltextSearch: false,
      },
      {
        name: "noteText",
        type: "String",
        fulltextSearch: false,
      },
      {
        name: "totalCalories",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "totalProtein",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "totalCarbohydrates",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "totalFat",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "totalSugar",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "totalFiber",
        type: "Double",
        fulltextSearch: false,
      },
    ],
  },
  {
    serviceName: "mealtracker",
    objectName: "mealLine",
    indexName: "mealline",
    modelName: "MealLine",
    properties: [
      {
        name: "userId",
        type: "ID",
        fulltextSearch: false,
      },
      {
        name: "mealLogId",
        type: "ID",
        fulltextSearch: false,
      },
      {
        name: "sourceFoodItemId",
        type: "ID",
        fulltextSearch: false,
      },
      {
        name: "sourcePresetMealId",
        type: "ID",
        fulltextSearch: false,
      },
      {
        name: "itemName",
        type: "String",
        fulltextSearch: false,
      },
      {
        name: "consumedGrams",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "itemCalories",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "itemProtein",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "itemCarbohydrates",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "itemFat",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "itemSugar",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "itemFiber",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "lineSource",
        type: "Enum",
        fulltextSearch: false,
      },
    ],
  },
  {
    serviceName: "mealtracker",
    objectName: "nutritionDay",
    indexName: "nutritionday",
    modelName: "NutritionDay",
    properties: [
      {
        name: "userId",
        type: "ID",
        fulltextSearch: false,
      },
      {
        name: "summaryDate",
        type: "Date",
        fulltextSearch: false,
      },
      {
        name: "consumedCalories",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "consumedProtein",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "consumedCarbohydrates",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "consumedFat",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "consumedSugar",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "consumedFiber",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "targetCalories",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "targetProtein",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "targetCarbohydrates",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "targetFat",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "targetSugar",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "targetFiber",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "exceededMetrics",
        type: "String",
        fulltextSearch: false,
      },
      {
        name: "mealCount",
        type: "Integer",
        fulltextSearch: false,
      },
    ],
  },
  {
    serviceName: "nutritionai",
    objectName: "aiSession",
    indexName: "aisession",
    modelName: "AiSession",
    properties: [
      {
        name: "userId",
        type: "ID",
        fulltextSearch: false,
      },
      {
        name: "sessionType",
        type: "Enum",
        fulltextSearch: false,
      },
      {
        name: "inputText",
        type: "Text",
        fulltextSearch: false,
      },
      {
        name: "detectedLanguage",
        type: "String",
        fulltextSearch: false,
      },
      {
        name: "sessionState",
        type: "Enum",
        fulltextSearch: false,
      },
      {
        name: "confidenceScore",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "finalResponseText",
        type: "Text",
        fulltextSearch: false,
      },
    ],
  },
  {
    serviceName: "nutritionai",
    objectName: "aiCandidateMeal",
    indexName: "aicandidatemeal",
    modelName: "AiCandidateMeal",
    properties: [
      {
        name: "userId",
        type: "ID",
        fulltextSearch: false,
      },
      {
        name: "aiSessionId",
        type: "ID",
        fulltextSearch: false,
      },
      {
        name: "proposedMealDate",
        type: "Date",
        fulltextSearch: false,
      },
      {
        name: "proposedMealTime",
        type: "String",
        fulltextSearch: false,
      },
      {
        name: "proposedSlotName",
        type: "String",
        fulltextSearch: false,
      },
      {
        name: "candidateSource",
        type: "Enum",
        fulltextSearch: false,
      },
      {
        name: "warningText",
        type: "Text",
        fulltextSearch: false,
      },
      {
        name: "confirmationRequired",
        type: "Boolean",
        fulltextSearch: false,
      },
      {
        name: "isConfirmed",
        type: "Boolean",
        fulltextSearch: false,
      },
      {
        name: "isCommitted",
        type: "Boolean",
        fulltextSearch: false,
      },
      {
        name: "totalCalories",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "totalProtein",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "totalCarbohydrates",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "totalFat",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "totalSugar",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "totalFiber",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "committedMealLogId",
        type: "ID",
        fulltextSearch: false,
      },
    ],
  },
  {
    serviceName: "nutritionai",
    objectName: "aiCandidateLine",
    indexName: "aicandidateline",
    modelName: "AiCandidateLine",
    properties: [
      {
        name: "userId",
        type: "ID",
        fulltextSearch: false,
      },
      {
        name: "aiCandidateMealId",
        type: "ID",
        fulltextSearch: false,
      },
      {
        name: "detectedFoodName",
        type: "String",
        fulltextSearch: false,
      },
      {
        name: "estimatedGrams",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "estimatedCalories",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "estimatedProtein",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "estimatedCarbohydrates",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "estimatedFat",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "estimatedSugar",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "estimatedFiber",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "quantityConfidence",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "nutritionReference",
        type: "String",
        fulltextSearch: false,
      },
      {
        name: "saveAsFood",
        type: "Boolean",
        fulltextSearch: false,
      },
    ],
  },
  {
    serviceName: "nutritionai",
    objectName: "aiGuidanceNote",
    indexName: "aiguidancenote",
    modelName: "AiGuidanceNote",
    properties: [
      {
        name: "userId",
        type: "ID",
        fulltextSearch: false,
      },
      {
        name: "aiSessionId",
        type: "ID",
        fulltextSearch: false,
      },
      {
        name: "questionType",
        type: "String",
        fulltextSearch: false,
      },
      {
        name: "contextRange",
        type: "String",
        fulltextSearch: false,
      },
      {
        name: "answerSummary",
        type: "Text",
        fulltextSearch: false,
      },
      {
        name: "rationaleText",
        type: "Text",
        fulltextSearch: false,
      },
      {
        name: "referencedMetricKeys",
        type: "String",
        fulltextSearch: false,
      },
      {
        name: "cautionText",
        type: "Text",
        fulltextSearch: false,
      },
    ],
  },
  {
    serviceName: "agenthub",
    objectName: "sys_agentOverride",
    indexName: "sys_agentoverride",
    modelName: "Sys_agentOverride",
    properties: [
      {
        name: "agentName",
        type: "String",
        fulltextSearch: false,
      },
      {
        name: "provider",
        type: "String",
        fulltextSearch: false,
      },
      {
        name: "model",
        type: "String",
        fulltextSearch: false,
      },
      {
        name: "systemPrompt",
        type: "Text",
        fulltextSearch: false,
      },
      {
        name: "temperature",
        type: "Double",
        fulltextSearch: false,
      },
      {
        name: "maxTokens",
        type: "Integer",
        fulltextSearch: false,
      },
      {
        name: "responseFormat",
        type: "String",
        fulltextSearch: false,
      },
      {
        name: "selectedTools",
        type: "Object",
        fulltextSearch: false,
      },
      {
        name: "guardrails",
        type: "Object",
        fulltextSearch: false,
      },
      {
        name: "enabled",
        type: "Boolean",
        fulltextSearch: false,
      },
      {
        name: "updatedBy",
        type: "ID",
        fulltextSearch: false,
      },
    ],
  },
  {
    serviceName: "agenthub",
    objectName: "sys_agentExecution",
    indexName: "sys_agentexecution",
    modelName: "Sys_agentExecution",
    properties: [
      {
        name: "agentName",
        type: "String",
        fulltextSearch: false,
      },
      {
        name: "agentType",
        type: "Enum",
        fulltextSearch: false,
      },
      {
        name: "source",
        type: "Enum",
        fulltextSearch: false,
      },
      {
        name: "userId",
        type: "ID",
        fulltextSearch: false,
      },
      {
        name: "input",
        type: "Object",
        fulltextSearch: false,
      },
      {
        name: "output",
        type: "Object",
        fulltextSearch: false,
      },
      {
        name: "toolCalls",
        type: "Integer",
        fulltextSearch: false,
      },
      {
        name: "tokenUsage",
        type: "Object",
        fulltextSearch: false,
      },
      {
        name: "durationMs",
        type: "Integer",
        fulltextSearch: false,
      },
      {
        name: "status",
        type: "Enum",
        fulltextSearch: false,
      },
      {
        name: "error",
        type: "Text",
        fulltextSearch: false,
      },
    ],
  },
  {
    serviceName: "agenthub",
    objectName: "sys_toolCatalog",
    indexName: "sys_toolcatalog",
    modelName: "Sys_toolCatalog",
    properties: [
      {
        name: "toolName",
        type: "String",
        fulltextSearch: false,
      },
      {
        name: "serviceName",
        type: "String",
        fulltextSearch: false,
      },
      {
        name: "description",
        type: "Text",
        fulltextSearch: false,
      },
      {
        name: "parameters",
        type: "Object",
        fulltextSearch: false,
      },
      {
        name: "lastRefreshed",
        type: "Date",
        fulltextSearch: false,
      },
    ],
  },
];

/**
 * JSON Query Block - Renders a single JSON with run button
 */
function JsonQueryBlock({ jsonContent, onRunQuery, isLoading, selectedIndex }) {
  return (
    <div className="my-2 rounded-lg overflow-hidden border border-amber-200 dark:border-amber-800">
      <div className="bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5 flex items-center justify-between border-b border-amber-200 dark:border-amber-800">
        <span className="text-xs font-medium text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5" />
          Elasticsearch Query
        </span>
        <button
          onClick={() => onRunQuery(jsonContent)}
          disabled={isLoading || !selectedIndex}
          className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded transition-colors"
        >
          {isLoading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Play className="w-3 h-3" />
          )}
          Run
        </button>
      </div>
      <pre className="bg-amber-50/50 dark:bg-amber-900/20 p-3 text-xs font-mono text-gray-800 dark:text-gray-200 overflow-x-auto">
        {JSON.stringify(jsonContent, null, 2)}
      </pre>
    </div>
  );
}

/**
 * Smart Console Block - Renders mixed content with text and multiple JSON blocks
 */
function ConsoleBlock({ content, onRunQuery, isLoading, selectedIndex }) {
  // Parse content into segments: text and JSON blocks
  const parseContent = (text) => {
    const segments = [];
    let remaining = text;

    // Pattern to match ```json blocks or raw JSON objects
    const jsonCodeBlockRegex = /```json\s*([\s\S]*?)\s*```/;
    const rawJsonRegex = /(\{[\s\S]*?\n\})/;

    while (remaining.length > 0) {
      // Try to find ```json block first
      const codeMatch = remaining.match(jsonCodeBlockRegex);
      // Try to find raw JSON block (multiline object starting with { and ending with })
      const rawMatch = remaining.match(rawJsonRegex);

      let firstMatch = null;
      let matchType = null;

      // Find which match comes first
      if (codeMatch && rawMatch) {
        if (codeMatch.index <= rawMatch.index) {
          firstMatch = codeMatch;
          matchType = "code";
        } else {
          firstMatch = rawMatch;
          matchType = "raw";
        }
      } else if (codeMatch) {
        firstMatch = codeMatch;
        matchType = "code";
      } else if (rawMatch) {
        firstMatch = rawMatch;
        matchType = "raw";
      }

      if (firstMatch && firstMatch.index !== undefined) {
        // Add text before the JSON block
        if (firstMatch.index > 0) {
          const textBefore = remaining.slice(0, firstMatch.index).trim();
          if (textBefore) {
            segments.push({ type: "text", content: textBefore });
          }
        }

        // Try to parse JSON
        const jsonStr =
          matchType === "code" ? firstMatch[1].trim() : firstMatch[1].trim();
        try {
          const jsonContent = JSON.parse(jsonStr);
          segments.push({ type: "json", content: jsonContent });
        } catch (e) {
          // Invalid JSON, treat as text
          segments.push({ type: "text", content: firstMatch[0] });
        }

        // Continue with remaining text
        remaining = remaining.slice(firstMatch.index + firstMatch[0].length);
      } else {
        // No more JSON blocks, add remaining as text
        const trimmed = remaining.trim();
        if (trimmed) {
          segments.push({ type: "text", content: trimmed });
        }
        break;
      }
    }

    return segments;
  };

  // Render markdown-like text content
  const renderText = (text, key) => {
    // Handle non-JSON code blocks
    const parts = text.split(/(```\w*\s*[\s\S]*?```)/g);

    return (
      <div
        key={key}
        className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
      >
        {parts.map((part, index) => {
          if (part.startsWith("```")) {
            const match = part.match(/```(\w*)\s*([\s\S]*?)```/);
            if (match) {
              const [, , code] = match;
              return (
                <pre
                  key={index}
                  className="my-2 bg-gray-100 dark:bg-gray-800 rounded p-2 text-xs font-mono overflow-x-auto"
                >
                  <code>{code.trim()}</code>
                </pre>
              );
            }
          }

          // Regular text with basic markdown
          return (
            <div key={index} className="whitespace-pre-wrap">
              {part.split("\n").map((line, lineIndex) => {
                // Headers
                if (line.startsWith("### ")) {
                  return (
                    <h4
                      key={lineIndex}
                      className="font-semibold text-gray-900 dark:text-white mt-2 mb-1"
                    >
                      {line.slice(4)}
                    </h4>
                  );
                }
                if (line.startsWith("## ")) {
                  return (
                    <h3
                      key={lineIndex}
                      className="font-semibold text-gray-900 dark:text-white mt-3 mb-1"
                    >
                      {line.slice(3)}
                    </h3>
                  );
                }
                if (line.startsWith("# ")) {
                  return (
                    <h2
                      key={lineIndex}
                      className="font-bold text-gray-900 dark:text-white mt-3 mb-1"
                    >
                      {line.slice(2)}
                    </h2>
                  );
                }
                // Bullet points
                if (line.startsWith("- ") || line.startsWith("* ")) {
                  return (
                    <div
                      key={lineIndex}
                      className="ml-4 before:content-['•'] before:mr-2 before:text-gray-400"
                    >
                      {line.slice(2)}
                    </div>
                  );
                }
                // Bold text
                const boldProcessed = line.replace(
                  /\*\*(.*?)\*\*/g,
                  "<strong>$1</strong>",
                );
                if (boldProcessed !== line) {
                  return (
                    <span
                      key={lineIndex}
                      dangerouslySetInnerHTML={{ __html: boldProcessed + "\n" }}
                    />
                  );
                }
                return (
                  <span key={lineIndex}>
                    {line}
                    {lineIndex < part.split("\n").length - 1 ? "\n" : ""}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  const segments = parseContent(content);

  return (
    <div className="space-y-1">
      {segments.map((segment, index) => {
        if (segment.type === "json") {
          return (
            <JsonQueryBlock
              key={index}
              jsonContent={segment.content}
              onRunQuery={onRunQuery}
              isLoading={isLoading}
              selectedIndex={selectedIndex}
            />
          );
        }
        return renderText(segment.content, index);
      })}
    </div>
  );
}

/**
 * ElasticSearchPage - Smart Console Interface
 */
export default function ElasticSearchPage() {
  // Index state
  const [elasticIndexes, setElasticIndexes] = useState(STATIC_ELASTIC_INDEXES);
  const [selectedIndex, setSelectedIndex] = useState(
    STATIC_ELASTIC_INDEXES[0] || null,
  );
  const [loadingIndexes, setLoadingIndexes] = useState(true);
  const [showIndexDropdown, setShowIndexDropdown] = useState(false);

  // Console state
  const [consoleContent, setConsoleContent] = useState([
    {
      type: "system",
      content:
        'Welcome to Elasticsearch Console. You can:\n- Write JSON queries directly\n- Ask questions starting with "?" (e.g., "? find all active users")\n- Take notes and keep multiple queries\n\nSelect an index above to get started.',
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Results state
  const [results, setResults] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState("");
  const [copied, setCopied] = useState(false);

  // Mapping state
  const [indexMapping, setIndexMapping] = useState(null);
  const [mappingLoading, setMappingLoading] = useState(false);

  // Index stats state
  const [indexStats, setIndexStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Admin operations state
  const [adminOperation, setAdminOperation] = useState(null); // 'rebuild', 'sync', 'rebuild-all', 'sync-all'
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminResult, setAdminResult] = useState(null);
  const [showAdminConfirm, setShowAdminConfirm] = useState(false);

  // Right panel view mode: 'results', 'mapping', or 'admin'
  const [rightPanelView, setRightPanelView] = useState("results");

  // Refs
  const consoleEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom of console
  const scrollToBottom = useCallback(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [consoleContent, scrollToBottom]);

  // Fetch available indices from BFF on mount
  useEffect(() => {
    const fetchIndices = async () => {
      try {
        const client = createMcpBffClient();
        const response = await client.get("/elastic/allIndices");
        const indices = response.data || [];

        const projectPrefix = "lrmwufitcheck_";
        const dynamicIndexes = indices.map((indexName) => {
          const objectName = indexName.startsWith(projectPrefix)
            ? indexName.substring(projectPrefix.length)
            : indexName;

          const staticMatch = STATIC_ELASTIC_INDEXES.find(
            (idx) => idx.indexName.toLowerCase() === objectName.toLowerCase(),
          );

          return {
            serviceName: staticMatch?.serviceName || "unknown",
            objectName: objectName,
            indexName: objectName,
            modelName: objectName.charAt(0).toUpperCase() + objectName.slice(1),
            properties: staticMatch?.properties || [],
          };
        });

        if (dynamicIndexes.length > 0) {
          setElasticIndexes(dynamicIndexes);
          setSelectedIndex(dynamicIndexes[0]);
        }
      } catch (err) {
        console.warn(
          "Failed to fetch indices from BFF, using static list:",
          err,
        );
      } finally {
        setLoadingIndexes(false);
      }
    };

    fetchIndices();
  }, []);

  // Fetch mapping and stats when selected index changes
  useEffect(() => {
    const fetchMapping = async () => {
      if (!selectedIndex) {
        setIndexMapping(null);
        return;
      }

      setMappingLoading(true);
      try {
        const client = createMcpBffClient();
        const response = await client.get(
          `/elastic/${selectedIndex.indexName}/schema`,
        );
        setIndexMapping(response.data);
      } catch (err) {
        console.warn("Failed to fetch mapping:", err);
        setIndexMapping(null);
      } finally {
        setMappingLoading(false);
      }
    };

    fetchMapping();
  }, [selectedIndex]);

  // Fetch index stats when selected index changes
  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedIndex) {
        setIndexStats(null);
        return;
      }

      setStatsLoading(true);
      try {
        const client = createMcpBffClient();
        const response = await client.get(
          `/elastic/${selectedIndex.indexName}/stats`,
        );
        setIndexStats(response.data);
      } catch (err) {
        console.warn("Failed to fetch stats:", err);
        setIndexStats(null);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [selectedIndex]);

  // Handle admin operations (rebuild/sync)
  const handleAdminOperation = async (operation) => {
    if (!operation) return;

    setAdminLoading(true);
    setAdminResult(null);
    setShowAdminConfirm(false);
    setRightPanelView("admin");

    try {
      const client = createMcpBffClient();
      let response;

      // Get service name for the selected index (used for single-index operations)
      const serviceName = selectedIndex?.serviceName;

      switch (operation) {
        case "rebuild":
          response = await client.post(
            `/elastic/admin/rebuild/${selectedIndex.indexName}?service=${serviceName}`,
          );
          break;
        case "sync":
          response = await client.post(
            `/elastic/admin/sync/${selectedIndex.indexName}?service=${serviceName}`,
          );
          break;
        case "rebuild-all":
          response = await client.post("/elastic/admin/rebuild-all");
          break;
        case "sync-all":
          response = await client.post("/elastic/admin/sync-all");
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      setAdminResult({ success: true, ...response.data });

      // Refresh stats and mapping after operation
      if (selectedIndex) {
        try {
          const statsResponse = await client.get(
            `/elastic/${selectedIndex.indexName}/stats`,
          );
          setIndexStats(statsResponse.data);
        } catch (statsErr) {
          console.warn("Failed to refresh stats:", statsErr);
        }

        try {
          const mappingResponse = await client.get(
            `/elastic/${selectedIndex.indexName}/schema`,
          );
          setIndexMapping(mappingResponse.data);
        } catch (mappingErr) {
          console.warn("Failed to refresh mapping:", mappingErr);
        }
      }
    } catch (err) {
      console.error("Admin operation failed:", err);
      setAdminResult({
        success: false,
        error:
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message,
      });
    } finally {
      setAdminLoading(false);
      setAdminOperation(null);
    }
  };

  // Trigger admin operation with confirmation
  const triggerAdminOperation = (operation) => {
    setAdminOperation(operation);
    setShowAdminConfirm(true);
  };

  // Run a query
  const handleRunQuery = async (queryBody) => {
    if (!selectedIndex) {
      setResultsError("Please select an index first");
      return;
    }

    // Switch to results tab when running a query
    setRightPanelView("results");
    setResultsLoading(true);
    setResultsError("");
    setResults(null);

    try {
      const client = createMcpBffClient();
      const response = await client.post(
        `/elastic/${selectedIndex.indexName}/rawsearch`,
        queryBody,
      );
      setResults(response.data);
    } catch (err) {
      console.error("Search error:", err);
      setResultsError(
        err.response?.data?.message ||
          err.response?.data?.reason ||
          err.message ||
          "Search failed",
      );
    } finally {
      setResultsLoading(false);
    }
  };

  // Handle console input submission
  const handleSubmit = async () => {
    const value = inputValue.trim();
    if (!value) return;

    // Add user input to console
    setConsoleContent((prev) => [...prev, { type: "user", content: value }]);
    setInputValue("");

    // Check if it's an AI question
    if (value.startsWith("?") || value.toLowerCase().startsWith("ask ")) {
      const question = value.startsWith("?")
        ? value.slice(1).trim()
        : value.slice(4).trim();

      if (!question) {
        setConsoleContent((prev) => [
          ...prev,
          {
            type: "system",
            content: 'Please provide a question after "?" or "ask"',
          },
        ]);
        return;
      }

      setIsProcessing(true);
      setConsoleContent((prev) => [
        ...prev,
        { type: "loading", content: "Thinking..." },
      ]);

      try {
        const client = createMcpBffClient();
        const response = await client.post("/elastic/query-builder", {
          prompt: question,
          indexName: selectedIndex?.indexName,
        });

        // Remove loading message and add AI response
        setConsoleContent((prev) => {
          const filtered = prev.filter((item) => item.type !== "loading");
          return [
            ...filtered,
            { type: "ai", content: response.data.explanation },
          ];
        });
      } catch (err) {
        setConsoleContent((prev) => {
          const filtered = prev.filter((item) => item.type !== "loading");
          return [
            ...filtered,
            {
              type: "error",
              content: `Error: ${err.response?.data?.message || err.message}`,
            },
          ];
        });
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Regular content (notes, JSON, etc.) - just keep it in console
      // It will be rendered by ConsoleBlock which detects JSON
    }

    inputRef.current?.focus();
  };

  // Handle key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Clear console
  const handleClearConsole = () => {
    setConsoleContent([
      { type: "system", content: "Console cleared. Ready for new queries." },
    ]);
  };

  // Copy results
  const handleCopyResults = () => {
    if (results) {
      navigator.clipboard.writeText(JSON.stringify(results, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Group indexes by service
  const indexesByService = elasticIndexes.reduce((acc, idx) => {
    if (!acc[idx.serviceName]) acc[idx.serviceName] = [];
    acc[idx.serviceName].push(idx);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Terminal className="w-6 h-6" />
          Elasticsearch Console
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Smart query console with AI assistance
        </p>
      </div>

      {/* Main Content - Split View */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left: Console */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Console Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Console
            </span>
            <button
              onClick={handleClearConsole}
              className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"
              title="Clear console"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>

          {/* Index Selector - Prominent placement */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                Target Index:
              </label>
              <div className="relative flex-1">
                <button
                  onClick={() => setShowIndexDropdown(!showIndexDropdown)}
                  disabled={loadingIndexes}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-500" />
                    {loadingIndexes ? (
                      <span className="text-gray-500 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading indexes...
                      </span>
                    ) : selectedIndex ? (
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedIndex.modelName}
                        <span className="ml-2 text-xs text-gray-500 font-normal">
                          ({selectedIndex.serviceName})
                        </span>
                      </span>
                    ) : (
                      <span className="text-gray-500">
                        Select an index to query...
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-gray-400 transition-transform",
                      showIndexDropdown && "rotate-180",
                    )}
                  />
                </button>

                {showIndexDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowIndexDropdown(false)}
                    />
                    <div className="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                      {Object.entries(indexesByService).map(
                        ([serviceName, indexes]) => (
                          <div key={serviceName}>
                            <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-gray-500 uppercase sticky top-0">
                              {serviceName}
                            </div>
                            {indexes.map((idx) => (
                              <button
                                key={`${idx.serviceName}-${idx.indexName}`}
                                onClick={() => {
                                  setSelectedIndex(idx);
                                  setShowIndexDropdown(false);
                                }}
                                className={cn(
                                  "w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between",
                                  selectedIndex?.indexName === idx.indexName
                                    ? "bg-primary-50 dark:bg-primary-900/20"
                                    : "",
                                )}
                              >
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {idx.modelName}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {idx.indexName}
                                </span>
                              </button>
                            ))}
                          </div>
                        ),
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Index Stats & Admin Actions */}
            {selectedIndex && (
              <div className="mt-3 flex items-center justify-between">
                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {statsLoading ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Loading stats...
                    </span>
                  ) : indexStats ? (
                    <>
                      <span className="flex items-center gap-1">
                        <BarChart3 className="w-3.5 h-3.5" />
                        {indexStats.docCount?.toLocaleString()} docs
                      </span>
                      <span>{indexStats.sizeFormatted}</span>
                    </>
                  ) : null}
                </div>

                {/* Admin Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => triggerAdminOperation("sync")}
                    disabled={adminLoading}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors disabled:opacity-50"
                    title="Sync index (add missing data without deleting)"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Sync
                  </button>
                  <button
                    onClick={() => triggerAdminOperation("rebuild")}
                    disabled={adminLoading}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded transition-colors disabled:opacity-50"
                    title="Rebuild index (delete and recreate)"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Rebuild
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Confirmation Modal */}
          {showAdminConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-amber-50 dark:bg-amber-900/20">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                    <AlertTriangle className="w-5 h-5" />
                    <h3 className="font-semibold">
                      Confirm{" "}
                      {adminOperation === "rebuild" ||
                      adminOperation === "rebuild-all"
                        ? "Rebuild"
                        : "Sync"}
                    </h3>
                  </div>
                </div>
                <div className="px-6 py-4">
                  {adminOperation === "rebuild" && (
                    <p className="text-gray-700 dark:text-gray-300">
                      This will{" "}
                      <span className="font-semibold text-red-600">delete</span>{" "}
                      the{" "}
                      <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">
                        {selectedIndex?.modelName}
                      </span>{" "}
                      index and rebuild it from the database. This may take a
                      while for large datasets.
                    </p>
                  )}
                  {adminOperation === "sync" && (
                    <p className="text-gray-700 dark:text-gray-300">
                      This will sync the{" "}
                      <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">
                        {selectedIndex?.modelName}
                      </span>{" "}
                      index with the database, adding any missing records
                      without deleting existing data.
                    </p>
                  )}
                  {adminOperation === "rebuild-all" && (
                    <p className="text-gray-700 dark:text-gray-300">
                      This will{" "}
                      <span className="font-semibold text-red-600">
                        delete and rebuild ALL
                      </span>{" "}
                      Elasticsearch indexes. This is a long operation and may
                      affect system performance.
                    </p>
                  )}
                  {adminOperation === "sync-all" && (
                    <p className="text-gray-700 dark:text-gray-300">
                      This will sync ALL Elasticsearch indexes with the
                      database, adding missing records to each index.
                    </p>
                  )}
                </div>
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowAdminConfirm(false);
                      setAdminOperation(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAdminOperation(adminOperation)}
                    className={cn(
                      "px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors",
                      adminOperation === "rebuild" ||
                        adminOperation === "rebuild-all"
                        ? "bg-amber-600 hover:bg-amber-700"
                        : "bg-blue-600 hover:bg-blue-700",
                    )}
                  >
                    {adminOperation === "rebuild" ||
                    adminOperation === "rebuild-all"
                      ? "Rebuild"
                      : "Sync"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Console Output */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {consoleContent.map((item, index) => (
              <div
                key={index}
                className={cn(
                  "rounded-lg px-3 py-2",
                  item.type === "system" &&
                    "bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800",
                  item.type === "user" && "bg-gray-100 dark:bg-gray-800",
                  item.type === "ai" &&
                    "bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800",
                  item.type === "error" &&
                    "bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-300",
                  item.type === "loading" &&
                    "bg-gray-50 dark:bg-gray-800 text-gray-500 animate-pulse",
                )}
              >
                {item.type === "ai" && (
                  <div className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Assistant
                  </div>
                )}
                {item.type === "loading" ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {item.content}
                  </div>
                ) : (
                  <ConsoleBlock
                    content={item.content}
                    onRunQuery={handleRunQuery}
                    isLoading={resultsLoading}
                    selectedIndex={selectedIndex}
                  />
                )}
              </div>
            ))}
            <div ref={consoleEndRef} />
          </div>

          {/* Console Input */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-3">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Type JSON query, notes, or "? your question" for AI help...'
                className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                rows={2}
                disabled={isProcessing}
              />
              <button
                onClick={handleSubmit}
                disabled={isProcessing || !inputValue.trim()}
                className="px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg transition-colors flex items-center"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Press{" "}
              <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
                Enter
              </kbd>{" "}
              to send,{" "}
              <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
                Shift+Enter
              </kbd>{" "}
              for new line
            </div>
          </div>
        </div>

        {/* Right: Results/Mapping Panel */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Panel Header with Tabs */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center gap-1">
              {/* Results Tab */}
              <button
                onClick={() => setRightPanelView("results")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                  rightPanelView === "results"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
                )}
              >
                <Search className="w-4 h-4" />
                Results
                {results && rightPanelView === "results" && (
                  <span className="text-xs text-gray-500 font-normal">
                    (
                    {typeof results.total === "object"
                      ? (results.total?.value ?? 0)
                      : (results.total ?? results.hits?.length ?? 0)}
                    )
                  </span>
                )}
              </button>

              {/* Mapping Tab */}
              <button
                onClick={() => setRightPanelView("mapping")}
                disabled={!selectedIndex}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                  rightPanelView === "mapping"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
                  !selectedIndex && "opacity-50 cursor-not-allowed",
                )}
              >
                <FileJson className="w-4 h-4" />
                Mapping
                {mappingLoading && <Loader2 className="w-3 h-3 animate-spin" />}
              </button>

              {/* Admin Tab */}
              <button
                onClick={() => setRightPanelView("admin")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                  rightPanelView === "admin"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
                )}
              >
                <Settings className="w-4 h-4" />
                Admin
                {adminLoading && <Loader2 className="w-3 h-3 animate-spin" />}
              </button>
            </div>

            {/* Copy Button */}
            {((rightPanelView === "results" && results) ||
              (rightPanelView === "mapping" && indexMapping) ||
              (rightPanelView === "admin" && adminResult)) && (
              <button
                onClick={() => {
                  const content =
                    rightPanelView === "results"
                      ? results
                      : rightPanelView === "mapping"
                        ? indexMapping
                        : adminResult;
                  navigator.clipboard.writeText(
                    JSON.stringify(content, null, 2),
                  );
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-xs text-gray-500 hover:text-primary-600 flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </button>
            )}
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-auto p-4">
            {rightPanelView === "results" ? (
              /* Results View */
              resultsLoading ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Executing query...
                </div>
              ) : resultsError ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-medium mb-2">
                    <X className="w-4 h-4" />
                    Query Error
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {resultsError}
                  </p>
                </div>
              ) : results ? (
                <pre className="text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {JSON.stringify(results, null, 2)}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Search className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm">Run a query to see results</p>
                  <p className="text-xs mt-1">
                    Click "Run" on any JSON block in the console
                  </p>
                </div>
              )
            ) : rightPanelView === "mapping" ? (
              /* Mapping View */
              mappingLoading ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Loading mapping...
                </div>
              ) : indexMapping ? (
                <div>
                  <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                    Index mapping for{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {selectedIndex?.modelName}
                    </span>
                  </div>
                  <pre className="text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    {JSON.stringify(indexMapping, null, 2)}
                  </pre>
                </div>
              ) : selectedIndex ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <FileJson className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm">No mapping available for this index</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Database className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm">Select an index to view its mapping</p>
                </div>
              )
            ) : (
              /* Admin View */
              <div className="space-y-6">
                {/* Admin Actions */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Index Management
                  </h3>

                  {/* Selected Index Actions */}
                  {selectedIndex ? (
                    <div className="space-y-3">
                      <div className="text-xs text-gray-500 mb-2">
                        Actions for{" "}
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          {selectedIndex.modelName}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => triggerAdminOperation("sync")}
                          disabled={adminLoading}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Sync Index
                        </button>
                        <button
                          onClick={() => triggerAdminOperation("rebuild")}
                          disabled={adminLoading}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Rebuild Index
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Select an index to perform actions
                    </div>
                  )}

                  {/* Global Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 mb-2">
                      Global Actions (All Indexes)
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => triggerAdminOperation("sync-all")}
                        disabled={adminLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Sync All
                      </button>
                      <button
                        onClick={() => triggerAdminOperation("rebuild-all")}
                        disabled={adminLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Rebuild All
                      </button>
                    </div>
                  </div>
                </div>

                {/* Operation Result */}
                {adminLoading ? (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      <div>
                        <div className="font-medium text-blue-700 dark:text-blue-300">
                          Operation in progress...
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">
                          This may take a while for large indexes
                        </div>
                      </div>
                    </div>
                  </div>
                ) : adminResult ? (
                  <div
                    className={cn(
                      "rounded-lg p-4 border",
                      adminResult.success
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-2 font-medium mb-2",
                        adminResult.success
                          ? "text-green-700 dark:text-green-300"
                          : "text-red-700 dark:text-red-300",
                      )}
                    >
                      {adminResult.success ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <X className="w-5 h-5" />
                      )}
                      {adminResult.success
                        ? "Operation Completed"
                        : "Operation Failed"}
                    </div>

                    {adminResult.success ? (
                      <div className="space-y-2 text-sm">
                        {adminResult.indexed !== undefined && (
                          <div className="text-green-600 dark:text-green-400">
                            Indexed:{" "}
                            <span className="font-semibold">
                              {adminResult.indexed?.toLocaleString()}
                            </span>{" "}
                            documents
                          </div>
                        )}
                        {adminResult.totalIndexed !== undefined && (
                          <div className="text-green-600 dark:text-green-400">
                            Total Indexed:{" "}
                            <span className="font-semibold">
                              {adminResult.totalIndexed?.toLocaleString()}
                            </span>{" "}
                            documents
                          </div>
                        )}
                        {adminResult.durationMs && (
                          <div className="text-green-600 dark:text-green-400">
                            Duration:{" "}
                            <span className="font-semibold">
                              {(adminResult.durationMs / 1000).toFixed(2)}s
                            </span>
                          </div>
                        )}
                        {adminResult.docsPerSecond && (
                          <div className="text-green-600 dark:text-green-400">
                            Speed:{" "}
                            <span className="font-semibold">
                              {adminResult.docsPerSecond?.toLocaleString()}
                            </span>{" "}
                            docs/sec
                          </div>
                        )}
                        {adminResult.objects && (
                          <div className="mt-3">
                            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                              Per-Index Results:
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded p-2 max-h-40 overflow-y-auto">
                              {adminResult.objects.map((obj, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-gray-700 last:border-0"
                                >
                                  <span className="font-medium">
                                    {obj.name}
                                  </span>
                                  <span
                                    className={
                                      obj.success
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }
                                  >
                                    {obj.success
                                      ? `${obj.indexed} docs`
                                      : "Failed"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-red-600 dark:text-red-400">
                        {adminResult.error}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">
                      Use the buttons above to manage indexes
                    </p>
                    <p className="text-xs mt-1">
                      <span className="text-blue-500">Sync</span> adds missing
                      data, <span className="text-amber-500">Rebuild</span>{" "}
                      recreates the index
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
