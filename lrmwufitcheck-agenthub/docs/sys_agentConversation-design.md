# Service Design Specification - Object Design for sys_agentConversation

**fitcheck-agenthub-service** documentation

## Document Overview

This document outlines the object design for the `sys_agentConversation` model in our application. It includes details about the model's attributes, relationships, and any specific validation or business logic that applies.

## sys_agentConversation Data Object

### Object Overview

**Description:** Conversation history for chat-mode AI agents. One record per session, keyed by sessionId.

This object represents a core data structure within the service and acts as the blueprint for database interaction, API generation, and business logic enforcement.
It is defined using the `ObjectSettings` pattern, which governs its behavior, access control, caching strategy, and integration points with other systems such as Stripe and Redis.

### Core Configuration

- **Soft Delete:** Disabled — Determines whether records are marked inactive (`isActive = false`) instead of being physically deleted.
- **Public Access:** accessProtected — If enabled, anonymous users may access this object’s data depending on API-level rules.

### Properties Schema

| Property       | Type    | Required | Description                                                                   |
| -------------- | ------- | -------- | ----------------------------------------------------------------------------- |
| `sessionId`    | String  | Yes      | Unique conversation session identifier.                                       |
| `agentName`    | String  | Yes      | Name of the agent this conversation belongs to.                               |
| `userId`       | ID      | No       | User who owns this conversation.                                              |
| `messages`     | Object  | Yes      | Array of conversation messages [{role, content, tool_calls?, tool_call_id?}]. |
| `messageCount` | Integer | No       | Number of messages in the conversation.                                       |

- Required properties are mandatory for creating objects and must be provided in the request body if no default value is set.
- Properties marked `Type[] (array)` MUST be sent as a JSON array (e.g. `["a","b"]`), even when only one value is present (`["a"]`). Sending a bare scalar fails validation.

### Default Values

Default values are automatically assigned to properties when a new object is created, if no value is provided in the request body.
Since default values are applied on db level, they should be literal values, not expressions.If you want to use expressions, you can use transposed parameters in any business API to set default values dynamically.

- **sessionId**: 'default'
- **agentName**: 'default'
- **messages**: {}
- **messageCount**: 0

### Constant Properties

`sessionId` `agentName` `userId`

Constant properties are defined to be immutable after creation, meaning they cannot be updated or changed once set. They are typically used for properties that should remain constant throughout the object's lifecycle.
A property is set to be constant if the `Allow Update` option is set to `false`.

### Elastic Search Indexing

`sessionId` `agentName` `userId` `messageCount`

Properties that are indexed in Elastic Search will be searchable via the Elastic Search API.
While all properties are stored in the elastic search index of the data object, only those marked for Elastic Search indexing will be available for search queries.

### Database Indexing

`sessionId` `agentName` `userId`

Properties that are indexed in the database will be optimized for query performance, allowing for faster data retrieval.
Make a property indexed in the database if you want to use it frequently in query filters or sorting.

### Unique Properties

`sessionId`

Unique properties are enforced to have distinct values across all instances of the data object, preventing duplicate entries.
Note that a unique property is automatically indexed in the database so you will not need to set the `Indexed in DB` option.

### Session-sourced Properties

`userId`

These properties are session-bound — their values are read from the authenticated session at create/update time and cannot be supplied in the request body.

- **userId**: ID property will be mapped to the session parameter `userId`.

### Filter Properties

`agentName` `userId`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as API parameters in list APIs.

- **agentName**: String filters under URL key `agentName`
- **userId**: ID filters under URL key `userId`
