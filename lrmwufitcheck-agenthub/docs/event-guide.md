# EVENT GUIDE

## fitcheck-agenthub-service

FitCheck AI Agent Hub — hosts nutrition guidance and meal workflow agents for all registered users. Provides context-aware nutrition intelligence by reading live meal logs, macro targets, food library items, and AI session history.

## Architectural Design Credit and Contact Information

The architectural design of this microservice is credited to . For inquiries, feedback, or further information regarding the architecture, please direct your communication to:

Email:

We encourage open communication and welcome any questions or discussions related to the architectural aspects of this microservice.

# Documentation Scope

Welcome to the official documentation for the `AgentHub` Service Event descriptions. This guide is dedicated to detailing how to subscribe to and listen for state changes within the `AgentHub` Service, offering an exclusive focus on event subscription mechanisms.

**Intended Audience**

This documentation is aimed at developers and integrators looking to monitor `AgentHub` Service state changes. It is especially relevant for those wishing to implement or enhance business logic based on interactions with `AgentHub` objects.

**Overview**

This section provides detailed instructions on monitoring service events, covering payload structures and demonstrating typical use cases through examples.

# Authentication and Authorization

Access to the `AgentHub` service's events is facilitated through the project's Kafka server, which is not accessible to the public. Subscription to a Kafka topic requires being on the same network and possessing valid Kafka user credentials. This document presupposes that readers have existing access to the Kafka server.

Additionally, the service offers a public subscription option via REST for real-time data management in frontend applications, secured through REST API authentication and authorization mechanisms. To subscribe to service events via the REST API, please consult the Realtime REST API Guide.

# Database Events

Database events are triggered at the database layer, automatically and atomically, in response to any modifications at the data level. These events serve to notify subscribers about the creation, update, or deletion of objects within the database, distinct from any overarching business logic.

Listening to database events is particularly beneficial for those focused on tracking changes at the database level. A typical use case for subscribing to database events is to replicate the data store of one service within another service's scope, ensuring data consistency and syncronization across services.

For example, while a business operation such as "approve membership" might generate a high-level business event like `membership-approved`, the underlying database changes could involve multiple state updates to different entities. These might be published as separate events, such as `dbevent-member-updated` and `dbevent-user-updated`, reflecting the granular changes at the database level.

Such detailed eventing provides a robust foundation for building responsive, data-driven applications, enabling fine-grained observability and reaction to the dynamics of the data landscape. It also facilitates the architectural pattern of event sourcing, where state changes are captured as a sequence of events, allowing for high-fidelity data replication and history replay for analytical or auditing purposes.

## DbEvent sys_agentOverride-created

**Event topic**: `lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-created`

This event is triggered upon the creation of a `sys_agentOverride` data object in the database. The event payload encompasses the newly created data, encapsulated within the root of the paylod.

**Event payload**:

```json
{
  "id": "ID",
  "agentName": "String",
  "provider": "String",
  "model": "String",
  "systemPrompt": "Text",
  "temperature": "Double",
  "maxTokens": "Integer",
  "responseFormat": "String",
  "selectedTools": "Object",
  "guardrails": "Object",
  "enabled": "Boolean",
  "updatedBy": "ID",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

## DbEvent sys_agentOverride-updated

**Event topic**: `lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-updated`

Activation of this event follows the update of a `sys_agentOverride` data object. The payload contains the updated information under the `sys_agentOverride` attribute, along with the original data prior to update, labeled as `old_sys_agentOverride` and also you can find the old and new versions of updated-only portion of the data..

**Event payload**:

```json
{
old_sys_agentOverride:{"id":"ID","agentName":"String","provider":"String","model":"String","systemPrompt":"Text","temperature":"Double","maxTokens":"Integer","responseFormat":"String","selectedTools":"Object","guardrails":"Object","enabled":"Boolean","updatedBy":"ID","recordVersion":"Integer","createdAt":"Date","updatedAt":"Date","_owner":"ID"},
sys_agentOverride:{"id":"ID","agentName":"String","provider":"String","model":"String","systemPrompt":"Text","temperature":"Double","maxTokens":"Integer","responseFormat":"String","selectedTools":"Object","guardrails":"Object","enabled":"Boolean","updatedBy":"ID","recordVersion":"Integer","createdAt":"Date","updatedAt":"Date","_owner":"ID"},
oldDataValues,
newDataValues
}
```

## DbEvent sys_agentOverride-deleted

**Event topic**: `lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-deleted`

This event announces the deletion of a `sys_agentOverride` data object, covering both hard deletions (permanent removal) and soft deletions (where the `isActive` attribute is set to false). Regardless of the deletion type, the event payload will present the data as it was immediately before deletion, highlighting an `isActive` status of false for soft deletions.

**Event payload**:

```json
{
  "id": "ID",
  "agentName": "String",
  "provider": "String",
  "model": "String",
  "systemPrompt": "Text",
  "temperature": "Double",
  "maxTokens": "Integer",
  "responseFormat": "String",
  "selectedTools": "Object",
  "guardrails": "Object",
  "enabled": "Boolean",
  "updatedBy": "ID",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID",
  "isActive": false
}
```

## DbEvent sys_agentExecution-created

**Event topic**: `lrmwufitcheck-agenthub-service-dbevent-sys_agentexecution-created`

This event is triggered upon the creation of a `sys_agentExecution` data object in the database. The event payload encompasses the newly created data, encapsulated within the root of the paylod.

**Event payload**:

```json
{
  "id": "ID",
  "agentName": "String",
  "agentType": "Enum",
  "agentType_idx": "Integer",
  "source": "Enum",
  "source_idx": "Integer",
  "userId": "ID",
  "input": "Object",
  "output": "Object",
  "toolCalls": "Integer",
  "tokenUsage": "Object",
  "durationMs": "Integer",
  "status": "Enum",
  "status_idx": "Integer",
  "error": "Text",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

## DbEvent sys_agentExecution-updated

**Event topic**: `lrmwufitcheck-agenthub-service-dbevent-sys_agentexecution-updated`

Activation of this event follows the update of a `sys_agentExecution` data object. The payload contains the updated information under the `sys_agentExecution` attribute, along with the original data prior to update, labeled as `old_sys_agentExecution` and also you can find the old and new versions of updated-only portion of the data..

**Event payload**:

```json
{
old_sys_agentExecution:{"id":"ID","agentName":"String","agentType":"Enum","agentType_idx":"Integer","source":"Enum","source_idx":"Integer","userId":"ID","input":"Object","output":"Object","toolCalls":"Integer","tokenUsage":"Object","durationMs":"Integer","status":"Enum","status_idx":"Integer","error":"Text","recordVersion":"Integer","createdAt":"Date","updatedAt":"Date","_owner":"ID"},
sys_agentExecution:{"id":"ID","agentName":"String","agentType":"Enum","agentType_idx":"Integer","source":"Enum","source_idx":"Integer","userId":"ID","input":"Object","output":"Object","toolCalls":"Integer","tokenUsage":"Object","durationMs":"Integer","status":"Enum","status_idx":"Integer","error":"Text","recordVersion":"Integer","createdAt":"Date","updatedAt":"Date","_owner":"ID"},
oldDataValues,
newDataValues
}
```

## DbEvent sys_agentExecution-deleted

**Event topic**: `lrmwufitcheck-agenthub-service-dbevent-sys_agentexecution-deleted`

This event announces the deletion of a `sys_agentExecution` data object, covering both hard deletions (permanent removal) and soft deletions (where the `isActive` attribute is set to false). Regardless of the deletion type, the event payload will present the data as it was immediately before deletion, highlighting an `isActive` status of false for soft deletions.

**Event payload**:

```json
{
  "id": "ID",
  "agentName": "String",
  "agentType": "Enum",
  "agentType_idx": "Integer",
  "source": "Enum",
  "source_idx": "Integer",
  "userId": "ID",
  "input": "Object",
  "output": "Object",
  "toolCalls": "Integer",
  "tokenUsage": "Object",
  "durationMs": "Integer",
  "status": "Enum",
  "status_idx": "Integer",
  "error": "Text",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID",
  "isActive": false
}
```

## DbEvent sys_toolCatalog-created

**Event topic**: `lrmwufitcheck-agenthub-service-dbevent-sys_toolcatalog-created`

This event is triggered upon the creation of a `sys_toolCatalog` data object in the database. The event payload encompasses the newly created data, encapsulated within the root of the paylod.

**Event payload**:

```json
{
  "id": "ID",
  "toolName": "String",
  "serviceName": "String",
  "description": "Text",
  "parameters": "Object",
  "lastRefreshed": "Date",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

## DbEvent sys_toolCatalog-updated

**Event topic**: `lrmwufitcheck-agenthub-service-dbevent-sys_toolcatalog-updated`

Activation of this event follows the update of a `sys_toolCatalog` data object. The payload contains the updated information under the `sys_toolCatalog` attribute, along with the original data prior to update, labeled as `old_sys_toolCatalog` and also you can find the old and new versions of updated-only portion of the data..

**Event payload**:

```json
{
old_sys_toolCatalog:{"id":"ID","toolName":"String","serviceName":"String","description":"Text","parameters":"Object","lastRefreshed":"Date","recordVersion":"Integer","createdAt":"Date","updatedAt":"Date","_owner":"ID"},
sys_toolCatalog:{"id":"ID","toolName":"String","serviceName":"String","description":"Text","parameters":"Object","lastRefreshed":"Date","recordVersion":"Integer","createdAt":"Date","updatedAt":"Date","_owner":"ID"},
oldDataValues,
newDataValues
}
```

## DbEvent sys_toolCatalog-deleted

**Event topic**: `lrmwufitcheck-agenthub-service-dbevent-sys_toolcatalog-deleted`

This event announces the deletion of a `sys_toolCatalog` data object, covering both hard deletions (permanent removal) and soft deletions (where the `isActive` attribute is set to false). Regardless of the deletion type, the event payload will present the data as it was immediately before deletion, highlighting an `isActive` status of false for soft deletions.

**Event payload**:

```json
{
  "id": "ID",
  "toolName": "String",
  "serviceName": "String",
  "description": "Text",
  "parameters": "Object",
  "lastRefreshed": "Date",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID",
  "isActive": false
}
```

## DbEvent sys_agentConversation-created

**Event topic**: `lrmwufitcheck-agenthub-service-dbevent-sys_agentconversation-created`

This event is triggered upon the creation of a `sys_agentConversation` data object in the database. The event payload encompasses the newly created data, encapsulated within the root of the paylod.

**Event payload**:

```json
{
  "id": "ID",
  "sessionId": "String",
  "agentName": "String",
  "userId": "ID",
  "messages": "Object",
  "messageCount": "Integer",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

## DbEvent sys_agentConversation-updated

**Event topic**: `lrmwufitcheck-agenthub-service-dbevent-sys_agentconversation-updated`

Activation of this event follows the update of a `sys_agentConversation` data object. The payload contains the updated information under the `sys_agentConversation` attribute, along with the original data prior to update, labeled as `old_sys_agentConversation` and also you can find the old and new versions of updated-only portion of the data..

**Event payload**:

```json
{
old_sys_agentConversation:{"id":"ID","sessionId":"String","agentName":"String","userId":"ID","messages":"Object","messageCount":"Integer","recordVersion":"Integer","createdAt":"Date","updatedAt":"Date","_owner":"ID"},
sys_agentConversation:{"id":"ID","sessionId":"String","agentName":"String","userId":"ID","messages":"Object","messageCount":"Integer","recordVersion":"Integer","createdAt":"Date","updatedAt":"Date","_owner":"ID"},
oldDataValues,
newDataValues
}
```

## DbEvent sys_agentConversation-deleted

**Event topic**: `lrmwufitcheck-agenthub-service-dbevent-sys_agentconversation-deleted`

This event announces the deletion of a `sys_agentConversation` data object, covering both hard deletions (permanent removal) and soft deletions (where the `isActive` attribute is set to false). Regardless of the deletion type, the event payload will present the data as it was immediately before deletion, highlighting an `isActive` status of false for soft deletions.

**Event payload**:

```json
{
  "id": "ID",
  "sessionId": "String",
  "agentName": "String",
  "userId": "ID",
  "messages": "Object",
  "messageCount": "Integer",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID",
  "isActive": false
}
```

# ElasticSearch Index Events

Within the `AgentHub` service, most data objects are mirrored in ElasticSearch indices, ensuring these indices remain syncronized with their database counterparts through creation, updates, and deletions. These indices serve dual purposes: they act as a data source for external services and furnish aggregated data tailored to enhance frontend user experiences. Consequently, an ElasticSearch index might encapsulate data in its original form or aggregate additional information from other data objects.

These aggregations can include both one-to-one and one-to-many relationships not only with database objects within the same service but also across different services. This capability allows developers to access comprehensive, aggregated data efficiently. By subscribing to ElasticSearch index events, developers are notified when an index is updated and can directly obtain the aggregated entity within the event payload, bypassing the need for separate ElasticSearch queries.

It's noteworthy that some services may augment another service's index by appending to the entity’s `extends` object. In such scenarios, an `*-extended` event will contain only the newly added data. Should you require the complete dataset, you would need to retrieve the full ElasticSearch index entity using the provided ID.

This approach to indexing and event handling facilitates a modular, interconnected architecture where services can seamlessly integrate and react to changes, enriching the overall data ecosystem and enabling more dynamic, responsive applications.

## Index Event sys_agentoverride-created

**Event topic**: `elastic-index-fitcheck_sys_agentoverride-created`

**Event payload**:

```json
{
  "id": "ID",
  "agentName": "String",
  "provider": "String",
  "model": "String",
  "systemPrompt": "Text",
  "temperature": "Double",
  "maxTokens": "Integer",
  "responseFormat": "String",
  "selectedTools": "Object",
  "guardrails": "Object",
  "enabled": "Boolean",
  "updatedBy": "ID",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

## Index Event sys_agentoverride-updated

**Event topic**: `elastic-index-fitcheck_sys_agentoverride-created`

**Event payload**:

```json
{
  "id": "ID",
  "agentName": "String",
  "provider": "String",
  "model": "String",
  "systemPrompt": "Text",
  "temperature": "Double",
  "maxTokens": "Integer",
  "responseFormat": "String",
  "selectedTools": "Object",
  "guardrails": "Object",
  "enabled": "Boolean",
  "updatedBy": "ID",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

## Index Event sys_agentoverride-deleted

**Event topic**: `elastic-index-fitcheck_sys_agentoverride-deleted`

**Event payload**:

```json
{
  "id": "ID",
  "agentName": "String",
  "provider": "String",
  "model": "String",
  "systemPrompt": "Text",
  "temperature": "Double",
  "maxTokens": "Integer",
  "responseFormat": "String",
  "selectedTools": "Object",
  "guardrails": "Object",
  "enabled": "Boolean",
  "updatedBy": "ID",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

## Index Event sys_agentoverride-extended

**Event topic**: `elastic-index-fitcheck_sys_agentoverride-extended`

**Event payload**:

```js
{
  id: id,
  extends: {
    [extendName]: "Object",
    [extendName + "_count"]: "Number",
  },
}
```

# Route Events

Route events are emitted following the successful execution of a route. While most routes perform CRUD (Create, Read, Update, Delete) operations on data objects, resulting in route events that closely resemble database events, there are distinctions worth noting. A single route execution might trigger multiple CRUD actions and ElasticSearch indexing operations. However, for those primarily concerned with the overarching business logic and its outcomes, listening to the consolidated route event, published once at the conclusion of the route's execution, is more pertinent.

Moreover, routes often deliver aggregated data beyond the primary database object, catering to specific client needs. For instance, creating a data object via a route might not only return the entity's data but also route-specific metrics, such as the executing user's permissions related to the entity. Alternatively, a route might automatically generate default child entities following the creation of a parent object. Consequently, the route event encapsulates a unified dataset encompassing both the parent and its children, in contrast to individual events triggered for each entity created. Therefore, subscribing to route events can offer a richer, more contextually relevant set of information aligned with business logic.

The payload of a route event mirrors the REST response JSON of the route, providing a direct and comprehensive reflection of the data and metadata communicated to the client. This ensures that subscribers to route events receive a payload that encapsulates both the primary data involved and any additional information deemed significant at the business level, facilitating a deeper understanding and integration of the service's functional outcomes.

## Route Event agentoverride-retrived

**Event topic** : `lrmwufitcheck-agenthub-service-agentoverride-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentOverride` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentOverride`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentOverride",
  "method": "GET",
  "action": "get",
  "appVersion": "Version",
  "rowCount": 1,
  "sys_agentOverride": {
    "id": "ID",
    "agentName": "String",
    "provider": "String",
    "model": "String",
    "systemPrompt": "Text",
    "temperature": "Double",
    "maxTokens": "Integer",
    "responseFormat": "String",
    "selectedTools": "Object",
    "guardrails": "Object",
    "enabled": "Boolean",
    "updatedBy": "ID",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": true
  }
}
```

## Route Event agentoverrides-listed

**Event topic** : `lrmwufitcheck-agenthub-service-agentoverrides-listed`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentOverrides` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentOverrides`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentOverrides",
  "method": "GET",
  "action": "list",
  "appVersion": "Version",
  "rowCount": "\"Number\"",
  "sys_agentOverrides": [
    {
      "id": "ID",
      "agentName": "String",
      "provider": "String",
      "model": "String",
      "systemPrompt": "Text",
      "temperature": "Double",
      "maxTokens": "Integer",
      "responseFormat": "String",
      "selectedTools": "Object",
      "guardrails": "Object",
      "enabled": "Boolean",
      "updatedBy": "ID",
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

## Route Event agentoverride-created

**Event topic** : `lrmwufitcheck-agenthub-service-agentoverride-created`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentOverride` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentOverride`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentOverride",
  "method": "POST",
  "action": "create",
  "appVersion": "Version",
  "rowCount": 1,
  "sys_agentOverride": {
    "id": "ID",
    "agentName": "String",
    "provider": "String",
    "model": "String",
    "systemPrompt": "Text",
    "temperature": "Double",
    "maxTokens": "Integer",
    "responseFormat": "String",
    "selectedTools": "Object",
    "guardrails": "Object",
    "enabled": "Boolean",
    "updatedBy": "ID",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": true
  }
}
```

## Route Event agentoverride-updated

**Event topic** : `lrmwufitcheck-agenthub-service-agentoverride-updated`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentOverride` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentOverride`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentOverride",
  "method": "PATCH",
  "action": "update",
  "appVersion": "Version",
  "rowCount": 1,
  "sys_agentOverride": {
    "id": "ID",
    "agentName": "String",
    "provider": "String",
    "model": "String",
    "systemPrompt": "Text",
    "temperature": "Double",
    "maxTokens": "Integer",
    "responseFormat": "String",
    "selectedTools": "Object",
    "guardrails": "Object",
    "enabled": "Boolean",
    "updatedBy": "ID",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": true
  }
}
```

## Route Event agentoverride-deleted

**Event topic** : `lrmwufitcheck-agenthub-service-agentoverride-deleted`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentOverride` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentOverride`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentOverride",
  "method": "DELETE",
  "action": "delete",
  "appVersion": "Version",
  "rowCount": 1,
  "sys_agentOverride": {
    "id": "ID",
    "agentName": "String",
    "provider": "String",
    "model": "String",
    "systemPrompt": "Text",
    "temperature": "Double",
    "maxTokens": "Integer",
    "responseFormat": "String",
    "selectedTools": "Object",
    "guardrails": "Object",
    "enabled": "Boolean",
    "updatedBy": "ID",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": false
  }
}
```

## Route Event toolcatalog-listed

**Event topic** : `lrmwufitcheck-agenthub-service-toolcatalog-listed`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_toolCatalogs` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_toolCatalogs`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_toolCatalogs",
  "method": "GET",
  "action": "list",
  "appVersion": "Version",
  "rowCount": "\"Number\"",
  "sys_toolCatalogs": [
    {
      "id": "ID",
      "toolName": "String",
      "serviceName": "String",
      "description": "Text",
      "parameters": "Object",
      "lastRefreshed": "Date",
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

## Route Event toolcatalogentry-retrived

**Event topic** : `lrmwufitcheck-agenthub-service-toolcatalogentry-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_toolCatalog` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_toolCatalog`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_toolCatalog",
  "method": "GET",
  "action": "get",
  "appVersion": "Version",
  "rowCount": 1,
  "sys_toolCatalog": {
    "id": "ID",
    "toolName": "String",
    "serviceName": "String",
    "description": "Text",
    "parameters": "Object",
    "lastRefreshed": "Date",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": true
  }
}
```

## Route Event agentexecutions-listed

**Event topic** : `lrmwufitcheck-agenthub-service-agentexecutions-listed`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentExecutions` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentExecutions`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentExecutions",
  "method": "GET",
  "action": "list",
  "appVersion": "Version",
  "rowCount": "\"Number\"",
  "sys_agentExecutions": [
    {
      "id": "ID",
      "agentName": "String",
      "agentType": "Enum",
      "agentType_idx": "Integer",
      "source": "Enum",
      "source_idx": "Integer",
      "userId": "ID",
      "input": "Object",
      "output": "Object",
      "toolCalls": "Integer",
      "tokenUsage": "Object",
      "durationMs": "Integer",
      "status": "Enum",
      "status_idx": "Integer",
      "error": "Text",
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

## Route Event agentexecution-retrived

**Event topic** : `lrmwufitcheck-agenthub-service-agentexecution-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentExecution` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentExecution`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentExecution",
  "method": "GET",
  "action": "get",
  "appVersion": "Version",
  "rowCount": 1,
  "sys_agentExecution": {
    "id": "ID",
    "agentName": "String",
    "agentType": "Enum",
    "agentType_idx": "Integer",
    "source": "Enum",
    "source_idx": "Integer",
    "userId": "ID",
    "input": "Object",
    "output": "Object",
    "toolCalls": "Integer",
    "tokenUsage": "Object",
    "durationMs": "Integer",
    "status": "Enum",
    "status_idx": "Integer",
    "error": "Text",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": true
  }
}
```

## Route Event agentchats-listed

**Event topic** : `lrmwufitcheck-agenthub-service-agentchats-listed`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentConversations` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentConversations`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentConversations",
  "method": "GET",
  "action": "list",
  "appVersion": "Version",
  "rowCount": "\"Number\"",
  "sys_agentConversations": [
    {
      "id": "ID",
      "sessionId": "String",
      "agentName": "String",
      "userId": "ID",
      "messages": "Object",
      "messageCount": "Integer",
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

## Route Event agentchatmessages-retrived

**Event topic** : `lrmwufitcheck-agenthub-service-agentchatmessages-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentConversation` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentConversation`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentConversation",
  "method": "GET",
  "action": "get",
  "appVersion": "Version",
  "rowCount": 1,
  "sys_agentConversation": {
    "id": "ID",
    "sessionId": "String",
    "agentName": "String",
    "userId": "ID",
    "messages": "Object",
    "messageCount": "Integer",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": true
  }
}
```

## Index Event sys_agentexecution-created

**Event topic**: `elastic-index-fitcheck_sys_agentexecution-created`

**Event payload**:

```json
{
  "id": "ID",
  "agentName": "String",
  "agentType": "Enum",
  "agentType_idx": "Integer",
  "source": "Enum",
  "source_idx": "Integer",
  "userId": "ID",
  "input": "Object",
  "output": "Object",
  "toolCalls": "Integer",
  "tokenUsage": "Object",
  "durationMs": "Integer",
  "status": "Enum",
  "status_idx": "Integer",
  "error": "Text",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

## Index Event sys_agentexecution-updated

**Event topic**: `elastic-index-fitcheck_sys_agentexecution-created`

**Event payload**:

```json
{
  "id": "ID",
  "agentName": "String",
  "agentType": "Enum",
  "agentType_idx": "Integer",
  "source": "Enum",
  "source_idx": "Integer",
  "userId": "ID",
  "input": "Object",
  "output": "Object",
  "toolCalls": "Integer",
  "tokenUsage": "Object",
  "durationMs": "Integer",
  "status": "Enum",
  "status_idx": "Integer",
  "error": "Text",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

## Index Event sys_agentexecution-deleted

**Event topic**: `elastic-index-fitcheck_sys_agentexecution-deleted`

**Event payload**:

```json
{
  "id": "ID",
  "agentName": "String",
  "agentType": "Enum",
  "agentType_idx": "Integer",
  "source": "Enum",
  "source_idx": "Integer",
  "userId": "ID",
  "input": "Object",
  "output": "Object",
  "toolCalls": "Integer",
  "tokenUsage": "Object",
  "durationMs": "Integer",
  "status": "Enum",
  "status_idx": "Integer",
  "error": "Text",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

## Index Event sys_agentexecution-extended

**Event topic**: `elastic-index-fitcheck_sys_agentexecution-extended`

**Event payload**:

```js
{
  id: id,
  extends: {
    [extendName]: "Object",
    [extendName + "_count"]: "Number",
  },
}
```

# Route Events

Route events are emitted following the successful execution of a route. While most routes perform CRUD (Create, Read, Update, Delete) operations on data objects, resulting in route events that closely resemble database events, there are distinctions worth noting. A single route execution might trigger multiple CRUD actions and ElasticSearch indexing operations. However, for those primarily concerned with the overarching business logic and its outcomes, listening to the consolidated route event, published once at the conclusion of the route's execution, is more pertinent.

Moreover, routes often deliver aggregated data beyond the primary database object, catering to specific client needs. For instance, creating a data object via a route might not only return the entity's data but also route-specific metrics, such as the executing user's permissions related to the entity. Alternatively, a route might automatically generate default child entities following the creation of a parent object. Consequently, the route event encapsulates a unified dataset encompassing both the parent and its children, in contrast to individual events triggered for each entity created. Therefore, subscribing to route events can offer a richer, more contextually relevant set of information aligned with business logic.

The payload of a route event mirrors the REST response JSON of the route, providing a direct and comprehensive reflection of the data and metadata communicated to the client. This ensures that subscribers to route events receive a payload that encapsulates both the primary data involved and any additional information deemed significant at the business level, facilitating a deeper understanding and integration of the service's functional outcomes.

## Route Event agentoverride-retrived

**Event topic** : `lrmwufitcheck-agenthub-service-agentoverride-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentOverride` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentOverride`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentOverride",
  "method": "GET",
  "action": "get",
  "appVersion": "Version",
  "rowCount": 1,
  "sys_agentOverride": {
    "id": "ID",
    "agentName": "String",
    "provider": "String",
    "model": "String",
    "systemPrompt": "Text",
    "temperature": "Double",
    "maxTokens": "Integer",
    "responseFormat": "String",
    "selectedTools": "Object",
    "guardrails": "Object",
    "enabled": "Boolean",
    "updatedBy": "ID",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": true
  }
}
```

## Route Event agentoverrides-listed

**Event topic** : `lrmwufitcheck-agenthub-service-agentoverrides-listed`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentOverrides` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentOverrides`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentOverrides",
  "method": "GET",
  "action": "list",
  "appVersion": "Version",
  "rowCount": "\"Number\"",
  "sys_agentOverrides": [
    {
      "id": "ID",
      "agentName": "String",
      "provider": "String",
      "model": "String",
      "systemPrompt": "Text",
      "temperature": "Double",
      "maxTokens": "Integer",
      "responseFormat": "String",
      "selectedTools": "Object",
      "guardrails": "Object",
      "enabled": "Boolean",
      "updatedBy": "ID",
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

## Route Event agentoverride-created

**Event topic** : `lrmwufitcheck-agenthub-service-agentoverride-created`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentOverride` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentOverride`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentOverride",
  "method": "POST",
  "action": "create",
  "appVersion": "Version",
  "rowCount": 1,
  "sys_agentOverride": {
    "id": "ID",
    "agentName": "String",
    "provider": "String",
    "model": "String",
    "systemPrompt": "Text",
    "temperature": "Double",
    "maxTokens": "Integer",
    "responseFormat": "String",
    "selectedTools": "Object",
    "guardrails": "Object",
    "enabled": "Boolean",
    "updatedBy": "ID",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": true
  }
}
```

## Route Event agentoverride-updated

**Event topic** : `lrmwufitcheck-agenthub-service-agentoverride-updated`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentOverride` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentOverride`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentOverride",
  "method": "PATCH",
  "action": "update",
  "appVersion": "Version",
  "rowCount": 1,
  "sys_agentOverride": {
    "id": "ID",
    "agentName": "String",
    "provider": "String",
    "model": "String",
    "systemPrompt": "Text",
    "temperature": "Double",
    "maxTokens": "Integer",
    "responseFormat": "String",
    "selectedTools": "Object",
    "guardrails": "Object",
    "enabled": "Boolean",
    "updatedBy": "ID",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": true
  }
}
```

## Route Event agentoverride-deleted

**Event topic** : `lrmwufitcheck-agenthub-service-agentoverride-deleted`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentOverride` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentOverride`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentOverride",
  "method": "DELETE",
  "action": "delete",
  "appVersion": "Version",
  "rowCount": 1,
  "sys_agentOverride": {
    "id": "ID",
    "agentName": "String",
    "provider": "String",
    "model": "String",
    "systemPrompt": "Text",
    "temperature": "Double",
    "maxTokens": "Integer",
    "responseFormat": "String",
    "selectedTools": "Object",
    "guardrails": "Object",
    "enabled": "Boolean",
    "updatedBy": "ID",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": false
  }
}
```

## Route Event toolcatalog-listed

**Event topic** : `lrmwufitcheck-agenthub-service-toolcatalog-listed`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_toolCatalogs` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_toolCatalogs`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_toolCatalogs",
  "method": "GET",
  "action": "list",
  "appVersion": "Version",
  "rowCount": "\"Number\"",
  "sys_toolCatalogs": [
    {
      "id": "ID",
      "toolName": "String",
      "serviceName": "String",
      "description": "Text",
      "parameters": "Object",
      "lastRefreshed": "Date",
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

## Route Event toolcatalogentry-retrived

**Event topic** : `lrmwufitcheck-agenthub-service-toolcatalogentry-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_toolCatalog` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_toolCatalog`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_toolCatalog",
  "method": "GET",
  "action": "get",
  "appVersion": "Version",
  "rowCount": 1,
  "sys_toolCatalog": {
    "id": "ID",
    "toolName": "String",
    "serviceName": "String",
    "description": "Text",
    "parameters": "Object",
    "lastRefreshed": "Date",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": true
  }
}
```

## Route Event agentexecutions-listed

**Event topic** : `lrmwufitcheck-agenthub-service-agentexecutions-listed`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentExecutions` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentExecutions`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentExecutions",
  "method": "GET",
  "action": "list",
  "appVersion": "Version",
  "rowCount": "\"Number\"",
  "sys_agentExecutions": [
    {
      "id": "ID",
      "agentName": "String",
      "agentType": "Enum",
      "agentType_idx": "Integer",
      "source": "Enum",
      "source_idx": "Integer",
      "userId": "ID",
      "input": "Object",
      "output": "Object",
      "toolCalls": "Integer",
      "tokenUsage": "Object",
      "durationMs": "Integer",
      "status": "Enum",
      "status_idx": "Integer",
      "error": "Text",
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

## Route Event agentexecution-retrived

**Event topic** : `lrmwufitcheck-agenthub-service-agentexecution-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentExecution` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentExecution`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentExecution",
  "method": "GET",
  "action": "get",
  "appVersion": "Version",
  "rowCount": 1,
  "sys_agentExecution": {
    "id": "ID",
    "agentName": "String",
    "agentType": "Enum",
    "agentType_idx": "Integer",
    "source": "Enum",
    "source_idx": "Integer",
    "userId": "ID",
    "input": "Object",
    "output": "Object",
    "toolCalls": "Integer",
    "tokenUsage": "Object",
    "durationMs": "Integer",
    "status": "Enum",
    "status_idx": "Integer",
    "error": "Text",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": true
  }
}
```

## Route Event agentchats-listed

**Event topic** : `lrmwufitcheck-agenthub-service-agentchats-listed`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentConversations` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentConversations`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentConversations",
  "method": "GET",
  "action": "list",
  "appVersion": "Version",
  "rowCount": "\"Number\"",
  "sys_agentConversations": [
    {
      "id": "ID",
      "sessionId": "String",
      "agentName": "String",
      "userId": "ID",
      "messages": "Object",
      "messageCount": "Integer",
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

## Route Event agentchatmessages-retrived

**Event topic** : `lrmwufitcheck-agenthub-service-agentchatmessages-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentConversation` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentConversation`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentConversation",
  "method": "GET",
  "action": "get",
  "appVersion": "Version",
  "rowCount": 1,
  "sys_agentConversation": {
    "id": "ID",
    "sessionId": "String",
    "agentName": "String",
    "userId": "ID",
    "messages": "Object",
    "messageCount": "Integer",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": true
  }
}
```

## Index Event sys_toolcatalog-created

**Event topic**: `elastic-index-fitcheck_sys_toolcatalog-created`

**Event payload**:

```json
{
  "id": "ID",
  "toolName": "String",
  "serviceName": "String",
  "description": "Text",
  "parameters": "Object",
  "lastRefreshed": "Date",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

## Index Event sys_toolcatalog-updated

**Event topic**: `elastic-index-fitcheck_sys_toolcatalog-created`

**Event payload**:

```json
{
  "id": "ID",
  "toolName": "String",
  "serviceName": "String",
  "description": "Text",
  "parameters": "Object",
  "lastRefreshed": "Date",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

## Index Event sys_toolcatalog-deleted

**Event topic**: `elastic-index-fitcheck_sys_toolcatalog-deleted`

**Event payload**:

```json
{
  "id": "ID",
  "toolName": "String",
  "serviceName": "String",
  "description": "Text",
  "parameters": "Object",
  "lastRefreshed": "Date",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

## Index Event sys_toolcatalog-extended

**Event topic**: `elastic-index-fitcheck_sys_toolcatalog-extended`

**Event payload**:

```js
{
  id: id,
  extends: {
    [extendName]: "Object",
    [extendName + "_count"]: "Number",
  },
}
```

# Route Events

Route events are emitted following the successful execution of a route. While most routes perform CRUD (Create, Read, Update, Delete) operations on data objects, resulting in route events that closely resemble database events, there are distinctions worth noting. A single route execution might trigger multiple CRUD actions and ElasticSearch indexing operations. However, for those primarily concerned with the overarching business logic and its outcomes, listening to the consolidated route event, published once at the conclusion of the route's execution, is more pertinent.

Moreover, routes often deliver aggregated data beyond the primary database object, catering to specific client needs. For instance, creating a data object via a route might not only return the entity's data but also route-specific metrics, such as the executing user's permissions related to the entity. Alternatively, a route might automatically generate default child entities following the creation of a parent object. Consequently, the route event encapsulates a unified dataset encompassing both the parent and its children, in contrast to individual events triggered for each entity created. Therefore, subscribing to route events can offer a richer, more contextually relevant set of information aligned with business logic.

The payload of a route event mirrors the REST response JSON of the route, providing a direct and comprehensive reflection of the data and metadata communicated to the client. This ensures that subscribers to route events receive a payload that encapsulates both the primary data involved and any additional information deemed significant at the business level, facilitating a deeper understanding and integration of the service's functional outcomes.

## Route Event agentoverride-retrived

**Event topic** : `lrmwufitcheck-agenthub-service-agentoverride-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentOverride` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentOverride`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentOverride",
  "method": "GET",
  "action": "get",
  "appVersion": "Version",
  "rowCount": 1,
  "sys_agentOverride": {
    "id": "ID",
    "agentName": "String",
    "provider": "String",
    "model": "String",
    "systemPrompt": "Text",
    "temperature": "Double",
    "maxTokens": "Integer",
    "responseFormat": "String",
    "selectedTools": "Object",
    "guardrails": "Object",
    "enabled": "Boolean",
    "updatedBy": "ID",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": true
  }
}
```

## Route Event agentoverrides-listed

**Event topic** : `lrmwufitcheck-agenthub-service-agentoverrides-listed`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentOverrides` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentOverrides`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentOverrides",
  "method": "GET",
  "action": "list",
  "appVersion": "Version",
  "rowCount": "\"Number\"",
  "sys_agentOverrides": [
    {
      "id": "ID",
      "agentName": "String",
      "provider": "String",
      "model": "String",
      "systemPrompt": "Text",
      "temperature": "Double",
      "maxTokens": "Integer",
      "responseFormat": "String",
      "selectedTools": "Object",
      "guardrails": "Object",
      "enabled": "Boolean",
      "updatedBy": "ID",
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

## Route Event agentoverride-created

**Event topic** : `lrmwufitcheck-agenthub-service-agentoverride-created`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentOverride` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentOverride`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentOverride",
  "method": "POST",
  "action": "create",
  "appVersion": "Version",
  "rowCount": 1,
  "sys_agentOverride": {
    "id": "ID",
    "agentName": "String",
    "provider": "String",
    "model": "String",
    "systemPrompt": "Text",
    "temperature": "Double",
    "maxTokens": "Integer",
    "responseFormat": "String",
    "selectedTools": "Object",
    "guardrails": "Object",
    "enabled": "Boolean",
    "updatedBy": "ID",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": true
  }
}
```

## Route Event agentoverride-updated

**Event topic** : `lrmwufitcheck-agenthub-service-agentoverride-updated`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentOverride` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentOverride`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentOverride",
  "method": "PATCH",
  "action": "update",
  "appVersion": "Version",
  "rowCount": 1,
  "sys_agentOverride": {
    "id": "ID",
    "agentName": "String",
    "provider": "String",
    "model": "String",
    "systemPrompt": "Text",
    "temperature": "Double",
    "maxTokens": "Integer",
    "responseFormat": "String",
    "selectedTools": "Object",
    "guardrails": "Object",
    "enabled": "Boolean",
    "updatedBy": "ID",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": true
  }
}
```

## Route Event agentoverride-deleted

**Event topic** : `lrmwufitcheck-agenthub-service-agentoverride-deleted`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentOverride` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentOverride`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentOverride",
  "method": "DELETE",
  "action": "delete",
  "appVersion": "Version",
  "rowCount": 1,
  "sys_agentOverride": {
    "id": "ID",
    "agentName": "String",
    "provider": "String",
    "model": "String",
    "systemPrompt": "Text",
    "temperature": "Double",
    "maxTokens": "Integer",
    "responseFormat": "String",
    "selectedTools": "Object",
    "guardrails": "Object",
    "enabled": "Boolean",
    "updatedBy": "ID",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": false
  }
}
```

## Route Event toolcatalog-listed

**Event topic** : `lrmwufitcheck-agenthub-service-toolcatalog-listed`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_toolCatalogs` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_toolCatalogs`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_toolCatalogs",
  "method": "GET",
  "action": "list",
  "appVersion": "Version",
  "rowCount": "\"Number\"",
  "sys_toolCatalogs": [
    {
      "id": "ID",
      "toolName": "String",
      "serviceName": "String",
      "description": "Text",
      "parameters": "Object",
      "lastRefreshed": "Date",
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

## Route Event toolcatalogentry-retrived

**Event topic** : `lrmwufitcheck-agenthub-service-toolcatalogentry-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_toolCatalog` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_toolCatalog`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_toolCatalog",
  "method": "GET",
  "action": "get",
  "appVersion": "Version",
  "rowCount": 1,
  "sys_toolCatalog": {
    "id": "ID",
    "toolName": "String",
    "serviceName": "String",
    "description": "Text",
    "parameters": "Object",
    "lastRefreshed": "Date",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": true
  }
}
```

## Route Event agentexecutions-listed

**Event topic** : `lrmwufitcheck-agenthub-service-agentexecutions-listed`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentExecutions` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentExecutions`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentExecutions",
  "method": "GET",
  "action": "list",
  "appVersion": "Version",
  "rowCount": "\"Number\"",
  "sys_agentExecutions": [
    {
      "id": "ID",
      "agentName": "String",
      "agentType": "Enum",
      "agentType_idx": "Integer",
      "source": "Enum",
      "source_idx": "Integer",
      "userId": "ID",
      "input": "Object",
      "output": "Object",
      "toolCalls": "Integer",
      "tokenUsage": "Object",
      "durationMs": "Integer",
      "status": "Enum",
      "status_idx": "Integer",
      "error": "Text",
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

## Route Event agentexecution-retrived

**Event topic** : `lrmwufitcheck-agenthub-service-agentexecution-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentExecution` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentExecution`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentExecution",
  "method": "GET",
  "action": "get",
  "appVersion": "Version",
  "rowCount": 1,
  "sys_agentExecution": {
    "id": "ID",
    "agentName": "String",
    "agentType": "Enum",
    "agentType_idx": "Integer",
    "source": "Enum",
    "source_idx": "Integer",
    "userId": "ID",
    "input": "Object",
    "output": "Object",
    "toolCalls": "Integer",
    "tokenUsage": "Object",
    "durationMs": "Integer",
    "status": "Enum",
    "status_idx": "Integer",
    "error": "Text",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": true
  }
}
```

## Route Event agentchats-listed

**Event topic** : `lrmwufitcheck-agenthub-service-agentchats-listed`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentConversations` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentConversations`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentConversations",
  "method": "GET",
  "action": "list",
  "appVersion": "Version",
  "rowCount": "\"Number\"",
  "sys_agentConversations": [
    {
      "id": "ID",
      "sessionId": "String",
      "agentName": "String",
      "userId": "ID",
      "messages": "Object",
      "messageCount": "Integer",
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

## Route Event agentchatmessages-retrived

**Event topic** : `lrmwufitcheck-agenthub-service-agentchatmessages-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentConversation` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentConversation`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentConversation",
  "method": "GET",
  "action": "get",
  "appVersion": "Version",
  "rowCount": 1,
  "sys_agentConversation": {
    "id": "ID",
    "sessionId": "String",
    "agentName": "String",
    "userId": "ID",
    "messages": "Object",
    "messageCount": "Integer",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": true
  }
}
```

## Index Event sys_agentconversation-created

**Event topic**: `elastic-index-fitcheck_sys_agentconversation-created`

**Event payload**:

```json
{
  "id": "ID",
  "sessionId": "String",
  "agentName": "String",
  "userId": "ID",
  "messages": "Object",
  "messageCount": "Integer",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

## Index Event sys_agentconversation-updated

**Event topic**: `elastic-index-fitcheck_sys_agentconversation-created`

**Event payload**:

```json
{
  "id": "ID",
  "sessionId": "String",
  "agentName": "String",
  "userId": "ID",
  "messages": "Object",
  "messageCount": "Integer",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

## Index Event sys_agentconversation-deleted

**Event topic**: `elastic-index-fitcheck_sys_agentconversation-deleted`

**Event payload**:

```json
{
  "id": "ID",
  "sessionId": "String",
  "agentName": "String",
  "userId": "ID",
  "messages": "Object",
  "messageCount": "Integer",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

## Index Event sys_agentconversation-extended

**Event topic**: `elastic-index-fitcheck_sys_agentconversation-extended`

**Event payload**:

```js
{
  id: id,
  extends: {
    [extendName]: "Object",
    [extendName + "_count"]: "Number",
  },
}
```

# Route Events

Route events are emitted following the successful execution of a route. While most routes perform CRUD (Create, Read, Update, Delete) operations on data objects, resulting in route events that closely resemble database events, there are distinctions worth noting. A single route execution might trigger multiple CRUD actions and ElasticSearch indexing operations. However, for those primarily concerned with the overarching business logic and its outcomes, listening to the consolidated route event, published once at the conclusion of the route's execution, is more pertinent.

Moreover, routes often deliver aggregated data beyond the primary database object, catering to specific client needs. For instance, creating a data object via a route might not only return the entity's data but also route-specific metrics, such as the executing user's permissions related to the entity. Alternatively, a route might automatically generate default child entities following the creation of a parent object. Consequently, the route event encapsulates a unified dataset encompassing both the parent and its children, in contrast to individual events triggered for each entity created. Therefore, subscribing to route events can offer a richer, more contextually relevant set of information aligned with business logic.

The payload of a route event mirrors the REST response JSON of the route, providing a direct and comprehensive reflection of the data and metadata communicated to the client. This ensures that subscribers to route events receive a payload that encapsulates both the primary data involved and any additional information deemed significant at the business level, facilitating a deeper understanding and integration of the service's functional outcomes.

## Route Event agentoverride-retrived

**Event topic** : `lrmwufitcheck-agenthub-service-agentoverride-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentOverride` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentOverride`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentOverride",
  "method": "GET",
  "action": "get",
  "appVersion": "Version",
  "rowCount": 1,
  "sys_agentOverride": {
    "id": "ID",
    "agentName": "String",
    "provider": "String",
    "model": "String",
    "systemPrompt": "Text",
    "temperature": "Double",
    "maxTokens": "Integer",
    "responseFormat": "String",
    "selectedTools": "Object",
    "guardrails": "Object",
    "enabled": "Boolean",
    "updatedBy": "ID",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": true
  }
}
```

## Route Event agentoverrides-listed

**Event topic** : `lrmwufitcheck-agenthub-service-agentoverrides-listed`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentOverrides` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentOverrides`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentOverrides",
  "method": "GET",
  "action": "list",
  "appVersion": "Version",
  "rowCount": "\"Number\"",
  "sys_agentOverrides": [
    {
      "id": "ID",
      "agentName": "String",
      "provider": "String",
      "model": "String",
      "systemPrompt": "Text",
      "temperature": "Double",
      "maxTokens": "Integer",
      "responseFormat": "String",
      "selectedTools": "Object",
      "guardrails": "Object",
      "enabled": "Boolean",
      "updatedBy": "ID",
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

## Route Event agentoverride-created

**Event topic** : `lrmwufitcheck-agenthub-service-agentoverride-created`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentOverride` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentOverride`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentOverride",
  "method": "POST",
  "action": "create",
  "appVersion": "Version",
  "rowCount": 1,
  "sys_agentOverride": {
    "id": "ID",
    "agentName": "String",
    "provider": "String",
    "model": "String",
    "systemPrompt": "Text",
    "temperature": "Double",
    "maxTokens": "Integer",
    "responseFormat": "String",
    "selectedTools": "Object",
    "guardrails": "Object",
    "enabled": "Boolean",
    "updatedBy": "ID",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": true
  }
}
```

## Route Event agentoverride-updated

**Event topic** : `lrmwufitcheck-agenthub-service-agentoverride-updated`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentOverride` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentOverride`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentOverride",
  "method": "PATCH",
  "action": "update",
  "appVersion": "Version",
  "rowCount": 1,
  "sys_agentOverride": {
    "id": "ID",
    "agentName": "String",
    "provider": "String",
    "model": "String",
    "systemPrompt": "Text",
    "temperature": "Double",
    "maxTokens": "Integer",
    "responseFormat": "String",
    "selectedTools": "Object",
    "guardrails": "Object",
    "enabled": "Boolean",
    "updatedBy": "ID",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": true
  }
}
```

## Route Event agentoverride-deleted

**Event topic** : `lrmwufitcheck-agenthub-service-agentoverride-deleted`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentOverride` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentOverride`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentOverride",
  "method": "DELETE",
  "action": "delete",
  "appVersion": "Version",
  "rowCount": 1,
  "sys_agentOverride": {
    "id": "ID",
    "agentName": "String",
    "provider": "String",
    "model": "String",
    "systemPrompt": "Text",
    "temperature": "Double",
    "maxTokens": "Integer",
    "responseFormat": "String",
    "selectedTools": "Object",
    "guardrails": "Object",
    "enabled": "Boolean",
    "updatedBy": "ID",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": false
  }
}
```

## Route Event toolcatalog-listed

**Event topic** : `lrmwufitcheck-agenthub-service-toolcatalog-listed`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_toolCatalogs` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_toolCatalogs`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_toolCatalogs",
  "method": "GET",
  "action": "list",
  "appVersion": "Version",
  "rowCount": "\"Number\"",
  "sys_toolCatalogs": [
    {
      "id": "ID",
      "toolName": "String",
      "serviceName": "String",
      "description": "Text",
      "parameters": "Object",
      "lastRefreshed": "Date",
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

## Route Event toolcatalogentry-retrived

**Event topic** : `lrmwufitcheck-agenthub-service-toolcatalogentry-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_toolCatalog` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_toolCatalog`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_toolCatalog",
  "method": "GET",
  "action": "get",
  "appVersion": "Version",
  "rowCount": 1,
  "sys_toolCatalog": {
    "id": "ID",
    "toolName": "String",
    "serviceName": "String",
    "description": "Text",
    "parameters": "Object",
    "lastRefreshed": "Date",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": true
  }
}
```

## Route Event agentexecutions-listed

**Event topic** : `lrmwufitcheck-agenthub-service-agentexecutions-listed`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentExecutions` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentExecutions`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentExecutions",
  "method": "GET",
  "action": "list",
  "appVersion": "Version",
  "rowCount": "\"Number\"",
  "sys_agentExecutions": [
    {
      "id": "ID",
      "agentName": "String",
      "agentType": "Enum",
      "agentType_idx": "Integer",
      "source": "Enum",
      "source_idx": "Integer",
      "userId": "ID",
      "input": "Object",
      "output": "Object",
      "toolCalls": "Integer",
      "tokenUsage": "Object",
      "durationMs": "Integer",
      "status": "Enum",
      "status_idx": "Integer",
      "error": "Text",
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

## Route Event agentexecution-retrived

**Event topic** : `lrmwufitcheck-agenthub-service-agentexecution-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentExecution` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentExecution`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentExecution",
  "method": "GET",
  "action": "get",
  "appVersion": "Version",
  "rowCount": 1,
  "sys_agentExecution": {
    "id": "ID",
    "agentName": "String",
    "agentType": "Enum",
    "agentType_idx": "Integer",
    "source": "Enum",
    "source_idx": "Integer",
    "userId": "ID",
    "input": "Object",
    "output": "Object",
    "toolCalls": "Integer",
    "tokenUsage": "Object",
    "durationMs": "Integer",
    "status": "Enum",
    "status_idx": "Integer",
    "error": "Text",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": true
  }
}
```

## Route Event agentchats-listed

**Event topic** : `lrmwufitcheck-agenthub-service-agentchats-listed`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentConversations` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentConversations`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentConversations",
  "method": "GET",
  "action": "list",
  "appVersion": "Version",
  "rowCount": "\"Number\"",
  "sys_agentConversations": [
    {
      "id": "ID",
      "sessionId": "String",
      "agentName": "String",
      "userId": "ID",
      "messages": "Object",
      "messageCount": "Integer",
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

## Route Event agentchatmessages-retrived

**Event topic** : `lrmwufitcheck-agenthub-service-agentchatmessages-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `sys_agentConversation` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`sys_agentConversation`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

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
  "dataName": "sys_agentConversation",
  "method": "GET",
  "action": "get",
  "appVersion": "Version",
  "rowCount": 1,
  "sys_agentConversation": {
    "id": "ID",
    "sessionId": "String",
    "agentName": "String",
    "userId": "ID",
    "messages": "Object",
    "messageCount": "Integer",
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID",
    "isActive": true
  }
}
```

# Copyright

All sources, documents and other digital materials are copyright of .

# About Us

For more information please visit our website: .

.
.
