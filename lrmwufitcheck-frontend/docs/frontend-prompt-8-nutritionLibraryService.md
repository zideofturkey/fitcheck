

# **FITCHECK**

**FRONTEND GUIDE FOR AI CODING AGENTS - PART 8 - NutritionLibrary Service**

This document is a part of a REST API guide for the fitcheck project.
It is designed for AI agents that will generate frontend code to consume the project’s backend.

This document provides extensive instruction for the usage of nutritionLibrary

## Service Access

Use the generated hooks for all `nutritionLibrary` operations. The SDK handles service URLs, auth headers, and token management. Import hooks from `use-nutritionlibrary` and types from `api.ts`.


## Scope

**NutritionLibrary Service Description**

Manages each user's private macro targets, personal food library, and reusable preset meal templates with auto-calculated nutrition totals.

NutritionLibrary service provides apis and business logic for following data objects in fitcheck application. 
Each data object may be either a central domain of the application data structure or a related helper data object for a central concept.
Note that data object concept is equal to table concept in the database, in the service database each data object is represented as a db table scheme and the object instances as table rows.  


**`macroTarget` Data Object**: Stores the authenticated user's six daily macro targets (calories, protein, carbohydrates, fat, sugar, fiber). Each user has one active target record; updating replaces the effective values.

**`foodItem` Data Object**: A private, reusable food definition in the user's personal food library. Stores per-100g nutrition values. Editable at any time without affecting historical meal log snapshots.

**`presetMeal` Data Object**: A reusable preset meal template owned by a user. Stores auto-calculated aggregate nutrition totals derived from its constituent preset lines. Mutations during meal logging must never affect this record.

**`presetLine` Data Object**: A single food item entry within a preset meal template. Stores a gram amount and snapshot nutrition values calculated at line creation. Lines are created or deleted to modify a preset; individual lines are not edited (replace pattern).


## NutritionLibrary Service Frontend Description By The Backend Architect

The nutritionLibrary service backs the user's personal nutrition configuration area. Three primary surfaces: (1) Macro Targets page — a single-record form where the user sets or updates their six daily targets; on save, show a success toast and reflect updated values immediately. (2) Food Library page — a paginated/searchable list of the user's saved food items with filter chips for category and creation source; inline edit opens a side drawer or modal with per-100g fields; empty state prompts 'Add your first food'. (3) Preset Meals page — a card grid of preset templates; clicking a card expands lines with gram amounts and nutrition breakdowns; add/remove line flows are inline. All write operations are optimistic-update: show the new state immediately and revert on error. Nutrition numbers are formatted to one decimal place. Category labels support Turkish characters. The AI assistant can create food items with creationSource=aiAssistant; those entries get a distinct badge so the user knows they were AI-generated.



## MacroTarget Data Object

Stores the authenticated user's six daily macro targets (calories, protein, carbohydrates, fat, sugar, fiber). Each user has one active target record; updating replaces the effective values.

### MacroTarget  Data Object Frontend Description By The Backend Architect

Represents the user's active daily macro goals. Display all six targets prominently as editable number fields (calories as kcal, others as grams). effectiveFrom shows when targets were last updated — display as 'Updated on [date]'. The page has a single form that POSTs to setMacroTarget; no separate edit mode is needed since there is only one active record. Show current values pre-filled if a target exists.


### MacroTarget Data Object Properties

MacroTarget data object has got following properties that are represented as table fields in the database scheme. 
These properties don't stand just for data storage, but each may have different settings to manage the business logic. 

| Property | Type | IsArray | Required | Secret | Description |
|----------|------|---------|----------|--------|-------------|
| `userId` | ID | false | Yes | No | - |
| `calorieTarget` | Double | false | Yes | No | - |
| `proteinTarget` | Double | false | Yes | No | - |
| `carbohydrateTarget` | Double | false | Yes | No | - |
| `fatTarget` | Double | false | Yes | No | - |
| `sugarTarget` | Double | false | Yes | No | - |
| `fiberTarget` | Double | false | Yes | No | - |
| `effectiveFrom` | Date | false | Yes | No | - |
* Required properties are mandatory for creating objects and must be provided in the request body if no default value, formula or session bind is set.




### Relation Properties

`userId`

Mindbricks supports relations between data objects, allowing you to define how objects are linked together.
The relations may reference to a data object either in this service or in another service. Id the reference is remote, backend handles the relations through service communication or elastic search.
These relations should be respected in the frontend so that instaead of showing the related objects id, the frontend should list human readable values from other data objects.
If the relation points to another service, frontend should use the referenced service api in case it needs related data.
The relation logic is montly handled in backend so the api responses feeds the frontend about the relational data.
In mmost cases the api response will provide the relational data as well as the main one.

In frontend, please ensure that,

1- instaead of these relational ids you show the main human readable field of the related target data (like name),
2- if this data object needs a user input of these relational ids, you should provide a combobox with the list of possible records or (a searchbox) to select with the realted target data object main human readable field.


- **userId**: ID
Relation to `user`.id

The target object is a sibling object, meaning that the relation is a many-to-one or one-to-one relationship from this object to the target.

Required: Yes



## FoodItem Data Object

A private, reusable food definition in the user's personal food library. Stores per-100g nutrition values. Editable at any time without affecting historical meal log snapshots.

### FoodItem  Data Object Frontend Description By The Backend Architect

Represents a saved food in the user's library. foodName is the headline field. Display per-100g values in a compact table (Calories, Protein, Carbs, Fat, Sugar, Fiber). brandName is optional — show in parentheses after the food name if present. foodCategory renders as a filter chip/tag. creationSource=aiAssistant shows a small AI badge. In the food picker (for meal logging), show foodName + brandName + category as a searchable dropdown row.


### FoodItem Data Object Properties

FoodItem data object has got following properties that are represented as table fields in the database scheme. 
These properties don't stand just for data storage, but each may have different settings to manage the business logic. 

| Property | Type | IsArray | Required | Secret | Description |
|----------|------|---------|----------|--------|-------------|
| `userId` | ID | false | Yes | No | - |
| `foodName` | String | false | Yes | No | - |
| `caloriePer100g` | Double | false | Yes | No | - |
| `proteinPer100g` | Double | false | Yes | No | - |
| `carbohydratePer100g` | Double | false | Yes | No | - |
| `fatPer100g` | Double | false | Yes | No | - |
| `sugarPer100g` | Double | false | Yes | No | - |
| `fiberPer100g` | Double | false | Yes | No | - |
| `brandName` | String | false | No | No | - |
| `foodCategory` | String | false | No | No | - |
| `creationSource` | Enum | false | Yes | No | - |
* Required properties are mandatory for creating objects and must be provided in the request body if no default value, formula or session bind is set.



### Enum Properties
Enum properties are defined with a set of allowed values, ensuring that only valid options can be assigned to them. 
The enum options value will be stored as strings in the database, 
but when a data object is created an additional property with the same name plus an idx suffix will be created, which will hold the index of the selected enum option.
You can use the {fieldName_idx} property to sort by the enum value or when your enum options represent a hiyerarchy of values.
In the frontend input components, enum type properties should only accept values from an option component that lists the enum options.

- **creationSource**: [manualEntry, aiAssistant]


### Relation Properties

`userId`

Mindbricks supports relations between data objects, allowing you to define how objects are linked together.
The relations may reference to a data object either in this service or in another service. Id the reference is remote, backend handles the relations through service communication or elastic search.
These relations should be respected in the frontend so that instaead of showing the related objects id, the frontend should list human readable values from other data objects.
If the relation points to another service, frontend should use the referenced service api in case it needs related data.
The relation logic is montly handled in backend so the api responses feeds the frontend about the relational data.
In mmost cases the api response will provide the relational data as well as the main one.

In frontend, please ensure that,

1- instaead of these relational ids you show the main human readable field of the related target data (like name),
2- if this data object needs a user input of these relational ids, you should provide a combobox with the list of possible records or (a searchbox) to select with the realted target data object main human readable field.


- **userId**: ID
Relation to `user`.id

The target object is a sibling object, meaning that the relation is a many-to-one or one-to-one relationship from this object to the target.

Required: Yes


### Filter Properties

`foodCategory` `creationSource`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as API parameters in the listing API's.
- **foodCategory**: String  has a filter named `foodCategory`
- **creationSource**: Enum  has a filter named `creationSource`


## PresetMeal Data Object

A reusable preset meal template owned by a user. Stores auto-calculated aggregate nutrition totals derived from its constituent preset lines. Mutations during meal logging must never affect this record.

### PresetMeal  Data Object Frontend Description By The Backend Architect

Represents a named meal template the user can reuse. templateName is the headline. Display totalCalories prominently; other totals (protein, carbs, fat, sugar, fiber) in a compact summary row. descriptionText shows as a subtitle. The card view shows template name + calorie total. Detail view (or expanded card) lists all preset lines. Totals update automatically after adding/removing lines — no manual save needed.


### PresetMeal Data Object Properties

PresetMeal data object has got following properties that are represented as table fields in the database scheme. 
These properties don't stand just for data storage, but each may have different settings to manage the business logic. 

| Property | Type | IsArray | Required | Secret | Description |
|----------|------|---------|----------|--------|-------------|
| `userId` | ID | false | Yes | No | - |
| `templateName` | String | false | Yes | No | - |
| `descriptionText` | String | false | No | No | - |
| `totalCalories` | Double | false | Yes | No | - |
| `totalProtein` | Double | false | Yes | No | - |
| `totalCarbohydrates` | Double | false | Yes | No | - |
| `totalFat` | Double | false | Yes | No | - |
| `totalSugar` | Double | false | Yes | No | - |
| `totalFiber` | Double | false | Yes | No | - |
* Required properties are mandatory for creating objects and must be provided in the request body if no default value, formula or session bind is set.




### Relation Properties

`userId`

Mindbricks supports relations between data objects, allowing you to define how objects are linked together.
The relations may reference to a data object either in this service or in another service. Id the reference is remote, backend handles the relations through service communication or elastic search.
These relations should be respected in the frontend so that instaead of showing the related objects id, the frontend should list human readable values from other data objects.
If the relation points to another service, frontend should use the referenced service api in case it needs related data.
The relation logic is montly handled in backend so the api responses feeds the frontend about the relational data.
In mmost cases the api response will provide the relational data as well as the main one.

In frontend, please ensure that,

1- instaead of these relational ids you show the main human readable field of the related target data (like name),
2- if this data object needs a user input of these relational ids, you should provide a combobox with the list of possible records or (a searchbox) to select with the realted target data object main human readable field.


- **userId**: ID
Relation to `user`.id

The target object is a sibling object, meaning that the relation is a many-to-one or one-to-one relationship from this object to the target.

Required: Yes



## PresetLine Data Object

A single food item entry within a preset meal template. Stores a gram amount and snapshot nutrition values calculated at line creation. Lines are created or deleted to modify a preset; individual lines are not edited (replace pattern).

### PresetLine  Data Object Frontend Description By The Backend Architect

Represents one food entry in a preset meal. lineFoodName is the display name (snapshot). gramAmount shows how many grams. Display the six line nutrition values in a compact row. No edit action — remove and re-add to change. In the preset detail view, render lines as a sortable list under the parent preset card.


### PresetLine Data Object Properties

PresetLine data object has got following properties that are represented as table fields in the database scheme. 
These properties don't stand just for data storage, but each may have different settings to manage the business logic. 

| Property | Type | IsArray | Required | Secret | Description |
|----------|------|---------|----------|--------|-------------|
| `presetMealId` | ID | false | Yes | No | - |
| `foodItemId` | ID | false | Yes | No | - |
| `lineFoodName` | String | false | Yes | No | - |
| `gramAmount` | Double | false | Yes | No | - |
| `lineCalories` | Double | false | Yes | No | - |
| `lineProtein` | Double | false | Yes | No | - |
| `lineCarbohydrates` | Double | false | Yes | No | - |
| `lineFat` | Double | false | Yes | No | - |
| `lineSugar` | Double | false | Yes | No | - |
| `lineFiber` | Double | false | Yes | No | - |
* Required properties are mandatory for creating objects and must be provided in the request body if no default value, formula or session bind is set.




### Relation Properties

`presetMealId` `foodItemId`

Mindbricks supports relations between data objects, allowing you to define how objects are linked together.
The relations may reference to a data object either in this service or in another service. Id the reference is remote, backend handles the relations through service communication or elastic search.
These relations should be respected in the frontend so that instaead of showing the related objects id, the frontend should list human readable values from other data objects.
If the relation points to another service, frontend should use the referenced service api in case it needs related data.
The relation logic is montly handled in backend so the api responses feeds the frontend about the relational data.
In mmost cases the api response will provide the relational data as well as the main one.

In frontend, please ensure that,

1- instaead of these relational ids you show the main human readable field of the related target data (like name),
2- if this data object needs a user input of these relational ids, you should provide a combobox with the list of possible records or (a searchbox) to select with the realted target data object main human readable field.


- **presetMealId**: ID
Relation to `presetMeal`.id

The target object is a sibling object, meaning that the relation is a many-to-one or one-to-one relationship from this object to the target.

Required: Yes

- **foodItemId**: ID
Relation to `foodItem`.id

The target object is a sibling object, meaning that the relation is a many-to-one or one-to-one relationship from this object to the target.

Required: Yes


### Filter Properties

`presetMealId`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as API parameters in the listing API's.
- **presetMealId**: ID  has a filter named `presetMealId`



## Default CRUD APIs

For each data object, the backend architect may designate **default APIs** for standard operations (create, update, delete, get, list). These are the APIs that frontend CRUD forms and AI agents should use for basic record management. If no default is explicitly set (`isDefaultApi`), the frontend generator auto-discovers the most general API for each operation.

### MacroTarget Default APIs

| Operation | Hook | Type |
|-----------|------|------|
| Create | `useSetMacroTarget()` | mutation |
| Update | _none_ | mutation |
| Delete | _none_ | mutation |
| Get | `useGetMyMacroTarget()` | query |
| List | _none_ | query |
### FoodItem Default APIs

**Display Label Property:** `foodName` — Use this property as the human-readable label when displaying records of this data object (e.g., in dropdowns, references).
| Operation | Hook | Type |
|-----------|------|------|
| Create | `useCreateFoodItem()` | mutation |
| Update | `useUpdateFoodItem()` | mutation |
| Delete | `useDeleteFoodItem()` | mutation |
| Get | `useGetFoodItem()` | query |
| List | `useListFoodItems()` | query |
### PresetMeal Default APIs

**Display Label Property:** `templateName` — Use this property as the human-readable label when displaying records of this data object (e.g., in dropdowns, references).
| Operation | Hook | Type |
|-----------|------|------|
| Create | `useCreatePresetMeal()` | mutation |
| Update | `useUpdatePresetMeal()` | mutation |
| Delete | `useDeletePresetMeal()` | mutation |
| Get | `useGetPresetMeal()` | query |
| List | `useListPresetMeals()` | query |
### PresetLine Default APIs

**Display Label Property:** `lineFoodName` — Use this property as the human-readable label when displaying records of this data object (e.g., in dropdowns, references).
| Operation | Hook | Type |
|-----------|------|------|
| Create | `useAddPresetLine()` | mutation |
| Update | _none_ | mutation |
| Delete | `useDeletePresetLine()` | mutation |
| Get | _none_ | query |
| List | `useListPresetLines()` | query |

When building CRUD forms for a data object, use the default hooks listed above. The form fields should correspond to the API's mutation payload. For relation fields, render a dropdown loaded from the related object's list hook using the display label property.






## SDK Hook Reference

Import hooks from `use-nutritionlibrary` and use them directly in your page components.


### Hooks Overview

| Hook | Type | CRUD | Auth | Returns |
|------|------|------|------|---------|
| `useSetMacroTarget()` | mutation | create | login required | `NutritionlibraryMacroTargetResponse` |
| `useGetMyMacroTarget()` | query | get | login required | `NutritionlibraryMacroTargetResponse` |
| `useGetMyMacroTargetForLogging()` | query | get | login required | `NutritionlibraryMacroTargetResponse` |
| `useCreateFoodItem()` | mutation | create | login required | `NutritionlibraryFoodItemResponse` |
| `useGetFoodItem()` | query | get | owner or admin | `NutritionlibraryFoodItemResponse` |
| `useListFoodItems()` | query | list | login required | `NutritionlibraryFoodItemListResponse` |
| `useUpdateFoodItem()` | mutation | update | owner or admin | `NutritionlibraryFoodItemResponse` |
| `useDeleteFoodItem()` | mutation | delete | owner or admin | `NutritionlibraryFoodItemResponse` |
| `useGetFoodItemForLogging()` | query | get | login required | `NutritionlibraryFoodItemResponse` |
| `useCreatePresetMeal()` | mutation | create | login required | `NutritionlibraryPresetMealResponse` |
| `useGetPresetMeal()` | query | get | owner or admin | `NutritionlibraryPresetMealResponse` |
| `useListPresetMeals()` | query | list | login required | `NutritionlibraryPresetMealListResponse` |
| `useUpdatePresetMeal()` | mutation | update | owner or admin | `NutritionlibraryPresetMealResponse` |
| `useDeletePresetMeal()` | mutation | delete | owner or admin | `NutritionlibraryPresetMealResponse` |
| `useGetPresetMealForLogging()` | query | get | login required | `NutritionlibraryPresetMealResponse` |
| `useAddPresetLine()` | mutation | create | login required | `NutritionlibraryPresetLineResponse` |
| `useListPresetLines()` | query | list | login required | `NutritionlibraryPresetLineListResponse` |
| `useDeletePresetLine()` | mutation | delete | login required | `NutritionlibraryPresetLineResponse` |

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

**`NutritionlibraryMacroTarget`** — Stores the authenticated user's six daily macro targets (calories, protein, carbohydrates, fat, sugar, fiber). Each user has one active target record; updating replaces the effective values.

```typescript
interface NutritionlibraryMacroTarget {
  id: string;
  userId: string;
  calorieTarget: number;
  proteinTarget: number;
  carbohydrateTarget: number;
  fatTarget: number;
  sugarTarget: number;
  fiberTarget: number;
  effectiveFrom: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

- **Single response:** `NutritionlibraryMacroTargetResponse` → `{ macroTarget: NutritionlibraryMacroTarget, dataName: string }` — extract via `data?.macroTarget`
- **List response:** `NutritionlibraryMacroTargetListResponse` → `{ macroTargets: NutritionlibraryMacroTarget[], rowCount: number, dataName: string }` — extract via `data?.macroTargets ?? []`

**`NutritionlibraryFoodItem`** — A private, reusable food definition in the user's personal food library. Stores per-100g nutrition values. Editable at any time without affecting historical meal log snapshots.

```typescript
interface NutritionlibraryFoodItem {
  id: string;
  userId: string;
  foodName: string;
  caloriePer100g: number;
  proteinPer100g: number;
  carbohydratePer100g: number;
  fatPer100g: number;
  sugarPer100g: number;
  fiberPer100g: number;
  brandName?: string;
  foodCategory?: string;
  creationSource: 'manualEntry' | 'aiAssistant';
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

- **Single response:** `NutritionlibraryFoodItemResponse` → `{ foodItem: NutritionlibraryFoodItem, dataName: string }` — extract via `data?.foodItem`
- **List response:** `NutritionlibraryFoodItemListResponse` → `{ foodItems: NutritionlibraryFoodItem[], rowCount: number, dataName: string }` — extract via `data?.foodItems ?? []`

**`NutritionlibraryPresetMeal`** — A reusable preset meal template owned by a user. Stores auto-calculated aggregate nutrition totals derived from its constituent preset lines. Mutations during meal logging must never affect this record.

```typescript
interface NutritionlibraryPresetMeal {
  id: string;
  userId: string;
  templateName: string;
  descriptionText?: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbohydrates: number;
  totalFat: number;
  totalSugar: number;
  totalFiber: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

- **Single response:** `NutritionlibraryPresetMealResponse` → `{ presetMeal: NutritionlibraryPresetMeal, dataName: string }` — extract via `data?.presetMeal`
- **List response:** `NutritionlibraryPresetMealListResponse` → `{ presetMeals: NutritionlibraryPresetMeal[], rowCount: number, dataName: string }` — extract via `data?.presetMeals ?? []`

**`NutritionlibraryPresetLine`** — A single food item entry within a preset meal template. Stores a gram amount and snapshot nutrition values calculated at line creation. Lines are created or deleted to modify a preset; individual lines are not edited (replace pattern).

```typescript
interface NutritionlibraryPresetLine {
  id: string;
  presetMealId: string;
  foodItemId: string;
  lineFoodName: string;
  gramAmount: number;
  lineCalories: number;
  lineProtein: number;
  lineCarbohydrates: number;
  lineFat: number;
  lineSugar: number;
  lineFiber: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

- **Single response:** `NutritionlibraryPresetLineResponse` → `{ presetLine: NutritionlibraryPresetLine, dataName: string }` — extract via `data?.presetLine`
- **List response:** `NutritionlibraryPresetLineListResponse` → `{ presetLines: NutritionlibraryPresetLine[], rowCount: number, dataName: string }` — extract via `data?.presetLines ?? []`


### Hook Details

#### `useSetMacroTarget()`

Upsert-style API: soft-deletes any existing active macro target for the user before creating a fresh one.

**Frontend Notes:** Triggered by the Save button on the Macro Targets page. All six target fields are required. On 201, show a toast 'Macro targets updated' and reflect new values in the UI. userId is auto-populated from session — never ask the user for it. effectiveFrom is system-set.

- **Type:** `mutation` (use `{ mutate, isPending }`)
- **Auth:** login required
- **Input:** `{ calorieTarget: number, proteinTarget: number, carbohydrateTarget: number, fatTarget: number, sugarTarget: number, fiberTarget: number }`
- **Returns:** `NutritionlibraryMacroTargetResponse`

#### `useGetMyMacroTarget()`

Fetch the authenticated user's current active macro target.

**Frontend Notes:** Called on page load of the Macro Targets page. Returns the current active target to pre-fill the form. If response is 404, show the form empty with placeholder hint values.

- **Type:** `query` (use `{ data, isLoading, error }`)
- **Auth:** login required
- **Returns:** `NutritionlibraryMacroTargetResponse`

#### `useGetMyMacroTargetForLogging()`

Dedicated read API for mealTracker (dashboard progress) and nutritionAi (context-aware guidance). Fetches the authenticated user's current macro targets.

**Frontend Notes:** Not directly triggered by frontend. Called by mealTracker and nutritionAi via inter-service calls with forwardCallerToken=true. Returns same shape as getMyMacroTarget.

- **Type:** `query` (use `{ data, isLoading, error }`)
- **Auth:** login required
- **Returns:** `NutritionlibraryMacroTargetResponse`

#### `useCreateFoodItem()`

Create a food item in the user's personal food library.

**Frontend Notes:** Triggered from 'Add Food' form on the Food Library page, or programmatically by the AI assistant. All per-100g fields are required. brandName and foodCategory are optional. creationSource defaults to manualEntry. On 201, append to the food list and show a toast 'Food saved'. userId is auto-populated from session.

- **Type:** `mutation` (use `{ mutate, isPending }`)
- **Auth:** login required
- **Input:** `{ foodName: string, caloriePer100g: number, proteinPer100g: number, carbohydratePer100g: number, fatPer100g: number, sugarPer100g: number, fiberPer100g: number, brandName?: string, foodCategory?: string, creationSource?: 'manualEntry' | 'aiAssistant' }`
- **Returns:** `NutritionlibraryFoodItemResponse`

#### `useGetFoodItem()`

Fetch a single food item by id. Ownership enforced.

**Frontend Notes:** Called when the user opens a food item detail view or edit drawer. Returns full per-100g fields for display and editing.

- **Type:** `query` (use `{ data, isLoading, error }`)
- **Auth:** owner or admin
- **Input:** `(foodItemId: string)` — passed positionally
- **Returns:** `NutritionlibraryFoodItemResponse`

#### `useListFoodItems()`

List the authenticated user's food items. Supports optional text search on foodName, and auto-filters on foodCategory and creationSource.

**Frontend Notes:** Displayed on the Food Library page as a paginated list. Filter chips for foodCategory and creationSource appear at the top. A search box filters by foodName (partial, case-insensitive). Empty state: 'Your food library is empty — add your first food'. Row shows foodName, brandName (if set), caloriePer100g, and category badge.

- **Type:** `query` (use `{ data, isLoading, error }`)
- **Auth:** login required
- **Input:** `{ searchTerm?: string, foodCategory?: string, creationSource?: 'manualEntry' | 'aiAssistant', pageNumber?: number, pageRowCount?: number, getJoins?: boolean }`
- **Pagination:** supported — pass `pageNumber` / `pageRowCount` in params (default 20 rows/page)
- **Returns:** `NutritionlibraryFoodItemListResponse`

#### `useUpdateFoodItem()`

Update a food item's fields. All fields are optional (partial update). Ownership enforced.

**Frontend Notes:** Triggered from the edit drawer on the Food Library page. All fields are optional — only changed fields need to be sent. On 200, update the list in place and close the drawer with a toast 'Food updated'. creationSource is not editable after creation.

- **Type:** `mutation` (use `{ mutate, isPending }`)
- **Auth:** owner or admin
- **Input:** `{ foodItemId: string, data: { foodName?: string, caloriePer100g?: number, proteinPer100g?: number, carbohydratePer100g?: number, fatPer100g?: number, sugarPer100g?: number, fiberPer100g?: number, brandName?: string, foodCategory?: string } }`
- **Returns:** `NutritionlibraryFoodItemResponse`

#### `useDeleteFoodItem()`

Soft-delete a food item. Ownership enforced.

**Frontend Notes:** Triggered from the delete button on a food item row. Show a confirmation dialog before calling. On 200, remove the item from the list with a toast 'Food deleted'.

- **Type:** `mutation` (use `{ mutate, isPending }`)
- **Auth:** owner or admin
- **Input:** `(foodItemId: string)` — passed positionally
- **Returns:** `NutritionlibraryFoodItemResponse`

#### `useGetFoodItemForLogging()`

Dedicated read API for mealTracker and nutritionAi. Fetches full per-100g nutrition data for a food item.

**Frontend Notes:** Not directly triggered by frontend. Called by mealTracker and nutritionAi via inter-service calls. Returns all per-100g fields needed for nutrition calculations.

- **Type:** `query` (use `{ data, isLoading, error }`)
- **Auth:** login required
- **Input:** `(foodItemId: string)` — passed positionally
- **Returns:** `NutritionlibraryFoodItemResponse`

#### `useCreatePresetMeal()`

Create a preset meal header. Lines are added separately via addPresetLine. Totals initialize at 0.

**Frontend Notes:** Triggered from 'New Preset' button on Preset Meals page. Only templateName is required. On 201, navigate to the preset detail page to add lines. Totals will show as 0 until lines are added.

- **Type:** `mutation` (use `{ mutate, isPending }`)
- **Auth:** login required
- **Input:** `{ templateName: string, descriptionText?: string }`
- **Returns:** `NutritionlibraryPresetMealResponse`

#### `useGetPresetMeal()`

Fetch a preset meal with its lines joined.

**Frontend Notes:** Called when user opens a preset detail page. Returns preset header + nested lines array. Display lines sorted by creation order. Totals at the top; lines table below.

- **Type:** `query` (use `{ data, isLoading, error }`)
- **Auth:** owner or admin
- **Input:** `(presetMealId: string)` — passed positionally
- **Returns:** `NutritionlibraryPresetMealResponse`

#### `useListPresetMeals()`

List the authenticated user's preset meal templates.

**Frontend Notes:** Displayed on the Preset Meals page as a card grid. Each card shows templateName + totalCalories. Empty state: 'No presets yet — create your first meal template'. Click navigates to preset detail.

- **Type:** `query` (use `{ data, isLoading, error }`)
- **Auth:** login required
- **Input:** `{ pageNumber?: number, pageRowCount?: number, getJoins?: boolean }`
- **Pagination:** supported — pass `pageNumber` / `pageRowCount` in params (default 20 rows/page)
- **Returns:** `NutritionlibraryPresetMealListResponse`

#### `useUpdatePresetMeal()`

Update preset meal header fields (templateName, descriptionText). Nutrition totals are NOT updated here.

**Frontend Notes:** Triggered from the edit icon on a preset card. Only templateName and descriptionText can be changed. On 200, update the card in place with a toast 'Preset updated'.

- **Type:** `mutation` (use `{ mutate, isPending }`)
- **Auth:** owner or admin
- **Input:** `{ presetMealId: string, data: { templateName?: string, descriptionText?: string } }`
- **Returns:** `NutritionlibraryPresetMealResponse`

#### `useDeletePresetMeal()`

Soft-delete a preset meal and all its lines. Ownership enforced.

**Frontend Notes:** Triggered from the delete button on a preset card. Show confirmation dialog. On 200, remove the card from the grid with a toast 'Preset deleted'.

- **Type:** `mutation` (use `{ mutate, isPending }`)
- **Auth:** owner or admin
- **Input:** `(presetMealId: string)` — passed positionally
- **Returns:** `NutritionlibraryPresetMealResponse`

#### `useGetPresetMealForLogging()`

Dedicated read API for mealTracker and nutritionAi services. Fetches a preset with full line detail for initiating a meal log.

**Frontend Notes:** Not directly triggered by frontend. Called by mealTracker and nutritionAi services via inter-service calls with forwardCallerToken=true. Returns the same shape as getPresetMeal.

- **Type:** `query` (use `{ data, isLoading, error }`)
- **Auth:** login required
- **Input:** `(presetMealId: string)` — passed positionally
- **Returns:** `NutritionlibraryPresetMealResponse`

#### `useAddPresetLine()`

Add a food item line to a preset meal. Validates preset ownership and food item ownership, calculates nutrition snapshot, creates the line, then recalculates parent preset totals.

**Frontend Notes:** Triggered from the 'Add Food' button on the preset detail page. User selects a food from their library and enters gram amount. On 201, append the new line to the list and update displayed totals. userId is auto-populated from session.

- **Type:** `mutation` (use `{ mutate, isPending }`)
- **Auth:** login required
- **Input:** `{ presetMealId: string, data: { foodItemId: string, gramAmount: number } }`
- **Returns:** `NutritionlibraryPresetLineResponse`

#### `useListPresetLines()`

List all lines for a preset meal. Validates preset ownership. Joins food item data.

**Frontend Notes:** Called when loading preset detail page lines section. Returns all active lines for the given preset. Joined food data provides the current per-100g values for display.

- **Type:** `query` (use `{ data, isLoading, error }`)
- **Auth:** login required
- **Input:** `(presetMealId: string, params?: { getJoins?: boolean })` — passed positionally
- **Pagination:** not supported (single-shot list)
- **Returns:** `NutritionlibraryPresetLineListResponse`

#### `useDeletePresetLine()`

Remove a single line from a preset, then recalculate preset totals. Validates preset ownership.

**Frontend Notes:** Triggered from the remove button on a preset line row. On 200, remove the line from the UI and update displayed totals.

- **Type:** `mutation` (use `{ mutate, isPending }`)
- **Auth:** login required
- **Input:** `(presetMealId: string, presetLineId: string)` — passed positionally
- **Returns:** `NutritionlibraryPresetLineResponse`


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


