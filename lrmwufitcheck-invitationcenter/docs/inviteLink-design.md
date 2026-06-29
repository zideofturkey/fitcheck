# Service Design Specification - Object Design for inviteLink

**fitcheck-invitationcenter-service** documentation

## Document Overview

This document outlines the object design for the `inviteLink` model in our application. It includes details about the model's attributes, relationships, and any specific validation or business logic that applies.

## inviteLink Data Object

### Object Overview

**Description:** Stores a unique invite registration token with usage rules, lifecycle state, delivery tracking, and a reference to the registered user created as a result of the invite.

This object represents a core data structure within the service and acts as the blueprint for database interaction, API generation, and business logic enforcement.
It is defined using the `ObjectSettings` pattern, which governs its behavior, access control, caching strategy, and integration points with other systems such as Stripe and Redis.

### Core Configuration

- **Soft Delete:** Disabled — Determines whether records are marked inactive (`isActive = false`) instead of being physically deleted.
- **Public Access:** accessPrivate — If enabled, anonymous users may access this object’s data depending on API-level rules.

### Composite Indexes

- **inviteCodeUniqueIndex**: [inviteCode]
  This composite index is defined to optimize query performance for complex queries involving multiple fields.

The index also defines a conflict resolution strategy for duplicate key violations.

When a new record would violate this composite index, the following action will be taken:

**On Duplicate**: `throwError`

An error will be thrown, preventing the insertion of conflicting data.

### Properties Schema

| Property              | Type    | Required | Description |
| --------------------- | ------- | -------- | ----------- |
| `ownerUserId`         | ID      | Yes      | -           |
| `inviteCode`          | String  | Yes      | -           |
| `invitedEmail`        | String  | No       | -           |
| `usageMode`           | Enum    | Yes      | -           |
| `usageLimit`          | Integer | No       | -           |
| `usageCount`          | Integer | Yes      | -           |
| `inviteState`         | Enum    | Yes      | -           |
| `expiresAt`           | Date    | No       | -           |
| `lastUsedAt`          | Date    | No       | -           |
| `registeredUserId`    | ID      | No       | -           |
| `deliveryRequestedAt` | Date    | No       | -           |
| `lastDeliveredAt`     | Date    | No       | -           |

- Required properties are mandatory for creating objects and must be provided in the request body if no default value is set.
- Properties marked `Type[] (array)` MUST be sent as a JSON array (e.g. `["a","b"]`), even when only one value is present (`["a"]`). Sending a bare scalar fails validation.

### Default Values

Default values are automatically assigned to properties when a new object is created, if no value is provided in the request body.
Since default values are applied on db level, they should be literal values, not expressions.If you want to use expressions, you can use transposed parameters in any business API to set default values dynamically.

- **ownerUserId**: '00000000-0000-0000-0000-000000000000'
- **inviteCode**: 'default'
- **usageMode**: "singleUse"
- **usageCount**: 0
- **inviteState**: "draft"

### Constant Properties

`ownerUserId` `inviteCode` `usageMode`

Constant properties are defined to be immutable after creation, meaning they cannot be updated or changed once set. They are typically used for properties that should remain constant throughout the object's lifecycle.
A property is set to be constant if the `Allow Update` option is set to `false`.

### Enum Properties

Enum properties are defined with a set of allowed values, ensuring that only valid options can be assigned to them.
The enum options value will be stored as strings in the database,
but when a data object is created an addtional property with the same name plus an idx suffix will be created, which will hold the index of the selected enum option.
You can use the index property to sort by the enum value or when your enum options represent a sequence of values.

- **usageMode**: [singleUse, limitedUse]

- **inviteState**: [draft, active, exhausted, revoked, expired, consumed]

### Database Indexing

`ownerUserId` `inviteCode` `usageMode` `inviteState`

Properties that are indexed in the database will be optimized for query performance, allowing for faster data retrieval.
Make a property indexed in the database if you want to use it frequently in query filters or sorting.

### Unique Properties

`inviteCode`

Unique properties are enforced to have distinct values across all instances of the data object, preventing duplicate entries.
Note that a unique property is automatically indexed in the database so you will not need to set the `Indexed in DB` option.

### Secondary Key Properties

`inviteCode`

Secondary key properties are used to create an additional indexed identifiers for the data object, allowing for alternative access patterns.
Different than normal indexed properties, secondary keys will act as primary keys and Mindbricks will provide automatic secondary key db utility functions to access the data object by the secondary key.

### Session-sourced Properties

`ownerUserId`

These properties are session-bound — their values are read from the authenticated session at create/update time and cannot be supplied in the request body.

- **ownerUserId**: ID property will be mapped to the session parameter `userId`.

This property is the data object's ownership field, used by ownership-based access control.

### Filter Properties

`usageMode` `inviteState`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as API parameters in list APIs.

- **usageMode**: Enum filters under URL key `usageMode`
- **inviteState**: Enum filters under URL key `inviteState`
