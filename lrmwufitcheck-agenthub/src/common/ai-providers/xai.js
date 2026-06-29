const OpenAIAdapter = require("./openai");

class XAIAdapter extends OpenAIAdapter {
  constructor(config) {
    super({
      ...config,
      apiKey: config.apiKey ?? process.env.XAI_API_KEY,
      baseUrl: config.baseUrl ?? "https://api.x.ai/v1",
      model: config.model ?? "grok-2",
    });
  }

  supportsModality(modality) {
    return ["text", "vision"].includes(modality);
  }
}

module.exports = XAIAdapter;
