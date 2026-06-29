# Service Design Specification - Object Design for presetLine
**fitcheck-nutritionlibrary-service** documentation

## Document Overview
This document outlines the object design for the `presetLine` model in our application. It includes details about the model's attributes, relationships, and any specific validation or business logic that applies.

## presetLine Data Object

### Object Overview
**Description:** A single food item entry within a preset meal template. Stores a gram amount and snapshot nutrition values calculated at line creation. Lines are created or deleted to modify a preset; individual lines are not edited (replace pattern).

This object represents a core data structure within the service and acts as the blueprint for database interaction, API generation, and business logic enforcement. 
It is defined using the `ObjectSettings` pattern, which governs its behavior, access control, caching strategy, and integration points with other systems such as Stripe and Redis.

### Core Configuration
- **Soft Delete:** Enabled — Determines whether records are marked inactive (`isActive = false`) instead of being physically deleted.
- **Public Access:** accessPrivate — If enabled, anonymous users may access this object’s data depending on API-level rules.








### Properties Schema


**Display Label Property:** `lineFoodName` — This property is the default display label for records of this data object. Relation dropdowns and record references in the frontend will show the value of this property as the human-readable label.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `presetMealId` | ID | Yes | - |
| `foodItemId` | ID | Yes | - |
| `lineFoodName` | String | Yes | - |
| `gramAmount` | Double | Yes | - |
| `lineCalories` | Double | Yes | - |
| `lineProtein` | Double | Yes | - |
| `lineCarbohydrates` | Double | Yes | - |
| `lineFat` | Double | Yes | - |
| `lineSugar` | Double | Yes | - |
| `lineFiber` | Double | Yes | - |
* Required properties are mandatory for creating objects and must be provided in the request body if no default value is set.
* Properties marked `Type[] (array)` MUST be sent as a JSON array (e.g. `["a","b"]`), even when only one value is present (`["a"]`). Sending a bare scalar fails validation.



### Default Values
Default values are automatically assigned to properties when a new object is created, if no value is provided in the request body.
Since default values are applied on db level, they should be literal values, not expressions.If you want to use expressions, you can use transposed parameters in any business API to set default values dynamically.

- **presetMealId**: '00000000-0000-0000-0000-000000000000'
- **foodItemId**: '00000000-0000-0000-0000-000000000000'
- **lineFoodName**: 'default'
- **gramAmount**: 0.0
- **lineCalories**: 0.0
- **lineProtein**: 0.0
- **lineCarbohydrates**: 0.0
- **lineFat**: 0.0
- **lineSugar**: 0.0
- **lineFiber**: 0.0


### Constant Properties

`presetMealId` `foodItemId` `lineFoodName` `gramAmount` `lineCalories` `lineProtein` `lineCarbohydrates` `lineFat` `lineSugar` `lineFiber`

Constant properties are defined to be immutable after creation, meaning they cannot be updated or changed once set. They are typically used for properties that should remain constant throughout the object's lifecycle.
A property is set to be constant if the `Allow Update` option is set to `false`.



 



 

 

### Elastic Search Indexing

`presetMealId`

Properties that are indexed in Elastic Search will be searchable via the Elastic Search API. 
While all properties are stored in the elastic search index of the data object, only those marked for Elastic Search indexing will be available for search queries.


### Database Indexing

`presetMealId` `foodItemId`

Properties that are indexed in the database will be optimized for query performance, allowing for faster data retrieval.
Make a property indexed in the database if you want to use it frequently in query filters or sorting.






### Relation Properties

`presetMealId` `foodItemId`

Mindbricks supports relations between data objects, allowing you to define how objects are linked together.
You can define relations in the data object properties, which will be used to create foreign key constraints in the database.
For complex joins operations, Mindbricks supportsa BFF pattern, where you can view dynamic and static views based on Elastic Search Indexes.
Use db level relations for simple one-to-one or one-to-many relationships, and use BFF views for complex joins that require multiple data objects to be joined together.

- **presetMealId**: ID
Relation to `presetMeal`.id

The target object is a sibling object, meaning that the relation is a many-to-one or one-to-one relationship from this object to the target.

On Delete: Delete
Required: Yes

- **foodItemId**: ID
Relation to `foodItem`.id

The target object is a sibling object, meaning that the relation is a many-to-one or one-to-one relationship from this object to the target.

On Delete: Delete
Required: Yes





### Filter Properties

`presetMealId`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as API parameters in list APIs.
- **presetMealId**: ID filters under URL key `presetMealId`



  