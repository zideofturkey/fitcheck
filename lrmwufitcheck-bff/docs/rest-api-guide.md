# REST API GUIDE

## BFF SERVICE

**Version:** `1.0.53`

BFF service is a microservice that acts as a bridge between the client and the backend services. It provides a unified API for the client to interact with multiple backend services, simplifying the communication process and improving performance.

## Architectural Design Credit and Contact Information

The architectural design of this microservice is credited to.  
For inquiries, feedback, or further information regarding the architecture, please direct your communication to:

Email:

We encourage open communication and welcome any questions or discussions related to the architectural aspects of this microservice.

## Documentation Scope

Welcome to the official documentation for the BFF Service's REST API. This document is designed to provide a comprehensive guide to interfacing with our BFF Service exclusively through RESTful API endpoints.

**Intended Audience**

This documentation is intended for developers and integrators who are looking to interact with the BFF Service via HTTP requests for purposes such as listing, filtering, and searching data.

**Overview**

Within these pages, you will find detailed information on how to effectively utilize the REST API, including authentication methods, request and response formats, endpoint descriptions, and examples of common use cases.

**Beyond REST**  
It's important to note that the BFF Service also supports alternative methods of interaction, such as gRPC and messaging via a Message Broker. These communication methods are beyond the scope of this document. For information regarding these protocols, please refer to their respective documentation.

---

## Resources

### Elastic Index Resource

_Resource Definition_: A virtual resource representing dynamic search data from a specified index.

---

## Route: List Records

_Route Definition_: Returns a paginated list from the elastic index.
_Route Type_: list  
_Default access route_: _POST_ `/:indexName/list`

### Parameters

| Parameter | Type   | Required | Population      |
| --------- | ------ | -------- | --------------- |
| indexName | String | Yes      | path.param      |
| page      | Number | No       | query.page      |
| limit     | Number | No       | query.limit     |
| sortBy    | String | No       | query.sortBy    |
| sortOrder | String | No       | query.sortOrder |
| q         | String | No       | query.q         |
| filters   | Object | Yes      | body            |

```js
axios({
  method: "POST",
  url: `/${indexName}/list`,
  data: {
    filters: "Object",
  },
  params: {
    page: "Number",
    limit: "Number",
    sortBy: "String",
    sortOrder: "String",
    q: "String",
  },
});
```

## <p>The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.</p>

_Default access route_: _GET_ `/:indexName/list`

### Parameters

| Parameter | Type   | Required | Population      |
| --------- | ------ | -------- | --------------- |
| indexName | String | Yes      | path.param      |
| page      | Number | No       | query.page      |
| limit     | Number | No       | query.limit     |
| sortBy    | String | No       | query.sortBy    |
| sortOrder | String | No       | query.sortOrder |
| q         | String | No       | query.q         |

```js
axios({
  method: "GET",
  url: `/${indexName}/list`,
  data: {},
  params: {
    page: "Number",
    limit: "Number",
    sortBy: "String",
    sortOrder: "String",
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Count Records

_Route Definition_: Counts matching documents in the elastic index.
_Route Type_: count  
_Default access route_: _POST_ `/:indexName/count`

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| indexName | String | Yes      | path.param |
| q         | String | No       | query.q    |
| filters   | Object | Yes      | body       |

```js
axios({
  method: "POST",
  url: `/${indexName}/count`,
  data: {
    filters: "Object",
  },
  params: {
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

---

_Default access route_: _GET_ `/:indexName/count`

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| indexName | String | Yes      | path.param |
| q         | String | No       | query.q    |

```js
axios({
  method: "GET",
  url: `/${indexName}/count`,
  data: {},
  params: {
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Get Index Schema

_Route Definition_: Returns the schema for the elastic index.
_Route Type_: get  
_Default access route_: _GET_ `/:indexName/schema`

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| indexName | String | Yes      | path.param |

```js
axios({
  method: "GET",
  url: `/${indexName}/schema`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Filters

### GET /:indexName/filters

_Route Type_: get

### Parameters

| Parameter | Type   | Required | Population  |
| --------- | ------ | -------- | ----------- |
| indexName | String | Yes      | path.param  |
| page      | Number | No       | query.page  |
| limit     | Number | No       | query.limit |

```js
axios({
  method: "GET",
  url: `/${indexName}/filters`,
  data: {},
  params: {
    page: "Number",
    limit: "Number",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

### POST /:indexName/filters

_Route Type_: create

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| indexName | String | Yes      | path.param |
| filters   | Object | Yes      | body       |

```js
axios({
  method: "POST",
  url: `/${indexName}/filters`,
  data: {
    filterName: "String",
    conditions: "Object",
  },
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

### DELETE /:indexName/filters/:filterId

_Route Type_: delete

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| indexName | String | Yes      | path.param |
| filterId  | String | Yes      | path.param |

```js
axios({
  method: "DELETE",
  url: `/${indexName}/filters/${filterId}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Get One Record

_Route Type_: get  
_Default access route_: _GET_ `/:indexName/:id`

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| indexName | String | Yes      | path.param |
| id        | ID     | Yes      | path.param |

```js
axios({
  method: "GET",
  url: `/${indexName}/${id}`,
  data: {},
  params: {},
});
```

## The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: List Records

_Route Definition_: Returns a paginated list from the elastic index.
_Route Type_: list  
_Default access route_: _POST_ `/inviteLinkDeliveredNotificationView/list`

### Parameters

| Parameter | Type   | Required | Population      |
| --------- | ------ | -------- | --------------- |
| page      | Number | No       | query.page      |
| limit     | Number | No       | query.limit     |
| sortBy    | String | No       | query.sortBy    |
| sortOrder | String | No       | query.sortOrder |
| q         | String | No       | query.q         |
| filters   | Object | Yes      | body            |

```js
axios({
  method: "POST",
  url: `/inviteLinkDeliveredNotificationView/list`,
  data: {
    filters: "Object",
  },
  params: {
    page: "Number",
    limit: "Number",
    sortBy: "String",
    sortOrder: "String",
    q: "String",
  },
});
```

## The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

_Default access route_: _GET_ `/inviteLinkDeliveredNotificationView/list`

### Parameters

| Parameter | Type   | Required | Population      |
| --------- | ------ | -------- | --------------- |
| page      | Number | No       | query.page      |
| limit     | Number | No       | query.limit     |
| sortBy    | String | No       | query.sortBy    |
| sortOrder | String | No       | query.sortOrder |
| q         | String | No       | query.q         |

```js
axios({
  method: "GET",
  url: `/inviteLinkDeliveredNotificationView/list`,
  data: {},
  params: {
    page: "Number",
    limit: "Number",
    sortBy: "String",
    sortOrder: "String",
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Count Records

_Route Definition_: Counts matching documents in the elastic index.
_Route Type_: count  
_Default access route_: _POST_ `/inviteLinkDeliveredNotificationView/count`

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| q         | String | No       | query.q    |
| filters   | Object | Yes      | body       |

```js
axios({
  method: "POST",
  url: `/inviteLinkDeliveredNotificationView/count`,
  data: {
    filters: "Object",
  },
  params: {
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

---

_Default access route_: _GET_ `/inviteLinkDeliveredNotificationView/count`

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| q         | String | No       | query.q    |

```js
axios({
  method: "GET",
  url: `/inviteLinkDeliveredNotificationView/count`,
  data: {},
  params: {
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Get Index Schema

_Route Definition_: Returns the schema for the elastic index.
_Route Type_: get
_Default access route_: _GET_ `/inviteLinkDeliveredNotificationView/schema`

```js
axios({
  method: "GET",
  url: `/inviteLinkDeliveredNotificationView/schema`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Filters

### GET /inviteLinkDeliveredNotificationView/filters

_Route Type_: get

### Parameters

| Parameter | Type   | Required | Population  |
| --------- | ------ | -------- | ----------- |
| page      | Number | No       | query.page  |
| limit     | Number | No       | query.limit |

```js
axios({
  method: "GET",
  url: `/inviteLinkDeliveredNotificationView/filters`,
  data: {},
  params: {
    page: "Number",
    limit: "Number",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

### POST /inviteLinkDeliveredNotificationView/filters

_Route Type_: create

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| filters   | Object | Yes      | body       |

```js
axios({
  method: "POST",
  url: `/inviteLinkDeliveredNotificationView/filters`,
  data: {
    filters: "Object",
  },
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

### DELETE /inviteLinkDeliveredNotificationView/filters/:filterId

_Route Type_: delete

### Parameters

| Parameter | Type | Required | Population |
| --------- | ---- | -------- | ---------- |
| filterId  | ID   | Yes      | path.param |

```js
axios({
  method: "DELETE",
  url: `/inviteLinkDeliveredNotificationView/filters/${filterId}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Get One Record

_Route Type_: get
_Default access route_: _GET_ `/inviteLinkDeliveredNotificationView/:id`

### Parameters

| Parameter | Type | Required | Population |
| --------- | ---- | -------- | ---------- |
| id        | ID   | Yes      | path.param |

```js
axios({
  method: "GET",
  url: `/inviteLinkDeliveredNotificationView/${id}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

---

## Route: List Records

_Route Definition_: Returns a paginated list from the elastic index.
_Route Type_: list  
_Default access route_: _POST_ `/inviteLinkListView/list`

### Parameters

| Parameter | Type   | Required | Population      |
| --------- | ------ | -------- | --------------- |
| page      | Number | No       | query.page      |
| limit     | Number | No       | query.limit     |
| sortBy    | String | No       | query.sortBy    |
| sortOrder | String | No       | query.sortOrder |
| q         | String | No       | query.q         |
| filters   | Object | Yes      | body            |

```js
axios({
  method: "POST",
  url: `/inviteLinkListView/list`,
  data: {
    filters: "Object",
  },
  params: {
    page: "Number",
    limit: "Number",
    sortBy: "String",
    sortOrder: "String",
    q: "String",
  },
});
```

## The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

_Default access route_: _GET_ `/inviteLinkListView/list`

### Parameters

| Parameter | Type   | Required | Population      |
| --------- | ------ | -------- | --------------- |
| page      | Number | No       | query.page      |
| limit     | Number | No       | query.limit     |
| sortBy    | String | No       | query.sortBy    |
| sortOrder | String | No       | query.sortOrder |
| q         | String | No       | query.q         |

```js
axios({
  method: "GET",
  url: `/inviteLinkListView/list`,
  data: {},
  params: {
    page: "Number",
    limit: "Number",
    sortBy: "String",
    sortOrder: "String",
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Count Records

_Route Definition_: Counts matching documents in the elastic index.
_Route Type_: count  
_Default access route_: _POST_ `/inviteLinkListView/count`

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| q         | String | No       | query.q    |
| filters   | Object | Yes      | body       |

```js
axios({
  method: "POST",
  url: `/inviteLinkListView/count`,
  data: {
    filters: "Object",
  },
  params: {
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

---

_Default access route_: _GET_ `/inviteLinkListView/count`

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| q         | String | No       | query.q    |

```js
axios({
  method: "GET",
  url: `/inviteLinkListView/count`,
  data: {},
  params: {
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Get Index Schema

_Route Definition_: Returns the schema for the elastic index.
_Route Type_: get
_Default access route_: _GET_ `/inviteLinkListView/schema`

```js
axios({
  method: "GET",
  url: `/inviteLinkListView/schema`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Filters

### GET /inviteLinkListView/filters

_Route Type_: get

### Parameters

| Parameter | Type   | Required | Population  |
| --------- | ------ | -------- | ----------- |
| page      | Number | No       | query.page  |
| limit     | Number | No       | query.limit |

```js
axios({
  method: "GET",
  url: `/inviteLinkListView/filters`,
  data: {},
  params: {
    page: "Number",
    limit: "Number",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

### POST /inviteLinkListView/filters

_Route Type_: create

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| filters   | Object | Yes      | body       |

```js
axios({
  method: "POST",
  url: `/inviteLinkListView/filters`,
  data: {
    filters: "Object",
  },
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

### DELETE /inviteLinkListView/filters/:filterId

_Route Type_: delete

### Parameters

| Parameter | Type | Required | Population |
| --------- | ---- | -------- | ---------- |
| filterId  | ID   | Yes      | path.param |

```js
axios({
  method: "DELETE",
  url: `/inviteLinkListView/filters/${filterId}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Get One Record

_Route Type_: get
_Default access route_: _GET_ `/inviteLinkListView/:id`

### Parameters

| Parameter | Type | Required | Population |
| --------- | ---- | -------- | ---------- |
| id        | ID   | Yes      | path.param |

```js
axios({
  method: "GET",
  url: `/inviteLinkListView/${id}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

---

## Route: List Records

_Route Definition_: Returns a paginated list from the elastic index.
_Route Type_: list  
_Default access route_: _POST_ `/presetMealWithLines/list`

### Parameters

| Parameter | Type   | Required | Population      |
| --------- | ------ | -------- | --------------- |
| page      | Number | No       | query.page      |
| limit     | Number | No       | query.limit     |
| sortBy    | String | No       | query.sortBy    |
| sortOrder | String | No       | query.sortOrder |
| q         | String | No       | query.q         |
| filters   | Object | Yes      | body            |

```js
axios({
  method: "POST",
  url: `/presetMealWithLines/list`,
  data: {
    filters: "Object",
  },
  params: {
    page: "Number",
    limit: "Number",
    sortBy: "String",
    sortOrder: "String",
    q: "String",
  },
});
```

## The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

_Default access route_: _GET_ `/presetMealWithLines/list`

### Parameters

| Parameter | Type   | Required | Population      |
| --------- | ------ | -------- | --------------- |
| page      | Number | No       | query.page      |
| limit     | Number | No       | query.limit     |
| sortBy    | String | No       | query.sortBy    |
| sortOrder | String | No       | query.sortOrder |
| q         | String | No       | query.q         |

```js
axios({
  method: "GET",
  url: `/presetMealWithLines/list`,
  data: {},
  params: {
    page: "Number",
    limit: "Number",
    sortBy: "String",
    sortOrder: "String",
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Count Records

_Route Definition_: Counts matching documents in the elastic index.
_Route Type_: count  
_Default access route_: _POST_ `/presetMealWithLines/count`

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| q         | String | No       | query.q    |
| filters   | Object | Yes      | body       |

```js
axios({
  method: "POST",
  url: `/presetMealWithLines/count`,
  data: {
    filters: "Object",
  },
  params: {
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

---

_Default access route_: _GET_ `/presetMealWithLines/count`

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| q         | String | No       | query.q    |

```js
axios({
  method: "GET",
  url: `/presetMealWithLines/count`,
  data: {},
  params: {
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Get Index Schema

_Route Definition_: Returns the schema for the elastic index.
_Route Type_: get
_Default access route_: _GET_ `/presetMealWithLines/schema`

```js
axios({
  method: "GET",
  url: `/presetMealWithLines/schema`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Filters

### GET /presetMealWithLines/filters

_Route Type_: get

### Parameters

| Parameter | Type   | Required | Population  |
| --------- | ------ | -------- | ----------- |
| page      | Number | No       | query.page  |
| limit     | Number | No       | query.limit |

```js
axios({
  method: "GET",
  url: `/presetMealWithLines/filters`,
  data: {},
  params: {
    page: "Number",
    limit: "Number",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

### POST /presetMealWithLines/filters

_Route Type_: create

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| filters   | Object | Yes      | body       |

```js
axios({
  method: "POST",
  url: `/presetMealWithLines/filters`,
  data: {
    filters: "Object",
  },
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

### DELETE /presetMealWithLines/filters/:filterId

_Route Type_: delete

### Parameters

| Parameter | Type | Required | Population |
| --------- | ---- | -------- | ---------- |
| filterId  | ID   | Yes      | path.param |

```js
axios({
  method: "DELETE",
  url: `/presetMealWithLines/filters/${filterId}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Get One Record

_Route Type_: get
_Default access route_: _GET_ `/presetMealWithLines/:id`

### Parameters

| Parameter | Type | Required | Population |
| --------- | ---- | -------- | ---------- |
| id        | ID   | Yes      | path.param |

```js
axios({
  method: "GET",
  url: `/presetMealWithLines/${id}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

---

## Route: List Records

_Route Definition_: Returns a paginated list from the elastic index.
_Route Type_: list  
_Default access route_: _POST_ `/foodItemList/list`

### Parameters

| Parameter | Type   | Required | Population      |
| --------- | ------ | -------- | --------------- |
| page      | Number | No       | query.page      |
| limit     | Number | No       | query.limit     |
| sortBy    | String | No       | query.sortBy    |
| sortOrder | String | No       | query.sortOrder |
| q         | String | No       | query.q         |
| filters   | Object | Yes      | body            |

```js
axios({
  method: "POST",
  url: `/foodItemList/list`,
  data: {
    filters: "Object",
  },
  params: {
    page: "Number",
    limit: "Number",
    sortBy: "String",
    sortOrder: "String",
    q: "String",
  },
});
```

## The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

_Default access route_: _GET_ `/foodItemList/list`

### Parameters

| Parameter | Type   | Required | Population      |
| --------- | ------ | -------- | --------------- |
| page      | Number | No       | query.page      |
| limit     | Number | No       | query.limit     |
| sortBy    | String | No       | query.sortBy    |
| sortOrder | String | No       | query.sortOrder |
| q         | String | No       | query.q         |

```js
axios({
  method: "GET",
  url: `/foodItemList/list`,
  data: {},
  params: {
    page: "Number",
    limit: "Number",
    sortBy: "String",
    sortOrder: "String",
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Count Records

_Route Definition_: Counts matching documents in the elastic index.
_Route Type_: count  
_Default access route_: _POST_ `/foodItemList/count`

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| q         | String | No       | query.q    |
| filters   | Object | Yes      | body       |

```js
axios({
  method: "POST",
  url: `/foodItemList/count`,
  data: {
    filters: "Object",
  },
  params: {
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

---

_Default access route_: _GET_ `/foodItemList/count`

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| q         | String | No       | query.q    |

```js
axios({
  method: "GET",
  url: `/foodItemList/count`,
  data: {},
  params: {
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Get Index Schema

_Route Definition_: Returns the schema for the elastic index.
_Route Type_: get
_Default access route_: _GET_ `/foodItemList/schema`

```js
axios({
  method: "GET",
  url: `/foodItemList/schema`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Filters

### GET /foodItemList/filters

_Route Type_: get

### Parameters

| Parameter | Type   | Required | Population  |
| --------- | ------ | -------- | ----------- |
| page      | Number | No       | query.page  |
| limit     | Number | No       | query.limit |

```js
axios({
  method: "GET",
  url: `/foodItemList/filters`,
  data: {},
  params: {
    page: "Number",
    limit: "Number",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

### POST /foodItemList/filters

_Route Type_: create

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| filters   | Object | Yes      | body       |

```js
axios({
  method: "POST",
  url: `/foodItemList/filters`,
  data: {
    filters: "Object",
  },
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

### DELETE /foodItemList/filters/:filterId

_Route Type_: delete

### Parameters

| Parameter | Type | Required | Population |
| --------- | ---- | -------- | ---------- |
| filterId  | ID   | Yes      | path.param |

```js
axios({
  method: "DELETE",
  url: `/foodItemList/filters/${filterId}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Get One Record

_Route Type_: get
_Default access route_: _GET_ `/foodItemList/:id`

### Parameters

| Parameter | Type | Required | Population |
| --------- | ---- | -------- | ---------- |
| id        | ID   | Yes      | path.param |

```js
axios({
  method: "GET",
  url: `/foodItemList/${id}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

---

## Route: List Records

_Route Definition_: Returns a paginated list from the elastic index.
_Route Type_: list  
_Default access route_: _POST_ `/aiCandidateMealWithLines/list`

### Parameters

| Parameter | Type   | Required | Population      |
| --------- | ------ | -------- | --------------- |
| page      | Number | No       | query.page      |
| limit     | Number | No       | query.limit     |
| sortBy    | String | No       | query.sortBy    |
| sortOrder | String | No       | query.sortOrder |
| q         | String | No       | query.q         |
| filters   | Object | Yes      | body            |

```js
axios({
  method: "POST",
  url: `/aiCandidateMealWithLines/list`,
  data: {
    filters: "Object",
  },
  params: {
    page: "Number",
    limit: "Number",
    sortBy: "String",
    sortOrder: "String",
    q: "String",
  },
});
```

## The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

_Default access route_: _GET_ `/aiCandidateMealWithLines/list`

### Parameters

| Parameter | Type   | Required | Population      |
| --------- | ------ | -------- | --------------- |
| page      | Number | No       | query.page      |
| limit     | Number | No       | query.limit     |
| sortBy    | String | No       | query.sortBy    |
| sortOrder | String | No       | query.sortOrder |
| q         | String | No       | query.q         |

```js
axios({
  method: "GET",
  url: `/aiCandidateMealWithLines/list`,
  data: {},
  params: {
    page: "Number",
    limit: "Number",
    sortBy: "String",
    sortOrder: "String",
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Count Records

_Route Definition_: Counts matching documents in the elastic index.
_Route Type_: count  
_Default access route_: _POST_ `/aiCandidateMealWithLines/count`

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| q         | String | No       | query.q    |
| filters   | Object | Yes      | body       |

```js
axios({
  method: "POST",
  url: `/aiCandidateMealWithLines/count`,
  data: {
    filters: "Object",
  },
  params: {
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

---

_Default access route_: _GET_ `/aiCandidateMealWithLines/count`

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| q         | String | No       | query.q    |

```js
axios({
  method: "GET",
  url: `/aiCandidateMealWithLines/count`,
  data: {},
  params: {
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Get Index Schema

_Route Definition_: Returns the schema for the elastic index.
_Route Type_: get
_Default access route_: _GET_ `/aiCandidateMealWithLines/schema`

```js
axios({
  method: "GET",
  url: `/aiCandidateMealWithLines/schema`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Filters

### GET /aiCandidateMealWithLines/filters

_Route Type_: get

### Parameters

| Parameter | Type   | Required | Population  |
| --------- | ------ | -------- | ----------- |
| page      | Number | No       | query.page  |
| limit     | Number | No       | query.limit |

```js
axios({
  method: "GET",
  url: `/aiCandidateMealWithLines/filters`,
  data: {},
  params: {
    page: "Number",
    limit: "Number",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

### POST /aiCandidateMealWithLines/filters

_Route Type_: create

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| filters   | Object | Yes      | body       |

```js
axios({
  method: "POST",
  url: `/aiCandidateMealWithLines/filters`,
  data: {
    filters: "Object",
  },
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

### DELETE /aiCandidateMealWithLines/filters/:filterId

_Route Type_: delete

### Parameters

| Parameter | Type | Required | Population |
| --------- | ---- | -------- | ---------- |
| filterId  | ID   | Yes      | path.param |

```js
axios({
  method: "DELETE",
  url: `/aiCandidateMealWithLines/filters/${filterId}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Get One Record

_Route Type_: get
_Default access route_: _GET_ `/aiCandidateMealWithLines/:id`

### Parameters

| Parameter | Type | Required | Population |
| --------- | ---- | -------- | ---------- |
| id        | ID   | Yes      | path.param |

```js
axios({
  method: "GET",
  url: `/aiCandidateMealWithLines/${id}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

---

## Route: List Records

_Route Definition_: Returns a paginated list from the elastic index.
_Route Type_: list  
_Default access route_: _POST_ `/mealLogWithLines/list`

### Parameters

| Parameter | Type   | Required | Population      |
| --------- | ------ | -------- | --------------- |
| page      | Number | No       | query.page      |
| limit     | Number | No       | query.limit     |
| sortBy    | String | No       | query.sortBy    |
| sortOrder | String | No       | query.sortOrder |
| q         | String | No       | query.q         |
| filters   | Object | Yes      | body            |

```js
axios({
  method: "POST",
  url: `/mealLogWithLines/list`,
  data: {
    filters: "Object",
  },
  params: {
    page: "Number",
    limit: "Number",
    sortBy: "String",
    sortOrder: "String",
    q: "String",
  },
});
```

## The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

_Default access route_: _GET_ `/mealLogWithLines/list`

### Parameters

| Parameter | Type   | Required | Population      |
| --------- | ------ | -------- | --------------- |
| page      | Number | No       | query.page      |
| limit     | Number | No       | query.limit     |
| sortBy    | String | No       | query.sortBy    |
| sortOrder | String | No       | query.sortOrder |
| q         | String | No       | query.q         |

```js
axios({
  method: "GET",
  url: `/mealLogWithLines/list`,
  data: {},
  params: {
    page: "Number",
    limit: "Number",
    sortBy: "String",
    sortOrder: "String",
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Count Records

_Route Definition_: Counts matching documents in the elastic index.
_Route Type_: count  
_Default access route_: _POST_ `/mealLogWithLines/count`

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| q         | String | No       | query.q    |
| filters   | Object | Yes      | body       |

```js
axios({
  method: "POST",
  url: `/mealLogWithLines/count`,
  data: {
    filters: "Object",
  },
  params: {
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

---

_Default access route_: _GET_ `/mealLogWithLines/count`

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| q         | String | No       | query.q    |

```js
axios({
  method: "GET",
  url: `/mealLogWithLines/count`,
  data: {},
  params: {
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Get Index Schema

_Route Definition_: Returns the schema for the elastic index.
_Route Type_: get
_Default access route_: _GET_ `/mealLogWithLines/schema`

```js
axios({
  method: "GET",
  url: `/mealLogWithLines/schema`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Filters

### GET /mealLogWithLines/filters

_Route Type_: get

### Parameters

| Parameter | Type   | Required | Population  |
| --------- | ------ | -------- | ----------- |
| page      | Number | No       | query.page  |
| limit     | Number | No       | query.limit |

```js
axios({
  method: "GET",
  url: `/mealLogWithLines/filters`,
  data: {},
  params: {
    page: "Number",
    limit: "Number",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

### POST /mealLogWithLines/filters

_Route Type_: create

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| filters   | Object | Yes      | body       |

```js
axios({
  method: "POST",
  url: `/mealLogWithLines/filters`,
  data: {
    filters: "Object",
  },
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

### DELETE /mealLogWithLines/filters/:filterId

_Route Type_: delete

### Parameters

| Parameter | Type | Required | Population |
| --------- | ---- | -------- | ---------- |
| filterId  | ID   | Yes      | path.param |

```js
axios({
  method: "DELETE",
  url: `/mealLogWithLines/filters/${filterId}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Get One Record

_Route Type_: get
_Default access route_: _GET_ `/mealLogWithLines/:id`

### Parameters

| Parameter | Type | Required | Population |
| --------- | ---- | -------- | ---------- |
| id        | ID   | Yes      | path.param |

```js
axios({
  method: "GET",
  url: `/mealLogWithLines/${id}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

---

## Route: List Records

_Route Definition_: Returns a paginated list from the elastic index.
_Route Type_: list  
_Default access route_: _POST_ `/aiSessionHistory/list`

### Parameters

| Parameter | Type   | Required | Population      |
| --------- | ------ | -------- | --------------- |
| page      | Number | No       | query.page      |
| limit     | Number | No       | query.limit     |
| sortBy    | String | No       | query.sortBy    |
| sortOrder | String | No       | query.sortOrder |
| q         | String | No       | query.q         |
| filters   | Object | Yes      | body            |

```js
axios({
  method: "POST",
  url: `/aiSessionHistory/list`,
  data: {
    filters: "Object",
  },
  params: {
    page: "Number",
    limit: "Number",
    sortBy: "String",
    sortOrder: "String",
    q: "String",
  },
});
```

## The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

_Default access route_: _GET_ `/aiSessionHistory/list`

### Parameters

| Parameter | Type   | Required | Population      |
| --------- | ------ | -------- | --------------- |
| page      | Number | No       | query.page      |
| limit     | Number | No       | query.limit     |
| sortBy    | String | No       | query.sortBy    |
| sortOrder | String | No       | query.sortOrder |
| q         | String | No       | query.q         |

```js
axios({
  method: "GET",
  url: `/aiSessionHistory/list`,
  data: {},
  params: {
    page: "Number",
    limit: "Number",
    sortBy: "String",
    sortOrder: "String",
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Count Records

_Route Definition_: Counts matching documents in the elastic index.
_Route Type_: count  
_Default access route_: _POST_ `/aiSessionHistory/count`

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| q         | String | No       | query.q    |
| filters   | Object | Yes      | body       |

```js
axios({
  method: "POST",
  url: `/aiSessionHistory/count`,
  data: {
    filters: "Object",
  },
  params: {
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

---

_Default access route_: _GET_ `/aiSessionHistory/count`

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| q         | String | No       | query.q    |

```js
axios({
  method: "GET",
  url: `/aiSessionHistory/count`,
  data: {},
  params: {
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Get Index Schema

_Route Definition_: Returns the schema for the elastic index.
_Route Type_: get
_Default access route_: _GET_ `/aiSessionHistory/schema`

```js
axios({
  method: "GET",
  url: `/aiSessionHistory/schema`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Filters

### GET /aiSessionHistory/filters

_Route Type_: get

### Parameters

| Parameter | Type   | Required | Population  |
| --------- | ------ | -------- | ----------- |
| page      | Number | No       | query.page  |
| limit     | Number | No       | query.limit |

```js
axios({
  method: "GET",
  url: `/aiSessionHistory/filters`,
  data: {},
  params: {
    page: "Number",
    limit: "Number",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

### POST /aiSessionHistory/filters

_Route Type_: create

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| filters   | Object | Yes      | body       |

```js
axios({
  method: "POST",
  url: `/aiSessionHistory/filters`,
  data: {
    filters: "Object",
  },
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

### DELETE /aiSessionHistory/filters/:filterId

_Route Type_: delete

### Parameters

| Parameter | Type | Required | Population |
| --------- | ---- | -------- | ---------- |
| filterId  | ID   | Yes      | path.param |

```js
axios({
  method: "DELETE",
  url: `/aiSessionHistory/filters/${filterId}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Get One Record

_Route Type_: get
_Default access route_: _GET_ `/aiSessionHistory/:id`

### Parameters

| Parameter | Type | Required | Population |
| --------- | ---- | -------- | ---------- |
| id        | ID   | Yes      | path.param |

```js
axios({
  method: "GET",
  url: `/aiSessionHistory/${id}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

---

## Route: List Records

_Route Definition_: Returns a paginated list from the elastic index.
_Route Type_: list  
_Default access route_: _POST_ `/dailyProgressView/list`

### Parameters

| Parameter | Type   | Required | Population      |
| --------- | ------ | -------- | --------------- |
| page      | Number | No       | query.page      |
| limit     | Number | No       | query.limit     |
| sortBy    | String | No       | query.sortBy    |
| sortOrder | String | No       | query.sortOrder |
| q         | String | No       | query.q         |
| filters   | Object | Yes      | body            |

```js
axios({
  method: "POST",
  url: `/dailyProgressView/list`,
  data: {
    filters: "Object",
  },
  params: {
    page: "Number",
    limit: "Number",
    sortBy: "String",
    sortOrder: "String",
    q: "String",
  },
});
```

## The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

_Default access route_: _GET_ `/dailyProgressView/list`

### Parameters

| Parameter | Type   | Required | Population      |
| --------- | ------ | -------- | --------------- |
| page      | Number | No       | query.page      |
| limit     | Number | No       | query.limit     |
| sortBy    | String | No       | query.sortBy    |
| sortOrder | String | No       | query.sortOrder |
| q         | String | No       | query.q         |

```js
axios({
  method: "GET",
  url: `/dailyProgressView/list`,
  data: {},
  params: {
    page: "Number",
    limit: "Number",
    sortBy: "String",
    sortOrder: "String",
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Count Records

_Route Definition_: Counts matching documents in the elastic index.
_Route Type_: count  
_Default access route_: _POST_ `/dailyProgressView/count`

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| q         | String | No       | query.q    |
| filters   | Object | Yes      | body       |

```js
axios({
  method: "POST",
  url: `/dailyProgressView/count`,
  data: {
    filters: "Object",
  },
  params: {
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

---

_Default access route_: _GET_ `/dailyProgressView/count`

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| q         | String | No       | query.q    |

```js
axios({
  method: "GET",
  url: `/dailyProgressView/count`,
  data: {},
  params: {
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Get Index Schema

_Route Definition_: Returns the schema for the elastic index.
_Route Type_: get
_Default access route_: _GET_ `/dailyProgressView/schema`

```js
axios({
  method: "GET",
  url: `/dailyProgressView/schema`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Filters

### GET /dailyProgressView/filters

_Route Type_: get

### Parameters

| Parameter | Type   | Required | Population  |
| --------- | ------ | -------- | ----------- |
| page      | Number | No       | query.page  |
| limit     | Number | No       | query.limit |

```js
axios({
  method: "GET",
  url: `/dailyProgressView/filters`,
  data: {},
  params: {
    page: "Number",
    limit: "Number",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

### POST /dailyProgressView/filters

_Route Type_: create

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| filters   | Object | Yes      | body       |

```js
axios({
  method: "POST",
  url: `/dailyProgressView/filters`,
  data: {
    filters: "Object",
  },
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

### DELETE /dailyProgressView/filters/:filterId

_Route Type_: delete

### Parameters

| Parameter | Type | Required | Population |
| --------- | ---- | -------- | ---------- |
| filterId  | ID   | Yes      | path.param |

```js
axios({
  method: "DELETE",
  url: `/dailyProgressView/filters/${filterId}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Get One Record

_Route Type_: get
_Default access route_: _GET_ `/dailyProgressView/:id`

### Parameters

| Parameter | Type | Required | Population |
| --------- | ---- | -------- | ---------- |
| id        | ID   | Yes      | path.param |

```js
axios({
  method: "GET",
  url: `/dailyProgressView/${id}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

---

## Route: List Records

_Route Definition_: Returns a paginated list from the elastic index.
_Route Type_: list  
_Default access route_: _POST_ `/weeklyAnalyticsView/list`

### Parameters

| Parameter | Type   | Required | Population      |
| --------- | ------ | -------- | --------------- |
| page      | Number | No       | query.page      |
| limit     | Number | No       | query.limit     |
| sortBy    | String | No       | query.sortBy    |
| sortOrder | String | No       | query.sortOrder |
| q         | String | No       | query.q         |
| filters   | Object | Yes      | body            |

```js
axios({
  method: "POST",
  url: `/weeklyAnalyticsView/list`,
  data: {
    filters: "Object",
  },
  params: {
    page: "Number",
    limit: "Number",
    sortBy: "String",
    sortOrder: "String",
    q: "String",
  },
});
```

## The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

_Default access route_: _GET_ `/weeklyAnalyticsView/list`

### Parameters

| Parameter | Type   | Required | Population      |
| --------- | ------ | -------- | --------------- |
| page      | Number | No       | query.page      |
| limit     | Number | No       | query.limit     |
| sortBy    | String | No       | query.sortBy    |
| sortOrder | String | No       | query.sortOrder |
| q         | String | No       | query.q         |

```js
axios({
  method: "GET",
  url: `/weeklyAnalyticsView/list`,
  data: {},
  params: {
    page: "Number",
    limit: "Number",
    sortBy: "String",
    sortOrder: "String",
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Count Records

_Route Definition_: Counts matching documents in the elastic index.
_Route Type_: count  
_Default access route_: _POST_ `/weeklyAnalyticsView/count`

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| q         | String | No       | query.q    |
| filters   | Object | Yes      | body       |

```js
axios({
  method: "POST",
  url: `/weeklyAnalyticsView/count`,
  data: {
    filters: "Object",
  },
  params: {
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

---

_Default access route_: _GET_ `/weeklyAnalyticsView/count`

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| q         | String | No       | query.q    |

```js
axios({
  method: "GET",
  url: `/weeklyAnalyticsView/count`,
  data: {},
  params: {
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Get Index Schema

_Route Definition_: Returns the schema for the elastic index.
_Route Type_: get
_Default access route_: _GET_ `/weeklyAnalyticsView/schema`

```js
axios({
  method: "GET",
  url: `/weeklyAnalyticsView/schema`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Filters

### GET /weeklyAnalyticsView/filters

_Route Type_: get

### Parameters

| Parameter | Type   | Required | Population  |
| --------- | ------ | -------- | ----------- |
| page      | Number | No       | query.page  |
| limit     | Number | No       | query.limit |

```js
axios({
  method: "GET",
  url: `/weeklyAnalyticsView/filters`,
  data: {},
  params: {
    page: "Number",
    limit: "Number",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

### POST /weeklyAnalyticsView/filters

_Route Type_: create

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| filters   | Object | Yes      | body       |

```js
axios({
  method: "POST",
  url: `/weeklyAnalyticsView/filters`,
  data: {
    filters: "Object",
  },
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

### DELETE /weeklyAnalyticsView/filters/:filterId

_Route Type_: delete

### Parameters

| Parameter | Type | Required | Population |
| --------- | ---- | -------- | ---------- |
| filterId  | ID   | Yes      | path.param |

```js
axios({
  method: "DELETE",
  url: `/weeklyAnalyticsView/filters/${filterId}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Get One Record

_Route Type_: get
_Default access route_: _GET_ `/weeklyAnalyticsView/:id`

### Parameters

| Parameter | Type | Required | Population |
| --------- | ---- | -------- | ---------- |
| id        | ID   | Yes      | path.param |

```js
axios({
  method: "GET",
  url: `/weeklyAnalyticsView/${id}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

---

## Route: List Records

_Route Definition_: Returns a paginated list from the elastic index.
_Route Type_: list  
_Default access route_: _POST_ `/monthlyAnalyticsView/list`

### Parameters

| Parameter | Type   | Required | Population      |
| --------- | ------ | -------- | --------------- |
| page      | Number | No       | query.page      |
| limit     | Number | No       | query.limit     |
| sortBy    | String | No       | query.sortBy    |
| sortOrder | String | No       | query.sortOrder |
| q         | String | No       | query.q         |
| filters   | Object | Yes      | body            |

```js
axios({
  method: "POST",
  url: `/monthlyAnalyticsView/list`,
  data: {
    filters: "Object",
  },
  params: {
    page: "Number",
    limit: "Number",
    sortBy: "String",
    sortOrder: "String",
    q: "String",
  },
});
```

## The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

_Default access route_: _GET_ `/monthlyAnalyticsView/list`

### Parameters

| Parameter | Type   | Required | Population      |
| --------- | ------ | -------- | --------------- |
| page      | Number | No       | query.page      |
| limit     | Number | No       | query.limit     |
| sortBy    | String | No       | query.sortBy    |
| sortOrder | String | No       | query.sortOrder |
| q         | String | No       | query.q         |

```js
axios({
  method: "GET",
  url: `/monthlyAnalyticsView/list`,
  data: {},
  params: {
    page: "Number",
    limit: "Number",
    sortBy: "String",
    sortOrder: "String",
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Count Records

_Route Definition_: Counts matching documents in the elastic index.
_Route Type_: count  
_Default access route_: _POST_ `/monthlyAnalyticsView/count`

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| q         | String | No       | query.q    |
| filters   | Object | Yes      | body       |

```js
axios({
  method: "POST",
  url: `/monthlyAnalyticsView/count`,
  data: {
    filters: "Object",
  },
  params: {
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

---

_Default access route_: _GET_ `/monthlyAnalyticsView/count`

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| q         | String | No       | query.q    |

```js
axios({
  method: "GET",
  url: `/monthlyAnalyticsView/count`,
  data: {},
  params: {
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Get Index Schema

_Route Definition_: Returns the schema for the elastic index.
_Route Type_: get
_Default access route_: _GET_ `/monthlyAnalyticsView/schema`

```js
axios({
  method: "GET",
  url: `/monthlyAnalyticsView/schema`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Filters

### GET /monthlyAnalyticsView/filters

_Route Type_: get

### Parameters

| Parameter | Type   | Required | Population  |
| --------- | ------ | -------- | ----------- |
| page      | Number | No       | query.page  |
| limit     | Number | No       | query.limit |

```js
axios({
  method: "GET",
  url: `/monthlyAnalyticsView/filters`,
  data: {},
  params: {
    page: "Number",
    limit: "Number",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

### POST /monthlyAnalyticsView/filters

_Route Type_: create

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| filters   | Object | Yes      | body       |

```js
axios({
  method: "POST",
  url: `/monthlyAnalyticsView/filters`,
  data: {
    filters: "Object",
  },
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

### DELETE /monthlyAnalyticsView/filters/:filterId

_Route Type_: delete

### Parameters

| Parameter | Type | Required | Population |
| --------- | ---- | -------- | ---------- |
| filterId  | ID   | Yes      | path.param |

```js
axios({
  method: "DELETE",
  url: `/monthlyAnalyticsView/filters/${filterId}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Get One Record

_Route Type_: get
_Default access route_: _GET_ `/monthlyAnalyticsView/:id`

### Parameters

| Parameter | Type | Required | Population |
| --------- | ---- | -------- | ---------- |
| id        | ID   | Yes      | path.param |

```js
axios({
  method: "GET",
  url: `/monthlyAnalyticsView/${id}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

---

## Route: List Records

_Route Definition_: Returns a paginated list from the elastic index.
_Route Type_: list  
_Default access route_: _POST_ `/dailyNutritionSummaryNotificationView/list`

### Parameters

| Parameter | Type   | Required | Population      |
| --------- | ------ | -------- | --------------- |
| page      | Number | No       | query.page      |
| limit     | Number | No       | query.limit     |
| sortBy    | String | No       | query.sortBy    |
| sortOrder | String | No       | query.sortOrder |
| q         | String | No       | query.q         |
| filters   | Object | Yes      | body            |

```js
axios({
  method: "POST",
  url: `/dailyNutritionSummaryNotificationView/list`,
  data: {
    filters: "Object",
  },
  params: {
    page: "Number",
    limit: "Number",
    sortBy: "String",
    sortOrder: "String",
    q: "String",
  },
});
```

## The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

_Default access route_: _GET_ `/dailyNutritionSummaryNotificationView/list`

### Parameters

| Parameter | Type   | Required | Population      |
| --------- | ------ | -------- | --------------- |
| page      | Number | No       | query.page      |
| limit     | Number | No       | query.limit     |
| sortBy    | String | No       | query.sortBy    |
| sortOrder | String | No       | query.sortOrder |
| q         | String | No       | query.q         |

```js
axios({
  method: "GET",
  url: `/dailyNutritionSummaryNotificationView/list`,
  data: {},
  params: {
    page: "Number",
    limit: "Number",
    sortBy: "String",
    sortOrder: "String",
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Count Records

_Route Definition_: Counts matching documents in the elastic index.
_Route Type_: count  
_Default access route_: _POST_ `/dailyNutritionSummaryNotificationView/count`

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| q         | String | No       | query.q    |
| filters   | Object | Yes      | body       |

```js
axios({
  method: "POST",
  url: `/dailyNutritionSummaryNotificationView/count`,
  data: {
    filters: "Object",
  },
  params: {
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

---

_Default access route_: _GET_ `/dailyNutritionSummaryNotificationView/count`

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| q         | String | No       | query.q    |

```js
axios({
  method: "GET",
  url: `/dailyNutritionSummaryNotificationView/count`,
  data: {},
  params: {
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Get Index Schema

_Route Definition_: Returns the schema for the elastic index.
_Route Type_: get
_Default access route_: _GET_ `/dailyNutritionSummaryNotificationView/schema`

```js
axios({
  method: "GET",
  url: `/dailyNutritionSummaryNotificationView/schema`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Filters

### GET /dailyNutritionSummaryNotificationView/filters

_Route Type_: get

### Parameters

| Parameter | Type   | Required | Population  |
| --------- | ------ | -------- | ----------- |
| page      | Number | No       | query.page  |
| limit     | Number | No       | query.limit |

```js
axios({
  method: "GET",
  url: `/dailyNutritionSummaryNotificationView/filters`,
  data: {},
  params: {
    page: "Number",
    limit: "Number",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

### POST /dailyNutritionSummaryNotificationView/filters

_Route Type_: create

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| filters   | Object | Yes      | body       |

```js
axios({
  method: "POST",
  url: `/dailyNutritionSummaryNotificationView/filters`,
  data: {
    filters: "Object",
  },
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

### DELETE /dailyNutritionSummaryNotificationView/filters/:filterId

_Route Type_: delete

### Parameters

| Parameter | Type | Required | Population |
| --------- | ---- | -------- | ---------- |
| filterId  | ID   | Yes      | path.param |

```js
axios({
  method: "DELETE",
  url: `/dailyNutritionSummaryNotificationView/filters/${filterId}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Get One Record

_Route Type_: get
_Default access route_: _GET_ `/dailyNutritionSummaryNotificationView/:id`

### Parameters

| Parameter | Type | Required | Population |
| --------- | ---- | -------- | ---------- |
| id        | ID   | Yes      | path.param |

```js
axios({
  method: "GET",
  url: `/dailyNutritionSummaryNotificationView/${id}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

---

## Route: List Records

_Route Definition_: Returns a paginated list from the elastic index.
_Route Type_: list  
_Default access route_: _POST_ `/dailyMealReminderNotificationView/list`

### Parameters

| Parameter | Type   | Required | Population      |
| --------- | ------ | -------- | --------------- |
| page      | Number | No       | query.page      |
| limit     | Number | No       | query.limit     |
| sortBy    | String | No       | query.sortBy    |
| sortOrder | String | No       | query.sortOrder |
| q         | String | No       | query.q         |
| filters   | Object | Yes      | body            |

```js
axios({
  method: "POST",
  url: `/dailyMealReminderNotificationView/list`,
  data: {
    filters: "Object",
  },
  params: {
    page: "Number",
    limit: "Number",
    sortBy: "String",
    sortOrder: "String",
    q: "String",
  },
});
```

## The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

_Default access route_: _GET_ `/dailyMealReminderNotificationView/list`

### Parameters

| Parameter | Type   | Required | Population      |
| --------- | ------ | -------- | --------------- |
| page      | Number | No       | query.page      |
| limit     | Number | No       | query.limit     |
| sortBy    | String | No       | query.sortBy    |
| sortOrder | String | No       | query.sortOrder |
| q         | String | No       | query.q         |

```js
axios({
  method: "GET",
  url: `/dailyMealReminderNotificationView/list`,
  data: {},
  params: {
    page: "Number",
    limit: "Number",
    sortBy: "String",
    sortOrder: "String",
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Count Records

_Route Definition_: Counts matching documents in the elastic index.
_Route Type_: count  
_Default access route_: _POST_ `/dailyMealReminderNotificationView/count`

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| q         | String | No       | query.q    |
| filters   | Object | Yes      | body       |

```js
axios({
  method: "POST",
  url: `/dailyMealReminderNotificationView/count`,
  data: {
    filters: "Object",
  },
  params: {
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

---

_Default access route_: _GET_ `/dailyMealReminderNotificationView/count`

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| q         | String | No       | query.q    |

```js
axios({
  method: "GET",
  url: `/dailyMealReminderNotificationView/count`,
  data: {},
  params: {
    q: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Get Index Schema

_Route Definition_: Returns the schema for the elastic index.
_Route Type_: get
_Default access route_: _GET_ `/dailyMealReminderNotificationView/schema`

```js
axios({
  method: "GET",
  url: `/dailyMealReminderNotificationView/schema`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Filters

### GET /dailyMealReminderNotificationView/filters

_Route Type_: get

### Parameters

| Parameter | Type   | Required | Population  |
| --------- | ------ | -------- | ----------- |
| page      | Number | No       | query.page  |
| limit     | Number | No       | query.limit |

```js
axios({
  method: "GET",
  url: `/dailyMealReminderNotificationView/filters`,
  data: {},
  params: {
    page: "Number",
    limit: "Number",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

### POST /dailyMealReminderNotificationView/filters

_Route Type_: create

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| filters   | Object | Yes      | body       |

```js
axios({
  method: "POST",
  url: `/dailyMealReminderNotificationView/filters`,
  data: {
    filters: "Object",
  },
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

### DELETE /dailyMealReminderNotificationView/filters/:filterId

_Route Type_: delete

### Parameters

| Parameter | Type | Required | Population |
| --------- | ---- | -------- | ---------- |
| filterId  | ID   | Yes      | path.param |

```js
axios({
  method: "DELETE",
  url: `/dailyMealReminderNotificationView/filters/${filterId}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

## Route: Get One Record

_Route Type_: get
_Default access route_: _GET_ `/dailyMealReminderNotificationView/:id`

### Parameters

| Parameter | Type | Required | Population |
| --------- | ---- | -------- | ---------- |
| id        | ID   | Yes      | path.param |

```js
axios({
  method: "GET",
  url: `/dailyMealReminderNotificationView/${id}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a "status": "OK" property.

---
