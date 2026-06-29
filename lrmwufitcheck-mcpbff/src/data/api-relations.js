/**
 * Auto-generated API Relations Metadata
 *
 * This file contains relationship information for all business APIs.
 * Used by the AI Complete feature to resolve foreign keys and generate test data.
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 */

const API_RELATIONS = {
  invitationcenter: {
    dataObjects: {
      inviteLink: {
        usageMode: {
          type: "enum",
          values: ["singleUse", "limitedUse"],
        },
        inviteState: {
          type: "enum",
          values: [
            "draft",
            "active",
            "exhausted",
            "revoked",
            "expired",
            "consumed",
          ],
        },
      },
      inviteAudit: {
        inviteLinkId: {
          type: "foreignKey",
          targetService: "invitationcenter",
          targetObject: "inviteLink",
          relationName: "inviteLink",
          listApi: "listinviteLinks",
          labelFields: ["name", "title", "fullname", "label"],
        },
        eventType: {
          type: "enum",
          values: [
            "created",
            "activated",
            "delivered",
            "validated",
            "consumed",
            "revoked",
            "expired",
          ],
        },
      },
    },
    apis: {
      createInviteLink: {
        crudType: "create",
        dataObject: "inviteLink",
        relations: {
          usageMode: {
            type: "enum",
            values: ["singleUse", "limitedUse"],
          },
          inviteState: {
            type: "enum",
            values: [
              "draft",
              "active",
              "exhausted",
              "revoked",
              "expired",
              "consumed",
            ],
          },
        },
      },
      activateInviteLink: {
        crudType: "update",
        dataObject: "inviteLink",
        relations: {
          usageMode: {
            type: "enum",
            values: ["singleUse", "limitedUse"],
          },
          inviteState: {
            type: "enum",
            values: [
              "draft",
              "active",
              "exhausted",
              "revoked",
              "expired",
              "consumed",
            ],
          },
        },
      },
      revokeInviteLink: {
        crudType: "update",
        dataObject: "inviteLink",
        relations: {
          usageMode: {
            type: "enum",
            values: ["singleUse", "limitedUse"],
          },
          inviteState: {
            type: "enum",
            values: [
              "draft",
              "active",
              "exhausted",
              "revoked",
              "expired",
              "consumed",
            ],
          },
        },
      },
      deliverInviteEmail: {
        crudType: "update",
        dataObject: "inviteLink",
        relations: {
          usageMode: {
            type: "enum",
            values: ["singleUse", "limitedUse"],
          },
          inviteState: {
            type: "enum",
            values: [
              "draft",
              "active",
              "exhausted",
              "revoked",
              "expired",
              "consumed",
            ],
          },
        },
      },
      validateInviteCode: {
        crudType: "update",
        dataObject: "inviteLink",
        relations: {
          usageMode: {
            type: "enum",
            values: ["singleUse", "limitedUse"],
          },
          inviteState: {
            type: "enum",
            values: [
              "draft",
              "active",
              "exhausted",
              "revoked",
              "expired",
              "consumed",
            ],
          },
        },
      },
      consumeInviteLink: {
        crudType: "update",
        dataObject: "inviteLink",
        relations: {
          usageMode: {
            type: "enum",
            values: ["singleUse", "limitedUse"],
          },
          inviteState: {
            type: "enum",
            values: [
              "draft",
              "active",
              "exhausted",
              "revoked",
              "expired",
              "consumed",
            ],
          },
        },
      },
    },
  },
  nutritionlibrary: {
    dataObjects: {
      macroTarget: {
        userId: {
          type: "foreignKey",
          targetService: "auth",
          targetObject: "user",
          relationName: "user",
          listApi: "listusers",
          labelFields: ["name", "title", "fullname", "label"],
        },
      },
      foodItem: {
        userId: {
          type: "foreignKey",
          targetService: "auth",
          targetObject: "user",
          relationName: "user",
          listApi: "listusers",
          labelFields: ["name", "title", "fullname", "label"],
        },
        creationSource: {
          type: "enum",
          values: ["manualEntry", "aiAssistant"],
        },
      },
      presetMeal: {
        userId: {
          type: "foreignKey",
          targetService: "auth",
          targetObject: "user",
          relationName: "user",
          listApi: "listusers",
          labelFields: ["name", "title", "fullname", "label"],
        },
      },
      presetLine: {
        presetMealId: {
          type: "foreignKey",
          targetService: "nutritionlibrary",
          targetObject: "presetMeal",
          relationName: "presetMeal",
          listApi: "listpresetMeals",
          labelFields: ["name", "title", "fullname", "label"],
        },
        foodItemId: {
          type: "foreignKey",
          targetService: "nutritionlibrary",
          targetObject: "foodItem",
          relationName: "foodItem",
          listApi: "listfoodItems",
          labelFields: ["name", "title", "fullname", "label"],
        },
      },
    },
    apis: {
      setMacroTarget: {
        crudType: "create",
        dataObject: "macroTarget",
        relations: {
          userId: {
            type: "foreignKey",
            targetService: "auth",
            targetObject: "user",
            relationName: "user",
            listApi: "listusers",
            labelFields: ["name", "title", "fullname", "label"],
          },
        },
      },
      createFoodItem: {
        crudType: "create",
        dataObject: "foodItem",
        relations: {
          userId: {
            type: "foreignKey",
            targetService: "auth",
            targetObject: "user",
            relationName: "user",
            listApi: "listusers",
            labelFields: ["name", "title", "fullname", "label"],
          },
          creationSource: {
            type: "enum",
            values: ["manualEntry", "aiAssistant"],
          },
        },
      },
      updateFoodItem: {
        crudType: "update",
        dataObject: "foodItem",
        relations: {
          userId: {
            type: "foreignKey",
            targetService: "auth",
            targetObject: "user",
            relationName: "user",
            listApi: "listusers",
            labelFields: ["name", "title", "fullname", "label"],
          },
          creationSource: {
            type: "enum",
            values: ["manualEntry", "aiAssistant"],
          },
        },
      },
      createPresetMeal: {
        crudType: "create",
        dataObject: "presetMeal",
        relations: {
          userId: {
            type: "foreignKey",
            targetService: "auth",
            targetObject: "user",
            relationName: "user",
            listApi: "listusers",
            labelFields: ["name", "title", "fullname", "label"],
          },
        },
      },
      updatePresetMeal: {
        crudType: "update",
        dataObject: "presetMeal",
        relations: {
          userId: {
            type: "foreignKey",
            targetService: "auth",
            targetObject: "user",
            relationName: "user",
            listApi: "listusers",
            labelFields: ["name", "title", "fullname", "label"],
          },
        },
      },
      addPresetLine: {
        crudType: "create",
        dataObject: "presetLine",
        relations: {
          presetMealId: {
            type: "foreignKey",
            targetService: "nutritionlibrary",
            targetObject: "presetMeal",
            relationName: "presetMeal",
            listApi: "listpresetMeals",
            labelFields: ["name", "title", "fullname", "label"],
          },
          foodItemId: {
            type: "foreignKey",
            targetService: "nutritionlibrary",
            targetObject: "foodItem",
            relationName: "foodItem",
            listApi: "listfoodItems",
            labelFields: ["name", "title", "fullname", "label"],
          },
        },
      },
    },
  },
  mealtracker: {
    dataObjects: {
      mealLog: {
        userId: {
          type: "foreignKey",
          targetService: "auth",
          targetObject: "user",
          relationName: "user",
          listApi: "listusers",
          labelFields: ["name", "title", "fullname", "label"],
          implicit: true,
        },
        logSource: {
          type: "enum",
          values: [
            "foodLibrary",
            "presetTemplate",
            "manualEntry",
            "aiAssistant",
          ],
        },
      },
      mealLine: {
        userId: {
          type: "foreignKey",
          targetService: "auth",
          targetObject: "user",
          relationName: "user",
          listApi: "listusers",
          labelFields: ["name", "title", "fullname", "label"],
          implicit: true,
        },
        mealLogId: {
          type: "foreignKey",
          targetService: "mealtracker",
          targetObject: "mealLog",
          relationName: "mealLog",
          listApi: "listmealLogs",
          labelFields: ["name", "title", "fullname", "label"],
        },
        lineSource: {
          type: "enum",
          values: [
            "foodLibrary",
            "presetTemplate",
            "manualEntry",
            "aiAssistant",
            "temporaryAi",
          ],
        },
      },
      nutritionDay: {
        userId: {
          type: "foreignKey",
          targetService: "auth",
          targetObject: "user",
          relationName: "user",
          listApi: "listusers",
          labelFields: ["name", "title", "fullname", "label"],
          implicit: true,
        },
      },
    },
    apis: {
      createMealLog: {
        crudType: "create",
        dataObject: "mealLog",
        relations: {
          userId: {
            type: "foreignKey",
            targetService: "auth",
            targetObject: "user",
            relationName: "user",
            listApi: "listusers",
            labelFields: ["name", "title", "fullname", "label"],
            implicit: true,
          },
          logSource: {
            type: "enum",
            values: [
              "foodLibrary",
              "presetTemplate",
              "manualEntry",
              "aiAssistant",
            ],
          },
        },
      },
      updateMealLog: {
        crudType: "update",
        dataObject: "mealLog",
        relations: {
          userId: {
            type: "foreignKey",
            targetService: "auth",
            targetObject: "user",
            relationName: "user",
            listApi: "listusers",
            labelFields: ["name", "title", "fullname", "label"],
            implicit: true,
          },
          logSource: {
            type: "enum",
            values: [
              "foodLibrary",
              "presetTemplate",
              "manualEntry",
              "aiAssistant",
            ],
          },
        },
      },
      createMealLine: {
        crudType: "create",
        dataObject: "mealLine",
        relations: {
          userId: {
            type: "foreignKey",
            targetService: "auth",
            targetObject: "user",
            relationName: "user",
            listApi: "listusers",
            labelFields: ["name", "title", "fullname", "label"],
            implicit: true,
          },
          mealLogId: {
            type: "foreignKey",
            targetService: "mealtracker",
            targetObject: "mealLog",
            relationName: "mealLog",
            listApi: "listmealLogs",
            labelFields: ["name", "title", "fullname", "label"],
          },
          lineSource: {
            type: "enum",
            values: [
              "foodLibrary",
              "presetTemplate",
              "manualEntry",
              "aiAssistant",
              "temporaryAi",
            ],
          },
        },
      },
      updateMealLine: {
        crudType: "update",
        dataObject: "mealLine",
        relations: {
          userId: {
            type: "foreignKey",
            targetService: "auth",
            targetObject: "user",
            relationName: "user",
            listApi: "listusers",
            labelFields: ["name", "title", "fullname", "label"],
            implicit: true,
          },
          mealLogId: {
            type: "foreignKey",
            targetService: "mealtracker",
            targetObject: "mealLog",
            relationName: "mealLog",
            listApi: "listmealLogs",
            labelFields: ["name", "title", "fullname", "label"],
          },
          lineSource: {
            type: "enum",
            values: [
              "foodLibrary",
              "presetTemplate",
              "manualEntry",
              "aiAssistant",
              "temporaryAi",
            ],
          },
        },
      },
      triggerDailyReminderCheck: {
        crudType: "update",
        dataObject: "nutritionDay",
        relations: {
          userId: {
            type: "foreignKey",
            targetService: "auth",
            targetObject: "user",
            relationName: "user",
            listApi: "listusers",
            labelFields: ["name", "title", "fullname", "label"],
            implicit: true,
          },
        },
      },
      triggerDailySummary: {
        crudType: "update",
        dataObject: "nutritionDay",
        relations: {
          userId: {
            type: "foreignKey",
            targetService: "auth",
            targetObject: "user",
            relationName: "user",
            listApi: "listusers",
            labelFields: ["name", "title", "fullname", "label"],
            implicit: true,
          },
        },
      },
    },
  },
  nutritionai: {
    dataObjects: {
      aiSession: {
        userId: {
          type: "foreignKey",
          targetService: "auth",
          targetObject: "user",
          relationName: "user",
          listApi: "listusers",
          labelFields: ["name", "title", "fullname", "label"],
          implicit: true,
        },
        sessionType: {
          type: "enum",
          values: ["mealParsing", "nutritionGuidance"],
        },
        sessionState: {
          type: "enum",
          values: ["pending", "needsConfirmation", "completed", "failed"],
        },
      },
      aiCandidateMeal: {
        userId: {
          type: "foreignKey",
          targetService: "auth",
          targetObject: "user",
          relationName: "user",
          listApi: "listusers",
          labelFields: ["name", "title", "fullname", "label"],
          implicit: true,
        },
        aiSessionId: {
          type: "foreignKey",
          targetService: "nutritionai",
          targetObject: "aiSession",
          relationName: "session",
          listApi: "listaiSessions",
          labelFields: ["name", "title", "fullname", "label"],
        },
        candidateSource: {
          type: "enum",
          values: ["aiAssistant"],
        },
      },
      aiCandidateLine: {
        userId: {
          type: "foreignKey",
          targetService: "auth",
          targetObject: "user",
          relationName: "user",
          listApi: "listusers",
          labelFields: ["name", "title", "fullname", "label"],
          implicit: true,
        },
        aiCandidateMealId: {
          type: "foreignKey",
          targetService: "nutritionai",
          targetObject: "aiCandidateMeal",
          relationName: "candidateMeal",
          listApi: "listaiCandidateMeals",
          labelFields: ["name", "title", "fullname", "label"],
        },
      },
      aiGuidanceNote: {
        userId: {
          type: "foreignKey",
          targetService: "auth",
          targetObject: "user",
          relationName: "user",
          listApi: "listusers",
          labelFields: ["name", "title", "fullname", "label"],
          implicit: true,
        },
        aiSessionId: {
          type: "foreignKey",
          targetService: "nutritionai",
          targetObject: "aiSession",
          relationName: "session",
          listApi: "listaiSessions",
          labelFields: ["name", "title", "fullname", "label"],
        },
      },
    },
    apis: {
      parseMeal: {
        crudType: "create",
        dataObject: "aiSession",
        relations: {
          userId: {
            type: "foreignKey",
            targetService: "auth",
            targetObject: "user",
            relationName: "user",
            listApi: "listusers",
            labelFields: ["name", "title", "fullname", "label"],
            implicit: true,
          },
          sessionType: {
            type: "enum",
            values: ["mealParsing", "nutritionGuidance"],
          },
          sessionState: {
            type: "enum",
            values: ["pending", "needsConfirmation", "completed", "failed"],
          },
        },
      },
      confirmCandidateMeal: {
        crudType: "update",
        dataObject: "aiCandidateMeal",
        relations: {
          userId: {
            type: "foreignKey",
            targetService: "auth",
            targetObject: "user",
            relationName: "user",
            listApi: "listusers",
            labelFields: ["name", "title", "fullname", "label"],
            implicit: true,
          },
          aiSessionId: {
            type: "foreignKey",
            targetService: "nutritionai",
            targetObject: "aiSession",
            relationName: "session",
            listApi: "listaiSessions",
            labelFields: ["name", "title", "fullname", "label"],
          },
          candidateSource: {
            type: "enum",
            values: ["aiAssistant"],
          },
        },
      },
      askNutritionQuestion: {
        crudType: "create",
        dataObject: "aiSession",
        relations: {
          userId: {
            type: "foreignKey",
            targetService: "auth",
            targetObject: "user",
            relationName: "user",
            listApi: "listusers",
            labelFields: ["name", "title", "fullname", "label"],
            implicit: true,
          },
          sessionType: {
            type: "enum",
            values: ["mealParsing", "nutritionGuidance"],
          },
          sessionState: {
            type: "enum",
            values: ["pending", "needsConfirmation", "completed", "failed"],
          },
        },
      },
      updateAiCandidateLine: {
        crudType: "update",
        dataObject: "aiCandidateLine",
        relations: {
          userId: {
            type: "foreignKey",
            targetService: "auth",
            targetObject: "user",
            relationName: "user",
            listApi: "listusers",
            labelFields: ["name", "title", "fullname", "label"],
            implicit: true,
          },
          aiCandidateMealId: {
            type: "foreignKey",
            targetService: "nutritionai",
            targetObject: "aiCandidateMeal",
            relationName: "candidateMeal",
            listApi: "listaiCandidateMeals",
            labelFields: ["name", "title", "fullname", "label"],
          },
        },
      },
      rejectCandidateMeal: {
        crudType: "update",
        dataObject: "aiCandidateMeal",
        relations: {
          userId: {
            type: "foreignKey",
            targetService: "auth",
            targetObject: "user",
            relationName: "user",
            listApi: "listusers",
            labelFields: ["name", "title", "fullname", "label"],
            implicit: true,
          },
          aiSessionId: {
            type: "foreignKey",
            targetService: "nutritionai",
            targetObject: "aiSession",
            relationName: "session",
            listApi: "listaiSessions",
            labelFields: ["name", "title", "fullname", "label"],
          },
          candidateSource: {
            type: "enum",
            values: ["aiAssistant"],
          },
        },
      },
    },
  },
  agenthub: {
    dataObjects: {
      sys_agentExecution: {
        agentType: {
          type: "enum",
          values: ["design", "dynamic"],
        },
        source: {
          type: "enum",
          values: ["rest", "sse", "kafka", "agent"],
        },
        userId: {
          type: "foreignKey",
          targetService: "auth",
          targetObject: "user",
          relationName: "user",
          listApi: "listusers",
          labelFields: ["name", "title", "fullname", "label"],
          implicit: true,
        },
        status: {
          type: "enum",
          values: ["success", "error", "timeout"],
        },
      },
    },
    apis: {
      createAgentOverride: {
        crudType: "create",
        dataObject: "sys_agentOverride",
        relations: {},
      },
      updateAgentOverride: {
        crudType: "update",
        dataObject: "sys_agentOverride",
        relations: {},
      },
    },
  },
};

/**
 * Get relations for a specific API
 */
const getApiRelations = (serviceName, apiName) => {
  const service = API_RELATIONS[serviceName?.toLowerCase()];
  if (!service) return null;
  return service.apis[apiName] || null;
};

/**
 * Get relations for a specific data object
 */
const getObjectRelations = (serviceName, objectName) => {
  const service = API_RELATIONS[serviceName?.toLowerCase()];
  if (!service) return null;
  return service.dataObjects[objectName] || null;
};

/**
 * Get all foreign key relations for an API
 */
const getForeignKeyRelations = (serviceName, apiName) => {
  const apiInfo = getApiRelations(serviceName, apiName);
  if (!apiInfo) return {};

  const fkRelations = {};
  for (const [propName, relation] of Object.entries(apiInfo.relations)) {
    if (relation.type === "foreignKey") {
      fkRelations[propName] = relation;
    }
  }
  return fkRelations;
};

/**
 * Get session-based fields for an API
 */
const getSessionFields = (serviceName, apiName) => {
  const apiInfo = getApiRelations(serviceName, apiName);
  if (!apiInfo) return {};

  const sessionFields = {};
  for (const [propName, relation] of Object.entries(apiInfo.relations)) {
    if (relation.type === "session") {
      sessionFields[propName] = relation;
    }
  }
  return sessionFields;
};

/**
 * Get enum fields for an API
 */
const getEnumFields = (serviceName, apiName) => {
  const apiInfo = getApiRelations(serviceName, apiName);
  if (!apiInfo) return {};

  const enumFields = {};
  for (const [propName, relation] of Object.entries(apiInfo.relations)) {
    if (relation.type === "enum") {
      enumFields[propName] = relation;
    }
  }
  return enumFields;
};

module.exports = {
  API_RELATIONS,
  getApiRelations,
  getObjectRelations,
  getForeignKeyRelations,
  getSessionFields,
  getEnumFields,
};
