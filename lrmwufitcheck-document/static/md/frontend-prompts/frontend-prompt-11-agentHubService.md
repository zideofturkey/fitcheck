

# **FITCHECK**

**FRONTEND GUIDE FOR AI CODING AGENTS - PART 11 - AgentHub Service**

This document is a part of a REST API guide for the fitcheck project.
It is designed for AI agents that will generate frontend code to consume the project’s backend.

This document provides extensive instruction for the usage of agentHub

## Service Access

AgentHub service management is handled through service specific base urls.

AgentHub  service may be deployed to the preview server, staging server, or production server. Therefore,it has 3 access URLs.
The frontend application must support all deployment environments during development, and the user should be able to select the target API server on the login page (already handled in first part.).

For the agentHub service, the base URLs are:

* **Preview:** `https://lrmwufitcheck.preview.mindbricks.com/agenthub-api`
* **Staging:** `https://lrmwufitcheck-stage.mindbricks.co/agenthub-api`
* **Production:** `https://lrmwufitcheck.mindbricks.co/agenthub-api`


## Scope

**AgentHub Service Description**

FitCheck AI Agent Hub — hosts nutrition guidance and meal workflow agents for all registered users. Provides context-aware nutrition intelligence by reading live meal logs, macro targets, food library items, and AI session history.

AgentHub service provides apis and business logic for following data objects in fitcheck application. 
Each data object may be either a central domain of the application data structure or a related helper data object for a central concept.
Note that data object concept is equal to table concept in the database, in the service database each data object is represented as a db table scheme and the object instances as table rows.  


**`sys_agentOverride` Data Object**: Runtime overrides for design-time agents. Null fields use the design default.

**`sys_agentExecution` Data Object**: Agent execution log. Records each agent invocation with input, output, and performance metrics.

**`sys_toolCatalog` Data Object**: Cached tool catalog discovered from project services. Refreshed periodically.

**`sys_agentConversation` Data Object**: Conversation history for chat-mode AI agents. One record per session, keyed by sessionId.



## API Structure

### Object Structure of a Successful Response

When the service processes requests successfully, it wraps the requested resource(s) within a JSON envelope. This envelope includes the data and essential metadata such as configuration details and pagination information, providing context to the client.

**HTTP Status Codes:**

* **200 OK**: Returned for successful GET, LIST, UPDATE, or DELETE operations, indicating that the request was processed successfully.
* **201 Created**: Returned for CREATE operations, indicating that the resource was created successfully.

**Success Response Format:**

For successful operations, the response includes a `"status": "OK"` property, signaling that the request executed successfully. The structure of a successful response is outlined below:

```json
{
  "status":"OK",
  "statusCode": 200,   
  "elapsedMs":126,
  "ssoTime":120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName":"products",
  "method":"GET",
  "action":"list",
  "appVersion":"Version",
  "rowCount":3,
  "products":[{},{},{}],
  "paging": {
    "pageNumber":1, 
    "pageRowCount":25, 
    "totalRowCount":3,
    "pageCount":1
  },
  "filters": [],
  "uiPermissions": []
}
```
* **`products`**: In this example, this key contains the actual response content, which may be a single object or an array of objects depending on the operation.

### Additional Data

Each API may include additional data besides the main data object, depending on the business logic of the API. These will be provided in each API’s response signature.

### Error Response

If a request encounters an issue—whether due to a logical fault or a technical problem—the service responds with a standardized JSON error structure. The HTTP status code indicates the nature of the error, using commonly recognized codes for clarity:

* **400 Bad Request**: The request was improperly formatted or contained invalid parameters.
* **401 Unauthorized**: The request lacked a valid authentication token; login is required.
* **403 Forbidden**: The current token does not grant access to the requested resource.
* **404 Not Found**: The requested resource was not found on the server.
* **500 Internal Server Error**: The server encountered an unexpected condition.

Each error response is structured to provide meaningful insight into the problem, assisting in efficient diagnosis and resolution.

```js
{
  "result": "ERR",
  "status": 400,
  "message": "errMsg_organizationIdisNotAValidID",
  "errCode": 400,
  "date": "2024-03-19T12:13:54.124Z",
  "detail": "String"
}
```


## Sys_agentOverride Data Object

Runtime overrides for design-time agents. Null fields use the design default.



### Sys_agentOverride Data Object Properties

Sys_agentOverride data object has got following properties that are represented as table fields in the database scheme. 
These properties don't stand just for data storage, but each may have different settings to manage the business logic. 

| Property | Type | IsArray | Required | Secret | Description |
|----------|------|---------|----------|--------|-------------|
| `agentName` | String |  | Yes | No | Design-time agent name this override applies to. |
| `provider` | String |  | No | No | Override AI provider (e.g., openai, anthropic). |
| `model` | String |  | No | No | Override model name. |
| `systemPrompt` | Text |  | No | No | Override system prompt. |
| `temperature` | Double |  | No | No | Override temperature (0-2). |
| `maxTokens` | Integer |  | No | No | Override max tokens. |
| `responseFormat` | String |  | No | No | Override response format (text/json). |
| `selectedTools` | Object |  | No | No | Array of tool names from the catalog that this agent can use. |
| `guardrails` | Object |  | No | No | Override guardrails: { maxToolCalls, timeout, maxTokenBudget }. |
| `enabled` | Boolean |  | Yes | No | Enable or disable this agent. |
| `updatedBy` | ID |  | No | No | User who last updated this override. |
* Required properties are mandatory for creating objects and must be provided in the request body if no default value, formula or session bind is set.






## Sys_agentExecution Data Object

Agent execution log. Records each agent invocation with input, output, and performance metrics.



### Sys_agentExecution Data Object Properties

Sys_agentExecution data object has got following properties that are represented as table fields in the database scheme. 
These properties don't stand just for data storage, but each may have different settings to manage the business logic. 

| Property | Type | IsArray | Required | Secret | Description |
|----------|------|---------|----------|--------|-------------|
| `agentName` | String |  | Yes | No | Agent that was executed. |
| `agentType` | Enum |  | Yes | No | Whether this was a design-time or dynamic agent. |
| `source` | Enum |  | Yes | No | How the agent was triggered. |
| `userId` | ID |  | No | No | User who triggered the execution. |
| `input` | Object |  | No | No | Request input (truncated for large payloads). |
| `output` | Object |  | No | No | Response output (truncated for large payloads). |
| `toolCalls` | Integer |  | No | No | Number of tool calls made during execution. |
| `tokenUsage` | Object |  | No | No | Token usage: { prompt, completion, total }. |
| `durationMs` | Integer |  | No | No | Execution time in milliseconds. |
| `status` | Enum |  | Yes | No | Execution status. |
| `error` | Text |  | No | No | Error message if execution failed. |
* Required properties are mandatory for creating objects and must be provided in the request body if no default value, formula or session bind is set.



### Enum Properties
Enum properties are defined with a set of allowed values, ensuring that only valid options can be assigned to them. 
The enum options value will be stored as strings in the database, 
but when a data object is created an additional property with the same name plus an idx suffix will be created, which will hold the index of the selected enum option.
You can use the {fieldName_idx} property to sort by the enum value or when your enum options represent a hiyerarchy of values.
In the frontend input components, enum type properties should only accept values from an option component that lists the enum options.

- **agentType**: [design, dynamic]

- **source**: [rest, sse, kafka, agent]

- **status**: [success, error, timeout]



### Filter Properties

`agentName` `agentType` `source` `userId` `status`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as API parameters in the listing API's.
- **agentName**: String  has a filter named `agentName`
- **agentType**: Enum  has a filter named `agentType`
- **source**: Enum  has a filter named `source`
- **userId**: ID  has a filter named `userId`
- **status**: Enum  has a filter named `status`


## Sys_toolCatalog Data Object

Cached tool catalog discovered from project services. Refreshed periodically.



### Sys_toolCatalog Data Object Properties

Sys_toolCatalog data object has got following properties that are represented as table fields in the database scheme. 
These properties don't stand just for data storage, but each may have different settings to manage the business logic. 

| Property | Type | IsArray | Required | Secret | Description |
|----------|------|---------|----------|--------|-------------|
| `toolName` | String |  | Yes | No | Full tool name (e.g., service:apiName). |
| `serviceName` | String |  | Yes | No | Source service name. |
| `description` | Text |  | No | No | Tool description. |
| `parameters` | Object |  | No | No | JSON Schema of tool parameters. |
| `lastRefreshed` | Date |  | No | No | When this tool was last discovered/refreshed. |
* Required properties are mandatory for creating objects and must be provided in the request body if no default value, formula or session bind is set.





### Filter Properties

`serviceName`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as API parameters in the listing API's.
- **serviceName**: String  has a filter named `serviceName`


## Sys_agentConversation Data Object

Conversation history for chat-mode AI agents. One record per session, keyed by sessionId.



### Sys_agentConversation Data Object Properties

Sys_agentConversation data object has got following properties that are represented as table fields in the database scheme. 
These properties don't stand just for data storage, but each may have different settings to manage the business logic. 

| Property | Type | IsArray | Required | Secret | Description |
|----------|------|---------|----------|--------|-------------|
| `sessionId` | String |  | Yes | No | Unique conversation session identifier. |
| `agentName` | String |  | Yes | No | Name of the agent this conversation belongs to. |
| `userId` | ID |  | No | No | User who owns this conversation. |
| `messages` | Object |  | Yes | No | Array of conversation messages [{role, content, tool_calls?, tool_call_id?}]. |
| `messageCount` | Integer |  | No | No | Number of messages in the conversation. |
* Required properties are mandatory for creating objects and must be provided in the request body if no default value, formula or session bind is set.





### Filter Properties

`agentName` `userId`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as API parameters in the listing API's.
- **agentName**: String  has a filter named `agentName`
- **userId**: ID  has a filter named `userId`



## Default CRUD APIs

For each data object, the backend architect may designate **default APIs** for standard operations (create, update, delete, get, list). These are the APIs that frontend CRUD forms and AI agents should use for basic record management. If no default is explicitly set (`isDefaultApi`), the frontend generator auto-discovers the most general API for each operation.

### Sys_agentOverride Default APIs

| Operation | API Name | Route | Explicitly Set |
|-----------|----------|-------|----------------|
| Create | `createAgentOverride` | `/v1/agentoverride` | Yes |
| Update | `updateAgentOverride` | `/v1/agentoverride/:sys_agentOverrideId` | Yes |
| Delete | `deleteAgentOverride` | `/v1/agentoverride/:sys_agentOverrideId` | Yes |
| Get | `getAgentOverride` | `/v1/agentoverride/:sys_agentOverrideId` | Yes |
| List | `listAgentOverrides` | `/v1/agentoverrides` | Yes |
### Sys_agentExecution Default APIs

| Operation | API Name | Route | Explicitly Set |
|-----------|----------|-------|----------------|
| Create | _none_ | - | Auto |
| Update | _none_ | - | Auto |
| Delete | _none_ | - | Auto |
| Get | `getAgentExecution` | `/v1/agentexecution/:sys_agentExecutionId` | Yes |
| List | `listAgentExecutions` | `/v1/agentexecutions` | Yes |
### Sys_toolCatalog Default APIs

| Operation | API Name | Route | Explicitly Set |
|-----------|----------|-------|----------------|
| Create | _none_ | - | Auto |
| Update | _none_ | - | Auto |
| Delete | _none_ | - | Auto |
| Get | `getToolCatalogEntry` | `/v1/toolcatalogentry/:sys_toolCatalogId` | Yes |
| List | `listToolCatalog` | `/v1/toolcatalog` | Yes |
### Sys_agentConversation Default APIs

| Operation | API Name | Route | Explicitly Set |
|-----------|----------|-------|----------------|
| Create | _none_ | - | Auto |
| Update | _none_ | - | Auto |
| Delete | _none_ | - | Auto |
| Get | `getAgentChatMessages` | `/v1/agentchatmessages/:sys_agentConversationId` | Yes |
| List | `listAgentChats` | `/v1/agentchats` | Yes |

When building CRUD forms for a data object, use the default create/update APIs listed above. The form fields should correspond to the API's body parameters. For relation fields, render a dropdown loaded from the related object's list API using the display label property.




## AI Agents

This service exposes **2** AI agents as dedicated API endpoints. Each agent is a backend-managed AI pipeline with its own model, system prompt, and optional tool access. The frontend interacts with agents through standard HTTP requests — either synchronous REST calls or streaming SSE connections.

### Agent Overview

| Agent | Modality | Mode | REST | SSE | Auth | Path |
|-------|----------|------|------|-----|------|------|
| `nutritionGuidanceAgent` | text | chat | Yes | Yes | Yes | `/agents/nutritionGuidanceAgent` |
| `mealParsingAgent` | text | task | Yes | Yes | Yes | `/agents/mealParsingAgent` |

### Agent: `nutritionGuidanceAgent`

Chat-mode Turkish nutrition Q&amp;A agent that answers personalized questions about the user&#39;s meal logs, macro targets, and food library. Provides context-aware nutrition intelligence with persistent conversation history.

- **Modality:** `text` — text-in, text-out
- **Execution Mode:** `chat` — multi-turn conversation with history management
- **Provider / Model:** `anthropic` / `claude-sonnet-4-6`
- **Response Format:** `text`
- **Token Budget:** 8000
- **Timeout:** 45000ms

#### REST Endpoint (Synchronous)

```
POST {baseUrl}/agents/nutritionGuidanceAgent
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**

```json
{
  "conversationId": "optional-uuid-for-history",
  "prompt": "Your message or instruction to the agent"
}
```
**Response:**

```json
{
  "success": true,
  "data": {
    "response": "Agent response text",
    "conversationId": "uuid"
  }
}
```

#### SSE Endpoint (Streaming)

```
POST {baseUrl}/agents/nutritionGuidanceAgent/stream
Authorization: Bearer {accessToken}
Content-Type: application/json
```

The request body is the same as the REST endpoint. The response is a Server-Sent Events stream:

```
event: chunk
data: {"content":"partial response text..."}

event: chunk
data: {"content":"more text..."}

event: complete
data: {}
```

**Frontend integration pattern:**

```js
const response = await fetch(`${baseUrl}/agents/nutritionGuidanceAgent/stream`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ prompt: userMessage, conversationId }),
});

const reader = response.body.getReader();
const decoder = new TextDecoder();
let buffer = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  buffer += decoder.decode(value, { stream: true });

  const lines = buffer.split('\n');
  buffer = lines.pop() || '';

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      if (data.content) {
        // Append data.content to UI (streaming text)
      }
    }
  }
}
```

#### Conversation Management

This agent operates in **chat mode** with conversation history. To maintain context across messages:

1. On the first message, omit `conversationId` — the response will include a new one.
2. On subsequent messages, pass the same `conversationId` to continue the conversation.
3. Each conversation stores up to **20** messages in the database.

### Agent: `mealParsingAgent`

Task-mode Turkish meal parsing and confirmation workflow agent. Orchestrates the full flow: parses natural-language meal descriptions, produces a structured candidate meal, flags suspicious quantities, and upon confirmation commits the meal log to the mealTracker service.

- **Modality:** `text` — text-in, text-out
- **Execution Mode:** `task` — single request/response (one-shot)
- **Provider / Model:** `anthropic` / `claude-sonnet-4-6`
- **Response Format:** `text`
- **Token Budget:** 8000
- **Timeout:** 60000ms

#### REST Endpoint (Synchronous)

```
POST {baseUrl}/agents/mealParsingAgent
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**

```json
{
  "prompt": "Your message or instruction to the agent"
}
```
**Response:**

```json
{
  "success": true,
  "data": {
    "response": "Agent response text"
  }
}
```

#### SSE Endpoint (Streaming)

```
POST {baseUrl}/agents/mealParsingAgent/stream
Authorization: Bearer {accessToken}
Content-Type: application/json
```

The request body is the same as the REST endpoint. The response is a Server-Sent Events stream:

```
event: chunk
data: {"content":"partial response text..."}

event: chunk
data: {"content":"more text..."}

event: complete
data: {}
```

**Frontend integration pattern:**

```js
const response = await fetch(`${baseUrl}/agents/mealParsingAgent/stream`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ prompt: userMessage }),
});

const reader = response.body.getReader();
const decoder = new TextDecoder();
let buffer = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  buffer += decoder.decode(value, { stream: true });

  const lines = buffer.split('\n');
  buffer = lines.pop() || '';

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      if (data.content) {
        // Append data.content to UI (streaming text)
      }
    }
  }
}
```



## API Reference

### `Get Agentoverride` API
**[Default get API]** — This is the designated default `get` API for the `sys_agentOverride` data object. Frontend generators and AI agents should use this API for standard CRUD operations.



**Rest Route**

The `getAgentOverride` API REST controller can be triggered via the following route:

`/v1/agentoverride/:sys_agentOverrideId`


**Rest Request Parameters**


The `getAgentOverride` api has got 1 regular request parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| sys_agentOverrideId  | ID  | true | request.params?.["sys_agentOverrideId"] |
**sys_agentOverrideId** : This id paremeter is used to query the required data object.



**REST Request**
To access the api you can use the **REST** controller with the path **GET  /v1/agentoverride/:sys_agentOverrideId**
```js
  axios({
    method: 'GET',
    url: `/v1/agentoverride/${sys_agentOverrideId}`,
    data: {
    
    },
    params: {
    
        }
  });
```   
**REST Response**


```json
{
	"status": "OK",
	"statusCode": "200",
	"elapsedMs": 126,
	"ssoTime": 120,
	"source": "db",
	"cacheKey": "hexCode",
	"userId": "ID",
	"sessionId": "ID",
	"requestId": "ID",
	"dataName": "sys_agentOverride",
	"method": "GET",
	"action": "get",
	"appVersion": "Version",
	"rowCount": 1,
	"sys_agentOverride": {
		"id": "ID",
		"agentName": "String",
		"provider": "String",
		"model": "String",
		"systemPrompt": "Text",
		"temperature": "Double",
		"maxTokens": "Integer",
		"responseFormat": "String",
		"selectedTools": "Object",
		"guardrails": "Object",
		"enabled": "Boolean",
		"updatedBy": "ID",
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"isActive": true
	}
}
```


### `List Agentoverrides` API
**[Default list API]** — This is the designated default `list` API for the `sys_agentOverride` data object. Frontend generators and AI agents should use this API for standard CRUD operations.



**Rest Route**

The `listAgentOverrides` API REST controller can be triggered via the following route:

`/v1/agentoverrides`


**Rest Request Parameters**
The `listAgentOverrides` api has got no request parameters.    




**REST Request**
To access the api you can use the **REST** controller with the path **GET  /v1/agentoverrides**
```js
  axios({
    method: 'GET',
    url: '/v1/agentoverrides',
    data: {
    
    },
    params: {
    
        }
  });
```   
**REST Response**


```json
{
	"status": "OK",
	"statusCode": "200",
	"elapsedMs": 126,
	"ssoTime": 120,
	"source": "db",
	"cacheKey": "hexCode",
	"userId": "ID",
	"sessionId": "ID",
	"requestId": "ID",
	"dataName": "sys_agentOverrides",
	"method": "GET",
	"action": "list",
	"appVersion": "Version",
	"rowCount": "\"Number\"",
	"sys_agentOverrides": [
		{
			"id": "ID",
			"agentName": "String",
			"provider": "String",
			"model": "String",
			"systemPrompt": "Text",
			"temperature": "Double",
			"maxTokens": "Integer",
			"responseFormat": "String",
			"selectedTools": "Object",
			"guardrails": "Object",
			"enabled": "Boolean",
			"updatedBy": "ID",
			"recordVersion": "Integer",
			"createdAt": "Date",
			"updatedAt": "Date",
			"_owner": "ID",
			"isActive": true
		},
		{},
		{}
	],
	"paging": {
		"pageNumber": "Number",
		"pageRowCount": "NUmber",
		"totalRowCount": "Number",
		"pageCount": "Number"
	},
	"filters": [],
	"uiPermissions": []
}
```


### `Create Agentoverride` API
**[Default create API]** — This is the designated default `create` API for the `sys_agentOverride` data object. Frontend generators and AI agents should use this API for standard CRUD operations.



**Rest Route**

The `createAgentOverride` API REST controller can be triggered via the following route:

`/v1/agentoverride`


**Rest Request Parameters**


The `createAgentOverride` api has got 10 regular request parameters  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| agentName  | String  | true | request.body?.["agentName"] |
| provider  | String  | false | request.body?.["provider"] |
| model  | String  | false | request.body?.["model"] |
| systemPrompt  | Text  | false | request.body?.["systemPrompt"] |
| temperature  | Double  | false | request.body?.["temperature"] |
| maxTokens  | Integer  | false | request.body?.["maxTokens"] |
| responseFormat  | String  | false | request.body?.["responseFormat"] |
| selectedTools  | Object  | false | request.body?.["selectedTools"] |
| guardrails  | Object  | false | request.body?.["guardrails"] |
| enabled  | Boolean  | false | request.body?.["enabled"] |
**agentName** : Design-time agent name this override applies to.
**provider** : Override AI provider (e.g., openai, anthropic).
**model** : Override model name.
**systemPrompt** : Override system prompt.
**temperature** : Override temperature (0-2).
**maxTokens** : Override max tokens.
**responseFormat** : Override response format (text/json).
**selectedTools** : Array of tool names from the catalog that this agent can use.
**guardrails** : Override guardrails: { maxToolCalls, timeout, maxTokenBudget }.
**enabled** : Optional caller override; defaults to true when omitted.



**REST Request**
To access the api you can use the **REST** controller with the path **POST  /v1/agentoverride**
```js
  axios({
    method: 'POST',
    url: '/v1/agentoverride',
    data: {
            agentName:"String",  
            provider:"String",  
            model:"String",  
            systemPrompt:"Text",  
            temperature:"Double",  
            maxTokens:"Integer",  
            responseFormat:"String",  
            selectedTools:"Object",  
            guardrails:"Object",  
            enabled:"Boolean",  
    
    },
    params: {
    
        }
  });
```   
**REST Response**


```json
{
	"status": "OK",
	"statusCode": "201",
	"elapsedMs": 126,
	"ssoTime": 120,
	"source": "db",
	"cacheKey": "hexCode",
	"userId": "ID",
	"sessionId": "ID",
	"requestId": "ID",
	"dataName": "sys_agentOverride",
	"method": "POST",
	"action": "create",
	"appVersion": "Version",
	"rowCount": 1,
	"sys_agentOverride": {
		"id": "ID",
		"agentName": "String",
		"provider": "String",
		"model": "String",
		"systemPrompt": "Text",
		"temperature": "Double",
		"maxTokens": "Integer",
		"responseFormat": "String",
		"selectedTools": "Object",
		"guardrails": "Object",
		"enabled": "Boolean",
		"updatedBy": "ID",
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"isActive": true
	}
}
```


### `Update Agentoverride` API
**[Default update API]** — This is the designated default `update` API for the `sys_agentOverride` data object. Frontend generators and AI agents should use this API for standard CRUD operations.



**Rest Route**

The `updateAgentOverride` API REST controller can be triggered via the following route:

`/v1/agentoverride/:sys_agentOverrideId`


**Rest Request Parameters**


The `updateAgentOverride` api has got 10 regular request parameters  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| sys_agentOverrideId  | ID  | true | request.params?.["sys_agentOverrideId"] |
| provider  | String  | false | request.body?.["provider"] |
| model  | String  | false | request.body?.["model"] |
| systemPrompt  | Text  | false | request.body?.["systemPrompt"] |
| temperature  | Double  | false | request.body?.["temperature"] |
| maxTokens  | Integer  | false | request.body?.["maxTokens"] |
| responseFormat  | String  | false | request.body?.["responseFormat"] |
| selectedTools  | Object  | false | request.body?.["selectedTools"] |
| guardrails  | Object  | false | request.body?.["guardrails"] |
| enabled  | Boolean  | false | request.body?.["enabled"] |
**sys_agentOverrideId** : This id paremeter is used to select the required data object that will be updated
**provider** : Override AI provider (e.g., openai, anthropic).
**model** : Override model name.
**systemPrompt** : Override system prompt.
**temperature** : Override temperature (0-2).
**maxTokens** : Override max tokens.
**responseFormat** : Override response format (text/json).
**selectedTools** : Array of tool names from the catalog that this agent can use.
**guardrails** : Override guardrails: { maxToolCalls, timeout, maxTokenBudget }.
**enabled** : Update the enabled flag.



**REST Request**
To access the api you can use the **REST** controller with the path **PATCH  /v1/agentoverride/:sys_agentOverrideId**
```js
  axios({
    method: 'PATCH',
    url: `/v1/agentoverride/${sys_agentOverrideId}`,
    data: {
            provider:"String",  
            model:"String",  
            systemPrompt:"Text",  
            temperature:"Double",  
            maxTokens:"Integer",  
            responseFormat:"String",  
            selectedTools:"Object",  
            guardrails:"Object",  
            enabled:"Boolean",  
    
    },
    params: {
    
        }
  });
```   
**REST Response**


```json
{
	"status": "OK",
	"statusCode": "200",
	"elapsedMs": 126,
	"ssoTime": 120,
	"source": "db",
	"cacheKey": "hexCode",
	"userId": "ID",
	"sessionId": "ID",
	"requestId": "ID",
	"dataName": "sys_agentOverride",
	"method": "PATCH",
	"action": "update",
	"appVersion": "Version",
	"rowCount": 1,
	"sys_agentOverride": {
		"id": "ID",
		"agentName": "String",
		"provider": "String",
		"model": "String",
		"systemPrompt": "Text",
		"temperature": "Double",
		"maxTokens": "Integer",
		"responseFormat": "String",
		"selectedTools": "Object",
		"guardrails": "Object",
		"enabled": "Boolean",
		"updatedBy": "ID",
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"isActive": true
	}
}
```


### `Delete Agentoverride` API
**[Default delete API]** — This is the designated default `delete` API for the `sys_agentOverride` data object. Frontend generators and AI agents should use this API for standard CRUD operations.



**Rest Route**

The `deleteAgentOverride` API REST controller can be triggered via the following route:

`/v1/agentoverride/:sys_agentOverrideId`


**Rest Request Parameters**


The `deleteAgentOverride` api has got 1 regular request parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| sys_agentOverrideId  | ID  | true | request.params?.["sys_agentOverrideId"] |
**sys_agentOverrideId** : This id paremeter is used to select the required data object that will be deleted



**REST Request**
To access the api you can use the **REST** controller with the path **DELETE  /v1/agentoverride/:sys_agentOverrideId**
```js
  axios({
    method: 'DELETE',
    url: `/v1/agentoverride/${sys_agentOverrideId}`,
    data: {
    
    },
    params: {
    
        }
  });
```   
**REST Response**


```json
{
	"status": "OK",
	"statusCode": "200",
	"elapsedMs": 126,
	"ssoTime": 120,
	"source": "db",
	"cacheKey": "hexCode",
	"userId": "ID",
	"sessionId": "ID",
	"requestId": "ID",
	"dataName": "sys_agentOverride",
	"method": "DELETE",
	"action": "delete",
	"appVersion": "Version",
	"rowCount": 1,
	"sys_agentOverride": {
		"id": "ID",
		"agentName": "String",
		"provider": "String",
		"model": "String",
		"systemPrompt": "Text",
		"temperature": "Double",
		"maxTokens": "Integer",
		"responseFormat": "String",
		"selectedTools": "Object",
		"guardrails": "Object",
		"enabled": "Boolean",
		"updatedBy": "ID",
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"isActive": false
	}
}
```


### `List Toolcatalog` API
**[Default list API]** — This is the designated default `list` API for the `sys_toolCatalog` data object. Frontend generators and AI agents should use this API for standard CRUD operations.



**Rest Route**

The `listToolCatalog` API REST controller can be triggered via the following route:

`/v1/toolcatalog`


**Rest Request Parameters**



**Filter Parameters**

The `listToolCatalog` api supports 1 optional filter parameter for filtering list results:

**serviceName** (`String`): Source service name.

- Single (partial match, case-insensitive): `?serviceName=<value>`
- Multiple: `?serviceName=<value1>&serviceName=<value2>`
- Null: `?serviceName=null`



**REST Request**
To access the api you can use the **REST** controller with the path **GET  /v1/toolcatalog**
```js
  axios({
    method: 'GET',
    url: '/v1/toolcatalog',
    data: {
    
    },
    params: {
    
        // Filter parameters (see Filter Parameters section above)
        // serviceName: '<value>' // Filter by serviceName
            }
  });
```   
**REST Response**


```json
{
	"status": "OK",
	"statusCode": "200",
	"elapsedMs": 126,
	"ssoTime": 120,
	"source": "db",
	"cacheKey": "hexCode",
	"userId": "ID",
	"sessionId": "ID",
	"requestId": "ID",
	"dataName": "sys_toolCatalogs",
	"method": "GET",
	"action": "list",
	"appVersion": "Version",
	"rowCount": "\"Number\"",
	"sys_toolCatalogs": [
		{
			"id": "ID",
			"toolName": "String",
			"serviceName": "String",
			"description": "Text",
			"parameters": "Object",
			"lastRefreshed": "Date",
			"recordVersion": "Integer",
			"createdAt": "Date",
			"updatedAt": "Date",
			"_owner": "ID",
			"isActive": true
		},
		{},
		{}
	],
	"paging": {
		"pageNumber": "Number",
		"pageRowCount": "NUmber",
		"totalRowCount": "Number",
		"pageCount": "Number"
	},
	"filters": [],
	"uiPermissions": []
}
```


### `Get Toolcatalogentry` API
**[Default get API]** — This is the designated default `get` API for the `sys_toolCatalog` data object. Frontend generators and AI agents should use this API for standard CRUD operations.



**Rest Route**

The `getToolCatalogEntry` API REST controller can be triggered via the following route:

`/v1/toolcatalogentry/:sys_toolCatalogId`


**Rest Request Parameters**


The `getToolCatalogEntry` api has got 1 regular request parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| sys_toolCatalogId  | ID  | true | request.params?.["sys_toolCatalogId"] |
**sys_toolCatalogId** : This id paremeter is used to query the required data object.



**REST Request**
To access the api you can use the **REST** controller with the path **GET  /v1/toolcatalogentry/:sys_toolCatalogId**
```js
  axios({
    method: 'GET',
    url: `/v1/toolcatalogentry/${sys_toolCatalogId}`,
    data: {
    
    },
    params: {
    
        }
  });
```   
**REST Response**


```json
{
	"status": "OK",
	"statusCode": "200",
	"elapsedMs": 126,
	"ssoTime": 120,
	"source": "db",
	"cacheKey": "hexCode",
	"userId": "ID",
	"sessionId": "ID",
	"requestId": "ID",
	"dataName": "sys_toolCatalog",
	"method": "GET",
	"action": "get",
	"appVersion": "Version",
	"rowCount": 1,
	"sys_toolCatalog": {
		"id": "ID",
		"toolName": "String",
		"serviceName": "String",
		"description": "Text",
		"parameters": "Object",
		"lastRefreshed": "Date",
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"isActive": true
	}
}
```


### `List Agentexecutions` API
**[Default list API]** — This is the designated default `list` API for the `sys_agentExecution` data object. Frontend generators and AI agents should use this API for standard CRUD operations.



**Rest Route**

The `listAgentExecutions` API REST controller can be triggered via the following route:

`/v1/agentexecutions`


**Rest Request Parameters**



**Filter Parameters**

The `listAgentExecutions` api supports 5 optional filter parameters for filtering list results:

**agentName** (`String`): Agent that was executed.

- Single (partial match, case-insensitive): `?agentName=<value>`
- Multiple: `?agentName=<value1>&agentName=<value2>`
- Null: `?agentName=null`


**agentType** (`Enum`): Whether this was a design-time or dynamic agent.

- Single: `?agentType=<value>` (case-insensitive)
- Multiple: `?agentType=<value1>&agentType=<value2>`
- Null: `?agentType=null`


**source** (`Enum`): How the agent was triggered.

- Single: `?source=<value>` (case-insensitive)
- Multiple: `?source=<value1>&source=<value2>`
- Null: `?source=null`


**userId** (`ID`): User who triggered the execution.

- Single: `?userId=<value>`
- Multiple: `?userId=<value1>&userId=<value2>`
- Null: `?userId=null`


**status** (`Enum`): Execution status.

- Single: `?status=<value>` (case-insensitive)
- Multiple: `?status=<value1>&status=<value2>`
- Null: `?status=null`



**REST Request**
To access the api you can use the **REST** controller with the path **GET  /v1/agentexecutions**
```js
  axios({
    method: 'GET',
    url: '/v1/agentexecutions',
    data: {
    
    },
    params: {
    
        // Filter parameters (see Filter Parameters section above)
        // agentName: '<value>' // Filter by agentName
        // agentType: '<value>' // Filter by agentType
        // source: '<value>' // Filter by source
        // userId: '<value>' // Filter by userId
        // status: '<value>' // Filter by status
            }
  });
```   
**REST Response**


```json
{
	"status": "OK",
	"statusCode": "200",
	"elapsedMs": 126,
	"ssoTime": 120,
	"source": "db",
	"cacheKey": "hexCode",
	"userId": "ID",
	"sessionId": "ID",
	"requestId": "ID",
	"dataName": "sys_agentExecutions",
	"method": "GET",
	"action": "list",
	"appVersion": "Version",
	"rowCount": "\"Number\"",
	"sys_agentExecutions": [
		{
			"id": "ID",
			"agentName": "String",
			"agentType": "Enum",
			"agentType_idx": "Integer",
			"source": "Enum",
			"source_idx": "Integer",
			"userId": "ID",
			"input": "Object",
			"output": "Object",
			"toolCalls": "Integer",
			"tokenUsage": "Object",
			"durationMs": "Integer",
			"status": "Enum",
			"status_idx": "Integer",
			"error": "Text",
			"recordVersion": "Integer",
			"createdAt": "Date",
			"updatedAt": "Date",
			"_owner": "ID",
			"isActive": true
		},
		{},
		{}
	],
	"paging": {
		"pageNumber": "Number",
		"pageRowCount": "NUmber",
		"totalRowCount": "Number",
		"pageCount": "Number"
	},
	"filters": [],
	"uiPermissions": []
}
```


### `Get Agentexecution` API
**[Default get API]** — This is the designated default `get` API for the `sys_agentExecution` data object. Frontend generators and AI agents should use this API for standard CRUD operations.



**Rest Route**

The `getAgentExecution` API REST controller can be triggered via the following route:

`/v1/agentexecution/:sys_agentExecutionId`


**Rest Request Parameters**


The `getAgentExecution` api has got 1 regular request parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| sys_agentExecutionId  | ID  | true | request.params?.["sys_agentExecutionId"] |
**sys_agentExecutionId** : This id paremeter is used to query the required data object.



**REST Request**
To access the api you can use the **REST** controller with the path **GET  /v1/agentexecution/:sys_agentExecutionId**
```js
  axios({
    method: 'GET',
    url: `/v1/agentexecution/${sys_agentExecutionId}`,
    data: {
    
    },
    params: {
    
        }
  });
```   
**REST Response**


```json
{
	"status": "OK",
	"statusCode": "200",
	"elapsedMs": 126,
	"ssoTime": 120,
	"source": "db",
	"cacheKey": "hexCode",
	"userId": "ID",
	"sessionId": "ID",
	"requestId": "ID",
	"dataName": "sys_agentExecution",
	"method": "GET",
	"action": "get",
	"appVersion": "Version",
	"rowCount": 1,
	"sys_agentExecution": {
		"id": "ID",
		"agentName": "String",
		"agentType": "Enum",
		"agentType_idx": "Integer",
		"source": "Enum",
		"source_idx": "Integer",
		"userId": "ID",
		"input": "Object",
		"output": "Object",
		"toolCalls": "Integer",
		"tokenUsage": "Object",
		"durationMs": "Integer",
		"status": "Enum",
		"status_idx": "Integer",
		"error": "Text",
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"isActive": true
	}
}
```


### `List Agentchats` API
**[Default list API]** — This is the designated default `list` API for the `sys_agentConversation` data object. Frontend generators and AI agents should use this API for standard CRUD operations.



**Rest Route**

The `listAgentChats` API REST controller can be triggered via the following route:

`/v1/agentchats`


**Rest Request Parameters**



**Filter Parameters**

The `listAgentChats` api supports 2 optional filter parameters for filtering list results:

**agentName** (`String`): Name of the agent this conversation belongs to.

- Single (partial match, case-insensitive): `?agentName=<value>`
- Multiple: `?agentName=<value1>&agentName=<value2>`
- Null: `?agentName=null`


**userId** (`ID`): User who owns this conversation.

- Single: `?userId=<value>`
- Multiple: `?userId=<value1>&userId=<value2>`
- Null: `?userId=null`



**REST Request**
To access the api you can use the **REST** controller with the path **GET  /v1/agentchats**
```js
  axios({
    method: 'GET',
    url: '/v1/agentchats',
    data: {
    
    },
    params: {
    
        // Filter parameters (see Filter Parameters section above)
        // agentName: '<value>' // Filter by agentName
        // userId: '<value>' // Filter by userId
            }
  });
```   
**REST Response**


```json
{
	"status": "OK",
	"statusCode": "200",
	"elapsedMs": 126,
	"ssoTime": 120,
	"source": "db",
	"cacheKey": "hexCode",
	"userId": "ID",
	"sessionId": "ID",
	"requestId": "ID",
	"dataName": "sys_agentConversations",
	"method": "GET",
	"action": "list",
	"appVersion": "Version",
	"rowCount": "\"Number\"",
	"sys_agentConversations": [
		{
			"id": "ID",
			"sessionId": "String",
			"agentName": "String",
			"userId": "ID",
			"messages": "Object",
			"messageCount": "Integer",
			"recordVersion": "Integer",
			"createdAt": "Date",
			"updatedAt": "Date",
			"_owner": "ID",
			"isActive": true
		},
		{},
		{}
	],
	"paging": {
		"pageNumber": "Number",
		"pageRowCount": "NUmber",
		"totalRowCount": "Number",
		"pageCount": "Number"
	},
	"filters": [],
	"uiPermissions": []
}
```


### `Get Agentchatmessages` API
**[Default get API]** — This is the designated default `get` API for the `sys_agentConversation` data object. Frontend generators and AI agents should use this API for standard CRUD operations.



**Rest Route**

The `getAgentChatMessages` API REST controller can be triggered via the following route:

`/v1/agentchatmessages/:sys_agentConversationId`


**Rest Request Parameters**


The `getAgentChatMessages` api has got 1 regular request parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| sys_agentConversationId  | ID  | true | request.params?.["sys_agentConversationId"] |
**sys_agentConversationId** : This id paremeter is used to query the required data object.



**REST Request**
To access the api you can use the **REST** controller with the path **GET  /v1/agentchatmessages/:sys_agentConversationId**
```js
  axios({
    method: 'GET',
    url: `/v1/agentchatmessages/${sys_agentConversationId}`,
    data: {
    
    },
    params: {
    
        }
  });
```   
**REST Response**


```json
{
	"status": "OK",
	"statusCode": "200",
	"elapsedMs": 126,
	"ssoTime": 120,
	"source": "db",
	"cacheKey": "hexCode",
	"userId": "ID",
	"sessionId": "ID",
	"requestId": "ID",
	"dataName": "sys_agentConversation",
	"method": "GET",
	"action": "get",
	"appVersion": "Version",
	"rowCount": 1,
	"sys_agentConversation": {
		"id": "ID",
		"sessionId": "String",
		"agentName": "String",
		"userId": "ID",
		"messages": "Object",
		"messageCount": "Integer",
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"isActive": true
	}
}
```



**After this prompt, the user may give you new instructions to update the output of this prompt or provide subsequent prompts about the project.**


