
# Business API Design Specification - `Archive Profile`

A Business API is a set of logical actions centered around a main data object. These actions can range from simple CRUD operations to complex workflows that implement intricate business logic.

While the term “API” traditionally refers to an interface that allows software systems to interact, in Mindbricks a Business API represents a broader concept. It encapsulates a business workflow around a data object, going beyond basic CRUD operations to include rich, internally coordinated actions that can be fully designed and customized.

This document provides an in-depth explanation of the architectural design of the `archiveProfile` Business API. It is intended to guide backend architects and developers in maintaining the current design. Additionally, frontend developers and frontend AI agents can use this document to understand how to properly consume this API on the client side.

## Main Data Object and CRUD Operation
The `archiveProfile` Business API is designed to handle a `delete` operation on the `User` data object. This operation is performed under the specified conditions and may include additional, coordinated actions as part of the workflow.

## API Description

This api is used by users to archive their own profiles. The target user is always the session user — no userId is needed in the URL.


## API Options

* **Raise Api Event** : `true`
Indicates whether the Business API should emit an API-level event after successful execution. This is typically used for audit trails, analytics, or external integrations.
The event will be emitted to the `profile-archived` Kafka Topic Note that the DB-Level events for `create`, `update` and `delete` operations will always be raised for internal reasons.

* **Active Check** : ``
Controls how the system checks if a record is active (not soft-deleted or inactive). Uses the `ApiCheckOption` to determine whether this is checked during the query or after fetching the instance.

* **Read From Entity Cache** : `false`
If enabled, the API will attempt to read the target object from the Redis entity cache before querying the database. This can improve performance for frequently accessed records.

## API Controllers
A Mindbricks Business API can be accessed through multiple interfaces, including REST, gRPC, WebSocket, Kafka, or Cron. The controllers listed below map the business workflow to a specific interface, enabling consistent interaction regardless of the communication channel.

### REST Controller

The `archiveProfile` Business API includes a REST controller that can be triggered via the following route:

`/v1/archiveprofile`

By sending a request to this route using the service API address, you can execute this Business API. Parameters can be provided in multiple HTTP locations, including the URL path, URL query, request body, and request headers. Detailed information about these parameters is provided in the **Parameters** section.

### gRPC Controller

The `archiveProfile` Business API includes a gRPC controller that can be triggered via the following function:

`archiveProfile()`

By calling this gRPC endpoint using a gRPC client, you can execute the Business API. Note that all parameters must be provided as function arguments, regardless of their HTTP location configuration, which is relevant only for the REST controller.



### MCP Tool

REST controllers also expose the Business API as a tool in the MCP, making it accessible to AI agents. This `archiveProfile` Business API will be registered as a tool on the MCP server within the service binding.

## API Parameters


The `archiveProfile` Business API does not require any parameters to be provided from the controllers.

## AUTH Configuration

The **authentication and authorization configuration** defines the core access rules for the `archiveProfile` Business API. These checks are applied **after parameter validation** and before executing the main business logic.

While these settings cover the most common scenarios, more **fine-grained or conditional access control**—such as permissions based on object context, nested memberships, or custom workflows—should be implemented using explicit actions like `PermissionCheckAction`, `MembershipCheckAction`, or `ObjectPermissionCheckAction`.


### Login Requirement


This API **requires login** (`loginRequired = true`). Requests from non-logged-in users will return a **401 Unauthorized** error.
Login is necessary **but not sufficient**, as additional role, permission, or other authorization checks may still apply.

---


### Ownership Checks



---

### Role and Permission Settings


- **Absolute roles** (bypass all auth checks):  
  Users with any of the following roles will bypass all authentication and authorization checks, including ownership, membership, and standard role/permission checks:  
  `[superAdmin]`






---



## Where Clause
Defines the criteria used to locate the target record(s) for the main operation. This is expressed as a query object and applies to `get`, `list`, `update`, and `delete` APIs. All API types except `list` are expected to affect a single record.

*If nothing is configured for (get, update, delete) the id fields will be the select criteria.*

**Select By**: 
A list of fields that must be matched exactly as part of the WHERE clause. This is not a filter — it is a required selection rule. In single-record APIs (`get`, `update`, `delete`), it defines how a unique record is located. In `list` APIs, it scopes the results to only entries matching the given values.
Note that `selectBy` fields will be ignored if `fullWhereClause` is set.

*The business api configuration has no `selectBy` setting.*


**Full Where Clause** 
An MScript query expression that overrides all default WHERE clause logic. Use this for fully customized queries.
When `fullWhereClause` is set, `selectBy` is ignored, however additional selects will still be applied to final where clause.

The business api configuration has a `fullWhereClause` setting :
```js
{id: this.session.userId}
```


**Additional Clauses**
A list of conditionally applied MScript query fragments. These clauses are appended only if their conditions evaluate to true. If no condition is set it will be applied to the where clause directly.

The business api configuration has no additionalClauses setting.


**Actual Where Clause** 
This where clause is built using whereClause configuration (if set) and default business logic.

```js
runMScript(() => ({$and:[{id: this.session.userId},{isActive:true}]}), {"path":"services[0].businessLogic[5].whereClause.fullWhereClause"})
```





## Delete Options
Use these options to set `delete` specific settings.

**useSoftDelete**: 
If true, the record will be marked as deleted `(isActive: false)` instead of removed. The implementation depends on the data object’s soft delete configuration.





   
## Business Logic Workflow 


### [1] Step : startBusinessApi

Manager initializes context, prepares request/session objects, and sets up internal structures for parameter handling and milestone execution.


You can use the following settings to change some behavior of this step.
`apiOptions`, `restSettings`, `grpcSettings`, `kafkaSettings`, `sseSettings`, `cronSettings`
---




### [2] Step : readParameters

Manager reads and normalizes parameters, applies defaults, and stores them in the context for downstream steps.


You can use the following settings to change some behavior of this step.
`customParameters`, `redisParameters`
---




### [3] Step : transposeParameters

Manager executes parameter transform scripts, computes derived values, and remaps objects or arrays as needed for later processing.


---




### [4] Step : checkParameters

Manager runs built-in validations including required field checks, type enforcement, and deletion preconditions. Stops execution if validation fails.


---




### [5] Step : checkBasicAuth

Manager validates session, user roles, permissions, and tenant-specific access rules to enforce basic auth restrictions.


You can use the following settings to change some behavior of this step.
`authOptions`
---


### [6] Action : protectSuperAdmin
**Action Type**: `ValidationAction`

Prevents deletion of the SuperAdmin account. This safeguard ensures that the SuperAdmin userId cannot be removed under any circumstances.

```js
class Api {
  async protectSuperAdmin() {
    let isError;
    try {
      isError = runMScript(
        () => this.session.userId == this.auth?.superAdminId,
        {
          path: "services[0].businessLogic[5].actions.validationActions[0].validationScript",
        },
      );
      // Async-safety: when the validation script calls an async LIB
      // function without `await` (e.g. `LIB.validateGroupMembership(...)`
      // instead of `await LIB.validateGroupMembership(...)`), the
      // expression evaluates to an unresolved Promise. Without this pass,
      // the Promise is stored in isValid/isError, the `if (!isValid)`
      // check below sees a truthy thenable (so passes), and the eventual
      // rejection surfaces as an unhandled rejection → 500 instead of the
      // intended typed 4xx. Mirrors the dataClause Promise-resolve pass
      // in inc.dataclausemethod.ejs.
      if (isError && typeof isError.then === "function") {
        isError = await isError;
      }
    } catch (err) {
      // Designer-emitted 4xx throws (BadRequestError, ForbiddenError,
      // NotFoundError, ConflictError, UnprocessableEntityError, …) propagate
      // verbatim — the MScript intentionally surfaced a typed business
      // validation failure and its message belongs in the response. Only
      // wrap genuinely unexpected exceptions (TypeError, ReferenceError,
      // null-deref, etc.) as 500 so operators can tell "rule rejected
      // input" from "the validation itself crashed".
      if (
        err &&
        typeof err.status === "number" &&
        err.status >= 400 &&
        err.status < 500
      ) {
        throw err;
      }
      throw new HttpServerError(
        `Validation 'protectSuperAdmin' script failed: ${err.message}`,
        err,
      );
    }

    if (isError) {
      throw new BadRequestError("SuperAdminCantBeDeleted");
    }
    return isError;
  }
}
```
---



### [7] Step : buildWhereClause

Manager generates the query conditions, applies ownership and parent checks, and ensures the clause is correct for the delete operation.


You can use the following settings to change some behavior of this step.
`whereClause`
---




### [8] Step : fetchInstance

Manager fetches the target record, applies filters from WHERE clause, and writes the instance to the context for further checks.


---




### [9] Step : checkInstance

Manager performs object-level validations such as lock status, soft-delete eligibility, and multi-step approval enforcement.


---




### [10] Step : mainDeleteOperation

Manager executes the delete query, updates related indexes/caches, and handles soft/hard delete logic according to configuration.


You can use the following settings to change some behavior of this step.
`deleteOptions`
---


### [11] Action : deleteUserSessions
**Action Type**: `FunctionCallAction`

Makes a call to this.auth to delete the sessions of the deleted user.

```js
class Api {
  async deleteUserSessions() {
    try {
      return await runMScript(
        () =>
          (async () =>
            await (async (userId) => {
              await this.auth.deleteUserSessions(userId);
            })(this.session.userId))(),
        {
          path: "services[0].businessLogic[5].actions.functionCallActions[0].callScript",
        },
      );
    } catch (err) {
      console.error("Error in FunctionCallAction deleteUserSessions:", err);
      throw err;
    }
  }
}
```
---



### [12] Step : buildOutput

Manager shapes the response payload, masks sensitive fields, and formats related cleanup results for output.


---




### [13] Step : sendResponse

Manager delivers the response to the client and finalizes any temporary internal structures.


---




### [14] Step : raiseApiEvent

Manager triggers asynchronous API events, notifies queues or streams, and performs final cleanup for the workflow.


---






## Rest Usage


### Rest Client Parameters
Client parameters are the api parameters that are visible to client and will be populated by the client.
Note that some api parameters are not visible to client because they are populated by internal system, session, calculation or joint sources.
The `archiveProfile` api has got no visible parameters.    

### REST Request
To access the api you can use the **REST** controller with the path **DELETE  /v1/archiveprofile**
```js
  axios({
    method: 'DELETE',
    url: '/v1/archiveprofile',
    data: {
    
    },
    params: {
    
        }
  });
```   
### REST Response
The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, list, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`user`** object in the respones. However, some properties may be omitted based on the object's internal logic.


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
	"dataName": "user",
	"method": "DELETE",
	"action": "delete",
	"appVersion": "Version",
	"rowCount": 1,
	"user": {
		"id": "ID",
		"email": "String",
		"password": "String",
		"fullname": "String",
		"avatar": "String",
		"roleId": "String",
		"emailVerified": "Boolean",
		"isActive": false,
		"recordVersion": "Integer",
		"createdAt": "Date",
		"updatedAt": "Date",
		"_owner": "ID"
	}
}
```

