# Service Design Specification - Object Design for inviteAudit
**fitcheck-invitationcenter-service** documentation

## Document Overview
This document outlines the object design for the `inviteAudit` model in our application. It includes details about the model's attributes, relationships, and any specific validation or business logic that applies.

## inviteAudit Data Object

### Object Overview
**Description:** Append-only audit log capturing every lifecycle event on an invite link, including who acted, what happened, and optional contextual notes.

This object represents a core data structure within the service and acts as the blueprint for database interaction, API generation, and business logic enforcement. 
It is defined using the `ObjectSettings` pattern, which governs its behavior, access control, caching strategy, and integration points with other systems such as Stripe and Redis.

### Core Configuration
- **Soft Delete:** Disabled — Determines whether records are marked inactive (`isActive = false`) instead of being physically deleted.
- **Public Access:** accessPrivate — If enabled, anonymous users may access this object’s data depending on API-level rules.








### Properties Schema


| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `inviteLinkId` | ID | Yes | - |
| `eventType` | Enum | Yes | - |
| `eventAt` | Date | Yes | - |
| `actorUserId` | ID | No | - |
| `eventNote` | String | No | - |
| `relatedEmail` | String | No | - |
* Required properties are mandatory for creating objects and must be provided in the request body if no default value is set.
* Properties marked `Type[] (array)` MUST be sent as a JSON array (e.g. `["a","b"]`), even when only one value is present (`["a"]`). Sending a bare scalar fails validation.



### Default Values
Default values are automatically assigned to properties when a new object is created, if no value is provided in the request body.
Since default values are applied on db level, they should be literal values, not expressions.If you want to use expressions, you can use transposed parameters in any business API to set default values dynamically.

- **inviteLinkId**: '00000000-0000-0000-0000-000000000000'
- **eventType**: "created"
- **eventAt**: new Date()


### Constant Properties

`inviteLinkId` `eventType` `eventAt` `actorUserId` `eventNote` `relatedEmail`

Constant properties are defined to be immutable after creation, meaning they cannot be updated or changed once set. They are typically used for properties that should remain constant throughout the object's lifecycle.
A property is set to be constant if the `Allow Update` option is set to `false`.



 


### Enum Properties
Enum properties are defined with a set of allowed values, ensuring that only valid options can be assigned to them. 
The enum options value will be stored as strings in the database, 
but when a data object is created an addtional property with the same name plus an idx suffix will be created, which will hold the index of the selected enum option.
You can use the index property to sort by the enum value or when your enum options represent a sequence of values.

- **eventType**: [created, activated, delivered, validated, consumed, revoked, expired]


 

 


### Database Indexing

`inviteLinkId` `eventType`

Properties that are indexed in the database will be optimized for query performance, allowing for faster data retrieval.
Make a property indexed in the database if you want to use it frequently in query filters or sorting.






### Relation Properties

`inviteLinkId`

Mindbricks supports relations between data objects, allowing you to define how objects are linked together.
You can define relations in the data object properties, which will be used to create foreign key constraints in the database.
For complex joins operations, Mindbricks supportsa BFF pattern, where you can view dynamic and static views based on Elastic Search Indexes.
Use db level relations for simple one-to-one or one-to-many relationships, and use BFF views for complex joins that require multiple data objects to be joined together.

- **inviteLinkId**: ID
Relation to `inviteLink`.id

The target object is a sibling object, meaning that the relation is a many-to-one or one-to-one relationship from this object to the target.

On Delete: Delete
Required: Yes





### Filter Properties

`inviteLinkId` `eventType`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as API parameters in list APIs.
- **inviteLinkId**: ID filters under URL key `inviteLinkId`
- **eventType**: Enum filters under URL key `eventType`



  