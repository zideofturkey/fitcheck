const BaseProviderAdapter = require("./BaseProviderAdapter");

class RunwayAdapter extends BaseProviderAdapter {
  constructor(config) {
    super(config);
    this.apiKey = config.apiKey ?? process.env.RUNWAY_API_KEY;
    this.baseUrl = "https://api.dev.runwayml.com/v1";
  }

  supportsModality(modality) {
    return modality === "video";
  }

  _buildHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
      "X-Runway-Version": "2024-11-06",
    };
  }

  async generateVideo(prompt, options = {}) {
    const model = this.model ?? "gen4_turbo";
    const body = {
      model,
      promptText: prompt,
      duration: options.duration ?? 5,
      ratio: options.aspectRatio ?? "16:9",
    };

    const taskData = await this._postJson(
      `${this.baseUrl}/image_to_video`,
      body,
      this._buildHeaders(),
    );

    const taskId = taskData.id;
    return await this._pollTask(taskId);
  }

  async _pollTask(taskId) {
    const maxAttempts = 60;
    const intervalMs = 5000;
    const https = require("https");

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, intervalMs));

      const data = await new Promise((resolve, reject) => {
        const req = https.get(
          `${this.baseUrl}/tasks/${taskId}`,
          { headers: this._buildHeaders() },
          (res) => {
            let body = "";
            res.on("data", (chunk) => (body += chunk));
            res.on("end", () => {
              try {
                resolve(JSON.parse(body));
              } catch (e) {
                reject(e);
              }
            });
          },
        );
        req.on("error", reject);
      });

      if (data.status === "SUCCEEDED") {
        return { url: data.output?.[0] ?? data.artifactUrl, taskId };
      }
      if (data.status === "FAILED") {
        throw new Error(
          `Runway video generation failed: ${data.failure ?? "unknown error"}`,
        );
      }
    }
    throw new Error("Runway video generation timed out");
  }
}

module.exports = RunwayAdapter;
