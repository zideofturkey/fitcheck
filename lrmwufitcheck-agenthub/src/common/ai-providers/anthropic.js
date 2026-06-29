const BaseProviderAdapter = require("./BaseProviderAdapter");

class AnthropicAdapter extends BaseProviderAdapter {
  constructor(config) {
    super(config);
    this.apiKey = config.apiKey ?? process.env.ANTHROPIC_API_KEY;
    this.model = config.model ?? "claude-sonnet-4-20250514";
  }

  supportsModality(modality) {
    return ["text", "vision"].includes(modality);
  }

  _buildHeaders() {
    return {
      "Content-Type": "application/json",
      "x-api-key": this.apiKey,
      "anthropic-version": "2023-06-01",
    };
  }

  _buildBody(messages, tools, options) {
    const systemMessages = messages.filter((m) => m.role === "system");
    const nonSystemMessages = messages.filter((m) => m.role !== "system");

    const body = {
      model: this.model,
      messages: nonSystemMessages,
      max_tokens: this.maxTokens ?? 4096,
      temperature: options.temperature ?? this.temperature,
    };

    if (systemMessages.length > 0) {
      body.system = systemMessages.map((m) => m.content).join("\n\n");
    }

    if (tools && tools.length > 0) {
      body.tools = tools.map((t) => ({
        name: t.name,
        description: t.description,
        input_schema: t.parameters,
      }));
    }

    return body;
  }

  async chatCompletion(messages, tools, options = {}) {
    const body = this._buildBody(messages, tools, options);
    const data = await this._postJson(
      "https://api.anthropic.com/v1/messages",
      body,
      this._buildHeaders(),
    );

    const textBlocks = data.content.filter((b) => b.type === "text");
    const toolBlocks = data.content.filter((b) => b.type === "tool_use");

    return {
      content: textBlocks.map((b) => b.text).join("") || null,
      toolCalls:
        toolBlocks.length > 0
          ? toolBlocks.map((b) => ({
              id: b.id,
              name: b.name,
              arguments: b.input,
            }))
          : null,
      finishReason: data.stop_reason,
      usage: data.usage,
    };
  }

  async *chatCompletionStream(messages, tools, options = {}) {
    const body = { ...this._buildBody(messages, tools, options), stream: true };

    const response = await this._post(
      "https://api.anthropic.com/v1/messages",
      body,
      this._buildHeaders(),
    );

    let buffer = "";
    let currentToolUse = null;

    for await (const chunk of response) {
      buffer += chunk.toString();
      let newlineIdx;
      while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, newlineIdx).trim();
        buffer = buffer.slice(newlineIdx + 1);

        if (!line.startsWith("data:")) continue;
        const raw = line.slice(5).trim();
        if (!raw) continue;

        let parsed;
        try {
          parsed = JSON.parse(raw);
        } catch (_) {
          continue;
        }

        if (
          parsed.type === "content_block_start" &&
          parsed.content_block?.type === "tool_use"
        ) {
          currentToolUse = {
            id: parsed.content_block.id,
            name: parsed.content_block.name,
            arguments: "",
          };
        } else if (parsed.type === "content_block_delta") {
          if (parsed.delta?.type === "text_delta") {
            yield { type: "token", content: parsed.delta.text };
          } else if (
            parsed.delta?.type === "input_json_delta" &&
            currentToolUse
          ) {
            currentToolUse.arguments += parsed.delta.partial_json;
          }
        } else if (parsed.type === "content_block_stop" && currentToolUse) {
          yield {
            type: "tool_calls",
            toolCalls: [
              {
                id: currentToolUse.id,
                name: currentToolUse.name,
                arguments: JSON.parse(currentToolUse.arguments || "{}"),
              },
            ],
          };
          currentToolUse = null;
        } else if (
          parsed.type === "message_delta" &&
          parsed.delta?.stop_reason
        ) {
          yield { type: "done", finishReason: parsed.delta.stop_reason };
        }
      }
    }
  }
}

module.exports = AnthropicAdapter;
