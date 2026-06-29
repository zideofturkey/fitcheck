const BaseProviderAdapter = require("./BaseProviderAdapter");

const BASE_URL = "https://api.openai.com/v1";

class OpenAIAdapter extends BaseProviderAdapter {
  constructor(config) {
    super(config);
    this.apiKey = config.apiKey ?? process.env.OPENAI_API_KEY;
    this.baseUrl = config.baseUrl ?? BASE_URL;
  }

  supportsModality(modality) {
    return ["text", "vision", "image", "audio"].includes(modality);
  }

  _buildHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  _buildChatBody(messages, tools, options) {
    const body = {
      model: this.model,
      messages,
      temperature: options.temperature ?? this.temperature,
    };
    if (this.maxTokens) body.max_tokens = this.maxTokens;
    if (this.responseFormat === "json") {
      body.response_format = { type: "json_object" };
    }
    if (tools && tools.length > 0) {
      body.tools = tools.map((t) => ({
        type: "function",
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      }));
    }
    return body;
  }

  async chatCompletion(messages, tools, options = {}) {
    const body = this._buildChatBody(messages, tools, options);
    const data = await this._postJson(
      `${this.baseUrl}/chat/completions`,
      body,
      this._buildHeaders(),
    );
    const choice = data.choices[0];
    return {
      content: choice.message.content,
      toolCalls:
        choice.message.tool_calls?.map((tc) => ({
          id: tc.id,
          name: tc.function.name,
          arguments: JSON.parse(tc.function.arguments),
        })) ?? null,
      finishReason: choice.finish_reason,
      usage: data.usage,
    };
  }

  async *chatCompletionStream(messages, tools, options = {}) {
    const body = {
      ...this._buildChatBody(messages, tools, options),
      stream: true,
    };
    let currentToolCalls = {};

    for await (const parsed of this._postStream(
      `${this.baseUrl}/chat/completions`,
      body,
      this._buildHeaders(),
    )) {
      const delta = parsed.choices?.[0]?.delta;
      if (!delta) continue;

      if (delta.content) {
        yield { type: "token", content: delta.content };
      }

      if (delta.tool_calls) {
        for (const tc of delta.tool_calls) {
          const idx = tc.index;
          if (!currentToolCalls[idx]) {
            currentToolCalls[idx] = {
              id: tc.id,
              name: tc.function?.name ?? "",
              arguments: "",
            };
          }
          if (tc.function?.name) currentToolCalls[idx].name = tc.function.name;
          if (tc.function?.arguments)
            currentToolCalls[idx].arguments += tc.function.arguments;
        }
      }

      const finishReason = parsed.choices?.[0]?.finish_reason;
      if (finishReason === "tool_calls") {
        const calls = Object.values(currentToolCalls).map((tc) => ({
          id: tc.id,
          name: tc.name,
          arguments: JSON.parse(tc.arguments),
        }));
        yield { type: "tool_calls", toolCalls: calls };
        currentToolCalls = {};
      } else if (finishReason === "stop") {
        yield { type: "done", finishReason: "stop" };
      }
    }
  }

  async generateImage(prompt, options = {}) {
    const body = {
      model: this.model ?? "dall-e-3",
      prompt,
      n: options.count ?? 1,
      size: options.size ?? "1024x1024",
    };
    if (options.quality) body.quality = options.quality;
    if (options.style) body.style = options.style;

    const data = await this._postJson(
      `${this.baseUrl}/images/generations`,
      body,
      this._buildHeaders(),
    );
    return data.data.map((item) => ({
      url: item.url,
      revisedPrompt: item.revised_prompt,
    }));
  }

  async textToSpeech(text, options = {}) {
    const body = {
      model: this.model ?? "tts-1",
      input: text,
      voice: options.voice ?? "alloy",
      response_format: options.outputFormat ?? "mp3",
    };

    const response = await this._post(
      `${this.baseUrl}/audio/speech`,
      body,
      this._buildHeaders(),
    );

    const chunks = [];
    for await (const chunk of response) chunks.push(chunk);
    return { buffer: Buffer.concat(chunks), format: body.response_format };
  }

  async speechToText(audioBuffer, options = {}) {
    const FormData = require("form-data");
    const form = new FormData();
    form.append("file", audioBuffer, {
      filename: "audio.wav",
      contentType: "audio/wav",
    });
    form.append("model", this.model ?? "whisper-1");
    if (options.language) form.append("language", options.language);

    const urlObj = new URL(`${this.baseUrl}/audio/transcriptions`);
    const isHttps = urlObj.protocol === "https:";
    const httpModule = isHttps ? require("https") : require("http");

    const response = await new Promise((resolve, reject) => {
      const req = httpModule.request(
        {
          hostname: urlObj.hostname,
          port: urlObj.port || (isHttps ? 443 : 80),
          path: urlObj.pathname,
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            ...form.getHeaders(),
          },
        },
        resolve,
      );
      req.on("error", reject);
      form.pipe(req);
    });

    let data = "";
    for await (const chunk of response) data += chunk.toString();
    return JSON.parse(data);
  }
}

module.exports = OpenAIAdapter;
