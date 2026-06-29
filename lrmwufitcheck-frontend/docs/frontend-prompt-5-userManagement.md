

# **FITCHECK**

**FRONTEND GUIDE FOR AI CODING AGENTS - PART 5 - User Management**

This document is the 2nd part of a REST API guide for the fitcheck project.
It is designed for AI agents that will generate frontend code to consume the project's backend.

This document provides extensive instruction for administrative user management.

> **Scope reminder — keep admin features focused.**
>
> A standard dynamic SaaS app typically ships **a basic admin section** with: user list, view single user, create user, edit user, change role, reset password by admin, delete user. **Build those.**
>
> **Skip these unless the project's scope explicitly asks for them:**
> - **Audit log / activity history pages** (`useUserHistory` hook is available, but don't auto-build a dedicated screen)
> - **Active-session management UI** (`useUserSessions` / `useDeleteUserSession` are available, skip the dedicated screen)
> - Anything labeled "(OPTIONAL)" further down
>
> The hooks for these stay documented for reference — the rule is "available, not auto-built". If the scope says "admin can see user activity", you can wire them. Otherwise leave them out and keep the admin section lean.

## Service Access

Use the generated auth hooks for all operations in this document. The SDK handles tokens, auth headers, and cache invalidation.

### User Management Types

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
  file: { id: string; fileName: string; accessKey: string; };
}
```

### User Management Hooks

All hooks imported from `@/hooks/api/use-auth`:

**Listing & Search**

| Hook | Type | Params | Returns |
|------|------|--------|---------|
| `useUsers(params?)` | query | `{ email?, fullname?, roleId?, pageNumber?, pageRowCount?, getJoins? }` — filter params reflect the project's actual user-filter config; use `useSearchUsers(keyword)` for full-text search | `MindbricksResponse & { users: User[] }` |
| `useSearchUsers(keyword)` | query | `keyword: string` | `MindbricksResponse & { users: User[] }` — enabled when `keyword.length >= 2` |
| `useUser(userId)` | query | `userId: string or null` | `UserResponse` |
| `useBriefUser(userId)` | query | `userId: string or null` | limited fields: id, fullname, avatar |

**Mutations**

| Hook | Type | Payload | Returns |
|------|------|---------|---------|
| `useCreateUser()` | mutation | `{ email, password, fullname, avatar? }` | `UserResponse` |
| `useUpdateUser()` | mutation | `{ userId, data: { fullname?, avatar? } }` | `UserResponse` + update envelope — admin variant, PATCH `/v1/users/:userId`. **Use this on admin screens to edit another user. For self-edit, use `useUpdateProfile(data)` (PATCH `/v1/profile`, no userId — session-based).** |
| `useUpdateUserRole()` | mutation | `{ userId, data: { roleId } }` | `UserResponse` + update envelope |
| `useUpdateUserPasswordByAdmin()` | mutation | `{ userId, data: { password } }` | `UserResponse` + update envelope |
| `useDeleteUser()` | mutation | `userId: string` | `UserResponse` |

**Avatar Bucket**

| Hook | Type | Payload | Returns |
|------|------|---------|---------|
| `useUploadUserAvatar()` | mutation | `file: File` | `BucketUploadResponse` |
| `useDeleteUserAvatar()` | mutation | `fileId: string` | `MindbricksResponse` |

To get the public download URL after upload: `authService.getUserAvatarUrl(accessKey)`.

Please note that any feature in this document is open to admins only. When the user logins, the response includes a roleId field.

This roleId should one of these following admin roles. `superAdmin`, `admin`, 

## Scope

Auth service provides following feature for user management in fitcheck application.

These features are already handled in the previous part.
1. User Registration
2. User Authentication
3. Password Reset
3. Email (and/or) Mobile Verification
4. Profile Management

These features will be handled in this part.
- User Management
- User Groups Management
- Permission Manageemnt


## User Management

User management will be one of the main parts of the administrative manageemnts, so there will be a minimal but fancy `users` page in the admin dashboard.

### User Roles

- `superadmin` : The first creator of the backend, the owner of the application, root user, has got an absolute authroization on all actions. It can not be assgined any other user. It can't be unassigned. Super admin user can not be deleted in any way.
- `admin` : The role that can be assigned to any user by the super admin. This role includes most permissions that super admin have, but admins can't assign admin roles, can't unassign an admin role, can't delete other users who have admin role. In addition to these limitations, some critical actions in the business services may also be open to only super admin.
- `user` : The standard role that is assgined to every user when first created or registered. This role doesnt have any privilages and can access to their own data or public data. 

    

The roles object is a hardcoded object in the generated code, and it contains the following roles:
```json
{
  "superAdmin": "'superAdmin'",
  "admin": "'admin'",
  "user": "'user'"
}
```

Each user may have only one role, and it is given in `/login` , `/currentuser` or `/users/:userId`  response as follows

```json
{
  // ...
  "roleId":"superAdmin",
  // ...
}
```
  

## Listing Users

You can list users using the `listUsers` api. 

Use the `useUsers()` query hook from `src/hooks/api/use-auth.ts`. Supports optional filter params: `{ email?, fullname?, roleId?, pageNumber?, pageRowCount?, getJoins? }`. Full-text search lives on a separate endpoint — use `useSearchUsers(keyword)` for that.

```tsx
const { data, isLoading } = useUsers({ pageNumber: 1, pageRowCount: 25 });
const users = data?.users ?? [];
```

## Searching Users
You may search users with their full names, emails. The search is done in elasticsearch index of the user table so a fast response is provided by the backend. You can send search request on each character update in the search box but start searching after 3 chars.
The keyword parameter that is used in the business logic of the api, is read from the keyword query parameter.


When the user deletes the search keyword, use the `useUsers()` hook to get the full list again.

Use the `useSearchUsers(keyword)` query hook. It is enabled when `keyword.length >= 2`.

```tsx
const { data } = useSearchUsers(searchTerm);
const users = data?.users ?? [];
```

#### Pagination
When you list the users please use pagination. Pass `pageNumber` and `pageRowCount` to the `useUsers()` hook params. The default row count for one page is 25, add an option for user to change it to 50 or 100.


## Creating Users

The user management console in the admin dashboard should provide UX components for user creating by admins. When creating users, it should also be possible to upload user avatar. Note that when creating, updating users, admins can not set emailVerified as true, since it is a logical mechanism and should be verified only through verification processes.


Use the `useCreateUser()` mutation hook. Payload: `{ email, password, fullname, avatar? }`.

```tsx
const { mutate: createUser, isPending } = useCreateUser();
createUser({ email, password, fullname, roleId }, {
  onSuccess: () => { /* refresh user list */ },
});
```

### Avatar Upload

Avatars are stored in the auth service's **database bucket** — no external bucket service needed.

Upload the file with `useUploadUserAvatar()`, then build the public URL with `authService.getUserAvatarUrl(accessKey)`. Two patterns for what to do with the URL — pick by the surrounding UI:

**Pattern A — staged inside a multi-field form (admin create / edit user, profile edit)**

Hold `avatarUrl` in the form's local state and submit it as a regular `avatar` field on the next `createUser` / `updateUser` / `updateProfile` call. No partial save; the user can still cancel the form and nothing was persisted.

```tsx
const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user?.avatar);
const { mutate: uploadAvatar } = useUploadUserAvatar();
const { mutate: createUser } = useCreateUser();

const onPickAvatar = (file: File) => {
  uploadAvatar(file, {
    onSuccess: (result) => setAvatarUrl(authService.getUserAvatarUrl(result.file.accessKey)),
  });
};

const onSubmit = (form: FormValues) => {
  createUser({ ...form, avatar: avatarUrl });
};
```

The same staging applies to admin **edit** (`updateUser({ userId, data: { ...form, avatar: avatarUrl } })`) and self **edit** (`updateProfile({ ...form, avatar: avatarUrl })`).

**Pattern B — standalone "change photo" action (atomic)**

The avatar widget is its own control with no form around it — picking a file should immediately persist. Upload, then write the URL straight to the user record. For self-edit use `updateProfile` (session-based, no userId); for admin-on-behalf use `updateUser({ userId, data })`.

```tsx
const { mutate: uploadAvatar } = useUploadUserAvatar();
const { mutate: updateProfile } = useUpdateProfile();

const onChangePhoto = (file: File) => {
  uploadAvatar(file, {
    onSuccess: (result) => {
      const avatarUrl = authService.getUserAvatarUrl(result.file.accessKey);
      updateProfile({ avatar: avatarUrl });
    },
  });
};
```

`avatar` on the user record is just a `string` column holding the download URL — there is no separate "save the avatar" endpoint. Whichever pattern you pick, persisting just means writing the URL via one of `createUser` / `updateUser` / `updateProfile`.

Since the userAvatars bucket has public read access, avatar URLs work directly in `<img>` tags without auth.

Before the avatar upload, use the `react-easy-crop` lib for zoom, pan and crop. This component is also used in the profile page — reuse the existing code.

## Updating Users

User update is possible by `updateUser`api. However since this update api is also called by teh user themselves it is lmited with name and avatar change (or any other user related property). 
For roleId and password updates seperate apis are used. So arrange the user update UI as to update the user info, as to set roleId and as to update password. 

Use the `useUpdateUser()` mutation hook on admin screens — it hits `PATCH /v1/users/:userId` (admin-only). Payload: `{ userId, data: { fullname?, avatar? } }`. (`useUpdateProfile(data)` is the self-edit variant on `PATCH /v1/profile` — session-based, no userId — for the current user editing their own record. See the Profile prompt.)

```tsx
const { mutate: updateUser } = useUpdateUser();
updateUser({ userId, data: { fullname, avatar } });
```

For role updates there are some rules.
1. Superadmin role can not be unassigned even by superadmin.
2. Admin roles can be assgined or unassgined only by superadmin.
3. All other roles can be assigned and unassgined by admins and superadmin.

For password updates there are some rules.
1. Superadmin and admin passwords can be updated only by superadmin. 
2. Admins can update only non-admin passwords.

Use the `useUpdateUserRole()` mutation hook. Payload: `{ userId, data: { roleId } }`.

```tsx
const { mutate: updateRole } = useUpdateUserRole();
updateRole({ userId, data: { roleId: "admin" } });
```

Use the `useUpdateUserPasswordByAdmin()` mutation hook. Payload: `{ userId, data: { password } }`. No old password required.

```tsx
const { mutate: resetPassword } = useUpdateUserPasswordByAdmin();
resetPassword({ userId, data: { password: newPassword } });
```

### Deleting Users

Deleting users is possible in certain conditions.

1. SuperAdmin can not be deleted.
2. Admins can be deleted by only superadmin.
3. Users can be deleted by admins or superadmin.

Use the `useDeleteUser()` mutation hook. Payload: `userId: string`.

```tsx
const { mutate: deleteUser } = useDeleteUser();
deleteUser(userId, { onSuccess: () => { /* refresh user list */ } });
```

---


When you list user group members, a `user` object will also be inserted in each userGroupMember object, with fullname, avatar, email.

## Avatar Storage

(Also covered in the Profile prompt.) Use `useUploadUserAvatar()` to upload, `authService.getUserAvatarUrl(accessKey)` for download URL. Public read — `<img src={user.avatar}>` works without auth.

**After this prompt, the user may give you new instructions to update the output of this prompt or provide subsequent prompts about the project.**