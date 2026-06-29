# EVENT GUIDE

## fitcheck-nutritionai-service

Processes natural-language Turkish meal descriptions into structured nutrition intents, answers personalized nutrition questions with live meal-log and macro-target context, and maintains operational traceability for all AI parsing and guidance interactions.

## Architectural Design Credit and Contact Information

The architectural design of this microservice is credited to . For inquiries, feedback, or further information regarding the architecture, please direct your communication to:

Email:

We encourage open communication and welcome any questions or discussions related to the architectural aspects of this microservice.

# Documentation Scope

Welcome to the official documentation for the `NutritionAi` Service Event descriptions. This guide is dedicated to detailing how to subscribe to and listen for state changes within the `NutritionAi` Service, offering an exclusive focus on event subscription mechanisms.

**Intended Audience**

This documentation is aimed at developers and integrators looking to monitor `NutritionAi` Service state changes. It is especially relevant for those wishing to implement or enhance business logic based on interactions with `NutritionAi` objects.

**Overview**

This section provides detailed instructions on monitoring service events, covering payload structures and demonstrating typical use cases through examples.

# Authentication and Authorization

Access to the `NutritionAi` service's events is facilitated through the project's Kafka server, which is not accessible to the public. Subscription to a Kafka topic requires being on the same network and possessing valid Kafka user credentials. This document presupposes that readers have existing access to the Kafka server.

Additionally, the service offers a public subscription option via REST for real-time data management in frontend applications, secured through REST API authentication and authorization mechanisms. To subscribe to service events via the REST API, please consult the Realtime REST API Guide.

# Database Events

Database events are triggered at the database layer, automatically and atomically, in response to any modifications at the data level. These events serve to notify subscribers about the creation, update, or deletion of objects within the database, distinct from any overarching business logic.

Listening to database events is particularly beneficial for those focused on tracking changes at the database level. A typical use case for subscribing to database events is to replicate the data store of one service within another service's scope, ensuring data consistency and syncronization across services.

For example, while a business operation such as "approve membership" might generate a high-level business event like `membership-approved`, the underlying database changes could involve multiple state updates to different entities. These might be published as separate events, such as `dbevent-member-updated` and `dbevent-user-updated`, reflecting the granular changes at the database level.

Such detailed eventing provides a robust foundation for building responsive, data-driven applications, enabling fine-grained observability and reaction to the dynamics of the data landscape. It also facilitates the architectural pattern of event sourcing, where state changes are captured as a sequence of events, allowing for high-fidelity data replication and history replay for analytical or auditing purposes.

## DbEvent aiSession-created

**Event topic**: `lrmwufitcheck-nutritionai-service-dbevent-aisession-created`

This event is triggered upon the creation of a `aiSession` data object in the database. The event payload encompasses the newly created data, encapsulated within the root of the paylod.

**Event payload**:

```json
{
  "id": "ID",
  "userId": "ID",
  "sessionType": "Enum",
  "sessionType_idx": "Integer",
  "inputText": "Text",
  "detectedLanguage": "String",
  "sessionState": "Enum",
  "sessionState_idx": "Integer",
  "confidenceScore": "Double",
  "finalResponseText": "Text",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

## DbEvent aiSession-updated

**Event topic**: `lrmwufitcheck-nutritionai-service-dbevent-aisession-updated`

Activation of this event follows the update of a `aiSession` data object. The payload contains the updated information under the `aiSession` attribute, along with the original data prior to update, labeled as `old_aiSession` and also you can find the old and new versions of updated-only portion of the data..

**Event payload**:

```json
{
old_aiSession:{"id":"ID","userId":"ID","sessionType":"Enum","sessionType_idx":"Integer","inputText":"Text","detectedLanguage":"String","sessionState":"Enum","sessionState_idx":"Integer","confidenceScore":"Double","finalResponseText":"Text","recordVersion":"Integer","createdAt":"Date","updatedAt":"Date","_owner":"ID"},
aiSession:{"id":"ID","userId":"ID","sessionType":"Enum","sessionType_idx":"Integer","inputText":"Text","detectedLanguage":"String","sessionState":"Enum","sessionState_idx":"Integer","confidenceScore":"Double","finalResponseText":"Text","recordVersion":"Integer","createdAt":"Date","updatedAt":"Date","_owner":"ID"},
oldDataValues,
newDataValues
}
```

## DbEvent aiSession-deleted

**Event topic**: `lrmwufitcheck-nutritionai-service-dbevent-aisession-deleted`

This event announces the deletion of a `aiSession` data object, covering both hard deletions (permanent removal) and soft deletions (where the `isActive` attribute is set to false). Regardless of the deletion type, the event payload will present the data as it was immediately before deletion, highlighting an `isActive` status of false for soft deletions.

**Event payload**:

```json
{
  "id": "ID",
  "userId": "ID",
  "sessionType": "Enum",
  "sessionType_idx": "Integer",
  "inputText": "Text",
  "detectedLanguage": "String",
  "sessionState": "Enum",
  "sessionState_idx": "Integer",
  "confidenceScore": "Double",
  "finalResponseText": "Text",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID",
  "isActive": false
}
```

## DbEvent aiCandidateMeal-created

**Event topic**: `lrmwufitcheck-nutritionai-service-dbevent-aicandidatemeal-created`

This event is triggered upon the creation of a `aiCandidateMeal` data object in the database. The event payload encompasses the newly created data, encapsulated within the root of the paylod.

**Event payload**:

```json
{
  "id": "ID",
  "userId": "ID",
  "aiSessionId": "ID",
  "proposedMealDate": "Date",
  "proposedMealTime": "String",
  "proposedSlotName": "String",
  "candidateSource": "Enum",
  "candidateSource_idx": "Integer",
  "warningText": "Text",
  "confirmationRequired": "Boolean",
  "isConfirmed": "Boolean",
  "isCommitted": "Boolean",
  "totalCalories": "Double",
  "totalProtein": "Double",
  "totalCarbohydrates": "Double",
  "totalFat": "Double",
  "totalSugar": "Double",
  "totalFiber": "Double",
  "committedMealLogId": "ID",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

## DbEvent aiCandidateMeal-updated

**Event topic**: `lrmwufitcheck-nutritionai-service-dbevent-aicandidatemeal-updated`

Activation of this event follows the update of a `aiCandidateMeal` data object. The payload contains the updated information under the `aiCandidateMeal` attribute, along with the original data prior to update, labeled as `old_aiCandidateMeal` and also you can find the old and new versions of updated-only portion of the data..

**Event payload**:

```json
{
old_aiCandidateMeal:{"id":"ID","userId":"ID","aiSessionId":"ID","proposedMealDate":"Date","proposedMealTime":"String","proposedSlotName":"String","candidateSource":"Enum","candidateSource_idx":"Integer","warningText":"Text","confirmationRequired":"Boolean","isConfirmed":"Boolean","isCommitted":"Boolean","totalCalories":"Double","totalProtein":"Double","totalCarbohydrates":"Double","totalFat":"Double","totalSugar":"Double","totalFiber":"Double","committedMealLogId":"ID","recordVersion":"Integer","createdAt":"Date","updatedAt":"Date","_owner":"ID"},
aiCandidateMeal:{"id":"ID","userId":"ID","aiSessionId":"ID","proposedMealDate":"Date","proposedMealTime":"String","proposedSlotName":"String","candidateSource":"Enum","candidateSource_idx":"Integer","warningText":"Text","confirmationRequired":"Boolean","isConfirmed":"Boolean","isCommitted":"Boolean","totalCalories":"Double","totalProtein":"Double","totalCarbohydrates":"Double","totalFat":"Double","totalSugar":"Double","totalFiber":"Double","committedMealLogId":"ID","recordVersion":"Integer","createdAt":"Date","updatedAt":"Date","_owner":"ID"},
oldDataValues,
newDataValues
}
```

## DbEvent aiCandidateMeal-deleted

**Event topic**: `lrmwufitcheck-nutritionai-service-dbevent-aicandidatemeal-deleted`

This event announces the deletion of a `aiCandidateMeal` data object, covering both hard deletions (permanent removal) and soft deletions (where the `isActive` attribute is set to false). Regardless of the deletion type, the event payload will present the data as it was immediately before deletion, highlighting an `isActive` status of false for soft deletions.

**Event payload**:

```json
{
  "id": "ID",
  "userId": "ID",
  "aiSessionId": "ID",
  "proposedMealDate": "Date",
  "proposedMealTime": "String",
  "proposedSlotName": "String",
  "candidateSource": "Enum",
  "candidateSource_idx": "Integer",
  "warningText": "Text",
  "confirmationRequired": "Boolean",
  "isConfirmed": "Boolean",
  "isCommitted": "Boolean",
  "totalCalories": "Double",
  "totalProtein": "Double",
  "totalCarbohydrates": "Double",
  "totalFat": "Double",
  "totalSugar": "Double",
  "totalFiber": "Double",
  "committedMealLogId": "ID",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID",
  "isActive": false
}
```

## DbEvent aiCandidateLine-created

**Event topic**: `lrmwufitcheck-nutritionai-service-dbevent-aicandidateline-created`

This event is triggered upon the creation of a `aiCandidateLine` data object in the database. The event payload encompasses the newly created data, encapsulated within the root of the paylod.

**Event payload**:

```json
{
  "id": "ID",
  "userId": "ID",
  "aiCandidateMealId": "ID",
  "detectedFoodName": "String",
  "estimatedGrams": "Double",
  "estimatedCalories": "Double",
  "estimatedProtein": "Double",
  "estimatedCarbohydrates": "Double",
  "estimatedFat": "Double",
  "estimatedSugar": "Double",
  "estimatedFiber": "Double",
  "quantityConfidence": "Double",
  "nutritionReference": "String",
  "saveAsFood": "Boolean",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

## DbEvent aiCandidateLine-updated

**Event topic**: `lrmwufitcheck-nutritionai-service-dbevent-aicandidateline-updated`

Activation of this event follows the update of a `aiCandidateLine` data object. The payload contains the updated information under the `aiCandidateLine` attribute, along with the original data prior to update, labeled as `old_aiCandidateLine` and also you can find the old and new versions of updated-only portion of the data..

**Event payload**:

```json
{
old_aiCandidateLine:{"id":"ID","userId":"ID","aiCandidateMealId":"ID","detectedFoodName":"String","estimatedGrams":"Double","estimatedCalories":"Double","estimatedProtein":"Double","estimatedCarbohydrates":"Double","estimatedFat":"Double","estimatedSugar":"Double","estimatedFiber":"Double","quantityConfidence":"Double","nutritionReference":"String","saveAsFood":"Boolean","recordVersion":"Integer","createdAt":"Date","updatedAt":"Date","_owner":"ID"},
aiCandidateLine:{"id":"ID","userId":"ID","aiCandidateMealId":"ID","detectedFoodName":"String","estimatedGrams":"Double","estimatedCalories":"Double","estimatedProtein":"Double","estimatedCarbohydrates":"Double","estimatedFat":"Double","estimatedSugar":"Double","estimatedFiber":"Double","quantityConfidence":"Double","nutritionReference":"String","saveAsFood":"Boolean","recordVersion":"Integer","createdAt":"Date","updatedAt":"Date","_owner":"ID"},
oldDataValues,
newDataValues
}
```

## DbEvent aiCandidateLine-deleted

**Event topic**: `lrmwufitcheck-nutritionai-service-dbevent-aicandidateline-deleted`

This event announces the deletion of a `aiCandidateLine` data object, covering both hard deletions (permanent removal) and soft deletions (where the `isActive` attribute is set to false). Regardless of the deletion type, the event payload will present the data as it was immediately before deletion, highlighting an `isActive` status of false for soft deletions.

**Event payload**:

```json
{
  "id": "ID",
  "userId": "ID",
  "aiCandidateMealId": "ID",
  "detectedFoodName": "String",
  "estimatedGrams": "Double",
  "estimatedCalories": "Double",
  "estimatedProtein": "Double",
  "estimatedCarbohydrates": "Double",
  "estimatedFat": "Double",
  "estimatedSugar": "Double",
  "estimatedFiber": "Double",
  "quantityConfidence": "Double",
  "nutritionReference": "String",
  "saveAsFood": "Boolean",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID",
  "isActive": false
}
```

## DbEvent aiGuidanceNote-created

**Event topic**: `lrmwufitcheck-nutritionai-service-dbevent-aiguidancenote-created`

This event is triggered upon the creation of a `aiGuidanceNote` data object in the database. The event payload encompasses the newly created data, encapsulated within the root of the paylod.

**Event payload**:

```json
{
  "id": "ID",
  "userId": "ID",
  "aiSessionId": "ID",
  "questionType": "String",
  "contextRange": "String",
  "answerSummary": "Text",
  "rationaleText": "Text",
  "referencedMetricKeys": "String",
  "cautionText": "Text",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

## DbEvent aiGuidanceNote-updated

**Event topic**: `lrmwufitcheck-nutritionai-service-dbevent-aiguidancenote-updated`

Activation of this event follows the update of a `aiGuidanceNote` data object. The payload contains the updated information under the `aiGuidanceNote` attribute, along with the original data prior to update, labeled as `old_aiGuidanceNote` and also you can find the old and new versions of updated-only portion of the data..

**Event payload**:

```json
{
old_aiGuidanceNote:{"id":"ID","userId":"ID","aiSessionId":"ID","questionType":"String","contextRange":"String","answerSummary":"Text","rationaleText":"Text","referencedMetricKeys":"String","cautionText":"Text","recordVersion":"Integer","createdAt":"Date","updatedAt":"Date","_owner":"ID"},
aiGuidanceNote:{"id":"ID","userId":"ID","aiSessionId":"ID","questionType":"String","contextRange":"String","answerSummary":"Text","rationaleText":"Text","referencedMetricKeys":"String","cautionText":"Text","recordVersion":"Integer","createdAt":"Date","updatedAt":"Date","_owner":"ID"},
oldDataValues,
newDataValues
}
```

## DbEvent aiGuidanceNote-deleted

**Event topic**: `lrmwufitcheck-nutritionai-service-dbevent-aiguidancenote-deleted`

This event announces the deletion of a `aiGuidanceNote` data object, covering both hard deletions (permanent removal) and soft deletions (where the `isActive` attribute is set to false). Regardless of the deletion type, the event payload will present the data as it was immediately before deletion, highlighting an `isActive` status of false for soft deletions.

**Event payload**:

```json
{
  "id": "ID",
  "userId": "ID",
  "aiSessionId": "ID",
  "questionType": "String",
  "contextRange": "String",
  "answerSummary": "Text",
  "rationaleText": "Text",
  "referencedMetricKeys": "String",
  "cautionText": "Text",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID",
  "isActive": false
}
```

# ElasticSearch Index Events

Within the `NutritionAi` service, most data objects are mirrored in ElasticSearch indices, ensuring these indices remain syncronized with their database counterparts through creation, updates, and deletions. These indices serve dual purposes: they act as a data source for external services and furnish aggregated data tailored to enhance frontend user experiences. Consequently, an ElasticSearch index might encapsulate data in its original form or aggregate additional information from other data objects.

These aggregations can include both one-to-one and one-to-many relationships not only with database objects within the same service but also across different services. This capability allows developers to access comprehensive, aggregated data efficiently. By subscribing to ElasticSearch index events, developers are notified when an index is updated and can directly obtain the aggregated entity within the event payload, bypassing the need for separate ElasticSearch queries.

It's noteworthy that some services may augment another service's index by appending to the entity’s `extends` object. In such scenarios, an `*-extended` event will contain only the newly added data. Should you require the complete dataset, you would need to retrieve the full ElasticSearch index entity using the provided ID.

This approach to indexing and event handling facilitates a modular, interconnected architecture where services can seamlessly integrate and react to changes, enriching the overall data ecosystem and enabling more dynamic, responsive applications.

## Index Event aisession-created

**Event topic**: `elastic-index-fitcheck_aisession-created`

**Event payload**:

```json
{
  "id": "ID",
  "userId": "ID",
  "sessionType": "Enum",
  "sessionType_idx": "Integer",
  "inputText": "Text",
  "detectedLanguage": "String",
  "sessionState": "Enum",
  "sessionState_idx": "Integer",
  "confidenceScore": "Double",
  "finalResponseText": "Text",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

## Index Event aisession-updated

**Event topic**: `elastic-index-fitcheck_aisession-created`

**Event payload**:

```json
{
  "id": "ID",
  "userId": "ID",
  "sessionType": "Enum",
  "sessionType_idx": "Integer",
  "inputText": "Text",
  "detectedLanguage": "String",
  "sessionState": "Enum",
  "sessionState_idx": "Integer",
  "confidenceScore": "Double",
  "finalResponseText": "Text",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

## Index Event aisession-deleted

**Event topic**: `elastic-index-fitcheck_aisession-deleted`

**Event payload**:

```json
{
  "id": "ID",
  "userId": "ID",
  "sessionType": "Enum",
  "sessionType_idx": "Integer",
  "inputText": "Text",
  "detectedLanguage": "String",
  "sessionState": "Enum",
  "sessionState_idx": "Integer",
  "confidenceScore": "Double",
  "finalResponseText": "Text",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

## Index Event aisession-extended

**Event topic**: `elastic-index-fitcheck_aisession-extended`

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

## Index Event aicandidatemeal-created

**Event topic**: `elastic-index-fitcheck_aicandidatemeal-created`

**Event payload**:

```json
{
  "id": "ID",
  "userId": "ID",
  "aiSessionId": "ID",
  "proposedMealDate": "Date",
  "proposedMealTime": "String",
  "proposedSlotName": "String",
  "candidateSource": "Enum",
  "candidateSource_idx": "Integer",
  "warningText": "Text",
  "confirmationRequired": "Boolean",
  "isConfirmed": "Boolean",
  "isCommitted": "Boolean",
  "totalCalories": "Double",
  "totalProtein": "Double",
  "totalCarbohydrates": "Double",
  "totalFat": "Double",
  "totalSugar": "Double",
  "totalFiber": "Double",
  "committedMealLogId": "ID",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

## Index Event aicandidatemeal-updated

**Event topic**: `elastic-index-fitcheck_aicandidatemeal-created`

**Event payload**:

```json
{
  "id": "ID",
  "userId": "ID",
  "aiSessionId": "ID",
  "proposedMealDate": "Date",
  "proposedMealTime": "String",
  "proposedSlotName": "String",
  "candidateSource": "Enum",
  "candidateSource_idx": "Integer",
  "warningText": "Text",
  "confirmationRequired": "Boolean",
  "isConfirmed": "Boolean",
  "isCommitted": "Boolean",
  "totalCalories": "Double",
  "totalProtein": "Double",
  "totalCarbohydrates": "Double",
  "totalFat": "Double",
  "totalSugar": "Double",
  "totalFiber": "Double",
  "committedMealLogId": "ID",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

## Index Event aicandidatemeal-deleted

**Event topic**: `elastic-index-fitcheck_aicandidatemeal-deleted`

**Event payload**:

```json
{
  "id": "ID",
  "userId": "ID",
  "aiSessionId": "ID",
  "proposedMealDate": "Date",
  "proposedMealTime": "String",
  "proposedSlotName": "String",
  "candidateSource": "Enum",
  "candidateSource_idx": "Integer",
  "warningText": "Text",
  "confirmationRequired": "Boolean",
  "isConfirmed": "Boolean",
  "isCommitted": "Boolean",
  "totalCalories": "Double",
  "totalProtein": "Double",
  "totalCarbohydrates": "Double",
  "totalFat": "Double",
  "totalSugar": "Double",
  "totalFiber": "Double",
  "committedMealLogId": "ID",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

## Index Event aicandidatemeal-extended

**Event topic**: `elastic-index-fitcheck_aicandidatemeal-extended`

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

## Index Event aicandidateline-created

**Event topic**: `elastic-index-fitcheck_aicandidateline-created`

**Event payload**:

```json
{
  "id": "ID",
  "userId": "ID",
  "aiCandidateMealId": "ID",
  "detectedFoodName": "String",
  "estimatedGrams": "Double",
  "estimatedCalories": "Double",
  "estimatedProtein": "Double",
  "estimatedCarbohydrates": "Double",
  "estimatedFat": "Double",
  "estimatedSugar": "Double",
  "estimatedFiber": "Double",
  "quantityConfidence": "Double",
  "nutritionReference": "String",
  "saveAsFood": "Boolean",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

## Index Event aicandidateline-updated

**Event topic**: `elastic-index-fitcheck_aicandidateline-created`

**Event payload**:

```json
{
  "id": "ID",
  "userId": "ID",
  "aiCandidateMealId": "ID",
  "detectedFoodName": "String",
  "estimatedGrams": "Double",
  "estimatedCalories": "Double",
  "estimatedProtein": "Double",
  "estimatedCarbohydrates": "Double",
  "estimatedFat": "Double",
  "estimatedSugar": "Double",
  "estimatedFiber": "Double",
  "quantityConfidence": "Double",
  "nutritionReference": "String",
  "saveAsFood": "Boolean",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

## Index Event aicandidateline-deleted

**Event topic**: `elastic-index-fitcheck_aicandidateline-deleted`

**Event payload**:

```json
{
  "id": "ID",
  "userId": "ID",
  "aiCandidateMealId": "ID",
  "detectedFoodName": "String",
  "estimatedGrams": "Double",
  "estimatedCalories": "Double",
  "estimatedProtein": "Double",
  "estimatedCarbohydrates": "Double",
  "estimatedFat": "Double",
  "estimatedSugar": "Double",
  "estimatedFiber": "Double",
  "quantityConfidence": "Double",
  "nutritionReference": "String",
  "saveAsFood": "Boolean",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

## Index Event aicandidateline-extended

**Event topic**: `elastic-index-fitcheck_aicandidateline-extended`

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

## Index Event aiguidancenote-created

**Event topic**: `elastic-index-fitcheck_aiguidancenote-created`

**Event payload**:

```json
{
  "id": "ID",
  "userId": "ID",
  "aiSessionId": "ID",
  "questionType": "String",
  "contextRange": "String",
  "answerSummary": "Text",
  "rationaleText": "Text",
  "referencedMetricKeys": "String",
  "cautionText": "Text",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

## Index Event aiguidancenote-updated

**Event topic**: `elastic-index-fitcheck_aiguidancenote-created`

**Event payload**:

```json
{
  "id": "ID",
  "userId": "ID",
  "aiSessionId": "ID",
  "questionType": "String",
  "contextRange": "String",
  "answerSummary": "Text",
  "rationaleText": "Text",
  "referencedMetricKeys": "String",
  "cautionText": "Text",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

## Index Event aiguidancenote-deleted

**Event topic**: `elastic-index-fitcheck_aiguidancenote-deleted`

**Event payload**:

```json
{
  "id": "ID",
  "userId": "ID",
  "aiSessionId": "ID",
  "questionType": "String",
  "contextRange": "String",
  "answerSummary": "Text",
  "rationaleText": "Text",
  "referencedMetricKeys": "String",
  "cautionText": "Text",
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

## Index Event aiguidancenote-extended

**Event topic**: `elastic-index-fitcheck_aiguidancenote-extended`

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

# Copyright

All sources, documents and other digital materials are copyright of .

# About Us

For more information please visit our website: .

.
.
