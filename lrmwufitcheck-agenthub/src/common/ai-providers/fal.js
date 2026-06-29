const BaseProviderAdapter = require("./BaseProviderAdapter");

class FalAdapter extends BaseProviderAdapter {
  constructor(config) {
    super(config);
    this.apiKey = config.apiKey ?? process.env.FAL_KEY;
    this.baseUrl = "https://fal.run";
  }

  supportsModality(modality) {
    return ["image", "video"].includes(modality);
  }

  _buildHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Key ${this.apiKey}`,
    };
  }

  async generateImage(prompt, options = {}) {
    const model = this.model ?? "fal-ai/flux/dev";
    const body = {
      prompt,
      image_size: options.size ?? "landscape_4_3",
      num_images: options.count ?? 1,
    };

    const data = await this._postJson(
      `${this.baseUrl}/${model}`,
      body,
      this._buildHeaders(),
    );

    return (data.images || []).map((img) => ({
      url: img.url,
      width: img.width,
      height: img.height,
    }));
  }

  async generateVideo(prompt, options = {}) {
    const model = this.model ?? "fal-ai/runway-gen3/turbo/image-to-video";
    const body = { prompt };
    if (options.duration) body.duration = options.duration;
    if (options.aspectRatio) body.aspect_ratio = options.aspectRatio;

    const data = await this._postJson(
      `${this.baseUrl}/${model}`,
      body,
      this._buildHeaders(),
    );

    return { url: data.video?.url ?? data.url, duration: options.duration };
  }
}

module.exports = FalAdapter;
