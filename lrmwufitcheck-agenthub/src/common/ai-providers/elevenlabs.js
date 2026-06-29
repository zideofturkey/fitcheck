const BaseProviderAdapter = require("./BaseProviderAdapter");

class ElevenLabsAdapter extends BaseProviderAdapter {
  constructor(config) {
    super(config);
    this.apiKey = config.apiKey ?? process.env.ELEVENLABS_API_KEY;
    this.baseUrl = "https://api.elevenlabs.io/v1";
  }

  supportsModality(modality) {
    return modality === "audio";
  }

  _buildHeaders() {
    return {
      "Content-Type": "application/json",
      "xi-api-key": this.apiKey,
    };
  }

  async textToSpeech(text, options = {}) {
    const voiceId = options.voice ?? "21m00Tcm4TlvDq8ikWAM"; // default "Rachel"
    const modelId = this.model ?? "eleven_multilingual_v2";
    const outputFormat = options.outputFormat ?? "mp3_44100_128";

    const body = {
      text,
      model_id: modelId,
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    };

    const url = `${this.baseUrl}/text-to-speech/${voiceId}?output_format=${outputFormat}`;
    const response = await this._post(url, body, this._buildHeaders());

    const chunks = [];
    for await (const chunk of response) chunks.push(chunk);
    return {
      buffer: Buffer.concat(chunks),
      format: options.outputFormat ?? "mp3",
    };
  }

  async speechToText(audioBuffer, options = {}) {
    throw new Error(
      "ElevenLabs does not support speech-to-text. Use OpenAI Whisper instead.",
    );
  }
}

module.exports = ElevenLabsAdapter;
