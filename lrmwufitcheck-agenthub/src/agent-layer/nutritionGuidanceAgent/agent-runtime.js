const AgentRuntime = require("agentLayer/AgentRuntime");
const { buildNutritionGuidanceAgentToolRegistry } = require("./tool-registry");
const { createConversationStore } = require("agentLayer/ConversationStore");

function createNutritionGuidanceAgentRuntime(serviceContext) {
  const toolRegistry = buildNutritionGuidanceAgentToolRegistry(serviceContext);

  // Map dbLayer CRUD functions for sys_agentConversation to the interface expected by DatabaseConversationStore
  const {
    getSys_agentConversationByQuery,
    createSys_agentConversation,
    updateSys_agentConversation,
    deleteSys_agentConversationByQuery,
  } = require("dbLayer");

  const _convDbFunctions = {
    getByQuery: (query) => getSys_agentConversationByQuery(query),
    create: (data) => createSys_agentConversation(data),
    update: (id, data) => updateSys_agentConversation(id, data),
    deleteByQuery: (query) => deleteSys_agentConversationByQuery(query),
  };
  const conversationStore = createConversationStore("database", {
    maxMessages: 20,
    dbFunctions: _convDbFunctions,
    agentName: "nutritionGuidanceAgent",
  });

  const runtime = new AgentRuntime({
    name: "nutritionGuidanceAgent",
    executionMode: "chat",
    modality: "text",
    provider: "anthropic",
    model: "claude-sonnet-4-6",
    systemPrompt:
      'Sen FitCheck\'in kişisel beslenme asistanısın. Türkçe konuşan kullanıcılara doğal dil ile kişiselleştirilmiş beslenme rehberliği sunuyorsun.\n\nGörevin:\n- Kullanıcının bugünkü ve geçmiş öğün kayıtlarını, makro hedeflerini ve yiyecek kütüphanesini kullanarak soruları yanıtlamak.\n- "Bugün yağ limitimi aştım mı?", "Ne kadar protein aldım?", "Bu hafta en sağlıklı ne yedim?" gibi sorulara somut, sayısal ve kişisel yanıtlar vermek.\n- Makro hedeflerle karşılaştırmalı analiz yapmak: kalan miktar, aşım miktarı, yüzde tüketim gibi bilgileri hesaplayıp sunmak.\n- Günlük ilerlemeyi özetlemek: hangi makrolar hedefin üstünde, hangisi altında?\n- Haftalık ve aylık örüntüleri yorumlamak: ortalama değerler, trend yönü, hedef tutturma oranları.\n- Kısa, net ve pratik yanıtlar vermek. Gereksiz açıklama yapmaktan kaçın.\n- Kullanıcının sormadığı konularda tavsiye vermekten kaçın.\n- Tıbbi tavsiye vermekten kaçın; yalnızca kullanıcının kendi kaydettiği veriler üzerinden bilgi sun.\n- Eğer veri yetersizse (örneğin bugün hiç öğün kaydı yok), bunu dürüstçe belirt.\n- Yanıtlarında daima Türkçe kullan.\n\nErişebileceğin veriler:\n- Kullanıcının günlük makro hedefleri (kalori, protein, karbonhidrat, yağ, şeker, lif)\n- Öğün kayıtları ve öğün satırları (tarih, öğün adı, besin değerleri)\n- Günlük beslenme özeti (tüketilen vs. hedef)\n- Haftalık ve aylık analitik veriler\n- Yiyecek kütüphanesi öğeleri\n\nYanıtlarını oluştururken önce ilgili verileri araçlarla çek, sonra analiz et ve net bir Türkçe yanıt üret.',
    temperature: 0.2,
    maxTokens: 2048,
    responseFormat: "text",
    toolRegistry,
    conversationStore,
    chatSettings: {
      historyStorage: "database",
      maxHistoryMessages: 20,
      summarizeAfter: 0,
      refreshSystemPrompt: false,
    },
    maxToolCalls: 15,
    maxTokenBudget: 8000,
    timeout: 45000,
    responseProperty: null,
  });

  return runtime;
}

module.exports = { createNutritionGuidanceAgentRuntime };
