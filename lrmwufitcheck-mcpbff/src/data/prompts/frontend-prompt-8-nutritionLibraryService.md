

# **FITCHECK**

**FRONTEND GUIDE FOR AI CODING AGENTS - PART 8 - NutritionLibrary Service**

This document is a part of a REST API guide for the fitcheck project.
It is designed for AI agents that will generate frontend code to consume the project’s backend.

This document provides extensive instruction for the usage of nutritionLibrary

## Service Access

NutritionLibrary service management is handled through service specific base urls.

NutritionLibrary  service may be deployed to the preview server, staging server, or production server. Therefore,it has 3 access URLs.
The frontend application must support all deployment environments during development, and the user should be able to select the target API server on the login page (already handled in first part.).

For the nutritionLibrary service, the base URLs are:

* **Preview:** `https://lrmwufitcheck.preview.mindbricks.com/nutritionlibrary-api`
* **Staging:** `https://lrmwufitcheck-stage.mindbricks.co/nutritionlibrary-api`
* **Production:** `https://lrmwufitcheck.mindbricks.co/nutritionlibrary-api`


## Scope

**NutritionLibrary Service Description**

Manages each user's private macro targets, personal food library, and reusable preset meal templates with auto-calculated nutrition totals.

NutritionLibrary service provides apis and business logic for following data objects in fitcheck application. 
Each data object may be either a central domain of the application data structure or a related helper data object for a central concept.
Note that data object concept is equal to table concept in the database, in the service database each data object is represented as a db table scheme and the object instances as table rows.  


**`macroTarget` Data Object**: Stores the authenticated user's six daily macro targets (calories, protein, carbohydrates, fat, sugar, fiber). Each user has one active target record; updating replaces the effective values.

**`foodItem` Data Object**: A private, reusable food definition in the user's personal food library. Stores per-100g nutrition values. Editable at any time without affecting historical meal log snapshots.

**`presetMeal` Data Object**: A reusable preset meal template owned by a user. Stores auto-calculated aggregate nutrition totals derived from its constituent preset lines. Mutations during meal logging must never affect this record.

**`presetLine` Data Object**: A single food item entry within a preset meal template. Stores a gram amount and snapshot nutrition values calculated at line creation. Lines are created or deleted to modify a preset; individual lines are not edited (replace pattern).


## NutritionLibrary Service Frontend Description By The Backend Architect

The nutritionLibrary service backs the user's personal nutrition configuration area. Three primary surfaces: (1) Macro Targets page — a single-record form where the user sets or updates their six daily targets; on save, show a success toast and reflect updated values immediately. (2) Food Library page — a paginated/searchable list of the user's saved food items with filter chips for category and creation source; inline edit opens a side drawer or modal with per-100g fields; empty state prompts 'Add your first food'. (3) Preset Meals page — a card grid of preset templates; clicking a card expands lines with gram amounts and nutrition breakdowns; add/remove line flows are inline. All write operations are optimistic-update: show the new state immediately and revert on error. Nutrition numbers are formatted to one decimal place. Category labels support Turkish characters. The AI assistant can create food items with creationSource=aiAssistant; those entries get a distinct badge so the user knows they were AI-generated.

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


## MacroTarget Data Object

Stores the authenticated user's six daily macro targets (calories, protein, carbohydrates, fat, sugar, fiber). Each user has one active target record; updating replaces the effective values.

### MacroTarget  Data Object Frontend Description By The Backend Architect

Represents the user's active daily macro goals. Display all six targets prominently as editable number fields (calories as kcal, others as grams). effectiveFrom shows when targets were last updated — display as 'Updated on [date]'. The page has a single form that POSTs to setMacroTarget; no separate edit mode is needed since there is only one active record. Show current values pre-filled if a target exists.


### MacroTarget Data Object Properties

MacroTarget data object has got following properties that are represented as table fields in the database scheme. 
These properties don't stand just for data storage, but each may have different settings to manage the business logic. 

| Property | Type | IsArray | Required | Secret | Description |
|----------|------|---------|----------|--------|-------------|
| `userId` | ID | false | Yes | No | - |
| `calorieTarget` | Double | false | Yes | No | - |
| `proteinTarget` | Double | false | Yes | No | - |
| `carbohydrateTarget` | Double | false | Yes | No | - |
| `fatTarget` | Double | false | Yes | No | - |
| `sugarTarget` | Double | false | Yes | No | - |
| `fiberTarget` | Double | false | Yes | No | - |
| `effectiveFrom` | Date | false | Yes | No | - |
* Required properties are mandatory for creating objects and must be provided in the request body if no default value, formula or session bind is set.




### Relation Properties

`userId`

Mindbricks supports relations between data objects, allowing you to define how objects are linked together.
The relations may reference to a data object either in this service or in another service. Id the reference is remote, backend handles the relations through service communication or elastic search.
These relations should be respected in the frontend so that instaead of showing the related objects id, the frontend should list human readable values from other data objects.
If the relation points to another service, frontend should use the referenced service api in case it needs related data.
The relation logic is montly handled in backend so the api responses feeds the frontend about the relational data.
In mmost cases the api response will provide the relational data as well as the main one.

In frontend, please ensure that,

1- instaead of these relational ids you show the main human readable field of the related target data (like name),
2- if this data object needs a user input of these relational ids, you should provide a combobox with the list of possible records or (a searchbox) to select with the realted target data object main human readable field.


- **userId**: ID
Relation to `user`.id

The target object is a sibling object, meaning that the relation is a many-to-one or one-to-one relationship from this object to the target.

Required: Yes



## FoodItem Data Object

A private, reusable food definition in the user's personal food library. Stores per-100g nutrition values. Editable at any time without affecting historical meal log snapshots.

### FoodItem  Data Object Frontend Description By The Backend Architect

Represents a saved food in the user's library. foodName is the headline field. Display per-100g values in a compact table (Calories, Protein, Carbs, Fat, Sugar, Fiber). brandName is optional — show in parentheses after the food name if present. foodCategory renders as a filter chip/tag. creationSource=aiAssistant shows a small AI badge. In the food picker (for meal logging), show foodName + brandName + category as a searchable dropdown row.


### FoodItem Data Object Properties

FoodItem data object has got following properties that are represented as table fields in the database scheme. 
These properties don't stand just for data storage, but each may have different settings to manage the business logic. 

| Property | Type | IsArray | Required | Secret | Description |
|----------|------|---------|----------|--------|-------------|
| `userId` | ID | false | Yes | No | - |
| `foodName` | String | false | Yes | No | - |
| `caloriePer100g` | Double | false | Yes | No | - |
| `proteinPer100g` | Double | false | Yes | No | - |
| `carbohydratePer100g` | Double | false | Yes | No | - |
| `fatPer100g` | Double | false | Yes | No | - |
| `sugarPer100g` | Double | false | Yes | No | - |
| `fiberPer100g` | Double | false | Yes | No | - |
| `brandName` | String | false | No | No | - |
| `foodCategory` | String | false | No | No | - |
| `creationSource` | Enum | false | Yes | No | - |
* Required properties are mandatory for creating objects and must be provided in the request body if no default value, formula or session bind is set.



### Enum Properties
Enum properties are defined with a set of allowed values, ensuring that only valid options can be assigned to them. 
The enum options value will be stored as strings in the database, 
but when a data object is created an additional property with the same name plus an idx suffix will be created, which will hold the index of the selected enum option.
You can use the {fieldName_idx} property to sort by the enum value or when your enum options represent a hiyerarchy of values.
In the frontend input components, enum type properties should only accept values from an option component that lists the enum options.

- **creationSource**: [manualEntry, aiAssistant]


### Relation Properties

`userId`

Mindbricks supports relations between data objects, allowing you to define how objects are linked together.
The relations may reference to a data object either in this service or in another service. Id the reference is remote, backend handles the relations through service communication or elastic search.
These relations should be respected in the frontend so that instaead of showing the related objects id, the frontend should list human readable values from other data objects.
If the relation points to another service, frontend should use the referenced service api in case it needs related data.
The relation logic is montly handled in backend so the api responses feeds the frontend about the relational data.
In mmost cases the api response will provide the relational data as well as the main one.

In frontend, please ensure that,

1- instaead of these relational ids you show the main human readable field of the related target data (like name),
2- if this data object needs a user input of these relational ids, you should provide a combobox with the list of possible records or (a searchbox) to select with the realted target data object main human readable field.


- **userId**: ID
Relation to `user`.id

The target object is a sibling object, meaning that the relation is a many-to-one or one-to-one relationship from this object to the target.

Required: Yes


### Filter Properties

`foodCategory` `creationSource`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as API parameters in the listing API's.
- **foodCategory**: String  has a filter named `foodCategory`
- **creationSource**: Enum  has a filter named `creationSource`


## PresetMeal Data Object

A reusable preset meal template owned by a user. Stores auto-calculated aggregate nutrition totals derived from its constituent preset lines. Mutations during meal logging must never affect this record.

### PresetMeal  Data Object Frontend Description By The Backend Architect

Represents a named meal template the user can reuse. templateName is the headline. Display totalCalories prominently; other totals (protein, carbs, fat, sugar, fiber) in a compact summary row. descriptionText shows as a subtitle. The card view shows template name + calorie total. Detail view (or expanded card) lists all preset lines. Totals update automatically after adding/removing lines — no manual save needed.


### PresetMeal Data Object Properties

PresetMeal data object has got following properties that are represented as table fields in the database scheme. 
These properties don't stand just for data storage, but each may have different settings to manage the business logic. 

| Property | Type | IsArray | Required | Secret | Description |
|----------|------|---------|----------|--------|-------------|
| `userId` | ID | false | Yes | No | - |
| `templateName` | String | false | Yes | No | - |
| `descriptionText` | String | false | No | No | - |
| `totalCalories` | Double | false | Yes | No | - |
| `totalProtein` | Double | false | Yes | No | - |
| `totalCarbohydrates` | Double | false | Yes | No | - |
| `totalFat` | Double | false | Yes | No | - |
| `totalSugar` | Double | false | Yes | No | - |
| `totalFiber` | Double | false | Yes | No | - |
* Required properties are mandatory for creating objects and must be provided in the request body if no default value, formula or session bind is set.




### Relation Properties

`userId`

Mindbricks supports relations between data objects, allowing you to define how objects are linked together.
The relations may reference to a data object either in this service or in another service. Id the reference is remote, backend handles the relations through service communication or elastic search.
These relations should be respected in the frontend so that instaead of showing the related objects id, the frontend should list human readable values from other data objects.
If the relation points to another service, frontend should use the referenced service api in case it needs related data.
The relation logic is montly handled in backend so the api responses feeds the frontend about the relational data.
In mmost cases the api response will provide the relational data as well as the main one.

In frontend, please ensure that,

1- instaead of these relational ids you show the main human readable field of the related target data (like name),
2- if this data object needs a user input of these relational ids, you should provide a combobox with the list of possible records or (a searchbox) to select with the realted target data object main human readable field.


- **userId**: ID
Relation to `user`.id

The target object is a sibling object, meaning that the relation is a many-to-one or one-to-one relationship from this object to the target.

Required: Yes



## PresetLine Data Object

A single food item entry within a preset meal template. Stores a gram amount and snapshot nutrition values calculated at line creation. Lines are created or deleted to modify a preset; individual lines are not edited (replace pattern).

### PresetLine  Data Object Frontend Description By The Backend Architect

Represents one food entry in a preset meal. lineFoodName is the display name (snapshot). gramAmount shows how many grams. Display the six line nutrition values in a compact row. No edit action — remove and re-add to change. In the preset detail view, render lines as a sortable list under the parent preset card.


### PresetLine Data Object Properties

PresetLine data object has got following properties that are represented as table fields in the database scheme. 
These properties don't stand just for data storage, but each may have different settings to manage the business logic. 

| Property | Type | IsArray | Required | Secret | Description |
|----------|------|---------|----------|--------|-------------|
| `presetMealId` | ID | false | Yes | No | - |
| `foodItemId` | ID | false | Yes | No | - |
| `lineFoodName` | String | false | Yes | No | - |
| `gramAmount` | Double | false | Yes | No | - |
| `lineCalories` | Double | false | Yes | No | - |
| `lineProtein` | Double | false | Yes | No | - |
| `lineCarbohydrates` | Double | false | Yes | No | - |
| `lineFat` | Double | false | Yes | No | - |
| `lineSugar` | Double | false | Yes | No | - |
| `lineFiber` | Double | false | Yes | No | - |
* Required properties are mandatory for creating objects and must be provided in the request body if no default value, formula or session bind is set.




### Relation Properties

`presetMealId` `foodItemId`

Mindbricks supports relations between data objects, allowing you to define how objects are linked together.
The relations may reference to a data object either in this service or in another service. Id the reference is remote, backend handles the relations through service communication or elastic search.
These relations should be respected in the frontend so that instaead of showing the related objects id, the frontend should list human readable values from other data objects.
If the relation points to another service, frontend should use the referenced service api in case it needs related data.
The relation logic is montly handled in backend so the api responses feeds the frontend about the relational data.
In mmost cases the api response will provide the relational data as well as the main one.

In frontend, please ensure that,

1- instaead of these relational ids you show the main human readable field of the related target data (like name),
2- if this data object needs a user input of these relational ids, you should provide a combobox with the list of possible records or (a searchbox) to select with the realted target data object main human readable field.


- **presetMealId**: ID
Relation to `presetMeal`.id

The target object is a sibling object, meaning that the relation is a many-to-one or one-to-one relationship from this object to the target.

Required: Yes

- **foodItemId**: ID
Relation to `foodItem`.id

The target object is a sibling object, meaning that the relation is a many-to-one or one-to-one relationship from this object to the target.

Required: Yes


### Filter Properties

`presetMealId`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as API parameters in the listing API's.
- **presetMealId**: ID  has a filter named `presetMealId`



## Default CRUD APIs

For each data object, the backend architect may designate **default APIs** for standard operations (create, update, delete, get, list). These are the APIs that frontend CRUD forms and AI agents should use for basic record management. If no default is explicitly set (`isDefaultApi`), the frontend generator auto-discovers the most general API for each operation.

### MacroTarget Default APIs

| Operation | API Name | Route | Explicitly Set |
|-----------|----------|-------|----------------|
| Create | `setMacroTarget` | `/v1/macro-targets` | Yes |
| Update | _none_ | - | Auto |
| Delete | _none_ | - | Auto |
| Get | `getMyMacroTarget` | `/v1/macro-targets/me` | Yes |
| List | _none_ | - | Auto |
### FoodItem Default APIs

**Display Label Property:** `foodName` — Use this property as the human-readable label when displaying records of this data object (e.g., in dropdowns, references).
| Operation | API Name | Route | Explicitly Set |
|-----------|----------|-------|----------------|
| Create | `createFoodItem` | `/v1/food-items` | Yes |
| Update | `updateFoodItem` | `/v1/food-items/:foodItemId` | Yes |
| Delete | `deleteFoodItem` | `/v1/food-items/:foodItemId` | Yes |
| Get | `getFoodItem` | `/v1/food-items/:foodItemId` | Yes |
| List | `listFoodItems` | `/v1/food-items` | Yes |
### PresetMeal Default APIs

**Display Label Property:** `templateName` — Use this property as the human-readable label when displaying records of this data object (e.g., in dropdowns, references).
| Operation | API Name | Route | Explicitly Set |
|-----------|----------|-------|----------------|
| Create | `createPresetMeal` | `/v1/preset-meals` | Yes |
| Update | `updatePresetMeal` | `/v1/preset-meals/:presetMealId` | Yes |
| Delete | `deletePresetMeal` | `/v1/preset-meals/:presetMealId` | Yes |
| Get | `getPresetMeal` | `/v1/preset-meals/:presetMealId` | Yes |
| List | `listPresetMeals` | `/v1/preset-meals` | Yes |
### PresetLine Default APIs

**Display Label Property:** `lineFoodName` — Use this property as the human-readable label when displaying records of this data object (e.g., in dropdowns, references).
| Operation | API Name | Route | Explicitly Set |
|-----------|----------|-------|----------------|
| Create | `addPresetLine` | `/v1/preset-meals/:presetMealId/lines` | Yes |
| Update | _none_ | - | Auto |
| Delete | `deletePresetLine` | `/v1/preset-meals/:presetMealId/lines/:presetLineId` | Yes |
| Get | _none_ | - | Auto |
| List | `listPresetLines` | `/v1/preset-meals/:presetMealId/lines` | Yes |

When building CRUD forms for a data object, use the default create/update APIs listed above. The form fields should correspond to the API's body parameters. For relation fields, render a dropdown loaded from the related object's list API using the display label property.






## API Reference

### `Set Macrotarget` API
**[Default create API]** — This is the designated default `create` API for the `macroTarget` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
Upsert-style API: soft-deletes any existing active macro target for the user before creating a fresh one.

**API Frontend Description By The Backend Architect**

Triggered by the Save button on the Macro Targets page. All six target fields are required. On 201, show a toast 'Macro targets updated' and reflect new values in the UI. userId is auto-populated from session — never ask the user for it. effectiveFrom is system-set.

**Rest Route**

The `setMacroTarget` API REST controller can be triggered via the following route:

`/v1/macro-targets`


**Rest Request Parameters**


The `setMacroTarget` api has got 6 regular request parameters  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| calorieTarget  | Double  | true | request.body?.["calorieTarget"] |
| proteinTarget  | Double  | true | request.body?.["proteinTarget"] |
| carbohydrateTarget  | Double  | true | request.body?.["carbohydrateTarget"] |
| fatTarget  | Double  | true | request.body?.["fatTarget"] |
| sugarTarget  | Double  | true | request.body?.["sugarTarget"] |
| fiberTarget  | Double  | true | request.body?.["fiberTarget"] |
**calorieTarget** : 
**proteinTarget** : 
**carbohydrateTarget** : 
**fatTarget** : 
**sugarTarget** : 
**fiberTarget** : 



**REST Request**
To access the api you can use the **REST** controller with the path **POST  /v1/macro-targets**
```js
  axios({
    method: 'POST',
    url: '/v1/macro-targets',
    data: {
            calorieTarget:"Double",  
            proteinTarget:"Double",  
            carbohydrateTarget:"Double",  
            fatTarget:"Double",  
            sugarTarget:"Double",  
            fiberTarget:"Double",  
    
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
	"dataName": "macroTarget",
	"method": "POST",
	"action": "create",
	"appVersion": "Version",
	"rowCount": 1,
	"macroTarget": {
		"id": "ID",
		"userId": "ID",
		"calorieTarget": "Double",
		"proteinTarget": "Double",
		"carbohydrateTarget": "Double",
		"fatTarget": "Double",
		"sugarTarget": "Double",
		"fiberTarget": "Double",
		"effectiveFrom": "Date",
		"isActive": true,
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID"
	}
}
```


### `Get Mymacrotarget` API
**[Default get API]** — This is the designated default `get` API for the `macroTarget` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
Fetch the authenticated user's current active macro target.

**API Frontend Description By The Backend Architect**

Called on page load of the Macro Targets page. Returns the current active target to pre-fill the form. If response is 404, show the form empty with placeholder hint values.

**Rest Route**

The `getMyMacroTarget` API REST controller can be triggered via the following route:

`/v1/macro-targets/me`


**Rest Request Parameters**
The `getMyMacroTarget` api has got no request parameters.    




**REST Request**
To access the api you can use the **REST** controller with the path **GET  /v1/macro-targets/me**
```js
  axios({
    method: 'GET',
    url: '/v1/macro-targets/me',
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
	"dataName": "macroTarget",
	"method": "GET",
	"action": "get",
	"appVersion": "Version",
	"rowCount": 1,
	"macroTarget": {
		"id": "ID",
		"userId": "ID",
		"calorieTarget": "Double",
		"proteinTarget": "Double",
		"carbohydrateTarget": "Double",
		"fatTarget": "Double",
		"sugarTarget": "Double",
		"fiberTarget": "Double",
		"effectiveFrom": "Date",
		"isActive": true,
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID"
	}
}
```


### `Create Fooditem` API
**[Default create API]** — This is the designated default `create` API for the `foodItem` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
Create a food item in the user's personal food library.

**API Frontend Description By The Backend Architect**

Triggered from 'Add Food' form on the Food Library page, or programmatically by the AI assistant. All per-100g fields are required. brandName and foodCategory are optional. creationSource defaults to manualEntry. On 201, append to the food list and show a toast 'Food saved'. userId is auto-populated from session.

**Rest Route**

The `createFoodItem` API REST controller can be triggered via the following route:

`/v1/food-items`


**Rest Request Parameters**


The `createFoodItem` api has got 10 regular request parameters  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| foodName  | String  | true | request.body?.["foodName"] |
| caloriePer100g  | Double  | true | request.body?.["caloriePer100g"] |
| proteinPer100g  | Double  | true | request.body?.["proteinPer100g"] |
| carbohydratePer100g  | Double  | true | request.body?.["carbohydratePer100g"] |
| fatPer100g  | Double  | true | request.body?.["fatPer100g"] |
| sugarPer100g  | Double  | true | request.body?.["sugarPer100g"] |
| fiberPer100g  | Double  | true | request.body?.["fiberPer100g"] |
| brandName  | String  | false | request.body?.["brandName"] |
| foodCategory  | String  | false | request.body?.["foodCategory"] |
| creationSource  | Enum  | false | request.body?.["creationSource"] |
**foodName** : 
**caloriePer100g** : 
**proteinPer100g** : 
**carbohydratePer100g** : 
**fatPer100g** : 
**sugarPer100g** : 
**fiberPer100g** : 
**brandName** : 
**foodCategory** : 
**creationSource** : 



**REST Request**
To access the api you can use the **REST** controller with the path **POST  /v1/food-items**
```js
  axios({
    method: 'POST',
    url: '/v1/food-items',
    data: {
            foodName:"String",  
            caloriePer100g:"Double",  
            proteinPer100g:"Double",  
            carbohydratePer100g:"Double",  
            fatPer100g:"Double",  
            sugarPer100g:"Double",  
            fiberPer100g:"Double",  
            brandName:"String",  
            foodCategory:"String",  
            creationSource:"Enum",  
    
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
	"dataName": "foodItem",
	"method": "POST",
	"action": "create",
	"appVersion": "Version",
	"rowCount": 1,
	"foodItem": {
		"id": "ID",
		"userId": "ID",
		"foodName": "String",
		"caloriePer100g": "Double",
		"proteinPer100g": "Double",
		"carbohydratePer100g": "Double",
		"fatPer100g": "Double",
		"sugarPer100g": "Double",
		"fiberPer100g": "Double",
		"brandName": "String",
		"foodCategory": "String",
		"creationSource": "Enum",
		"creationSource_idx": "Integer",
		"isActive": true,
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID"
	}
}
```


### `Get Fooditem` API
**[Default get API]** — This is the designated default `get` API for the `foodItem` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
Fetch a single food item by id. Ownership enforced.

**API Frontend Description By The Backend Architect**

Called when the user opens a food item detail view or edit drawer. Returns full per-100g fields for display and editing.

**Rest Route**

The `getFoodItem` API REST controller can be triggered via the following route:

`/v1/food-items/:foodItemId`


**Rest Request Parameters**


The `getFoodItem` api has got 1 regular request parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| foodItemId  | ID  | true | request.params?.["foodItemId"] |
**foodItemId** : This id paremeter is used to query the required data object.



**REST Request**
To access the api you can use the **REST** controller with the path **GET  /v1/food-items/:foodItemId**
```js
  axios({
    method: 'GET',
    url: `/v1/food-items/${foodItemId}`,
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
	"dataName": "foodItem",
	"method": "GET",
	"action": "get",
	"appVersion": "Version",
	"rowCount": 1,
	"foodItem": {
		"id": "ID",
		"userId": "ID",
		"foodName": "String",
		"caloriePer100g": "Double",
		"proteinPer100g": "Double",
		"carbohydratePer100g": "Double",
		"fatPer100g": "Double",
		"sugarPer100g": "Double",
		"fiberPer100g": "Double",
		"brandName": "String",
		"foodCategory": "String",
		"creationSource": "Enum",
		"creationSource_idx": "Integer",
		"isActive": true,
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID"
	}
}
```


### `List Fooditems` API
**[Default list API]** — This is the designated default `list` API for the `foodItem` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
List the authenticated user's food items. Supports optional text search on foodName, and auto-filters on foodCategory and creationSource.

**API Frontend Description By The Backend Architect**

Displayed on the Food Library page as a paginated list. Filter chips for foodCategory and creationSource appear at the top. A search box filters by foodName (partial, case-insensitive). Empty state: 'Your food library is empty — add your first food'. Row shows foodName, brandName (if set), caloriePer100g, and category badge.

**Rest Route**

The `listFoodItems` API REST controller can be triggered via the following route:

`/v1/food-items`


**Rest Request Parameters**


The `listFoodItems` api has got 1 regular request parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| searchTerm  | String  | false | request.query?.["searchTerm"] |
**searchTerm** : Optional partial match on foodName


**Filter Parameters**

The `listFoodItems` api supports 2 optional filter parameters for filtering list results:

**foodCategory** (`String`): Filter by foodCategory

- Single (partial match, case-insensitive): `?foodCategory=<value>`
- Multiple: `?foodCategory=<value1>&foodCategory=<value2>`
- Null: `?foodCategory=null`


**creationSource** (`Enum`): Filter by creationSource

- Single: `?creationSource=<value>` (case-insensitive)
- Multiple: `?creationSource=<value1>&creationSource=<value2>`
- Null: `?creationSource=null`



**REST Request**
To access the api you can use the **REST** controller with the path **GET  /v1/food-items**
```js
  axios({
    method: 'GET',
    url: '/v1/food-items',
    data: {
    
    },
    params: {
             searchTerm:'"String"',  
    
        // Filter parameters (see Filter Parameters section above)
        // foodCategory: '<value>' // Filter by foodCategory
        // creationSource: '<value>' // Filter by creationSource
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
	"dataName": "foodItems",
	"method": "GET",
	"action": "list",
	"appVersion": "Version",
	"rowCount": "\"Number\"",
	"foodItems": [
		{
			"id": "ID",
			"userId": "ID",
			"foodName": "String",
			"caloriePer100g": "Double",
			"proteinPer100g": "Double",
			"carbohydratePer100g": "Double",
			"fatPer100g": "Double",
			"sugarPer100g": "Double",
			"fiberPer100g": "Double",
			"brandName": "String",
			"foodCategory": "String",
			"creationSource": "Enum",
			"creationSource_idx": "Integer",
			"isActive": true,
			"recordVersion": "Integer",
			"createdAt": "Date",
			"updatedAt": "Date",
			"_owner": "ID"
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


### `Update Fooditem` API
**[Default update API]** — This is the designated default `update` API for the `foodItem` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
Update a food item's fields. All fields are optional (partial update). Ownership enforced.

**API Frontend Description By The Backend Architect**

Triggered from the edit drawer on the Food Library page. All fields are optional — only changed fields need to be sent. On 200, update the list in place and close the drawer with a toast 'Food updated'. creationSource is not editable after creation.

**Rest Route**

The `updateFoodItem` API REST controller can be triggered via the following route:

`/v1/food-items/:foodItemId`


**Rest Request Parameters**


The `updateFoodItem` api has got 10 regular request parameters  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| foodItemId  | ID  | true | request.params?.["foodItemId"] |
| foodName  | String  | false | request.body?.["foodName"] |
| caloriePer100g  | Double  | false | request.body?.["caloriePer100g"] |
| proteinPer100g  | Double  | false | request.body?.["proteinPer100g"] |
| carbohydratePer100g  | Double  | false | request.body?.["carbohydratePer100g"] |
| fatPer100g  | Double  | false | request.body?.["fatPer100g"] |
| sugarPer100g  | Double  | false | request.body?.["sugarPer100g"] |
| fiberPer100g  | Double  | false | request.body?.["fiberPer100g"] |
| brandName  | String  | false | request.body?.["brandName"] |
| foodCategory  | String  | false | request.body?.["foodCategory"] |
**foodItemId** : This id paremeter is used to select the required data object that will be updated
**foodName** : 
**caloriePer100g** : 
**proteinPer100g** : 
**carbohydratePer100g** : 
**fatPer100g** : 
**sugarPer100g** : 
**fiberPer100g** : 
**brandName** : 
**foodCategory** : 



**REST Request**
To access the api you can use the **REST** controller with the path **PATCH  /v1/food-items/:foodItemId**
```js
  axios({
    method: 'PATCH',
    url: `/v1/food-items/${foodItemId}`,
    data: {
            foodName:"String",  
            caloriePer100g:"Double",  
            proteinPer100g:"Double",  
            carbohydratePer100g:"Double",  
            fatPer100g:"Double",  
            sugarPer100g:"Double",  
            fiberPer100g:"Double",  
            brandName:"String",  
            foodCategory:"String",  
    
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
	"dataName": "foodItem",
	"method": "PATCH",
	"action": "update",
	"appVersion": "Version",
	"rowCount": 1,
	"foodItem": {
		"id": "ID",
		"userId": "ID",
		"foodName": "String",
		"caloriePer100g": "Double",
		"proteinPer100g": "Double",
		"carbohydratePer100g": "Double",
		"fatPer100g": "Double",
		"sugarPer100g": "Double",
		"fiberPer100g": "Double",
		"brandName": "String",
		"foodCategory": "String",
		"creationSource": "Enum",
		"creationSource_idx": "Integer",
		"isActive": true,
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID"
	}
}
```


### `Delete Fooditem` API
**[Default delete API]** — This is the designated default `delete` API for the `foodItem` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
Soft-delete a food item. Ownership enforced.

**API Frontend Description By The Backend Architect**

Triggered from the delete button on a food item row. Show a confirmation dialog before calling. On 200, remove the item from the list with a toast 'Food deleted'.

**Rest Route**

The `deleteFoodItem` API REST controller can be triggered via the following route:

`/v1/food-items/:foodItemId`


**Rest Request Parameters**


The `deleteFoodItem` api has got 1 regular request parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| foodItemId  | ID  | true | request.params?.["foodItemId"] |
**foodItemId** : This id paremeter is used to select the required data object that will be deleted



**REST Request**
To access the api you can use the **REST** controller with the path **DELETE  /v1/food-items/:foodItemId**
```js
  axios({
    method: 'DELETE',
    url: `/v1/food-items/${foodItemId}`,
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
	"dataName": "foodItem",
	"method": "DELETE",
	"action": "delete",
	"appVersion": "Version",
	"rowCount": 1,
	"foodItem": {
		"id": "ID",
		"userId": "ID",
		"foodName": "String",
		"caloriePer100g": "Double",
		"proteinPer100g": "Double",
		"carbohydratePer100g": "Double",
		"fatPer100g": "Double",
		"sugarPer100g": "Double",
		"fiberPer100g": "Double",
		"brandName": "String",
		"foodCategory": "String",
		"creationSource": "Enum",
		"creationSource_idx": "Integer",
		"isActive": false,
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID"
	}
}
```


### `Create Presetmeal` API
**[Default create API]** — This is the designated default `create` API for the `presetMeal` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
Create a preset meal header. Lines are added separately via addPresetLine. Totals initialize at 0.

**API Frontend Description By The Backend Architect**

Triggered from 'New Preset' button on Preset Meals page. Only templateName is required. On 201, navigate to the preset detail page to add lines. Totals will show as 0 until lines are added.

**Rest Route**

The `createPresetMeal` API REST controller can be triggered via the following route:

`/v1/preset-meals`


**Rest Request Parameters**


The `createPresetMeal` api has got 2 regular request parameters  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| templateName  | String  | true | request.body?.["templateName"] |
| descriptionText  | String  | false | request.body?.["descriptionText"] |
**templateName** : 
**descriptionText** : 



**REST Request**
To access the api you can use the **REST** controller with the path **POST  /v1/preset-meals**
```js
  axios({
    method: 'POST',
    url: '/v1/preset-meals',
    data: {
            templateName:"String",  
            descriptionText:"String",  
    
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
	"dataName": "presetMeal",
	"method": "POST",
	"action": "create",
	"appVersion": "Version",
	"rowCount": 1,
	"presetMeal": {
		"id": "ID",
		"userId": "ID",
		"templateName": "String",
		"descriptionText": "String",
		"totalCalories": "Double",
		"totalProtein": "Double",
		"totalCarbohydrates": "Double",
		"totalFat": "Double",
		"totalSugar": "Double",
		"totalFiber": "Double",
		"isActive": true,
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID"
	}
}
```


### `Get Presetmeal` API
**[Default get API]** — This is the designated default `get` API for the `presetMeal` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
Fetch a preset meal with its lines joined.

**API Frontend Description By The Backend Architect**

Called when user opens a preset detail page. Returns preset header + nested lines array. Display lines sorted by creation order. Totals at the top; lines table below.

**Rest Route**

The `getPresetMeal` API REST controller can be triggered via the following route:

`/v1/preset-meals/:presetMealId`


**Rest Request Parameters**


The `getPresetMeal` api has got 1 regular request parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| presetMealId  | ID  | true | request.params?.["presetMealId"] |
**presetMealId** : This id paremeter is used to query the required data object.



**REST Request**
To access the api you can use the **REST** controller with the path **GET  /v1/preset-meals/:presetMealId**
```js
  axios({
    method: 'GET',
    url: `/v1/preset-meals/${presetMealId}`,
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
	"dataName": "presetMeal",
	"method": "GET",
	"action": "get",
	"appVersion": "Version",
	"rowCount": 1,
	"presetMeal": {
		"id": "ID",
		"userId": "ID",
		"templateName": "String",
		"descriptionText": "String",
		"totalCalories": "Double",
		"totalProtein": "Double",
		"totalCarbohydrates": "Double",
		"totalFat": "Double",
		"totalSugar": "Double",
		"totalFiber": "Double",
		"isActive": true,
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"lines": [
			{
				"foodItemId": "ID",
				"lineFoodName": "String",
				"gramAmount": "Double",
				"lineCalories": "Double",
				"lineProtein": "Double",
				"lineCarbohydrates": "Double",
				"lineFat": "Double",
				"lineSugar": "Double",
				"lineFiber": "Double"
			},
			{},
			{}
		]
	}
}
```


### `List Presetmeals` API
**[Default list API]** — This is the designated default `list` API for the `presetMeal` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
List the authenticated user's preset meal templates.

**API Frontend Description By The Backend Architect**

Displayed on the Preset Meals page as a card grid. Each card shows templateName + totalCalories. Empty state: 'No presets yet — create your first meal template'. Click navigates to preset detail.

**Rest Route**

The `listPresetMeals` API REST controller can be triggered via the following route:

`/v1/preset-meals`


**Rest Request Parameters**
The `listPresetMeals` api has got no request parameters.    




**REST Request**
To access the api you can use the **REST** controller with the path **GET  /v1/preset-meals**
```js
  axios({
    method: 'GET',
    url: '/v1/preset-meals',
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
	"dataName": "presetMeals",
	"method": "GET",
	"action": "list",
	"appVersion": "Version",
	"rowCount": "\"Number\"",
	"presetMeals": [
		{
			"id": "ID",
			"userId": "ID",
			"templateName": "String",
			"descriptionText": "String",
			"totalCalories": "Double",
			"totalProtein": "Double",
			"totalCarbohydrates": "Double",
			"totalFat": "Double",
			"totalSugar": "Double",
			"totalFiber": "Double",
			"isActive": true,
			"recordVersion": "Integer",
			"createdAt": "Date",
			"updatedAt": "Date",
			"_owner": "ID"
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


### `Update Presetmeal` API
**[Default update API]** — This is the designated default `update` API for the `presetMeal` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
Update preset meal header fields (templateName, descriptionText). Nutrition totals are NOT updated here.

**API Frontend Description By The Backend Architect**

Triggered from the edit icon on a preset card. Only templateName and descriptionText can be changed. On 200, update the card in place with a toast 'Preset updated'.

**Rest Route**

The `updatePresetMeal` API REST controller can be triggered via the following route:

`/v1/preset-meals/:presetMealId`


**Rest Request Parameters**


The `updatePresetMeal` api has got 3 regular request parameters  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| presetMealId  | ID  | true | request.params?.["presetMealId"] |
| templateName  | String  | false | request.body?.["templateName"] |
| descriptionText  | String  | false | request.body?.["descriptionText"] |
**presetMealId** : This id paremeter is used to select the required data object that will be updated
**templateName** : 
**descriptionText** : 



**REST Request**
To access the api you can use the **REST** controller with the path **PATCH  /v1/preset-meals/:presetMealId**
```js
  axios({
    method: 'PATCH',
    url: `/v1/preset-meals/${presetMealId}`,
    data: {
            templateName:"String",  
            descriptionText:"String",  
    
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
	"dataName": "presetMeal",
	"method": "PATCH",
	"action": "update",
	"appVersion": "Version",
	"rowCount": 1,
	"presetMeal": {
		"id": "ID",
		"userId": "ID",
		"templateName": "String",
		"descriptionText": "String",
		"totalCalories": "Double",
		"totalProtein": "Double",
		"totalCarbohydrates": "Double",
		"totalFat": "Double",
		"totalSugar": "Double",
		"totalFiber": "Double",
		"isActive": true,
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID"
	}
}
```


### `Delete Presetmeal` API
**[Default delete API]** — This is the designated default `delete` API for the `presetMeal` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
Soft-delete a preset meal and all its lines. Ownership enforced.

**API Frontend Description By The Backend Architect**

Triggered from the delete button on a preset card. Show confirmation dialog. On 200, remove the card from the grid with a toast 'Preset deleted'.

**Rest Route**

The `deletePresetMeal` API REST controller can be triggered via the following route:

`/v1/preset-meals/:presetMealId`


**Rest Request Parameters**


The `deletePresetMeal` api has got 1 regular request parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| presetMealId  | ID  | true | request.params?.["presetMealId"] |
**presetMealId** : This id paremeter is used to select the required data object that will be deleted



**REST Request**
To access the api you can use the **REST** controller with the path **DELETE  /v1/preset-meals/:presetMealId**
```js
  axios({
    method: 'DELETE',
    url: `/v1/preset-meals/${presetMealId}`,
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
	"dataName": "presetMeal",
	"method": "DELETE",
	"action": "delete",
	"appVersion": "Version",
	"rowCount": 1,
	"presetMeal": {
		"id": "ID",
		"userId": "ID",
		"templateName": "String",
		"descriptionText": "String",
		"totalCalories": "Double",
		"totalProtein": "Double",
		"totalCarbohydrates": "Double",
		"totalFat": "Double",
		"totalSugar": "Double",
		"totalFiber": "Double",
		"isActive": false,
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID"
	}
}
```


### `Add Presetline` API
**[Default create API]** — This is the designated default `create` API for the `presetLine` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
Add a food item line to a preset meal. Validates preset ownership and food item ownership, calculates nutrition snapshot, creates the line, then recalculates parent preset totals.

**API Frontend Description By The Backend Architect**

Triggered from the 'Add Food' button on the preset detail page. User selects a food from their library and enters gram amount. On 201, append the new line to the list and update displayed totals. userId is auto-populated from session.

**Rest Route**

The `addPresetLine` API REST controller can be triggered via the following route:

`/v1/preset-meals/:presetMealId/lines`


**Rest Request Parameters**


The `addPresetLine` api has got 3 regular request parameters  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| foodItemId  | ID  | true | request.body?.["foodItemId"] |
| gramAmount  | Double  | true | request.body?.["gramAmount"] |
| presetMealId  | String  | true | request.params?.["presetMealId"] |
**foodItemId** : 
**gramAmount** : 
**presetMealId** : This URL path parameter scopes the create operation to a parent record (typically the parent object's id).



**REST Request**
To access the api you can use the **REST** controller with the path **POST  /v1/preset-meals/:presetMealId/lines**
```js
  axios({
    method: 'POST',
    url: `/v1/preset-meals/${presetMealId}/lines`,
    data: {
            foodItemId:"ID",  
            gramAmount:"Double",  
    
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
	"dataName": "presetLine",
	"method": "POST",
	"action": "create",
	"appVersion": "Version",
	"rowCount": 1,
	"presetLine": {
		"id": "ID",
		"presetMealId": "ID",
		"foodItemId": "ID",
		"lineFoodName": "String",
		"gramAmount": "Double",
		"lineCalories": "Double",
		"lineProtein": "Double",
		"lineCarbohydrates": "Double",
		"lineFat": "Double",
		"lineSugar": "Double",
		"lineFiber": "Double",
		"isActive": true,
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID"
	}
}
```


### `List Presetlines` API
**[Default list API]** — This is the designated default `list` API for the `presetLine` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
List all lines for a preset meal. Validates preset ownership. Joins food item data.

**API Frontend Description By The Backend Architect**

Called when loading preset detail page lines section. Returns all active lines for the given preset. Joined food data provides the current per-100g values for display.

**Rest Route**

The `listPresetLines` API REST controller can be triggered via the following route:

`/v1/preset-meals/:presetMealId/lines`


**Rest Request Parameters**


The `listPresetLines` api has got 1 regular request parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| presetMealId  | String  | true | request.params?.["presetMealId"] |
**presetMealId** : This parameter will be used to select the data objects that want to be listed



**REST Request**
To access the api you can use the **REST** controller with the path **GET  /v1/preset-meals/:presetMealId/lines**
```js
  axios({
    method: 'GET',
    url: `/v1/preset-meals/${presetMealId}/lines`,
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
	"dataName": "presetLines",
	"method": "GET",
	"action": "list",
	"appVersion": "Version",
	"rowCount": "\"Number\"",
	"presetLines": [
		{
			"id": "ID",
			"presetMealId": "ID",
			"foodItemId": "ID",
			"lineFoodName": "String",
			"gramAmount": "Double",
			"lineCalories": "Double",
			"lineProtein": "Double",
			"lineCarbohydrates": "Double",
			"lineFat": "Double",
			"lineSugar": "Double",
			"lineFiber": "Double",
			"isActive": true,
			"recordVersion": "Integer",
			"createdAt": "Date",
			"updatedAt": "Date",
			"_owner": "ID",
			"food": {
				"foodName": "String",
				"caloriePer100g": "Double",
				"proteinPer100g": "Double",
				"carbohydratePer100g": "Double",
				"fatPer100g": "Double",
				"sugarPer100g": "Double",
				"fiberPer100g": "Double"
			}
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


### `Delete Presetline` API
**[Default delete API]** — This is the designated default `delete` API for the `presetLine` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
Remove a single line from a preset, then recalculate preset totals. Validates preset ownership.

**API Frontend Description By The Backend Architect**

Triggered from the remove button on a preset line row. On 200, remove the line from the UI and update displayed totals.

**Rest Route**

The `deletePresetLine` API REST controller can be triggered via the following route:

`/v1/preset-meals/:presetMealId/lines/:presetLineId`


**Rest Request Parameters**


The `deletePresetLine` api has got 2 regular request parameters  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| presetLineId  | ID  | true | request.params?.["presetLineId"] |
| presetMealId  | String  | true | request.params?.["presetMealId"] |
**presetLineId** : This id paremeter is used to select the required data object that will be deleted
**presetMealId** : This parameter will be used to select the data object that want to be deleted



**REST Request**
To access the api you can use the **REST** controller with the path **DELETE  /v1/preset-meals/:presetMealId/lines/:presetLineId**
```js
  axios({
    method: 'DELETE',
    url: `/v1/preset-meals/${presetMealId}/lines/${presetLineId}`,
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
	"dataName": "presetLine",
	"method": "DELETE",
	"action": "delete",
	"appVersion": "Version",
	"rowCount": 1,
	"presetLine": {
		"id": "ID",
		"presetMealId": "ID",
		"foodItemId": "ID",
		"lineFoodName": "String",
		"gramAmount": "Double",
		"lineCalories": "Double",
		"lineProtein": "Double",
		"lineCarbohydrates": "Double",
		"lineFat": "Double",
		"lineSugar": "Double",
		"lineFiber": "Double",
		"isActive": false,
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID"
	}
}
```


### `Get Presetmealforlogging` API
Dedicated read API for mealTracker and nutritionAi services. Fetches a preset with full line detail for initiating a meal log.

**API Frontend Description By The Backend Architect**

Not directly triggered by frontend. Called by mealTracker and nutritionAi services via inter-service calls with forwardCallerToken=true. Returns the same shape as getPresetMeal.

**Rest Route**

The `getPresetMealForLogging` API REST controller can be triggered via the following route:

`/v1/preset-meals/:presetMealId/for-logging`


**Rest Request Parameters**


The `getPresetMealForLogging` api has got 1 regular request parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| presetMealId  | ID  | true | request.params?.["presetMealId"] |
**presetMealId** : This id paremeter is used to query the required data object.



**REST Request**
To access the api you can use the **REST** controller with the path **GET  /v1/preset-meals/:presetMealId/for-logging**
```js
  axios({
    method: 'GET',
    url: `/v1/preset-meals/${presetMealId}/for-logging`,
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
	"dataName": "presetMeal",
	"method": "GET",
	"action": "get",
	"appVersion": "Version",
	"rowCount": 1,
	"presetMeal": {
		"id": "ID",
		"userId": "ID",
		"templateName": "String",
		"descriptionText": "String",
		"totalCalories": "Double",
		"totalProtein": "Double",
		"totalCarbohydrates": "Double",
		"totalFat": "Double",
		"totalSugar": "Double",
		"totalFiber": "Double",
		"isActive": true,
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"lines": [
			{
				"foodItemId": "ID",
				"lineFoodName": "String",
				"gramAmount": "Double",
				"lineCalories": "Double",
				"lineProtein": "Double",
				"lineCarbohydrates": "Double",
				"lineFat": "Double",
				"lineSugar": "Double",
				"lineFiber": "Double"
			},
			{},
			{}
		]
	}
}
```


### `Get Fooditemforlogging` API
Dedicated read API for mealTracker and nutritionAi. Fetches full per-100g nutrition data for a food item.

**API Frontend Description By The Backend Architect**

Not directly triggered by frontend. Called by mealTracker and nutritionAi via inter-service calls. Returns all per-100g fields needed for nutrition calculations.

**Rest Route**

The `getFoodItemForLogging` API REST controller can be triggered via the following route:

`/v1/food-items/:foodItemId/for-logging`


**Rest Request Parameters**


The `getFoodItemForLogging` api has got 1 regular request parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| foodItemId  | ID  | true | request.params?.["foodItemId"] |
**foodItemId** : This id paremeter is used to query the required data object.



**REST Request**
To access the api you can use the **REST** controller with the path **GET  /v1/food-items/:foodItemId/for-logging**
```js
  axios({
    method: 'GET',
    url: `/v1/food-items/${foodItemId}/for-logging`,
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
	"dataName": "foodItem",
	"method": "GET",
	"action": "get",
	"appVersion": "Version",
	"rowCount": 1,
	"foodItem": {
		"id": "ID",
		"userId": "ID",
		"foodName": "String",
		"caloriePer100g": "Double",
		"proteinPer100g": "Double",
		"carbohydratePer100g": "Double",
		"fatPer100g": "Double",
		"sugarPer100g": "Double",
		"fiberPer100g": "Double",
		"brandName": "String",
		"foodCategory": "String",
		"creationSource": "Enum",
		"creationSource_idx": "Integer",
		"isActive": true,
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID"
	}
}
```


### `Get Mymacrotargetforlogging` API
Dedicated read API for mealTracker (dashboard progress) and nutritionAi (context-aware guidance). Fetches the authenticated user's current macro targets.

**API Frontend Description By The Backend Architect**

Not directly triggered by frontend. Called by mealTracker and nutritionAi via inter-service calls with forwardCallerToken=true. Returns same shape as getMyMacroTarget.

**Rest Route**

The `getMyMacroTargetForLogging` API REST controller can be triggered via the following route:

`/v1/macro-targets/me/for-logging`


**Rest Request Parameters**
The `getMyMacroTargetForLogging` api has got no request parameters.    




**REST Request**
To access the api you can use the **REST** controller with the path **GET  /v1/macro-targets/me/for-logging**
```js
  axios({
    method: 'GET',
    url: '/v1/macro-targets/me/for-logging',
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
	"dataName": "macroTarget",
	"method": "GET",
	"action": "get",
	"appVersion": "Version",
	"rowCount": 1,
	"macroTarget": {
		"id": "ID",
		"userId": "ID",
		"calorieTarget": "Double",
		"proteinTarget": "Double",
		"carbohydrateTarget": "Double",
		"fatTarget": "Double",
		"sugarTarget": "Double",
		"fiberTarget": "Double",
		"effectiveFrom": "Date",
		"isActive": true,
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID"
	}
}
```



**After this prompt, the user may give you new instructions to update the output of this prompt or provide subsequent prompts about the project.**


