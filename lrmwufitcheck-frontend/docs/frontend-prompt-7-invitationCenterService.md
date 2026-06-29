

# **FITCHECK**

**FRONTEND GUIDE FOR AI CODING AGENTS - PART 7 - InvitationCenter Service**

This document is a part of a REST API guide for the fitcheck project.
It is designed for AI agents that will generate frontend code to consume the project’s backend.

This document provides extensive instruction for the usage of invitationCenter

## Service Access

Use the generated hooks for all `invitationCenter` operations. The SDK handles service URLs, auth headers, and token management. Import hooks from `use-invitationcenter` and types from `api.ts`.


## Scope

**InvitationCenter Service Description**

Manages invite-only onboarding links for platform operators, including creation, activation, delivery, validation, and audit tracking of unique registration invite tokens.

InvitationCenter service provides apis and business logic for following data objects in fitcheck application. 
Each data object may be either a central domain of the application data structure or a related helper data object for a central concept.
Note that data object concept is equal to table concept in the database, in the service database each data object is represented as a db table scheme and the object instances as table rows.  


**`inviteLink` Data Object**: Stores a unique invite registration token with usage rules, lifecycle state, delivery tracking, and a reference to the registered user created as a result of the invite.

**`inviteAudit` Data Object**: Append-only audit log capturing every lifecycle event on an invite link, including who acted, what happened, and optional contextual notes.


## InvitationCenter Service Frontend Description By The Backend Architect

## invitationCenter Service — Frontend UX Guide

This service powers the invite-only registration flow. Operators (admins) manage invite links from an admin dashboard panel; prospective users interact with invite links pre-registration through a public-facing registration page.

**Operator dashboard pattern:** A paginated list view (`/admin/invites`) shows all invite links with status badges (draft=gray, active=green, exhausted=orange, revoked=red, expired=purple, consumed=teal). Filtering is available by `inviteState` and `usageMode` via query params. Each row has action buttons: Activate, Revoke, Deliver (email), View Audit. Empty state should say "No invite links yet — create your first invite to start onboarding users."

**Create flow:** A modal or slide-over form with fields for `invitedEmail` (optional), `usageMode` (radio: Single Use / Limited Use), `usageLimit` (shown only when Limited Use selected), and `expiresAt` (date picker, optional). On success, dismiss the modal and refresh the list with a toast "Invite created".

**Registration page pattern (`/register?code=<inviteCode>`):** On load, the page calls `getInviteLinkByCode` to display invite metadata (intended email pre-filled if present, usage mode hint). The user then fills in their credentials. On submit, the app calls `validateInviteCode` first; only on success does it proceed to the auth registration endpoint.

**Error states:** Expired invite → show a friendly "This invite has expired" page. Exhausted/Revoked invite → "This invite is no longer valid." Network errors → toast with retry option.

**Audit trail:** A sub-panel or drawer on each invite shows the `inviteAudit` timeline in chronological order (eventType badge + timestamp + actor + note).



## InviteLink Data Object

Stores a unique invite registration token with usage rules, lifecycle state, delivery tracking, and a reference to the registered user created as a result of the invite.

### InviteLink  Data Object Frontend Description By The Backend Architect

## inviteLink — Frontend UX Notes

Represents a single invite link. **Headline fields:** `inviteCode` (display as a copyable badge), `inviteState` (colored status badge), `invitedEmail` (show as placeholder 'Open invite' when null), `usageMode` + `usageCount`/`usageLimit`.

**Detail fields:** `expiresAt` (show 'No expiry' when null), `lastUsedAt`, `registeredUserId` (link to user profile when set), `deliveryRequestedAt`, `lastDeliveredAt`.

**Status badge colors:** draft=gray, active=green, exhausted=orange, revoked=red, expired=purple, consumed=teal.

**usageMode display:** singleUse → 'Single Use', limitedUse → 'Limited Use (N remaining)' where N = usageLimit - usageCount.

The `inviteCode` is sensitive — show it as copyable text, not in list view column; only in the detail panel.


### InviteLink Data Object Properties

InviteLink data object has got following properties that are represented as table fields in the database scheme. 
These properties don't stand just for data storage, but each may have different settings to manage the business logic. 

| Property | Type | IsArray | Required | Secret | Description |
|----------|------|---------|----------|--------|-------------|
| `ownerUserId` | ID | false | Yes | No | - |
| `inviteCode` | String | false | Yes | No | - |
| `invitedEmail` | String | false | No | No | - |
| `usageMode` | Enum | false | Yes | No | - |
| `usageLimit` | Integer | false | No | No | - |
| `usageCount` | Integer | false | Yes | No | - |
| `inviteState` | Enum | false | Yes | No | - |
| `expiresAt` | Date | false | No | No | - |
| `lastUsedAt` | Date | false | No | No | - |
| `registeredUserId` | ID | false | No | No | - |
| `deliveryRequestedAt` | Date | false | No | No | - |
| `lastDeliveredAt` | Date | false | No | No | - |
* Required properties are mandatory for creating objects and must be provided in the request body if no default value, formula or session bind is set.



### Enum Properties
Enum properties are defined with a set of allowed values, ensuring that only valid options can be assigned to them. 
The enum options value will be stored as strings in the database, 
but when a data object is created an additional property with the same name plus an idx suffix will be created, which will hold the index of the selected enum option.
You can use the {fieldName_idx} property to sort by the enum value or when your enum options represent a hiyerarchy of values.
In the frontend input components, enum type properties should only accept values from an option component that lists the enum options.

- **usageMode**: [singleUse, limitedUse]

- **inviteState**: [draft, active, exhausted, revoked, expired, consumed]



### Filter Properties

`usageMode` `inviteState`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as API parameters in the listing API's.
- **usageMode**: Enum  has a filter named `usageMode`
- **inviteState**: Enum  has a filter named `inviteState`


## InviteAudit Data Object

Append-only audit log capturing every lifecycle event on an invite link, including who acted, what happened, and optional contextual notes.

### InviteAudit  Data Object Frontend Description By The Backend Architect

## inviteAudit — Frontend UX Notes

Read-only audit trail. Display as a chronological timeline (oldest first) in a drawer or sub-panel within the invite link detail view.

**Each entry:** `eventType` badge (created=blue, activated=green, delivered=cyan, validated=yellow, consumed=teal, revoked=red, expired=purple) + `eventAt` timestamp (relative time + absolute tooltip) + `actorUserId` (show 'System' when null) + `eventNote` (italic, below main row) + `relatedEmail` (if present, show as chip).

**No create/edit/delete UI exposed** — this is system-managed. The list is auto-loaded when the operator opens an invite detail view, filtered by `inviteLinkId`.


### InviteAudit Data Object Properties

InviteAudit data object has got following properties that are represented as table fields in the database scheme. 
These properties don't stand just for data storage, but each may have different settings to manage the business logic. 

| Property | Type | IsArray | Required | Secret | Description |
|----------|------|---------|----------|--------|-------------|
| `inviteLinkId` | ID | false | Yes | No | - |
| `eventType` | Enum | false | Yes | No | - |
| `eventAt` | Date | false | Yes | No | - |
| `actorUserId` | ID | false | No | No | - |
| `eventNote` | String | false | No | No | - |
| `relatedEmail` | String | false | No | No | - |
* Required properties are mandatory for creating objects and must be provided in the request body if no default value, formula or session bind is set.



### Enum Properties
Enum properties are defined with a set of allowed values, ensuring that only valid options can be assigned to them. 
The enum options value will be stored as strings in the database, 
but when a data object is created an additional property with the same name plus an idx suffix will be created, which will hold the index of the selected enum option.
You can use the {fieldName_idx} property to sort by the enum value or when your enum options represent a hiyerarchy of values.
In the frontend input components, enum type properties should only accept values from an option component that lists the enum options.

- **eventType**: [created, activated, delivered, validated, consumed, revoked, expired]


### Relation Properties

`inviteLinkId`

Mindbricks supports relations between data objects, allowing you to define how objects are linked together.
The relations may reference to a data object either in this service or in another service. Id the reference is remote, backend handles the relations through service communication or elastic search.
These relations should be respected in the frontend so that instaead of showing the related objects id, the frontend should list human readable values from other data objects.
If the relation points to another service, frontend should use the referenced service api in case it needs related data.
The relation logic is montly handled in backend so the api responses feeds the frontend about the relational data.
In mmost cases the api response will provide the relational data as well as the main one.

In frontend, please ensure that,

1- instaead of these relational ids you show the main human readable field of the related target data (like name),
2- if this data object needs a user input of these relational ids, you should provide a combobox with the list of possible records or (a searchbox) to select with the realted target data object main human readable field.


- **inviteLinkId**: ID
Relation to `inviteLink`.id

The target object is a sibling object, meaning that the relation is a many-to-one or one-to-one relationship from this object to the target.

Required: Yes


### Filter Properties

`inviteLinkId` `eventType`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as API parameters in the listing API's.
- **inviteLinkId**: ID  has a filter named `inviteLinkId`
- **eventType**: Enum  has a filter named `eventType`



## Default CRUD APIs

For each data object, the backend architect may designate **default APIs** for standard operations (create, update, delete, get, list). These are the APIs that frontend CRUD forms and AI agents should use for basic record management. If no default is explicitly set (`isDefaultApi`), the frontend generator auto-discovers the most general API for each operation.

### InviteLink Default APIs

| Operation | Hook | Type |
|-----------|------|------|
| Create | `useCreateInviteLink()` | mutation |
| Update | `useActivateInviteLink()` | mutation |
| Delete | _none_ | mutation |
| Get | `useGetInviteLink()` | query |
| List | `useListInviteLinks()` | query |
### InviteAudit Default APIs

| Operation | Hook | Type |
|-----------|------|------|
| Create | _none_ | mutation |
| Update | _none_ | mutation |
| Delete | _none_ | mutation |
| Get | _none_ | query |
| List | `useListInviteAudits()` | query |

When building CRUD forms for a data object, use the default hooks listed above. The form fields should correspond to the API's mutation payload. For relation fields, render a dropdown loaded from the related object's list hook using the display label property.






## SDK Hook Reference

Import hooks from `use-invitationcenter` and use them directly in your page components.


### Hooks Overview

| Hook | Type | CRUD | Auth | Returns |
|------|------|------|------|---------|
| `useCreateInviteLink()` | mutation | create | login required | `InvitationcenterInviteLinkResponse` |
| `useActivateInviteLink()` | mutation | update | login required | `InvitationcenterInviteLinkResponse` |
| `useRevokeInviteLink()` | mutation | update | login required | `InvitationcenterInviteLinkResponse` |
| `useDeliverInviteEmail()` | mutation | update | login required | `InvitationcenterInviteLinkResponse` |
| `useValidateInviteCode()` | mutation | update | public | `InvitationcenterInviteLinkResponse` |
| `useConsumeInviteLink()` | mutation | update | login required | `InvitationcenterInviteLinkResponse` |
| `useGetInviteLinkByCode()` | query | get | public | `InvitationcenterInviteLinkResponse` |
| `useGetInviteLink()` | query | get | login required | `InvitationcenterInviteLinkResponse` |
| `useListInviteLinks()` | query | list | login required | `InvitationcenterInviteLinkListResponse` |
| `useListInviteAudits()` | query | list | login required | `InvitationcenterInviteAuditListResponse` |

### Types

All response types extend `MindbricksResponse`:

```typescript
interface MindbricksResponse {
  status: "OK";
  statusCode: number;
  dataName?: string;
  rowCount?: number;
  paging?: { pageNumber: number; pageRowCount: number; totalRowCount: number; pageCount: number };
  [key: string]: unknown;
}
```

Each data object has a typed interface, a single-item response type, and a list response type:

**`InvitationcenterInviteLink`** — Stores a unique invite registration token with usage rules, lifecycle state, delivery tracking, and a reference to the registered user created as a result of the invite.

```typescript
interface InvitationcenterInviteLink {
  id: string;
  ownerUserId: string;
  inviteCode: string;
  invitedEmail?: string;
  usageMode: 'singleUse' | 'limitedUse';
  usageLimit?: number;
  usageCount: number;
  inviteState: 'draft' | 'active' | 'exhausted' | 'revoked' | 'expired' | 'consumed';
  expiresAt?: string;
  lastUsedAt?: string;
  registeredUserId?: string;
  deliveryRequestedAt?: string;
  lastDeliveredAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

- **Single response:** `InvitationcenterInviteLinkResponse` → `{ inviteLink: InvitationcenterInviteLink, dataName: string }` — extract via `data?.inviteLink`
- **List response:** `InvitationcenterInviteLinkListResponse` → `{ inviteLinks: InvitationcenterInviteLink[], rowCount: number, dataName: string }` — extract via `data?.inviteLinks ?? []`

**`InvitationcenterInviteAudit`** — Append-only audit log capturing every lifecycle event on an invite link, including who acted, what happened, and optional contextual notes.

```typescript
interface InvitationcenterInviteAudit {
  id: string;
  inviteLinkId: string;
  eventType: 'created' | 'activated' | 'delivered' | 'validated' | 'consumed' | 'revoked' | 'expired';
  eventAt: string;
  actorUserId?: string;
  eventNote?: string;
  relatedEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

- **Single response:** `InvitationcenterInviteAuditResponse` → `{ inviteAudit: InvitationcenterInviteAudit, dataName: string }` — extract via `data?.inviteAudit`
- **List response:** `InvitationcenterInviteAuditListResponse` → `{ inviteAudits: InvitationcenterInviteAudit[], rowCount: number, dataName: string }` — extract via `data?.inviteAudits ?? []`


### Hook Details

#### `useCreateInviteLink()`

Creates a new invite link with a generated unique code. Restricted to admins. The invite starts in 'draft' state and must be explicitly activated before use.

**Frontend Notes:** Triggered from the admin invite management panel via a 'Create Invite' button. Opens a modal/slide-over form. `usageLimit` field should be shown conditionally (only when `usageMode === 'limitedUse'`). `sellerId`/`ownerUserId` is auto-populated from session — do NOT show in form. On 201: close modal, refresh list, toast 'Invite link created'. On 400: show inline validation errors.

- **Type:** `mutation` (use `{ mutate, isPending }`)
- **Auth:** login required
- **Input:** `{ invitedEmail?: string, usageMode: 'singleUse' | 'limitedUse', usageLimit?: number, expiresAt?: string }`
- **Returns:** `InvitationcenterInviteLinkResponse`

#### `useActivateInviteLink()`

Transitions an invite link from 'draft' to 'active' state, making it usable for registration. Only invite links in 'draft' state can be activated.

**Frontend Notes:** Triggered from the invite list or detail view via an 'Activate' action button (shown only when inviteState='draft'). No form input needed — just a confirmation dialog. On 200: update the status badge inline or refresh row. Toast 'Invite link activated'. On 400: toast 'Invite link is not in draft state'.

- **Type:** `mutation` (use `{ mutate, isPending }`)
- **Auth:** login required
- **Input:** `(inviteLinkId: string)` — passed positionally
- **Returns:** `InvitationcenterInviteLinkResponse`

#### `useRevokeInviteLink()`

Revokes an invite link, preventing further use. Only invite links in 'draft' or 'active' states can be revoked. An optional reason note can be provided.

**Frontend Notes:** Triggered from the invite list or detail view via a 'Revoke' action button (shown when inviteState is 'draft' or 'active'). Opens a small confirmation dialog with optional 'Reason' text input. On 200: update badge to 'revoked'. Toast 'Invite link revoked'. On 400: toast with server error message.

- **Type:** `mutation` (use `{ mutate, isPending }`)
- **Auth:** login required
- **Input:** `{ inviteLinkId: string, data: { eventNote?: string } }`
- **Returns:** `InvitationcenterInviteLinkResponse`

#### `useDeliverInviteEmail()`

Triggers email delivery of an active invite link to its intended recipient. Sets deliveryRequestedAt and publishes a Kafka event for the notification service to handle. The invite must be in 'active' state and must have an invitedEmail set.

**Frontend Notes:** Triggered from the invite detail view via a 'Send Email' button (shown when inviteState='active' and invitedEmail is set). No form input. On 200: show 'Email delivery requested' toast and update `deliveryRequestedAt` display. On 400: show inline error from server.

- **Type:** `mutation` (use `{ mutate, isPending }`)
- **Auth:** login required
- **Input:** `(inviteLinkId: string)` — passed positionally
- **Returns:** `InvitationcenterInviteLinkResponse`

#### `useValidateInviteCode()`

Public endpoint that validates an invite code, increments its usage count, and updates its state. Used by the registration flow before creating a new user account. Raises an API event on success.

**Frontend Notes:** Called by the frontend registration page after the user submits their invite code. If the invite is valid, proceed to the account creation form. On 400 with 'expired': show 'This invite link has expired'. On 400 with 'limit reached': show 'This invite has already been used the maximum number of times'. On 404 (no active record found): show 'Invalid or inactive invite code'.

- **Type:** `mutation` (use `{ mutate, isPending }`)
- **Auth:** public
- **Input:** `{ inviteCode: string }`
- **Returns:** `InvitationcenterInviteLinkResponse`

#### `useConsumeInviteLink()`

Marks an invite link as consumed and records the registered user ID. Called by the auth service or an admin workflow after successful user registration. Raises an API event.

**Frontend Notes:** This is a machine-to-machine or admin-only operation — not directly user-triggered. No dedicated UI form. In the admin audit view it appears as a 'consumed' event in the timeline. After calling this API, the invite detail should show `registeredUserId` as a linked user.

- **Type:** `mutation` (use `{ mutate, isPending }`)
- **Auth:** login required
- **Input:** `{ inviteLinkId: string, data: { registeredUserId: string, relatedEmail?: string } }`
- **Returns:** `InvitationcenterInviteLinkResponse`

#### `useGetInviteLinkByCode()`

Public endpoint to fetch invite link metadata by its unique code. Used by the registration page to display invite details before the user fills in their credentials.

**Frontend Notes:** Called automatically on the `/register?code=<inviteCode>` page load. No user action required. Display invite metadata: `invitedEmail` (pre-fill the email input), `usageMode` badge, `expiresAt` (show 'No expiry' if null). If 404: show a full-page 'Invalid invite link' error with a link to contact support.

- **Type:** `query` (use `{ data, isLoading, error }`)
- **Auth:** public
- **Input:** `(inviteCode: string)` — passed positionally
- **Returns:** `InvitationcenterInviteLinkResponse`

#### `useGetInviteLink()`

Admin endpoint to fetch a single invite link by its ID.

**Frontend Notes:** Used when navigating to the invite detail view (`/admin/invites/:inviteLinkId`). Loads the full invite record for display. Show all fields including audit trail (loaded separately via listInviteAudits filtered by inviteLinkId).

- **Type:** `query` (use `{ data, isLoading, error }`)
- **Auth:** login required
- **Input:** `(inviteLinkId: string)` — passed positionally
- **Returns:** `InvitationcenterInviteLinkResponse`

#### `useListInviteLinks()`

Admin endpoint to list all invite links with optional filtering by usageMode and inviteState (auto-filter parameters).

**Frontend Notes:** Renders the admin invite management table. Filters are exposed as query params: `?usageMode=singleUse` and/or `?inviteState=active`. Sort by `createdAt` descending (newest first). Default page size 20. Empty state: 'No invite links found — try adjusting filters or create a new invite.'

- **Type:** `query` (use `{ data, isLoading, error }`)
- **Auth:** login required
- **Input:** `{ usageMode?: 'singleUse' | 'limitedUse', inviteState?: 'draft' | 'active' | 'exhausted' | 'revoked' | 'expired' | 'consumed', pageNumber?: number, pageRowCount?: number, getJoins?: boolean }`
- **Pagination:** supported — pass `pageNumber` / `pageRowCount` in params (default 20 rows/page)
- **Returns:** `InvitationcenterInviteLinkListResponse`

#### `useListInviteAudits()`

Admin endpoint to list audit log entries for invite links. Filterable by inviteLinkId and eventType.

**Frontend Notes:** Loaded in the invite detail drawer/sub-panel. Always called with `?inviteLinkId=<id>` filter to show the audit trail for a specific invite. Displayed as a timeline (oldest first). If loading the full audit list in the admin view without a specific invite, no inviteLinkId filter is applied — admins can see all events.

- **Type:** `query` (use `{ data, isLoading, error }`)
- **Auth:** login required
- **Input:** `{ inviteLinkId?: string, eventType?: 'created' | 'activated' | 'delivered' | 'validated' | 'consumed' | 'revoked' | 'expired', pageNumber?: number, pageRowCount?: number, getJoins?: boolean }`
- **Pagination:** supported — pass `pageNumber` / `pageRowCount` in params (default 50 rows/page)
- **Returns:** `InvitationcenterInviteAuditListResponse`


### Usage Pattern

```tsx
// Query hook (list/get) — returns { data, isLoading, error }
const { data, isLoading } = useListItems();
const items = data?.items ?? [];

// Mutation hook (create/update/delete) — returns { mutate, isPending }
const { mutate: createItem, isPending } = useCreateItem();
createItem(payload, {
  onSuccess: (data) => { /* navigate or invalidate queries */ },
  onError: (err) => { /* show error toast */ },
});
```



**After this prompt, the user may give you new instructions to update the output of this prompt or provide subsequent prompts about the project.**


