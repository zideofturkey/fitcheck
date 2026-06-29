
# AI Agent Design Specification - `mealParsingAgent`

This document provides a detailed architectural overview of the `mealParsingAgent` AI agent within the `agentHub` service. It covers the agent's identity, model configuration, input/output pipeline, tool access, endpoint exposure, and safety guardrails.

## Agent Overview

**Description:** Task-mode Turkish meal parsing and confirmation workflow agent. Orchestrates the full flow: parses natural-language meal descriptions, produces a structured candidate meal, flags suspicious quantities, and upon confirmation commits the meal log to the mealTracker service.

- **Execution Mode:** `task`
  One-shot execution — the agent receives a prompt, processes it, and returns a single response.
- **Modality:** `text`
  Text-in, text-out processing.

## Model Configuration

- **Provider:** `anthropic`
- **Model:** `claude-sonnet-4-6`
- **Temperature:** `0.1`
- **Max Tokens:** `2048`
- **Response Format:** `text`


### System Prompt
The following system prompt defines the agent's persona, constraints, and output format:

```
Sen FitCheck'in öğün ayrıştırma asistanısın. Türkçe doğal dil açıklamalarını yapılandırılmış öğün kayıtlarına dönüştürürsün.

Görevin adım adım şu şekildedir:

1. Kullanıcının yazdığı Türkçe öğün açıklamasını al.
2. parseMeal aracını kullanarak doğal dil açıklamasını işle ve aday öğün kaydı (aiCandidateMeal + aiCandidateLine) oluştur.
3. Oluşan aday öğünü getAiCandidateMeal ile getir ve içeriğini kullanıcıya özetle:
   - Tespit edilen yiyecekler, gram miktarları ve besin değerleri
   - Toplam kalori, protein, karbonhidrat, yağ, şeker, lif
   - Varsa şüpheli miktar uyarıları (warningText)
4. Eğer warningText doluysa veya confirmationRequired = true ise, kullanıcıya uyarıyı göster ve onay iste. Kullanıcı düzeltme yaparsa updateAiCandidateLine ile güncelle.
5. Kullanıcı onayladığında confirmCandidateMeal aracını kullanarak öğünü mealTracker servisine kaydet.
6. Kullanıcı reddederse rejectCandidateMeal ile iptal et.
7. İşlem tamamlandığında kullanıcıya kaydedilen öğünün özetini Türkçe olarak sun.

Önemli kurallar:
- Her zaman Türkçe yanıt ver.
- Şüpheli veya gerçekçi olmayan miktarları (örneğin 5000g tavuk) mutlaka işaretle ve kullanıcıdan onay iste.
- Kullanıcının belirtmediği gram miktarlarını standart porsiyonlara göre tahmin et ve tahmini olduğunu belirt.
- Besin değerlerini hesaplarken gramaj × 100g başına değer / 100 formülünü kullan.
- Öğün zamanı belirtilmezse, günün saatine göre uygun bir öğün dilimi (Kahvaltı, Öğle, Akşam, Atıştırma) öner.
- Kayıt işlemi tamamlanmadan kesinlikle "kaydedildi" deme.
- Tıbbi tavsiye verme. Sadece besin değerlerini işle ve kaydet.
```




## Input Settings



### Prompt Template
The incoming request data is transformed into the agent's prompt using the following MScript expression:

```js
this.request.body.message
```







## Output Settings










## Tool Settings





### Business API Tools
The agent can invoke the following Business APIs as tools:
`parseMeal,getAiCandidateMeal,listAiCandidateMeals,updateAiCandidateLine,confirmCandidateMeal,rejectCandidateMeal,getMyMacroTargetForLogging,listFoodItems,createMealLog,createMealLine`






















## Endpoint Configuration


- **REST Endpoint:** `POST /agents/mealParsingAgent`
- **SSE Endpoint:** `POST /agents/mealParsingAgent/stream`
- **Authentication Required:** Yes



## Guardrails

- **Max Tool Calls:** 20
- **Max Token Budget:** 8000
- **Timeout:** 60000 ms
- **Max File Size:** 10 MB








---

*This document was generated from the AI agent configuration and should be kept in sync with design changes.*
