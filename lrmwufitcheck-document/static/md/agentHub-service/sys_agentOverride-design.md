# Service Design Specification - Object Design for sys_agentOverride
**fitcheck-agenthub-service** documentation

## Document Overview
This document outlines the object design for the `sys_agentOverride` model in our application. It includes details about the model's attributes, relationships, and any specific validation or business logic that applies.

## sys_agentOverride Data Object

### Object Overview
**Description:** Runtime overrides for design-time agents. Null fields use the design default.

This object represents a core data structure within the service and acts as the blueprint for database interaction, API generation, and business logic enforcement. 
It is defined using the `ObjectSettings` pattern, which governs its behavior, access control, caching strategy, and integration points with other systems such as Stripe and Redis.

### Core Configuration
- **Soft Delete:** Disabled — Determines whether records are marked inactive (`isActive = false`) instead of being physically deleted.
- **Public Access:** accessProtected — If enabled, anonymous users may access this object’s data depending on API-level rules.








### Properties Schema


| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `agentName` | String | Yes | Design-time agent name this override applies to. |
| `provider` | String | No | Override AI provider (e.g., openai, anthropic). |
| `model` | String | No | Override model name. |
| `systemPrompt` | Text | No | Override system prompt. |
| `temperature` | Double | No | Override temperature (0-2). |
| `maxTokens` | Integer | No | Override max tokens. |
| `responseFormat` | String | No | Override response format (text/json). |
| `selectedTools` | Object | No | Array of tool names from the catalog that this agent can use. |
| `guardrails` | Object | No | Override guardrails: { maxToolCalls, timeout, maxTokenBudget }. |
| `enabled` | Boolean | Yes | Enable or disable this agent. |
| `updatedBy` | ID | No | User who last updated this override. |
* Required properties are mandatory for creating objects and must be provided in the request body if no default value is set.
* Properties marked `Type[] (array)` MUST be sent as a JSON array (e.g. `["a","b"]`), even when only one value is present (`["a"]`). Sending a bare scalar fails validation.



### Default Values
Default values are automatically assigned to properties when a new object is created, if no value is provided in the request body.
Since default values are applied on db level, they should be literal values, not expressions.If you want to use expressions, you can use transposed parameters in any business API to set default values dynamically.

- **agentName**: 'default'
- **enabled**: true


### Constant Properties

`agentName`

Constant properties are defined to be immutable after creation, meaning they cannot be updated or changed once set. They are typically used for properties that should remain constant throughout the object's lifecycle.
A property is set to be constant if the `Allow Update` option is set to `false`.



 



 

 

### Elastic Search Indexing

`agentName` `enabled`

Properties that are indexed in Elastic Search will be searchable via the Elastic Search API. 
While all properties are stored in the elastic search index of the data object, only those marked for Elastic Search indexing will be available for search queries.


### Database Indexing

`agentName` `enabled`

Properties that are indexed in the database will be optimized for query performance, allowing for faster data retrieval.
Make a property indexed in the database if you want to use it frequently in query filters or sorting.


### Unique Properties

`agentName`

Unique properties are enforced to have distinct values across all instances of the data object, preventing duplicate entries.
Note that a unique property is automatically indexed in the database so you will not need to set the `Indexed in DB` option.






### Session-sourced Properties

`updatedBy`

These properties are session-bound — their values are read from the authenticated session at create/update time and cannot be supplied in the request body.

- **updatedBy**: ID property will be mapped to the session parameter `userId`.







  