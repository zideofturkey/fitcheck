# Service Design Specification - Object Design for aiSession

**fitcheck-nutritionai-service** documentation

## Document Overview

This document outlines the object design for the `aiSession` model in our application. It includes details about the model's attributes, relationships, and any specific validation or business logic that applies.

## aiSession Data Object

### Object Overview

**Description:** Records every AI interaction initiated by a user — either a meal-parsing request or a nutrition guidance question — capturing the raw input, detected language, processing state, and final localized response.

This object represents a core data structure within the service and acts as the blueprint for database interaction, API generation, and business logic enforcement.
It is defined using the `ObjectSettings` pattern, which governs its behavior, access control, caching strategy, and integration points with other systems such as Stripe and Redis.

### Core Configuration

- **Soft Delete:** Disabled — Determines whether records are marked inactive (`isActive = false`) instead of being physically deleted.
- **Public Access:** accessPrivate — If enabled, anonymous users may access this object’s data depending on API-level rules.

### Properties Schema

| Property            | Type   | Required | Description |
| ------------------- | ------ | -------- | ----------- |
| `userId`            | ID     | Yes      | -           |
| `sessionType`       | Enum   | Yes      | -           |
| `inputText`         | Text   | Yes      | -           |
| `detectedLanguage`  | String | No       | -           |
| `sessionState`      | Enum   | Yes      | -           |
| `confidenceScore`   | Double | No       | -           |
| `finalResponseText` | Text   | No       | -           |

- Required properties are mandatory for creating objects and must be provided in the request body if no default value is set.
- Properties marked `Type[] (array)` MUST be sent as a JSON array (e.g. `["a","b"]`), even when only one value is present (`["a"]`). Sending a bare scalar fails validation.

### Default Values

Default values are automatically assigned to properties when a new object is created, if no value is provided in the request body.
Since default values are applied on db level, they should be literal values, not expressions.If you want to use expressions, you can use transposed parameters in any business API to set default values dynamically.

- **userId**: '00000000-0000-0000-0000-000000000000'
- **sessionType**: "mealParsing"
- **inputText**: 'text'
- **sessionState**: pending

### Constant Properties

`userId` `sessionType` `inputText`

Constant properties are defined to be immutable after creation, meaning they cannot be updated or changed once set. They are typically used for properties that should remain constant throughout the object's lifecycle.
A property is set to be constant if the `Allow Update` option is set to `false`.

### Enum Properties

Enum properties are defined with a set of allowed values, ensuring that only valid options can be assigned to them.
The enum options value will be stored as strings in the database,
but when a data object is created an addtional property with the same name plus an idx suffix will be created, which will hold the index of the selected enum option.
You can use the index property to sort by the enum value or when your enum options represent a sequence of values.

- **sessionType**: [mealParsing, nutritionGuidance]

- **sessionState**: [pending, needsConfirmation, completed, failed]

### Elastic Search Indexing

`userId` `sessionType` `sessionState`

Properties that are indexed in Elastic Search will be searchable via the Elastic Search API.
While all properties are stored in the elastic search index of the data object, only those marked for Elastic Search indexing will be available for search queries.

### Database Indexing

`userId` `sessionType` `sessionState`

Properties that are indexed in the database will be optimized for query performance, allowing for faster data retrieval.
Make a property indexed in the database if you want to use it frequently in query filters or sorting.

### Session-sourced Properties

`userId`

These properties are session-bound — their values are read from the authenticated session at create/update time and cannot be supplied in the request body.

- **userId**: ID property will be mapped to the session parameter `userId`.

This property is the data object's ownership field, used by ownership-based access control.

### Filter Properties

`userId` `sessionType` `sessionState`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as API parameters in list APIs.

- **userId**: ID filters under URL key `userId`
- **sessionType**: Enum filters under URL key `sessionType`
- **sessionState**: Enum filters under URL key `sessionState`
