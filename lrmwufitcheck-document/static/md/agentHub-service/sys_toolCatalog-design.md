# Service Design Specification - Object Design for sys_toolCatalog
**fitcheck-agenthub-service** documentation

## Document Overview
This document outlines the object design for the `sys_toolCatalog` model in our application. It includes details about the model's attributes, relationships, and any specific validation or business logic that applies.

## sys_toolCatalog Data Object

### Object Overview
**Description:** Cached tool catalog discovered from project services. Refreshed periodically.

This object represents a core data structure within the service and acts as the blueprint for database interaction, API generation, and business logic enforcement. 
It is defined using the `ObjectSettings` pattern, which governs its behavior, access control, caching strategy, and integration points with other systems such as Stripe and Redis.

### Core Configuration
- **Soft Delete:** Disabled — Determines whether records are marked inactive (`isActive = false`) instead of being physically deleted.
- **Public Access:** accessProtected — If enabled, anonymous users may access this object’s data depending on API-level rules.








### Properties Schema


| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `toolName` | String | Yes | Full tool name (e.g., service:apiName). |
| `serviceName` | String | Yes | Source service name. |
| `description` | Text | No | Tool description. |
| `parameters` | Object | No | JSON Schema of tool parameters. |
| `lastRefreshed` | Date | No | When this tool was last discovered/refreshed. |
* Required properties are mandatory for creating objects and must be provided in the request body if no default value is set.
* Properties marked `Type[] (array)` MUST be sent as a JSON array (e.g. `["a","b"]`), even when only one value is present (`["a"]`). Sending a bare scalar fails validation.



### Default Values
Default values are automatically assigned to properties when a new object is created, if no value is provided in the request body.
Since default values are applied on db level, they should be literal values, not expressions.If you want to use expressions, you can use transposed parameters in any business API to set default values dynamically.

- **toolName**: 'default'
- **serviceName**: 'default'




 



 

 

### Elastic Search Indexing

`toolName` `serviceName` `description`

Properties that are indexed in Elastic Search will be searchable via the Elastic Search API. 
While all properties are stored in the elastic search index of the data object, only those marked for Elastic Search indexing will be available for search queries.


### Database Indexing

`toolName` `serviceName`

Properties that are indexed in the database will be optimized for query performance, allowing for faster data retrieval.
Make a property indexed in the database if you want to use it frequently in query filters or sorting.


### Unique Properties

`toolName`

Unique properties are enforced to have distinct values across all instances of the data object, preventing duplicate entries.
Note that a unique property is automatically indexed in the database so you will not need to set the `Indexed in DB` option.









### Filter Properties

`serviceName`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as API parameters in list APIs.
- **serviceName**: String filters under URL key `serviceName`



  