# EVENT GUIDE

## fitcheck-nutritionlibrary-service

Manages each user&#39;s private macro targets, personal food library, and reusable preset meal templates with auto-calculated nutrition totals.

## Architectural Design Credit and Contact Information

The architectural design of this microservice is credited to . For inquiries, feedback, or further information regarding the architecture, please direct your communication to:

Email:

We encourage open communication and welcome any questions or discussions related to the architectural aspects of this microservice.

# Documentation Scope

Welcome to the official documentation for the `NutritionLibrary` Service Event descriptions. This guide is dedicated to detailing how to subscribe to and listen for state changes within the `NutritionLibrary` Service, offering an exclusive focus on event subscription mechanisms.

**Intended Audience**

This documentation is aimed at developers and integrators looking to monitor `NutritionLibrary` Service state changes. It is especially relevant for those wishing to implement or enhance business logic based on interactions with `NutritionLibrary` objects.

**Overview**

This section provides detailed instructions on monitoring service events, covering payload structures and demonstrating typical use cases through examples.

# Authentication and Authorization

Access to the `NutritionLibrary` service's events is facilitated through the project's Kafka server, which is not accessible to the public. Subscription to a Kafka topic requires being on the same network and possessing valid Kafka user credentials. This document presupposes that readers have existing access to the Kafka server.

Additionally, the service offers a public subscription option via REST for real-time data management in frontend applications, secured through REST API authentication and authorization mechanisms. To subscribe to service events via the REST API, please consult the Realtime REST API Guide.

# Database Events

Database events are triggered at the database layer, automatically and atomically, in response to any modifications at the data level. These events serve to notify subscribers about the creation, update, or deletion of objects within the database, distinct from any overarching business logic.

Listening to database events is particularly beneficial for those focused on tracking changes at the database level. A typical use case for subscribing to database events is to replicate the data store of one service within another service's scope, ensuring data consistency and syncronization across services.

For example, while a business operation such as "approve membership" might generate a high-level business event like `membership-approved`, the underlying database changes could involve multiple state updates to different entities. These might be published as separate events, such as `dbevent-member-updated` and `dbevent-user-updated`, reflecting the granular changes at the database level.

Such detailed eventing provides a robust foundation for building responsive, data-driven applications, enabling fine-grained observability and reaction to the dynamics of the data landscape. It also facilitates the architectural pattern of event sourcing, where state changes are captured as a sequence of events, allowing for high-fidelity data replication and history replay for analytical or auditing purposes.

## DbEvent macroTarget-created

**Event topic**: `lrmwufitcheck-nutritionlibrary-service-dbevent-macrotarget-created`

This event is triggered upon the creation of a `macroTarget` data object in the database. The event payload encompasses the newly created data, encapsulated within the root of the paylod.

**Event payload**:

```json
{
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
```

## DbEvent macroTarget-updated

**Event topic**: `lrmwufitcheck-nutritionlibrary-service-dbevent-macrotarget-updated`

Activation of this event follows the update of a `macroTarget` data object. The payload contains the updated information under the `macroTarget` attribute, along with the original data prior to update, labeled as `old_macroTarget` and also you can find the old and new versions of updated-only portion of the data..

**Event payload**:

```json
{
old_macroTarget:{"id":"ID","userId":"ID","calorieTarget":"Double","proteinTarget":"Double","carbohydrateTarget":"Double","fatTarget":"Double","sugarTarget":"Double","fiberTarget":"Double","effectiveFrom":"Date","isActive":true,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date","_owner":"ID"},
macroTarget:{"id":"ID","userId":"ID","calorieTarget":"Double","proteinTarget":"Double","carbohydrateTarget":"Double","fatTarget":"Double","sugarTarget":"Double","fiberTarget":"Double","effectiveFrom":"Date","isActive":true,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date","_owner":"ID"},
oldDataValues,
newDataValues
}
```

## DbEvent macroTarget-deleted

**Event topic**: `lrmwufitcheck-nutritionlibrary-service-dbevent-macrotarget-deleted`

This event announces the deletion of a `macroTarget` data object, covering both hard deletions (permanent removal) and soft deletions (where the `isActive` attribute is set to false). Regardless of the deletion type, the event payload will present the data as it was immediately before deletion, highlighting an `isActive` status of false for soft deletions.

**Event payload**:

```json
{
  "id": "ID",
  "userId": "ID",
  "calorieTarget": "Double",
  "proteinTarget": "Double",
  "carbohydrateTarget": "Double",
  "fatTarget": "Double",
  "sugarTarget": "Double",
  "fiberTarget": "Double",
  "effectiveFrom": "Date",
  "isActive": false,
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

## DbEvent foodItem-created

**Event topic**: `lrmwufitcheck-nutritionlibrary-service-dbevent-fooditem-created`

This event is triggered upon the creation of a `foodItem` data object in the database. The event payload encompasses the newly created data, encapsulated within the root of the paylod.

**Event payload**:

```json
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
}
```

## DbEvent foodItem-updated

**Event topic**: `lrmwufitcheck-nutritionlibrary-service-dbevent-fooditem-updated`

Activation of this event follows the update of a `foodItem` data object. The payload contains the updated information under the `foodItem` attribute, along with the original data prior to update, labeled as `old_foodItem` and also you can find the old and new versions of updated-only portion of the data..

**Event payload**:

```json
{
old_foodItem:{"id":"ID","userId":"ID","foodName":"String","caloriePer100g":"Double","proteinPer100g":"Double","carbohydratePer100g":"Double","fatPer100g":"Double","sugarPer100g":"Double","fiberPer100g":"Double","brandName":"String","foodCategory":"String","creationSource":"Enum","creationSource_idx":"Integer","isActive":true,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date","_owner":"ID"},
foodItem:{"id":"ID","userId":"ID","foodName":"String","caloriePer100g":"Double","proteinPer100g":"Double","carbohydratePer100g":"Double","fatPer100g":"Double","sugarPer100g":"Double","fiberPer100g":"Double","brandName":"String","foodCategory":"String","creationSource":"Enum","creationSource_idx":"Integer","isActive":true,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date","_owner":"ID"},
oldDataValues,
newDataValues
}
```

## DbEvent foodItem-deleted

**Event topic**: `lrmwufitcheck-nutritionlibrary-service-dbevent-fooditem-deleted`

This event announces the deletion of a `foodItem` data object, covering both hard deletions (permanent removal) and soft deletions (where the `isActive` attribute is set to false). Regardless of the deletion type, the event payload will present the data as it was immediately before deletion, highlighting an `isActive` status of false for soft deletions.

**Event payload**:

```json
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
  "isActive": false,
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

## DbEvent presetMeal-created

**Event topic**: `lrmwufitcheck-nutritionlibrary-service-dbevent-presetmeal-created`

This event is triggered upon the creation of a `presetMeal` data object in the database. The event payload encompasses the newly created data, encapsulated within the root of the paylod.

**Event payload**:

```json
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
}
```

## DbEvent presetMeal-updated

**Event topic**: `lrmwufitcheck-nutritionlibrary-service-dbevent-presetmeal-updated`

Activation of this event follows the update of a `presetMeal` data object. The payload contains the updated information under the `presetMeal` attribute, along with the original data prior to update, labeled as `old_presetMeal` and also you can find the old and new versions of updated-only portion of the data..

**Event payload**:

```json
{
old_presetMeal:{"id":"ID","userId":"ID","templateName":"String","descriptionText":"String","totalCalories":"Double","totalProtein":"Double","totalCarbohydrates":"Double","totalFat":"Double","totalSugar":"Double","totalFiber":"Double","isActive":true,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date","_owner":"ID"},
presetMeal:{"id":"ID","userId":"ID","templateName":"String","descriptionText":"String","totalCalories":"Double","totalProtein":"Double","totalCarbohydrates":"Double","totalFat":"Double","totalSugar":"Double","totalFiber":"Double","isActive":true,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date","_owner":"ID"},
oldDataValues,
newDataValues
}
```

## DbEvent presetMeal-deleted

**Event topic**: `lrmwufitcheck-nutritionlibrary-service-dbevent-presetmeal-deleted`

This event announces the deletion of a `presetMeal` data object, covering both hard deletions (permanent removal) and soft deletions (where the `isActive` attribute is set to false). Regardless of the deletion type, the event payload will present the data as it was immediately before deletion, highlighting an `isActive` status of false for soft deletions.

**Event payload**:

```json
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
  "isActive": false,
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

## DbEvent presetLine-created

**Event topic**: `lrmwufitcheck-nutritionlibrary-service-dbevent-presetline-created`

This event is triggered upon the creation of a `presetLine` data object in the database. The event payload encompasses the newly created data, encapsulated within the root of the paylod.

**Event payload**:

```json
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
  "_owner": "ID"
}
```

## DbEvent presetLine-updated

**Event topic**: `lrmwufitcheck-nutritionlibrary-service-dbevent-presetline-updated`

Activation of this event follows the update of a `presetLine` data object. The payload contains the updated information under the `presetLine` attribute, along with the original data prior to update, labeled as `old_presetLine` and also you can find the old and new versions of updated-only portion of the data..

**Event payload**:

```json
{
old_presetLine:{"id":"ID","presetMealId":"ID","foodItemId":"ID","lineFoodName":"String","gramAmount":"Double","lineCalories":"Double","lineProtein":"Double","lineCarbohydrates":"Double","lineFat":"Double","lineSugar":"Double","lineFiber":"Double","isActive":true,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date","_owner":"ID"},
presetLine:{"id":"ID","presetMealId":"ID","foodItemId":"ID","lineFoodName":"String","gramAmount":"Double","lineCalories":"Double","lineProtein":"Double","lineCarbohydrates":"Double","lineFat":"Double","lineSugar":"Double","lineFiber":"Double","isActive":true,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date","_owner":"ID"},
oldDataValues,
newDataValues
}
```

## DbEvent presetLine-deleted

**Event topic**: `lrmwufitcheck-nutritionlibrary-service-dbevent-presetline-deleted`

This event announces the deletion of a `presetLine` data object, covering both hard deletions (permanent removal) and soft deletions (where the `isActive` attribute is set to false). Regardless of the deletion type, the event payload will present the data as it was immediately before deletion, highlighting an `isActive` status of false for soft deletions.

**Event payload**:

```json
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
  "isActive": false,
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "_owner": "ID"
}
```

# ElasticSearch Index Events

Within the `NutritionLibrary` service, most data objects are mirrored in ElasticSearch indices, ensuring these indices remain syncronized with their database counterparts through creation, updates, and deletions. These indices serve dual purposes: they act as a data source for external services and furnish aggregated data tailored to enhance frontend user experiences. Consequently, an ElasticSearch index might encapsulate data in its original form or aggregate additional information from other data objects.

These aggregations can include both one-to-one and one-to-many relationships not only with database objects within the same service but also across different services. This capability allows developers to access comprehensive, aggregated data efficiently. By subscribing to ElasticSearch index events, developers are notified when an index is updated and can directly obtain the aggregated entity within the event payload, bypassing the need for separate ElasticSearch queries.

It's noteworthy that some services may augment another service's index by appending to the entity’s `extends` object. In such scenarios, an `*-extended` event will contain only the newly added data. Should you require the complete dataset, you would need to retrieve the full ElasticSearch index entity using the provided ID.

This approach to indexing and event handling facilitates a modular, interconnected architecture where services can seamlessly integrate and react to changes, enriching the overall data ecosystem and enabling more dynamic, responsive applications.

## Index Event macrotarget-created

**Event topic**: `elastic-index-fitcheck_macrotarget-created`

**Event payload**:

```json
{
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
```

## Index Event macrotarget-updated

**Event topic**: `elastic-index-fitcheck_macrotarget-created`

**Event payload**:

```json
{
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
```

## Index Event macrotarget-deleted

**Event topic**: `elastic-index-fitcheck_macrotarget-deleted`

**Event payload**:

```json
{
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
```

## Index Event macrotarget-extended

**Event topic**: `elastic-index-fitcheck_macrotarget-extended`

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

## Index Event fooditem-created

**Event topic**: `elastic-index-fitcheck_fooditem-created`

**Event payload**:

```json
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
}
```

## Index Event fooditem-updated

**Event topic**: `elastic-index-fitcheck_fooditem-created`

**Event payload**:

```json
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
}
```

## Index Event fooditem-deleted

**Event topic**: `elastic-index-fitcheck_fooditem-deleted`

**Event payload**:

```json
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
}
```

## Index Event fooditem-extended

**Event topic**: `elastic-index-fitcheck_fooditem-extended`

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

## Index Event presetmeal-created

**Event topic**: `elastic-index-fitcheck_presetmeal-created`

**Event payload**:

```json
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
}
```

## Index Event presetmeal-updated

**Event topic**: `elastic-index-fitcheck_presetmeal-created`

**Event payload**:

```json
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
}
```

## Index Event presetmeal-deleted

**Event topic**: `elastic-index-fitcheck_presetmeal-deleted`

**Event payload**:

```json
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
}
```

## Index Event presetmeal-extended

**Event topic**: `elastic-index-fitcheck_presetmeal-extended`

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

## Index Event presetline-created

**Event topic**: `elastic-index-fitcheck_presetline-created`

**Event payload**:

```json
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
  "_owner": "ID"
}
```

## Index Event presetline-updated

**Event topic**: `elastic-index-fitcheck_presetline-created`

**Event payload**:

```json
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
  "_owner": "ID"
}
```

## Index Event presetline-deleted

**Event topic**: `elastic-index-fitcheck_presetline-deleted`

**Event payload**:

```json
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
  "_owner": "ID"
}
```

## Index Event presetline-extended

**Event topic**: `elastic-index-fitcheck_presetline-extended`

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
