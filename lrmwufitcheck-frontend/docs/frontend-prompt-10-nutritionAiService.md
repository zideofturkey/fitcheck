

# **FITCHECK**

**FRONTEND GUIDE FOR AI CODING AGENTS - PART 10 - NutritionAi Service**

This document is a part of a REST API guide for the fitcheck project.
It is designed for AI agents that will generate frontend code to consume the project’s backend.

This document provides extensive instruction for the usage of nutritionAi

## Service Access

Use the generated hooks for all `nutritionAi` operations. The SDK handles service URLs, auth headers, and token management. Import hooks from `use-nutritionai` and types from `api.ts`.


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

| Operation | Hook | Type |
|-----------|------|------|
| Create | `useParseMeal()` | mutation |
| Update | _none_ | mutation |
| Delete | _none_ | mutation |
| Get | `useGetAiSession()` | query |
| List | `useListAiSessions()` | query |
### AiCandidateMeal Default APIs

| Operation | Hook | Type |
|-----------|------|------|
| Create | _none_ | mutation |
| Update | `useConfirmCandidateMeal()` | mutation |
| Delete | _none_ | mutation |
| Get | `useGetAiCandidateMeal()` | query |
| List | `useListAiCandidateMeals()` | query |
### AiCandidateLine Default APIs

**Display Label Property:** `detectedFoodName` — Use this property as the human-readable label when displaying records of this data object (e.g., in dropdowns, references).
| Operation | Hook | Type |
|-----------|------|------|
| Create | _none_ | mutation |
| Update | `useUpdateAiCandidateLine()` | mutation |
| Delete | _none_ | mutation |
| Get | _none_ | query |
| List | _none_ | query |
### AiGuidanceNote Default APIs

| Operation | Hook | Type |
|-----------|------|------|
| Create | _none_ | mutation |
| Update | _none_ | mutation |
| Delete | _none_ | mutation |
| Get | `useGetAiGuidanceNote()` | query |
| List | `useListAiGuidanceNotes()` | query |

When building CRUD forms for a data object, use the default hooks listed above. The form fields should correspond to the API's mutation payload. For relation fields, render a dropdown loaded from the related object's list hook using the display label property.






## SDK Hook Reference

Import hooks from `use-nutritionai` and use them directly in your page components.


### Hooks Overview

| Hook | Type | CRUD | Auth | Returns |
|------|------|------|------|---------|
| `useParseMeal()` | mutation | create | login required | `NutritionaiAiSessionResponse` |
| `useAskNutritionQuestion()` | mutation | create | login required | `NutritionaiAiSessionResponse` |
| `useGetAiSession()` | query | get | login required | `NutritionaiAiSessionResponse` |
| `useListAiSessions()` | query | list | login required | `NutritionaiAiSessionListResponse` |
| `useConfirmCandidateMeal()` | mutation | update | owner or admin | `NutritionaiAiCandidateMealResponse` |
| `useGetAiCandidateMeal()` | query | get | login required | `NutritionaiAiCandidateMealResponse` |
| `useListAiCandidateMeals()` | query | list | login required | `NutritionaiAiCandidateMealListResponse` |
| `useRejectCandidateMeal()` | mutation | update | owner or admin | `NutritionaiAiCandidateMealResponse` |
| `useUpdateAiCandidateLine()` | mutation | update | login required | `NutritionaiAiCandidateLineResponse` |
| `useGetAiGuidanceNote()` | query | get | login required | `NutritionaiAiGuidanceNoteResponse` |
| `useListAiGuidanceNotes()` | query | list | login required | `NutritionaiAiGuidanceNoteListResponse` |

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

**`NutritionaiAiSession`** — Records every AI interaction initiated by a user — either a meal-parsing request or a nutrition guidance question — capturing the raw input, detected language, processing state, and final localized response.

```typescript
interface NutritionaiAiSession {
  id: string;
  userId: string;
  sessionType: 'mealParsing' | 'nutritionGuidance';
  inputText: string;
  detectedLanguage?: string;
  sessionState: 'pending' | 'needsConfirmation' | 'completed' | 'failed';
  confidenceScore?: number;
  finalResponseText?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

- **Single response:** `NutritionaiAiSessionResponse` → `{ aiSession: NutritionaiAiSession, dataName: string }` — extract via `data?.aiSession`
- **List response:** `NutritionaiAiSessionListResponse` → `{ aiSessions: NutritionaiAiSession[], rowCount: number, dataName: string }` — extract via `data?.aiSessions ?? []`

**`NutritionaiAiCandidateMeal`** — Stores the structured meal proposal produced by AI parsing of a user's natural-language input — holds proposed slot, date, nutrition totals, warning flags, and a confirmation status before the meal is committed to mealTracker.

```typescript
interface NutritionaiAiCandidateMeal {
  id: string;
  userId: string;
  aiSessionId: string;
  proposedMealDate?: string;
  proposedMealTime?: string;
  proposedSlotName?: string;
  candidateSource: 'aiAssistant';
  warningText?: string;
  confirmationRequired: boolean;
  isConfirmed: boolean;
  isCommitted: boolean;
  totalCalories?: number;
  totalProtein?: number;
  totalCarbohydrates?: number;
  totalFat?: number;
  totalSugar?: number;
  totalFiber?: number;
  committedMealLogId?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

- **Single response:** `NutritionaiAiCandidateMealResponse` → `{ aiCandidateMeal: NutritionaiAiCandidateMeal, dataName: string }` — extract via `data?.aiCandidateMeal`
- **List response:** `NutritionaiAiCandidateMealListResponse` → `{ aiCandidateMeals: NutritionaiAiCandidateMeal[], rowCount: number, dataName: string }` — extract via `data?.aiCandidateMeals ?? []`

**`NutritionaiAiCandidateLine`** — Represents a single food item detected within an AI candidate meal — stores AI-estimated gram amounts and nutrition values as a snapshot, along with confidence, reference source, and user's choice to save the food to their library.

```typescript
interface NutritionaiAiCandidateLine {
  id: string;
  userId: string;
  aiCandidateMealId: string;
  detectedFoodName: string;
  estimatedGrams: number;
  estimatedCalories?: number;
  estimatedProtein?: number;
  estimatedCarbohydrates?: number;
  estimatedFat?: number;
  estimatedSugar?: number;
  estimatedFiber?: number;
  quantityConfidence?: number;
  nutritionReference?: string;
  saveAsFood: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

- **Single response:** `NutritionaiAiCandidateLineResponse` → `{ aiCandidateLine: NutritionaiAiCandidateLine, dataName: string }` — extract via `data?.aiCandidateLine`
- **List response:** `NutritionaiAiCandidateLineListResponse` → `{ aiCandidateLines: NutritionaiAiCandidateLine[], rowCount: number, dataName: string }` — extract via `data?.aiCandidateLines ?? []`

**`NutritionaiAiGuidanceNote`** — Persists the structured outcome of a nutrition guidance Q&A interaction — stores question classification, time range context, the summarized answer, rationale, referenced metrics, and any caution text, linked to the parent aiSession.

```typescript
interface NutritionaiAiGuidanceNote {
  id: string;
  userId: string;
  aiSessionId: string;
  questionType: string;
  contextRange: string;
  answerSummary: string;
  rationaleText?: string;
  referencedMetricKeys?: string;
  cautionText?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

- **Single response:** `NutritionaiAiGuidanceNoteResponse` → `{ aiGuidanceNote: NutritionaiAiGuidanceNote, dataName: string }` — extract via `data?.aiGuidanceNote`
- **List response:** `NutritionaiAiGuidanceNoteListResponse` → `{ aiGuidanceNotes: NutritionaiAiGuidanceNote[], rowCount: number, dataName: string }` — extract via `data?.aiGuidanceNotes ?? []`


### Hook Details

#### `useParseMeal()`

Accepts a natural-language Turkish meal description, creates an aiSession record, invokes the AI parsing library function, and creates the resulting aiCandidateMeal and aiCandidateLine records.

**Frontend Notes:** Triggered from the AI chat input box on the meal log page. Show a loading spinner labeled "AI analiz ediyor..." while the request is in flight (can take 3–8 seconds). On 201, navigate to the candidate meal confirmation page (`/ai-candidate-meals/:candidateMealId`). If `confirmationRequired=true`, show the warning banner prominently before showing the food line table. On error, show a Turkish-language toast using `finalResponseText` from the response.

- **Type:** `mutation` (use `{ mutate, isPending }`)
- **Auth:** login required
- **Input:** `{ inputText: string, proposedMealDate?: string, proposedMealTime?: string, proposedSlotName?: string }`
- **Returns:** `NutritionaiAiSessionResponse`

#### `useAskNutritionQuestion()`

Creates an aiSession for nutrition guidance, fetches macro targets and meal context from sibling services, invokes the AI guidance library function, and persists the structured guidance note.

**Frontend Notes:** Triggered from the AI Q&A chat widget on the nutrition dashboard. Show a loading spinner labeled "Yanıt hazırlanıyor..." while the request is in flight (can take 3–8 seconds). On 201, render the guidance response card inline in the chat widget showing `finalResponseText` from the session and the full `aiGuidanceNote` details. The context range selector (today/week/month) should be a toggle above the text input; default is 'today'.

- **Type:** `mutation` (use `{ mutate, isPending }`)
- **Auth:** login required
- **Input:** `{ inputText: string, contextRange?: string }`
- **Returns:** `NutritionaiAiSessionResponse`

#### `useGetAiSession()`

Retrieves a single AI session by ID, scoped to the authenticated user.

**Frontend Notes:** Used on the session detail page. Display session metadata at the top (type badge, state badge, creation time). Below, render either the candidate meal card (if `sessionType=mealParsing`) or the guidance note card (if `sessionType=nutritionGuidance`). These are loaded separately via their respective GET endpoints using the session id as a filter.

- **Type:** `query` (use `{ data, isLoading, error }`)
- **Auth:** login required
- **Input:** `(aiSessionId: string)` — passed positionally
- **Returns:** `NutritionaiAiSessionResponse`

#### `useListAiSessions()`

Lists all AI sessions for the authenticated user, ordered by most recent first.

**Frontend Notes:** Displayed on the AI session history page as a paginated list. Each row shows: `sessionType` badge, `sessionState` status chip, a preview of `inputText` (truncated to 80 chars), and `createdAt` as relative time. Default sort: newest first. Support filter chips by `sessionType` and `sessionState` using the auto-filter parameters. Clicking a row opens the session detail page.

- **Type:** `query` (use `{ data, isLoading, error }`)
- **Auth:** login required
- **Input:** `{ userId?: string, sessionType?: 'mealParsing' | 'nutritionGuidance', sessionState?: 'pending' | 'needsConfirmation' | 'completed' | 'failed', pageNumber?: number, pageRowCount?: number, getJoins?: boolean }`
- **Pagination:** supported — pass `pageNumber` / `pageRowCount` in params (default 20 rows/page)
- **Returns:** `NutritionaiAiSessionListResponse`

#### `useConfirmCandidateMeal()`

Confirms a candidate meal after user review — applies optional line adjustments, recalculates totals, writes meal log and lines to mealTracker, saves foods to nutritionLibrary where requested, and marks the candidate as committed.

**Frontend Notes:** Triggered by the 'Onayla' button on the candidate meal confirmation page. Disable the button while in flight. On success (200), show toast "Öğün başarıyla kaydedildi!" and navigate to the daily meal log page. If `lineAdjustments` are passed, the UI should pre-populate them from user edits in the confirmation table before submitting. On error, display the error message inline without navigating away.

- **Type:** `mutation` (use `{ mutate, isPending }`)
- **Auth:** owner or admin
- **Input:** `{ aiCandidateMealId: string, data: { proposedMealDate?: string, proposedMealTime?: string, proposedSlotName?: string, lineAdjustments?: Record<string, unknown>[] } }`
- **Returns:** `NutritionaiAiCandidateMealResponse`

#### `useGetAiCandidateMeal()`

Retrieves a single candidate meal by ID, scoped to the authenticated user.

**Frontend Notes:** Used on the candidate meal confirmation page. Load this first to show meal slot/date info and totals. Then load the candidate lines via the list endpoint filtered by `aiCandidateMealId`. If `isCommitted=true`, show the committed state with a link to the meal log.

- **Type:** `query` (use `{ data, isLoading, error }`)
- **Auth:** login required
- **Input:** `(aiCandidateMealId: string)` — passed positionally
- **Returns:** `NutritionaiAiCandidateMealResponse`

#### `useListAiCandidateMeals()`

Lists candidate meals for the authenticated user.

**Frontend Notes:** Used when showing the user's AI parsing history. Each row shows: proposed meal slot, proposed date, total calories, confirmation state (isConfirmed/isCommitted chips). Support auto-filters by `isConfirmed`, `isCommitted`, `aiSessionId`.

- **Type:** `query` (use `{ data, isLoading, error }`)
- **Auth:** login required
- **Input:** `{ userId?: string, aiSessionId?: string, isConfirmed?: boolean, isCommitted?: boolean, pageNumber?: number, pageRowCount?: number, getJoins?: boolean }`
- **Pagination:** supported — pass `pageNumber` / `pageRowCount` in params (default 20 rows/page)
- **Returns:** `NutritionaiAiCandidateMealListResponse`

#### `useRejectCandidateMeal()`

Rejects a candidate meal, marking it as not confirmed and updating the parent session state to failed.

**Frontend Notes:** Triggered by the 'Reddet' button on the candidate meal confirmation page. On success, show toast "Öğün reddedildi" and navigate back to the meal log page.

- **Type:** `mutation` (use `{ mutate, isPending }`)
- **Auth:** owner or admin
- **Input:** `(aiCandidateMealId: string)` — passed positionally
- **Returns:** `NutritionaiAiCandidateMealResponse`

#### `useUpdateAiCandidateLine()`

Updates a single candidate food line — allows the user to adjust gram amounts, toggle save-as-food, or rename the detected food. Recalculates nutrition values proportionally when grams change.

**Frontend Notes:** Triggered by inline editing in the confirmation table. Debounce gram input changes by 500ms before firing. After a successful 200, update the line row in the table with the new nutrition values from the response and refresh the meal totals card client-side. Show a brief inline checkmark on success.

- **Type:** `mutation` (use `{ mutate, isPending }`)
- **Auth:** login required
- **Input:** `{ aiCandidateLineId: string, data: { estimatedGrams?: number, saveAsFood?: boolean, detectedFoodName?: string } }`
- **Returns:** `NutritionaiAiCandidateLineResponse`

#### `useGetAiGuidanceNote()`

Retrieves a single AI guidance note by ID, scoped to the authenticated user.

**Frontend Notes:** Used on the session detail page for guidance sessions. Show the guidance card with answerSummary prominently, rationaleText in collapsible accordion, cautionText as amber callout.

- **Type:** `query` (use `{ data, isLoading, error }`)
- **Auth:** login required
- **Input:** `(aiGuidanceNoteId: string)` — passed positionally
- **Returns:** `NutritionaiAiGuidanceNoteResponse`

#### `useListAiGuidanceNotes()`

Lists all AI guidance notes for the authenticated user.

**Frontend Notes:** Displayed in the guidance history section. Each row shows: question type badge, context range label, creation time, and a truncated preview of answerSummary. Support auto-filters by `questionType` and `contextRange`.

- **Type:** `query` (use `{ data, isLoading, error }`)
- **Auth:** login required
- **Input:** `{ userId?: string, questionType?: string, contextRange?: string, pageNumber?: number, pageRowCount?: number, getJoins?: boolean }`
- **Pagination:** supported — pass `pageNumber` / `pageRowCount` in params (default 20 rows/page)
- **Returns:** `NutritionaiAiGuidanceNoteListResponse`


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


