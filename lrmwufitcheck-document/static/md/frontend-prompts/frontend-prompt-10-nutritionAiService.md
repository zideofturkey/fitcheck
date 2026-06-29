

# **FITCHECK**

**FRONTEND GUIDE FOR AI CODING AGENTS - PART 10 - NutritionAi Service**

This document is a part of a REST API guide for the fitcheck project.
It is designed for AI agents that will generate frontend code to consume the project’s backend.

This document provides extensive instruction for the usage of nutritionAi

## Service Access

NutritionAi service management is handled through service specific base urls.

NutritionAi  service may be deployed to the preview server, staging server, or production server. Therefore,it has 3 access URLs.
The frontend application must support all deployment environments during development, and the user should be able to select the target API server on the login page (already handled in first part.).

For the nutritionAi service, the base URLs are:

* **Preview:** `https://lrmwufitcheck.preview.mindbricks.com/nutritionai-api`
* **Staging:** `https://lrmwufitcheck-stage.mindbricks.co/nutritionai-api`
* **Production:** `https://lrmwufitcheck.mindbricks.co/nutritionai-api`


## Scope

**NutritionAi Service Description**

Processes natural-language Turkish meal descriptions into structured nutrition intents, answers personalized nutrition questions with live meal-log and macro-target context, and maintains operational traceability for all AI parsing and guidance interactions.

NutritionAi service provides apis and business logic for following data objects in fitcheck application. 
Each data object may be either a central domain of the application data structure or a related helper data object for a central concept.
Note that data object concept is equal to table concept in the database, in the service database each data object is represented as a db table scheme and the object instances as table rows.  


**`aiSession` Data Object**: Records every AI interaction initiated by a user — either a meal-parsing request or a nutrition guidance question — capturing the raw input, detected language, processing state, and final localized response.

**`aiCandidateMeal` Data Object**: Stores the structured meal proposal produced by AI parsing of a user's natural-language input — holds proposed slot, date, nutrition totals, warning flags, and a confirmation status before the meal is committed to mealTracker.

**`aiCandidateLine` Data Object**: Represents a single food item detected within an AI candidate meal — stores AI-estimated gram amounts and nutrition values as a snapshot, along with confidence, reference source, and user's choice to save the food to their library.

**`aiGuidanceNote` Data Object**: Persists the structured outcome of a nutrition guidance Q&A interaction — stores question classification, time range context, the summarized answer, rationale, referenced metrics, and any caution text, linked to the parent aiSession.


## NutritionAi Service Frontend Description By The Backend Architect

## nutritionAi Service — UX Guide

This service powers the AI-assisted meal logging and nutrition Q&A features. There are two primary flows:

**1. AI Meal Parsing (`parseMeal`):** The user types a natural-language Turkish meal description (e.g. "Öğle yemeğinde 2 köfte ve yanında pilav yedim") into a chat-style input box. The UI submits to `POST /ai-sessions/parse-meal` and receives a candidate meal with food lines. If `confirmationRequired=true` (suspicious quantities or low confidence), show a warning banner with the `warningText` and prompt explicit confirmation. The confirm-meal page (`GET /ai-candidate-meals/:id`) shows each `aiCandidateLine` with an editable gram field and a "Save to My Foods" toggle (`saveAsFood`). The user adjusts as needed and submits `PATCH /ai-candidate-meals/:id/confirm`. On success, show a toast "Öğün kaydedildi" and navigate back to the meal log.

**2. Nutrition Guidance (`askNutritionQuestion`):** A conversational Q&A widget accepts a Turkish question. The UI submits to `POST /ai-sessions/ask` with optional `contextRange` (today/week/month). The AI response is displayed inline as a guidance card showing `answerSummary`, optional `rationaleText`, and any `cautionText` as an amber callout.

**Session history:** `GET /ai-sessions` lists all past AI interactions. Each row shows session type (badge: parsing vs guidance), state (pending/completed/failed), and creation time. Clicking a session navigates to its detail view. For parsing sessions the detail shows the candidate meal; for guidance sessions it shows the guidance note.

**Error states:** If `sessionState=failed`, display the `finalResponseText` as a user-friendly error message (it is always in Turkish). Never show raw AI errors.

**Candidate meal line editing:** Allow inline editing of gram amounts directly in the confirmation table. After editing a single line gram amount, call `PATCH /ai-candidate-lines/:id` and refresh the line's nutrition values from the response. Totals on the confirmation card should recalculate client-side.

All inputs and responses in this service are in Turkish. Number formatting uses comma as decimal separator for display (but submit as JSON numbers).

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


## AiSession Data Object

Records every AI interaction initiated by a user — either a meal-parsing request or a nutrition guidance question — capturing the raw input, detected language, processing state, and final localized response.

### AiSession  Data Object Frontend Description By The Backend Architect

## aiSession

Represents one AI conversation turn. Display as a history list row: show `sessionType` as a badge ("Öğün Analizi" for mealParsing, "Beslenme Danışmanlığı" for nutritionGuidance), `sessionState` as a colored status indicator (pending=gray, needsConfirmation=amber, completed=green, failed=red), and `createdAt` as relative time. Truncate `inputText` to ~60 chars as the row subtitle. On detail view, show the full `inputText`, `finalResponseText` prominently, and `confidenceScore` as a small percentage badge. Do not expose `detectedLanguage` to users.


### AiSession Data Object Properties

AiSession data object has got following properties that are represented as table fields in the database scheme. 
These properties don't stand just for data storage, but each may have different settings to manage the business logic. 

| Property | Type | IsArray | Required | Secret | Description |
|----------|------|---------|----------|--------|-------------|
| `userId` | ID | false | Yes | No | - |
| `sessionType` | Enum | false | Yes | No | - |
| `inputText` | Text | false | Yes | No | - |
| `detectedLanguage` | String | false | No | No | - |
| `sessionState` | Enum | false | Yes | No | - |
| `confidenceScore` | Double | false | No | No | - |
| `finalResponseText` | Text | false | No | No | - |
* Required properties are mandatory for creating objects and must be provided in the request body if no default value, formula or session bind is set.



### Enum Properties
Enum properties are defined with a set of allowed values, ensuring that only valid options can be assigned to them. 
The enum options value will be stored as strings in the database, 
but when a data object is created an additional property with the same name plus an idx suffix will be created, which will hold the index of the selected enum option.
You can use the {fieldName_idx} property to sort by the enum value or when your enum options represent a hiyerarchy of values.
In the frontend input components, enum type properties should only accept values from an option component that lists the enum options.

- **sessionType**: [mealParsing, nutritionGuidance]

- **sessionState**: [pending, needsConfirmation, completed, failed]



### Filter Properties

`userId` `sessionType` `sessionState`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as API parameters in the listing API's.
- **userId**: ID  has a filter named `userId`
- **sessionType**: Enum  has a filter named `sessionType`
- **sessionState**: Enum  has a filter named `sessionState`


## AiCandidateMeal Data Object

Stores the structured meal proposal produced by AI parsing of a user's natural-language input — holds proposed slot, date, nutrition totals, warning flags, and a confirmation status before the meal is committed to mealTracker.

### AiCandidateMeal  Data Object Frontend Description By The Backend Architect

## aiCandidateMeal

Represents the AI-proposed meal before the user confirms it. The confirmation UI is the primary interaction surface: display as a card with the proposed meal slot, date, and time at the top. Below, show a table of `aiCandidateLine` items (fetched from related object). Each line shows food name, gram amount (editable input), and estimated nutrition values. Show `warningText` as an amber warning banner when present. Show totals (calories, protein, carbs, fat) as summary chips. Provide three actions: "Onayla" (confirm → PATCH confirm), "Reddet" (reject → PATCH reject), and inline line edit. If `isCommitted=true`, show a read-only success state with a link to the created meal log.


### AiCandidateMeal Data Object Properties

AiCandidateMeal data object has got following properties that are represented as table fields in the database scheme. 
These properties don't stand just for data storage, but each may have different settings to manage the business logic. 

| Property | Type | IsArray | Required | Secret | Description |
|----------|------|---------|----------|--------|-------------|
| `userId` | ID | false | Yes | No | - |
| `aiSessionId` | ID | false | Yes | No | - |
| `proposedMealDate` | Date | false | No | No | - |
| `proposedMealTime` | String | false | No | No | - |
| `proposedSlotName` | String | false | No | No | - |
| `candidateSource` | Enum | false | Yes | No | - |
| `warningText` | Text | false | No | No | - |
| `confirmationRequired` | Boolean | false | Yes | No | - |
| `isConfirmed` | Boolean | false | Yes | No | - |
| `isCommitted` | Boolean | false | Yes | No | - |
| `totalCalories` | Double | false | No | No | - |
| `totalProtein` | Double | false | No | No | - |
| `totalCarbohydrates` | Double | false | No | No | - |
| `totalFat` | Double | false | No | No | - |
| `totalSugar` | Double | false | No | No | - |
| `totalFiber` | Double | false | No | No | - |
| `committedMealLogId` | ID | false | No | No | - |
* Required properties are mandatory for creating objects and must be provided in the request body if no default value, formula or session bind is set.



### Enum Properties
Enum properties are defined with a set of allowed values, ensuring that only valid options can be assigned to them. 
The enum options value will be stored as strings in the database, 
but when a data object is created an additional property with the same name plus an idx suffix will be created, which will hold the index of the selected enum option.
You can use the {fieldName_idx} property to sort by the enum value or when your enum options represent a hiyerarchy of values.
In the frontend input components, enum type properties should only accept values from an option component that lists the enum options.

- **candidateSource**: [aiAssistant]


### Relation Properties

`aiSessionId`

Mindbricks supports relations between data objects, allowing you to define how objects are linked together.
The relations may reference to a data object either in this service or in another service. Id the reference is remote, backend handles the relations through service communication or elastic search.
These relations should be respected in the frontend so that instaead of showing the related objects id, the frontend should list human readable values from other data objects.
If the relation points to another service, frontend should use the referenced service api in case it needs related data.
The relation logic is montly handled in backend so the api responses feeds the frontend about the relational data.
In mmost cases the api response will provide the relational data as well as the main one.

In frontend, please ensure that,

1- instaead of these relational ids you show the main human readable field of the related target data (like name),
2- if this data object needs a user input of these relational ids, you should provide a combobox with the list of possible records or (a searchbox) to select with the realted target data object main human readable field.


- **aiSessionId**: ID
Relation to `aiSession`.id

The target object is a sibling object, meaning that the relation is a many-to-one or one-to-one relationship from this object to the target.

Required: Yes


### Filter Properties

`userId` `aiSessionId` `isConfirmed` `isCommitted`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as API parameters in the listing API's.
- **userId**: ID  has a filter named `userId`
- **aiSessionId**: ID  has a filter named `aiSessionId`
- **isConfirmed**: Boolean  has a filter named `isConfirmed`
- **isCommitted**: Boolean  has a filter named `isCommitted`


## AiCandidateLine Data Object

Represents a single food item detected within an AI candidate meal — stores AI-estimated gram amounts and nutrition values as a snapshot, along with confidence, reference source, and user's choice to save the food to their library.

### AiCandidateLine  Data Object Frontend Description By The Backend Architect

## aiCandidateLine

A single food item row within the confirm-meal table. Show `detectedFoodName` as the primary label (editable via `PATCH /ai-candidate-lines/:id`). Show `estimatedGrams` as an editable number input with "g" suffix. Show estimated nutrition values (calories, protein, carbs, fat) in compact columns — these update when grams are changed. Show `saveAsFood` as a toggle switch labeled "Besin kitaplığıma ekle". Show `quantityConfidence` as a small badge (low/medium/high) if below 0.6. Show `nutritionReference` as a gray micro-label below the food name.


### AiCandidateLine Data Object Properties

AiCandidateLine data object has got following properties that are represented as table fields in the database scheme. 
These properties don't stand just for data storage, but each may have different settings to manage the business logic. 

| Property | Type | IsArray | Required | Secret | Description |
|----------|------|---------|----------|--------|-------------|
| `userId` | ID | false | Yes | No | - |
| `aiCandidateMealId` | ID | false | Yes | No | - |
| `detectedFoodName` | String | false | Yes | No | - |
| `estimatedGrams` | Double | false | Yes | No | - |
| `estimatedCalories` | Double | false | No | No | - |
| `estimatedProtein` | Double | false | No | No | - |
| `estimatedCarbohydrates` | Double | false | No | No | - |
| `estimatedFat` | Double | false | No | No | - |
| `estimatedSugar` | Double | false | No | No | - |
| `estimatedFiber` | Double | false | No | No | - |
| `quantityConfidence` | Double | false | No | No | - |
| `nutritionReference` | String | false | No | No | - |
| `saveAsFood` | Boolean | false | Yes | No | - |
* Required properties are mandatory for creating objects and must be provided in the request body if no default value, formula or session bind is set.




### Relation Properties

`aiCandidateMealId`

Mindbricks supports relations between data objects, allowing you to define how objects are linked together.
The relations may reference to a data object either in this service or in another service. Id the reference is remote, backend handles the relations through service communication or elastic search.
These relations should be respected in the frontend so that instaead of showing the related objects id, the frontend should list human readable values from other data objects.
If the relation points to another service, frontend should use the referenced service api in case it needs related data.
The relation logic is montly handled in backend so the api responses feeds the frontend about the relational data.
In mmost cases the api response will provide the relational data as well as the main one.

In frontend, please ensure that,

1- instaead of these relational ids you show the main human readable field of the related target data (like name),
2- if this data object needs a user input of these relational ids, you should provide a combobox with the list of possible records or (a searchbox) to select with the realted target data object main human readable field.


- **aiCandidateMealId**: ID
Relation to `aiCandidateMeal`.id

The target object is a sibling object, meaning that the relation is a many-to-one or one-to-one relationship from this object to the target.

Required: Yes


### Filter Properties

`userId` `aiCandidateMealId`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as API parameters in the listing API's.
- **userId**: ID  has a filter named `userId`
- **aiCandidateMealId**: ID  has a filter named `aiCandidateMealId`


## AiGuidanceNote Data Object

Persists the structured outcome of a nutrition guidance Q&A interaction — stores question classification, time range context, the summarized answer, rationale, referenced metrics, and any caution text, linked to the parent aiSession.

### AiGuidanceNote  Data Object Frontend Description By The Backend Architect

## aiGuidanceNote

Displayed as a guidance response card after the user asks a nutrition question. Show `answerSummary` prominently as the main body text. Show `rationaleText` in a collapsible "Nasıl hesapladım?" accordion. Show `cautionText` (if present) as an amber callout box at the bottom. Show `questionType` as a small badge ("Hedef Kontrolü", "Alım Özeti", "En Sağlıklı Seçim"). Show `contextRange` as a secondary label ("Bugün", "Bu Hafta", "Bu Ay"). Do not expose `referencedMetricKeys` directly; it can be used to render metric icons next to the answer.


### AiGuidanceNote Data Object Properties

AiGuidanceNote data object has got following properties that are represented as table fields in the database scheme. 
These properties don't stand just for data storage, but each may have different settings to manage the business logic. 

| Property | Type | IsArray | Required | Secret | Description |
|----------|------|---------|----------|--------|-------------|
| `userId` | ID | false | Yes | No | - |
| `aiSessionId` | ID | false | Yes | No | - |
| `questionType` | String | false | Yes | No | - |
| `contextRange` | String | false | Yes | No | - |
| `answerSummary` | Text | false | Yes | No | - |
| `rationaleText` | Text | false | No | No | - |
| `referencedMetricKeys` | String | false | No | No | - |
| `cautionText` | Text | false | No | No | - |
* Required properties are mandatory for creating objects and must be provided in the request body if no default value, formula or session bind is set.




### Relation Properties

`aiSessionId`

Mindbricks supports relations between data objects, allowing you to define how objects are linked together.
The relations may reference to a data object either in this service or in another service. Id the reference is remote, backend handles the relations through service communication or elastic search.
These relations should be respected in the frontend so that instaead of showing the related objects id, the frontend should list human readable values from other data objects.
If the relation points to another service, frontend should use the referenced service api in case it needs related data.
The relation logic is montly handled in backend so the api responses feeds the frontend about the relational data.
In mmost cases the api response will provide the relational data as well as the main one.

In frontend, please ensure that,

1- instaead of these relational ids you show the main human readable field of the related target data (like name),
2- if this data object needs a user input of these relational ids, you should provide a combobox with the list of possible records or (a searchbox) to select with the realted target data object main human readable field.


- **aiSessionId**: ID
Relation to `aiSession`.id

The target object is a sibling object, meaning that the relation is a many-to-one or one-to-one relationship from this object to the target.

Required: Yes


### Filter Properties

`userId` `questionType` `contextRange`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as API parameters in the listing API's.
- **userId**: ID  has a filter named `userId`
- **questionType**: String  has a filter named `questionType`
- **contextRange**: String  has a filter named `contextRange`



## Default CRUD APIs

For each data object, the backend architect may designate **default APIs** for standard operations (create, update, delete, get, list). These are the APIs that frontend CRUD forms and AI agents should use for basic record management. If no default is explicitly set (`isDefaultApi`), the frontend generator auto-discovers the most general API for each operation.

### AiSession Default APIs

| Operation | API Name | Route | Explicitly Set |
|-----------|----------|-------|----------------|
| Create | `parseMeal` | `/v1/ai-sessions/parse-meal` | Auto |
| Update | _none_ | - | Auto |
| Delete | _none_ | - | Auto |
| Get | `getAiSession` | `/v1/ai-sessions/:aiSessionId` | Yes |
| List | `listAiSessions` | `/v1/ai-sessions` | Yes |
### AiCandidateMeal Default APIs

| Operation | API Name | Route | Explicitly Set |
|-----------|----------|-------|----------------|
| Create | _none_ | - | Auto |
| Update | `confirmCandidateMeal` | `/v1/ai-candidate-meals/:aiCandidateMealId/confirm` | Auto |
| Delete | _none_ | - | Auto |
| Get | `getAiCandidateMeal` | `/v1/ai-candidate-meals/:aiCandidateMealId` | Yes |
| List | `listAiCandidateMeals` | `/v1/ai-candidate-meals` | Yes |
### AiCandidateLine Default APIs

**Display Label Property:** `detectedFoodName` — Use this property as the human-readable label when displaying records of this data object (e.g., in dropdowns, references).
| Operation | API Name | Route | Explicitly Set |
|-----------|----------|-------|----------------|
| Create | _none_ | - | Auto |
| Update | `updateAiCandidateLine` | `/v1/ai-candidate-lines/:aiCandidateLineId` | Yes |
| Delete | _none_ | - | Auto |
| Get | _none_ | - | Auto |
| List | _none_ | - | Auto |
### AiGuidanceNote Default APIs

| Operation | API Name | Route | Explicitly Set |
|-----------|----------|-------|----------------|
| Create | _none_ | - | Auto |
| Update | _none_ | - | Auto |
| Delete | _none_ | - | Auto |
| Get | `getAiGuidanceNote` | `/v1/ai-guidance-notes/:aiGuidanceNoteId` | Yes |
| List | `listAiGuidanceNotes` | `/v1/ai-guidance-notes` | Yes |

When building CRUD forms for a data object, use the default create/update APIs listed above. The form fields should correspond to the API's body parameters. For relation fields, render a dropdown loaded from the related object's list API using the display label property.






## API Reference

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



**After this prompt, the user may give you new instructions to update the output of this prompt or provide subsequent prompts about the project.**


