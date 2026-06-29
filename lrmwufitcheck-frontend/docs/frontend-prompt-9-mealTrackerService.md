

# **FITCHECK**

**FRONTEND GUIDE FOR AI CODING AGENTS - PART 9 - MealTracker Service**

This document is a part of a REST API guide for the fitcheck project.
It is designed for AI agents that will generate frontend code to consume the project’s backend.

This document provides extensive instruction for the usage of mealTracker

## Service Access

Use the generated hooks for all `mealTracker` operations. The SDK handles service URLs, auth headers, and token management. Import hooks from `use-mealtracker` and types from `api.ts`.


## Scope

**MealTracker Service Description**

Creates and manages user meal logs from multiple sources, calculates per-item and meal-level nutrition totals, stores immutable daily consumption snapshots, and exposes daily progress, weekly, and monthly analytics APIs.

MealTracker service provides apis and business logic for following data objects in fitcheck application. 
Each data object may be either a central domain of the application data structure or a related helper data object for a central concept.
Note that data object concept is equal to table concept in the database, in the service database each data object is represented as a db table scheme and the object instances as table rows.  


**`mealLog` Data Object**: A single meal entry for a user on a given date and time, tagged with a slot name and source, storing meal-level nutrition totals.

**`mealLine` Data Object**: An individual food item within a meal log, storing the consumed gram amount and snapshot nutrition values calculated at log time — immutable with respect to food library changes.

**`nutritionDay` Data Object**: A daily rollup record per user storing consumed totals for all six macros alongside the target values active on that day, plus exceeded metric flags and meal count. Created/updated whenever meals are logged or edited.


## MealTracker Service Frontend Description By The Backend Architect

## mealTracker Service UX Guide

This service is the core of the user's daily nutrition tracking experience. The primary user flow is: log a meal (selecting date, time slot, and food items) → view daily progress on the dashboard → review weekly/monthly analytics.

**Meal logging flow** is wizard-style with progressive disclosure: date/time selection first, then slot (Kahvaltı/Öğle/Akşam/Atıştırma or custom), then individual food item entry. Multiple items per meal are added in a list — each row has food name, grams, and the system calculates or accepts pre-computed nutrition values. The meal totals (calories, protein, carbs, fat, sugar, fiber) are shown as a running summary below the item list.

**Daily progress dashboard** (the landing page) shows a ring chart or progress bars for each of the 6 macros (calories, protein, carbs, fat, sugar, fiber) with consumed vs. target. Color coding: green ≤ 80% of target, yellow 80–100%, red > 100%. The dashboard auto-loads today's data on mount via `getDailyProgress`.

**Meal history** (`listMealLogs`) shows a date-grouped list of past meals. Each meal card shows slot name, time, total calories. Tapping expands to show individual food lines. Filter by date range or source (foodLibrary, manualEntry, etc.) via query params.

**Analytics pages** (weekly/monthly) show trend charts per macro over the period, plus a goal-hit-rate summary per macro. Line charts with date on x-axis, consumed amount on y-axis, target as a dashed horizontal line.

**Scheduled admin APIs** (`/scheduled/daily-reminder-check`, `/scheduled/daily-summary`) are internal — not surfaced in any user-facing UI. They are called by a cron scheduler and emit Kafka events that the notification service consumes.

All write operations (create/update/delete meal log or line) should trigger an optimistic UI update followed by a re-fetch of the daily progress widget to reflect the recomputed totals.



## MealLog Data Object

A single meal entry for a user on a given date and time, tagged with a slot name and source, storing meal-level nutrition totals.

### MealLog  Data Object Frontend Description By The Backend Architect

Represents one meal (e.g. lunch on a given day). Headline fields for cards: slotName, mealDate, totalCalories. Secondary: mealTime, logSource. Nutrition totals (protein, carbs, fat, sugar, fiber) shown as a compact macro strip below the headline. logSource shown as a small badge (foodLibrary=blue, manualEntry=gray, aiAssistant=purple, presetTemplate=green). noteText shown as a collapsible section. The list of child mealLines is loaded separately and shown on meal detail expand.


### MealLog Data Object Properties

MealLog data object has got following properties that are represented as table fields in the database scheme. 
These properties don't stand just for data storage, but each may have different settings to manage the business logic. 

| Property | Type | IsArray | Required | Secret | Description |
|----------|------|---------|----------|--------|-------------|
| `userId` | ID | false | Yes | No | - |
| `mealDate` | Date | false | Yes | No | - |
| `mealTime` | String | false | Yes | No | - |
| `slotName` | String | false | Yes | No | - |
| `logSource` | Enum | false | Yes | No | - |
| `noteText` | String | false | No | No | - |
| `totalCalories` | Double | false | Yes | No | - |
| `totalProtein` | Double | false | Yes | No | - |
| `totalCarbohydrates` | Double | false | Yes | No | - |
| `totalFat` | Double | false | Yes | No | - |
| `totalSugar` | Double | false | Yes | No | - |
| `totalFiber` | Double | false | Yes | No | - |
* Required properties are mandatory for creating objects and must be provided in the request body if no default value, formula or session bind is set.



### Enum Properties
Enum properties are defined with a set of allowed values, ensuring that only valid options can be assigned to them. 
The enum options value will be stored as strings in the database, 
but when a data object is created an additional property with the same name plus an idx suffix will be created, which will hold the index of the selected enum option.
You can use the {fieldName_idx} property to sort by the enum value or when your enum options represent a hiyerarchy of values.
In the frontend input components, enum type properties should only accept values from an option component that lists the enum options.

- **logSource**: [foodLibrary, presetTemplate, manualEntry, aiAssistant]



### Filter Properties

`mealDate` `logSource`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as API parameters in the listing API's.
- **mealDate**: Date  has a filter named `mealDate`
- **logSource**: Enum  has a filter named `logSource`


## MealLine Data Object

An individual food item within a meal log, storing the consumed gram amount and snapshot nutrition values calculated at log time — immutable with respect to food library changes.

### MealLine  Data Object Frontend Description By The Backend Architect

Each row in a meal's item list. Display: itemName (headline), consumedGrams + 'g', itemCalories. Secondary macros (protein, carbs, fat, sugar, fiber) shown on expand. lineSource shown as a micro-badge. sourceFoodItemId shown as a subtle link icon if present. Nutrition values are snapshots — never recalculated from source. Edit is allowed on grams and all nutrition fields.


### MealLine Data Object Properties

MealLine data object has got following properties that are represented as table fields in the database scheme. 
These properties don't stand just for data storage, but each may have different settings to manage the business logic. 

| Property | Type | IsArray | Required | Secret | Description |
|----------|------|---------|----------|--------|-------------|
| `userId` | ID | false | Yes | No | - |
| `mealLogId` | ID | false | Yes | No | - |
| `sourceFoodItemId` | ID | false | No | No | - |
| `sourcePresetMealId` | ID | false | No | No | - |
| `itemName` | String | false | Yes | No | - |
| `consumedGrams` | Double | false | Yes | No | - |
| `itemCalories` | Double | false | Yes | No | - |
| `itemProtein` | Double | false | Yes | No | - |
| `itemCarbohydrates` | Double | false | Yes | No | - |
| `itemFat` | Double | false | Yes | No | - |
| `itemSugar` | Double | false | Yes | No | - |
| `itemFiber` | Double | false | Yes | No | - |
| `lineSource` | Enum | false | Yes | No | - |
* Required properties are mandatory for creating objects and must be provided in the request body if no default value, formula or session bind is set.



### Enum Properties
Enum properties are defined with a set of allowed values, ensuring that only valid options can be assigned to them. 
The enum options value will be stored as strings in the database, 
but when a data object is created an additional property with the same name plus an idx suffix will be created, which will hold the index of the selected enum option.
You can use the {fieldName_idx} property to sort by the enum value or when your enum options represent a hiyerarchy of values.
In the frontend input components, enum type properties should only accept values from an option component that lists the enum options.

- **lineSource**: [foodLibrary, presetTemplate, manualEntry, aiAssistant, temporaryAi]


### Relation Properties

`mealLogId`

Mindbricks supports relations between data objects, allowing you to define how objects are linked together.
The relations may reference to a data object either in this service or in another service. Id the reference is remote, backend handles the relations through service communication or elastic search.
These relations should be respected in the frontend so that instaead of showing the related objects id, the frontend should list human readable values from other data objects.
If the relation points to another service, frontend should use the referenced service api in case it needs related data.
The relation logic is montly handled in backend so the api responses feeds the frontend about the relational data.
In mmost cases the api response will provide the relational data as well as the main one.

In frontend, please ensure that,

1- instaead of these relational ids you show the main human readable field of the related target data (like name),
2- if this data object needs a user input of these relational ids, you should provide a combobox with the list of possible records or (a searchbox) to select with the realted target data object main human readable field.


- **mealLogId**: ID
Relation to `mealLog`.id

The target object is a sibling object, meaning that the relation is a many-to-one or one-to-one relationship from this object to the target.

Required: Yes


### Filter Properties

`mealLogId`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as API parameters in the listing API's.
- **mealLogId**: ID  has a filter named `mealLogId`


## NutritionDay Data Object

A daily rollup record per user storing consumed totals for all six macros alongside the target values active on that day, plus exceeded metric flags and meal count. Created/updated whenever meals are logged or edited.

### NutritionDay  Data Object Frontend Description By The Backend Architect

The core dashboard data object. Shows a 6-macro progress panel: calories, protein, carbs, fat, sugar, fiber. Each macro: circular gauge or horizontal progress bar, consumed/target label, color-coded by % of target. exceededMetrics parsed from comma-separated string to highlight red badges on exceeded macros. mealCount shown as '3 meals today'. summaryDate shown at the top as the report date. Target values shown as muted secondary labels. On the analytics pages this object appears as rows in a weekly/monthly table or chart.


### NutritionDay Data Object Properties

NutritionDay data object has got following properties that are represented as table fields in the database scheme. 
These properties don't stand just for data storage, but each may have different settings to manage the business logic. 

| Property | Type | IsArray | Required | Secret | Description |
|----------|------|---------|----------|--------|-------------|
| `userId` | ID | false | Yes | No | - |
| `summaryDate` | Date | false | Yes | No | - |
| `consumedCalories` | Double | false | Yes | No | - |
| `consumedProtein` | Double | false | Yes | No | - |
| `consumedCarbohydrates` | Double | false | Yes | No | - |
| `consumedFat` | Double | false | Yes | No | - |
| `consumedSugar` | Double | false | Yes | No | - |
| `consumedFiber` | Double | false | Yes | No | - |
| `targetCalories` | Double | false | Yes | No | - |
| `targetProtein` | Double | false | Yes | No | - |
| `targetCarbohydrates` | Double | false | Yes | No | - |
| `targetFat` | Double | false | Yes | No | - |
| `targetSugar` | Double | false | Yes | No | - |
| `targetFiber` | Double | false | Yes | No | - |
| `exceededMetrics` | String | false | No | No | - |
| `mealCount` | Integer | false | Yes | No | - |
* Required properties are mandatory for creating objects and must be provided in the request body if no default value, formula or session bind is set.





### Filter Properties

`summaryDate`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as API parameters in the listing API's.
- **summaryDate**: Date  has a filter named `summaryDate`



## Default CRUD APIs

For each data object, the backend architect may designate **default APIs** for standard operations (create, update, delete, get, list). These are the APIs that frontend CRUD forms and AI agents should use for basic record management. If no default is explicitly set (`isDefaultApi`), the frontend generator auto-discovers the most general API for each operation.

### MealLog Default APIs

**Display Label Property:** `slotName` — Use this property as the human-readable label when displaying records of this data object (e.g., in dropdowns, references).
| Operation | Hook | Type |
|-----------|------|------|
| Create | `useCreateMealLog()` | mutation |
| Update | `useUpdateMealLog()` | mutation |
| Delete | `useDeleteMealLog()` | mutation |
| Get | `useGetMealLog()` | query |
| List | `useListMealLogs()` | query |
### MealLine Default APIs

**Display Label Property:** `itemName` — Use this property as the human-readable label when displaying records of this data object (e.g., in dropdowns, references).
| Operation | Hook | Type |
|-----------|------|------|
| Create | `useCreateMealLine()` | mutation |
| Update | `useUpdateMealLine()` | mutation |
| Delete | `useDeleteMealLine()` | mutation |
| Get | _none_ | query |
| List | `useListMealLines()` | query |
### NutritionDay Default APIs

| Operation | Hook | Type |
|-----------|------|------|
| Create | _none_ | mutation |
| Update | `useTriggerDailyReminderCheck()` | mutation |
| Delete | _none_ | mutation |
| Get | `useGetNutritionDay()` | query |
| List | `useListNutritionDays()` | query |

When building CRUD forms for a data object, use the default hooks listed above. The form fields should correspond to the API's mutation payload. For relation fields, render a dropdown loaded from the related object's list hook using the display label property.






## SDK Hook Reference

Import hooks from `use-mealtracker` and use them directly in your page components.


### Hooks Overview

| Hook | Type | CRUD | Auth | Returns |
|------|------|------|------|---------|
| `useCreateMealLog()` | mutation | create | owner or admin | `MealtrackerMealLogResponse` |
| `useGetMealLog()` | query | get | owner or admin | `MealtrackerMealLogResponse` |
| `useListMealLogs()` | query | list | owner or admin | `MealtrackerMealLogListResponse` |
| `useUpdateMealLog()` | mutation | update | owner or admin | `MealtrackerMealLogResponse` |
| `useDeleteMealLog()` | mutation | delete | owner or admin | `MealtrackerMealLogResponse` |
| `useCreateMealLine()` | mutation | create | owner or admin | `MealtrackerMealLineResponse` |
| `useUpdateMealLine()` | mutation | update | owner or admin | `MealtrackerMealLineResponse` |
| `useDeleteMealLine()` | mutation | delete | owner or admin | `MealtrackerMealLineResponse` |
| `useListMealLines()` | query | list | owner or admin | `MealtrackerMealLineListResponse` |
| `useGetDailyProgress()` | query | get | owner or admin | `MealtrackerNutritionDayResponse` |
| `useGetNutritionDay()` | query | get | owner or admin | `MealtrackerNutritionDayResponse` |
| `useListNutritionDays()` | query | list | owner or admin | `MealtrackerNutritionDayListResponse` |
| `useGetWeeklyAnalytics()` | query | list | owner or admin | `MealtrackerNutritionDayListResponse` |
| `useGetMonthlyAnalytics()` | query | list | owner or admin | `MealtrackerNutritionDayListResponse` |
| `useTriggerDailyReminderCheck()` | mutation | update | login required | `MealtrackerNutritionDayResponse` |
| `useTriggerDailySummary()` | mutation | update | login required | `MealtrackerNutritionDayResponse` |

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

**`MealtrackerMealLog`** — A single meal entry for a user on a given date and time, tagged with a slot name and source, storing meal-level nutrition totals.

```typescript
interface MealtrackerMealLog {
  id: string;
  userId: string;
  mealDate: string;
  mealTime: string;
  slotName: string;
  logSource: 'foodLibrary' | 'presetTemplate' | 'manualEntry' | 'aiAssistant';
  noteText?: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbohydrates: number;
  totalFat: number;
  totalSugar: number;
  totalFiber: number;
  createdAt?: string;
  updatedAt?: string;
}
```

- **Single response:** `MealtrackerMealLogResponse` → `{ mealLog: MealtrackerMealLog, dataName: string }` — extract via `data?.mealLog`
- **List response:** `MealtrackerMealLogListResponse` → `{ mealLogs: MealtrackerMealLog[], rowCount: number, dataName: string }` — extract via `data?.mealLogs ?? []`

**`MealtrackerMealLine`** — An individual food item within a meal log, storing the consumed gram amount and snapshot nutrition values calculated at log time — immutable with respect to food library changes.

```typescript
interface MealtrackerMealLine {
  id: string;
  userId: string;
  mealLogId: string;
  sourceFoodItemId?: string;
  sourcePresetMealId?: string;
  itemName: string;
  consumedGrams: number;
  itemCalories: number;
  itemProtein: number;
  itemCarbohydrates: number;
  itemFat: number;
  itemSugar: number;
  itemFiber: number;
  lineSource: 'foodLibrary' | 'presetTemplate' | 'manualEntry' | 'aiAssistant' | 'temporaryAi';
  createdAt?: string;
  updatedAt?: string;
}
```

- **Single response:** `MealtrackerMealLineResponse` → `{ mealLine: MealtrackerMealLine, dataName: string }` — extract via `data?.mealLine`
- **List response:** `MealtrackerMealLineListResponse` → `{ mealLines: MealtrackerMealLine[], rowCount: number, dataName: string }` — extract via `data?.mealLines ?? []`

**`MealtrackerNutritionDay`** — A daily rollup record per user storing consumed totals for all six macros alongside the target values active on that day, plus exceeded metric flags and meal count. Created/updated whenever meals are logged or edited.

```typescript
interface MealtrackerNutritionDay {
  id: string;
  userId: string;
  summaryDate: string;
  consumedCalories: number;
  consumedProtein: number;
  consumedCarbohydrates: number;
  consumedFat: number;
  consumedSugar: number;
  consumedFiber: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbohydrates: number;
  targetFat: number;
  targetSugar: number;
  targetFiber: number;
  exceededMetrics?: string;
  mealCount: number;
  createdAt?: string;
  updatedAt?: string;
}
```

- **Single response:** `MealtrackerNutritionDayResponse` → `{ nutritionDay: MealtrackerNutritionDay, dataName: string }` — extract via `data?.nutritionDay`
- **List response:** `MealtrackerNutritionDayListResponse` → `{ nutritionDays: MealtrackerNutritionDay[], rowCount: number, dataName: string }` — extract via `data?.nutritionDays ?? []`


### Hook Details

#### `useCreateMealLog()`

Creates a new meal log entry with all nutrition totals and then inserts individual meal line items via a loop action. After creation, upserts the daily nutrition snapshot.

**Frontend Notes:** Triggered from the meal logging form (POST on submit). userId is auto-populated from session — never ask the user. Required fields: mealDate, mealTime, slotName, logSource, totalCalories, totalProtein, totalCarbohydrates, totalFat, totalSugar, totalFiber, lines[]. On 201: redirect to meal detail or refresh daily progress widget, show toast 'Meal logged successfully'. On 400/422: show inline field errors.

- **Type:** `mutation` (use `{ mutate, isPending }`)
- **Auth:** owner or admin
- **Input:** `{ mealDate: string, mealTime: string, slotName: string, logSource: 'foodLibrary' | 'presetTemplate' | 'manualEntry' | 'aiAssistant', noteText?: string, totalCalories: number, totalProtein: number, totalCarbohydrates: number, totalFat: number, totalSugar: number, totalFiber: number, lines: Record<string, unknown>[] }`
- **Returns:** `MealtrackerMealLogResponse`

#### `useGetMealLog()`

Retrieves a single meal log by ID, scoped to the authenticated user.

**Frontend Notes:** Triggered when user taps a meal card to view detail. Shows all fields including noteText and individual mealLines (loaded via a separate listMealLines call filtered by mealLogId). On 404: show 'Meal not found' and navigate back.

- **Type:** `query` (use `{ data, isLoading, error }`)
- **Auth:** owner or admin
- **Input:** `(mealLogId: string)` — passed positionally
- **Returns:** `MealtrackerMealLogResponse`

#### `useListMealLogs()`

Lists meal logs for the authenticated user with optional date range filtering. mealDate and logSource are auto-filtered via isFilterParameter.

**Frontend Notes:** Powers the meal history page. Shows paginated list grouped by date. Filter bar at top: date range picker (fromDate/toDate), source multi-select. Auto-filters for mealDate and logSource are passed as query params. On empty state: show 'No meals logged yet' with a CTA to add a meal.

- **Type:** `query` (use `{ data, isLoading, error }`)
- **Auth:** owner or admin
- **Input:** `{ fromDate?: string, toDate?: string, mealDate?: string, logSource?: 'foodLibrary' | 'presetTemplate' | 'manualEntry' | 'aiAssistant', pageNumber?: number, pageRowCount?: number, getJoins?: boolean }`
- **Pagination:** supported — pass `pageNumber` / `pageRowCount` in params (default 20 rows/page)
- **Returns:** `MealtrackerMealLogListResponse`

#### `useUpdateMealLog()`

Updates editable fields of a meal log and recomputes the nutrition day snapshot.

**Frontend Notes:** Triggered from the meal edit form. All fields optional — only send changed values. On success: update the meal card in the list and refresh daily progress widget. On 404: show 'Meal not found'.

- **Type:** `mutation` (use `{ mutate, isPending }`)
- **Auth:** owner or admin
- **Input:** `{ mealLogId: string, data: { mealTime?: string, slotName?: string, noteText?: string, totalCalories?: number, totalProtein?: number, totalCarbohydrates?: number, totalFat?: number, totalSugar?: number, totalFiber?: number } }`
- **Returns:** `MealtrackerMealLogResponse`

#### `useDeleteMealLog()`

Deletes a meal log and its associated meal lines, then recomputes the nutrition day snapshot.

**Frontend Notes:** Triggered from meal card delete button (with confirmation dialog). On success: remove card from list, show toast 'Meal deleted', refresh daily progress widget. On 404: show 'Meal not found'.

- **Type:** `mutation` (use `{ mutate, isPending }`)
- **Auth:** owner or admin
- **Input:** `(mealLogId: string)` — passed positionally
- **Returns:** `MealtrackerMealLogResponse`

#### `useCreateMealLine()`

Creates an individual meal line item and then recalculates meal-level and day-level nutrition totals.

**Frontend Notes:** Triggered when user adds a food item to an existing meal (inline add form on meal detail). Required: mealLogId, itemName, consumedGrams, all 6 nutrition snapshot values, lineSource. userId auto-populated from session. On 201: add row to meal line list, update meal totals display. On 403: show 'This meal does not belong to you'.

- **Type:** `mutation` (use `{ mutate, isPending }`)
- **Auth:** owner or admin
- **Input:** `{ mealLogId: string, itemName: string, consumedGrams: number, itemCalories: number, itemProtein: number, itemCarbohydrates: number, itemFat: number, itemSugar: number, itemFiber: number, lineSource: 'foodLibrary' | 'presetTemplate' | 'manualEntry' | 'aiAssistant' | 'temporaryAi', sourceFoodItemId?: string, sourcePresetMealId?: string }`
- **Returns:** `MealtrackerMealLineResponse`

#### `useUpdateMealLine()`

Updates nutrition snapshot values of a meal line item, then recalculates meal-level and day-level totals.

**Frontend Notes:** Triggered from inline edit on a meal line row. All fields optional. On success: update row values and refresh meal totals strip. On 404: show 'Item not found'.

- **Type:** `mutation` (use `{ mutate, isPending }`)
- **Auth:** owner or admin
- **Input:** `{ mealLineId: string, data: { itemName?: string, consumedGrams?: number, itemCalories?: number, itemProtein?: number, itemCarbohydrates?: number, itemFat?: number, itemSugar?: number, itemFiber?: number } }`
- **Returns:** `MealtrackerMealLineResponse`

#### `useDeleteMealLine()`

Deletes a meal line item and recomputes the parent meal log and daily nutrition totals.

**Frontend Notes:** Triggered from delete button on a meal line row (with confirmation). On success: remove row, recalculate meal totals, refresh daily progress. On 404: show 'Item not found'.

- **Type:** `mutation` (use `{ mutate, isPending }`)
- **Auth:** owner or admin
- **Input:** `(mealLineId: string)` — passed positionally
- **Returns:** `MealtrackerMealLineResponse`

#### `useListMealLines()`

Lists meal lines for the authenticated user. mealLogId is an auto-filter param via isFilterParameter=true.

**Frontend Notes:** Used on meal detail page to load food items for a specific meal. Always called with ?mealLogId=<id>. Shows a table: itemName, consumedGrams, itemCalories, itemProtein, itemCarbohydrates, itemFat, itemSugar, itemFiber. Each row has edit and delete buttons.

- **Type:** `query` (use `{ data, isLoading, error }`)
- **Auth:** owner or admin
- **Input:** `{ mealLogId?: string, pageNumber?: number, pageRowCount?: number, getJoins?: boolean }`
- **Pagination:** supported — pass `pageNumber` / `pageRowCount` in params (default 50 rows/page)
- **Returns:** `MealtrackerMealLineListResponse`

#### `useGetDailyProgress()`

Retrieves (or initializes) the nutritionDay record for a given date, defaulting to today. Used as the primary dashboard data source.

**Frontend Notes:** This is the primary dashboard API. Called on page load with no params (defaults to today) or with ?targetDate=YYYY-MM-DD. Response populates the 6-macro progress panel. Show a skeleton loader while fetching. On success update all progress bars/gauges with color coding. Refresh after any meal log write operation.

- **Type:** `query` (use `{ data, isLoading, error }`)
- **Auth:** owner or admin
- **Input:** `(params?: { targetDate?: string })` — passed positionally
- **Returns:** `MealtrackerNutritionDayResponse`

#### `useGetNutritionDay()`

Retrieves a single nutritionDay record by ID, scoped to the authenticated user.

**Frontend Notes:** Used when navigating to a specific past day's nutrition detail. Standard get by ID. On 404: show 'No data for this date'.

- **Type:** `query` (use `{ data, isLoading, error }`)
- **Auth:** owner or admin
- **Input:** `(nutritionDayId: string)` — passed positionally
- **Returns:** `MealtrackerNutritionDayResponse`

#### `useListNutritionDays()`

Lists nutritionDay records for the authenticated user with optional date range filtering.

**Frontend Notes:** Used by analytics pages to fetch the raw daily data. Always scoped to session.userId. Pass fromDate/toDate for range queries. summaryDate is an auto-filter from isFilterParameter=true. Returns sorted by summaryDate descending.

- **Type:** `query` (use `{ data, isLoading, error }`)
- **Auth:** owner or admin
- **Input:** `{ fromDate?: string, toDate?: string, summaryDate?: string, pageNumber?: number, pageRowCount?: number, getJoins?: boolean }`
- **Pagination:** supported — pass `pageNumber` / `pageRowCount` in params (default 30 rows/page)
- **Returns:** `MealtrackerNutritionDayListResponse`

#### `useGetWeeklyAnalytics()`

Returns the last 7 days of nutritionDay records plus computed analytics (averages, goal hit rates, calorie trend) via LIB.buildWeeklyAnalytics.

**Frontend Notes:** Triggered on the Weekly Analytics page load. Shows: a 7-day calorie trend line chart, a per-macro average bar chart, and a goal-hit-rate table (% of days each macro stayed within target). weeklyAnalytics context value is written to the response for the chart data. Loading state: skeleton chart cards.

- **Type:** `query` (use `{ data, isLoading, error }`)
- **Auth:** owner or admin
- **Input:** `{ getJoins?: boolean }`
- **Pagination:** not supported (single-shot list)
- **Returns:** `MealtrackerNutritionDayListResponse`

#### `useGetMonthlyAnalytics()`

Returns the last 30 days of nutritionDay records plus computed analytics (averages, goal hit rates, multi-macro trends) via LIB.buildMonthlyAnalytics.

**Frontend Notes:** Triggered on the Monthly Analytics page load. Shows: 6 trend line charts (one per macro), per-macro average and goal-hit-rate summary cards. monthlyAnalytics context value is written to the response. Loading state: skeleton chart panel.

- **Type:** `query` (use `{ data, isLoading, error }`)
- **Auth:** owner or admin
- **Input:** `{ getJoins?: boolean }`
- **Pagination:** not supported (single-shot list)
- **Returns:** `MealtrackerNutritionDayListResponse`

#### `useTriggerDailyReminderCheck()`

Admin-only scheduled endpoint that finds users with no meals today and emits a Kafka reminder event for each.

**Frontend Notes:** Internal scheduled endpoint — not surfaced in any user-facing UI. Called by external cron at ~20:00 Turkish time. No user interaction.

- **Type:** `mutation` (use `{ mutate, isPending }`)
- **Auth:** login required
- **Returns:** `MealtrackerNutritionDayResponse`

#### `useTriggerDailySummary()`

Admin-only scheduled endpoint that finds users with meals today and emits a Kafka daily summary event for each.

**Frontend Notes:** Internal scheduled endpoint — not surfaced in any user-facing UI. Called by external cron at ~23:59 Turkish time. No user interaction.

- **Type:** `mutation` (use `{ mutate, isPending }`)
- **Auth:** login required
- **Returns:** `MealtrackerNutritionDayResponse`


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


