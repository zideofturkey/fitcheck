const BaseProviderAdapter = require("./BaseProviderAdapter");

const adapters = {
  openai: () => require("./openai"),
  anthropic: () => require("./anthropic"),
  deepseek: () => require("./deepseek"),
  moonshot: () => require("./moonshot"),
  xai: () => require("./xai"),
  fal: () => require("./fal"),
  elevenlabs: () => require("./elevenlabs"),
  runway: () => require("./runway"),
  custom: () => require("./custom"),
};

function createProviderAdapter(provider, config) {
  const loaderFn = adapters[provider];
  if (!loaderFn) {
    throw new Error(
      `Unknown AI provider: "${provider}". Available: ${Object.keys(adapters).join(", ")}`,
    );
  }
  const AdapterClass = loaderFn();
  return new AdapterClass(config);
}

module.exports = { BaseProviderAdapter, createProviderAdapter };
