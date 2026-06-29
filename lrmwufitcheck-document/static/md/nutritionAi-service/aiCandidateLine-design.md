# Service Design Specification - Object Design for aiCandidateLine
**fitcheck-nutritionai-service** documentation

## Document Overview
This document outlines the object design for the `aiCandidateLine` model in our application. It includes details about the model's attributes, relationships, and any specific validation or business logic that applies.

## aiCandidateLine Data Object

### Object Overview
**Description:** Represents a single food item detected within an AI candidate meal — stores AI-estimated gram amounts and nutrition values as a snapshot, along with confidence, reference source, and user&#39;s choice to save the food to their library.

This object represents a core data structure within the service and acts as the blueprint for database interaction, API generation, and business logic enforcement. 
It is defined using the `ObjectSettings` pattern, which governs its behavior, access control, caching strategy, and integration points with other systems such as Stripe and Redis.

### Core Configuration
- **Soft Delete:** Disabled — Determines whether records are marked inactive (`isActive = false`) instead of being physically deleted.
- **Public Access:** accessPrivate — If enabled, anonymous users may access this object’s data depending on API-level rules.








### Properties Schema


**Display Label Property:** `detectedFoodName` — This property is the default display label for records of this data object. Relation dropdowns and record references in the frontend will show the value of this property as the human-readable label.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `userId` | ID | Yes | - |
| `aiCandidateMealId` | ID | Yes | - |
| `detectedFoodName` | String | Yes | - |
| `estimatedGrams` | Double | Yes | - |
| `estimatedCalories` | Double | No | - |
| `estimatedProtein` | Double | No | - |
| `estimatedCarbohydrates` | Double | No | - |
| `estimatedFat` | Double | No | - |
| `estimatedSugar` | Double | No | - |
| `estimatedFiber` | Double | No | - |
| `quantityConfidence` | Double | No | - |
| `nutritionReference` | String | No | - |
| `saveAsFood` | Boolean | Yes | - |
* Required properties are mandatory for creating objects and must be provided in the request body if no default value is set.
* Properties marked `Type[] (array)` MUST be sent as a JSON array (e.g. `["a","b"]`), even when only one value is present (`["a"]`). Sending a bare scalar fails validation.



### Default Values
Default values are automatically assigned to properties when a new object is created, if no value is provided in the request body.
Since default values are applied on db level, they should be literal values, not expressions.If you want to use expressions, you can use transposed parameters in any business API to set default values dynamically.

- **userId**: '00000000-0000-0000-0000-000000000000'
- **aiCandidateMealId**: '00000000-0000-0000-0000-000000000000'
- **detectedFoodName**: 'default'
- **estimatedGrams**: 0.0
- **saveAsFood**: false


### Constant Properties

`userId` `aiCandidateMealId`

Constant properties are defined to be immutable after creation, meaning they cannot be updated or changed once set. They are typically used for properties that should remain constant throughout the object's lifecycle.
A property is set to be constant if the `Allow Update` option is set to `false`.



 



 

 

### Elastic Search Indexing

`userId` `aiCandidateMealId`

Properties that are indexed in Elastic Search will be searchable via the Elastic Search API. 
While all properties are stored in the elastic search index of the data object, only those marked for Elastic Search indexing will be available for search queries.


### Database Indexing

`userId` `aiCandidateMealId`

Properties that are indexed in the database will be optimized for query performance, allowing for faster data retrieval.
Make a property indexed in the database if you want to use it frequently in query filters or sorting.






### Relation Properties

`aiCandidateMealId`

Mindbricks supports relations between data objects, allowing you to define how objects are linked together.
You can define relations in the data object properties, which will be used to create foreign key constraints in the database.
For complex joins operations, Mindbricks supportsa BFF pattern, where you can view dynamic and static views based on Elastic Search Indexes.
Use db level relations for simple one-to-one or one-to-many relationships, and use BFF views for complex joins that require multiple data objects to be joined together.

- **aiCandidateMealId**: ID
Relation to `aiCandidateMeal`.id

The target object is a sibling object, meaning that the relation is a many-to-one or one-to-one relationship from this object to the target.

On Delete: Delete
Required: Yes


### Session-sourced Properties

`userId`

These properties are session-bound — their values are read from the authenticated session at create/update time and cannot be supplied in the request body.

- **userId**: ID property will be mapped to the session parameter `userId`.

This property is the data object's ownership field, used by ownership-based access control.





### Filter Properties

`userId` `aiCandidateMealId`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as API parameters in list APIs.
- **userId**: ID filters under URL key `userId`
- **aiCandidateMealId**: ID filters under URL key `aiCandidateMealId`



  