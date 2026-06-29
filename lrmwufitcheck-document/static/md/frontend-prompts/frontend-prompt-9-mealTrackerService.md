

# **FITCHECK**

**FRONTEND GUIDE FOR AI CODING AGENTS - PART 9 - MealTracker Service**

This document is a part of a REST API guide for the fitcheck project.
It is designed for AI agents that will generate frontend code to consume the project’s backend.

This document provides extensive instruction for the usage of mealTracker

## Service Access

MealTracker service management is handled through service specific base urls.

MealTracker  service may be deployed to the preview server, staging server, or production server. Therefore,it has 3 access URLs.
The frontend application must support all deployment environments during development, and the user should be able to select the target API server on the login page (already handled in first part.).

For the mealTracker service, the base URLs are:

* **Preview:** `https://lrmwufitcheck.preview.mindbricks.com/mealtracker-api`
* **Staging:** `https://lrmwufitcheck-stage.mindbricks.co/mealtracker-api`
* **Production:** `https://lrmwufitcheck.mindbricks.co/mealtracker-api`


## Scope

**MealTracker Service Description**

Creates and manages user meal logs from multiple sources, calculates per-item and meal-level nutrition totals, stores immutable daily consumption snapshots, and exposes daily progress, weekly, and monthly analytics APIs.

MealTracker service provides apis and business logic for following data objects in fitcheck application. 
Each data object may be either a central domain of the application data structure or a related helper data object for a central concept.
Note that data object concept is equal to table concept in the database, in the service database each data object is represented as a db table scheme and the object instances as table rows.  


**`mealLog` Data Object**: A single meal entry for a user on a given date and time, tagged with a slot name and source, storing meal-level nutrition totals.

**`mealLine` Data Object**: An individual food item within a meal log, storing the consumed gram amount and snapshot nutrition values calculated at log time — immutable with respect to food library changes.

**`nutritionDay` Data Object**: A daily rollup record per user storing consumed totals for all six macros alongside the target values active on that day, plus exceeded metric flags and meal count. Created/updated whenever meals are logged or edited.


## MealTracker Service Frontend Description By The Backend Architect

## mealTracker Service UX Guide

This service is the core of the user's daily nutrition tracking experience. The primary user flow is: log a meal (selecting date, time slot, and food items) → view daily progress on the dashboard → review weekly/monthly analytics.

**Meal logging flow** is wizard-style with progressive disclosure: date/time selection first, then slot (Kahvaltı/Öğle/Akşam/Atıştırma or custom), then individual food item entry. Multiple items per meal are added in a list — each row has food name, grams, and the system calculates or accepts pre-computed nutrition values. The meal totals (calories, protein, carbs, fat, sugar, fiber) are shown as a running summary below the item list.

**Daily progress dashboard** (the landing page) shows a ring chart or progress bars for each of the 6 macros (calories, protein, carbs, fat, sugar, fiber) with consumed vs. target. Color coding: green ≤ 80% of target, yellow 80–100%, red > 100%. The dashboard auto-loads today's data on mount via `getDailyProgress`.

**Meal history** (`listMealLogs`) shows a date-grouped list of past meals. Each meal card shows slot name, time, total calories. Tapping expands to show individual food lines. Filter by date range or source (foodLibrary, manualEntry, etc.) via query params.

**Analytics pages** (weekly/monthly) show trend charts per macro over the period, plus a goal-hit-rate summary per macro. Line charts with date on x-axis, consumed amount on y-axis, target as a dashed horizontal line.

**Scheduled admin APIs** (`/scheduled/daily-reminder-check`, `/scheduled/daily-summary`) are internal — not surfaced in any user-facing UI. They are called by a cron scheduler and emit Kafka events that the notification service consumes.

All write operations (create/update/delete meal log or line) should trigger an optimistic UI update followed by a re-fetch of the daily progress widget to reflect the recomputed totals.

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


## MealLog Data Object

A single meal entry for a user on a given date and time, tagged with a slot name and source, storing meal-level nutrition totals.

### MealLog  Data Object Frontend Description By The Backend Architect

Represents one meal (e.g. lunch on a given day). Headline fields for cards: slotName, mealDate, totalCalories. Secondary: mealTime, logSource. Nutrition totals (protein, carbs, fat, sugar, fiber) shown as a compact macro strip below the headline. logSource shown as a small badge (foodLibrary=blue, manualEntry=gray, aiAssistant=purple, presetTemplate=green). noteText shown as a collapsible section. The list of child mealLines is loaded separately and shown on meal detail expand.


### MealLog Data Object Properties

MealLog data object has got following properties that are represented as table fields in the database scheme. 
These properties don't stand just for data storage, but each may have different settings to manage the business logic. 

| Property | Type | IsArray | Required | Secret | Description |
|----------|------|---------|----------|--------|-------------|
| `userId` | ID | false | Yes | No | - |
| `mealDate` | Date | false | Yes | No | - |
| `mealTime` | String | false | Yes | No | - |
| `slotName` | String | false | Yes | No | - |
| `logSource` | Enum | false | Yes | No | - |
| `noteText` | String | false | No | No | - |
| `totalCalories` | Double | false | Yes | No | - |
| `totalProtein` | Double | false | Yes | No | - |
| `totalCarbohydrates` | Double | false | Yes | No | - |
| `totalFat` | Double | false | Yes | No | - |
| `totalSugar` | Double | false | Yes | No | - |
| `totalFiber` | Double | false | Yes | No | - |
* Required properties are mandatory for creating objects and must be provided in the request body if no default value, formula or session bind is set.



### Enum Properties
Enum properties are defined with a set of allowed values, ensuring that only valid options can be assigned to them. 
The enum options value will be stored as strings in the database, 
but when a data object is created an additional property with the same name plus an idx suffix will be created, which will hold the index of the selected enum option.
You can use the {fieldName_idx} property to sort by the enum value or when your enum options represent a hiyerarchy of values.
In the frontend input components, enum type properties should only accept values from an option component that lists the enum options.

- **logSource**: [foodLibrary, presetTemplate, manualEntry, aiAssistant]



### Filter Properties

`mealDate` `logSource`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as API parameters in the listing API's.
- **mealDate**: Date  has a filter named `mealDate`
- **logSource**: Enum  has a filter named `logSource`


## MealLine Data Object

An individual food item within a meal log, storing the consumed gram amount and snapshot nutrition values calculated at log time — immutable with respect to food library changes.

### MealLine  Data Object Frontend Description By The Backend Architect

Each row in a meal's item list. Display: itemName (headline), consumedGrams + 'g', itemCalories. Secondary macros (protein, carbs, fat, sugar, fiber) shown on expand. lineSource shown as a micro-badge. sourceFoodItemId shown as a subtle link icon if present. Nutrition values are snapshots — never recalculated from source. Edit is allowed on grams and all nutrition fields.


### MealLine Data Object Properties

MealLine data object has got following properties that are represented as table fields in the database scheme. 
These properties don't stand just for data storage, but each may have different settings to manage the business logic. 

| Property | Type | IsArray | Required | Secret | Description |
|----------|------|---------|----------|--------|-------------|
| `userId` | ID | false | Yes | No | - |
| `mealLogId` | ID | false | Yes | No | - |
| `sourceFoodItemId` | ID | false | No | No | - |
| `sourcePresetMealId` | ID | false | No | No | - |
| `itemName` | String | false | Yes | No | - |
| `consumedGrams` | Double | false | Yes | No | - |
| `itemCalories` | Double | false | Yes | No | - |
| `itemProtein` | Double | false | Yes | No | - |
| `itemCarbohydrates` | Double | false | Yes | No | - |
| `itemFat` | Double | false | Yes | No | - |
| `itemSugar` | Double | false | Yes | No | - |
| `itemFiber` | Double | false | Yes | No | - |
| `lineSource` | Enum | false | Yes | No | - |
* Required properties are mandatory for creating objects and must be provided in the request body if no default value, formula or session bind is set.



### Enum Properties
Enum properties are defined with a set of allowed values, ensuring that only valid options can be assigned to them. 
The enum options value will be stored as strings in the database, 
but when a data object is created an additional property with the same name plus an idx suffix will be created, which will hold the index of the selected enum option.
You can use the {fieldName_idx} property to sort by the enum value or when your enum options represent a hiyerarchy of values.
In the frontend input components, enum type properties should only accept values from an option component that lists the enum options.

- **lineSource**: [foodLibrary, presetTemplate, manualEntry, aiAssistant, temporaryAi]


### Relation Properties

`mealLogId`

Mindbricks supports relations between data objects, allowing you to define how objects are linked together.
The relations may reference to a data object either in this service or in another service. Id the reference is remote, backend handles the relations through service communication or elastic search.
These relations should be respected in the frontend so that instaead of showing the related objects id, the frontend should list human readable values from other data objects.
If the relation points to another service, frontend should use the referenced service api in case it needs related data.
The relation logic is montly handled in backend so the api responses feeds the frontend about the relational data.
In mmost cases the api response will provide the relational data as well as the main one.

In frontend, please ensure that,

1- instaead of these relational ids you show the main human readable field of the related target data (like name),
2- if this data object needs a user input of these relational ids, you should provide a combobox with the list of possible records or (a searchbox) to select with the realted target data object main human readable field.


- **mealLogId**: ID
Relation to `mealLog`.id

The target object is a sibling object, meaning that the relation is a many-to-one or one-to-one relationship from this object to the target.

Required: Yes


### Filter Properties

`mealLogId`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as API parameters in the listing API's.
- **mealLogId**: ID  has a filter named `mealLogId`


## NutritionDay Data Object

A daily rollup record per user storing consumed totals for all six macros alongside the target values active on that day, plus exceeded metric flags and meal count. Created/updated whenever meals are logged or edited.

### NutritionDay  Data Object Frontend Description By The Backend Architect

The core dashboard data object. Shows a 6-macro progress panel: calories, protein, carbs, fat, sugar, fiber. Each macro: circular gauge or horizontal progress bar, consumed/target label, color-coded by % of target. exceededMetrics parsed from comma-separated string to highlight red badges on exceeded macros. mealCount shown as '3 meals today'. summaryDate shown at the top as the report date. Target values shown as muted secondary labels. On the analytics pages this object appears as rows in a weekly/monthly table or chart.


### NutritionDay Data Object Properties

NutritionDay data object has got following properties that are represented as table fields in the database scheme. 
These properties don't stand just for data storage, but each may have different settings to manage the business logic. 

| Property | Type | IsArray | Required | Secret | Description |
|----------|------|---------|----------|--------|-------------|
| `userId` | ID | false | Yes | No | - |
| `summaryDate` | Date | false | Yes | No | - |
| `consumedCalories` | Double | false | Yes | No | - |
| `consumedProtein` | Double | false | Yes | No | - |
| `consumedCarbohydrates` | Double | false | Yes | No | - |
| `consumedFat` | Double | false | Yes | No | - |
| `consumedSugar` | Double | false | Yes | No | - |
| `consumedFiber` | Double | false | Yes | No | - |
| `targetCalories` | Double | false | Yes | No | - |
| `targetProtein` | Double | false | Yes | No | - |
| `targetCarbohydrates` | Double | false | Yes | No | - |
| `targetFat` | Double | false | Yes | No | - |
| `targetSugar` | Double | false | Yes | No | - |
| `targetFiber` | Double | false | Yes | No | - |
| `exceededMetrics` | String | false | No | No | - |
| `mealCount` | Integer | false | Yes | No | - |
* Required properties are mandatory for creating objects and must be provided in the request body if no default value, formula or session bind is set.





### Filter Properties

`summaryDate`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as API parameters in the listing API's.
- **summaryDate**: Date  has a filter named `summaryDate`



## Default CRUD APIs

For each data object, the backend architect may designate **default APIs** for standard operations (create, update, delete, get, list). These are the APIs that frontend CRUD forms and AI agents should use for basic record management. If no default is explicitly set (`isDefaultApi`), the frontend generator auto-discovers the most general API for each operation.

### MealLog Default APIs

**Display Label Property:** `slotName` — Use this property as the human-readable label when displaying records of this data object (e.g., in dropdowns, references).
| Operation | API Name | Route | Explicitly Set |
|-----------|----------|-------|----------------|
| Create | `createMealLog` | `/v1/meal-logs` | Yes |
| Update | `updateMealLog` | `/v1/meal-logs/:mealLogId` | Yes |
| Delete | `deleteMealLog` | `/v1/meal-logs/:mealLogId` | Yes |
| Get | `getMealLog` | `/v1/meal-logs/:mealLogId` | Yes |
| List | `listMealLogs` | `/v1/meal-logs` | Yes |
### MealLine Default APIs

**Display Label Property:** `itemName` — Use this property as the human-readable label when displaying records of this data object (e.g., in dropdowns, references).
| Operation | API Name | Route | Explicitly Set |
|-----------|----------|-------|----------------|
| Create | `createMealLine` | `/v1/meal-lines` | Yes |
| Update | `updateMealLine` | `/v1/meal-lines/:mealLineId` | Yes |
| Delete | `deleteMealLine` | `/v1/meal-lines/:mealLineId` | Yes |
| Get | _none_ | - | Auto |
| List | `listMealLines` | `/v1/meal-lines` | Yes |
### NutritionDay Default APIs

| Operation | API Name | Route | Explicitly Set |
|-----------|----------|-------|----------------|
| Create | _none_ | - | Auto |
| Update | `triggerDailyReminderCheck` | `/v1/scheduled/daily-reminder-check` | Auto |
| Delete | _none_ | - | Auto |
| Get | `getNutritionDay` | `/v1/nutrition-days/:nutritionDayId` | Yes |
| List | `listNutritionDays` | `/v1/nutrition-days` | Yes |

When building CRUD forms for a data object, use the default create/update APIs listed above. The form fields should correspond to the API's body parameters. For relation fields, render a dropdown loaded from the related object's list API using the display label property.






## API Reference

### `Create Meallog` API
**[Default create API]** — This is the designated default `create` API for the `mealLog` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
Creates a new meal log entry with all nutrition totals and then inserts individual meal line items via a loop action. After creation, upserts the daily nutrition snapshot.

**API Frontend Description By The Backend Architect**

Triggered from the meal logging form (POST on submit). userId is auto-populated from session — never ask the user. Required fields: mealDate, mealTime, slotName, logSource, totalCalories, totalProtein, totalCarbohydrates, totalFat, totalSugar, totalFiber, lines[]. On 201: redirect to meal detail or refresh daily progress widget, show toast 'Meal logged successfully'. On 400/422: show inline field errors.

**Rest Route**

The `createMealLog` API REST controller can be triggered via the following route:

`/v1/meal-logs`


**Rest Request Parameters**


The `createMealLog` api has got 12 regular request parameters  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| mealDate  | Date  | true | request.body?.["mealDate"] |
| mealTime  | String  | true | request.body?.["mealTime"] |
| slotName  | String  | true | request.body?.["slotName"] |
| logSource  | Enum  | true | request.body?.["logSource"] |
| noteText  | String  | false | request.body?.["noteText"] |
| totalCalories  | Double  | true | request.body?.["totalCalories"] |
| totalProtein  | Double  | true | request.body?.["totalProtein"] |
| totalCarbohydrates  | Double  | true | request.body?.["totalCarbohydrates"] |
| totalFat  | Double  | true | request.body?.["totalFat"] |
| totalSugar  | Double  | true | request.body?.["totalSugar"] |
| totalFiber  | Double  | true | request.body?.["totalFiber"] |
| lines  | Object  | true | request.body?.["lines"] |
**mealDate** : Date the meal was consumed
**mealTime** : Local time string e.g. 13:30
**slotName** : Fixed or custom meal slot name
**logSource** : Source of the meal log entry
**noteText** : Optional user notes
**totalCalories** : Meal-level calorie total
**totalProtein** : Meal-level protein total
**totalCarbohydrates** : Meal-level carbohydrate total
**totalFat** : Meal-level fat total
**totalSugar** : Meal-level sugar total
**totalFiber** : Meal-level fiber total
**lines** : Array of meal line objects to create



**REST Request**
To access the api you can use the **REST** controller with the path **POST  /v1/meal-logs**
```js
  axios({
    method: 'POST',
    url: '/v1/meal-logs',
    data: {
            mealDate:"Date",  
            mealTime:"String",  
            slotName:"String",  
            logSource:"Enum",  
            noteText:"String",  
            totalCalories:"Double",  
            totalProtein:"Double",  
            totalCarbohydrates:"Double",  
            totalFat:"Double",  
            totalSugar:"Double",  
            totalFiber:"Double",  
            lines:"Object",  
    
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
	"dataName": "mealLog",
	"method": "POST",
	"action": "create",
	"appVersion": "Version",
	"rowCount": 1,
	"mealLog": {
		"id": "ID",
		"userId": "ID",
		"mealDate": "Date",
		"mealTime": "String",
		"slotName": "String",
		"logSource": "Enum",
		"logSource_idx": "Integer",
		"noteText": "String",
		"totalCalories": "Double",
		"totalProtein": "Double",
		"totalCarbohydrates": "Double",
		"totalFat": "Double",
		"totalSugar": "Double",
		"totalFiber": "Double",
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"isActive": true
	}
}
```


### `Get Meallog` API
**[Default get API]** — This is the designated default `get` API for the `mealLog` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
Retrieves a single meal log by ID, scoped to the authenticated user.

**API Frontend Description By The Backend Architect**

Triggered when user taps a meal card to view detail. Shows all fields including noteText and individual mealLines (loaded via a separate listMealLines call filtered by mealLogId). On 404: show 'Meal not found' and navigate back.

**Rest Route**

The `getMealLog` API REST controller can be triggered via the following route:

`/v1/meal-logs/:mealLogId`


**Rest Request Parameters**


The `getMealLog` api has got 1 regular request parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| mealLogId  | ID  | true | request.params?.["mealLogId"] |
**mealLogId** : This id paremeter is used to query the required data object.



**REST Request**
To access the api you can use the **REST** controller with the path **GET  /v1/meal-logs/:mealLogId**
```js
  axios({
    method: 'GET',
    url: `/v1/meal-logs/${mealLogId}`,
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
	"dataName": "mealLog",
	"method": "GET",
	"action": "get",
	"appVersion": "Version",
	"rowCount": 1,
	"mealLog": {
		"id": "ID",
		"userId": "ID",
		"mealDate": "Date",
		"mealTime": "String",
		"slotName": "String",
		"logSource": "Enum",
		"logSource_idx": "Integer",
		"noteText": "String",
		"totalCalories": "Double",
		"totalProtein": "Double",
		"totalCarbohydrates": "Double",
		"totalFat": "Double",
		"totalSugar": "Double",
		"totalFiber": "Double",
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"isActive": true
	}
}
```


### `List Meallogs` API
**[Default list API]** — This is the designated default `list` API for the `mealLog` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
Lists meal logs for the authenticated user with optional date range filtering. mealDate and logSource are auto-filtered via isFilterParameter.

**API Frontend Description By The Backend Architect**

Powers the meal history page. Shows paginated list grouped by date. Filter bar at top: date range picker (fromDate/toDate), source multi-select. Auto-filters for mealDate and logSource are passed as query params. On empty state: show 'No meals logged yet' with a CTA to add a meal.

**Rest Route**

The `listMealLogs` API REST controller can be triggered via the following route:

`/v1/meal-logs`


**Rest Request Parameters**


The `listMealLogs` api has got 2 regular request parameters  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| fromDate  | Date  | false | request.query?.["fromDate"] |
| toDate  | Date  | false | request.query?.["toDate"] |
**fromDate** : Optional range start for multi-day queries
**toDate** : Optional range end for multi-day queries


**Filter Parameters**

The `listMealLogs` api supports 2 optional filter parameters for filtering list results:

**mealDate** (`Date`): Filter by mealDate

- Single date: `?mealDate=2024-01-15`
- Multiple dates: `?mealDate=2024-01-15&mealDate=2024-01-20`
- Special: `$today`, `$ltoday`, `$week`, `$lweek`, `$month`, `$leq-<date>`, `$lin-<date>`
- Null: `?mealDate=null`


**logSource** (`Enum`): Filter by logSource

- Single: `?logSource=<value>` (case-insensitive)
- Multiple: `?logSource=<value1>&logSource=<value2>`
- Null: `?logSource=null`



**REST Request**
To access the api you can use the **REST** controller with the path **GET  /v1/meal-logs**
```js
  axios({
    method: 'GET',
    url: '/v1/meal-logs',
    data: {
    
    },
    params: {
             fromDate:'"Date"',  
             toDate:'"Date"',  
    
        // Filter parameters (see Filter Parameters section above)
        // mealDate: '<value>' // Filter by mealDate
        // logSource: '<value>' // Filter by logSource
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
	"dataName": "mealLogs",
	"method": "GET",
	"action": "list",
	"appVersion": "Version",
	"rowCount": "\"Number\"",
	"mealLogs": [
		{
			"id": "ID",
			"userId": "ID",
			"mealDate": "Date",
			"mealTime": "String",
			"slotName": "String",
			"logSource": "Enum",
			"logSource_idx": "Integer",
			"noteText": "String",
			"totalCalories": "Double",
			"totalProtein": "Double",
			"totalCarbohydrates": "Double",
			"totalFat": "Double",
			"totalSugar": "Double",
			"totalFiber": "Double",
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


### `Update Meallog` API
**[Default update API]** — This is the designated default `update` API for the `mealLog` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
Updates editable fields of a meal log and recomputes the nutrition day snapshot.

**API Frontend Description By The Backend Architect**

Triggered from the meal edit form. All fields optional — only send changed values. On success: update the meal card in the list and refresh daily progress widget. On 404: show 'Meal not found'.

**Rest Route**

The `updateMealLog` API REST controller can be triggered via the following route:

`/v1/meal-logs/:mealLogId`


**Rest Request Parameters**


The `updateMealLog` api has got 10 regular request parameters  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| mealLogId  | ID  | true | request.params?.["mealLogId"] |
| mealTime  | String  | false | request.body?.["mealTime"] |
| slotName  | String  | false | request.body?.["slotName"] |
| noteText  | String  | false | request.body?.["noteText"] |
| totalCalories  | Double  | false | request.body?.["totalCalories"] |
| totalProtein  | Double  | false | request.body?.["totalProtein"] |
| totalCarbohydrates  | Double  | false | request.body?.["totalCarbohydrates"] |
| totalFat  | Double  | false | request.body?.["totalFat"] |
| totalSugar  | Double  | false | request.body?.["totalSugar"] |
| totalFiber  | Double  | false | request.body?.["totalFiber"] |
**mealLogId** : This id paremeter is used to select the required data object that will be updated
**mealTime** : Updated meal time
**slotName** : Updated slot name
**noteText** : Updated notes
**totalCalories** : Recalculated calorie total
**totalProtein** : Recalculated protein total
**totalCarbohydrates** : Recalculated carbohydrate total
**totalFat** : Recalculated fat total
**totalSugar** : Recalculated sugar total
**totalFiber** : Recalculated fiber total



**REST Request**
To access the api you can use the **REST** controller with the path **PATCH  /v1/meal-logs/:mealLogId**
```js
  axios({
    method: 'PATCH',
    url: `/v1/meal-logs/${mealLogId}`,
    data: {
            mealTime:"String",  
            slotName:"String",  
            noteText:"String",  
            totalCalories:"Double",  
            totalProtein:"Double",  
            totalCarbohydrates:"Double",  
            totalFat:"Double",  
            totalSugar:"Double",  
            totalFiber:"Double",  
    
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
	"dataName": "mealLog",
	"method": "PATCH",
	"action": "update",
	"appVersion": "Version",
	"rowCount": 1,
	"mealLog": {
		"id": "ID",
		"userId": "ID",
		"mealDate": "Date",
		"mealTime": "String",
		"slotName": "String",
		"logSource": "Enum",
		"logSource_idx": "Integer",
		"noteText": "String",
		"totalCalories": "Double",
		"totalProtein": "Double",
		"totalCarbohydrates": "Double",
		"totalFat": "Double",
		"totalSugar": "Double",
		"totalFiber": "Double",
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"isActive": true
	}
}
```


### `Delete Meallog` API
**[Default delete API]** — This is the designated default `delete` API for the `mealLog` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
Deletes a meal log and its associated meal lines, then recomputes the nutrition day snapshot.

**API Frontend Description By The Backend Architect**

Triggered from meal card delete button (with confirmation dialog). On success: remove card from list, show toast 'Meal deleted', refresh daily progress widget. On 404: show 'Meal not found'.

**Rest Route**

The `deleteMealLog` API REST controller can be triggered via the following route:

`/v1/meal-logs/:mealLogId`


**Rest Request Parameters**


The `deleteMealLog` api has got 1 regular request parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| mealLogId  | ID  | true | request.params?.["mealLogId"] |
**mealLogId** : This id paremeter is used to select the required data object that will be deleted



**REST Request**
To access the api you can use the **REST** controller with the path **DELETE  /v1/meal-logs/:mealLogId**
```js
  axios({
    method: 'DELETE',
    url: `/v1/meal-logs/${mealLogId}`,
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
	"dataName": "mealLog",
	"method": "DELETE",
	"action": "delete",
	"appVersion": "Version",
	"rowCount": 1,
	"mealLog": {
		"id": "ID",
		"userId": "ID",
		"mealDate": "Date",
		"mealTime": "String",
		"slotName": "String",
		"logSource": "Enum",
		"logSource_idx": "Integer",
		"noteText": "String",
		"totalCalories": "Double",
		"totalProtein": "Double",
		"totalCarbohydrates": "Double",
		"totalFat": "Double",
		"totalSugar": "Double",
		"totalFiber": "Double",
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"isActive": false
	}
}
```


### `Create Mealline` API
**[Default create API]** — This is the designated default `create` API for the `mealLine` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
Creates an individual meal line item and then recalculates meal-level and day-level nutrition totals.

**API Frontend Description By The Backend Architect**

Triggered when user adds a food item to an existing meal (inline add form on meal detail). Required: mealLogId, itemName, consumedGrams, all 6 nutrition snapshot values, lineSource. userId auto-populated from session. On 201: add row to meal line list, update meal totals display. On 403: show 'This meal does not belong to you'.

**Rest Route**

The `createMealLine` API REST controller can be triggered via the following route:

`/v1/meal-lines`


**Rest Request Parameters**


The `createMealLine` api has got 12 regular request parameters  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| mealLogId  | ID  | true | request.body?.["mealLogId"] |
| itemName  | String  | true | request.body?.["itemName"] |
| consumedGrams  | Double  | true | request.body?.["consumedGrams"] |
| itemCalories  | Double  | true | request.body?.["itemCalories"] |
| itemProtein  | Double  | true | request.body?.["itemProtein"] |
| itemCarbohydrates  | Double  | true | request.body?.["itemCarbohydrates"] |
| itemFat  | Double  | true | request.body?.["itemFat"] |
| itemSugar  | Double  | true | request.body?.["itemSugar"] |
| itemFiber  | Double  | true | request.body?.["itemFiber"] |
| lineSource  | Enum  | true | request.body?.["lineSource"] |
| sourceFoodItemId  | ID  | false | request.body?.["sourceFoodItemId"] |
| sourcePresetMealId  | ID  | false | request.body?.["sourcePresetMealId"] |
**mealLogId** : FK to parent mealLog
**itemName** : Food item name
**consumedGrams** : Grams consumed
**itemCalories** : Calories snapshot
**itemProtein** : Protein snapshot
**itemCarbohydrates** : Carbohydrates snapshot
**itemFat** : Fat snapshot
**itemSugar** : Sugar snapshot
**itemFiber** : Fiber snapshot
**lineSource** : Source of the line item
**sourceFoodItemId** : Optional reference to nutritionLibrary foodItem
**sourcePresetMealId** : Optional reference to nutritionLibrary presetMeal



**REST Request**
To access the api you can use the **REST** controller with the path **POST  /v1/meal-lines**
```js
  axios({
    method: 'POST',
    url: '/v1/meal-lines',
    data: {
            mealLogId:"ID",  
            itemName:"String",  
            consumedGrams:"Double",  
            itemCalories:"Double",  
            itemProtein:"Double",  
            itemCarbohydrates:"Double",  
            itemFat:"Double",  
            itemSugar:"Double",  
            itemFiber:"Double",  
            lineSource:"Enum",  
            sourceFoodItemId:"ID",  
            sourcePresetMealId:"ID",  
    
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
	"dataName": "mealLine",
	"method": "POST",
	"action": "create",
	"appVersion": "Version",
	"rowCount": 1,
	"mealLine": {
		"id": "ID",
		"userId": "ID",
		"mealLogId": "ID",
		"sourceFoodItemId": "ID",
		"sourcePresetMealId": "ID",
		"itemName": "String",
		"consumedGrams": "Double",
		"itemCalories": "Double",
		"itemProtein": "Double",
		"itemCarbohydrates": "Double",
		"itemFat": "Double",
		"itemSugar": "Double",
		"itemFiber": "Double",
		"lineSource": "Enum",
		"lineSource_idx": "Integer",
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"isActive": true
	}
}
```


### `Update Mealline` API
**[Default update API]** — This is the designated default `update` API for the `mealLine` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
Updates nutrition snapshot values of a meal line item, then recalculates meal-level and day-level totals.

**API Frontend Description By The Backend Architect**

Triggered from inline edit on a meal line row. All fields optional. On success: update row values and refresh meal totals strip. On 404: show 'Item not found'.

**Rest Route**

The `updateMealLine` API REST controller can be triggered via the following route:

`/v1/meal-lines/:mealLineId`


**Rest Request Parameters**


The `updateMealLine` api has got 9 regular request parameters  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| mealLineId  | ID  | true | request.params?.["mealLineId"] |
| itemName  | String  | false | request.body?.["itemName"] |
| consumedGrams  | Double  | false | request.body?.["consumedGrams"] |
| itemCalories  | Double  | false | request.body?.["itemCalories"] |
| itemProtein  | Double  | false | request.body?.["itemProtein"] |
| itemCarbohydrates  | Double  | false | request.body?.["itemCarbohydrates"] |
| itemFat  | Double  | false | request.body?.["itemFat"] |
| itemSugar  | Double  | false | request.body?.["itemSugar"] |
| itemFiber  | Double  | false | request.body?.["itemFiber"] |
**mealLineId** : This id paremeter is used to select the required data object that will be updated
**itemName** : Updated item name
**consumedGrams** : Updated grams
**itemCalories** : Updated calories
**itemProtein** : Updated protein
**itemCarbohydrates** : Updated carbohydrates
**itemFat** : Updated fat
**itemSugar** : Updated sugar
**itemFiber** : Updated fiber



**REST Request**
To access the api you can use the **REST** controller with the path **PATCH  /v1/meal-lines/:mealLineId**
```js
  axios({
    method: 'PATCH',
    url: `/v1/meal-lines/${mealLineId}`,
    data: {
            itemName:"String",  
            consumedGrams:"Double",  
            itemCalories:"Double",  
            itemProtein:"Double",  
            itemCarbohydrates:"Double",  
            itemFat:"Double",  
            itemSugar:"Double",  
            itemFiber:"Double",  
    
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
	"dataName": "mealLine",
	"method": "PATCH",
	"action": "update",
	"appVersion": "Version",
	"rowCount": 1,
	"mealLine": {
		"id": "ID",
		"userId": "ID",
		"mealLogId": "ID",
		"sourceFoodItemId": "ID",
		"sourcePresetMealId": "ID",
		"itemName": "String",
		"consumedGrams": "Double",
		"itemCalories": "Double",
		"itemProtein": "Double",
		"itemCarbohydrates": "Double",
		"itemFat": "Double",
		"itemSugar": "Double",
		"itemFiber": "Double",
		"lineSource": "Enum",
		"lineSource_idx": "Integer",
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"isActive": true
	}
}
```


### `Delete Mealline` API
**[Default delete API]** — This is the designated default `delete` API for the `mealLine` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
Deletes a meal line item and recomputes the parent meal log and daily nutrition totals.

**API Frontend Description By The Backend Architect**

Triggered from delete button on a meal line row (with confirmation). On success: remove row, recalculate meal totals, refresh daily progress. On 404: show 'Item not found'.

**Rest Route**

The `deleteMealLine` API REST controller can be triggered via the following route:

`/v1/meal-lines/:mealLineId`


**Rest Request Parameters**


The `deleteMealLine` api has got 1 regular request parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| mealLineId  | ID  | true | request.params?.["mealLineId"] |
**mealLineId** : This id paremeter is used to select the required data object that will be deleted



**REST Request**
To access the api you can use the **REST** controller with the path **DELETE  /v1/meal-lines/:mealLineId**
```js
  axios({
    method: 'DELETE',
    url: `/v1/meal-lines/${mealLineId}`,
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
	"dataName": "mealLine",
	"method": "DELETE",
	"action": "delete",
	"appVersion": "Version",
	"rowCount": 1,
	"mealLine": {
		"id": "ID",
		"userId": "ID",
		"mealLogId": "ID",
		"sourceFoodItemId": "ID",
		"sourcePresetMealId": "ID",
		"itemName": "String",
		"consumedGrams": "Double",
		"itemCalories": "Double",
		"itemProtein": "Double",
		"itemCarbohydrates": "Double",
		"itemFat": "Double",
		"itemSugar": "Double",
		"itemFiber": "Double",
		"lineSource": "Enum",
		"lineSource_idx": "Integer",
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"isActive": false
	}
}
```


### `List Meallines` API
**[Default list API]** — This is the designated default `list` API for the `mealLine` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
Lists meal lines for the authenticated user. mealLogId is an auto-filter param via isFilterParameter=true.

**API Frontend Description By The Backend Architect**

Used on meal detail page to load food items for a specific meal. Always called with ?mealLogId=<id>. Shows a table: itemName, consumedGrams, itemCalories, itemProtein, itemCarbohydrates, itemFat, itemSugar, itemFiber. Each row has edit and delete buttons.

**Rest Route**

The `listMealLines` API REST controller can be triggered via the following route:

`/v1/meal-lines`


**Rest Request Parameters**



**Filter Parameters**

The `listMealLines` api supports 1 optional filter parameter for filtering list results:

**mealLogId** (`ID`): Filter by mealLogId

- Single: `?mealLogId=<value>`
- Multiple: `?mealLogId=<value1>&mealLogId=<value2>`
- Null: `?mealLogId=null`



**REST Request**
To access the api you can use the **REST** controller with the path **GET  /v1/meal-lines**
```js
  axios({
    method: 'GET',
    url: '/v1/meal-lines',
    data: {
    
    },
    params: {
    
        // Filter parameters (see Filter Parameters section above)
        // mealLogId: '<value>' // Filter by mealLogId
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
	"dataName": "mealLines",
	"method": "GET",
	"action": "list",
	"appVersion": "Version",
	"rowCount": "\"Number\"",
	"mealLines": [
		{
			"id": "ID",
			"userId": "ID",
			"mealLogId": "ID",
			"sourceFoodItemId": "ID",
			"sourcePresetMealId": "ID",
			"itemName": "String",
			"consumedGrams": "Double",
			"itemCalories": "Double",
			"itemProtein": "Double",
			"itemCarbohydrates": "Double",
			"itemFat": "Double",
			"itemSugar": "Double",
			"itemFiber": "Double",
			"lineSource": "Enum",
			"lineSource_idx": "Integer",
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


### `Get Dailyprogress` API
Retrieves (or initializes) the nutritionDay record for a given date, defaulting to today. Used as the primary dashboard data source.

**API Frontend Description By The Backend Architect**

This is the primary dashboard API. Called on page load with no params (defaults to today) or with ?targetDate=YYYY-MM-DD. Response populates the 6-macro progress panel. Show a skeleton loader while fetching. On success update all progress bars/gauges with color coding. Refresh after any meal log write operation.

**Rest Route**

The `getDailyProgress` API REST controller can be triggered via the following route:

`/v1/nutrition-days/daily-progress`


**Rest Request Parameters**


The `getDailyProgress` api has got 1 regular request parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| targetDate  | Date  | false | request.query?.["targetDate"] |
**targetDate** : The day to retrieve progress for; defaults to today



**REST Request**
To access the api you can use the **REST** controller with the path **GET  /v1/nutrition-days/daily-progress**
```js
  axios({
    method: 'GET',
    url: '/v1/nutrition-days/daily-progress',
    data: {
    
    },
    params: {
             targetDate:'"Date"',  
    
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
	"dataName": "nutritionDay",
	"method": "GET",
	"action": "get",
	"appVersion": "Version",
	"rowCount": 1,
	"nutritionDay": {
		"id": "ID",
		"userId": "ID",
		"summaryDate": "Date",
		"consumedCalories": "Double",
		"consumedProtein": "Double",
		"consumedCarbohydrates": "Double",
		"consumedFat": "Double",
		"consumedSugar": "Double",
		"consumedFiber": "Double",
		"targetCalories": "Double",
		"targetProtein": "Double",
		"targetCarbohydrates": "Double",
		"targetFat": "Double",
		"targetSugar": "Double",
		"targetFiber": "Double",
		"exceededMetrics": "String",
		"mealCount": "Integer",
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"isActive": true
	}
}
```


### `Get Nutritionday` API
**[Default get API]** — This is the designated default `get` API for the `nutritionDay` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
Retrieves a single nutritionDay record by ID, scoped to the authenticated user.

**API Frontend Description By The Backend Architect**

Used when navigating to a specific past day's nutrition detail. Standard get by ID. On 404: show 'No data for this date'.

**Rest Route**

The `getNutritionDay` API REST controller can be triggered via the following route:

`/v1/nutrition-days/:nutritionDayId`


**Rest Request Parameters**


The `getNutritionDay` api has got 1 regular request parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| nutritionDayId  | ID  | true | request.params?.["nutritionDayId"] |
**nutritionDayId** : This id paremeter is used to query the required data object.



**REST Request**
To access the api you can use the **REST** controller with the path **GET  /v1/nutrition-days/:nutritionDayId**
```js
  axios({
    method: 'GET',
    url: `/v1/nutrition-days/${nutritionDayId}`,
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
	"dataName": "nutritionDay",
	"method": "GET",
	"action": "get",
	"appVersion": "Version",
	"rowCount": 1,
	"nutritionDay": {
		"id": "ID",
		"userId": "ID",
		"summaryDate": "Date",
		"consumedCalories": "Double",
		"consumedProtein": "Double",
		"consumedCarbohydrates": "Double",
		"consumedFat": "Double",
		"consumedSugar": "Double",
		"consumedFiber": "Double",
		"targetCalories": "Double",
		"targetProtein": "Double",
		"targetCarbohydrates": "Double",
		"targetFat": "Double",
		"targetSugar": "Double",
		"targetFiber": "Double",
		"exceededMetrics": "String",
		"mealCount": "Integer",
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"isActive": true
	}
}
```


### `List Nutritiondays` API
**[Default list API]** — This is the designated default `list` API for the `nutritionDay` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
Lists nutritionDay records for the authenticated user with optional date range filtering.

**API Frontend Description By The Backend Architect**

Used by analytics pages to fetch the raw daily data. Always scoped to session.userId. Pass fromDate/toDate for range queries. summaryDate is an auto-filter from isFilterParameter=true. Returns sorted by summaryDate descending.

**Rest Route**

The `listNutritionDays` API REST controller can be triggered via the following route:

`/v1/nutrition-days`


**Rest Request Parameters**


The `listNutritionDays` api has got 2 regular request parameters  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| fromDate  | Date  | false | request.query?.["fromDate"] |
| toDate  | Date  | false | request.query?.["toDate"] |
**fromDate** : Range start
**toDate** : Range end


**Filter Parameters**

The `listNutritionDays` api supports 1 optional filter parameter for filtering list results:

**summaryDate** (`Date`): Filter by summaryDate

- Single date: `?summaryDate=2024-01-15`
- Multiple dates: `?summaryDate=2024-01-15&summaryDate=2024-01-20`
- Special: `$today`, `$ltoday`, `$week`, `$lweek`, `$month`, `$leq-<date>`, `$lin-<date>`
- Null: `?summaryDate=null`



**REST Request**
To access the api you can use the **REST** controller with the path **GET  /v1/nutrition-days**
```js
  axios({
    method: 'GET',
    url: '/v1/nutrition-days',
    data: {
    
    },
    params: {
             fromDate:'"Date"',  
             toDate:'"Date"',  
    
        // Filter parameters (see Filter Parameters section above)
        // summaryDate: '<value>' // Filter by summaryDate
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
	"dataName": "nutritionDays",
	"method": "GET",
	"action": "list",
	"appVersion": "Version",
	"rowCount": "\"Number\"",
	"nutritionDays": [
		{
			"id": "ID",
			"userId": "ID",
			"summaryDate": "Date",
			"consumedCalories": "Double",
			"consumedProtein": "Double",
			"consumedCarbohydrates": "Double",
			"consumedFat": "Double",
			"consumedSugar": "Double",
			"consumedFiber": "Double",
			"targetCalories": "Double",
			"targetProtein": "Double",
			"targetCarbohydrates": "Double",
			"targetFat": "Double",
			"targetSugar": "Double",
			"targetFiber": "Double",
			"exceededMetrics": "String",
			"mealCount": "Integer",
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


### `Get Weeklyanalytics` API
Returns the last 7 days of nutritionDay records plus computed analytics (averages, goal hit rates, calorie trend) via LIB.buildWeeklyAnalytics.

**API Frontend Description By The Backend Architect**

Triggered on the Weekly Analytics page load. Shows: a 7-day calorie trend line chart, a per-macro average bar chart, and a goal-hit-rate table (% of days each macro stayed within target). weeklyAnalytics context value is written to the response for the chart data. Loading state: skeleton chart cards.

**Rest Route**

The `getWeeklyAnalytics` API REST controller can be triggered via the following route:

`/v1/analytics/weekly`


**Rest Request Parameters**
The `getWeeklyAnalytics` api has got no request parameters.    




**REST Request**
To access the api you can use the **REST** controller with the path **GET  /v1/analytics/weekly**
```js
  axios({
    method: 'GET',
    url: '/v1/analytics/weekly',
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
	"dataName": "nutritionDays",
	"method": "GET",
	"action": "list",
	"appVersion": "Version",
	"rowCount": "\"Number\"",
	"nutritionDays": [
		{
			"id": "ID",
			"userId": "ID",
			"summaryDate": "Date",
			"consumedCalories": "Double",
			"consumedProtein": "Double",
			"consumedCarbohydrates": "Double",
			"consumedFat": "Double",
			"consumedSugar": "Double",
			"consumedFiber": "Double",
			"targetCalories": "Double",
			"targetProtein": "Double",
			"targetCarbohydrates": "Double",
			"targetFat": "Double",
			"targetSugar": "Double",
			"targetFiber": "Double",
			"exceededMetrics": "String",
			"mealCount": "Integer",
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
	"uiPermissions": [],
	"weeklyAnalytics": "Object"
}
```


### `Get Monthlyanalytics` API
Returns the last 30 days of nutritionDay records plus computed analytics (averages, goal hit rates, multi-macro trends) via LIB.buildMonthlyAnalytics.

**API Frontend Description By The Backend Architect**

Triggered on the Monthly Analytics page load. Shows: 6 trend line charts (one per macro), per-macro average and goal-hit-rate summary cards. monthlyAnalytics context value is written to the response. Loading state: skeleton chart panel.

**Rest Route**

The `getMonthlyAnalytics` API REST controller can be triggered via the following route:

`/v1/analytics/monthly`


**Rest Request Parameters**
The `getMonthlyAnalytics` api has got no request parameters.    




**REST Request**
To access the api you can use the **REST** controller with the path **GET  /v1/analytics/monthly**
```js
  axios({
    method: 'GET',
    url: '/v1/analytics/monthly',
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
	"dataName": "nutritionDays",
	"method": "GET",
	"action": "list",
	"appVersion": "Version",
	"rowCount": "\"Number\"",
	"nutritionDays": [
		{
			"id": "ID",
			"userId": "ID",
			"summaryDate": "Date",
			"consumedCalories": "Double",
			"consumedProtein": "Double",
			"consumedCarbohydrates": "Double",
			"consumedFat": "Double",
			"consumedSugar": "Double",
			"consumedFiber": "Double",
			"targetCalories": "Double",
			"targetProtein": "Double",
			"targetCarbohydrates": "Double",
			"targetFat": "Double",
			"targetSugar": "Double",
			"targetFiber": "Double",
			"exceededMetrics": "String",
			"mealCount": "Integer",
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
	"uiPermissions": [],
	"monthlyAnalytics": "Object"
}
```


### `Trigger Dailyremindercheck` API
Admin-only scheduled endpoint that finds users with no meals today and emits a Kafka reminder event for each.

**API Frontend Description By The Backend Architect**

Internal scheduled endpoint — not surfaced in any user-facing UI. Called by external cron at ~20:00 Turkish time. No user interaction.

**Rest Route**

The `triggerDailyReminderCheck` API REST controller can be triggered via the following route:

`/v1/scheduled/daily-reminder-check`


**Rest Request Parameters**
The `triggerDailyReminderCheck` api has got no request parameters.    




**REST Request**
To access the api you can use the **REST** controller with the path **POST  /v1/scheduled/daily-reminder-check**
```js
  axios({
    method: 'POST',
    url: '/v1/scheduled/daily-reminder-check',
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
	"dataName": "nutritionDay",
	"method": "POST",
	"action": "update",
	"appVersion": "Version",
	"rowCount": 1,
	"nutritionDay": {
		"id": "ID",
		"userId": "ID",
		"summaryDate": "Date",
		"consumedCalories": "Double",
		"consumedProtein": "Double",
		"consumedCarbohydrates": "Double",
		"consumedFat": "Double",
		"consumedSugar": "Double",
		"consumedFiber": "Double",
		"targetCalories": "Double",
		"targetProtein": "Double",
		"targetCarbohydrates": "Double",
		"targetFat": "Double",
		"targetSugar": "Double",
		"targetFiber": "Double",
		"exceededMetrics": "String",
		"mealCount": "Integer",
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"isActive": true
	}
}
```


### `Trigger Dailysummary` API
Admin-only scheduled endpoint that finds users with meals today and emits a Kafka daily summary event for each.

**API Frontend Description By The Backend Architect**

Internal scheduled endpoint — not surfaced in any user-facing UI. Called by external cron at ~23:59 Turkish time. No user interaction.

**Rest Route**

The `triggerDailySummary` API REST controller can be triggered via the following route:

`/v1/scheduled/daily-summary`


**Rest Request Parameters**
The `triggerDailySummary` api has got no request parameters.    




**REST Request**
To access the api you can use the **REST** controller with the path **POST  /v1/scheduled/daily-summary**
```js
  axios({
    method: 'POST',
    url: '/v1/scheduled/daily-summary',
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
	"dataName": "nutritionDay",
	"method": "POST",
	"action": "update",
	"appVersion": "Version",
	"rowCount": 1,
	"nutritionDay": {
		"id": "ID",
		"userId": "ID",
		"summaryDate": "Date",
		"consumedCalories": "Double",
		"consumedProtein": "Double",
		"consumedCarbohydrates": "Double",
		"consumedFat": "Double",
		"consumedSugar": "Double",
		"consumedFiber": "Double",
		"targetCalories": "Double",
		"targetProtein": "Double",
		"targetCarbohydrates": "Double",
		"targetFat": "Double",
		"targetSugar": "Double",
		"targetFiber": "Double",
		"exceededMetrics": "String",
		"mealCount": "Integer",
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"isActive": true
	}
}
```



**After this prompt, the user may give you new instructions to update the output of this prompt or provide subsequent prompts about the project.**


