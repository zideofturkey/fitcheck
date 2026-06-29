class ToolRegistry {
  constructor() {
    this._tools = new Map();
  }

  register(name, definition, handler) {
    this._tools.set(name, { definition, handler });
  }

  registerCrudTools(dataObjectName, dbFunctions) {
    const baseName =
      dataObjectName.charAt(0).toLowerCase() + dataObjectName.slice(1);

    if (dbFunctions.create) {
      this.register(
        `create_${baseName}`,
        {
          name: `create_${baseName}`,
          description: `Create a new ${dataObjectName} record`,
          parameters: {
            type: "object",
            properties: {
              data: { type: "object", description: "The data to create" },
            },
            required: ["data"],
          },
        },
        async (args) => dbFunctions.create(args.data),
      );
    }

    if (dbFunctions.getById) {
      this.register(
        `get_${baseName}`,
        {
          name: `get_${baseName}`,
          description: `Get a ${dataObjectName} record by ID`,
          parameters: {
            type: "object",
            properties: { id: { type: "string", description: "Record ID" } },
            required: ["id"],
          },
        },
        async (args) => dbFunctions.getById(args.id),
      );
    }

    if (dbFunctions.update) {
      this.register(
        `update_${baseName}`,
        {
          name: `update_${baseName}`,
          description: `Update a ${dataObjectName} record`,
          parameters: {
            type: "object",
            properties: { id: { type: "string" }, data: { type: "object" } },
            required: ["id", "data"],
          },
        },
        async (args) => dbFunctions.update(args.id, args.data),
      );
    }

    if (dbFunctions.remove) {
      this.register(
        `delete_${baseName}`,
        {
          name: `delete_${baseName}`,
          description: `Delete a ${dataObjectName} record`,
          parameters: {
            type: "object",
            properties: { id: { type: "string" } },
            required: ["id"],
          },
        },
        async (args) => dbFunctions.remove(args.id),
      );
    }

    if (dbFunctions.list) {
      this.register(
        `list_${baseName}`,
        {
          name: `list_${baseName}`,
          description: `List ${dataObjectName} records`,
          parameters: {
            type: "object",
            properties: {
              where: { type: "object", description: "Filter criteria" },
              limit: { type: "integer" },
            },
          },
        },
        async (args) => dbFunctions.list(args.where, args.limit),
      );
    }
  }

  registerApiTool(apiName, handler, schema) {
    this.register(
      apiName,
      {
        name: apiName,
        description: schema?.description ?? `Execute the ${apiName} API`,
        parameters: schema?.parameters ?? { type: "object", properties: {} },
      },
      handler,
    );
  }

  registerAgentTool(agentName, agentRuntime) {
    this.register(
      `invoke_agent_${agentName}`,
      {
        name: `invoke_agent_${agentName}`,
        description: `Invoke the ${agentName} AI agent as a tool`,
        parameters: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "The input message for the agent",
            },
          },
          required: ["message"],
        },
      },
      async (args) => {
        const fakeRequest = { body: { message: args.message } };
        return agentRuntime.execute(fakeRequest, null);
      },
    );
  }

  registerLibraryTool(functionName, handler, schema) {
    this.register(
      functionName,
      {
        name: functionName,
        description:
          schema?.description ?? `Call library function ${functionName}`,
        parameters: schema?.parameters ?? { type: "object", properties: {} },
      },
      handler,
    );
  }

  registerIntegrationTool(provider, methodName, schema, clientGetter) {
    const toolName = `integration_${provider}_${methodName}`;
    this.register(
      toolName,
      {
        name: toolName,
        description: schema.description || `Call ${provider}.${methodName}`,
        parameters: schema.parameters || { type: "object", properties: {} },
      },
      async (args) => {
        const client = await clientGetter(provider);
        return client[methodName](args);
      },
    );
  }

  registerIntegrationDispatcher(provider, methodCatalog, clientGetter) {
    const toolName = `integration_${provider}`;
    const catalogText = methodCatalog
      .map((m) => `- ${m.name}: ${m.description || "No description"}`)
      .join("\n");
    this.register(
      toolName,
      {
        name: toolName,
        description: `Call any method on the ${provider} integration.\n\nAvailable methods:\n${catalogText}\n\nUse getIntegrationMethodDoc to look up exact parameters before calling.`,
        parameters: {
          type: "object",
          properties: {
            method: { type: "string", description: "The method name to call" },
            params: {
              type: "object",
              description: "Parameters to pass to the method",
            },
          },
          required: ["method"],
        },
      },
      async (args) => {
        const client = await clientGetter(provider);
        const fn = client[args.method];
        if (typeof fn !== "function") {
          return {
            error: `Method "${args.method}" not found on integration "${provider}"`,
          };
        }
        return fn.call(client, args.params ?? {});
      },
    );
  }

  registerIntegrationMethodDoc(docsMap) {
    if (this._tools.has("getIntegrationMethodDoc")) return;
    this.register(
      "getIntegrationMethodDoc",
      {
        name: "getIntegrationMethodDoc",
        description:
          "Look up the full method signature (parameters, types, required fields, return type) for an integration method. Call this before using a dispatcher tool when you need exact parameter details.",
        parameters: {
          type: "object",
          properties: {
            integrationName: {
              type: "string",
              description: "The integration provider key",
            },
            methodName: {
              type: "string",
              description: "The method name to look up",
            },
          },
          required: ["integrationName", "methodName"],
        },
      },
      async (args) => {
        const providerDocs = docsMap[args.integrationName];
        if (!providerDocs)
          return {
            error: `No documentation found for integration: ${args.integrationName}`,
          };
        const methodDoc = providerDocs[args.methodName];
        if (!methodDoc)
          return {
            error: `Method "${args.methodName}" not found on "${args.integrationName}". Available: ${Object.keys(providerDocs).join(", ")}`,
          };
        return methodDoc;
      },
    );
  }

  registerCustomTool(toolDef) {
    let params;
    try {
      params =
        typeof toolDef.parameters === "string"
          ? JSON.parse(toolDef.parameters)
          : toolDef.parameters;
    } catch (_) {
      params = { type: "object", properties: {} };
    }

    this.register(
      toolDef.name,
      {
        name: toolDef.name,
        description: toolDef.description,
        parameters: params ?? { type: "object", properties: {} },
      },
      toolDef.handler,
    );
  }

  getToolDefinitions() {
    return Array.from(this._tools.values()).map((t) => t.definition);
  }

  async executeTool(name, args) {
    const tool = this._tools.get(name);
    if (!tool) throw new Error(`Tool not found: ${name}`);
    try {
      return await tool.handler(args);
    } catch (error) {
      return { error: error.message };
    }
  }

  get size() {
    return this._tools.size;
  }
}

module.exports = ToolRegistry;
