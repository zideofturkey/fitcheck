const ClientClasses = {};

const ClientConfigs = {};

const clients = {};

const clientConstructors = {};

// ── Google Gemini ──────────────────────────────────────────────────────────────
const buildGeminiClient = () => {
  const apiKey =
    process.env.GOOGLE_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    console.warn(
      "[integrations] GOOGLE_GEMINI_API_KEY is not set — Gemini client will be unavailable.",
    );
    return null;
  }

  let GoogleGenerativeAI;
  try {
    ({ GoogleGenerativeAI } = require("@google/generative-ai"));
  } catch (e) {
    console.error(
      "[integrations] @google/generative-ai package not found. Run npm install.",
      e.message,
    );
    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // Return a wrapper that matches the call-style used in parse-meal-api.js:
  // googleGeminiClient.generateContent({ config: { model, temperature, maxOutputTokens }, prompt })
  return {
    generateContent: async ({ config = {}, prompt }) => {
      const modelName = config.model || "gemini-2.5-flash";
      const generationConfig = {};
      if (config.temperature !== undefined)
        generationConfig.temperature = config.temperature;
      if (config.maxOutputTokens !== undefined)
        generationConfig.maxOutputTokens = config.maxOutputTokens;
      // gemini-2.5-flash's "thinking" mode draws its reasoning tokens from
      // the SAME maxOutputTokens budget, which was silently truncating the
      // actual JSON response before it finished (finishReason: MAX_TOKENS,
      // usageMetadata.thoughtsTokenCount eating most of the budget). Every
      // caller in this integration wants a short structured-JSON answer,
      // not chain-of-thought, so thinking is off by default; pass
      // config.thinkingBudget explicitly if a future caller ever needs it.
      generationConfig.thinkingConfig = {
        thinkingBudget:
          config.thinkingBudget !== undefined ? config.thinkingBudget : 0,
      };

      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig,
      });

      const result = await model.generateContent(prompt);
      const response = result.response;
      return {
        text: response.text(),
        candidates: response.candidates,
      };
    },
  };
};

clientConstructors["googleGemini"] = buildGeminiClient;
// ──────────────────────────────────────────────────────────────────────────────

const createClient = (provider) => {
  if (!clientConstructors[provider]) return null;
  return clientConstructors[provider]();
};

const getIntegrationClient = async (provider) => {
  // in future this function may involve some awaited test calls inside
  // so it is planned async although it is just a constructor wrapper,
  clients[provider] = clients[provider] || createClient(provider);
  return clients[provider];
};

const testProvider = async (provider) => {
  if (!ClientClasses[provider]) return null;
  const Provider = ClientClasses[provider];
  return await Provider.test(ClientConfigs[provider]);
};

module.exports = { getIntegrationClient, testProvider };
