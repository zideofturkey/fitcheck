

# **FITCHECK**

**FRONTEND GUIDE FOR AI CODING AGENTS - PART 4 - Profile Management**

This document provides instructions for building the **profile page** in the frontend. It covers viewing/editing user data, avatar uploads, password changes, and account archiving. Avatar images are stored in the auth service's database buckets — no external bucket service is needed.


## Accessing the backend

Use the generated auth hooks for all profile operations. The SDK handles tokens, auth headers, and cache invalidation.

### Profile Types

```typescript
interface User {
  id: string;
  email: string;
  fullname: string;
  avatar?: string;
  roleId: string;
  emailVerified: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Every column from the auth `user` dataObject (incl. custom additionals)
  // is enumerated above; this index signature only catches BE schema changes
  // that haven't yet been regenerated FE-side.
  [key: string]: unknown;
}

interface UserResponse extends MindbricksResponse {
  user: User;
}

interface MindbricksUpdateEnvelope extends MindbricksResponse {
  oldDataValues?: Record<string, unknown>;
  newDataValues?: Record<string, unknown>;
}

// Bucket upload returns its OWN compact shape — NOT the standard Mindbricks
// envelope (no statusCode/dataName/rowCount). Stays standalone.
interface BucketUploadResponse {
  status: "OK";
  action: "upload";
  bucket: string;
  file: {
    id: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    accessKey: string;
    ownerId?: string;
  };
}
```

### Profile Hooks

All hooks imported from `@/hooks/api/use-auth`:

**Data Fetching**

| Hook | Type | Params | Returns |
|------|------|--------|---------|
| `useUser(userId)` | query | `userId: string or null` | `UserResponse` (the user is at `data.user`) — use for profile page, not `useCurrentUser()` |
| `useCurrentUser()` | query | — | `CurrentUserResponse \| null` — flat session envelope (user fields are on the response itself, NOT under `response.user`); `null` when logged out. Tokens & last-active fields included; **may be stale vs. the DB row** — use `useUser(userId)` for the latest user data |

**Profile Mutations**

| Hook | Type | Payload | Returns |
|------|------|---------|---------|
| `useUpdateProfile()` | mutation | `{ fullname?, avatar? }` | `UserResponse` + update envelope — session-based (`PATCH /v1/profile`); every field is optional (partial update). Custom user properties are included automatically. **No userId argument needed.** |
| `useUpdateUserPassword()` | mutation | `{ oldPassword, newPassword }` | `UserResponse` + update envelope — session-based (`PATCH /v1/userpassword`). **No userId argument needed.** |
| `useArchiveProfile()` | mutation | _(no argument)_ | `UserResponse` — clears auth cache; session-based (`DELETE /v1/archiveprofile`). **No userId argument needed.** |

**Avatar Bucket**

| Hook | Type | Payload | Returns |
|------|------|---------|---------|
| `useUploadUserAvatar()` | mutation | `file: File` | `BucketUploadResponse` |
| `useUserAvatarFile(fileId)` | query | `fileId: string or null` | file metadata (no binary) |
| `useUserAvatarFiles()` | query | — | list of user avatar files |
| `useDeleteUserAvatar()` | mutation | `fileId: string` | `MindbricksResponse` — invalidates file list |

To get the public download URL after upload: `authService.getUserAvatarUrl(accessKey)` — returns a string URL usable in `<img>` tags without auth.




## Avatar Storage (Database Buckets)

User avatars and tenant avatars are stored directly in the auth service database using **database buckets** (dbBuckets). This means avatar files are uploaded to and downloaded from the **auth service itself** — no external bucket service is needed.

The auth service provides these avatar buckets:

### User Avatar Bucket

Use `useUploadUserAvatar()` to upload and `useDeleteUserAvatar()` to delete. Download URLs are public — use `authService.getUserAvatarUrl(accessKey)` to get the URL.

- **Read access:** Public (anyone can view avatars, no auth needed for download)
- **Write access:** Authenticated (any logged-in user can upload their own avatar)
- **Allowed types:** image/png, image/jpeg, image/webp, image/gif
- **Max size:** 5 MB
- **Access key:** Each uploaded file gets a 12-character random key for shareable links

**Upload example (multipart/form-data):**

```tsx
import { useUploadUserAvatar, useUpdateProfile } from "@/hooks/api/use-auth";
import { authService } from "@/services/api/auth-service";

const { mutate: uploadAvatar, isPending } = useUploadUserAvatar();
const { mutate: updateProfile } = useUpdateProfile();

// Upload the cropped image blob
const file = new File([croppedImageBlob], "avatar.png", { type: "image/png" });
uploadAvatar(file, {
  onSuccess: (result) => {
    // result.file.accessKey — use to build download URL
    const avatarUrl = authService.getUserAvatarUrl(result.file.accessKey);
    // updateProfile is session-based — no userId needed. The BE knows who's
    // calling from the auth header. Just pass the body fields you want changed.
    updateProfile({ avatar: avatarUrl });
  },
});
```

**Displaying avatars:** Since read access is public, avatar URLs can be used directly in `<img>` tags without any authentication token:

```jsx
<img src={user.avatar} alt="Avatar" />
```



### Listing and Deleting Avatars

Use the avatar bucket hooks (see Profile Hooks above):

| Operation | Hook |
|-----------|------|
| Get file metadata | `useUserAvatarFile(fileId)` |
| List all avatar files | `useUserAvatarFiles()` |
| Delete avatar file | `useDeleteUserAvatar()` — pass `fileId`, invalidates list cache |

## Profile Page

Design a profile page to manage (view and edit) user information. The profile page should include an avatar upload component that uploads to the database bucket.

On the profile page, use `useUser(userId)` to fetch the latest user data — do not rely on `useCurrentUser()` which returns session data that may be stale. Use `useUpdateProfile()`, `useUpdateUserPassword()`, and `useArchiveProfile()` for mutations.

The `updateProfile`, `updateUserPassword` and `archiveProfile` can only be called by the users themselves. They are designed specific to the profile page.

**Avatar upload workflow:**
1. User selects an image → crop with `react-easy-crop` (install it, do not implement your own)
2. Convert cropped area to a Blob
3. Call `useUploadUserAvatar()` with the file
4. On success, get `result.file.accessKey` and build the URL with `authService.getUserAvatarUrl(accessKey)`
5. Call `useUpdateProfile()` with `{ avatar: avatarUrl }` — **no userId needed**. The route is `PATCH /v1/profile` (session-based); the BE figures out the target user from the auth header. Don't try to pass `result.file.id` — that's a bucket file id, unrelated to the profile.

**Note that the user cannot change/update their `email` or `roleId`.**

For password update you should make a separate block in the UI, so that user can enter old password, new password and confirm new password before calling `useUpdateUserPassword()`.


> **Self-profile routes are session-based — no `userId` argument needed.**
>
> `useUpdateProfile()`, `useUpdateUserPassword()`, and `useArchiveProfile()` all hit URLs without any path id (`PATCH /v1/profile`, `PATCH /v1/userpassword`, `DELETE /v1/archiveprofile`). The BE resolves the target user from the auth header. **Do not pass any userId.** If you've seen older docs that say "{ userId, data }" — that's the deprecated shape. The admin variant (acting on a different user) lives at `useUpdateUser()`/`useDeleteUser()` with `:userId` in URL — see Part 5 (User Management).

**`useUser(userId)`** — Query hook. Fetches full user data from the database. Use this for the profile page, not `useCurrentUser()`.

```tsx
const { user } = useAuth();                  // current user from session
const { data } = useUser(user?.id);          // ← userId = logged-in user's id (still needed because /v1/users/:userId is the read route)
const profile = data?.user;
```

**`useUpdateProfile()`** — Mutation hook. Payload: `{ fullname?, avatar? }`. Every body field is optional (partial update); the route is `PATCH /v1/profile` (session-based — the user can edit only their own profile). Server-only fields (`email`, `roleId`, `password`) are not on this route.

```tsx
const { mutate: updateProfile, isPending } = useUpdateProfile();
updateProfile({ fullname, avatar }, {
  onSuccess: () => { /* show toast, invalidate queries */ },
});
```

**`useUpdateUserPassword()`** — Mutation hook. Payload: `{ oldPassword, newPassword }`. Session-based — no userId needed. Route is `PATCH /v1/userpassword`.

```tsx
const { mutate: changePassword } = useUpdateUserPassword();
changePassword({ oldPassword, newPassword });
```

### Archiving A Profile

A user may want to archive their profile. So the profile page should include an archive section for the users to archive their accounts.
When an account is archived, it is marked as archived and an aarchiveDate is atteched to the profile. All user data is kept in the database for 1 month after user archived.
If user tries to login or register with the same email, the account will be activated again. But if no login or register occures in 1 month after archiving, the profile and its related data will be deleted permanenetly.
So in the profile page,

1. The arcihve options should be accepted after user writes a text like ("ARCHİVE MY ACCOUNT") to a confirmation dialog, so that frontend UX can ensure this is not an unconscious request.
2. The user should be warned about the process, that his account will be available for a restore for 1 month.

The archive api, can only be called by the users themselves and its used as follows.

**`useArchiveProfile()`** — Mutation hook. Payload: _(none)_. Session-based — no userId argument. Route is `DELETE /v1/archiveprofile`. Soft-deletes the session user and clears auth cache.

```tsx
const { mutate: archiveProfile } = useArchiveProfile();
archiveProfile(undefined, {
  onSuccess: () => { /* logout and redirect to home */ },
});
```





---

After you complete this step, please ensure you have not made the following common mistakes:

1. Avatar uploads go to the **auth service's database bucket** endpoints (`/bucket/userAvatars/upload`), not to an external bucket service. Use the generated `useUploadUserAvatar()` mutation hook (or `useUploadOrganizationAvatar()` for tenant avatars); token injection is automatic.
1. On the profile page, fetch the latest user data from the service using `useUser(userId)`. The `/currentuser` (`useCurrentUser()`) API is session-stored data; the latest data is in the database.
1. When you upload the avatar image on the profile page, use the returned download URL as the user's `avatar` property and update the user record when the Save button is clicked.

**After this prompt, the user may give you new instructions to update your first output or provide subsequent prompts about the project.**