const OpenAIAdapter = require("./openai");

class DeepSeekAdapter extends OpenAIAdapter {
  constructor(config) {
    super({
      ...config,
      apiKey: config.apiKey ?? process.env.DEEPSEEK_API_KEY,
      baseUrl: config.baseUrl ?? "https://api.deepseek.com/v1",
      model: config.model ?? "deepseek-chat",
    });
  }

  supportsModality(modality) {
    return modality === "text";
  }
}

module.exports = DeepSeekAdapter;
