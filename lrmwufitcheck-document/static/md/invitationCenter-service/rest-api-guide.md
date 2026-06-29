 

# REST API GUIDE 
## fitcheck-invitationcenter-service
**Version:** `1.0.1`

Manages invite-only onboarding links for platform operators, including creation, activation, delivery, validation, and audit tracking of unique registration invite tokens.

## Architectural Design Credit and Contact Information

The architectural design of this microservice is credited to . 
For inquiries, feedback, or further information regarding the architecture, please direct your communication to:

Email: 

We encourage open communication and welcome any questions or discussions related to the architectural aspects of this microservice.

## Documentation Scope

Welcome to the official documentation for the InvitationCenter Service's REST API. This document is designed to provide a comprehensive guide to interfacing with our InvitationCenter Service exclusively through RESTful API endpoints.

**Intended Audience**

This documentation is intended for developers and integrators who are looking to interact with the InvitationCenter Service via HTTP requests for purposes such as creating, updating, deleting and querying InvitationCenter objects.

**Overview**

Within these pages, you will find detailed information on how to effectively utilize the REST API, including authentication methods, request and response formats, endpoint descriptions, and examples of common use cases.

Beyond REST
It's important to note that the InvitationCenter Service also supports alternative methods of interaction, such as gRPC and messaging via a Message Broker. These communication methods are beyond the scope of this document. For information regarding these protocols, please refer to their respective documentation.

## Authentication And Authorization

To ensure secure access to the InvitationCenter service's protected endpoints, a project-wide access token is required. This token serves as the primary method for authenticating requests to our service. However, it's important to note that access control varies across different routes:

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
This section outlines the API endpoints available within the InvitationCenter service. Each endpoint can receive parameters through various methods, meticulously described in the following definitions. It's important to understand the flexibility in how parameters can be included in requests to effectively interact with the InvitationCenter service.

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

* **Preview:** `https://lrmwufitcheck.preview.mindbricks.com/invitationcenter-api`
* **Staging:** `https://lrmwufitcheck-stage.mindbricks.co/invitationcenter-api`
* **Production:** `https://lrmwufitcheck.mindbricks.co/invitationcenter-api`

**Parameter Inclusion Methods:**
Parameters can be incorporated into API requests in several ways, each with its designated location. Understanding these methods is crucial for correctly constructing your requests:

**Query Parameters:** Included directly in the URL's query string.

**Path Parameters:** Embedded within the URL's path.

**Body Parameters:** Sent within the JSON body of the request.

**Session Parameters:** Automatically read from the session object. This method is used for parameters that are intrinsic to the user's session, such as userId. When using an API that involves session parameters, you can omit these from your request. The service will automatically bind them to the API layer, provided that a session is associated with your request.

**Note on Session Parameters:**
Session parameters represent a unique method of parameter inclusion, relying on the context of the user's session. A common example of a session parameter is userId, which the service automatically associates with your request when a session exists. This feature ensures seamless integration of user-specific data without manual input for each request.

By adhering to the specified parameter inclusion methods, you can effectively utilize the InvitationCenter service's API endpoints. For detailed information on each endpoint, including required parameters and their accepted locations, refer to the individual API definitions below.

### Common Parameters

The `InvitationCenter` service's business API support several common parameters designed to modify and enhance the behavior of API requests. These parameters are not individually listed in the API route definitions to avoid repetition. Instead, refer to this section to understand how to leverage these common behaviors across different routes. Note that all common parameters should be included in the query part of the URL.

### Supported Common Parameters:

- **getJoins (BOOLEAN)**: Controls whether to retrieve associated objects along with the main object. By default, `getJoins` is assumed to be `true`. Set it to `false` if you prefer to receive only the main fields of an object, excluding its associations.

- **excludeCQRS (BOOLEAN)**: Applicable only when `getJoins` is `true`. By default, `excludeCQRS` is set to `false`. Enabling this parameter (`true`) omits non-local associations, which are typically more resource-intensive as they require querying external services like ElasticSearch for additional information. Use this to optimize response times and resource usage.

- **requestId (String)**: Identifies a request to enable tracking through the service's log chain. A random hex string of 32 characters is assigned by default. If you wish to use a custom `requestId`, simply include it in your query parameters.

- **caching (BOOLEAN)**: Determines the use of caching for query API. By default, caching is enabled (`true`). To ensure the freshest data directly from the database, set this parameter to `false`, bypassing the cache.

- **cacheTTL (Integer)**: Specifies the Time-To-Live (TTL) for query caching, in seconds. This is particularly useful for adjusting the default caching duration (5 minutes) for `get list` queries. Setting a custom `cacheTTL` allows you to fine-tune the cache lifespan to meet your needs.

- **pageNumber (Integer)**: For paginated `get list` API's, this parameter selects which page of results to retrieve. The default is `1`, indicating the first page. To disable pagination and retrieve all results, set `pageNumber` to `0`.

- **pageRowCount (Integer)**: In conjunction with paginated API's, this parameter defines the number of records per page. The default value is `25`. Adjusting `pageRowCount` allows you to control the volume of data returned in a single request.

By utilizing these common parameters, you can tailor the behavior of API requests to suit your specific requirements, ensuring optimal performance and usability of the `InvitationCenter` service.


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

When the `InvitationCenter` service processes requests successfully, it wraps the requested resource(s) within a JSON envelope. This envelope not only contains the data but also includes essential metadata, such as configuration details and pagination information, to enrich the response and provide context to the client.

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
InvitationCenter service provides the following resources which are stored in its own database as a data object. Note that a resource for an api access is a data object for the service.

### InviteLink resource

*Resource Definition* : Stores a unique invite registration token with usage rules, lifecycle state, delivery tracking, and a reference to the registered user created as a result of the invite.
*InviteLink Resource Properties* 
| Name | Type | Required | Default | Definition | 
| ---- | ---- | -------- | ------- | ---------- |
| **ownerUserId** | ID |  |  | ** |
| **inviteCode** | String |  |  | ** |
| **invitedEmail** | String |  |  | ** |
| **usageMode** | Enum |  |  | ** |
| **usageLimit** | Integer |  |  | ** |
| **usageCount** | Integer |  |  | ** |
| **inviteState** | Enum |  |  | ** |
| **expiresAt** | Date |  |  | ** |
| **lastUsedAt** | Date |  |  | ** |
| **registeredUserId** | ID |  |  | ** |
| **deliveryRequestedAt** | Date |  |  | ** |
| **lastDeliveredAt** | Date |  |  | ** |
#### Enum Properties
Enum properties are represented as strings in the database. The values are mapped to their corresponding names in the application layer.
##### usageMode Enum Property
*Enum Options*
| Name | Value | Index | 
| ---- | ----- | ----- |
| **singleUse** | `"singleUse""` | 0 | 
| **limitedUse** | `"limitedUse""` | 1 | 
##### inviteState Enum Property
*Enum Options*
| Name | Value | Index | 
| ---- | ----- | ----- |
| **draft** | `"draft""` | 0 | 
| **active** | `"active""` | 1 | 
| **exhausted** | `"exhausted""` | 2 | 
| **revoked** | `"revoked""` | 3 | 
| **expired** | `"expired""` | 4 | 
| **consumed** | `"consumed""` | 5 | 
### InviteAudit resource

*Resource Definition* : Append-only audit log capturing every lifecycle event on an invite link, including who acted, what happened, and optional contextual notes.
*InviteAudit Resource Properties* 
| Name | Type | Required | Default | Definition | 
| ---- | ---- | -------- | ------- | ---------- |
| **inviteLinkId** | ID |  |  | ** |
| **eventType** | Enum |  |  | ** |
| **eventAt** | Date |  |  | ** |
| **actorUserId** | ID |  |  | ** |
| **eventNote** | String |  |  | ** |
| **relatedEmail** | String |  |  | ** |
#### Enum Properties
Enum properties are represented as strings in the database. The values are mapped to their corresponding names in the application layer.
##### eventType Enum Property
*Enum Options*
| Name | Value | Index | 
| ---- | ----- | ----- |
| **created** | `"created""` | 0 | 
| **activated** | `"activated""` | 1 | 
| **delivered** | `"delivered""` | 2 | 
| **validated** | `"validated""` | 3 | 
| **consumed** | `"consumed""` | 4 | 
| **revoked** | `"revoked""` | 5 | 
| **expired** | `"expired""` | 6 | 
## Business Api
### `Create Invitelink` API
**[Default create API]** — This is the designated default `create` API for the `inviteLink` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
Creates a new invite link with a generated unique code. Restricted to admins. The invite starts in 'draft' state and must be explicitly activated before use.

**API Frontend Description By The Backend Architect**

Triggered from the admin invite management panel via a 'Create Invite' button. Opens a modal/slide-over form. `usageLimit` field should be shown conditionally (only when `usageMode === 'limitedUse'`). `sellerId`/`ownerUserId` is auto-populated from session — do NOT show in form. On 201: close modal, refresh list, toast 'Invite link created'. On 400: show inline validation errors.

**Rest Route**

The `createInviteLink` API REST controller can be triggered via the following route:

`/v1/invite-links`


**Rest Request Parameters**


The `createInviteLink` api has got 4 regular request parameters  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| invitedEmail  | String  | false | request.body?.["invitedEmail"] |
| usageMode  | Enum  | true | request.body?.["usageMode"] |
| usageLimit  | Integer  | false | request.body?.["usageLimit"] |
| expiresAt  | Date  | false | request.body?.["expiresAt"] |
**invitedEmail** : Optional intended recipient email address
**usageMode** : Whether the invite can be used once (singleUse) or a limited number of times (limitedUse)
**usageLimit** : Maximum number of allowed uses; required when usageMode=limitedUse
**expiresAt** : Optional expiry date; null means no expiry



**REST Request**
To access the api you can use the **REST** controller with the path **POST  /v1/invite-links**
```js
  axios({
    method: 'POST',
    url: '/v1/invite-links',
    data: {
            invitedEmail:"String",  
            usageMode:"Enum",  
            usageLimit:"Integer",  
            expiresAt:"Date",  
    
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
	"dataName": "inviteLink",
	"method": "POST",
	"action": "create",
	"appVersion": "Version",
	"rowCount": 1,
	"inviteLink": {
		"id": "ID",
		"ownerUserId": "ID",
		"inviteCode": "String",
		"invitedEmail": "String",
		"usageMode": "Enum",
		"usageMode_idx": "Integer",
		"usageLimit": "Integer",
		"usageCount": "Integer",
		"inviteState": "Enum",
		"inviteState_idx": "Integer",
		"expiresAt": "Date",
		"lastUsedAt": "Date",
		"registeredUserId": "ID",
		"deliveryRequestedAt": "Date",
		"lastDeliveredAt": "Date",
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"isActive": true
	}
}
```


### `Activate Invitelink` API
Transitions an invite link from 'draft' to 'active' state, making it usable for registration. Only invite links in 'draft' state can be activated.

**API Frontend Description By The Backend Architect**

Triggered from the invite list or detail view via an 'Activate' action button (shown only when inviteState='draft'). No form input needed — just a confirmation dialog. On 200: update the status badge inline or refresh row. Toast 'Invite link activated'. On 400: toast 'Invite link is not in draft state'.

**Rest Route**

The `activateInviteLink` API REST controller can be triggered via the following route:

`/v1/invite-links/:inviteLinkId/activate`


**Rest Request Parameters**


The `activateInviteLink` api has got 1 regular request parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| inviteLinkId  | ID  | true | request.params?.["inviteLinkId"] |
**inviteLinkId** : This id paremeter is used to select the required data object that will be updated



**REST Request**
To access the api you can use the **REST** controller with the path **PATCH  /v1/invite-links/:inviteLinkId/activate**
```js
  axios({
    method: 'PATCH',
    url: `/v1/invite-links/${inviteLinkId}/activate`,
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
	"dataName": "inviteLink",
	"method": "PATCH",
	"action": "update",
	"appVersion": "Version",
	"rowCount": 1,
	"inviteLink": {
		"id": "ID",
		"ownerUserId": "ID",
		"inviteCode": "String",
		"invitedEmail": "String",
		"usageMode": "Enum",
		"usageMode_idx": "Integer",
		"usageLimit": "Integer",
		"usageCount": "Integer",
		"inviteState": "Enum",
		"inviteState_idx": "Integer",
		"expiresAt": "Date",
		"lastUsedAt": "Date",
		"registeredUserId": "ID",
		"deliveryRequestedAt": "Date",
		"lastDeliveredAt": "Date",
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"isActive": true
	}
}
```


### `Revoke Invitelink` API
Revokes an invite link, preventing further use. Only invite links in 'draft' or 'active' states can be revoked. An optional reason note can be provided.

**API Frontend Description By The Backend Architect**

Triggered from the invite list or detail view via a 'Revoke' action button (shown when inviteState is 'draft' or 'active'). Opens a small confirmation dialog with optional 'Reason' text input. On 200: update badge to 'revoked'. Toast 'Invite link revoked'. On 400: toast with server error message.

**Rest Route**

The `revokeInviteLink` API REST controller can be triggered via the following route:

`/v1/invite-links/:inviteLinkId/revoke`


**Rest Request Parameters**


The `revokeInviteLink` api has got 2 regular request parameters  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| inviteLinkId  | ID  | true | request.params?.["inviteLinkId"] |
| eventNote  | String  | false | request.body?.["eventNote"] |
**inviteLinkId** : This id paremeter is used to select the required data object that will be updated
**eventNote** : Optional reason for revocation



**REST Request**
To access the api you can use the **REST** controller with the path **PATCH  /v1/invite-links/:inviteLinkId/revoke**
```js
  axios({
    method: 'PATCH',
    url: `/v1/invite-links/${inviteLinkId}/revoke`,
    data: {
            eventNote:"String",  
    
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
	"dataName": "inviteLink",
	"method": "PATCH",
	"action": "update",
	"appVersion": "Version",
	"rowCount": 1,
	"inviteLink": {
		"id": "ID",
		"ownerUserId": "ID",
		"inviteCode": "String",
		"invitedEmail": "String",
		"usageMode": "Enum",
		"usageMode_idx": "Integer",
		"usageLimit": "Integer",
		"usageCount": "Integer",
		"inviteState": "Enum",
		"inviteState_idx": "Integer",
		"expiresAt": "Date",
		"lastUsedAt": "Date",
		"registeredUserId": "ID",
		"deliveryRequestedAt": "Date",
		"lastDeliveredAt": "Date",
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"isActive": true
	}
}
```


### `Deliver Inviteemail` API
Triggers email delivery of an active invite link to its intended recipient. Sets deliveryRequestedAt and publishes a Kafka event for the notification service to handle. The invite must be in 'active' state and must have an invitedEmail set.

**API Frontend Description By The Backend Architect**

Triggered from the invite detail view via a 'Send Email' button (shown when inviteState='active' and invitedEmail is set). No form input. On 200: show 'Email delivery requested' toast and update `deliveryRequestedAt` display. On 400: show inline error from server.

**Rest Route**

The `deliverInviteEmail` API REST controller can be triggered via the following route:

`/v1/invite-links/:inviteLinkId/deliver`


**Rest Request Parameters**


The `deliverInviteEmail` api has got 1 regular request parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| inviteLinkId  | ID  | true | request.params?.["inviteLinkId"] |
**inviteLinkId** : This id paremeter is used to select the required data object that will be updated



**REST Request**
To access the api you can use the **REST** controller with the path **POST  /v1/invite-links/:inviteLinkId/deliver**
```js
  axios({
    method: 'POST',
    url: `/v1/invite-links/${inviteLinkId}/deliver`,
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
	"dataName": "inviteLink",
	"method": "POST",
	"action": "update",
	"appVersion": "Version",
	"rowCount": 1,
	"inviteLink": {
		"id": "ID",
		"ownerUserId": "ID",
		"inviteCode": "String",
		"invitedEmail": "String",
		"usageMode": "Enum",
		"usageMode_idx": "Integer",
		"usageLimit": "Integer",
		"usageCount": "Integer",
		"inviteState": "Enum",
		"inviteState_idx": "Integer",
		"expiresAt": "Date",
		"lastUsedAt": "Date",
		"registeredUserId": "ID",
		"deliveryRequestedAt": "Date",
		"lastDeliveredAt": "Date",
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"isActive": true
	}
}
```


### `Validate Invitecode` API
Public endpoint that validates an invite code, increments its usage count, and updates its state. Used by the registration flow before creating a new user account. Raises an API event on success.

**API Frontend Description By The Backend Architect**

Called by the frontend registration page after the user submits their invite code. If the invite is valid, proceed to the account creation form. On 400 with 'expired': show 'This invite link has expired'. On 400 with 'limit reached': show 'This invite has already been used the maximum number of times'. On 404 (no active record found): show 'Invalid or inactive invite code'.

**Rest Route**

The `validateInviteCode` API REST controller can be triggered via the following route:

`/v1/invite-links/validate`


**Rest Request Parameters**


The `validateInviteCode` api has got 1 regular request parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| inviteCode  | String  | true | request.body?.["inviteCode"] |
**inviteCode** : The unique invite token to validate



**REST Request**
To access the api you can use the **REST** controller with the path **POST  /v1/invite-links/validate**
```js
  axios({
    method: 'POST',
    url: '/v1/invite-links/validate',
    data: {
            inviteCode:"String",  
    
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
	"dataName": "inviteLink",
	"method": "POST",
	"action": "update",
	"appVersion": "Version",
	"rowCount": 1,
	"inviteLink": {
		"id": "ID",
		"ownerUserId": "ID",
		"inviteCode": "String",
		"invitedEmail": "String",
		"usageMode": "Enum",
		"usageMode_idx": "Integer",
		"usageLimit": "Integer",
		"usageCount": "Integer",
		"inviteState": "Enum",
		"inviteState_idx": "Integer",
		"expiresAt": "Date",
		"lastUsedAt": "Date",
		"registeredUserId": "ID",
		"deliveryRequestedAt": "Date",
		"lastDeliveredAt": "Date",
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"isActive": true
	}
}
```


### `Consume Invitelink` API
Marks an invite link as consumed and records the registered user ID. Called by the auth service or an admin workflow after successful user registration. Raises an API event.

**API Frontend Description By The Backend Architect**

This is a machine-to-machine or admin-only operation — not directly user-triggered. No dedicated UI form. In the admin audit view it appears as a 'consumed' event in the timeline. After calling this API, the invite detail should show `registeredUserId` as a linked user.

**Rest Route**

The `consumeInviteLink` API REST controller can be triggered via the following route:

`/v1/invite-links/:inviteLinkId/consume`


**Rest Request Parameters**


The `consumeInviteLink` api has got 3 regular request parameters  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| inviteLinkId  | ID  | true | request.params?.["inviteLinkId"] |
| registeredUserId  | ID  | true | request.body?.["registeredUserId"] |
| relatedEmail  | String  | false | request.body?.["relatedEmail"] |
**inviteLinkId** : This id paremeter is used to select the required data object that will be updated
**registeredUserId** : The auth user id created from this invite
**relatedEmail** : Registered email for audit record



**REST Request**
To access the api you can use the **REST** controller with the path **PATCH  /v1/invite-links/:inviteLinkId/consume**
```js
  axios({
    method: 'PATCH',
    url: `/v1/invite-links/${inviteLinkId}/consume`,
    data: {
            registeredUserId:"ID",  
            relatedEmail:"String",  
    
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
	"dataName": "inviteLink",
	"method": "PATCH",
	"action": "update",
	"appVersion": "Version",
	"rowCount": 1,
	"inviteLink": {
		"id": "ID",
		"ownerUserId": "ID",
		"inviteCode": "String",
		"invitedEmail": "String",
		"usageMode": "Enum",
		"usageMode_idx": "Integer",
		"usageLimit": "Integer",
		"usageCount": "Integer",
		"inviteState": "Enum",
		"inviteState_idx": "Integer",
		"expiresAt": "Date",
		"lastUsedAt": "Date",
		"registeredUserId": "ID",
		"deliveryRequestedAt": "Date",
		"lastDeliveredAt": "Date",
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"isActive": true
	}
}
```


### `Get Invitelinkbycode` API
Public endpoint to fetch invite link metadata by its unique code. Used by the registration page to display invite details before the user fills in their credentials.

**API Frontend Description By The Backend Architect**

Called automatically on the `/register?code=<inviteCode>` page load. No user action required. Display invite metadata: `invitedEmail` (pre-fill the email input), `usageMode` badge, `expiresAt` (show 'No expiry' if null). If 404: show a full-page 'Invalid invite link' error with a link to contact support.

**Rest Route**

The `getInviteLinkByCode` API REST controller can be triggered via the following route:

`/v1/invite-links/by-code/:inviteCode`


**Rest Request Parameters**


The `getInviteLinkByCode` api has got 1 regular request parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| inviteCode  | String  | true | request.params?.["inviteCode"] |
**inviteCode** : This parameter will be used to select the data object that is queried



**REST Request**
To access the api you can use the **REST** controller with the path **GET  /v1/invite-links/by-code/:inviteCode**
```js
  axios({
    method: 'GET',
    url: `/v1/invite-links/by-code/${inviteCode}`,
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
	"dataName": "inviteLink",
	"method": "GET",
	"action": "get",
	"appVersion": "Version",
	"rowCount": 1,
	"inviteLink": {
		"id": "ID",
		"ownerUserId": "ID",
		"inviteCode": "String",
		"invitedEmail": "String",
		"usageMode": "Enum",
		"usageMode_idx": "Integer",
		"usageLimit": "Integer",
		"usageCount": "Integer",
		"inviteState": "Enum",
		"inviteState_idx": "Integer",
		"expiresAt": "Date",
		"lastUsedAt": "Date",
		"registeredUserId": "ID",
		"deliveryRequestedAt": "Date",
		"lastDeliveredAt": "Date",
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"isActive": true
	}
}
```


### `Get Invitelink` API
**[Default get API]** — This is the designated default `get` API for the `inviteLink` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
Admin endpoint to fetch a single invite link by its ID.

**API Frontend Description By The Backend Architect**

Used when navigating to the invite detail view (`/admin/invites/:inviteLinkId`). Loads the full invite record for display. Show all fields including audit trail (loaded separately via listInviteAudits filtered by inviteLinkId).

**Rest Route**

The `getInviteLink` API REST controller can be triggered via the following route:

`/v1/invite-links/:inviteLinkId`


**Rest Request Parameters**


The `getInviteLink` api has got 1 regular request parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| inviteLinkId  | ID  | true | request.params?.["inviteLinkId"] |
**inviteLinkId** : This id paremeter is used to query the required data object.



**REST Request**
To access the api you can use the **REST** controller with the path **GET  /v1/invite-links/:inviteLinkId**
```js
  axios({
    method: 'GET',
    url: `/v1/invite-links/${inviteLinkId}`,
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
	"dataName": "inviteLink",
	"method": "GET",
	"action": "get",
	"appVersion": "Version",
	"rowCount": 1,
	"inviteLink": {
		"id": "ID",
		"ownerUserId": "ID",
		"inviteCode": "String",
		"invitedEmail": "String",
		"usageMode": "Enum",
		"usageMode_idx": "Integer",
		"usageLimit": "Integer",
		"usageCount": "Integer",
		"inviteState": "Enum",
		"inviteState_idx": "Integer",
		"expiresAt": "Date",
		"lastUsedAt": "Date",
		"registeredUserId": "ID",
		"deliveryRequestedAt": "Date",
		"lastDeliveredAt": "Date",
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID",
		"isActive": true
	}
}
```


### `List Invitelinks` API
**[Default list API]** — This is the designated default `list` API for the `inviteLink` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
Admin endpoint to list all invite links with optional filtering by usageMode and inviteState (auto-filter parameters).

**API Frontend Description By The Backend Architect**

Renders the admin invite management table. Filters are exposed as query params: `?usageMode=singleUse` and/or `?inviteState=active`. Sort by `createdAt` descending (newest first). Default page size 20. Empty state: 'No invite links found — try adjusting filters or create a new invite.'

**Rest Route**

The `listInviteLinks` API REST controller can be triggered via the following route:

`/v1/invite-links`


**Rest Request Parameters**



**Filter Parameters**

The `listInviteLinks` api supports 2 optional filter parameters for filtering list results:

**usageMode** (`Enum`): Filter by usageMode

- Single: `?usageMode=<value>` (case-insensitive)
- Multiple: `?usageMode=<value1>&usageMode=<value2>`
- Null: `?usageMode=null`


**inviteState** (`Enum`): Filter by inviteState

- Single: `?inviteState=<value>` (case-insensitive)
- Multiple: `?inviteState=<value1>&inviteState=<value2>`
- Null: `?inviteState=null`



**REST Request**
To access the api you can use the **REST** controller with the path **GET  /v1/invite-links**
```js
  axios({
    method: 'GET',
    url: '/v1/invite-links',
    data: {
    
    },
    params: {
    
        // Filter parameters (see Filter Parameters section above)
        // usageMode: '<value>' // Filter by usageMode
        // inviteState: '<value>' // Filter by inviteState
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
	"dataName": "inviteLinks",
	"method": "GET",
	"action": "list",
	"appVersion": "Version",
	"rowCount": "\"Number\"",
	"inviteLinks": [
		{
			"id": "ID",
			"ownerUserId": "ID",
			"inviteCode": "String",
			"invitedEmail": "String",
			"usageMode": "Enum",
			"usageMode_idx": "Integer",
			"usageLimit": "Integer",
			"usageCount": "Integer",
			"inviteState": "Enum",
			"inviteState_idx": "Integer",
			"expiresAt": "Date",
			"lastUsedAt": "Date",
			"registeredUserId": "ID",
			"deliveryRequestedAt": "Date",
			"lastDeliveredAt": "Date",
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


### `List Inviteaudits` API
**[Default list API]** — This is the designated default `list` API for the `inviteAudit` data object. Frontend generators and AI agents should use this API for standard CRUD operations.
Admin endpoint to list audit log entries for invite links. Filterable by inviteLinkId and eventType.

**API Frontend Description By The Backend Architect**

Loaded in the invite detail drawer/sub-panel. Always called with `?inviteLinkId=<id>` filter to show the audit trail for a specific invite. Displayed as a timeline (oldest first). If loading the full audit list in the admin view without a specific invite, no inviteLinkId filter is applied — admins can see all events.

**Rest Route**

The `listInviteAudits` API REST controller can be triggered via the following route:

`/v1/invite-audits`


**Rest Request Parameters**



**Filter Parameters**

The `listInviteAudits` api supports 2 optional filter parameters for filtering list results:

**inviteLinkId** (`ID`): Filter by inviteLinkId

- Single: `?inviteLinkId=<value>`
- Multiple: `?inviteLinkId=<value1>&inviteLinkId=<value2>`
- Null: `?inviteLinkId=null`


**eventType** (`Enum`): Filter by eventType

- Single: `?eventType=<value>` (case-insensitive)
- Multiple: `?eventType=<value1>&eventType=<value2>`
- Null: `?eventType=null`



**REST Request**
To access the api you can use the **REST** controller with the path **GET  /v1/invite-audits**
```js
  axios({
    method: 'GET',
    url: '/v1/invite-audits',
    data: {
    
    },
    params: {
    
        // Filter parameters (see Filter Parameters section above)
        // inviteLinkId: '<value>' // Filter by inviteLinkId
        // eventType: '<value>' // Filter by eventType
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
	"dataName": "inviteAudits",
	"method": "GET",
	"action": "list",
	"appVersion": "Version",
	"rowCount": "\"Number\"",
	"inviteAudits": [
		{
			"id": "ID",
			"inviteLinkId": "ID",
			"eventType": "Enum",
			"eventType_idx": "Integer",
			"eventAt": "Date",
			"actorUserId": "ID",
			"eventNote": "String",
			"relatedEmail": "String",
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
