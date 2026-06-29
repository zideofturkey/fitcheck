# Service Design Specification - Object Design for sys_agentExecution
**fitcheck-agenthub-service** documentation

## Document Overview
This document outlines the object design for the `sys_agentExecution` model in our application. It includes details about the model's attributes, relationships, and any specific validation or business logic that applies.

## sys_agentExecution Data Object

### Object Overview
**Description:** Agent execution log. Records each agent invocation with input, output, and performance metrics.

This object represents a core data structure within the service and acts as the blueprint for database interaction, API generation, and business logic enforcement. 
It is defined using the `ObjectSettings` pattern, which governs its behavior, access control, caching strategy, and integration points with other systems such as Stripe and Redis.

### Core Configuration
- **Soft Delete:** Disabled — Determines whether records are marked inactive (`isActive = false`) instead of being physically deleted.
- **Public Access:** accessProtected — If enabled, anonymous users may access this object’s data depending on API-level rules.








### Properties Schema


| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `agentName` | String | Yes | Agent that was executed. |
| `agentType` | Enum | Yes | Whether this was a design-time or dynamic agent. |
| `source` | Enum | Yes | How the agent was triggered. |
| `userId` | ID | No | User who triggered the execution. |
| `input` | Object | No | Request input (truncated for large payloads). |
| `output` | Object | No | Response output (truncated for large payloads). |
| `toolCalls` | Integer | No | Number of tool calls made during execution. |
| `tokenUsage` | Object | No | Token usage: { prompt, completion, total }. |
| `durationMs` | Integer | No | Execution time in milliseconds. |
| `status` | Enum | Yes | Execution status. |
| `error` | Text | No | Error message if execution failed. |
* Required properties are mandatory for creating objects and must be provided in the request body if no default value is set.
* Properties marked `Type[] (array)` MUST be sent as a JSON array (e.g. `["a","b"]`), even when only one value is present (`["a"]`). Sending a bare scalar fails validation.



### Default Values
Default values are automatically assigned to properties when a new object is created, if no value is provided in the request body.
Since default values are applied on db level, they should be literal values, not expressions.If you want to use expressions, you can use transposed parameters in any business API to set default values dynamically.

- **agentName**: 'default'
- **agentType**: "design"
- **source**: "rest"
- **status**: "success"


### Constant Properties

`agentName` `agentType` `source` `userId` `input` `output` `toolCalls` `tokenUsage` `durationMs` `status` `error`

Constant properties are defined to be immutable after creation, meaning they cannot be updated or changed once set. They are typically used for properties that should remain constant throughout the object's lifecycle.
A property is set to be constant if the `Allow Update` option is set to `false`.



 


### Enum Properties
Enum properties are defined with a set of allowed values, ensuring that only valid options can be assigned to them. 
The enum options value will be stored as strings in the database, 
but when a data object is created an addtional property with the same name plus an idx suffix will be created, which will hold the index of the selected enum option.
You can use the index property to sort by the enum value or when your enum options represent a sequence of values.

- **agentType**: [design, dynamic]

- **source**: [rest, sse, kafka, agent]

- **status**: [success, error, timeout]


 

 

### Elastic Search Indexing

`agentName` `agentType` `source` `userId` `toolCalls` `durationMs` `status`

Properties that are indexed in Elastic Search will be searchable via the Elastic Search API. 
While all properties are stored in the elastic search index of the data object, only those marked for Elastic Search indexing will be available for search queries.


### Database Indexing

`agentName` `agentType` `source` `userId` `status`

Properties that are indexed in the database will be optimized for query performance, allowing for faster data retrieval.
Make a property indexed in the database if you want to use it frequently in query filters or sorting.










### Filter Properties

`agentName` `agentType` `source` `userId` `status`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as API parameters in list APIs.
- **agentName**: String filters under URL key `agentName`
- **agentType**: Enum filters under URL key `agentType`
- **source**: Enum filters under URL key `source`
- **userId**: ID filters under URL key `userId`
- **status**: Enum filters under URL key `status`



  