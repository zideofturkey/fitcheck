# REST API GUIDE

## fitcheck-mealtracker-service

**Version:** `1.0.2`

Creates and manages user meal logs from multiple sources, calculates per-item and meal-level nutrition totals, stores immutable daily consumption snapshots, and exposes daily progress, weekly, and monthly analytics APIs.

## Architectural Design Credit and Contact Information

The architectural design of this microservice is credited to .
For inquiries, feedback, or further information regarding the architecture, please direct your communication to:

Email:

We encourage open communication and welcome any questions or discussions related to the architectural aspects of this microservice.

## Documentation Scope

Welcome to the official documentation for the MealTracker Service's REST API. This document is designed to provide a comprehensive guide to interfacing with our MealTracker Service exclusively through RESTful API endpoints.

**Intended Audience**

This documentation is intended for developers and integrators who are looking to interact with the MealTracker Service via HTTP requests for purposes such as creating, updating, deleting and querying MealTracker objects.

**Overview**

Within these pages, you will find detailed information on how to effectively utilize the REST API, including authentication methods, request and response formats, endpoint descriptions, and examples of common use cases.

Beyond REST
It's important to note that the MealTracker Service also supports alternative methods of interaction, such as gRPC and messaging via a Message Broker. These communication methods are beyond the scope of this document. For information regarding these protocols, please refer to their respective documentation.

## Authentication And Authorization

To ensure secure access to the MealTracker service's protected endpoints, a project-wide access token is required. This token serves as the primary method for authenticating requests to our service. However, it's important to note that access control varies across different routes:

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

This section outlines the API endpoints available within the MealTracker service. Each endpoint can receive parameters through various methods, meticulously described in the following definitions. It's important to understand the flexibility in how parameters can be included in requests to effectively interact with the MealTracker service.

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

- **Preview:** `https://lrmwufitcheck.preview.mindbricks.com/mealtracker-api`
- **Staging:** `https://lrmwufitcheck-stage.mindbricks.co/mealtracker-api`
- **Production:** `https://lrmwufitcheck.mindbricks.co/mealtracker-api`

**Parameter Inclusion Methods:**
Parameters can be incorporated into API requests in several ways, each with its designated location. Understanding these methods is crucial for correctly constructing your requests:

**Query Parameters:** Included directly in the URL's query string.

**Path Parameters:** Embedded within the URL's path.

**Body Parameters:** Sent within the JSON body of the request.

**Session Parameters:** Automatically read from the session object. This method is used for parameters that are intrinsic to the user's session, such as userId. When using an API that involves session parameters, you can omit these from your request. The service will automatically bind them to the API layer, provided that a session is associated with your request.

**Note on Session Parameters:**
Session parameters represent a unique method of parameter inclusion, relying on the context of the user's session. A common example of a session parameter is userId, which the service automatically associates with your request when a session exists. This feature ensures seamless integration of user-specific data without manual input for each request.

By adhering to the specified parameter inclusion methods, you can effectively utilize the MealTracker service's API endpoints. For detailed information on each endpoint, including required parameters and their accepted locations, refer to the individual API definitions below.

### Common Parameters

The `MealTracker` service's business API support several common parameters designed to modify and enhance the behavior of API requests. These parameters are not individually listed in the API route definitions to avoid repetition. Instead, refer to this section to understand how to leverage these common behaviors across different routes. Note that all common parameters should be included in the query part of the URL.

### Supported Common Parameters:

- **getJoins (BOOLEAN)**: Controls whether to retrieve associated objects along with the main object. By default, `getJoins` is assumed to be `true`. Set it to `false` if you prefer to receive only the main fields of an object, excluding its associations.

- **excludeCQRS (BOOLEAN)**: Applicable only when `getJoins` is `true`. By default, `excludeCQRS` is set to `false`. Enabling this parameter (`true`) omits non-local associations, which are typically more resource-intensive as they require querying external services like ElasticSearch for additional information. Use this to optimize response times and resource usage.

- **requestId (String)**: Identifies a request to enable tracking through the service's log chain. A random hex string of 32 characters is assigned by default. If you wish to use a custom `requestId`, simply include it in your query parameters.

- **caching (BOOLEAN)**: Determines the use of caching for query API. By default, caching is enabled (`true`). To ensure the freshest data directly from the database, set this parameter to `false`, bypassing the cache.

- **cacheTTL (Integer)**: Specifies the Time-To-Live (TTL) for query caching, in seconds. This is particularly useful for adjusting the default caching duration (5 minutes) for `get list` queries. Setting a custom `cacheTTL` allows you to fine-tune the cache lifespan to meet your needs.

- **pageNumber (Integer)**: For paginated `get list` API's, this parameter selects which page of results to retrieve. The default is `1`, indicating the first page. To disable pagination and retrieve all results, set `pageNumber` to `0`.

- **pageRowCount (Integer)**: In conjunction with paginated API's, this parameter defines the number of records per page. The default value is `25`. Adjusting `pageRowCount` allows you to control the volume of data returned in a single request.

By utilizing these common parameters, you can tailor the behavior of API requests to suit your specific requirements, ensuring optimal performance and usability of the `MealTracker` service.

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

When the `MealTracker` service processes requests successfully, it wraps the requested resource(s) within a JSON envelope. This envelope not only contains the data but also includes essential metadata, such as configuration details and pagination information, to enrich the response and provide context to the client.

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

MealTracker service provides the following resources which are stored in its own database as a data object. Note that a resource for an api access is a data object for the service.

### MealLog resource

_Resource Definition_ : A single meal entry for a user on a given date and time, tagged with a slot name and source, storing meal-level nutrition totals.
_MealLog Resource Properties_
| Name | Type | Required | Default | Definition |
| ---- | ---- | -------- | ------- | ---------- |
| **userId** | ID | | | ** |
| **mealDate** | Date | | | ** |
| **mealTime** | String | | | ** |
| **slotName** | String | | | ** |
| **logSource** | Enum | | | ** |
| **noteText** | String | | | ** |
| **totalCalories** | Double | | | ** |
| **totalProtein** | Double | | | ** |
| **totalCarbohydrates** | Double | | | ** |
| **totalFat** | Double | | | ** |
| **totalSugar** | Double | | | ** |
| **totalFiber** | Double | | | ** |

#### Enum Properties

Enum properties are represented as strings in the database. The values are mapped to their corresponding names in the application layer.

##### logSource Enum Property

_Enum Options_
| Name | Value | Index |
| ---- | ----- | ----- |
| **foodLibrary** | `"foodLibrary""` | 0 |
| **presetTemplate** | `"presetTemplate""` | 1 |
| **manualEntry** | `"manualEntry""` | 2 |
| **aiAssistant** | `"aiAssistant""` | 3 |

### MealLine resource

_Resource Definition_ : An individual food item within a meal log, storing the consumed gram amount and snapshot nutrition values calculated at log time — immutable with respect to food library changes.
_MealLine Resource Properties_
| Name | Type | Required | Default | Definition |
| ---- | ---- | -------- | ------- | ---------- |
| **userId** | ID | | | ** |
| **mealLogId** | ID | | | ** |
| **sourceFoodItemId** | ID | | | ** |
| **sourcePresetMealId** | ID | | | ** |
| **itemName** | String | | | ** |
| **consumedGrams** | Double | | | ** |
| **itemCalories** | Double | | | ** |
| **itemProtein** | Double | | | ** |
| **itemCarbohydrates** | Double | | | ** |
| **itemFat** | Double | | | ** |
| **itemSugar** | Double | | | ** |
| **itemFiber** | Double | | | ** |
| **lineSource** | Enum | | | \*\* |

#### Enum Properties

Enum properties are represented as strings in the database. The values are mapped to their corresponding names in the application layer.

##### lineSource Enum Property

_Enum Options_
| Name | Value | Index |
| ---- | ----- | ----- |
| **foodLibrary** | `"foodLibrary""` | 0 |
| **presetTemplate** | `"presetTemplate""` | 1 |
| **manualEntry** | `"manualEntry""` | 2 |
| **aiAssistant** | `"aiAssistant""` | 3 |
| **temporaryAi** | `"temporaryAi""` | 4 |

### NutritionDay resource

_Resource Definition_ : A daily rollup record per user storing consumed totals for all six macros alongside the target values active on that day, plus exceeded metric flags and meal count. Created/updated whenever meals are logged or edited.
_NutritionDay Resource Properties_
| Name | Type | Required | Default | Definition |
| ---- | ---- | -------- | ------- | ---------- |
| **userId** | ID | | | ** |
| **summaryDate** | Date | | | ** |
| **consumedCalories** | Double | | | ** |
| **consumedProtein** | Double | | | ** |
| **consumedCarbohydrates** | Double | | | ** |
| **consumedFat** | Double | | | ** |
| **consumedSugar** | Double | | | ** |
| **consumedFiber** | Double | | | ** |
| **targetCalories** | Double | | | ** |
| **targetProtein** | Double | | | ** |
| **targetCarbohydrates** | Double | | | ** |
| **targetFat** | Double | | | ** |
| **targetSugar** | Double | | | ** |
| **targetFiber** | Double | | | ** |
| **exceededMetrics** | String | | | ** |
| **mealCount** | Integer | | | ** |

## Business Api

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

| Parameter          | Type   | Required | Population                           |
| ------------------ | ------ | -------- | ------------------------------------ |
| mealDate           | Date   | true     | request.body?.["mealDate"]           |
| mealTime           | String | true     | request.body?.["mealTime"]           |
| slotName           | String | true     | request.body?.["slotName"]           |
| logSource          | Enum   | true     | request.body?.["logSource"]          |
| noteText           | String | false    | request.body?.["noteText"]           |
| totalCalories      | Double | true     | request.body?.["totalCalories"]      |
| totalProtein       | Double | true     | request.body?.["totalProtein"]       |
| totalCarbohydrates | Double | true     | request.body?.["totalCarbohydrates"] |
| totalFat           | Double | true     | request.body?.["totalFat"]           |
| totalSugar         | Double | true     | request.body?.["totalSugar"]         |
| totalFiber         | Double | true     | request.body?.["totalFiber"]         |
| lines              | Object | true     | request.body?.["lines"]              |

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
To access the api you can use the **REST** controller with the path **POST /v1/meal-logs**

```js
axios({
  method: "POST",
  url: "/v1/meal-logs",
  data: {
    mealDate: "Date",
    mealTime: "String",
    slotName: "String",
    logSource: "Enum",
    noteText: "String",
    totalCalories: "Double",
    totalProtein: "Double",
    totalCarbohydrates: "Double",
    totalFat: "Double",
    totalSugar: "Double",
    totalFiber: "Double",
    lines: "Object",
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

| Parameter | Type | Required | Population                    |
| --------- | ---- | -------- | ----------------------------- |
| mealLogId | ID   | true     | request.params?.["mealLogId"] |

**mealLogId** : This id paremeter is used to query the required data object.

**REST Request**
To access the api you can use the **REST** controller with the path **GET /v1/meal-logs/:mealLogId**

```js
axios({
  method: "GET",
  url: `/v1/meal-logs/${mealLogId}`,
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

| Parameter | Type | Required | Population                  |
| --------- | ---- | -------- | --------------------------- |
| fromDate  | Date | false    | request.query?.["fromDate"] |
| toDate    | Date | false    | request.query?.["toDate"]   |

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
To access the api you can use the **REST** controller with the path **GET /v1/meal-logs**

```js
axios({
  method: "GET",
  url: "/v1/meal-logs",
  data: {},
  params: {
    fromDate: '"Date"',
    toDate: '"Date"',

    // Filter parameters (see Filter Parameters section above)
    // mealDate: '<value>' // Filter by mealDate
    // logSource: '<value>' // Filter by logSource
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

| Parameter          | Type   | Required | Population                           |
| ------------------ | ------ | -------- | ------------------------------------ |
| mealLogId          | ID     | true     | request.params?.["mealLogId"]        |
| mealTime           | String | false    | request.body?.["mealTime"]           |
| slotName           | String | false    | request.body?.["slotName"]           |
| noteText           | String | false    | request.body?.["noteText"]           |
| totalCalories      | Double | false    | request.body?.["totalCalories"]      |
| totalProtein       | Double | false    | request.body?.["totalProtein"]       |
| totalCarbohydrates | Double | false    | request.body?.["totalCarbohydrates"] |
| totalFat           | Double | false    | request.body?.["totalFat"]           |
| totalSugar         | Double | false    | request.body?.["totalSugar"]         |
| totalFiber         | Double | false    | request.body?.["totalFiber"]         |

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
To access the api you can use the **REST** controller with the path **PATCH /v1/meal-logs/:mealLogId**

```js
axios({
  method: "PATCH",
  url: `/v1/meal-logs/${mealLogId}`,
  data: {
    mealTime: "String",
    slotName: "String",
    noteText: "String",
    totalCalories: "Double",
    totalProtein: "Double",
    totalCarbohydrates: "Double",
    totalFat: "Double",
    totalSugar: "Double",
    totalFiber: "Double",
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

| Parameter | Type | Required | Population                    |
| --------- | ---- | -------- | ----------------------------- |
| mealLogId | ID   | true     | request.params?.["mealLogId"] |

**mealLogId** : This id paremeter is used to select the required data object that will be deleted

**REST Request**
To access the api you can use the **REST** controller with the path **DELETE /v1/meal-logs/:mealLogId**

```js
axios({
  method: "DELETE",
  url: `/v1/meal-logs/${mealLogId}`,
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

| Parameter          | Type   | Required | Population                           |
| ------------------ | ------ | -------- | ------------------------------------ |
| mealLogId          | ID     | true     | request.body?.["mealLogId"]          |
| itemName           | String | true     | request.body?.["itemName"]           |
| consumedGrams      | Double | true     | request.body?.["consumedGrams"]      |
| itemCalories       | Double | true     | request.body?.["itemCalories"]       |
| itemProtein        | Double | true     | request.body?.["itemProtein"]        |
| itemCarbohydrates  | Double | true     | request.body?.["itemCarbohydrates"]  |
| itemFat            | Double | true     | request.body?.["itemFat"]            |
| itemSugar          | Double | true     | request.body?.["itemSugar"]          |
| itemFiber          | Double | true     | request.body?.["itemFiber"]          |
| lineSource         | Enum   | true     | request.body?.["lineSource"]         |
| sourceFoodItemId   | ID     | false    | request.body?.["sourceFoodItemId"]   |
| sourcePresetMealId | ID     | false    | request.body?.["sourcePresetMealId"] |

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
To access the api you can use the **REST** controller with the path **POST /v1/meal-lines**

```js
axios({
  method: "POST",
  url: "/v1/meal-lines",
  data: {
    mealLogId: "ID",
    itemName: "String",
    consumedGrams: "Double",
    itemCalories: "Double",
    itemProtein: "Double",
    itemCarbohydrates: "Double",
    itemFat: "Double",
    itemSugar: "Double",
    itemFiber: "Double",
    lineSource: "Enum",
    sourceFoodItemId: "ID",
    sourcePresetMealId: "ID",
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

| Parameter         | Type   | Required | Population                          |
| ----------------- | ------ | -------- | ----------------------------------- |
| mealLineId        | ID     | true     | request.params?.["mealLineId"]      |
| itemName          | String | false    | request.body?.["itemName"]          |
| consumedGrams     | Double | false    | request.body?.["consumedGrams"]     |
| itemCalories      | Double | false    | request.body?.["itemCalories"]      |
| itemProtein       | Double | false    | request.body?.["itemProtein"]       |
| itemCarbohydrates | Double | false    | request.body?.["itemCarbohydrates"] |
| itemFat           | Double | false    | request.body?.["itemFat"]           |
| itemSugar         | Double | false    | request.body?.["itemSugar"]         |
| itemFiber         | Double | false    | request.body?.["itemFiber"]         |

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
To access the api you can use the **REST** controller with the path **PATCH /v1/meal-lines/:mealLineId**

```js
axios({
  method: "PATCH",
  url: `/v1/meal-lines/${mealLineId}`,
  data: {
    itemName: "String",
    consumedGrams: "Double",
    itemCalories: "Double",
    itemProtein: "Double",
    itemCarbohydrates: "Double",
    itemFat: "Double",
    itemSugar: "Double",
    itemFiber: "Double",
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

| Parameter  | Type | Required | Population                     |
| ---------- | ---- | -------- | ------------------------------ |
| mealLineId | ID   | true     | request.params?.["mealLineId"] |

**mealLineId** : This id paremeter is used to select the required data object that will be deleted

**REST Request**
To access the api you can use the **REST** controller with the path **DELETE /v1/meal-lines/:mealLineId**

```js
axios({
  method: "DELETE",
  url: `/v1/meal-lines/${mealLineId}`,
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
To access the api you can use the **REST** controller with the path **GET /v1/meal-lines**

```js
axios({
  method: "GET",
  url: "/v1/meal-lines",
  data: {},
  params: {
    // Filter parameters (see Filter Parameters section above)
    // mealLogId: '<value>' // Filter by mealLogId
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

| Parameter  | Type | Required | Population                    |
| ---------- | ---- | -------- | ----------------------------- |
| targetDate | Date | false    | request.query?.["targetDate"] |

**targetDate** : The day to retrieve progress for; defaults to today

**REST Request**
To access the api you can use the **REST** controller with the path **GET /v1/nutrition-days/daily-progress**

```js
axios({
  method: "GET",
  url: "/v1/nutrition-days/daily-progress",
  data: {},
  params: {
    targetDate: '"Date"',
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

| Parameter      | Type | Required | Population                         |
| -------------- | ---- | -------- | ---------------------------------- |
| nutritionDayId | ID   | true     | request.params?.["nutritionDayId"] |

**nutritionDayId** : This id paremeter is used to query the required data object.

**REST Request**
To access the api you can use the **REST** controller with the path **GET /v1/nutrition-days/:nutritionDayId**

```js
axios({
  method: "GET",
  url: `/v1/nutrition-days/${nutritionDayId}`,
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

| Parameter | Type | Required | Population                  |
| --------- | ---- | -------- | --------------------------- |
| fromDate  | Date | false    | request.query?.["fromDate"] |
| toDate    | Date | false    | request.query?.["toDate"]   |

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
To access the api you can use the **REST** controller with the path **GET /v1/nutrition-days**

```js
axios({
  method: "GET",
  url: "/v1/nutrition-days",
  data: {},
  params: {
    fromDate: '"Date"',
    toDate: '"Date"',

    // Filter parameters (see Filter Parameters section above)
    // summaryDate: '<value>' // Filter by summaryDate
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
To access the api you can use the **REST** controller with the path **GET /v1/analytics/weekly**

```js
axios({
  method: "GET",
  url: "/v1/analytics/weekly",
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
To access the api you can use the **REST** controller with the path **GET /v1/analytics/monthly**

```js
axios({
  method: "GET",
  url: "/v1/analytics/monthly",
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
To access the api you can use the **REST** controller with the path **POST /v1/scheduled/daily-reminder-check**

```js
axios({
  method: "POST",
  url: "/v1/scheduled/daily-reminder-check",
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
To access the api you can use the **REST** controller with the path **POST /v1/scheduled/daily-summary**

```js
axios({
  method: "POST",
  url: "/v1/scheduled/daily-summary",
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
