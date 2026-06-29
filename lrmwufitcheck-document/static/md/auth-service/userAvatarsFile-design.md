# Service Design Specification - Object Design for userAvatarsFile
**fitcheck-auth-service** documentation

## Document Overview
This document outlines the object design for the `userAvatarsFile` model in our application. It includes details about the model's attributes, relationships, and any specific validation or business logic that applies.

## userAvatarsFile Data Object

### Object Overview
**Description:** Auto-generated file storage for the userAvatars database bucket. Files are stored as BYTEA in PostgreSQL.

This object represents a core data structure within the service and acts as the blueprint for database interaction, API generation, and business logic enforcement. 
It is defined using the `ObjectSettings` pattern, which governs its behavior, access control, caching strategy, and integration points with other systems such as Stripe and Redis.

### Core Configuration
- **Soft Delete:** Disabled — Determines whether records are marked inactive (`isActive = false`) instead of being physically deleted.
- **Public Access:** accessPublic — If enabled, anonymous users may access this object’s data depending on API-level rules.








### Properties Schema


| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `fileName` | String | Yes | Original file name as uploaded by the client. |
| `mimeType` | String | Yes | MIME type of the uploaded file (e.g., image/png, application/pdf). |
| `fileSize` | Integer | Yes | File size in bytes. |
| `accessKey` | String | Yes | 12-character random key for shareable access. Auto-generated on upload. |
| `ownerId` | ID | No | ID of the user who uploaded the file (from session). |
| `fileData` | Blob | Yes | Binary file content. Stored as BYTEA in PostgreSQL or Buffer in MongoDB. |
| `metadata` | Object | No | Optional JSON metadata for the file (tags, alt text, etc.). |
| `scanStatus` | String | Yes | ClamAV scan result: &#39;clean&#39; (safe), &#39;infected&#39; (signature matched), &#39;error&#39; (scan failed). &#39;pending&#39; is reserved for async-scan modes not yet supported. |
| `scanResult` | Text | No | Detail of the scan outcome — virus signature name when infected, transport-level error message when scan failed, null when clean. |
| `scannedAt` | Date | No | Timestamp of the most recent ClamAV scan attempt. |
| `userId` | ID | No | Reference to the owner user record. |
* Required properties are mandatory for creating objects and must be provided in the request body if no default value is set.
* Properties marked `Type[] (array)` MUST be sent as a JSON array (e.g. `["a","b"]`), even when only one value is present (`["a"]`). Sending a bare scalar fails validation.



### Default Values
Default values are automatically assigned to properties when a new object is created, if no value is provided in the request body.
Since default values are applied on db level, they should be literal values, not expressions.If you want to use expressions, you can use transposed parameters in any business API to set default values dynamically.

- **fileName**: 'default'
- **mimeType**: 'default'
- **fileSize**: 0
- **accessKey**: 'default'
- **fileData**: Buffer.alloc(0)
- **scanStatus**: 'default'


### Constant Properties

`fileName` `mimeType` `fileSize` `accessKey` `ownerId` `fileData` `userId`

Constant properties are defined to be immutable after creation, meaning they cannot be updated or changed once set. They are typically used for properties that should remain constant throughout the object's lifecycle.
A property is set to be constant if the `Allow Update` option is set to `false`.



 



 

 

### Elastic Search Indexing

`fileName` `mimeType` `fileSize` `ownerId` `scanStatus` `userId`

Properties that are indexed in Elastic Search will be searchable via the Elastic Search API. 
While all properties are stored in the elastic search index of the data object, only those marked for Elastic Search indexing will be available for search queries.


### Database Indexing

`fileName` `mimeType` `accessKey` `ownerId` `scanStatus` `userId`

Properties that are indexed in the database will be optimized for query performance, allowing for faster data retrieval.
Make a property indexed in the database if you want to use it frequently in query filters or sorting.


### Unique Properties

`accessKey`

Unique properties are enforced to have distinct values across all instances of the data object, preventing duplicate entries.
Note that a unique property is automatically indexed in the database so you will not need to set the `Indexed in DB` option.





### Relation Properties

`userId`

Mindbricks supports relations between data objects, allowing you to define how objects are linked together.
You can define relations in the data object properties, which will be used to create foreign key constraints in the database.
For complex joins operations, Mindbricks supportsa BFF pattern, where you can view dynamic and static views based on Elastic Search Indexes.
Use db level relations for simple one-to-one or one-to-many relationships, and use BFF views for complex joins that require multiple data objects to be joined together.

- **userId**: ID
Relation to `user`.id

The target object is a sibling object, meaning that the relation is a many-to-one or one-to-one relationship from this object to the target.

On Delete: Set Null
Required: No


### Session-sourced Properties

`ownerId`

These properties are session-bound — their values are read from the authenticated session at create/update time and cannot be supplied in the request body.

- **ownerId**: ID property will be mapped to the session parameter `userId`.

This property is the data object's ownership field, used by ownership-based access control.





### Filter Properties

`mimeType` `ownerId` `scanStatus` `userId`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as API parameters in list APIs.
- **mimeType**: String filters under URL key `mimeType`
- **ownerId**: ID filters under URL key `ownerId`
- **scanStatus**: String filters under URL key `scanStatus`
- **userId**: ID filters under URL key `userId`



  