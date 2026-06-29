const OpenAIAdapter = require("./openai");

class MoonshotAdapter extends OpenAIAdapter {
  constructor(config) {
    super({
      ...config,
      apiKey: config.apiKey ?? process.env.MOONSHOT_API_KEY,
      baseUrl: config.baseUrl ?? "https://api.moonshot.cn/v1",
      model: config.model ?? "moonshot-v1-8k",
    });
  }

  supportsModality(modality) {
    return modality === "text";
  }
}

module.exports = MoonshotAdapter;
