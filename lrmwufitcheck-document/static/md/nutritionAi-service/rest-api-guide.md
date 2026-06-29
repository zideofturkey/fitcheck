 

# REST API GUIDE 
## fitcheck-nutritionai-service
**Version:** `1.0.2`

Processes natural-language Turkish meal descriptions into structured nutrition intents, answers personalized nutrition questions with live meal-log and macro-target context, and maintains operational traceability for all AI parsing and guidance interactions.

## Architectural Design Credit and Contact Information

The architectural design of this microservice is credited to . 
For inquiries, feedback, or further information regarding the architecture, please direct your communication to:

Email: 

We encourage open communication and welcome any questions or discussions related to the architectural aspects of this microservice.

## Documentation Scope

Welcome to the official documentation for the NutritionAi Service's REST API. This document is designed to provide a comprehensive guide to interfacing with our NutritionAi Service exclusively through RESTful API endpoints.

**Intended Audience**

This documentation is intended for developers and integrators who are looking to interact with the NutritionAi Service via HTTP requests for purposes such as creating, updating, deleting and querying NutritionAi objects.

**Overview**

Within these pages, you will find detailed information on how to effectively utilize the REST API, including authentication methods, request and response formats, endpoint descriptions, and examples of common use cases.

Beyond REST
It's important to note that the NutritionAi Service also supports alternative methods of interaction, such as gRPC and messaging via a Message Broker. These communication methods are beyond the scope of this document. For information regarding these protocols, please refer to their respective documentation.

## Authentication And Authorization

To ensure secure access to the NutritionAi service's protected endpoints, a project-wide access token is required. This token serves as the primary method for authenticating requests to our service. However, it's important to note that access control varies across different routes:

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
This section outlines the API endpoints available within the NutritionAi service. Each endpoint can receive parameters through various methods, meticulously described in the following definitions. It's important to understand the flexibility in how parameters can be included in requests to effectively interact with the NutritionAi service.

This service is configured to listen for HTTP requests on port `3000`, 
serving both the main API interface and default administrative endpoints.

The following routes are available by default:

* **API Test Interface (API Face):** `/`
* **Swagger Documentation:** `/swagger`
* **Postman Collection Download:** `/getPostmanCollection`
* **Health Checks:** `/health` and `/admin/health`
* **Current Session Info:** `/currentuser`
* **Favicon:** `/favicon.ico`

This service is accessible via the following environment-specific URLs:

* **Preview:** `https://lrmwufitcheck.preview.mindbricks.com/nutritionai-api`
* **Staging:** `https://lrmwufitcheck-stage.mindbricks.co/nutritionai-api`
* **Production:** `https://lrmwufitcheck.mindbricks.co/nutritionai-api`

**Parameter Inclusion Methods:**
Parameters can be incorporated into API requests in several ways, each with its designated location. Understanding these methods is crucial for correctly constructing your requests:

**Query Parameters:** Included directly in the URL's query string.

**Path Parameters:** Embedded within the URL's path.

**Body Parameters:** Sent within the JSON body of the request.

**Session Parameters:** Automatically read from the session object. This method is used for parameters that are intrinsic to the user's session, such as userId. When using an API that involves session parameters, you can omit these from your request. The service will automatically bind them to the API layer, provided that a session is associated with your request.

**Note on Session Parameters:**
Session parameters represent a unique method of parameter inclusion, relying on the context of the user's session. A common example of a session parameter is userId, which the service automatically associates with your request when a session exists. This feature ensures seamless integration of user-specific data without manual input for each request.

By adhering to the specified parameter inclusion methods, you can effectively utilize the NutritionAi service's API endpoints. For detailed information on each endpoint, including required parameters and their accepted locations, refer to the individual API definitions below.

### Common Parameters

The `NutritionAi` service's business API support several common parameters designed to modify and enhance the behavior of API requests. These parameters are not individually listed in the API route definitions to avoid repetition. Instead, refer to this section to understand how to leverage these common behaviors across different routes. Note that all common parameters should be included in the query part of the URL.

### Supported Common Parameters:

- **getJoins (BOOLEAN)**: Controls whether to retrieve associated objects along with the main object. By default, `getJoins` is assumed to be `true`. Set it to `false` if you prefer to receive only the main fields of an object, excluding its associations.

- **excludeCQRS (BOOLEAN)**: Applicable only when `getJoins` is `true`. By default, `excludeCQRS` is set to `false`. Enabling this parameter (`true`) omits non-local associations, which are typically more resource-intensive as they require querying external services like ElasticSearch for additional information. Use this to optimize response times and resource usage.

- **requestId (String)**: Identifies a request to enable tracking through the service's log chain. A random hex string of 32 characters is assigned by default. If you wish to use a custom `requestId`, simply include it in your query parameters.

- **caching (BOOLEAN)**: Determines the use of caching for query API. By default, caching is enabled (`true`). To ensure the freshest data directly from the database, set this parameter to `false`, bypassing the cache.

- **cacheTTL (Integer)**: Specifies the Time-To-Live (TTL) for query caching, in seconds. This is particularly useful for adjusting the default caching duration (5 minutes) for `get list` queries. Setting a custom `cacheTTL` allows you to fine-tune the cache lifespan to meet your needs.

- **pageNumber (Integer)**: For paginated `get list` API's, this parameter selects which page of results to retrieve. The default is `1`, indicating the first page. To disable pagination and retrieve all results, set `pageNumber` to `0`.

- **pageRowCount (Integer)**: In conjunction with paginated API's, this parameter defines the number of records per page. The default value is `25`. Adjusting `pageRowCount` allows you to control the volume of data returned in a single request.

By utilizing these common parameters, you can tailor the behavior of API requests to suit your specific requirements, ensuring optimal performance and usability of the `NutritionAi` service.


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

When the `NutritionAi` service processes requests successfully, it wraps the requested resource(s) within a JSON envelope. This envelope not only contains the data but also includes essential metadata, such as configuration details and pagination information, to enrich the response and provide context to the client.

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
NutritionAi service provides the following resources which are stored in its own database as a data object. Note that a resource for an api access is a data object for the service.

### AiSession resource

*Resource Definition* : Records every AI interaction initiated by a user — either a meal-parsing request or a nutrition guidance question — capturing the raw input, detected language, processing state, and final localized response.
*AiSession Resource Properties* 
| Name | Type | Required | Default | Definition | 
| ---- | ---- | -------- | ------- | ---------- |
| **userId** | ID |  |  | ** |
| **sessionType** | Enum |  |  | ** |
| **inputText** | Text |  |  | ** |
| **detectedLanguage** | String |  |  | ** |
| **sessionState** | Enum |  |  | ** |
| **confidenceScore** | Double |  |  | ** |
| **finalResponseText** | Text |  |  | ** |
#### Enum Properties
Enum properties are represented as strings in the database. The values are mapped to their corresponding names in the application layer.
##### sessionType Enum Property
*Enum Options*
| Name | Value | Index | 
| ---- | ----- | ----- |
| **mealParsing** | `"mealParsing""` | 0 | 
| **nutritionGuidance** | `"nutritionGuidance""` | 1 | 
##### sessionState Enum Property
*Enum Options*
| Name | Value | Index | 
| ---- | ----- | ----- |
| **pending** | `"pending""` | 0 | 
| **needsConfirmation** | `"needsConfirmation""` | 1 | 
| **completed** | `"completed""` | 2 | 
| **failed** | `"failed""` | 3 | 
### AiCandidateMeal resource

*Resource Definition* : Stores the structured meal proposal produced by AI parsing of a user&#39;s natural-language input — holds proposed slot, date, nutrition totals, warning flags, and a confirmation status before the meal is committed to mealTracker.
*AiCandidateMeal Resource Properties* 
| Name | Type | Required | Default | Definition | 
| ---- | ---- | -------- | ------- | ---------- |
| **userId** | ID |  |  | ** |
| **aiSessionId** | ID |  |  | ** |
| **proposedMealDate** | Date |  |  | ** |
| **proposedMealTime** | String |  |  | ** |
| **proposedSlotName** | String |  |  | ** |
| **candidateSource** | Enum |  |  | ** |
| **warningText** | Text |  |  | ** |
| **confirmationRequired** | Boolean |  |  | ** |
| **isConfirmed** | Boolean |  |  | ** |
| **isCommitted** | Boolean |  |  | ** |
| **totalCalories** | Double |  |  | ** |
| **totalProtein** | Double |  |  | ** |
| **totalCarbohydrates** | Double |  |  | ** |
| **totalFat** | Double |  |  | ** |
| **totalSugar** | Double |  |  | ** |
| **totalFiber** | Double |  |  | ** |
| **committedMealLogId** | ID |  |  | ** |
#### Enum Properties
Enum properties are represented as strings in the database. The values are mapped to their corresponding names in the application layer.
##### candidateSource Enum Property
*Enum Options*
| Name | Value | Index | 
| ---- | ----- | ----- |
| **aiAssistant** | `"aiAssistant""` | 0 | 
### AiCandidateLine resource

*Resource Definition* : Represents a single food item detected within an AI candidate meal — stores AI-estimated gram amounts and nutrition values as a snapshot, along with confidence, reference source, and user&#39;s choice to save the food to their library.
*AiCandidateLine Resource Properties* 
| Name | Type | Required | Default | Definition | 
| ---- | ---- | -------- | ------- | ---------- |
| **userId** | ID |  |  | ** |
| **aiCandidateMealId** | ID |  |  | ** |
| **detectedFoodName** | String |  |  | ** |
| **estimatedGrams** | Double |  |  | ** |
| **estimatedCalories** | Double |  |  | ** |
| **estimatedProtein** | Double |  |  | ** |
| **estimatedCarbohydrates** | Double |  |  | ** |
| **estimatedFat** | Double |  |  | ** |
| **estimatedSugar** | Double |  |  | ** |
| **estimatedFiber** | Double |  |  | ** |
| **quantityConfidence** | Double |  |  | ** |
| **nutritionReference** | String |  |  | ** |
| **saveAsFood** | Boolean |  |  | ** |
### AiGuidanceNote resource

*Resource Definition* : Persists the structured outcome of a nutrition guidance Q&amp;A interaction — stores question classification, time range context, the summarized answer, rationale, referenced metrics, and any caution text, linked to the parent aiSession.
*AiGuidanceNote Resource Properties* 
| Name | Type | Required | Default | Definition | 
| ---- | ---- | -------- | ------- | ---------- |
| **userId** | ID |  |  | ** |
| **aiSessionId** | ID |  |  | ** |
| **questionType** | String |  |  | ** |
| **contextRange** | String |  |  | ** |
| **answerSummary** | Text |  |  | ** |
| **rationaleText** | Text |  |  | ** |
| **referencedMetricKeys** | String |  |  | ** |
| **cautionText** | Text |  |  | ** |
## Business Api
### `Parse Meal` API
Accepts a natural-language Turkish meal description, creates an aiSession record, invokes the AI parsing library function, and creates the resulting aiCandidateMeal and aiCandidateLine records.

**API Frontend Description By The Backend Architect**

Triggered from the AI chat input box on the meal log page. Show a loading spinner labeled "AI analiz ediyor..." while the request is in flight (can take 3–8 seconds). On 201, navigate to the candidate meal confirmation page (`/ai-candidate-meals/:candidateMealId`). If `confirmationRequired=true`, show the warning banner prominently before showing the food line table. On error, show a Turkish-language toast using `finalResponseText` from the response.

**Rest Route**

The `parseMeal` API REST controller can be triggered via the following route:

`/v1/ai-sessions/parse-meal`


**Rest Request Parameters**


The `parseMeal` api has got 4 regular request parameters  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| inputText  | Text  | true | request.body?.["inputText"] |
| proposedMealDate  | Date  | false | request.body?.["proposedMealDate"] |
| proposedMealTime  | String  | false | request.body?.["proposedMealTime"] |
| proposedSlotName  | String  | false | request.body?.["proposedSlotName"] |
**inputText** : Raw Turkish meal description from the user
**proposedMealDate** : Optional date hint from user
**proposedMealTime** : Optional time hint from user
**proposedSlotName** : Optional meal slot override



**REST Request**
To access the api you can use the **REST** controller with the path **POST  /v1/ai-sessions/parse-meal**
```js
  axios({
    method: 'POST',
    url: '/v1/ai-sessions/parse-meal',
    data: {
            inputText:"Text",  
            proposedMealDate:"Date",  
            proposedMealTime:"String",  
            proposedSlotName:"String",  
    
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
	"dataName": "aiSession",
	"method": "POST",
	"action": "create",
	"appVersion": "Version",
	"rowCount": 1,
	"aiSession": {
		"id": "ID",
		"userId": "ID",
		"sessionType": "Enum",
		"sessionType_idx": "Integer",
		"inputText": "Text",
		"detectedLanguage": "String",
		"sessionState": "Enum",
		"sessionState_idx": "Integer",
		"confidenceScore": "Double",
		"finalResponseText": "Text",
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"isActive": true
	}
}
```


### `Confirm Candidatemeal` API
Confirms a candidate meal after user review — applies optional line adjustments, recalculates totals, writes meal log and lines to mealTracker, saves foods to nutritionLibrary where requested, and marks the candidate as committed.

**API Frontend Description By The Backend Architect**

Triggered by the 'Onayla' button on the candidate meal confirmation page. Disable the button while in flight. On success (200), show toast "Öğün başarıyla kaydedildi!" and navigate to the daily meal log page. If `lineAdjustments` are passed, the UI should pre-populate them from user edits in the confirmation table before submitting. On error, display the error message inline without navigating away.

**Rest Route**

The `confirmCandidateMeal` API REST controller can be triggered via the following route:

`/v1/ai-candidate-meals/:aiCandidateMealId/confirm`


**Rest Request Parameters**


The `confirmCandidateMeal` api has got 5 regular request parameters  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| aiCandidateMealId  | ID  | true | request.params?.["aiCandidateMealId"] |
| proposedMealDate  | Date  | false | request.body?.["proposedMealDate"] |
| proposedMealTime  | String  | false | request.body?.["proposedMealTime"] |
| proposedSlotName  | String  | false | request.body?.["proposedSlotName"] |
| lineAdjustments  | Object  | false | request.body?.["lineAdjustments"] |
**aiCandidateMealId** : This id paremeter is used to select the required data object that will be updated
**proposedMealDate** : User may override the proposed date
**proposedMealTime** : User may override the proposed time
**proposedSlotName** : User may override the meal slot
**lineAdjustments** : Array of per-line gram/saveAsFood overrides



**REST Request**
To access the api you can use the **REST** controller with the path **PATCH  /v1/ai-candidate-meals/:aiCandidateMealId/confirm**
```js
  axios({
    method: 'PATCH',
    url: `/v1/ai-candidate-meals/${aiCandidateMealId}/confirm`,
    data: {
            proposedMealDate:"Date",  
            proposedMealTime:"String",  
            proposedSlotName:"String",  
            lineAdjustments:"Object",  
    
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
	"dataName": "aiCandidateMeal",
	"method": "PATCH",
	"action": "update",
	"appVersion": "Version",
	"rowCount": 1,
	"aiCandidateMeal": {
		"id": "ID",
		"userId": "ID",
		"aiSessionId": "ID",
		"proposedMealDate": "Date",
		"proposedMealTime": "String",
		"proposedSlotName": "String",
		"candidateSource": "Enum",
		"candidateSource_idx": "Integer",
		"warningText": "Text",
		"confirmationRequired": "Boolean",
		"isConfirmed": "Boolean",
		"isCommitted": "Boolean",
		"totalCalories": "Double",
		"totalProtein": "Double",
		"totalCarbohydrates": "Double",
		"totalFat": "Double",
		"totalSugar": "Double",
		"totalFiber": "Double",
		"committedMealLogId": "ID",
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"isActive": true
	}
}
```


### `Ask Nutritionquestion` API
Creates an aiSession for nutrition guidance, fetches macro targets and meal context from sibling services, invokes the AI guidance library function, and persists the structured guidance note.

**API Frontend Description By The Backend Architect**

Triggered from the AI Q&A chat widget on the nutrition dashboard. Show a loading spinner labeled "Yanıt hazırlanıyor..." while the request is in flight (can take 3–8 seconds). On 201, render the guidance response card inline in the chat widget showing `finalResponseText` from the session and the full `aiGuidanceNote` details. The context range selector (today/week/month) should be a toggle above the text input; default is 'today'.

**Rest Route**

The `askNutritionQuestion` API REST controller can be triggered via the following route:

`/v1/ai-sessions/ask`


**Rest Request Parameters**


The `askNutritionQuestion` api has got 2 regular request parameters  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| inputText  | Text  | true | request.body?.["inputText"] |
| contextRange  | String  | false | request.body?.["contextRange"] |
**inputText** : Natural-language nutrition question in Turkish
**contextRange** : Time scope for context: today, week, month



**REST Request**
To access the api you can use the **REST** controller with the path **POST  /v1/ai-sessions/ask**
```js
  axios({
    method: 'POST',
    url: '/v1/ai-sessions/ask',
    data: {
            inputText:"Text",  
            contextRange:"String",  
    
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
	"dataName": "aiSession",
	"method": "POST",
	"action": "create",
	"appVersion": "Version",
	"rowCount": 1,
	"aiSession": {
		"id": "ID",
		"userId": "ID",
		"sessionType": "Enum",
		"sessionType_idx": "Integer",
		"inputText": "Text",
		"detectedLanguage": "String",
		"sessionState": "Enum",
		"sessionState_idx": "Integer",
		"confidenceScore": "Double",
		"finalResponseText": "Text",
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"isActive": true
	}
}
```


### `Get Aisession` API
**[Default get API]** — This is the designated default `get` API for the `aiSession` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
Retrieves a single AI session by ID, scoped to the authenticated user.

**API Frontend Description By The Backend Architect**

Used on the session detail page. Display session metadata at the top (type badge, state badge, creation time). Below, render either the candidate meal card (if `sessionType=mealParsing`) or the guidance note card (if `sessionType=nutritionGuidance`). These are loaded separately via their respective GET endpoints using the session id as a filter.

**Rest Route**

The `getAiSession` API REST controller can be triggered via the following route:

`/v1/ai-sessions/:aiSessionId`


**Rest Request Parameters**


The `getAiSession` api has got 1 regular request parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| aiSessionId  | ID  | true | request.params?.["aiSessionId"] |
**aiSessionId** : This id paremeter is used to query the required data object.



**REST Request**
To access the api you can use the **REST** controller with the path **GET  /v1/ai-sessions/:aiSessionId**
```js
  axios({
    method: 'GET',
    url: `/v1/ai-sessions/${aiSessionId}`,
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
	"dataName": "aiSession",
	"method": "GET",
	"action": "get",
	"appVersion": "Version",
	"rowCount": 1,
	"aiSession": {
		"id": "ID",
		"userId": "ID",
		"sessionType": "Enum",
		"sessionType_idx": "Integer",
		"inputText": "Text",
		"detectedLanguage": "String",
		"sessionState": "Enum",
		"sessionState_idx": "Integer",
		"confidenceScore": "Double",
		"finalResponseText": "Text",
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"isActive": true
	}
}
```


### `List Aisessions` API
**[Default list API]** — This is the designated default `list` API for the `aiSession` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
Lists all AI sessions for the authenticated user, ordered by most recent first.

**API Frontend Description By The Backend Architect**

Displayed on the AI session history page as a paginated list. Each row shows: `sessionType` badge, `sessionState` status chip, a preview of `inputText` (truncated to 80 chars), and `createdAt` as relative time. Default sort: newest first. Support filter chips by `sessionType` and `sessionState` using the auto-filter parameters. Clicking a row opens the session detail page.

**Rest Route**

The `listAiSessions` API REST controller can be triggered via the following route:

`/v1/ai-sessions`


**Rest Request Parameters**



**Filter Parameters**

The `listAiSessions` api supports 3 optional filter parameters for filtering list results:

**userId** (`ID`): Filter by userId

- Single: `?userId=<value>`
- Multiple: `?userId=<value1>&userId=<value2>`
- Null: `?userId=null`


**sessionType** (`Enum`): Filter by sessionType

- Single: `?sessionType=<value>` (case-insensitive)
- Multiple: `?sessionType=<value1>&sessionType=<value2>`
- Null: `?sessionType=null`


**sessionState** (`Enum`): Filter by sessionState

- Single: `?sessionState=<value>` (case-insensitive)
- Multiple: `?sessionState=<value1>&sessionState=<value2>`
- Null: `?sessionState=null`



**REST Request**
To access the api you can use the **REST** controller with the path **GET  /v1/ai-sessions**
```js
  axios({
    method: 'GET',
    url: '/v1/ai-sessions',
    data: {
    
    },
    params: {
    
        // Filter parameters (see Filter Parameters section above)
        // userId: '<value>' // Filter by userId
        // sessionType: '<value>' // Filter by sessionType
        // sessionState: '<value>' // Filter by sessionState
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
	"dataName": "aiSessions",
	"method": "GET",
	"action": "list",
	"appVersion": "Version",
	"rowCount": "\"Number\"",
	"aiSessions": [
		{
			"id": "ID",
			"userId": "ID",
			"sessionType": "Enum",
			"sessionType_idx": "Integer",
			"inputText": "Text",
			"detectedLanguage": "String",
			"sessionState": "Enum",
			"sessionState_idx": "Integer",
			"confidenceScore": "Double",
			"finalResponseText": "Text",
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


### `Get Aicandidatemeal` API
**[Default get API]** — This is the designated default `get` API for the `aiCandidateMeal` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
Retrieves a single candidate meal by ID, scoped to the authenticated user.

**API Frontend Description By The Backend Architect**

Used on the candidate meal confirmation page. Load this first to show meal slot/date info and totals. Then load the candidate lines via the list endpoint filtered by `aiCandidateMealId`. If `isCommitted=true`, show the committed state with a link to the meal log.

**Rest Route**

The `getAiCandidateMeal` API REST controller can be triggered via the following route:

`/v1/ai-candidate-meals/:aiCandidateMealId`


**Rest Request Parameters**


The `getAiCandidateMeal` api has got 1 regular request parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| aiCandidateMealId  | ID  | true | request.params?.["aiCandidateMealId"] |
**aiCandidateMealId** : This id paremeter is used to query the required data object.



**REST Request**
To access the api you can use the **REST** controller with the path **GET  /v1/ai-candidate-meals/:aiCandidateMealId**
```js
  axios({
    method: 'GET',
    url: `/v1/ai-candidate-meals/${aiCandidateMealId}`,
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
	"dataName": "aiCandidateMeal",
	"method": "GET",
	"action": "get",
	"appVersion": "Version",
	"rowCount": 1,
	"aiCandidateMeal": {
		"id": "ID",
		"userId": "ID",
		"aiSessionId": "ID",
		"proposedMealDate": "Date",
		"proposedMealTime": "String",
		"proposedSlotName": "String",
		"candidateSource": "Enum",
		"candidateSource_idx": "Integer",
		"warningText": "Text",
		"confirmationRequired": "Boolean",
		"isConfirmed": "Boolean",
		"isCommitted": "Boolean",
		"totalCalories": "Double",
		"totalProtein": "Double",
		"totalCarbohydrates": "Double",
		"totalFat": "Double",
		"totalSugar": "Double",
		"totalFiber": "Double",
		"committedMealLogId": "ID",
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"isActive": true
	}
}
```


### `List Aicandidatemeals` API
**[Default list API]** — This is the designated default `list` API for the `aiCandidateMeal` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
Lists candidate meals for the authenticated user.

**API Frontend Description By The Backend Architect**

Used when showing the user's AI parsing history. Each row shows: proposed meal slot, proposed date, total calories, confirmation state (isConfirmed/isCommitted chips). Support auto-filters by `isConfirmed`, `isCommitted`, `aiSessionId`.

**Rest Route**

The `listAiCandidateMeals` API REST controller can be triggered via the following route:

`/v1/ai-candidate-meals`


**Rest Request Parameters**



**Filter Parameters**

The `listAiCandidateMeals` api supports 4 optional filter parameters for filtering list results:

**userId** (`ID`): Filter by userId

- Single: `?userId=<value>`
- Multiple: `?userId=<value1>&userId=<value2>`
- Null: `?userId=null`


**aiSessionId** (`ID`): Filter by aiSessionId

- Single: `?aiSessionId=<value>`
- Multiple: `?aiSessionId=<value1>&aiSessionId=<value2>`
- Null: `?aiSessionId=null`


**isConfirmed** (`Boolean`): Filter by isConfirmed

- True: `?isConfirmed=true`
- False: `?isConfirmed=false`
- Null: `?isConfirmed=null`


**isCommitted** (`Boolean`): Filter by isCommitted

- True: `?isCommitted=true`
- False: `?isCommitted=false`
- Null: `?isCommitted=null`



**REST Request**
To access the api you can use the **REST** controller with the path **GET  /v1/ai-candidate-meals**
```js
  axios({
    method: 'GET',
    url: '/v1/ai-candidate-meals',
    data: {
    
    },
    params: {
    
        // Filter parameters (see Filter Parameters section above)
        // userId: '<value>' // Filter by userId
        // aiSessionId: '<value>' // Filter by aiSessionId
        // isConfirmed: '<value>' // Filter by isConfirmed
        // isCommitted: '<value>' // Filter by isCommitted
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
	"dataName": "aiCandidateMeals",
	"method": "GET",
	"action": "list",
	"appVersion": "Version",
	"rowCount": "\"Number\"",
	"aiCandidateMeals": [
		{
			"id": "ID",
			"userId": "ID",
			"aiSessionId": "ID",
			"proposedMealDate": "Date",
			"proposedMealTime": "String",
			"proposedSlotName": "String",
			"candidateSource": "Enum",
			"candidateSource_idx": "Integer",
			"warningText": "Text",
			"confirmationRequired": "Boolean",
			"isConfirmed": "Boolean",
			"isCommitted": "Boolean",
			"totalCalories": "Double",
			"totalProtein": "Double",
			"totalCarbohydrates": "Double",
			"totalFat": "Double",
			"totalSugar": "Double",
			"totalFiber": "Double",
			"committedMealLogId": "ID",
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


### `Update Aicandidateline` API
**[Default update API]** — This is the designated default `update` API for the `aiCandidateLine` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
Updates a single candidate food line — allows the user to adjust gram amounts, toggle save-as-food, or rename the detected food. Recalculates nutrition values proportionally when grams change.

**API Frontend Description By The Backend Architect**

Triggered by inline editing in the confirmation table. Debounce gram input changes by 500ms before firing. After a successful 200, update the line row in the table with the new nutrition values from the response and refresh the meal totals card client-side. Show a brief inline checkmark on success.

**Rest Route**

The `updateAiCandidateLine` API REST controller can be triggered via the following route:

`/v1/ai-candidate-lines/:aiCandidateLineId`


**Rest Request Parameters**


The `updateAiCandidateLine` api has got 4 regular request parameters  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| aiCandidateLineId  | ID  | true | request.params?.["aiCandidateLineId"] |
| estimatedGrams  | Double  | false | request.body?.["estimatedGrams"] |
| saveAsFood  | Boolean  | false | request.body?.["saveAsFood"] |
| detectedFoodName  | String  | false | request.body?.["detectedFoodName"] |
**aiCandidateLineId** : This id paremeter is used to select the required data object that will be updated
**estimatedGrams** : Updated gram amount
**saveAsFood** : Toggle save-to-library intent
**detectedFoodName** : User may rename the detected food



**REST Request**
To access the api you can use the **REST** controller with the path **PATCH  /v1/ai-candidate-lines/:aiCandidateLineId**
```js
  axios({
    method: 'PATCH',
    url: `/v1/ai-candidate-lines/${aiCandidateLineId}`,
    data: {
            estimatedGrams:"Double",  
            saveAsFood:"Boolean",  
            detectedFoodName:"String",  
    
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
	"dataName": "aiCandidateLine",
	"method": "PATCH",
	"action": "update",
	"appVersion": "Version",
	"rowCount": 1,
	"aiCandidateLine": {
		"id": "ID",
		"userId": "ID",
		"aiCandidateMealId": "ID",
		"detectedFoodName": "String",
		"estimatedGrams": "Double",
		"estimatedCalories": "Double",
		"estimatedProtein": "Double",
		"estimatedCarbohydrates": "Double",
		"estimatedFat": "Double",
		"estimatedSugar": "Double",
		"estimatedFiber": "Double",
		"quantityConfidence": "Double",
		"nutritionReference": "String",
		"saveAsFood": "Boolean",
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"isActive": true
	}
}
```


### `Reject Candidatemeal` API
Rejects a candidate meal, marking it as not confirmed and updating the parent session state to failed.

**API Frontend Description By The Backend Architect**

Triggered by the 'Reddet' button on the candidate meal confirmation page. On success, show toast "Öğün reddedildi" and navigate back to the meal log page.

**Rest Route**

The `rejectCandidateMeal` API REST controller can be triggered via the following route:

`/v1/ai-candidate-meals/:aiCandidateMealId/reject`


**Rest Request Parameters**


The `rejectCandidateMeal` api has got 1 regular request parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| aiCandidateMealId  | ID  | true | request.params?.["aiCandidateMealId"] |
**aiCandidateMealId** : This id paremeter is used to select the required data object that will be updated



**REST Request**
To access the api you can use the **REST** controller with the path **PATCH  /v1/ai-candidate-meals/:aiCandidateMealId/reject**
```js
  axios({
    method: 'PATCH',
    url: `/v1/ai-candidate-meals/${aiCandidateMealId}/reject`,
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
	"dataName": "aiCandidateMeal",
	"method": "PATCH",
	"action": "update",
	"appVersion": "Version",
	"rowCount": 1,
	"aiCandidateMeal": {
		"id": "ID",
		"userId": "ID",
		"aiSessionId": "ID",
		"proposedMealDate": "Date",
		"proposedMealTime": "String",
		"proposedSlotName": "String",
		"candidateSource": "Enum",
		"candidateSource_idx": "Integer",
		"warningText": "Text",
		"confirmationRequired": "Boolean",
		"isConfirmed": "Boolean",
		"isCommitted": "Boolean",
		"totalCalories": "Double",
		"totalProtein": "Double",
		"totalCarbohydrates": "Double",
		"totalFat": "Double",
		"totalSugar": "Double",
		"totalFiber": "Double",
		"committedMealLogId": "ID",
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"isActive": true
	}
}
```


### `Get Aiguidancenote` API
**[Default get API]** — This is the designated default `get` API for the `aiGuidanceNote` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
Retrieves a single AI guidance note by ID, scoped to the authenticated user.

**API Frontend Description By The Backend Architect**

Used on the session detail page for guidance sessions. Show the guidance card with answerSummary prominently, rationaleText in collapsible accordion, cautionText as amber callout.

**Rest Route**

The `getAiGuidanceNote` API REST controller can be triggered via the following route:

`/v1/ai-guidance-notes/:aiGuidanceNoteId`


**Rest Request Parameters**


The `getAiGuidanceNote` api has got 1 regular request parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| aiGuidanceNoteId  | ID  | true | request.params?.["aiGuidanceNoteId"] |
**aiGuidanceNoteId** : This id paremeter is used to query the required data object.



**REST Request**
To access the api you can use the **REST** controller with the path **GET  /v1/ai-guidance-notes/:aiGuidanceNoteId**
```js
  axios({
    method: 'GET',
    url: `/v1/ai-guidance-notes/${aiGuidanceNoteId}`,
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
	"dataName": "aiGuidanceNote",
	"method": "GET",
	"action": "get",
	"appVersion": "Version",
	"rowCount": 1,
	"aiGuidanceNote": {
		"id": "ID",
		"userId": "ID",
		"aiSessionId": "ID",
		"questionType": "String",
		"contextRange": "String",
		"answerSummary": "Text",
		"rationaleText": "Text",
		"referencedMetricKeys": "String",
		"cautionText": "Text",
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"isActive": true
	}
}
```


### `List Aiguidancenotes` API
**[Default list API]** — This is the designated default `list` API for the `aiGuidanceNote` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
Lists all AI guidance notes for the authenticated user.

**API Frontend Description By The Backend Architect**

Displayed in the guidance history section. Each row shows: question type badge, context range label, creation time, and a truncated preview of answerSummary. Support auto-filters by `questionType` and `contextRange`.

**Rest Route**

The `listAiGuidanceNotes` API REST controller can be triggered via the following route:

`/v1/ai-guidance-notes`


**Rest Request Parameters**



**Filter Parameters**

The `listAiGuidanceNotes` api supports 3 optional filter parameters for filtering list results:

**userId** (`ID`): Filter by userId

- Single: `?userId=<value>`
- Multiple: `?userId=<value1>&userId=<value2>`
- Null: `?userId=null`


**questionType** (`String`): Filter by questionType

- Single (partial match, case-insensitive): `?questionType=<value>`
- Multiple: `?questionType=<value1>&questionType=<value2>`
- Null: `?questionType=null`


**contextRange** (`String`): Filter by contextRange

- Single (partial match, case-insensitive): `?contextRange=<value>`
- Multiple: `?contextRange=<value1>&contextRange=<value2>`
- Null: `?contextRange=null`



**REST Request**
To access the api you can use the **REST** controller with the path **GET  /v1/ai-guidance-notes**
```js
  axios({
    method: 'GET',
    url: '/v1/ai-guidance-notes',
    data: {
    
    },
    params: {
    
        // Filter parameters (see Filter Parameters section above)
        // userId: '<value>' // Filter by userId
        // questionType: '<value>' // Filter by questionType
        // contextRange: '<value>' // Filter by contextRange
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
	"dataName": "aiGuidanceNotes",
	"method": "GET",
	"action": "list",
	"appVersion": "Version",
	"rowCount": "\"Number\"",
	"aiGuidanceNotes": [
		{
			"id": "ID",
			"userId": "ID",
			"aiSessionId": "ID",
			"questionType": "String",
			"contextRange": "String",
			"answerSummary": "Text",
			"rationaleText": "Text",
			"referencedMetricKeys": "String",
			"cautionText": "Text",
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
