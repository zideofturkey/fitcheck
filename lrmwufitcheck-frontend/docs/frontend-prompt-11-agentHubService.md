

# **FITCHECK**

**FRONTEND GUIDE FOR AI CODING AGENTS - PART 11 - AgentHub Service**

This document is a part of a REST API guide for the fitcheck project.
It is designed for AI agents that will generate frontend code to consume the project’s backend.

This document provides extensive instruction for the usage of agentHub

## Service Access

Use the generated hooks for all `agentHub` operations. The SDK handles service URLs, auth headers, and token management. Import hooks from `use-agenthub` and types from `api.ts`.


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

| Operation | Hook | Type |
|-----------|------|------|
| Create | `useCreateAgentOverride()` | mutation |
| Update | `useUpdateAgentOverride()` | mutation |
| Delete | `useDeleteAgentOverride()` | mutation |
| Get | `useGetAgentOverride()` | query |
| List | `useListAgentOverrides()` | query |
### Sys_agentExecution Default APIs

| Operation | Hook | Type |
|-----------|------|------|
| Create | _none_ | mutation |
| Update | _none_ | mutation |
| Delete | _none_ | mutation |
| Get | `useGetAgentExecution()` | query |
| List | `useListAgentExecutions()` | query |
### Sys_toolCatalog Default APIs

| Operation | Hook | Type |
|-----------|------|------|
| Create | _none_ | mutation |
| Update | _none_ | mutation |
| Delete | _none_ | mutation |
| Get | `useGetToolCatalogEntry()` | query |
| List | `useListToolCatalog()` | query |
### Sys_agentConversation Default APIs

| Operation | Hook | Type |
|-----------|------|------|
| Create | _none_ | mutation |
| Update | _none_ | mutation |
| Delete | _none_ | mutation |
| Get | `useGetAgentChatMessages()` | query |
| List | `useListAgentChats()` | query |

When building CRUD forms for a data object, use the default hooks listed above. The form fields should correspond to the API's mutation payload. For relation fields, render a dropdown loaded from the related object's list hook using the display label property.




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



## SDK Hook Reference

Import hooks from `use-agenthub` and use them directly in your page components.


### Hooks Overview

| Hook | Type | CRUD | Auth | Returns |
|------|------|------|------|---------|
| `useGetAgentOverride()` | query | get | login required | `AgenthubSys_agentOverrideResponse` |
| `useListAgentOverrides()` | query | list | login required | `AgenthubSys_agentOverrideListResponse` |
| `useCreateAgentOverride()` | mutation | create | login required | `AgenthubSys_agentOverrideResponse` |
| `useUpdateAgentOverride()` | mutation | update | login required | `AgenthubSys_agentOverrideResponse` |
| `useDeleteAgentOverride()` | mutation | delete | login required | `AgenthubSys_agentOverrideResponse` |
| `useListToolCatalog()` | query | list | login required | `AgenthubSys_toolCatalogListResponse` |
| `useGetToolCatalogEntry()` | query | get | login required | `AgenthubSys_toolCatalogResponse` |
| `useListAgentExecutions()` | query | list | login required | `AgenthubSys_agentExecutionListResponse` |
| `useGetAgentExecution()` | query | get | login required | `AgenthubSys_agentExecutionResponse` |
| `useListAgentChats()` | query | list | login required | `AgenthubSys_agentConversationListResponse` |
| `useGetAgentChatMessages()` | query | get | login required | `AgenthubSys_agentConversationResponse` |

### Types

All response types extend `MindbricksResponse`:

```typescript
interface MindbricksResponse {
  status: "OK";
  statusCode: number;
  dataName?: string;
  rowCount?: number;
  paging?: { pageNumber: number; pageRowCount: number; totalRowCount: number; pageCount: number };
  [key: string]: unknown;
}
```

Each data object has a typed interface, a single-item response type, and a list response type:

**`AgenthubSys_agentOverride`** — Runtime overrides for design-time agents. Null fields use the design default.

```typescript
interface AgenthubSys_agentOverride {
  id: string;
  agentName: string;
  provider?: string;
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: string;
  selectedTools?: Record<string, unknown>;
  guardrails?: Record<string, unknown>;
  enabled: boolean;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

- **Single response:** `AgenthubSys_agentOverrideResponse` → `{ sys_agentOverride: AgenthubSys_agentOverride, dataName: string }` — extract via `data?.sys_agentOverride`
- **List response:** `AgenthubSys_agentOverrideListResponse` → `{ sys_agentOverrides: AgenthubSys_agentOverride[], rowCount: number, dataName: string }` — extract via `data?.sys_agentOverrides ?? []`

**`AgenthubSys_agentExecution`** — Agent execution log. Records each agent invocation with input, output, and performance metrics.

```typescript
interface AgenthubSys_agentExecution {
  id: string;
  agentName: string;
  agentType: 'design' | 'dynamic';
  source: 'rest' | 'sse' | 'kafka' | 'agent';
  userId?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  toolCalls?: number;
  tokenUsage?: Record<string, unknown>;
  durationMs?: number;
  status: 'success' | 'error' | 'timeout';
  error?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

- **Single response:** `AgenthubSys_agentExecutionResponse` → `{ sys_agentExecution: AgenthubSys_agentExecution, dataName: string }` — extract via `data?.sys_agentExecution`
- **List response:** `AgenthubSys_agentExecutionListResponse` → `{ sys_agentExecutions: AgenthubSys_agentExecution[], rowCount: number, dataName: string }` — extract via `data?.sys_agentExecutions ?? []`

**`AgenthubSys_toolCatalog`** — Cached tool catalog discovered from project services. Refreshed periodically.

```typescript
interface AgenthubSys_toolCatalog {
  id: string;
  toolName: string;
  serviceName: string;
  description?: string;
  parameters?: Record<string, unknown>;
  lastRefreshed?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

- **Single response:** `AgenthubSys_toolCatalogResponse` → `{ sys_toolCatalog: AgenthubSys_toolCatalog, dataName: string }` — extract via `data?.sys_toolCatalog`
- **List response:** `AgenthubSys_toolCatalogListResponse` → `{ sys_toolCatalogs: AgenthubSys_toolCatalog[], rowCount: number, dataName: string }` — extract via `data?.sys_toolCatalogs ?? []`

**`AgenthubSys_agentConversation`** — Conversation history for chat-mode AI agents. One record per session, keyed by sessionId.

```typescript
interface AgenthubSys_agentConversation {
  id: string;
  sessionId: string;
  agentName: string;
  userId?: string;
  messages: Record<string, unknown>;
  messageCount?: number;
  createdAt?: string;
  updatedAt?: string;
}
```

- **Single response:** `AgenthubSys_agentConversationResponse` → `{ sys_agentConversation: AgenthubSys_agentConversation, dataName: string }` — extract via `data?.sys_agentConversation`
- **List response:** `AgenthubSys_agentConversationListResponse` → `{ sys_agentConversations: AgenthubSys_agentConversation[], rowCount: number, dataName: string }` — extract via `data?.sys_agentConversations ?? []`


### Hook Details

#### `useGetAgentOverride()`



- **Type:** `query` (use `{ data, isLoading, error }`)
- **Auth:** login required
- **Input:** `(sys_agentOverrideId: string)` — passed positionally
- **Returns:** `AgenthubSys_agentOverrideResponse`

#### `useListAgentOverrides()`



- **Type:** `query` (use `{ data, isLoading, error }`)
- **Auth:** login required
- **Input:** `{ pageNumber?: number, pageRowCount?: number, getJoins?: boolean }`
- **Pagination:** supported — pass `pageNumber` / `pageRowCount` in params
- **Returns:** `AgenthubSys_agentOverrideListResponse`

#### `useCreateAgentOverride()`



- **Type:** `mutation` (use `{ mutate, isPending }`)
- **Auth:** login required
- **Input:** `{ agentName: string, provider?: string, model?: string, systemPrompt?: string, temperature?: number, maxTokens?: number, responseFormat?: string, selectedTools?: Record<string, unknown>, guardrails?: Record<string, unknown>, enabled?: boolean }`
- **Returns:** `AgenthubSys_agentOverrideResponse`

#### `useUpdateAgentOverride()`



- **Type:** `mutation` (use `{ mutate, isPending }`)
- **Auth:** login required
- **Input:** `{ sys_agentOverrideId: string, data: { provider?: string, model?: string, systemPrompt?: string, temperature?: number, maxTokens?: number, responseFormat?: string, selectedTools?: Record<string, unknown>, guardrails?: Record<string, unknown>, enabled?: boolean } }`
- **Returns:** `AgenthubSys_agentOverrideResponse`

#### `useDeleteAgentOverride()`



- **Type:** `mutation` (use `{ mutate, isPending }`)
- **Auth:** login required
- **Input:** `(sys_agentOverrideId: string)` — passed positionally
- **Returns:** `AgenthubSys_agentOverrideResponse`

#### `useListToolCatalog()`



- **Type:** `query` (use `{ data, isLoading, error }`)
- **Auth:** login required
- **Input:** `{ serviceName?: string, pageNumber?: number, pageRowCount?: number, getJoins?: boolean }`
- **Pagination:** supported — pass `pageNumber` / `pageRowCount` in params
- **Returns:** `AgenthubSys_toolCatalogListResponse`

#### `useGetToolCatalogEntry()`



- **Type:** `query` (use `{ data, isLoading, error }`)
- **Auth:** login required
- **Input:** `(sys_toolCatalogId: string)` — passed positionally
- **Returns:** `AgenthubSys_toolCatalogResponse`

#### `useListAgentExecutions()`



- **Type:** `query` (use `{ data, isLoading, error }`)
- **Auth:** login required
- **Input:** `{ agentName?: string, agentType?: 'design' | 'dynamic', source?: 'rest' | 'sse' | 'kafka' | 'agent', userId?: string, status?: 'success' | 'error' | 'timeout', pageNumber?: number, pageRowCount?: number, getJoins?: boolean }`
- **Pagination:** supported — pass `pageNumber` / `pageRowCount` in params
- **Returns:** `AgenthubSys_agentExecutionListResponse`

#### `useGetAgentExecution()`



- **Type:** `query` (use `{ data, isLoading, error }`)
- **Auth:** login required
- **Input:** `(sys_agentExecutionId: string)` — passed positionally
- **Returns:** `AgenthubSys_agentExecutionResponse`

#### `useListAgentChats()`



- **Type:** `query` (use `{ data, isLoading, error }`)
- **Auth:** login required
- **Input:** `{ agentName?: string, userId?: string, pageNumber?: number, pageRowCount?: number, getJoins?: boolean }`
- **Pagination:** supported — pass `pageNumber` / `pageRowCount` in params
- **Returns:** `AgenthubSys_agentConversationListResponse`

#### `useGetAgentChatMessages()`



- **Type:** `query` (use `{ data, isLoading, error }`)
- **Auth:** login required
- **Input:** `(sys_agentConversationId: string)` — passed positionally
- **Returns:** `AgenthubSys_agentConversationResponse`


### Usage Pattern

```tsx
// Query hook (list/get) — returns { data, isLoading, error }
const { data, isLoading } = useListItems();
const items = data?.items ?? [];

// Mutation hook (create/update/delete) — returns { mutate, isPending }
const { mutate: createItem, isPending } = useCreateItem();
createItem(payload, {
  onSuccess: (data) => { /* navigate or invalidate queries */ },
  onError: (err) => { /* show error toast */ },
});
```



**After this prompt, the user may give you new instructions to update the output of this prompt or provide subsequent prompts about the project.**


