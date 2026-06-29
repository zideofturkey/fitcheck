const { createProviderAdapter } = require("common/ai-providers");
const { runMScript } = require("common");

class AgentRuntime {
  constructor(config) {
    this.name = config.name;
    this.executionMode = config.executionMode;
    this.modality = config.modality;

    this.systemPrompt = config.systemPrompt ?? null;
    this.promptTemplate = config.promptTemplate ?? null;
    this.responseProperty = config.responseProperty ?? null;
    this.postProcess = config.postProcess ?? null;
    this.serviceContext = config.serviceContext ?? null;

    this.provider = createProviderAdapter(config.provider, {
      model: config.model,
      apiKey: config.apiKey,
      maxTokens: config.maxTokens,
      temperature: config.temperature,
      responseFormat: config.responseFormat,
      baseUrl: config.baseUrl,
      apiKeyEnvVar: config.apiKeyEnvVar,
      apiFormat: config.apiFormat,
    });

    this.toolRegistry = config.toolRegistry ?? null;

    this.guardrails = {
      maxToolCalls: config.maxToolCalls ?? 25,
      maxTokenBudget: config.maxTokenBudget ?? null,
      timeout: config.timeout ?? 120000,
    };

    this.chatSettings = config.chatSettings ?? null;
    this.conversationStore = config.conversationStore ?? null;

    this.imageSettings = config.imageSettings ?? null;
    this.audioSettings = config.audioSettings ?? null;
    this.videoSettings = config.videoSettings ?? null;
  }

  /**
   * Execute the agent.
   *
   * @param {Object}  request           — incoming request shape (REST req / synthetic Kafka req)
   * @param {Object}  sseController     — optional SSE event sink (REST stream / generate-pages)
   * @param {Object}  executionContext  — { source: 'rest'|'sse'|'kafka'|'agent', userId?, agentType?: 'design'|'dynamic' }
   *                                       Used only for the sys_agentExecution row's stable fields. Caller
   *                                       supplies it; if omitted we default to 'rest' / null / 'design' so
   *                                       legacy callers keep working without changes.
   *
   * Always persists one sys_agentExecution row per call (fail-open — logging errors never break the agent).
   * Always emits a console.warn when the run finished without invoking any tool_calls but the agent had
   * tools defined — that's the silent-failure mode where the LLM described tools in prose instead of
   * issuing structured tool_calls.
   */
  async execute(request, sseController, executionContext = {}) {
    const startTime = Date.now();
    const timeoutMs = this.guardrails.timeout;

    const meta = {
      agentName: this.name,
      agentType: executionContext.agentType || "design",
      source: executionContext.source || "rest",
      userId: executionContext.userId || request?.session?.userId || null,
      input: request?.body ?? request?.params ?? null,
      output: null,
      toolCalls: 0,
      tokenUsage: null,
      durationMs: 0,
      status: "success",
      error: null,
    };

    try {
      let output;
      switch (this.modality) {
        case "text":
        case "vision":
          output = await this._executeTextLoop(
            request,
            sseController,
            startTime,
            timeoutMs,
            meta,
          );
          break;
        case "image":
          output = await this._executeImageGeneration(request, sseController);
          break;
        case "audio":
          output = await this._executeAudio(request, sseController);
          break;
        case "video":
          output = await this._executeVideoGeneration(request, sseController);
          break;
        default:
          throw new Error(`Unsupported modality: ${this.modality}`);
      }
      meta.output = output;
      meta.durationMs = Date.now() - startTime;

      // Silent-failure detection — agent has tools defined but the LLM never
      // issued a structured tool_call across the entire run. Almost always
      // means the model described its intent in prose instead. Surface as a
      // warning so it doesn't masquerade as a successful run.
      if (this.modality === "text" || this.modality === "vision") {
        const toolDefs = this.toolRegistry
          ? this.toolRegistry.getToolDefinitions()
          : [];
        if (meta.toolCalls === 0 && toolDefs.length > 0) {
          console.warn(
            `[Agent ${this.name}] execution returned without invoking any tool — ${toolDefs.length} tool(s) defined but the LLM emitted plain text. Likely cause: model described the call in prose; check tool definitions, system prompt, and provider tool_call wiring.`,
          );
        }
      }

      this._persistExecution(meta);
      return output;
    } catch (error) {
      meta.durationMs = Date.now() - startTime;
      meta.status =
        error && error.message && /timed out/i.test(error.message)
          ? "timeout"
          : "error";
      meta.error = error && error.message ? error.message : String(error);
      this._persistExecution(meta);

      if (sseController) {
        sseController.sendEvent("error", { message: error.message });
        sseController.end();
      }
      throw error;
    }
  }

  /**
   * Persist one sys_agentExecution row. Fail-open: logging must never break
   * the agent. Fires-and-forgets so the caller doesn't await DB I/O.
   */
  _persistExecution(meta) {
    setImmediate(async () => {
      try {
        // eslint-disable-next-line global-require
        const dbLayer = require("dbLayer");
        if (typeof dbLayer.createSys_agentExecution !== "function") return;

        const truncate = (v) => {
          if (v == null) return null;
          try {
            const s = typeof v === "string" ? v : JSON.stringify(v);
            return s.length > 10000 ? s.slice(0, 10000) + "…[truncated]" : s;
          } catch {
            return null;
          }
        };

        await dbLayer.createSys_agentExecution({
          agentName: meta.agentName,
          agentType: meta.agentType,
          source: meta.source,
          userId: meta.userId,
          input: truncate(meta.input),
          output: truncate(meta.output),
          toolCalls: meta.toolCalls || 0,
          tokenUsage: meta.tokenUsage || null,
          durationMs: meta.durationMs || 0,
          status: meta.status,
          error: meta.error,
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(
          `[Agent ${meta.agentName}] failed to persist sys_agentExecution row: ${err && err.message ? err.message : err}`,
        );
      }
    });
  }

  async _executeTextLoop(
    request,
    sseController,
    startTime,
    timeoutMs,
    meta = null,
  ) {
    const userMessage = this._buildUserMessage(request);
    const systemMessage = await this._buildSystemMessage(request);
    const tools = this.toolRegistry
      ? this.toolRegistry.getToolDefinitions()
      : [];

    let messages = [];
    if (systemMessage)
      messages.push({ role: "system", content: systemMessage });

    if (this.executionMode === "chat" && this.conversationStore) {
      const sessionId = request.body?.sessionId ?? request.params?.sessionId;
      const history = await this.conversationStore.load(sessionId);
      messages.push(...history);
    }

    messages.push({ role: "user", content: userMessage });

    let toolCallCount = 0;
    let finalContent = null;

    while (true) {
      this._checkTimeout(startTime, timeoutMs);

      if (sseController) {
        const result = await this._streamChatCompletion(
          messages,
          tools,
          sseController,
        );
        finalContent = result.content;

        if (!result.toolCalls) break;

        messages.push({
          role: "assistant",
          content: result.content,
          tool_calls: result.toolCalls,
        });
        for (const tc of result.toolCalls) {
          toolCallCount++;
          if (meta) meta.toolCalls = toolCallCount;
          if (toolCallCount > this.guardrails.maxToolCalls) {
            throw new Error(
              `Max tool calls (${this.guardrails.maxToolCalls}) exceeded`,
            );
          }
          if (sseController)
            sseController.sendEvent("tool_start", { name: tc.name, id: tc.id });
          const toolResult = await this.toolRegistry.executeTool(
            tc.name,
            tc.arguments,
          );
          if (sseController)
            sseController.sendEvent("tool_result", {
              name: tc.name,
              id: tc.id,
              result: toolResult,
            });
          messages.push({
            role: "tool",
            tool_call_id: tc.id,
            content: JSON.stringify(toolResult),
          });
        }
      } else {
        const result = await this.provider.chatCompletion(messages, tools);
        finalContent = result.content;

        if (!result.toolCalls) break;

        messages.push({
          role: "assistant",
          content: result.content,
          tool_calls: result.toolCalls,
        });
        for (const tc of result.toolCalls) {
          toolCallCount++;
          if (meta) meta.toolCalls = toolCallCount;
          if (toolCallCount > this.guardrails.maxToolCalls) {
            throw new Error(
              `Max tool calls (${this.guardrails.maxToolCalls}) exceeded`,
            );
          }
          const toolResult = await this.toolRegistry.executeTool(
            tc.name,
            tc.arguments,
          );
          messages.push({
            role: "tool",
            tool_call_id: tc.id,
            content: JSON.stringify(toolResult),
          });
        }
      }
    }

    if (this.executionMode === "chat" && this.conversationStore) {
      const sessionId = request.body?.sessionId ?? request.params?.sessionId;
      const newMessages = messages.filter((m) => m.role !== "system");
      await this.conversationStore.save(sessionId, newMessages);
    }

    const output = this._processOutput(finalContent);

    if (this.postProcess) {
      await this._runPostProcess(output, request);
    }

    if (sseController) {
      sseController.sendEvent("done", { content: output });
      sseController.end();
    }

    return output;
  }

  async _streamChatCompletion(messages, tools, sseController) {
    let fullContent = "";
    let toolCalls = null;

    for await (const event of this.provider.chatCompletionStream(
      messages,
      tools,
    )) {
      if (event.type === "token") {
        fullContent += event.content;
        sseController.sendEvent("token", { content: event.content });
      } else if (event.type === "tool_calls") {
        toolCalls = event.toolCalls;
      }
    }

    return { content: fullContent || null, toolCalls };
  }

  async _executeImageGeneration(request, sseController) {
    const prompt = this._buildUserMessage(request);
    if (sseController)
      sseController.sendEvent("progress", { status: "generating" });

    const results = await this.provider.generateImage(prompt, {
      size: this.imageSettings?.size,
      quality: this.imageSettings?.quality,
      style: this.imageSettings?.style,
      count: this.imageSettings?.count,
    });

    const output = results.length === 1 ? results[0] : results;

    if (sseController) {
      sseController.sendEvent("done", { content: output });
      sseController.end();
    }

    return output;
  }

  async _executeAudio(request, sseController) {
    const direction = this.audioSettings?.direction ?? "tts";

    if (direction === "tts") {
      const text = this._buildUserMessage(request);
      if (sseController)
        sseController.sendEvent("progress", { status: "generating" });

      const result = await this.provider.textToSpeech(text, {
        voice: this.audioSettings?.voice,
        outputFormat: this.audioSettings?.outputFormat,
        language: this.audioSettings?.language,
      });

      if (sseController) {
        sseController.sendEvent("done", {
          format: result.format,
          size: result.buffer.length,
        });
        sseController.end();
      }

      return result;
    } else {
      const audioBuffer = request.file?.buffer ?? request.body?.audioBuffer;
      if (!audioBuffer) throw new Error("Audio buffer required for STT");
      if (sseController)
        sseController.sendEvent("progress", { status: "transcribing" });

      const result = await this.provider.speechToText(audioBuffer, {
        language: this.audioSettings?.language,
      });

      if (sseController) {
        sseController.sendEvent("done", { content: result });
        sseController.end();
      }

      return result;
    }
  }

  async _executeVideoGeneration(request, sseController) {
    const prompt = this._buildUserMessage(request);
    if (sseController)
      sseController.sendEvent("progress", { status: "generating" });

    const result = await this.provider.generateVideo(prompt, {
      duration: this.videoSettings?.duration,
      aspectRatio: this.videoSettings?.aspectRatio,
      resolution: this.videoSettings?.resolution,
    });

    if (sseController) {
      sseController.sendEvent("done", { content: result });
      sseController.end();
    }

    return result;
  }

  _buildUserMessage(request) {
    if (this.promptTemplate) {
      return this._evaluateTemplate(this.promptTemplate, request);
    }
    return (
      request.body?.message ??
      request.body?.prompt ??
      JSON.stringify(request.body)
    );
  }

  async _buildSystemMessage(request) {
    return this.systemPrompt;
  }

  _processOutput(content) {
    if (!content) return content;

    if (this.responseProperty && typeof content === "string") {
      try {
        const parsed = JSON.parse(content);
        return parsed[this.responseProperty] ?? content;
      } catch (_) {
        return content;
      }
    }

    return content;
  }

  _evaluateTemplate(template, request) {
    try {
      return runMScript(
        () => {
          const fn = new Function("request", `return ${template}`);
          return fn(request);
        },
        { path: `agent.${this.name}.promptTemplate` },
      );
    } catch (_) {
      return template;
    }
  }

  async _runPostProcess(output, request) {
    try {
      await this.postProcess(output, request, this.serviceContext);
    } catch (err) {
      const wrapped = new Error(
        `[Agent ${this.name}] postProcess failed: ${err.message}`,
      );
      wrapped.cause = err;
      throw wrapped;
    }
  }

  _checkTimeout(startTime, timeoutMs) {
    if (Date.now() - startTime > timeoutMs) {
      throw new Error(`Agent execution timed out after ${timeoutMs}ms`);
    }
  }
}

module.exports = AgentRuntime;
