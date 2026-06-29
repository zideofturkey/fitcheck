# Database Bucket Design Specification - `userAvatars`

This document provides a detailed architectural overview of the `userAvatars` database bucket within the `auth` service. It covers the bucket's storage configuration, authorization model, endpoints, and optional owner DataObject pairing.

## Bucket Overview

**Description:** User profile avatar images stored in the database.

A database bucket stores files as BYTEA columns in PostgreSQL. It is suited for small files such as icons, avatars, documents, and secret files.

- **Route Prefix:** `/bucket/userAvatars/`
- **Auto-Generated DataObject:** `userAvatarsFile`
- **Max File Size:** 5 MB
- **Allowed MIME Types:** image/png,image/jpeg,image/webp,image/gif

## Authorization

The bucket uses a layered authorization model for both read and write operations:

### Read Access

- **Access Level:** `public`
  Anyone can download files, including anonymous users and via access keys.

### Write Access

- **Access Level:** `authenticated`
  Any authenticated user can upload files.

### Key-Based Access

- **Enabled:** Yes
  Each uploaded file receives a 12-character random access key. Files can be downloaded via this key regardless of other authorization settings, enabling shareable download links.

## Owner DataObject

This bucket is paired with an owner DataObject for relational file management. Each uploaded file is linked to a record in the owner DataObject via a foreign key, enabling structured file ownership and access patterns.

## REST Endpoints

The following endpoints are auto-generated for this bucket:

| Method   | Path                                          | Description             | Auth          |
| -------- | --------------------------------------------- | ----------------------- | ------------- |
| `POST`   | `/bucket/userAvatars/upload`                  | Upload a file           | Authenticated |
| `GET`    | `/bucket/userAvatars/download/:id`            | Download a file by ID   | public        |
| `GET`    | `/bucket/userAvatars/download/key/:accessKey` | Download via access key | Public        |
| `GET`    | `/bucket/userAvatars/meta/:id`                | Get file metadata       | public        |
| `DELETE` | `/bucket/userAvatars/:id`                     | Delete a file           | Authenticated |

### Upload Request

```
POST /bucket/userAvatars/upload
Content-Type: multipart/form-data

file: <binary file data>
```

The upload response returns the file metadata including the generated `id` and `accessKey`.

### Download Response

The download endpoint returns the raw file bytes with the appropriate `Content-Type` header set from the stored MIME type.

## Auto-Generated DataObject: `userAvatarsFile`

The bucket automatically generates a `userAvatarsFile` DataObject with metadata properties:

| Property    | Type    | Description                                        |
| ----------- | ------- | -------------------------------------------------- |
| `id`        | ID      | Unique file identifier (UUID)                      |
| `fileName`  | String  | Original file name                                 |
| `mimeType`  | String  | MIME type of the file                              |
| `fileSize`  | Integer | File size in bytes                                 |
| `accessKey` | String  | 12-character random access key for shareable links |
| `createdAt` | Date    | Upload timestamp                                   |
| `ownerId`   | ID      | User ID of uploader (from session)                 |

Standard CRUD APIs are generated for the metadata object, allowing listing, filtering, and management of file records independently of the binary content.

---

_This document was generated from the database bucket configuration and should be kept in sync with design changes._
