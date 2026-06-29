 

# REST API GUIDE 
## fitcheck-agenthub-service
**Version:** `1.0.0`

FitCheck AI Agent Hub — hosts nutrition guidance and meal workflow agents for all registered users. Provides context-aware nutrition intelligence by reading live meal logs, macro targets, food library items, and AI session history.

## Architectural Design Credit and Contact Information

The architectural design of this microservice is credited to . 
For inquiries, feedback, or further information regarding the architecture, please direct your communication to:

Email: 

We encourage open communication and welcome any questions or discussions related to the architectural aspects of this microservice.

## Documentation Scope

Welcome to the official documentation for the AgentHub Service's REST API. This document is designed to provide a comprehensive guide to interfacing with our AgentHub Service exclusively through RESTful API endpoints.

**Intended Audience**

This documentation is intended for developers and integrators who are looking to interact with the AgentHub Service via HTTP requests for purposes such as creating, updating, deleting and querying AgentHub objects.

**Overview**

Within these pages, you will find detailed information on how to effectively utilize the REST API, including authentication methods, request and response formats, endpoint descriptions, and examples of common use cases.

Beyond REST
It's important to note that the AgentHub Service also supports alternative methods of interaction, such as gRPC and messaging via a Message Broker. These communication methods are beyond the scope of this document. For information regarding these protocols, please refer to their respective documentation.

## Authentication And Authorization

To ensure secure access to the AgentHub service's protected endpoints, a project-wide access token is required. This token serves as the primary method for authenticating requests to our service. However, it's important to note that access control varies across different routes:

**Protected API**: 
Certain API (routes) require specific authorization levels. Access to these routes is contingent upon the possession of a valid access token that meets the route-specific authorization criteria. Unauthorized requests to these routes will be rejected.

**Public API **: 
The service also includes public API (routes) that are accessible without authentication. These public endpoints are designed for open access and do not require an access token.

### Token Locations
When including your access token in a request, ensure it is placed in one of the following specified locations. The service will sequentially search these locations for the token, utilizing the first one it encounters.

| Location               | Token Name / Param Name      |
| ---------------------- | ---------------------------- |
| Query                  | access_token                 |
| Authorization Header   | Bearer                       |
| Header                 | lrmwufitcheck-access-token|
| Cookie                 | lrmwufitcheck-access-token|


Please ensure the token is correctly placed in one of these locations, using the appropriate label as indicated. The service prioritizes these locations in the order listed, processing the first token it successfully identifies.


## Api Definitions
This section outlines the API endpoints available within the AgentHub service. Each endpoint can receive parameters through various methods, meticulously described in the following definitions. It's important to understand the flexibility in how parameters can be included in requests to effectively interact with the AgentHub service.

This service is configured to listen for HTTP requests on port `3006`, 
serving both the main API interface and default administrative endpoints.

The following routes are available by default:

* **API Test Interface (API Face):** `/`
* **Swagger Documentation:** `/swagger`
* **Postman Collection Download:** `/getPostmanCollection`
* **Health Checks:** `/health` and `/admin/health`
* **Current Session Info:** `/currentuser`
* **Favicon:** `/favicon.ico`

This service is accessible via the following environment-specific URLs:

* **Preview:** `https://lrmwufitcheck.preview.mindbricks.com/agenthub-api`
* **Staging:** `https://lrmwufitcheck-stage.mindbricks.co/agenthub-api`
* **Production:** `https://lrmwufitcheck.mindbricks.co/agenthub-api`

**Parameter Inclusion Methods:**
Parameters can be incorporated into API requests in several ways, each with its designated location. Understanding these methods is crucial for correctly constructing your requests:

**Query Parameters:** Included directly in the URL's query string.

**Path Parameters:** Embedded within the URL's path.

**Body Parameters:** Sent within the JSON body of the request.

**Session Parameters:** Automatically read from the session object. This method is used for parameters that are intrinsic to the user's session, such as userId. When using an API that involves session parameters, you can omit these from your request. The service will automatically bind them to the API layer, provided that a session is associated with your request.

**Note on Session Parameters:**
Session parameters represent a unique method of parameter inclusion, relying on the context of the user's session. A common example of a session parameter is userId, which the service automatically associates with your request when a session exists. This feature ensures seamless integration of user-specific data without manual input for each request.

By adhering to the specified parameter inclusion methods, you can effectively utilize the AgentHub service's API endpoints. For detailed information on each endpoint, including required parameters and their accepted locations, refer to the individual API definitions below.

### Common Parameters

The `AgentHub` service's business API support several common parameters designed to modify and enhance the behavior of API requests. These parameters are not individually listed in the API route definitions to avoid repetition. Instead, refer to this section to understand how to leverage these common behaviors across different routes. Note that all common parameters should be included in the query part of the URL.

### Supported Common Parameters:

- **getJoins (BOOLEAN)**: Controls whether to retrieve associated objects along with the main object. By default, `getJoins` is assumed to be `true`. Set it to `false` if you prefer to receive only the main fields of an object, excluding its associations.

- **excludeCQRS (BOOLEAN)**: Applicable only when `getJoins` is `true`. By default, `excludeCQRS` is set to `false`. Enabling this parameter (`true`) omits non-local associations, which are typically more resource-intensive as they require querying external services like ElasticSearch for additional information. Use this to optimize response times and resource usage.

- **requestId (String)**: Identifies a request to enable tracking through the service's log chain. A random hex string of 32 characters is assigned by default. If you wish to use a custom `requestId`, simply include it in your query parameters.

- **caching (BOOLEAN)**: Determines the use of caching for query API. By default, caching is enabled (`true`). To ensure the freshest data directly from the database, set this parameter to `false`, bypassing the cache.

- **cacheTTL (Integer)**: Specifies the Time-To-Live (TTL) for query caching, in seconds. This is particularly useful for adjusting the default caching duration (5 minutes) for `get list` queries. Setting a custom `cacheTTL` allows you to fine-tune the cache lifespan to meet your needs.

- **pageNumber (Integer)**: For paginated `get list` API's, this parameter selects which page of results to retrieve. The default is `1`, indicating the first page. To disable pagination and retrieve all results, set `pageNumber` to `0`.

- **pageRowCount (Integer)**: In conjunction with paginated API's, this parameter defines the number of records per page. The default value is `25`. Adjusting `pageRowCount` allows you to control the volume of data returned in a single request.

By utilizing these common parameters, you can tailor the behavior of API requests to suit your specific requirements, ensuring optimal performance and usability of the `AgentHub` service.


### Error Response

If a request encounters an issue, whether due to a logical fault or a technical problem, the service responds with a standardized JSON error structure. The HTTP status code within this response indicates the nature of the error, utilizing commonly recognized codes for clarity:

- **400 Bad Request**: The request was improperly formatted or contained invalid parameters, preventing the server from processing it.
- **401 Unauthorized**: The request lacked valid authentication credentials or the credentials provided do not grant access to the requested resource.
- **404 Not Found**: The requested resource was not found on the server.
- **500 Internal Server Error**: The server encountered an unexpected condition that prevented it from fulfilling the request.

Each error response is structured to provide meaningful insight into the problem, assisting in diagnosing and resolving issues efficiently.

```js
{
  "result": "ERR",
  "status": 400,
  "message": "errMsg_organizationIdisNotAValidID",
  "errCode": 400,
  "date": "2024-03-19T12:13:54.124Z",
  "detail": "String"
}
```` 

### Object Structure of a Successfull Response

When the `AgentHub` service processes requests successfully, it wraps the requested resource(s) within a JSON envelope. This envelope not only contains the data but also includes essential metadata, such as configuration details and pagination information, to enrich the response and provide context to the client.

**Key Characteristics of the Response Envelope:**

- **Data Presentation**: Depending on the nature of the request, the service returns either a single data object or an array of objects encapsulated within the JSON envelope.
  - **Creation and Update API**: These API routes return the unmodified (pure) form of the data object(s), without any associations to other data objects.
  - **Delete API**: Even though the data is removed from the database, the last known state of the data object(s) is returned in its pure form.
  - **Get Requests**: A single data object is returned in JSON format.
  - **Get List Requests**: An array of data objects is provided, reflecting a collection of resources.

- **Data Structure and Joins**: The complexity of the data structure in the response can vary based on the API's architectural design and the join options specified in the request. The architecture might inherently limit join operations, or they might be dynamically controlled through query parameters.
  - **Pure Data Forms**: In some cases, the response mirrors the exact structure found in the primary data table, without extensions.
  - **Extended Data Forms**: Alternatively, responses might include data extended through joins with tables within the same service or aggregated from external sources, such as ElasticSearch indices related to other services.
  - **Join Varieties**: The extensions might involve one-to-one joins, resulting in single object associations, or one-to-many joins, leading to an array of objects. In certain instances, the data might even feature nested inclusions from other data objects.

**Design Considerations**: The structure of a API's response data is meticulously crafted during the service's architectural planning. This design ensures that responses adequately reflect the intended data relationships and service logic, providing clients with rich and meaningful information.

**Brief Data**: Certain API's return a condensed version of the object data, intentionally selecting only specific fields deemed useful for that request. In such instances, the API documentation will detail the properties included in the response, guiding developers on what to expect.

### API Response Structure

The API utilizes a standardized JSON envelope to encapsulate responses. This envelope is designed to consistently deliver both the requested data and essential metadata, ensuring that clients can efficiently interpret and utilize the response.

**HTTP Status Codes:**

- **200 OK**: This status code is returned for successful GET, LIST, UPDATE, or DELETE operations, indicating that the request has been processed successfully.
- **201 Created**: This status code is specific to CREATE operations, signifying that the requested resource has been successfully created.

**Success Response Format:**

For successful operations, the response includes a `"status": "OK"` property, signaling the successful execution of the request. The structure of a successful response is outlined below:

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
  "rowCount":3
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
````

- **`products`**: In this example, this key contains the actual response content, which may be a single object or an array of objects depending on the operation performed.

**Handling Errors:**

For details on handling error scenarios and understanding the structure of error responses, please refer to the "Error Response" section provided earlier in this documentation. It outlines how error conditions are communicated, including the use of HTTP status codes and standardized JSON structures for error messages.

## Resources 
AgentHub service provides the following resources which are stored in its own database as a data object. Note that a resource for an api access is a data object for the service.

### Sys_agentOverride resource

*Resource Definition* : Runtime overrides for design-time agents. Null fields use the design default.
*Sys_agentOverride Resource Properties* 
| Name | Type | Required | Default | Definition | 
| ---- | ---- | -------- | ------- | ---------- |
| **agentName** | String |  |  | *Design-time agent name this override applies to.* |
| **provider** | String |  |  | *Override AI provider (e.g., openai, anthropic).* |
| **model** | String |  |  | *Override model name.* |
| **systemPrompt** | Text |  |  | *Override system prompt.* |
| **temperature** | Double |  |  | *Override temperature (0-2).* |
| **maxTokens** | Integer |  |  | *Override max tokens.* |
| **responseFormat** | String |  |  | *Override response format (text/json).* |
| **selectedTools** | Object |  |  | *Array of tool names from the catalog that this agent can use.* |
| **guardrails** | Object |  |  | *Override guardrails: { maxToolCalls, timeout, maxTokenBudget }.* |
| **enabled** | Boolean |  |  | *Enable or disable this agent.* |
| **updatedBy** | ID |  |  | *User who last updated this override.* |
### Sys_agentExecution resource

*Resource Definition* : Agent execution log. Records each agent invocation with input, output, and performance metrics.
*Sys_agentExecution Resource Properties* 
| Name | Type | Required | Default | Definition | 
| ---- | ---- | -------- | ------- | ---------- |
| **agentName** | String |  |  | *Agent that was executed.* |
| **agentType** | Enum |  |  | *Whether this was a design-time or dynamic agent.* |
| **source** | Enum |  |  | *How the agent was triggered.* |
| **userId** | ID |  |  | *User who triggered the execution.* |
| **input** | Object |  |  | *Request input (truncated for large payloads).* |
| **output** | Object |  |  | *Response output (truncated for large payloads).* |
| **toolCalls** | Integer |  |  | *Number of tool calls made during execution.* |
| **tokenUsage** | Object |  |  | *Token usage: { prompt, completion, total }.* |
| **durationMs** | Integer |  |  | *Execution time in milliseconds.* |
| **status** | Enum |  |  | *Execution status.* |
| **error** | Text |  |  | *Error message if execution failed.* |
#### Enum Properties
Enum properties are represented as strings in the database. The values are mapped to their corresponding names in the application layer.
##### agentType Enum Property
*Property Definition* : Whether this was a design-time or dynamic agent.*Enum Options*
| Name | Value | Index | 
| ---- | ----- | ----- |
| **design** | `"design""` | 0 | 
| **dynamic** | `"dynamic""` | 1 | 
##### source Enum Property
*Property Definition* : How the agent was triggered.*Enum Options*
| Name | Value | Index | 
| ---- | ----- | ----- |
| **rest** | `"rest""` | 0 | 
| **sse** | `"sse""` | 1 | 
| **kafka** | `"kafka""` | 2 | 
| **agent** | `"agent""` | 3 | 
##### status Enum Property
*Property Definition* : Execution status.*Enum Options*
| Name | Value | Index | 
| ---- | ----- | ----- |
| **success** | `"success""` | 0 | 
| **error** | `"error""` | 1 | 
| **timeout** | `"timeout""` | 2 | 
### Sys_toolCatalog resource

*Resource Definition* : Cached tool catalog discovered from project services. Refreshed periodically.
*Sys_toolCatalog Resource Properties* 
| Name | Type | Required | Default | Definition | 
| ---- | ---- | -------- | ------- | ---------- |
| **toolName** | String |  |  | *Full tool name (e.g., service:apiName).* |
| **serviceName** | String |  |  | *Source service name.* |
| **description** | Text |  |  | *Tool description.* |
| **parameters** | Object |  |  | *JSON Schema of tool parameters.* |
| **lastRefreshed** | Date |  |  | *When this tool was last discovered/refreshed.* |
### Sys_agentConversation resource

*Resource Definition* : Conversation history for chat-mode AI agents. One record per session, keyed by sessionId.
*Sys_agentConversation Resource Properties* 
| Name | Type | Required | Default | Definition | 
| ---- | ---- | -------- | ------- | ---------- |
| **sessionId** | String |  |  | *Unique conversation session identifier.* |
| **agentName** | String |  |  | *Name of the agent this conversation belongs to.* |
| **userId** | ID |  |  | *User who owns this conversation.* |
| **messages** | Object |  |  | *Array of conversation messages [{role, content, tool_calls?, tool_call_id?}].* |
| **messageCount** | Integer |  |  | *Number of messages in the conversation.* |
## Business Api
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




### Authentication Specific Routes



### Common Routes

### Route: currentuser

*Route Definition*: Retrieves the currently authenticated user's session information.

*Route Type*: sessionInfo

*Access Route*: `GET /currentuser`

#### Parameters

This route does **not** require any request parameters.

#### Behavior

- Returns the authenticated session object associated with the current access token.
- If no valid session exists, responds with a 401 Unauthorized.

```js
// Sample GET /currentuser call
axios.get("/currentuser", {
  headers: {
    "Authorization": "Bearer your-jwt-token"
  }
});
````
**Success Response**
Returns the session object, including user-related data and token information.
````
{
  "sessionId": "9cf23fa8-07d4-4e7c-80a6-ec6d6ac96bb9",
  "userId": "d92b9d4c-9b1e-4e95-842e-3fb9c8c1df38",
  "email": "user@example.com",
  "fullname": "John Doe",
  "roleId": "user",
  "tenantId": "abc123",
  "accessToken": "jwt-token-string",
  ...
}
````
**Error Response**
**401 Unauthorized:** No active session found.
````
{
  "status": "ERR",
  "message": "No login found"
}
````

**Notes**
* This route is typically used by frontend or mobile applications to fetch the current session state after login.
* The returned session includes key user identity fields, tenant information (if applicable), and the access token for further authenticated requests.
* Always ensure a valid access token is provided in the request to retrieve the session.

### Route: permissions

`*Route Definition*`: Retrieves all effective permission records assigned to the currently authenticated user.

`*Route Type*`: permissionFetch

*Access Route*: `GET /permissions`

#### Parameters

This route does **not** require any request parameters.

#### Behavior

- Fetches all active permission records (`givenPermissions` entries) associated with the current user session.
- Returns a full array of permission objects.
- Requires a valid session (`access token`) to be available.

```js
// Sample GET /permissions call
axios.get("/permissions", {
  headers: {
    "Authorization": "Bearer your-jwt-token"
  }
});
````
**Success Response**

Returns an array of permission objects.
```json
[
  {
    "id": "perm1",
    "permissionName": "adminPanel.access",
    "roleId": "admin",
    "subjectUserId": "d92b9d4c-9b1e-4e95-842e-3fb9c8c1df38",
    "subjectUserGroupId": null,
    "objectId": null,
    "canDo": true,
    "tenantCodename": "store123"
  },
  {
    "id": "perm2",
    "permissionName": "orders.manage",
    "roleId": null,
    "subjectUserId": "d92b9d4c-9b1e-4e95-842e-3fb9c8c1df38",
    "subjectUserGroupId": null,
    "objectId": null,
    "canDo": true,
    "tenantCodename": "store123"
  }
]
````
Each object reflects a single permission grant, aligned with the givenPermissions model:

- `**permissionName**`: The permission the user has.
- `**roleId**`: If the permission was granted through a role.
-` **subjectUserId**`: If directly granted to the user.
- `**subjectUserGroupId**`: If granted through a group.
- `**objectId**`: If tied to a specific object (OBAC).
- `**canDo**`: True or false flag to represent if permission is active or restricted.

**Error Responses**
* **401 Unauthorized**: No active session found.
```json
{
  "status": "ERR",
  "message": "No login found"
}
````
* **500 Internal Server Error**: Unexpected error fetching permissions.

**Notes**
* The /permissions route is available across all backend services generated by Mindbricks, not just the auth service.
* Auth service: Fetches permissions freshly from the live database (givenPermissions table).
* Other services: Typically use a cached or projected view of permissions stored in a common ElasticSearch store, optimized for faster authorization checks.

> **Tip**:
> Applications can cache permission results client-side or server-side, but should occasionally refresh by calling this endpoint, especially after login or permission-changing operations.

### Route: permissions/:permissionName

*Route Definition*: Checks whether the current user has access to a specific permission, and provides a list of scoped object exceptions or inclusions.

*Route Type*: permissionScopeCheck

*Access Route*: `GET /permissions/:permissionName`

#### Parameters

| Parameter         | Type   | Required | Population             |
|------------------|--------|----------|------------------------|
| permissionName   | String | Yes      | `request.params.permissionName` |

#### Behavior

- Evaluates whether the current user **has access** to the given `permissionName`.
- Returns a structured object indicating:
  - Whether the permission is generally granted (`canDo`)
  - Which object IDs are explicitly included or excluded from access (`exceptions`)
- Requires a valid session (`access token`).

```js
// Sample GET /permissions/orders.manage
axios.get("/permissions/orders.manage", {
  headers: {
    "Authorization": "Bearer your-jwt-token"
  }
});
````

**Success Response**

```json
{
  "canDo": true,
  "exceptions": [
    "a1f2e3d4-xxxx-yyyy-zzzz-object1",
    "b2c3d4e5-xxxx-yyyy-zzzz-object2"
  ]
}
````

* If `canDo` is `true`, the user generally has the permission, but not for the objects listed in `exceptions` (i.e., restrictions).
* If `canDo` is `false`, the user does not have the permission by default — but only for the objects in `exceptions`, they do have permission (i.e., selective overrides).
* The exceptions array contains valid **UUID strings**, each corresponding to an object ID (typically from the data model targeted by the permission).

## Copyright
All sources, documents and other digital materials are copyright of .

## About Us
For more information please visit our website: .

.
.
