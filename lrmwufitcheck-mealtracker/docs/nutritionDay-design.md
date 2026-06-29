# Service Design Specification - Object Design for nutritionDay

**fitcheck-mealtracker-service** documentation

## Document Overview

This document outlines the object design for the `nutritionDay` model in our application. It includes details about the model's attributes, relationships, and any specific validation or business logic that applies.

## nutritionDay Data Object

### Object Overview

**Description:** A daily rollup record per user storing consumed totals for all six macros alongside the target values active on that day, plus exceeded metric flags and meal count. Created/updated whenever meals are logged or edited.

This object represents a core data structure within the service and acts as the blueprint for database interaction, API generation, and business logic enforcement.
It is defined using the `ObjectSettings` pattern, which governs its behavior, access control, caching strategy, and integration points with other systems such as Stripe and Redis.

### Core Configuration

- **Soft Delete:** Disabled — Determines whether records are marked inactive (`isActive = false`) instead of being physically deleted.
- **Public Access:** accessPrivate — If enabled, anonymous users may access this object’s data depending on API-level rules.

### Composite Indexes

- **nutritionDayUserDateIdx**: [userId, summaryDate]
  This composite index is defined to optimize query performance for complex queries involving multiple fields.

The index also defines a conflict resolution strategy for duplicate key violations.

When a new record would violate this composite index, the following action will be taken:

**On Duplicate**: `doUpdate`

The existing record will be updated with the new data.No error will be thrown.

### Properties Schema

| Property                | Type    | Required | Description |
| ----------------------- | ------- | -------- | ----------- |
| `userId`                | ID      | Yes      | -           |
| `summaryDate`           | Date    | Yes      | -           |
| `consumedCalories`      | Double  | Yes      | -           |
| `consumedProtein`       | Double  | Yes      | -           |
| `consumedCarbohydrates` | Double  | Yes      | -           |
| `consumedFat`           | Double  | Yes      | -           |
| `consumedSugar`         | Double  | Yes      | -           |
| `consumedFiber`         | Double  | Yes      | -           |
| `targetCalories`        | Double  | Yes      | -           |
| `targetProtein`         | Double  | Yes      | -           |
| `targetCarbohydrates`   | Double  | Yes      | -           |
| `targetFat`             | Double  | Yes      | -           |
| `targetSugar`           | Double  | Yes      | -           |
| `targetFiber`           | Double  | Yes      | -           |
| `exceededMetrics`       | String  | No       | -           |
| `mealCount`             | Integer | Yes      | -           |

- Required properties are mandatory for creating objects and must be provided in the request body if no default value is set.
- Properties marked `Type[] (array)` MUST be sent as a JSON array (e.g. `["a","b"]`), even when only one value is present (`["a"]`). Sending a bare scalar fails validation.

### Default Values

Default values are automatically assigned to properties when a new object is created, if no value is provided in the request body.
Since default values are applied on db level, they should be literal values, not expressions.If you want to use expressions, you can use transposed parameters in any business API to set default values dynamically.

- **userId**: '00000000-0000-0000-0000-000000000000'
- **summaryDate**: new Date()
- **consumedCalories**: 0.0
- **consumedProtein**: 0.0
- **consumedCarbohydrates**: 0.0
- **consumedFat**: 0.0
- **consumedSugar**: 0.0
- **consumedFiber**: 0.0
- **targetCalories**: 0.0
- **targetProtein**: 0.0
- **targetCarbohydrates**: 0.0
- **targetFat**: 0.0
- **targetSugar**: 0.0
- **targetFiber**: 0.0
- **mealCount**: 0

### Constant Properties

`userId` `summaryDate`

Constant properties are defined to be immutable after creation, meaning they cannot be updated or changed once set. They are typically used for properties that should remain constant throughout the object's lifecycle.
A property is set to be constant if the `Allow Update` option is set to `false`.

### Elastic Search Indexing

`userId` `summaryDate`

Properties that are indexed in Elastic Search will be searchable via the Elastic Search API.
While all properties are stored in the elastic search index of the data object, only those marked for Elastic Search indexing will be available for search queries.

### Database Indexing

`userId` `summaryDate`

Properties that are indexed in the database will be optimized for query performance, allowing for faster data retrieval.
Make a property indexed in the database if you want to use it frequently in query filters or sorting.

### Session-sourced Properties

`userId`

These properties are session-bound — their values are read from the authenticated session at create/update time and cannot be supplied in the request body.

- **userId**: ID property will be mapped to the session parameter `userId`.

This property is the data object's ownership field, used by ownership-based access control.

### Filter Properties

`summaryDate`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as API parameters in list APIs.

- **summaryDate**: Date filters under URL key `summaryDate`
