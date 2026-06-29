# REST API GUIDE

## fitcheck-nutritionlibrary-service

**Version:** `1.0.4`

Manages each user&#39;s private macro targets, personal food library, and reusable preset meal templates with auto-calculated nutrition totals.

## Architectural Design Credit and Contact Information

The architectural design of this microservice is credited to .
For inquiries, feedback, or further information regarding the architecture, please direct your communication to:

Email:

We encourage open communication and welcome any questions or discussions related to the architectural aspects of this microservice.

## Documentation Scope

Welcome to the official documentation for the NutritionLibrary Service's REST API. This document is designed to provide a comprehensive guide to interfacing with our NutritionLibrary Service exclusively through RESTful API endpoints.

**Intended Audience**

This documentation is intended for developers and integrators who are looking to interact with the NutritionLibrary Service via HTTP requests for purposes such as creating, updating, deleting and querying NutritionLibrary objects.

**Overview**

Within these pages, you will find detailed information on how to effectively utilize the REST API, including authentication methods, request and response formats, endpoint descriptions, and examples of common use cases.

Beyond REST
It's important to note that the NutritionLibrary Service also supports alternative methods of interaction, such as gRPC and messaging via a Message Broker. These communication methods are beyond the scope of this document. For information regarding these protocols, please refer to their respective documentation.

## Authentication And Authorization

To ensure secure access to the NutritionLibrary service's protected endpoints, a project-wide access token is required. This token serves as the primary method for authenticating requests to our service. However, it's important to note that access control varies across different routes:

**Protected API**:
Certain API (routes) require specific authorization levels. Access to these routes is contingent upon the possession of a valid access token that meets the route-specific authorization criteria. Unauthorized requests to these routes will be rejected.

**Public API **:
The service also includes public API (routes) that are accessible without authentication. These public endpoints are designed for open access and do not require an access token.

### Token Locations

When including your access token in a request, ensure it is placed in one of the following specified locations. The service will sequentially search these locations for the token, utilizing the first one it encounters.

| Location             | Token Name / Param Name    |
| -------------------- | -------------------------- |
| Query                | access_token               |
| Authorization Header | Bearer                     |
| Header               | lrmwufitcheck-access-token |
| Cookie               | lrmwufitcheck-access-token |

Please ensure the token is correctly placed in one of these locations, using the appropriate label as indicated. The service prioritizes these locations in the order listed, processing the first token it successfully identifies.

## Api Definitions

This section outlines the API endpoints available within the NutritionLibrary service. Each endpoint can receive parameters through various methods, meticulously described in the following definitions. It's important to understand the flexibility in how parameters can be included in requests to effectively interact with the NutritionLibrary service.

This service is configured to listen for HTTP requests on port `3000`,
serving both the main API interface and default administrative endpoints.

The following routes are available by default:

- **API Test Interface (API Face):** `/`
- **Swagger Documentation:** `/swagger`
- **Postman Collection Download:** `/getPostmanCollection`
- **Health Checks:** `/health` and `/admin/health`
- **Current Session Info:** `/currentuser`
- **Favicon:** `/favicon.ico`

This service is accessible via the following environment-specific URLs:

- **Preview:** `https://lrmwufitcheck.preview.mindbricks.com/nutritionlibrary-api`
- **Staging:** `https://lrmwufitcheck-stage.mindbricks.co/nutritionlibrary-api`
- **Production:** `https://lrmwufitcheck.mindbricks.co/nutritionlibrary-api`

**Parameter Inclusion Methods:**
Parameters can be incorporated into API requests in several ways, each with its designated location. Understanding these methods is crucial for correctly constructing your requests:

**Query Parameters:** Included directly in the URL's query string.

**Path Parameters:** Embedded within the URL's path.

**Body Parameters:** Sent within the JSON body of the request.

**Session Parameters:** Automatically read from the session object. This method is used for parameters that are intrinsic to the user's session, such as userId. When using an API that involves session parameters, you can omit these from your request. The service will automatically bind them to the API layer, provided that a session is associated with your request.

**Note on Session Parameters:**
Session parameters represent a unique method of parameter inclusion, relying on the context of the user's session. A common example of a session parameter is userId, which the service automatically associates with your request when a session exists. This feature ensures seamless integration of user-specific data without manual input for each request.

By adhering to the specified parameter inclusion methods, you can effectively utilize the NutritionLibrary service's API endpoints. For detailed information on each endpoint, including required parameters and their accepted locations, refer to the individual API definitions below.

### Common Parameters

The `NutritionLibrary` service's business API support several common parameters designed to modify and enhance the behavior of API requests. These parameters are not individually listed in the API route definitions to avoid repetition. Instead, refer to this section to understand how to leverage these common behaviors across different routes. Note that all common parameters should be included in the query part of the URL.

### Supported Common Parameters:

- **getJoins (BOOLEAN)**: Controls whether to retrieve associated objects along with the main object. By default, `getJoins` is assumed to be `true`. Set it to `false` if you prefer to receive only the main fields of an object, excluding its associations.

- **excludeCQRS (BOOLEAN)**: Applicable only when `getJoins` is `true`. By default, `excludeCQRS` is set to `false`. Enabling this parameter (`true`) omits non-local associations, which are typically more resource-intensive as they require querying external services like ElasticSearch for additional information. Use this to optimize response times and resource usage.

- **requestId (String)**: Identifies a request to enable tracking through the service's log chain. A random hex string of 32 characters is assigned by default. If you wish to use a custom `requestId`, simply include it in your query parameters.

- **caching (BOOLEAN)**: Determines the use of caching for query API. By default, caching is enabled (`true`). To ensure the freshest data directly from the database, set this parameter to `false`, bypassing the cache.

- **cacheTTL (Integer)**: Specifies the Time-To-Live (TTL) for query caching, in seconds. This is particularly useful for adjusting the default caching duration (5 minutes) for `get list` queries. Setting a custom `cacheTTL` allows you to fine-tune the cache lifespan to meet your needs.

- **pageNumber (Integer)**: For paginated `get list` API's, this parameter selects which page of results to retrieve. The default is `1`, indicating the first page. To disable pagination and retrieve all results, set `pageNumber` to `0`.

- **pageRowCount (Integer)**: In conjunction with paginated API's, this parameter defines the number of records per page. The default value is `25`. Adjusting `pageRowCount` allows you to control the volume of data returned in a single request.

By utilizing these common parameters, you can tailor the behavior of API requests to suit your specific requirements, ensuring optimal performance and usability of the `NutritionLibrary` service.

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
```

### Object Structure of a Successfull Response

When the `NutritionLibrary` service processes requests successfully, it wraps the requested resource(s) within a JSON envelope. This envelope not only contains the data but also includes essential metadata, such as configuration details and pagination information, to enrich the response and provide context to the client.

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
```

- **`products`**: In this example, this key contains the actual response content, which may be a single object or an array of objects depending on the operation performed.

**Handling Errors:**

For details on handling error scenarios and understanding the structure of error responses, please refer to the "Error Response" section provided earlier in this documentation. It outlines how error conditions are communicated, including the use of HTTP status codes and standardized JSON structures for error messages.

## Resources

NutritionLibrary service provides the following resources which are stored in its own database as a data object. Note that a resource for an api access is a data object for the service.

### MacroTarget resource

_Resource Definition_ : Stores the authenticated user&#39;s six daily macro targets (calories, protein, carbohydrates, fat, sugar, fiber). Each user has one active target record; updating replaces the effective values.
_MacroTarget Resource Properties_
| Name | Type | Required | Default | Definition |
| ---- | ---- | -------- | ------- | ---------- |
| **userId** | ID | | | ** |
| **calorieTarget** | Double | | | ** |
| **proteinTarget** | Double | | | ** |
| **carbohydrateTarget** | Double | | | ** |
| **fatTarget** | Double | | | ** |
| **sugarTarget** | Double | | | ** |
| **fiberTarget** | Double | | | ** |
| **effectiveFrom** | Date | | | ** |

### FoodItem resource

_Resource Definition_ : A private, reusable food definition in the user&#39;s personal food library. Stores per-100g nutrition values. Editable at any time without affecting historical meal log snapshots.
_FoodItem Resource Properties_
| Name | Type | Required | Default | Definition |
| ---- | ---- | -------- | ------- | ---------- |
| **userId** | ID | | | ** |
| **foodName** | String | | | ** |
| **caloriePer100g** | Double | | | ** |
| **proteinPer100g** | Double | | | ** |
| **carbohydratePer100g** | Double | | | ** |
| **fatPer100g** | Double | | | ** |
| **sugarPer100g** | Double | | | ** |
| **fiberPer100g** | Double | | | ** |
| **brandName** | String | | | ** |
| **foodCategory** | String | | | ** |
| **creationSource** | Enum | | | \*\* |

#### Enum Properties

Enum properties are represented as strings in the database. The values are mapped to their corresponding names in the application layer.

##### creationSource Enum Property

_Enum Options_
| Name | Value | Index |
| ---- | ----- | ----- |
| **manualEntry** | `"manualEntry""` | 0 |
| **aiAssistant** | `"aiAssistant""` | 1 |

### PresetMeal resource

_Resource Definition_ : A reusable preset meal template owned by a user. Stores auto-calculated aggregate nutrition totals derived from its constituent preset lines. Mutations during meal logging must never affect this record.
_PresetMeal Resource Properties_
| Name | Type | Required | Default | Definition |
| ---- | ---- | -------- | ------- | ---------- |
| **userId** | ID | | | ** |
| **templateName** | String | | | ** |
| **descriptionText** | String | | | ** |
| **totalCalories** | Double | | | ** |
| **totalProtein** | Double | | | ** |
| **totalCarbohydrates** | Double | | | ** |
| **totalFat** | Double | | | ** |
| **totalSugar** | Double | | | ** |
| **totalFiber** | Double | | | \*\* |

### PresetLine resource

_Resource Definition_ : A single food item entry within a preset meal template. Stores a gram amount and snapshot nutrition values calculated at line creation. Lines are created or deleted to modify a preset; individual lines are not edited (replace pattern).
_PresetLine Resource Properties_
| Name | Type | Required | Default | Definition |
| ---- | ---- | -------- | ------- | ---------- |
| **presetMealId** | ID | | | ** |
| **foodItemId** | ID | | | ** |
| **lineFoodName** | String | | | ** |
| **gramAmount** | Double | | | ** |
| **lineCalories** | Double | | | ** |
| **lineProtein** | Double | | | ** |
| **lineCarbohydrates** | Double | | | ** |
| **lineFat** | Double | | | ** |
| **lineSugar** | Double | | | ** |
| **lineFiber** | Double | | | ** |

## Business Api

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

| Parameter          | Type   | Required | Population                           |
| ------------------ | ------ | -------- | ------------------------------------ |
| calorieTarget      | Double | true     | request.body?.["calorieTarget"]      |
| proteinTarget      | Double | true     | request.body?.["proteinTarget"]      |
| carbohydrateTarget | Double | true     | request.body?.["carbohydrateTarget"] |
| fatTarget          | Double | true     | request.body?.["fatTarget"]          |
| sugarTarget        | Double | true     | request.body?.["sugarTarget"]        |
| fiberTarget        | Double | true     | request.body?.["fiberTarget"]        |

**calorieTarget** :
**proteinTarget** :
**carbohydrateTarget** :
**fatTarget** :
**sugarTarget** :
**fiberTarget** :

**REST Request**
To access the api you can use the **REST** controller with the path **POST /v1/macro-targets**

```js
axios({
  method: "POST",
  url: "/v1/macro-targets",
  data: {
    calorieTarget: "Double",
    proteinTarget: "Double",
    carbohydrateTarget: "Double",
    fatTarget: "Double",
    sugarTarget: "Double",
    fiberTarget: "Double",
  },
  params: {},
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
To access the api you can use the **REST** controller with the path **GET /v1/macro-targets/me**

```js
axios({
  method: "GET",
  url: "/v1/macro-targets/me",
  data: {},
  params: {},
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

| Parameter           | Type   | Required | Population                            |
| ------------------- | ------ | -------- | ------------------------------------- |
| foodName            | String | true     | request.body?.["foodName"]            |
| caloriePer100g      | Double | true     | request.body?.["caloriePer100g"]      |
| proteinPer100g      | Double | true     | request.body?.["proteinPer100g"]      |
| carbohydratePer100g | Double | true     | request.body?.["carbohydratePer100g"] |
| fatPer100g          | Double | true     | request.body?.["fatPer100g"]          |
| sugarPer100g        | Double | true     | request.body?.["sugarPer100g"]        |
| fiberPer100g        | Double | true     | request.body?.["fiberPer100g"]        |
| brandName           | String | false    | request.body?.["brandName"]           |
| foodCategory        | String | false    | request.body?.["foodCategory"]        |
| creationSource      | Enum   | false    | request.body?.["creationSource"]      |

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
To access the api you can use the **REST** controller with the path **POST /v1/food-items**

```js
axios({
  method: "POST",
  url: "/v1/food-items",
  data: {
    foodName: "String",
    caloriePer100g: "Double",
    proteinPer100g: "Double",
    carbohydratePer100g: "Double",
    fatPer100g: "Double",
    sugarPer100g: "Double",
    fiberPer100g: "Double",
    brandName: "String",
    foodCategory: "String",
    creationSource: "Enum",
  },
  params: {},
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

| Parameter  | Type | Required | Population                     |
| ---------- | ---- | -------- | ------------------------------ |
| foodItemId | ID   | true     | request.params?.["foodItemId"] |

**foodItemId** : This id paremeter is used to query the required data object.

**REST Request**
To access the api you can use the **REST** controller with the path **GET /v1/food-items/:foodItemId**

```js
axios({
  method: "GET",
  url: `/v1/food-items/${foodItemId}`,
  data: {},
  params: {},
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

| Parameter  | Type   | Required | Population                    |
| ---------- | ------ | -------- | ----------------------------- |
| searchTerm | String | false    | request.query?.["searchTerm"] |

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
To access the api you can use the **REST** controller with the path **GET /v1/food-items**

```js
axios({
  method: "GET",
  url: "/v1/food-items",
  data: {},
  params: {
    searchTerm: '"String"',

    // Filter parameters (see Filter Parameters section above)
    // foodCategory: '<value>' // Filter by foodCategory
    // creationSource: '<value>' // Filter by creationSource
  },
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

| Parameter           | Type   | Required | Population                            |
| ------------------- | ------ | -------- | ------------------------------------- |
| foodItemId          | ID     | true     | request.params?.["foodItemId"]        |
| foodName            | String | false    | request.body?.["foodName"]            |
| caloriePer100g      | Double | false    | request.body?.["caloriePer100g"]      |
| proteinPer100g      | Double | false    | request.body?.["proteinPer100g"]      |
| carbohydratePer100g | Double | false    | request.body?.["carbohydratePer100g"] |
| fatPer100g          | Double | false    | request.body?.["fatPer100g"]          |
| sugarPer100g        | Double | false    | request.body?.["sugarPer100g"]        |
| fiberPer100g        | Double | false    | request.body?.["fiberPer100g"]        |
| brandName           | String | false    | request.body?.["brandName"]           |
| foodCategory        | String | false    | request.body?.["foodCategory"]        |

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
To access the api you can use the **REST** controller with the path **PATCH /v1/food-items/:foodItemId**

```js
axios({
  method: "PATCH",
  url: `/v1/food-items/${foodItemId}`,
  data: {
    foodName: "String",
    caloriePer100g: "Double",
    proteinPer100g: "Double",
    carbohydratePer100g: "Double",
    fatPer100g: "Double",
    sugarPer100g: "Double",
    fiberPer100g: "Double",
    brandName: "String",
    foodCategory: "String",
  },
  params: {},
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

| Parameter  | Type | Required | Population                     |
| ---------- | ---- | -------- | ------------------------------ |
| foodItemId | ID   | true     | request.params?.["foodItemId"] |

**foodItemId** : This id paremeter is used to select the required data object that will be deleted

**REST Request**
To access the api you can use the **REST** controller with the path **DELETE /v1/food-items/:foodItemId**

```js
axios({
  method: "DELETE",
  url: `/v1/food-items/${foodItemId}`,
  data: {},
  params: {},
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

| Parameter       | Type   | Required | Population                        |
| --------------- | ------ | -------- | --------------------------------- |
| templateName    | String | true     | request.body?.["templateName"]    |
| descriptionText | String | false    | request.body?.["descriptionText"] |

**templateName** :
**descriptionText** :

**REST Request**
To access the api you can use the **REST** controller with the path **POST /v1/preset-meals**

```js
axios({
  method: "POST",
  url: "/v1/preset-meals",
  data: {
    templateName: "String",
    descriptionText: "String",
  },
  params: {},
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

| Parameter    | Type | Required | Population                       |
| ------------ | ---- | -------- | -------------------------------- |
| presetMealId | ID   | true     | request.params?.["presetMealId"] |

**presetMealId** : This id paremeter is used to query the required data object.

**REST Request**
To access the api you can use the **REST** controller with the path **GET /v1/preset-meals/:presetMealId**

```js
axios({
  method: "GET",
  url: `/v1/preset-meals/${presetMealId}`,
  data: {},
  params: {},
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
To access the api you can use the **REST** controller with the path **GET /v1/preset-meals**

```js
axios({
  method: "GET",
  url: "/v1/preset-meals",
  data: {},
  params: {},
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

| Parameter       | Type   | Required | Population                        |
| --------------- | ------ | -------- | --------------------------------- |
| presetMealId    | ID     | true     | request.params?.["presetMealId"]  |
| templateName    | String | false    | request.body?.["templateName"]    |
| descriptionText | String | false    | request.body?.["descriptionText"] |

**presetMealId** : This id paremeter is used to select the required data object that will be updated
**templateName** :
**descriptionText** :

**REST Request**
To access the api you can use the **REST** controller with the path **PATCH /v1/preset-meals/:presetMealId**

```js
axios({
  method: "PATCH",
  url: `/v1/preset-meals/${presetMealId}`,
  data: {
    templateName: "String",
    descriptionText: "String",
  },
  params: {},
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

| Parameter    | Type | Required | Population                       |
| ------------ | ---- | -------- | -------------------------------- |
| presetMealId | ID   | true     | request.params?.["presetMealId"] |

**presetMealId** : This id paremeter is used to select the required data object that will be deleted

**REST Request**
To access the api you can use the **REST** controller with the path **DELETE /v1/preset-meals/:presetMealId**

```js
axios({
  method: "DELETE",
  url: `/v1/preset-meals/${presetMealId}`,
  data: {},
  params: {},
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

| Parameter    | Type   | Required | Population                       |
| ------------ | ------ | -------- | -------------------------------- |
| foodItemId   | ID     | true     | request.body?.["foodItemId"]     |
| gramAmount   | Double | true     | request.body?.["gramAmount"]     |
| presetMealId | String | true     | request.params?.["presetMealId"] |

**foodItemId** :
**gramAmount** :
**presetMealId** : This URL path parameter scopes the create operation to a parent record (typically the parent object's id).

**REST Request**
To access the api you can use the **REST** controller with the path **POST /v1/preset-meals/:presetMealId/lines**

```js
axios({
  method: "POST",
  url: `/v1/preset-meals/${presetMealId}/lines`,
  data: {
    foodItemId: "ID",
    gramAmount: "Double",
  },
  params: {},
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

| Parameter    | Type   | Required | Population                       |
| ------------ | ------ | -------- | -------------------------------- |
| presetMealId | String | true     | request.params?.["presetMealId"] |

**presetMealId** : This parameter will be used to select the data objects that want to be listed

**REST Request**
To access the api you can use the **REST** controller with the path **GET /v1/preset-meals/:presetMealId/lines**

```js
axios({
  method: "GET",
  url: `/v1/preset-meals/${presetMealId}/lines`,
  data: {},
  params: {},
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

| Parameter    | Type   | Required | Population                       |
| ------------ | ------ | -------- | -------------------------------- |
| presetLineId | ID     | true     | request.params?.["presetLineId"] |
| presetMealId | String | true     | request.params?.["presetMealId"] |

**presetLineId** : This id paremeter is used to select the required data object that will be deleted
**presetMealId** : This parameter will be used to select the data object that want to be deleted

**REST Request**
To access the api you can use the **REST** controller with the path **DELETE /v1/preset-meals/:presetMealId/lines/:presetLineId**

```js
axios({
  method: "DELETE",
  url: `/v1/preset-meals/${presetMealId}/lines/${presetLineId}`,
  data: {},
  params: {},
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

| Parameter    | Type | Required | Population                       |
| ------------ | ---- | -------- | -------------------------------- |
| presetMealId | ID   | true     | request.params?.["presetMealId"] |

**presetMealId** : This id paremeter is used to query the required data object.

**REST Request**
To access the api you can use the **REST** controller with the path **GET /v1/preset-meals/:presetMealId/for-logging**

```js
axios({
  method: "GET",
  url: `/v1/preset-meals/${presetMealId}/for-logging`,
  data: {},
  params: {},
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

| Parameter  | Type | Required | Population                     |
| ---------- | ---- | -------- | ------------------------------ |
| foodItemId | ID   | true     | request.params?.["foodItemId"] |

**foodItemId** : This id paremeter is used to query the required data object.

**REST Request**
To access the api you can use the **REST** controller with the path **GET /v1/food-items/:foodItemId/for-logging**

```js
axios({
  method: "GET",
  url: `/v1/food-items/${foodItemId}/for-logging`,
  data: {},
  params: {},
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
To access the api you can use the **REST** controller with the path **GET /v1/macro-targets/me/for-logging**

```js
axios({
  method: "GET",
  url: "/v1/macro-targets/me/for-logging",
  data: {},
  params: {},
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

### Authentication Specific Routes

### Common Routes

### Route: currentuser

_Route Definition_: Retrieves the currently authenticated user's session information.

_Route Type_: sessionInfo

_Access Route_: `GET /currentuser`

#### Parameters

This route does **not** require any request parameters.

#### Behavior

- Returns the authenticated session object associated with the current access token.
- If no valid session exists, responds with a 401 Unauthorized.

```js
// Sample GET /currentuser call
axios.get("/currentuser", {
  headers: {
    Authorization: "Bearer your-jwt-token",
  },
});
```

**Success Response**
Returns the session object, including user-related data and token information.

```
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
```

**Error Response**
**401 Unauthorized:** No active session found.

```
{
  "status": "ERR",
  "message": "No login found"
}
```

**Notes**

- This route is typically used by frontend or mobile applications to fetch the current session state after login.
- The returned session includes key user identity fields, tenant information (if applicable), and the access token for further authenticated requests.
- Always ensure a valid access token is provided in the request to retrieve the session.

### Route: permissions

`*Route Definition*`: Retrieves all effective permission records assigned to the currently authenticated user.

`*Route Type*`: permissionFetch

_Access Route_: `GET /permissions`

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
    Authorization: "Bearer your-jwt-token",
  },
});
```

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
```

Each object reflects a single permission grant, aligned with the givenPermissions model:

- `**permissionName**`: The permission the user has.
- `**roleId**`: If the permission was granted through a role. -` **subjectUserId**`: If directly granted to the user.
- `**subjectUserGroupId**`: If granted through a group.
- `**objectId**`: If tied to a specific object (OBAC).
- `**canDo**`: True or false flag to represent if permission is active or restricted.

**Error Responses**

- **401 Unauthorized**: No active session found.

```json
{
  "status": "ERR",
  "message": "No login found"
}
```

- **500 Internal Server Error**: Unexpected error fetching permissions.

**Notes**

- The /permissions route is available across all backend services generated by Mindbricks, not just the auth service.
- Auth service: Fetches permissions freshly from the live database (givenPermissions table).
- Other services: Typically use a cached or projected view of permissions stored in a common ElasticSearch store, optimized for faster authorization checks.

> **Tip**:
> Applications can cache permission results client-side or server-side, but should occasionally refresh by calling this endpoint, especially after login or permission-changing operations.

### Route: permissions/:permissionName

_Route Definition_: Checks whether the current user has access to a specific permission, and provides a list of scoped object exceptions or inclusions.

_Route Type_: permissionScopeCheck

_Access Route_: `GET /permissions/:permissionName`

#### Parameters

| Parameter      | Type   | Required | Population                      |
| -------------- | ------ | -------- | ------------------------------- |
| permissionName | String | Yes      | `request.params.permissionName` |

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
    Authorization: "Bearer your-jwt-token",
  },
});
```

**Success Response**

```json
{
  "canDo": true,
  "exceptions": [
    "a1f2e3d4-xxxx-yyyy-zzzz-object1",
    "b2c3d4e5-xxxx-yyyy-zzzz-object2"
  ]
}
```

- If `canDo` is `true`, the user generally has the permission, but not for the objects listed in `exceptions` (i.e., restrictions).
- If `canDo` is `false`, the user does not have the permission by default — but only for the objects in `exceptions`, they do have permission (i.e., selective overrides).
- The exceptions array contains valid **UUID strings**, each corresponding to an object ID (typically from the data model targeted by the permission).

## Copyright

All sources, documents and other digital materials are copyright of .

## About Us

For more information please visit our website: .

.
.
