# **FITCHECK**

**FRONTEND GUIDE FOR AI CODING AGENTS - PART 4 - Profile Management**

This document is a part of a REST API guide for the fitcheck project.
It is designed for AI agents that will generate frontend code to consume the project's backend.

This document includes information and api descriptions about building a **profile page** in the frontend using the auth service profile api calls. Avatar images are stored in the auth service's database buckets — no external bucket service is needed for avatars.

The project has 1 auth service, 1 notification service, 1 BFF service, and 1 business services, plus other helper services such as bucket and realtime. In this document you will use the auth service (including its database bucket endpoints for avatar uploads).

Each service is a separate microservice application and listens for HTTP requests at different service URLs.

Services may be deployed to the preview server, staging server, or production server. Therefore, each service has 3 access URLs.
The frontend application must support all deployment environments during development, and the user should be able to select the target API server on the home page.

## Accessing the backend

Each backend service has its own URL for each deployment environment. Users may want to test the frontend in one of the three deployments—preview, staging, or production. Please ensure that the register and login pages include a deployment server selection option so that, as the frontend coding agent, you can set the base URL for all services.

The base URL of the application in each environment is as follows:

- **Preview:** `https://lrmwufitcheck.preview.mindbricks.com`
- **Staging:** `https://lrmwufitcheck-stage.mindbricks.co`
- **Production:** `https://lrmwufitcheck.mindbricks.co`

For the auth service, service urls are as follows:

- **Preview:** `https://lrmwufitcheck.preview.mindbricks.com/auth-api`
- **Staging:** `https://lrmwufitcheck-stage.mindbricks.co/auth-api`
- **Production:** `https://lrmwufitcheck.mindbricks.co/auth-api`

For each other service, the service URL will be given in the service sections.

Any request that requires login must include a valid token in the Bearer authorization header.

## Avatar Storage (Database Buckets)

User avatars and tenant avatars are stored directly in the auth service database using **database buckets** (dbBuckets). This means avatar files are uploaded to and downloaded from the **auth service itself** — no external bucket service is needed.

The auth service provides these avatar buckets:

### User Avatar Bucket

**Upload:** `POST {authBaseUrl}/bucket/userAvatars/upload`
**Download by ID:** `GET {authBaseUrl}/bucket/userAvatars/download/{fileId}`
**Download by Key:** `GET {authBaseUrl}/bucket/userAvatars/download/key/{accessKey}`

- **Read access:** Public (anyone can view avatars, no auth needed for download)
- **Write access:** Authenticated (any logged-in user can upload their own avatar)
- **Allowed types:** image/png, image/jpeg, image/webp, image/gif
- **Max size:** 5 MB
- **Access key:** Each uploaded file gets a 12-character random key for shareable links

**Upload example (multipart/form-data):**

```js
const formData = new FormData();
formData.append("file", croppedImageBlob, "avatar.png");

const response = await fetch(`${authBaseUrl}/bucket/userAvatars/upload`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
  body: formData,
});

const result = await response.json();
// result.file.id — the file ID (use for download URL)
// result.file.accessKey — 12-char key for public sharing
// result.file.fileName, result.file.mimeType, result.file.fileSize
```

**After uploading, update the user's avatar field** with the download URL:

```js
const avatarUrl = `${authBaseUrl}/bucket/userAvatars/download/${result.file.id}`;
// OR use the access key for a shorter, shareable URL:
const avatarUrl = `${authBaseUrl}/bucket/userAvatars/download/key/${result.file.accessKey}`;

await updateProfile({ avatar: avatarUrl });
```

**Displaying avatars:** Since read access is public, avatar URLs can be used directly in `<img>` tags without any authentication token:

```jsx
<img src={user.avatar} alt="Avatar" />
```

### Listing and Deleting Avatars

The auth service also provides metadata APIs for each bucket (auto-generated):

| API                     | Method | Path                       | Description                   |
| ----------------------- | ------ | -------------------------- | ----------------------------- |
| `getUserAvatarsFile`    | GET    | `/v1/userAvatarsFiles/:id` | Get file metadata (no binary) |
| `listUserAvatarsFiles`  | GET    | `/v1/userAvatarsFiles`     | List files with filtering     |
| `deleteUserAvatarsFile` | DELETE | `/v1/userAvatarsFiles/:id` | Delete file and its data      |

## Profile Page

Design a profile page to manage (view and edit) user information. The profile page should include an avatar upload component that uploads to the database bucket.

On the profile page, you will need 4 business APIs: `getUser` , `updateProfile`, `updateUserPassword` and `archiveProfile`. Do not rely on the `/currentuser` response for profile data, because it contains session information. The most recent user data is in the user database and should be accessed via the `getUser` business API.

The `updateProfile`, `updateUserPassword` and `archiveProfile` can only be called by the users themselves. They are designed specific to the profile page.

**Avatar upload workflow:**

1. User selects an image → crop with `react-easy-crop` (install it, do not implement your own)
2. Convert cropped area to a Blob
3. Upload to `POST {authBaseUrl}/bucket/userAvatars/upload` with the access token
4. Get back the file metadata (id, accessKey)
5. Construct the download URL: `{authBaseUrl}/bucket/userAvatars/download/key/{accessKey}`
6. Call `PATCH {authBaseUrl}/v1/profile` with body `{ avatar: downloadUrl }` — **no userId in the URL**. The route is session-based; the BE resolves the target user from the access token.

**Note that the user cannot change/update their `email` or `roleId`.**

For password update you should make a separate block in the UI, so that user can enter old password, new password and confirm new password before calling the `updateUserPassword`.

Here are the 3 auth APIs—`getUser` , `updateProfile` and `updateUserPassword`— as follows:
You can access these APIs through the auth service base URL, `{appUrl}/auth-api`.

### `Get User` API

This api is used by admin roles or the users themselves to get the user profile information.

**Rest Route**

The `getUser` API REST controller can be triggered via the following route:

`/v1/users/:userId`

**Rest Request Parameters**

The `getUser` api has got 1 regular request parameter

| Parameter | Type | Required | Population                 |
| --------- | ---- | -------- | -------------------------- |
| userId    | ID   | true     | request.params?.["userId"] |

**userId** : This id paremeter is used to query the required data object.

**REST Request**
To access the api you can use the **REST** controller with the path **GET /v1/users/:userId**

```js
axios({
  method: "GET",
  url: `/v1/users/${userId}`,
  data: {},
  params: {},
});
```

**REST Response**

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "user",
  "method": "GET",
  "action": "get",
  "appVersion": "Version",
  "rowCount": 1,
  "user": {
    "id": "ID",
    "email": "String",
    "password": "String",
    "fullname": "String",
    "avatar": "String",
    "roleId": "String",
    "emailVerified": "Boolean",
    "isActive": true,
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID"
  }
}
```

### `Update Profile` API

This route is used by users to update their own profiles. The target user is always the session user — no userId is needed in the URL.

**Rest Route**

The `updateProfile` API REST controller can be triggered via the following route:

`/v1/profile`

**Rest Request Parameters**

The `updateProfile` api has got 2 regular request parameters

| Parameter | Type   | Required | Population                 |
| --------- | ------ | -------- | -------------------------- |
| fullname  | String | false    | request.body?.["fullname"] |
| avatar    | String | false    | request.body?.["avatar"]   |

**fullname** : User's full name.
**avatar** : Avatar URL.

**REST Request**
To access the api you can use the **REST** controller with the path **PATCH /v1/profile**

```js
axios({
  method: "PATCH",
  url: "/v1/profile",
  data: {
    fullname: "String",
    avatar: "String",
  },
  params: {},
});
```

**REST Response**

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "user",
  "method": "PATCH",
  "action": "update",
  "appVersion": "Version",
  "rowCount": 1,
  "user": {
    "id": "ID",
    "email": "String",
    "password": "String",
    "fullname": "String",
    "avatar": "String",
    "roleId": "String",
    "emailVerified": "Boolean",
    "isActive": true,
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID"
  }
}
```

### `Update Userpassword` API

This route is used to update the password of users in the profile page by users themselves. The target user is always the session user — no userId is needed in the URL.

**Rest Route**

The `updateUserPassword` API REST controller can be triggered via the following route:

`/v1/userpassword`

**Rest Request Parameters**

The `updateUserPassword` api has got 2 regular request parameters

| Parameter   | Type   | Required | Population                    |
| ----------- | ------ | -------- | ----------------------------- |
| oldPassword | String | true     | request.body?.["oldPassword"] |
| newPassword | String | true     | request.body?.["newPassword"] |

**oldPassword** : The old password of the user that will be overridden bu the new one. Send for double check.
**newPassword** : The new password of the user to be updated

**REST Request**
To access the api you can use the **REST** controller with the path **PATCH /v1/userpassword**

```js
axios({
  method: "PATCH",
  url: "/v1/userpassword",
  data: {
    oldPassword: "String",
    newPassword: "String",
  },
  params: {},
});
```

**REST Response**

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "user",
  "method": "PATCH",
  "action": "update",
  "appVersion": "Version",
  "rowCount": 1,
  "user": {
    "id": "ID",
    "email": "String",
    "password": "String",
    "fullname": "String",
    "avatar": "String",
    "roleId": "String",
    "emailVerified": "Boolean",
    "isActive": true,
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID"
  }
}
```

### Archiving A Profile

A user may want to archive their profile. So the profile page should include an archive section for the users to archive their accounts.
When an account is archived, it is marked as archived and an aarchiveDate is atteched to the profile. All user data is kept in the database for 1 month after user archived.
If user tries to login or register with the same email, the account will be activated again. But if no login or register occures in 1 month after archiving, the profile and its related data will be deleted permanenetly.
So in the profile page,

1. The arcihve options should be accepted after user writes a text like ("ARCHİVE MY ACCOUNT") to a confirmation dialog, so that frontend UX can ensure this is not an unconscious request.
2. The user should be warned about the process, that his account will be available for a restore for 1 month.

The archive api, can only be called by the users themselves and its used as follows.

### `Archive Profile` API

This api is used by users to archive their own profiles. The target user is always the session user — no userId is needed in the URL.

**Rest Route**

The `archiveProfile` API REST controller can be triggered via the following route:

`/v1/archiveprofile`

**Rest Request Parameters**
The `archiveProfile` api has got no request parameters.

**REST Request**
To access the api you can use the **REST** controller with the path **DELETE /v1/archiveprofile**

```js
axios({
  method: "DELETE",
  url: "/v1/archiveprofile",
  data: {},
  params: {},
});
```

**REST Response**

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "user",
  "method": "DELETE",
  "action": "delete",
  "appVersion": "Version",
  "rowCount": 1,
  "user": {
    "id": "ID",
    "email": "String",
    "password": "String",
    "fullname": "String",
    "avatar": "String",
    "roleId": "String",
    "emailVerified": "Boolean",
    "isActive": false,
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date",
    "_owner": "ID"
  }
}
```

---

After you complete this step, please ensure you have not made the following common mistakes:

1. Avatar uploads go to the **auth service's database bucket** endpoints (`/bucket/userAvatars/upload`), not to an external bucket service. Use the same `accessToken` (Bearer header) for both auth APIs and avatar bucket uploads — no bucket-specific tokens are needed.
1. Note that any api call to the application backend is based on a service base url, in this prompt all auth apis (including avatar bucket endpoints) should be called by the auth service base url.
1. On the profile page, fetch the latest user data from the service using `getUser`. The `/currentuser` API is session-stored data; the latest data is in the database.
1. When you upload the avatar image on the profile page, use the returned download URL as the user's `avatar` property and update the user record when the Save button is clicked.

**After this prompt, the user may give you new instructions to update your first output or provide subsequent prompts about the project.**
