const https = require("https");
const http = require("http");

class BaseProviderAdapter {
  constructor(config) {
    this.model = config.model;
    this.apiKey = config.apiKey;
    this.maxTokens = config.maxTokens ?? null;
    this.temperature = config.temperature ?? 0.7;
    this.responseFormat = config.responseFormat ?? "text";
  }

  supportsModality(modality) {
    return false;
  }

  async chatCompletion(messages, tools, options = {}) {
    throw new Error(`chatCompletion not supported by ${this.constructor.name}`);
  }

  async *chatCompletionStream(messages, tools, options = {}) {
    throw new Error(
      `chatCompletionStream not supported by ${this.constructor.name}`,
    );
  }

  async generateImage(prompt, options = {}) {
    throw new Error(`generateImage not supported by ${this.constructor.name}`);
  }

  async textToSpeech(text, options = {}) {
    throw new Error(`textToSpeech not supported by ${this.constructor.name}`);
  }

  async speechToText(audioBuffer, options = {}) {
    throw new Error(`speechToText not supported by ${this.constructor.name}`);
  }

  async generateVideo(prompt, options = {}) {
    throw new Error(`generateVideo not supported by ${this.constructor.name}`);
  }

  _buildHeaders() {
    return { "Content-Type": "application/json" };
  }

  async _post(url, body, headers) {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === "https:";
    const httpModule = isHttps ? https : http;

    const response = await new Promise((resolve, reject) => {
      const req = httpModule.request(
        {
          hostname: urlObj.hostname,
          port: urlObj.port || (isHttps ? 443 : 80),
          path: urlObj.pathname + urlObj.search,
          method: "POST",
          headers: { ...this._buildHeaders(), ...headers },
        },
        resolve,
      );
      req.on("error", reject);
      req.write(typeof body === "string" ? body : JSON.stringify(body));
      req.end();
    });

    if (response.statusCode >= 400) {
      let errorBody = "";
      for await (const chunk of response) errorBody += chunk.toString();
      throw new Error(
        `Provider request failed (${response.statusCode}): ${errorBody.slice(0, 500)}`,
      );
    }

    return response;
  }

  async _postJson(url, body, headers) {
    const response = await this._post(url, body, headers);
    let data = "";
    for await (const chunk of response) data += chunk.toString();
    return JSON.parse(data);
  }

  async *_postStream(url, body, headers) {
    const response = await this._post(url, body, headers);
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
          yield JSON.parse(raw);
        } catch (_) {
          // skip unparseable SSE lines
        }
      }
    }
  }
}

module.exports = BaseProviderAdapter;
