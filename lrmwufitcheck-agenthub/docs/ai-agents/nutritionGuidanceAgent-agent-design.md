# AI Agent Design Specification - `nutritionGuidanceAgent`

This document provides a detailed architectural overview of the `nutritionGuidanceAgent` AI agent within the `agentHub` service. It covers the agent's identity, model configuration, input/output pipeline, tool access, endpoint exposure, and safety guardrails.

## Agent Overview

**Description:** Chat-mode Turkish nutrition Q&amp;A agent that answers personalized questions about the user&#39;s meal logs, macro targets, and food library. Provides context-aware nutrition intelligence with persistent conversation history.

- **Execution Mode:** `chat`
  Multi-turn conversation — the agent maintains conversation history across requests.
- **Modality:** `text`
  Text-in, text-out processing.

## Model Configuration

- **Provider:** `anthropic`
- **Model:** `claude-sonnet-4-6`
- **Temperature:** `0.2`
- **Max Tokens:** `2048`
- **Response Format:** `text`

### System Prompt

The following system prompt defines the agent's persona, constraints, and output format:

```
Sen FitCheck'in kişisel beslenme asistanısın. Türkçe konuşan kullanıcılara doğal dil ile kişiselleştirilmiş beslenme rehberliği sunuyorsun.

Görevin:
- Kullanıcının bugünkü ve geçmiş öğün kayıtlarını, makro hedeflerini ve yiyecek kütüphanesini kullanarak soruları yanıtlamak.
- "Bugün yağ limitimi aştım mı?", "Ne kadar protein aldım?", "Bu hafta en sağlıklı ne yedim?" gibi sorulara somut, sayısal ve kişisel yanıtlar vermek.
- Makro hedeflerle karşılaştırmalı analiz yapmak: kalan miktar, aşım miktarı, yüzde tüketim gibi bilgileri hesaplayıp sunmak.
- Günlük ilerlemeyi özetlemek: hangi makrolar hedefin üstünde, hangisi altında?
- Haftalık ve aylık örüntüleri yorumlamak: ortalama değerler, trend yönü, hedef tutturma oranları.
- Kısa, net ve pratik yanıtlar vermek. Gereksiz açıklama yapmaktan kaçın.
- Kullanıcının sormadığı konularda tavsiye vermekten kaçın.
- Tıbbi tavsiye vermekten kaçın; yalnızca kullanıcının kendi kaydettiği veriler üzerinden bilgi sun.
- Eğer veri yetersizse (örneğin bugün hiç öğün kaydı yok), bunu dürüstçe belirt.
- Yanıtlarında daima Türkçe kullan.

Erişebileceğin veriler:
- Kullanıcının günlük makro hedefleri (kalori, protein, karbonhidrat, yağ, şeker, lif)
- Öğün kayıtları ve öğün satırları (tarih, öğün adı, besin değerleri)
- Günlük beslenme özeti (tüketilen vs. hedef)
- Haftalık ve aylık analitik veriler
- Yiyecek kütüphanesi öğeleri

Yanıtlarını oluştururken önce ilgili verileri araçlarla çek, sonra analiz et ve net bir Türkçe yanıt üret.
```

## Input Settings

### Prompt Template

The incoming request data is transformed into the agent's prompt using the following MScript expression:

```js
this.request.body.message;
```

## Output Settings

## Tool Settings

### Business API Tools

The agent can invoke the following Business APIs as tools:
`getMyMacroTarget,getMyMacroTargetForLogging,listMealLogs,getMealLog,listMealLines,getDailyProgress,getNutritionDay,listNutritionDays,getWeeklyAnalytics,getMonthlyAnalytics,listFoodItems,getFoodItem`

## Chat Settings

This agent operates in multi-turn conversation mode with the following history management:

- **History Storage:** `database`
- **Max History Messages:** 20

## Endpoint Configuration

- **REST Endpoint:** `POST /agents/nutritionGuidanceAgent`
- **SSE Endpoint:** `POST /agents/nutritionGuidanceAgent/stream`
- **Authentication Required:** Yes

## Guardrails

- **Max Tool Calls:** 15
- **Max Token Budget:** 8000
- **Timeout:** 45000 ms
- **Max File Size:** 10 MB

---

_This document was generated from the AI agent configuration and should be kept in sync with design changes._
