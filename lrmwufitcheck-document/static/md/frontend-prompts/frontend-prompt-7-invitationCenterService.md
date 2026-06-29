

# **FITCHECK**

**FRONTEND GUIDE FOR AI CODING AGENTS - PART 7 - InvitationCenter Service**

This document is a part of a REST API guide for the fitcheck project.
It is designed for AI agents that will generate frontend code to consume the project’s backend.

This document provides extensive instruction for the usage of invitationCenter

## Service Access

InvitationCenter service management is handled through service specific base urls.

InvitationCenter  service may be deployed to the preview server, staging server, or production server. Therefore,it has 3 access URLs.
The frontend application must support all deployment environments during development, and the user should be able to select the target API server on the login page (already handled in first part.).

For the invitationCenter service, the base URLs are:

* **Preview:** `https://lrmwufitcheck.preview.mindbricks.com/invitationcenter-api`
* **Staging:** `https://lrmwufitcheck-stage.mindbricks.co/invitationcenter-api`
* **Production:** `https://lrmwufitcheck.mindbricks.co/invitationcenter-api`


## Scope

**InvitationCenter Service Description**

Manages invite-only onboarding links for platform operators, including creation, activation, delivery, validation, and audit tracking of unique registration invite tokens.

InvitationCenter service provides apis and business logic for following data objects in fitcheck application. 
Each data object may be either a central domain of the application data structure or a related helper data object for a central concept.
Note that data object concept is equal to table concept in the database, in the service database each data object is represented as a db table scheme and the object instances as table rows.  


**`inviteLink` Data Object**: Stores a unique invite registration token with usage rules, lifecycle state, delivery tracking, and a reference to the registered user created as a result of the invite.

**`inviteAudit` Data Object**: Append-only audit log capturing every lifecycle event on an invite link, including who acted, what happened, and optional contextual notes.


## InvitationCenter Service Frontend Description By The Backend Architect

## invitationCenter Service — Frontend UX Guide

This service powers the invite-only registration flow. Operators (admins) manage invite links from an admin dashboard panel; prospective users interact with invite links pre-registration through a public-facing registration page.

**Operator dashboard pattern:** A paginated list view (`/admin/invites`) shows all invite links with status badges (draft=gray, active=green, exhausted=orange, revoked=red, expired=purple, consumed=teal). Filtering is available by `inviteState` and `usageMode` via query params. Each row has action buttons: Activate, Revoke, Deliver (email), View Audit. Empty state should say "No invite links yet — create your first invite to start onboarding users."

**Create flow:** A modal or slide-over form with fields for `invitedEmail` (optional), `usageMode` (radio: Single Use / Limited Use), `usageLimit` (shown only when Limited Use selected), and `expiresAt` (date picker, optional). On success, dismiss the modal and refresh the list with a toast "Invite created".

**Registration page pattern (`/register?code=<inviteCode>`):** On load, the page calls `getInviteLinkByCode` to display invite metadata (intended email pre-filled if present, usage mode hint). The user then fills in their credentials. On submit, the app calls `validateInviteCode` first; only on success does it proceed to the auth registration endpoint.

**Error states:** Expired invite → show a friendly "This invite has expired" page. Exhausted/Revoked invite → "This invite is no longer valid." Network errors → toast with retry option.

**Audit trail:** A sub-panel or drawer on each invite shows the `inviteAudit` timeline in chronological order (eventType badge + timestamp + actor + note).

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


## InviteLink Data Object

Stores a unique invite registration token with usage rules, lifecycle state, delivery tracking, and a reference to the registered user created as a result of the invite.

### InviteLink  Data Object Frontend Description By The Backend Architect

## inviteLink — Frontend UX Notes

Represents a single invite link. **Headline fields:** `inviteCode` (display as a copyable badge), `inviteState` (colored status badge), `invitedEmail` (show as placeholder 'Open invite' when null), `usageMode` + `usageCount`/`usageLimit`.

**Detail fields:** `expiresAt` (show 'No expiry' when null), `lastUsedAt`, `registeredUserId` (link to user profile when set), `deliveryRequestedAt`, `lastDeliveredAt`.

**Status badge colors:** draft=gray, active=green, exhausted=orange, revoked=red, expired=purple, consumed=teal.

**usageMode display:** singleUse → 'Single Use', limitedUse → 'Limited Use (N remaining)' where N = usageLimit - usageCount.

The `inviteCode` is sensitive — show it as copyable text, not in list view column; only in the detail panel.


### InviteLink Data Object Properties

InviteLink data object has got following properties that are represented as table fields in the database scheme. 
These properties don't stand just for data storage, but each may have different settings to manage the business logic. 

| Property | Type | IsArray | Required | Secret | Description |
|----------|------|---------|----------|--------|-------------|
| `ownerUserId` | ID | false | Yes | No | - |
| `inviteCode` | String | false | Yes | No | - |
| `invitedEmail` | String | false | No | No | - |
| `usageMode` | Enum | false | Yes | No | - |
| `usageLimit` | Integer | false | No | No | - |
| `usageCount` | Integer | false | Yes | No | - |
| `inviteState` | Enum | false | Yes | No | - |
| `expiresAt` | Date | false | No | No | - |
| `lastUsedAt` | Date | false | No | No | - |
| `registeredUserId` | ID | false | No | No | - |
| `deliveryRequestedAt` | Date | false | No | No | - |
| `lastDeliveredAt` | Date | false | No | No | - |
* Required properties are mandatory for creating objects and must be provided in the request body if no default value, formula or session bind is set.



### Enum Properties
Enum properties are defined with a set of allowed values, ensuring that only valid options can be assigned to them. 
The enum options value will be stored as strings in the database, 
but when a data object is created an additional property with the same name plus an idx suffix will be created, which will hold the index of the selected enum option.
You can use the {fieldName_idx} property to sort by the enum value or when your enum options represent a hiyerarchy of values.
In the frontend input components, enum type properties should only accept values from an option component that lists the enum options.

- **usageMode**: [singleUse, limitedUse]

- **inviteState**: [draft, active, exhausted, revoked, expired, consumed]



### Filter Properties

`usageMode` `inviteState`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as API parameters in the listing API's.
- **usageMode**: Enum  has a filter named `usageMode`
- **inviteState**: Enum  has a filter named `inviteState`


## InviteAudit Data Object

Append-only audit log capturing every lifecycle event on an invite link, including who acted, what happened, and optional contextual notes.

### InviteAudit  Data Object Frontend Description By The Backend Architect

## inviteAudit — Frontend UX Notes

Read-only audit trail. Display as a chronological timeline (oldest first) in a drawer or sub-panel within the invite link detail view.

**Each entry:** `eventType` badge (created=blue, activated=green, delivered=cyan, validated=yellow, consumed=teal, revoked=red, expired=purple) + `eventAt` timestamp (relative time + absolute tooltip) + `actorUserId` (show 'System' when null) + `eventNote` (italic, below main row) + `relatedEmail` (if present, show as chip).

**No create/edit/delete UI exposed** — this is system-managed. The list is auto-loaded when the operator opens an invite detail view, filtered by `inviteLinkId`.


### InviteAudit Data Object Properties

InviteAudit data object has got following properties that are represented as table fields in the database scheme. 
These properties don't stand just for data storage, but each may have different settings to manage the business logic. 

| Property | Type | IsArray | Required | Secret | Description |
|----------|------|---------|----------|--------|-------------|
| `inviteLinkId` | ID | false | Yes | No | - |
| `eventType` | Enum | false | Yes | No | - |
| `eventAt` | Date | false | Yes | No | - |
| `actorUserId` | ID | false | No | No | - |
| `eventNote` | String | false | No | No | - |
| `relatedEmail` | String | false | No | No | - |
* Required properties are mandatory for creating objects and must be provided in the request body if no default value, formula or session bind is set.



### Enum Properties
Enum properties are defined with a set of allowed values, ensuring that only valid options can be assigned to them. 
The enum options value will be stored as strings in the database, 
but when a data object is created an additional property with the same name plus an idx suffix will be created, which will hold the index of the selected enum option.
You can use the {fieldName_idx} property to sort by the enum value or when your enum options represent a hiyerarchy of values.
In the frontend input components, enum type properties should only accept values from an option component that lists the enum options.

- **eventType**: [created, activated, delivered, validated, consumed, revoked, expired]


### Relation Properties

`inviteLinkId`

Mindbricks supports relations between data objects, allowing you to define how objects are linked together.
The relations may reference to a data object either in this service or in another service. Id the reference is remote, backend handles the relations through service communication or elastic search.
These relations should be respected in the frontend so that instaead of showing the related objects id, the frontend should list human readable values from other data objects.
If the relation points to another service, frontend should use the referenced service api in case it needs related data.
The relation logic is montly handled in backend so the api responses feeds the frontend about the relational data.
In mmost cases the api response will provide the relational data as well as the main one.

In frontend, please ensure that,

1- instaead of these relational ids you show the main human readable field of the related target data (like name),
2- if this data object needs a user input of these relational ids, you should provide a combobox with the list of possible records or (a searchbox) to select with the realted target data object main human readable field.


- **inviteLinkId**: ID
Relation to `inviteLink`.id

The target object is a sibling object, meaning that the relation is a many-to-one or one-to-one relationship from this object to the target.

Required: Yes


### Filter Properties

`inviteLinkId` `eventType`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as API parameters in the listing API's.
- **inviteLinkId**: ID  has a filter named `inviteLinkId`
- **eventType**: Enum  has a filter named `eventType`



## Default CRUD APIs

For each data object, the backend architect may designate **default APIs** for standard operations (create, update, delete, get, list). These are the APIs that frontend CRUD forms and AI agents should use for basic record management. If no default is explicitly set (`isDefaultApi`), the frontend generator auto-discovers the most general API for each operation.

### InviteLink Default APIs

| Operation | API Name | Route | Explicitly Set |
|-----------|----------|-------|----------------|
| Create | `createInviteLink` | `/v1/invite-links` | Yes |
| Update | `activateInviteLink` | `/v1/invite-links/:inviteLinkId/activate` | Auto |
| Delete | _none_ | - | Auto |
| Get | `getInviteLink` | `/v1/invite-links/:inviteLinkId` | Yes |
| List | `listInviteLinks` | `/v1/invite-links` | Yes |
### InviteAudit Default APIs

| Operation | API Name | Route | Explicitly Set |
|-----------|----------|-------|----------------|
| Create | _none_ | - | Auto |
| Update | _none_ | - | Auto |
| Delete | _none_ | - | Auto |
| Get | _none_ | - | Auto |
| List | `listInviteAudits` | `/v1/invite-audits` | Yes |

When building CRUD forms for a data object, use the default create/update APIs listed above. The form fields should correspond to the API's body parameters. For relation fields, render a dropdown loaded from the related object's list API using the display label property.






## API Reference

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



**After this prompt, the user may give you new instructions to update the output of this prompt or provide subsequent prompts about the project.**


