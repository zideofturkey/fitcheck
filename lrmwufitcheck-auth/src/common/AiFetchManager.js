class BaseAiFetchManager {
  constructor(userPrompt, systemPrompt, options) {
    this.userPrompt = userPrompt;

    this.systemPrompt = systemPrompt ?? null;

    this.isArray = options.isArray ?? false;
    this.maxTokens = options.maxTokens ?? null;
    this.responseFormat = options.responseFormat ?? "text";
    this.stream = options.stream ?? false;
  }

  getApiEndpoint() {
    throw new Error("getApiEndpoint must be implemented by child class");
  }

  getRequestHeaders() {
    throw new Error("getRequestHeaders must be implemented by child class");
  }

  formatRequestBody(messages) {
    throw new Error("formatRequestBody must be implemented by child class");
  }

  extractResponseContent(data) {
    throw new Error(
      "extractResponseContent must be implemented by child class",
    );
  }

  extractStreamToken(parsed) {
    return null;
  }

  formatMessages(prompt) {
    throw new Error("formatMessages must be implemented by child class");
  }

  async makeRequest(prompt) {
    if (!this.apiKey) {
      throw new Error("API key is required");
    }

    const messages = this.formatMessages(prompt);

    const response = await fetch(this.getApiEndpoint(), {
      method: "POST",
      headers: this.getRequestHeaders(),
      body: JSON.stringify(this.formatRequestBody(messages)),
    });

    if (!response.ok) {
      let errBody = "";
      try {
        errBody = await response.text();
      } catch (_) {}
      throw new Error(
        `AI request failed (${response.status} ${response.statusText}) model=${this.model}: ${errBody.slice(0, 300)}`,
      );
    }

    const data = await response.json();
    return this.extractResponseContent(data);
  }

  async *executeStream() {
    if (!this.apiKey) {
      throw new Error("API key is required");
    }

    const messages = this.formatMessages({
      systemPrompt: this.systemPrompt,
      userPrompt: this.userPrompt,
    });
    const body = this.formatRequestBody(messages);
    body.stream = true;

    const url = new URL(this.getApiEndpoint());
    const isHttps = url.protocol === "https:";
    const httpModule = isHttps ? require("https") : require("http");

    const requestOptions = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: "POST",
      headers: this.getRequestHeaders(),
    };

    const response = await new Promise((resolve, reject) => {
      const req = httpModule.request(requestOptions, resolve);
      req.on("error", reject);
      req.write(JSON.stringify(body));
      req.end();
    });

    if (response.statusCode >= 400) {
      let errorBody = "";
      for await (const chunk of response) errorBody += chunk.toString();
      throw new Error(
        `AI streaming request failed (${response.statusCode}): ${errorBody.slice(0, 200)}`,
      );
    }

    let buffer = "";
    for await (const chunk of response) {
      buffer += chunk.toString();

      let newlineIdx;
      while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, newlineIdx).trim();
        buffer = buffer.slice(newlineIdx + 1);

        if (!line.startsWith("data:")) continue;
        const raw = line.slice(5).trim();
        if (raw === "[DONE]") return;
        if (!raw) continue;

        try {
          const parsed = JSON.parse(raw);
          const token = this.extractStreamToken(parsed);
          if (token) yield token;
        } catch (_) {
          // skip unparseable SSE lines
        }
      }
    }
  }

  stripCodeFences(text) {
    const trimmed = text.trim();
    const match = trimmed.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/);
    return match ? match[1].trim() : trimmed;
  }

  processResponse(response) {
    if (!response) {
      throw new Error("Empty response from AI service");
    }

    if (this.responseFormat === "json") {
      try {
        let raw =
          typeof response === "string"
            ? this.stripCodeFences(response)
            : response;
        const jsonResponse = typeof raw === "string" ? JSON.parse(raw) : raw;
        return this.isArray
          ? Array.isArray(jsonResponse)
            ? jsonResponse
            : [jsonResponse]
          : jsonResponse;
      } catch (error) {
        //**errorLog
        throw new Error("Failed to parse JSON response: " + error.message);
      }
    }

    return this.isArray ? [response] : response;
  }

  async execute(owner) {
    try {
      if (!this.apiKey) {
        throw new Error(`API key not found`);
      }
      const response = await this.executeAiFetch();
      return this.processResponse(response);
    } catch (error) {
      //**errorLog
      console.error("AiFetch error..", error);
      throw error;
    }
  }
}

class OpenAiFetchManager extends BaseAiFetchManager {
  constructor(userPrompt, systemPrompt, options) {
    super(userPrompt, systemPrompt, options);
    this.apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
    this.model = options.model ?? "gpt-4o";
    this.endpoint =
      options.endpoint ?? "https://api.openai.com/v1/chat/completions";
  }

  getApiEndpoint() {
    return this.endpoint;
  }

  getRequestHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  formatMessages(prompt) {
    const messages = [];
    if (prompt.systemPrompt) {
      messages.push({
        role: "system",
        content: prompt.systemPrompt,
      });
    }
    messages.push({
      role: "user",
      content: prompt.userPrompt,
    });
    return messages;
  }

  formatRequestBody(messages) {
    return {
      model: this.model,
      messages: messages,
    };
  }

  extractResponseContent(data) {
    return data.choices[0].message.content;
  }

  extractStreamToken(parsed) {
    return parsed.choices?.[0]?.delta?.content ?? null;
  }

  async executeAiFetch() {
    return await this.makeRequest({
      systemPrompt: this.systemPrompt,
      userPrompt: this.userPrompt,
    });
  }
}

class AnthropicFetchManager extends BaseAiFetchManager {
  constructor(userPrompt, systemPrompt, options) {
    super(userPrompt, systemPrompt, options);
    this.apiKey = options.apiKey ?? process.env.ANTHROPIC_API_KEY;
    this.model = options.model ?? "claude-sonnet-4-20250514";
  }

  getApiEndpoint() {
    return "https://api.anthropic.com/v1/messages";
  }

  getRequestHeaders() {
    return {
      "Content-Type": "application/json",
      "x-api-key": this.apiKey,
      "anthropic-version": "2023-06-01",
    };
  }

  formatMessages(prompt) {
    const messages = [];
    messages.push({
      role: "user",
      content: prompt.userPrompt,
    });
    return messages;
  }

  formatRequestBody(messages) {
    return {
      model: this.model,
      messages: messages,
      max_tokens: this.maxTokens ?? 4096,
      system: this.systemPrompt || "",
    };
  }

  extractResponseContent(data) {
    return data.content[0].text;
  }

  extractStreamToken(parsed) {
    if (parsed.type === "content_block_delta") {
      return parsed.delta?.text ?? null;
    }
    return null;
  }

  async executeAiFetch() {
    return await this.makeRequest({
      systemPrompt: this.systemPrompt,
      userPrompt: this.userPrompt,
    });
  }
}

module.exports = {
  OpenAiFetchManager,
  AnthropicFetchManager,
};
