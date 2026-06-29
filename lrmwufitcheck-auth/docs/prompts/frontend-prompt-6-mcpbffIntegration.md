# **FITCHECK**

**FRONTEND GUIDE FOR AI CODING AGENTS - PART 6 - MCP BFF Integration**

This document is a part of a REST API guide for the fitcheck project.
It is designed for AI agents that will generate frontend code to consume the project's backend.

This document provides comprehensive instructions for integrating the **MCP BFF** (Model Context Protocol - Backend for Frontend) service into the frontend application. The MCP BFF is the central gateway between the frontend AI chat and all backend services.

---

## MCP BFF Architecture Overview

The Fitcheck application uses an **MCP BFF** service that aggregates multiple backend MCP servers into a single frontend-facing API. Instead of the frontend connecting to each service's MCP endpoint directly, it communicates exclusively through the MCP BFF.

```
┌────────────┐     ┌───────────┐     ┌─────────────────┐
│  Frontend   │────▶│  MCP BFF  │────▶│  Auth Service    │
│  (Chat UI)  │     │  :3005    │────▶│  Business Svc 1  │
│             │◀────│           │────▶│  Business Svc N  │
└────────────┘ SSE └───────────┘     └─────────────────┘
```

### Key Responsibilities

- **Tool Aggregation**: Discovers and registers tools from all connected MCP services
- **Session Forwarding**: Injects the user's `accessToken` into every MCP tool call
- **AI Orchestration**: Routes user messages to the AI model, which decides which tools to call
- **SSE Streaming**: Streams chat responses, tool executions, and results to the frontend in real-time
- **Elasticsearch**: Provides direct search/aggregation endpoints across all project indices
- **Logging**: Provides log viewing and real-time console streaming endpoints

## MCP BFF Service URLs

For the MCP BFF service, the base URLs are:

- **Preview:** `https://lrmwufitcheck.preview.mindbricks.com/mcpbff-api`
- **Staging:** `https://lrmwufitcheck-stage.mindbricks.co/mcpbff-api`
- **Production:** `https://lrmwufitcheck.mindbricks.co/mcpbff-api`

All endpoints below are relative to the MCP BFF base URL.

---

## Authentication

All MCP BFF endpoints require authentication. The user's access token (obtained from the Auth service login) must be included in every request:

```js
const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${accessToken}`,
};
```

---

## Chat API (AI Interaction)

The chat API is the primary interface for AI-powered conversations. It supports both regular HTTP responses and **SSE streaming** for real-time output.

### POST /api/chat — Regular Chat

Send a message and receive the complete AI response.

```js
const response = await fetch(`${mcpBffUrl}/api/chat`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    message: "Show me all orders from last week",
    conversationId: "optional-conversation-id", // for conversation context
    context: {}, // additional context
  }),
});
```

### POST /api/chat/stream — SSE Streaming Chat (Recommended)

Stream the AI response in real-time using Server-Sent Events (SSE). This is the recommended approach for chat UIs as it provides immediate feedback while the AI is thinking, calling tools, and generating text.

**Request:**

```js
const response = await fetch(`${mcpBffUrl}/api/chat/stream`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    message: "Create a new product called Widget",
    conversationId: conversationId, // optional, auto-generated if omitted
    disabledServices: [], // optional, service names to exclude
  }),
});
```

**Response:** The server responds with `Content-Type: text/event-stream`. Each SSE frame follows the standard format:

```
event: <eventType>\n
data: <JSON>\n
\n
```

### SSE Event Types

The streaming endpoint emits the following event types in order:

| Event            | When                                       | Data Shape                                                             |
| ---------------- | ------------------------------------------ | ---------------------------------------------------------------------- |
| `start`          | First event, once per stream               | `{ conversationId, provider, aliasMapSummary }`                        |
| `text`           | AI text token streamed (many per response) | `{ content }`                                                          |
| `tool_start`     | AI decided to call a tool                  | `{ tool }`                                                             |
| `tool_executing` | Tool invocation started with resolved args | `{ tool, args }`                                                       |
| `tool_result`    | Tool execution completed                   | `{ tool, result, success, error? }` — **check for `__frontendAction`** |
| `error`          | Unrecoverable error                        | `{ message }`                                                          |
| `done`           | Last event, once per stream                | `{ conversationId, toolCalls, processingTime, aliasMapSummary }`       |

### SSE Event Data Reference

**`start`** — Always the first event. Use `conversationId` for subsequent requests in the same conversation.

```json
{
  "conversationId": "1d143df6-29fd-49f6-823b-524b8b3b4453",
  "provider": "anthropic",
  "aliasMapSummary": { "enabled": true, "count": 0, "samples": [] }
}
```

**`text`** — Streamed token-by-token as the AI generates its response. Concatenate `content` fields to build the full markdown message.

```json
{ "content": "Here" }
{ "content": "'s your" }
{ "content": " current session info" }
```

**`tool_start`** — The AI decided to call a tool. Use this to show a loading/spinner UI for the tool.

```json
{ "tool": "currentuser" }
```

**`tool_executing`** — Tool is now executing with these arguments. Use this to display what the tool is doing.

```json
{ "tool": "currentuser", "args": { "organizationCodename": "babil" } }
```

**`tool_result`** — Tool finished. Check `success` to determine if it succeeded. The `result` field contains the MCP tool response envelope.

```json
{
  "tool": "currentuser",
  "result": {
    "success": true,
    "service": "auth",
    "tool": "currentuser",
    "result": {
      "content": [{ "type": "text", "text": "{...JSON...}" }]
    }
  },
  "success": true
}
```

On failure, `success` is `false` and an `error` string is present:

```json
{
  "tool": "listProducts",
  "error": "Connection refused",
  "success": false
}
```

**`done`** — Always the last event. Contains a summary of all tool calls made and total processing time in milliseconds.

```json
{
  "conversationId": "1d143df6-29fd-49f6-823b-524b8b3b4453",
  "toolCalls": [
    { "tool": "currentuser", "result": { "success": true, "...": "..." } }
  ],
  "processingTime": 10026,
  "aliasMapSummary": {
    "enabled": true,
    "count": 6,
    "samples": [
      { "alias": "user_admin_admin_com" },
      { "alias": "tenant_admin_admin_com" }
    ]
  }
}
```

**`error`** — Sent when an unrecoverable error occurs (e.g., AI service unavailable). The stream ends after this event.

```json
{
  "message": "AI service not configured. Please configure OPENAI_API_KEY or ANTHROPIC_API_KEY in environment variables"
}
```

### SSE Event Lifecycle

A typical conversation stream follows this lifecycle:

```
start
├── text (repeated)              ← AI's initial text tokens
├── tool_start                   ← AI decides to call a tool
├── tool_executing               ← tool running with resolved args
├── tool_result                  ← tool finished
├── text (repeated)              ← AI continues writing after tool result
├── tool_start → tool_executing → tool_result   ← may repeat
├── text (repeated)              ← AI's final text tokens
done
```

Multiple tool calls can happen in a single stream. The AI interleaves text and tool calls — text before tools (explanation), tools in the middle (data retrieval), and text after tools (formatted response using the tool results).

### Inline Segment Rendering (Critical UX Pattern)

**Tool cards MUST be rendered inline inside the assistant message bubble, at the exact position where they occur in the stream — not grouped at the top, not grouped at the bottom, and not outside the bubble.**

The assistant message is an ordered list of **segments**: text segments and tool segments, interleaved in the order they arrive. Each segment appears inside the same message bubble, in sequence:

```
┌─────────────────────────────────────────────────┐
│  [Rendered Markdown — text before tool call]     │
│                                                  │
│  ┌─ Tool Card ─────────────────────────────────┐ │
│  │ 🔧 currentuser                    ✓ success │ │
│  │ args: { organizationCodename: "babil" }     │ │
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  [Rendered Markdown — text after tool call]       │
│                                                  │
│  ┌─ Tool Card ─────────────────────────────────┐ │
│  │ 🔧 listProducts                  ✓ success  │ │
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  [Rendered Markdown — final text]                │
└─────────────────────────────────────────────────┘
```

To achieve this, maintain an **ordered segments array**. Each segment is either `{ type: 'text', content: string }` or `{ type: 'tool', ... }`. When SSE events arrive:

1. **`text`** — Append to the last segment if it is a text segment; otherwise push a new text segment.
2. **`tool_start`** — Push a new tool segment (status: `running`). This "cuts" the current text segment — any further `text` events after the tool completes will start a new text segment.
3. **`tool_executing`** — Update the current tool segment with `args`.
4. **`tool_result`** — Update the current tool segment with `result`, `success`, `error`. Check for `__frontendAction`.
5. After `tool_result`, the next `text` event creates a **new** text segment (the AI is now responding after reviewing the tool result).

Render the message bubble by mapping over the segments array in order, rendering each text segment as markdown and each tool segment as a collapsible tool card.

### Parsing SSE Events (Frontend Implementation)

Use the `fetch` API with a streaming reader. SSE frames can arrive split across chunks, so buffer partial lines:

```js
async function streamChat(
  mcpBffUrl,
  headers,
  message,
  conversationId,
  onEvent,
) {
  const response = await fetch(`${mcpBffUrl}/api/chat/stream`, {
    method: "POST",
    headers,
    body: JSON.stringify({ message, conversationId }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop(); // keep incomplete frame in buffer

    for (const part of parts) {
      let eventType = "message";
      let dataStr = "";

      for (const line of part.split("\n")) {
        if (line.startsWith("event: ")) {
          eventType = line.slice(7).trim();
        } else if (line.startsWith("data: ")) {
          dataStr += line.slice(6);
        }
      }

      if (dataStr) {
        try {
          const data = JSON.parse(dataStr);
          onEvent(eventType, data);
        } catch (e) {
          console.warn("Failed to parse SSE data:", dataStr);
        }
      }
    }
  }
}
```

### Building the Segments Array (React Example)

```js
// segments: Array<{ type: 'text', content: string } | { type: 'tool', tool, args?, result?, success?, error?, status }>
let segments = [];

streamChat(mcpBffUrl, headers, userMessage, conversationId, (event, data) => {
  switch (event) {
    case "start":
      conversationId = data.conversationId;
      segments = [];
      break;

    case "text": {
      const last = segments[segments.length - 1];
      if (last && last.type === "text") {
        last.content += data.content; // append to current text segment
      } else {
        segments.push({ type: "text", content: data.content }); // new text segment
      }
      rerenderBubble(segments);
      break;
    }

    case "tool_start":
      // push a new tool segment — this "cuts" the text flow
      segments.push({ type: "tool", tool: data.tool, status: "running" });
      rerenderBubble(segments);
      break;

    case "tool_executing": {
      const toolSeg = findLastToolSegment(segments, data.tool);
      if (toolSeg) toolSeg.args = data.args;
      rerenderBubble(segments);
      break;
    }

    case "tool_result": {
      const toolSeg = findLastToolSegment(segments, data.tool);
      if (toolSeg) {
        toolSeg.status = data.success ? "complete" : "error";
        toolSeg.result = data.result;
        toolSeg.error = data.error;
        toolSeg.success = data.success;
        // Check for frontend action (QR code, data view, payment, secret)
        toolSeg.frontendAction = extractFrontendAction(data.result);
      }
      rerenderBubble(segments);
      break;
    }

    case "error":
      segments.push({ type: "text", content: `**Error:** ${data.message}` });
      rerenderBubble(segments);
      break;

    case "done":
      // Store final metadata (processingTime, aliasMapSummary) for the message
      finalizeMessage(segments, data);
      break;
  }
});

function findLastToolSegment(segments, toolName) {
  for (let i = segments.length - 1; i >= 0; i--) {
    if (segments[i].type === "tool" && segments[i].tool === toolName)
      return segments[i];
  }
  return null;
}
```

### Rendering the Message Bubble

Render each segment in order inside a single assistant message bubble:

```jsx
function AssistantMessageBubble({ segments }) {
  return (
    <div className="assistant-bubble">
      {segments.map((segment, i) => {
        if (segment.type === "text") {
          return <MarkdownRenderer key={i} content={segment.content} />;
        }
        if (segment.type === "tool") {
          if (segment.frontendAction) {
            return <ActionCard key={i} action={segment.frontendAction} />;
          }
          return <ToolCard key={i} segment={segment} />;
        }
        return null;
      })}
    </div>
  );
}

function ToolCard({ segment }) {
  const isRunning = segment.status === "running";
  const isError = segment.status === "error";

  return (
    <div className={`tool-card ${segment.status}`}>
      <div className="tool-header">
        {isRunning && <Spinner size="sm" />}
        <span className="tool-name">{segment.tool}</span>
        {!isRunning && (isError ? <ErrorIcon /> : <CheckIcon />)}
      </div>
      {segment.args && (
        <CollapsibleSection label="Arguments">
          <pre>{JSON.stringify(segment.args, null, 2)}</pre>
        </CollapsibleSection>
      )}
      {segment.result && (
        <CollapsibleSection label="Result" defaultCollapsed>
          <pre>{JSON.stringify(segment.result, null, 2)}</pre>
        </CollapsibleSection>
      )}
      {segment.error && <div className="tool-error">{segment.error}</div>}
    </div>
  );
}
```

The tool card should be compact by default (just tool name + status icon) with collapsible sections for args and result, so it doesn't dominate the reading flow. While a tool is running (`status: 'running'`), show a spinner. When complete, show a check or error icon.

### Handling `__frontendAction` in Tool Results

When the AI calls certain tools (e.g., QR code, data view, payment, secret reveal), the tool result contains a `__frontendAction` object. This signals the frontend to render a special UI component **inline in the bubble at the tool segment's position** instead of the default collapsible ToolCard. This is already handled in the segments code above — when `segment.frontendAction` is present, render an `ActionCard` instead of a `ToolCard`.

The `extractFrontendAction` helper unwraps the action from various MCP response formats:

```js
function extractFrontendAction(result) {
  if (!result) return null;
  if (result.__frontendAction) return result.__frontendAction;

  // Unwrap MCP wrapper format: result → result.result → content[].text → JSON
  let data = result;
  if (result?.result?.content) data = result.result;

  if (data?.content && Array.isArray(data.content)) {
    const textContent = data.content.find((c) => c.type === "text");
    if (textContent?.text) {
      try {
        const parsed = JSON.parse(textContent.text);
        if (parsed?.__frontendAction) return parsed.__frontendAction;
      } catch {
        /* not JSON */
      }
    }
  }
  return null;
}
```

### Frontend Action Types

| Action Type | Component            | Description                                                |
| ----------- | -------------------- | ---------------------------------------------------------- |
| `qrcode`    | `QrCodeActionCard`   | Renders any string value as a QR code card                 |
| `dataView`  | `DataViewActionCard` | Fetches a Business API route and renders a grid or gallery |
| `payment`   | `PaymentActionCard`  | "Pay Now" button that opens Stripe checkout modal          |

#### QR Code Action (`type: "qrcode"`)

Triggered by the `showQrCode` MCP tool. Renders a QR code card from any string value.

```json
{
  "__frontendAction": {
    "type": "qrcode",
    "value": "https://example.com/invite/ABC123",
    "title": "Invite Link",
    "subtitle": "Scan to open"
  }
}
```

#### Data View Action (`type: "dataView"`)

Triggered by `showBusinessApiListInFrontEnd` or `showBusinessApiGalleryInFrontEnd`.
Frontend calls the provided Business API route using the user's bearer token, then renders:

- `viewType: "grid"` as tabular rows/columns
- `viewType: "gallery"` as image-first cards

```json
{
  "__frontendAction": {
    "type": "dataView",
    "viewType": "grid",
    "title": "Recent Orders",
    "serviceName": "commerce",
    "apiName": "listOrders",
    "routePath": "/v1/listorders",
    "httpMethod": "GET",
    "queryParams": { "pageNo": 1, "pageRowCount": 10 },
    "columns": [
      { "field": "id", "label": "Order ID" },
      { "field": "orderAmount", "label": "Amount", "format": "currency" }
    ]
  }
}
```

#### Payment Action (`type: "payment"`)

Triggered by the `initiatePayment` MCP tool. Renders a payment card with amount and a "Pay Now" button.

```json
{
  "__frontendAction": {
    "type": "payment",
    "orderId": "uuid",
    "orderType": "order",
    "serviceName": "commerce",
    "amount": 99.99,
    "currency": "USD",
    "description": "Order #abc123"
  }
}
```

### Conversation Management

```js
// List user's conversations
GET /api/chat/conversations

// Get conversation history
GET /api/chat/conversations/:conversationId

// Delete a conversation
DELETE /api/chat/conversations/:conversationId
```

---

## MCP Tool Discovery & Direct Invocation

The MCP BFF exposes endpoints for discovering and directly calling MCP tools (useful for debugging or building custom UIs).

### GET /api/tools — List All Tools

```js
const response = await fetch(`${mcpBffUrl}/api/tools`, { headers });
const { tools, count } = await response.json();
// tools: [{ name, description, inputSchema, service }, ...]
```

### GET /api/tools/service/:serviceName — List Service Tools

```js
const response = await fetch(`${mcpBffUrl}/api/tools/service/commerce`, {
  headers,
});
const { tools } = await response.json();
```

### POST /api/tools/call — Call a Tool Directly

```js
const response = await fetch(`${mcpBffUrl}/api/tools/call`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    toolName: "listProducts",
    args: { page: 1, limit: 10 },
  }),
});
const result = await response.json();
```

### GET /api/tools/status — Connection Status

```js
const status = await fetch(`${mcpBffUrl}/api/tools/status`, { headers });
// Returns health of each MCP service connection
```

### POST /api/tools/refresh — Reconnect Services

```js
await fetch(`${mcpBffUrl}/api/tools/refresh`, { method: "POST", headers });
// Reconnects to all MCP services and refreshes the tool registry
```

---

## Elasticsearch API

The MCP BFF provides direct access to Elasticsearch for searching, filtering, and aggregating data across all project indices.

All Elasticsearch endpoints are under `/api/elastic`.

### GET /api/elastic/allIndices — List Project Indices

Returns all Elasticsearch indices belonging to this project (prefixed with `lrmwufitcheck_`).

```js
const indices = await fetch(`${mcpBffUrl}/api/elastic/allIndices`, { headers });
// ["lrmwufitcheck_products", "lrmwufitcheck_orders", ...]
```

### POST /api/elastic/:indexName/rawsearch — Raw Elasticsearch Query

Execute a raw Elasticsearch query on a specific index.

```js
const response = await fetch(`${mcpBffUrl}/api/elastic/products/rawsearch`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    query: {
      bool: {
        must: [
          { match: { status: "active" } },
          { range: { price: { gte: 10, lte: 100 } } },
        ],
      },
    },
    size: 20,
    from: 0,
    sort: [{ createdAt: "desc" }],
  }),
});
const { total, hits, aggregations, took } = await response.json();
// hits: [{ _id, _index, _score, _source: { ...document... } }, ...]
```

Note: The index name is automatically prefixed with `lrmwufitcheck_` if not already prefixed.

### POST /api/elastic/:indexName/search — Simplified Search

A higher-level search API with built-in support for filters, sorting, and pagination.

```js
const response = await fetch(`${mcpBffUrl}/api/elastic/products/search`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    search: "wireless headphones", // Full-text search
    filters: { status: "active" }, // Field filters
    sort: { field: "createdAt", order: "desc" },
    page: 1,
    limit: 25,
  }),
});
```

### POST /api/elastic/:indexName/aggregate — Aggregations

Run aggregation queries for analytics and dashboards.

```js
const response = await fetch(`${mcpBffUrl}/api/elastic/orders/aggregate`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    aggs: {
      status_counts: { terms: { field: "status.keyword" } },
      total_revenue: { sum: { field: "amount" } },
      monthly_orders: {
        date_histogram: { field: "createdAt", calendar_interval: "month" },
      },
    },
    query: { range: { createdAt: { gte: "now-1y" } } },
  }),
});
```

### GET /api/elastic/:indexName/mapping — Index Mapping

Get the field mapping for an index (useful for building dynamic filter UIs).

```js
const mapping = await fetch(`${mcpBffUrl}/api/elastic/products/mapping`, {
  headers,
});
```

### POST /api/elastic/:indexName/ai-search — AI-Assisted Search

Uses the configured AI model to convert a natural-language query into an Elasticsearch query.

```js
const response = await fetch(`${mcpBffUrl}/api/elastic/orders/ai-search`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    query: "orders over $100 from last month that are still pending",
  }),
});
// Returns: { total, hits, generatedQuery, ... }
```

---

## Log API

The MCP BFF provides log viewing endpoints for monitoring application behavior.

### GET /api/logs — Query Logs

```js
const response = await fetch(
  `${mcpBffUrl}/api/logs?page=1&limit=50&logType=2&service=commerce&search=payment`,
  {
    headers,
  },
);
```

**Query Parameters:**

- `page` — Page number (default: 1)
- `limit` — Items per page (default: 50)
- `logType` — 0=INFO, 1=WARNING, 2=ERROR
- `service` — Filter by service name
- `search` — Search in subject and message
- `from` / `to` — Date range (ISO strings)
- `requestId` — Filter by request ID

### GET /api/logs/stream — Real-time Console Stream (SSE)

Streams real-time console output from all services via Server-Sent Events.

```js
const eventSource = new EventSource(
  `${mcpBffUrl}/api/logs/stream?services=commerce,auth`,
  {
    headers: { Authorization: `Bearer ${accessToken}` },
  },
);

eventSource.addEventListener("log", (event) => {
  const logEntry = JSON.parse(event.data);
  // { service, timestamp, level, message, ... }
});
```

---

## Available Services

The MCP BFF connects to the following backend services:

| Service    | Description                               |
| ---------- | ----------------------------------------- |
| `auth`     | Authentication, user management, sessions |
| `agentHub` | AI Agent Hub                              |

Each service exposes MCP tools that the AI can call through the BFF. Use `GET /api/tools` to discover all available tools at runtime, or `GET /api/tools/service/:serviceName` to list tools for a specific service.

---

## MCP as Internal API Gateway

The MCP-BFF service can also be used by the frontend as an **internal API gateway** for tool-based interactions. This is separate from external AI tool connections — it is meant for frontend code that needs to call backend tools programmatically.

### Direct Tool Calls (REST)

Use the REST tool invocation endpoints for programmatic access from frontend code:

```js
// List all available tools
const tools = await fetch(`${mcpBffUrl}/api/tools`, { headers });

// Call a specific tool directly
const result = await fetch(`${mcpBffUrl}/api/tools/call`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    toolName: "listProducts",
    args: { page: 1, limit: 10 },
  }),
});
```

### AI-Orchestrated Calls (Chat API)

For AI-driven interactions, use the chat streaming API documented above (`POST /api/chat/stream`). The AI model decides which tools to call based on the user's message.

Both approaches use the user's JWT access token for authentication — the MCP-BFF forwards it to the correct backend service.

---

## MCP Connection Info for Profile Page

The user's **profile page** should include an informational section explaining how to connect external AI tools (Cursor, Claude Desktop, Lovable, Windsurf, etc.) to this application's backend via MCP.

### What to Display

The MCP-BFF exposes a **unified MCP endpoint** that aggregates tools from all backend services into a single connection point:

| Environment    | URL                                                           |
| -------------- | ------------------------------------------------------------- |
| **Preview**    | `https://lrmwufitcheck.preview.mindbricks.com/mcpbff-api/mcp` |
| **Staging**    | `https://lrmwufitcheck-stage.mindbricks.co/mcpbff-api/mcp`    |
| **Production** | `https://lrmwufitcheck.mindbricks.co/mcpbff-api/mcp`          |

For legacy MCP clients that don't support StreamableHTTP, an SSE fallback is available at the same URL with `/sse` appended (e.g., `.../mcpbff-api/mcp/sse`).

### Profile Page UI Requirements

Add an **"MCP Connection"** or **"Connect External AI Tools"** card/section to the profile page with:

1. **Endpoint URL** — Display the MCP endpoint URL for the current environment with a copy-to-clipboard button.

2. **Ready-to-Copy Configs** — Show copy-to-clipboard config snippets for popular tools:

   **Cursor** (`.cursor/mcp.json`):

   ```json
   {
     "mcpServers": {
       "lrmwufitcheck": {
         "url": "https://lrmwufitcheck.preview.mindbricks.com/mcpbff-api/mcp",
         "headers": {
           "Authorization": "Bearer your_access_token_here"
         }
       }
     }
   }
   ```

   **Claude Desktop** (`claude_desktop_config.json`):

   ```json
   {
     "mcpServers": {
       "lrmwufitcheck": {
         "url": "https://lrmwufitcheck.preview.mindbricks.com/mcpbff-api/mcp",
         "headers": {
           "Authorization": "Bearer your_access_token_here"
         }
       }
     }
   }
   ```

3. **Auth Note** — Note that users should replace `your_access_token_here` with a valid JWT access token from the login API.

4. **OAuth Note** — Display a note that OAuth authentication is not currently supported for MCP connections.

5. **Available Tools** — Optionally show a summary of available tool categories (e.g., "CRUD operations for all data objects, custom business APIs, file operations") or link to the tools discovery endpoint (`GET /api/tools`).

---

**After this prompt, the user may give you new instructions to update the output of this prompt or provide subsequent prompts about the project.**
