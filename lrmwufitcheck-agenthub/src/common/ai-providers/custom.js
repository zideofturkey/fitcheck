const OpenAIAdapter = require("./openai");
const AnthropicAdapter = require("./anthropic");

class CustomAdapter {
  constructor(config) {
    const format = config.apiFormat ?? "openai";
    const apiKey =
      config.apiKey ??
      (config.apiKeyEnvVar ? process.env[config.apiKeyEnvVar] : null);

    if (format === "anthropic") {
      this._delegate = new AnthropicAdapter({ ...config, apiKey });
    } else {
      this._delegate = new OpenAIAdapter({ ...config, apiKey });
    }
  }

  supportsModality(modality) {
    return this._delegate.supportsModality(modality);
  }

  chatCompletion(messages, tools, options) {
    return this._delegate.chatCompletion(messages, tools, options);
  }

  chatCompletionStream(messages, tools, options) {
    return this._delegate.chatCompletionStream(messages, tools, options);
  }

  generateImage(prompt, options) {
    return this._delegate.generateImage(prompt, options);
  }

  textToSpeech(text, options) {
    return this._delegate.textToSpeech(text, options);
  }

  speechToText(audioBuffer, options) {
    return this._delegate.speechToText(audioBuffer, options);
  }

  generateVideo(prompt, options) {
    return this._delegate.generateVideo(prompt, options);
  }
}

module.exports = CustomAdapter;
