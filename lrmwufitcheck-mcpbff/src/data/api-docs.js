/**
 * Auto-generated API Documentation
 *
 * This file contains documentation for all business APIs across services.
 * Generated at build time from the project configuration.
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 */

const API_DOCS = {
  invitationcenter: {
    name: "invitationcenter",
    fullname: "invitationcenter",
    port: 3050,
    apis: {
      createInviteLink: {
        name: "createInviteLink",
        description:
          "Creates a new invite link with a generated unique code. Restricted to admins. The invite starts in \&#39;draft\&#39; state and must be explicitly activated before use.",
        frontendDocument:
          "Triggered from the admin invite management panel via a \&#39;Create Invite\&#39; button. Opens a modal/slide-over form. `usageLimit` field should be shown conditionally (only when `usageMode === \&#39;limitedUse\&#39;`). `sellerId`/`ownerUserId` is auto-populated from session — do NOT show in form. On 201: close modal, refresh list, toast \&#39;Invite link created\&#39;. On 400: show inline validation errors.",
        crudType: "create",
        dataObjectName: "inviteLink",
        method: "POST",
        routePath: "/v1/invite-links",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["admin", "superAdmin"],
        },
        parameters: [
          {
            name: "invitedEmail",
            type: "String",
            required: false,
            description: "Optional intended recipient email address",
            httpLocation: "body",
          },
          {
            name: "usageMode",
            type: "Enum",
            required: true,
            description:
              "Whether the invite can be used once (singleUse) or a limited number of times (limitedUse)",
            httpLocation: "body",
          },
          {
            name: "usageLimit",
            type: "Integer",
            required: false,
            description:
              "Maximum number of allowed uses; required when usageMode=limitedUse",
            httpLocation: "body",
          },
          {
            name: "expiresAt",
            type: "Date",
            required: false,
            description: "Optional expiry date; null means no expiry",
            httpLocation: "body",
          },
        ],
      },
      activateInviteLink: {
        name: "activateInviteLink",
        description:
          "Transitions an invite link from \&#39;draft\&#39; to \&#39;active\&#39; state, making it usable for registration. Only invite links in \&#39;draft\&#39; state can be activated.",
        frontendDocument:
          "Triggered from the invite list or detail view via an \&#39;Activate\&#39; action button (shown only when inviteState=\&#39;draft\&#39;). No form input needed — just a confirmation dialog. On 200: update the status badge inline or refresh row. Toast \&#39;Invite link activated\&#39;. On 400: toast \&#39;Invite link is not in draft state\&#39;.",
        crudType: "update",
        dataObjectName: "inviteLink",
        method: "PATCH",
        routePath: "/v1/invite-links/:inviteLinkId/activate",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["admin", "superAdmin"],
        },
        parameters: [
          {
            name: "inviteLinkId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be updated",
            httpLocation: "urlpath",
          },
        ],
      },
      revokeInviteLink: {
        name: "revokeInviteLink",
        description:
          "Revokes an invite link, preventing further use. Only invite links in \&#39;draft\&#39; or \&#39;active\&#39; states can be revoked. An optional reason note can be provided.",
        frontendDocument:
          "Triggered from the invite list or detail view via a \&#39;Revoke\&#39; action button (shown when inviteState is \&#39;draft\&#39; or \&#39;active\&#39;). Opens a small confirmation dialog with optional \&#39;Reason\&#39; text input. On 200: update badge to \&#39;revoked\&#39;. Toast \&#39;Invite link revoked\&#39;. On 400: toast with server error message.",
        crudType: "update",
        dataObjectName: "inviteLink",
        method: "PATCH",
        routePath: "/v1/invite-links/:inviteLinkId/revoke",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["admin", "superAdmin"],
        },
        parameters: [
          {
            name: "inviteLinkId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be updated",
            httpLocation: "urlpath",
          },
          {
            name: "eventNote",
            type: "String",
            required: false,
            description: "Optional reason for revocation",
            httpLocation: "body",
          },
        ],
      },
      deliverInviteEmail: {
        name: "deliverInviteEmail",
        description:
          "Triggers email delivery of an active invite link to its intended recipient. Sets deliveryRequestedAt and publishes a Kafka event for the notification service to handle. The invite must be in \&#39;active\&#39; state and must have an invitedEmail set.",
        frontendDocument:
          "Triggered from the invite detail view via a \&#39;Send Email\&#39; button (shown when inviteState=\&#39;active\&#39; and invitedEmail is set). No form input. On 200: show \&#39;Email delivery requested\&#39; toast and update `deliveryRequestedAt` display. On 400: show inline error from server.",
        crudType: "update",
        dataObjectName: "inviteLink",
        method: "PATCH",
        routePath: "/v1/invite-links/:inviteLinkId/deliver",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["admin", "superAdmin"],
        },
        parameters: [
          {
            name: "inviteLinkId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be updated",
            httpLocation: "urlpath",
          },
        ],
      },
      validateInviteCode: {
        name: "validateInviteCode",
        description:
          "Public endpoint that validates an invite code, increments its usage count, and updates its state. Used by the registration flow before creating a new user account. Raises an API event on success.",
        frontendDocument:
          "Called by the frontend registration page after the user submits their invite code. If the invite is valid, proceed to the account creation form. On 400 with \&#39;expired\&#39;: show \&#39;This invite link has expired\&#39;. On 400 with \&#39;limit reached\&#39;: show \&#39;This invite has already been used the maximum number of times\&#39;. On 404 (no active record found): show \&#39;Invalid or inactive invite code\&#39;.",
        crudType: "update",
        dataObjectName: "inviteLink",
        method: "PATCH",
        routePath: "/v1/invite-links/validate",
        auth: {
          loginRequired: false,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "inviteCode",
            type: "String",
            required: true,
            description: "The unique invite token to validate",
            httpLocation: "body",
          },
        ],
      },
      consumeInviteLink: {
        name: "consumeInviteLink",
        description:
          "Marks an invite link as consumed and records the registered user ID. Called by the auth service or an admin workflow after successful user registration. Raises an API event.",
        frontendDocument:
          "This is a machine-to-machine or admin-only operation — not directly user-triggered. No dedicated UI form. In the admin audit view it appears as a \&#39;consumed\&#39; event in the timeline. After calling this API, the invite detail should show `registeredUserId` as a linked user.",
        crudType: "update",
        dataObjectName: "inviteLink",
        method: "PATCH",
        routePath: "/v1/invite-links/:inviteLinkId/consume",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["admin", "superAdmin"],
        },
        parameters: [
          {
            name: "inviteLinkId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be updated",
            httpLocation: "urlpath",
          },
          {
            name: "registeredUserId",
            type: "ID",
            required: true,
            description: "The auth user id created from this invite",
            httpLocation: "body",
          },
          {
            name: "relatedEmail",
            type: "String",
            required: false,
            description: "Registered email for audit record",
            httpLocation: "body",
          },
        ],
      },
      getInviteLinkByCode: {
        name: "getInviteLinkByCode",
        description:
          "Public endpoint to fetch invite link metadata by its unique code. Used by the registration page to display invite details before the user fills in their credentials.",
        frontendDocument:
          "Called automatically on the `/register?code=&lt;inviteCode&gt;` page load. No user action required. Display invite metadata: `invitedEmail` (pre-fill the email input), `usageMode` badge, `expiresAt` (show \&#39;No expiry\&#39; if null). If 404: show a full-page \&#39;Invalid invite link\&#39; error with a link to contact support.",
        crudType: "get",
        dataObjectName: "inviteLink",
        method: "GET",
        routePath: "/v1/invite-links/by-code/:inviteCode",
        auth: {
          loginRequired: false,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "inviteCode",
            type: "String",
            required: true,
            description:
              "This parameter will be used to select the data object that is queried",
            httpLocation: "urlpath",
          },
        ],
      },
      getInviteLink: {
        name: "getInviteLink",
        description: "Admin endpoint to fetch a single invite link by its ID.",
        frontendDocument:
          "Used when navigating to the invite detail view (`/admin/invites/:inviteLinkId`). Loads the full invite record for display. Show all fields including audit trail (loaded separately via listInviteAudits filtered by inviteLinkId).",
        crudType: "get",
        dataObjectName: "inviteLink",
        method: "GET",
        routePath: "/v1/invite-links/:inviteLinkId",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["admin", "superAdmin"],
        },
        parameters: [
          {
            name: "inviteLinkId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
      },
      listInviteLinks: {
        name: "listInviteLinks",
        description:
          "Admin endpoint to list all invite links with optional filtering by usageMode and inviteState (auto-filter parameters).",
        frontendDocument:
          "Renders the admin invite management table. Filters are exposed as query params: `?usageMode=singleUse` and/or `?inviteState=active`. Sort by `createdAt` descending (newest first). Default page size 20. Empty state: \&#39;No invite links found — try adjusting filters or create a new invite.\&#39;",
        crudType: "list",
        dataObjectName: "inviteLink",
        method: "GET",
        routePath: "/v1/invite-links",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["admin", "superAdmin"],
        },
        parameters: [
          {
            name: "usageMode",
            type: "Enum",
            required: false,
            description: "",
            httpLocation: "query",
          },
          {
            name: "inviteState",
            type: "Enum",
            required: false,
            description: "",
            httpLocation: "query",
          },
        ],
        pagination: {
          enabled: true,
          defaultPageSize: 20,
          maxPageSize: 100,
        },
      },
      listInviteAudits: {
        name: "listInviteAudits",
        description:
          "Admin endpoint to list audit log entries for invite links. Filterable by inviteLinkId and eventType.",
        frontendDocument:
          "Loaded in the invite detail drawer/sub-panel. Always called with `?inviteLinkId=&lt;id&gt;` filter to show the audit trail for a specific invite. Displayed as a timeline (oldest first). If loading the full audit list in the admin view without a specific invite, no inviteLinkId filter is applied — admins can see all events.",
        crudType: "list",
        dataObjectName: "inviteAudit",
        method: "GET",
        routePath: "/v1/invite-audits",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["admin", "superAdmin"],
        },
        parameters: [
          {
            name: "inviteLinkId",
            type: "ID",
            required: false,
            description: "",
            httpLocation: "query",
          },
          {
            name: "eventType",
            type: "Enum",
            required: false,
            description: "",
            httpLocation: "query",
          },
        ],
        pagination: {
          enabled: true,
          defaultPageSize: 50,
          maxPageSize: 100,
        },
      },
    },
  },
  nutritionlibrary: {
    name: "nutritionlibrary",
    fullname: "nutritionlibrary",
    port: 3051,
    apis: {
      setMacroTarget: {
        name: "setMacroTarget",
        description:
          "Upsert-style API: soft-deletes any existing active macro target for the user before creating a fresh one.",
        frontendDocument:
          "Triggered by the Save button on the Macro Targets page. All six target fields are required. On 201, show a toast \&#39;Macro targets updated\&#39; and reflect new values in the UI. userId is auto-populated from session — never ask the user for it. effectiveFrom is system-set.",
        crudType: "create",
        dataObjectName: "macroTarget",
        method: "POST",
        routePath: "/v1/macro-targets",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "calorieTarget",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "proteinTarget",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "carbohydrateTarget",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "fatTarget",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "sugarTarget",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "fiberTarget",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
        ],
      },
      getMyMacroTarget: {
        name: "getMyMacroTarget",
        description:
          "Fetch the authenticated user\&#39;s current active macro target.",
        frontendDocument:
          "Called on page load of the Macro Targets page. Returns the current active target to pre-fill the form. If response is 404, show the form empty with placeholder hint values.",
        crudType: "get",
        dataObjectName: "macroTarget",
        method: "GET",
        routePath: "/v1/macro-targets/me",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [],
      },
      createFoodItem: {
        name: "createFoodItem",
        description:
          "Create a food item in the user\&#39;s personal food library.",
        frontendDocument:
          "Triggered from \&#39;Add Food\&#39; form on the Food Library page, or programmatically by the AI assistant. All per-100g fields are required. brandName and foodCategory are optional. creationSource defaults to manualEntry. On 201, append to the food list and show a toast \&#39;Food saved\&#39;. userId is auto-populated from session.",
        crudType: "create",
        dataObjectName: "foodItem",
        method: "POST",
        routePath: "/v1/food-items",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "foodName",
            type: "String",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "caloriePer100g",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "proteinPer100g",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "carbohydratePer100g",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "fatPer100g",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "sugarPer100g",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "fiberPer100g",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "brandName",
            type: "String",
            required: false,
            description: "",
            httpLocation: "body",
          },
          {
            name: "foodCategory",
            type: "String",
            required: false,
            description: "",
            httpLocation: "body",
          },
          {
            name: "creationSource",
            type: "Enum",
            required: false,
            default: "manualEntry",
            description: "",
            httpLocation: "body",
          },
        ],
      },
      getFoodItem: {
        name: "getFoodItem",
        description: "Fetch a single food item by id. Ownership enforced.",
        frontendDocument:
          "Called when the user opens a food item detail view or edit drawer. Returns full per-100g fields for display and editing.",
        crudType: "get",
        dataObjectName: "foodItem",
        method: "GET",
        routePath: "/v1/food-items/:foodItemId",
        auth: {
          loginRequired: true,
          ownershipCheck: true,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "foodItemId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
      },
      listFoodItems: {
        name: "listFoodItems",
        description:
          "List the authenticated user\&#39;s food items. Supports optional text search on foodName, and auto-filters on foodCategory and creationSource.",
        frontendDocument:
          "Displayed on the Food Library page as a paginated list. Filter chips for foodCategory and creationSource appear at the top. A search box filters by foodName (partial, case-insensitive). Empty state: \&#39;Your food library is empty — add your first food\&#39;. Row shows foodName, brandName (if set), caloriePer100g, and category badge.",
        crudType: "list",
        dataObjectName: "foodItem",
        method: "GET",
        routePath: "/v1/food-items",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "searchTerm",
            type: "String",
            required: false,
            description: "Optional partial match on foodName",
            httpLocation: "query",
          },
          {
            name: "foodCategory",
            type: "String",
            required: false,
            description: "",
            httpLocation: "query",
          },
          {
            name: "creationSource",
            type: "Enum",
            required: false,
            description: "",
            httpLocation: "query",
          },
        ],
        pagination: {
          enabled: true,
          defaultPageSize: 20,
          maxPageSize: 100,
        },
      },
      updateFoodItem: {
        name: "updateFoodItem",
        description:
          "Update a food item\&#39;s fields. All fields are optional (partial update). Ownership enforced.",
        frontendDocument:
          "Triggered from the edit drawer on the Food Library page. All fields are optional — only changed fields need to be sent. On 200, update the list in place and close the drawer with a toast \&#39;Food updated\&#39;. creationSource is not editable after creation.",
        crudType: "update",
        dataObjectName: "foodItem",
        method: "PATCH",
        routePath: "/v1/food-items/:foodItemId",
        auth: {
          loginRequired: true,
          ownershipCheck: true,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "foodItemId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be updated",
            httpLocation: "urlpath",
          },
          {
            name: "foodName",
            type: "String",
            required: false,
            description: "",
            httpLocation: "body",
          },
          {
            name: "caloriePer100g",
            type: "Double",
            required: false,
            description: "",
            httpLocation: "body",
          },
          {
            name: "proteinPer100g",
            type: "Double",
            required: false,
            description: "",
            httpLocation: "body",
          },
          {
            name: "carbohydratePer100g",
            type: "Double",
            required: false,
            description: "",
            httpLocation: "body",
          },
          {
            name: "fatPer100g",
            type: "Double",
            required: false,
            description: "",
            httpLocation: "body",
          },
          {
            name: "sugarPer100g",
            type: "Double",
            required: false,
            description: "",
            httpLocation: "body",
          },
          {
            name: "fiberPer100g",
            type: "Double",
            required: false,
            description: "",
            httpLocation: "body",
          },
          {
            name: "brandName",
            type: "String",
            required: false,
            description: "",
            httpLocation: "body",
          },
          {
            name: "foodCategory",
            type: "String",
            required: false,
            description: "",
            httpLocation: "body",
          },
        ],
      },
      deleteFoodItem: {
        name: "deleteFoodItem",
        description: "Soft-delete a food item. Ownership enforced.",
        frontendDocument:
          "Triggered from the delete button on a food item row. Show a confirmation dialog before calling. On 200, remove the item from the list with a toast \&#39;Food deleted\&#39;.",
        crudType: "delete",
        dataObjectName: "foodItem",
        method: "DELETE",
        routePath: "/v1/food-items/:foodItemId",
        auth: {
          loginRequired: true,
          ownershipCheck: true,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "foodItemId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be deleted",
            httpLocation: "urlpath",
          },
        ],
      },
      createPresetMeal: {
        name: "createPresetMeal",
        description:
          "Create a preset meal header. Lines are added separately via addPresetLine. Totals initialize at 0.",
        frontendDocument:
          "Triggered from \&#39;New Preset\&#39; button on Preset Meals page. Only templateName is required. On 201, navigate to the preset detail page to add lines. Totals will show as 0 until lines are added.",
        crudType: "create",
        dataObjectName: "presetMeal",
        method: "POST",
        routePath: "/v1/preset-meals",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "templateName",
            type: "String",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "descriptionText",
            type: "String",
            required: false,
            description: "",
            httpLocation: "body",
          },
        ],
      },
      getPresetMeal: {
        name: "getPresetMeal",
        description: "Fetch a preset meal with its lines joined.",
        frontendDocument:
          "Called when user opens a preset detail page. Returns preset header + nested lines array. Display lines sorted by creation order. Totals at the top; lines table below.",
        crudType: "get",
        dataObjectName: "presetMeal",
        method: "GET",
        routePath: "/v1/preset-meals/:presetMealId",
        auth: {
          loginRequired: true,
          ownershipCheck: true,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "presetMealId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
        response: {
          fields: [],
          joins: [{ name: "lines", target: "presetLine" }],
        },
      },
      listPresetMeals: {
        name: "listPresetMeals",
        description:
          "List the authenticated user\&#39;s preset meal templates.",
        frontendDocument:
          "Displayed on the Preset Meals page as a card grid. Each card shows templateName + totalCalories. Empty state: \&#39;No presets yet — create your first meal template\&#39;. Click navigates to preset detail.",
        crudType: "list",
        dataObjectName: "presetMeal",
        method: "GET",
        routePath: "/v1/preset-meals",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [],
        pagination: {
          enabled: true,
          defaultPageSize: 20,
          maxPageSize: 100,
        },
      },
      updatePresetMeal: {
        name: "updatePresetMeal",
        description:
          "Update preset meal header fields (templateName, descriptionText). Nutrition totals are NOT updated here.",
        frontendDocument:
          "Triggered from the edit icon on a preset card. Only templateName and descriptionText can be changed. On 200, update the card in place with a toast \&#39;Preset updated\&#39;.",
        crudType: "update",
        dataObjectName: "presetMeal",
        method: "PATCH",
        routePath: "/v1/preset-meals/:presetMealId",
        auth: {
          loginRequired: true,
          ownershipCheck: true,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "presetMealId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be updated",
            httpLocation: "urlpath",
          },
          {
            name: "templateName",
            type: "String",
            required: false,
            description: "",
            httpLocation: "body",
          },
          {
            name: "descriptionText",
            type: "String",
            required: false,
            description: "",
            httpLocation: "body",
          },
        ],
      },
      deletePresetMeal: {
        name: "deletePresetMeal",
        description:
          "Soft-delete a preset meal and all its lines. Ownership enforced.",
        frontendDocument:
          "Triggered from the delete button on a preset card. Show confirmation dialog. On 200, remove the card from the grid with a toast \&#39;Preset deleted\&#39;.",
        crudType: "delete",
        dataObjectName: "presetMeal",
        method: "DELETE",
        routePath: "/v1/preset-meals/:presetMealId",
        auth: {
          loginRequired: true,
          ownershipCheck: true,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "presetMealId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be deleted",
            httpLocation: "urlpath",
          },
        ],
      },
      addPresetLine: {
        name: "addPresetLine",
        description:
          "Add a food item line to a preset meal. Validates preset ownership and food item ownership, calculates nutrition snapshot, creates the line, then recalculates parent preset totals.",
        frontendDocument:
          "Triggered from the \&#39;Add Food\&#39; button on the preset detail page. User selects a food from their library and enters gram amount. On 201, append the new line to the list and update displayed totals. userId is auto-populated from session.",
        crudType: "create",
        dataObjectName: "presetLine",
        method: "POST",
        routePath: "/v1/preset-meals/:presetMealId/lines",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "foodItemId",
            type: "ID",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "gramAmount",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "presetMealId",
            type: "String",
            required: true,
            description:
              "This URL path parameter scopes the create operation to a parent record (typically the parent object's id).",
            httpLocation: "urlpath",
          },
        ],
      },
      listPresetLines: {
        name: "listPresetLines",
        description:
          "List all lines for a preset meal. Validates preset ownership. Joins food item data.",
        frontendDocument:
          "Called when loading preset detail page lines section. Returns all active lines for the given preset. Joined food data provides the current per-100g values for display.",
        crudType: "list",
        dataObjectName: "presetLine",
        method: "GET",
        routePath: "/v1/preset-meals/:presetMealId/lines",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "presetMealId",
            type: "String",
            required: true,
            description:
              "This parameter will be used to select the data objects that want to be listed",
            httpLocation: "urlpath",
          },
        ],
        response: {
          fields: [],
          joins: [{ name: "food", target: "foodItem" }],
        },
        pagination: {
          enabled: true,
          defaultPageSize: 25,
          maxPageSize: 100,
        },
      },
      deletePresetLine: {
        name: "deletePresetLine",
        description:
          "Remove a single line from a preset, then recalculate preset totals. Validates preset ownership.",
        frontendDocument:
          "Triggered from the remove button on a preset line row. On 200, remove the line from the UI and update displayed totals.",
        crudType: "delete",
        dataObjectName: "presetLine",
        method: "DELETE",
        routePath: "/v1/preset-meals/:presetMealId/lines/:presetLineId",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "presetLineId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be deleted",
            httpLocation: "urlpath",
          },
          {
            name: "presetMealId",
            type: "String",
            required: true,
            description:
              "This parameter will be used to select the data object that want to be deleted",
            httpLocation: "urlpath",
          },
        ],
      },
      getPresetMealForLogging: {
        name: "getPresetMealForLogging",
        description:
          "Dedicated read API for mealTracker and nutritionAi services. Fetches a preset with full line detail for initiating a meal log.",
        frontendDocument:
          "Not directly triggered by frontend. Called by mealTracker and nutritionAi services via inter-service calls with forwardCallerToken=true. Returns the same shape as getPresetMeal.",
        crudType: "get",
        dataObjectName: "presetMeal",
        method: "GET",
        routePath: "/v1/preset-meals/:presetMealId/for-logging",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["admin", "user", "superAdmin"],
        },
        parameters: [
          {
            name: "presetMealId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
        response: {
          fields: [],
          joins: [{ name: "lines", target: "presetLine" }],
        },
      },
      getFoodItemForLogging: {
        name: "getFoodItemForLogging",
        description:
          "Dedicated read API for mealTracker and nutritionAi. Fetches full per-100g nutrition data for a food item.",
        frontendDocument:
          "Not directly triggered by frontend. Called by mealTracker and nutritionAi via inter-service calls. Returns all per-100g fields needed for nutrition calculations.",
        crudType: "get",
        dataObjectName: "foodItem",
        method: "GET",
        routePath: "/v1/food-items/:foodItemId/for-logging",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["admin", "user", "superAdmin"],
        },
        parameters: [
          {
            name: "foodItemId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
      },
      getMyMacroTargetForLogging: {
        name: "getMyMacroTargetForLogging",
        description:
          "Dedicated read API for mealTracker (dashboard progress) and nutritionAi (context-aware guidance). Fetches the authenticated user\&#39;s current macro targets.",
        frontendDocument:
          "Not directly triggered by frontend. Called by mealTracker and nutritionAi via inter-service calls with forwardCallerToken=true. Returns same shape as getMyMacroTarget.",
        crudType: "get",
        dataObjectName: "macroTarget",
        method: "GET",
        routePath: "/v1/macro-targets/me/for-logging",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["admin", "user", "superAdmin"],
        },
        parameters: [],
      },
    },
  },
  mealtracker: {
    name: "mealtracker",
    fullname: "mealtracker",
    port: 3052,
    apis: {
      createMealLog: {
        name: "createMealLog",
        description:
          "Creates a new meal log entry with all nutrition totals and then inserts individual meal line items via a loop action. After creation, upserts the daily nutrition snapshot.",
        frontendDocument:
          "Triggered from the meal logging form (POST on submit). userId is auto-populated from session — never ask the user. Required fields: mealDate, mealTime, slotName, logSource, totalCalories, totalProtein, totalCarbohydrates, totalFat, totalSugar, totalFiber, lines[]. On 201: redirect to meal detail or refresh daily progress widget, show toast \&#39;Meal logged successfully\&#39;. On 400/422: show inline field errors.",
        crudType: "create",
        dataObjectName: "mealLog",
        method: "POST",
        routePath: "/v1/meal-logs",
        auth: {
          loginRequired: true,
          ownershipCheck: true,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "mealDate",
            type: "Date",
            required: true,
            description: "Date the meal was consumed",
            httpLocation: "body",
          },
          {
            name: "mealTime",
            type: "String",
            required: true,
            description: "Local time string e.g. 13:30",
            httpLocation: "body",
          },
          {
            name: "slotName",
            type: "String",
            required: true,
            description: "Fixed or custom meal slot name",
            httpLocation: "body",
          },
          {
            name: "logSource",
            type: "Enum",
            required: true,
            description: "Source of the meal log entry",
            httpLocation: "body",
          },
          {
            name: "noteText",
            type: "String",
            required: false,
            description: "Optional user notes",
            httpLocation: "body",
          },
          {
            name: "totalCalories",
            type: "Double",
            required: true,
            description: "Meal-level calorie total",
            httpLocation: "body",
          },
          {
            name: "totalProtein",
            type: "Double",
            required: true,
            description: "Meal-level protein total",
            httpLocation: "body",
          },
          {
            name: "totalCarbohydrates",
            type: "Double",
            required: true,
            description: "Meal-level carbohydrate total",
            httpLocation: "body",
          },
          {
            name: "totalFat",
            type: "Double",
            required: true,
            description: "Meal-level fat total",
            httpLocation: "body",
          },
          {
            name: "totalSugar",
            type: "Double",
            required: true,
            description: "Meal-level sugar total",
            httpLocation: "body",
          },
          {
            name: "totalFiber",
            type: "Double",
            required: true,
            description: "Meal-level fiber total",
            httpLocation: "body",
          },
          {
            name: "lines",
            type: "Object",
            required: true,
            description: "Array of meal line objects to create",
            httpLocation: "body",
          },
        ],
      },
      getMealLog: {
        name: "getMealLog",
        description:
          "Retrieves a single meal log by ID, scoped to the authenticated user.",
        frontendDocument:
          "Triggered when user taps a meal card to view detail. Shows all fields including noteText and individual mealLines (loaded via a separate listMealLines call filtered by mealLogId). On 404: show \&#39;Meal not found\&#39; and navigate back.",
        crudType: "get",
        dataObjectName: "mealLog",
        method: "GET",
        routePath: "/v1/meal-logs/:mealLogId",
        auth: {
          loginRequired: true,
          ownershipCheck: true,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "mealLogId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
      },
      listMealLogs: {
        name: "listMealLogs",
        description:
          "Lists meal logs for the authenticated user with optional date range filtering. mealDate and logSource are auto-filtered via isFilterParameter.",
        frontendDocument:
          "Powers the meal history page. Shows paginated list grouped by date. Filter bar at top: date range picker (fromDate/toDate), source multi-select. Auto-filters for mealDate and logSource are passed as query params. On empty state: show \&#39;No meals logged yet\&#39; with a CTA to add a meal.",
        crudType: "list",
        dataObjectName: "mealLog",
        method: "GET",
        routePath: "/v1/meal-logs",
        auth: {
          loginRequired: true,
          ownershipCheck: true,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "fromDate",
            type: "Date",
            required: false,
            description: "Optional range start for multi-day queries",
            httpLocation: "query",
          },
          {
            name: "toDate",
            type: "Date",
            required: false,
            description: "Optional range end for multi-day queries",
            httpLocation: "query",
          },
          {
            name: "mealDate",
            type: "Date",
            required: false,
            description: "",
            httpLocation: "query",
          },
          {
            name: "logSource",
            type: "Enum",
            required: false,
            description: "",
            httpLocation: "query",
          },
        ],
        pagination: {
          enabled: true,
          defaultPageSize: 20,
          maxPageSize: 100,
        },
      },
      updateMealLog: {
        name: "updateMealLog",
        description:
          "Updates editable fields of a meal log and recomputes the nutrition day snapshot.",
        frontendDocument:
          "Triggered from the meal edit form. All fields optional — only send changed values. On success: update the meal card in the list and refresh daily progress widget. On 404: show \&#39;Meal not found\&#39;.",
        crudType: "update",
        dataObjectName: "mealLog",
        method: "PATCH",
        routePath: "/v1/meal-logs/:mealLogId",
        auth: {
          loginRequired: true,
          ownershipCheck: true,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "mealLogId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be updated",
            httpLocation: "urlpath",
          },
          {
            name: "mealTime",
            type: "String",
            required: false,
            description: "Updated meal time",
            httpLocation: "body",
          },
          {
            name: "slotName",
            type: "String",
            required: false,
            description: "Updated slot name",
            httpLocation: "body",
          },
          {
            name: "noteText",
            type: "String",
            required: false,
            description: "Updated notes",
            httpLocation: "body",
          },
          {
            name: "totalCalories",
            type: "Double",
            required: false,
            description: "Recalculated calorie total",
            httpLocation: "body",
          },
          {
            name: "totalProtein",
            type: "Double",
            required: false,
            description: "Recalculated protein total",
            httpLocation: "body",
          },
          {
            name: "totalCarbohydrates",
            type: "Double",
            required: false,
            description: "Recalculated carbohydrate total",
            httpLocation: "body",
          },
          {
            name: "totalFat",
            type: "Double",
            required: false,
            description: "Recalculated fat total",
            httpLocation: "body",
          },
          {
            name: "totalSugar",
            type: "Double",
            required: false,
            description: "Recalculated sugar total",
            httpLocation: "body",
          },
          {
            name: "totalFiber",
            type: "Double",
            required: false,
            description: "Recalculated fiber total",
            httpLocation: "body",
          },
        ],
      },
      deleteMealLog: {
        name: "deleteMealLog",
        description:
          "Deletes a meal log and its associated meal lines, then recomputes the nutrition day snapshot.",
        frontendDocument:
          "Triggered from meal card delete button (with confirmation dialog). On success: remove card from list, show toast \&#39;Meal deleted\&#39;, refresh daily progress widget. On 404: show \&#39;Meal not found\&#39;.",
        crudType: "delete",
        dataObjectName: "mealLog",
        method: "DELETE",
        routePath: "/v1/meal-logs/:mealLogId",
        auth: {
          loginRequired: true,
          ownershipCheck: true,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "mealLogId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be deleted",
            httpLocation: "urlpath",
          },
        ],
      },
      createMealLine: {
        name: "createMealLine",
        description:
          "Creates an individual meal line item and then recalculates meal-level and day-level nutrition totals.",
        frontendDocument:
          "Triggered when user adds a food item to an existing meal (inline add form on meal detail). Required: mealLogId, itemName, consumedGrams, all 6 nutrition snapshot values, lineSource. userId auto-populated from session. On 201: add row to meal line list, update meal totals display. On 403: show \&#39;This meal does not belong to you\&#39;.",
        crudType: "create",
        dataObjectName: "mealLine",
        method: "POST",
        routePath: "/v1/meal-lines",
        auth: {
          loginRequired: true,
          ownershipCheck: true,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "mealLogId",
            type: "ID",
            required: true,
            description: "FK to parent mealLog",
            httpLocation: "body",
          },
          {
            name: "itemName",
            type: "String",
            required: true,
            description: "Food item name",
            httpLocation: "body",
          },
          {
            name: "consumedGrams",
            type: "Double",
            required: true,
            description: "Grams consumed",
            httpLocation: "body",
          },
          {
            name: "itemCalories",
            type: "Double",
            required: true,
            description: "Calories snapshot",
            httpLocation: "body",
          },
          {
            name: "itemProtein",
            type: "Double",
            required: true,
            description: "Protein snapshot",
            httpLocation: "body",
          },
          {
            name: "itemCarbohydrates",
            type: "Double",
            required: true,
            description: "Carbohydrates snapshot",
            httpLocation: "body",
          },
          {
            name: "itemFat",
            type: "Double",
            required: true,
            description: "Fat snapshot",
            httpLocation: "body",
          },
          {
            name: "itemSugar",
            type: "Double",
            required: true,
            description: "Sugar snapshot",
            httpLocation: "body",
          },
          {
            name: "itemFiber",
            type: "Double",
            required: true,
            description: "Fiber snapshot",
            httpLocation: "body",
          },
          {
            name: "lineSource",
            type: "Enum",
            required: true,
            description: "Source of the line item",
            httpLocation: "body",
          },
          {
            name: "sourceFoodItemId",
            type: "ID",
            required: false,
            description: "Optional reference to nutritionLibrary foodItem",
            httpLocation: "body",
          },
          {
            name: "sourcePresetMealId",
            type: "ID",
            required: false,
            description: "Optional reference to nutritionLibrary presetMeal",
            httpLocation: "body",
          },
        ],
      },
      updateMealLine: {
        name: "updateMealLine",
        description:
          "Updates nutrition snapshot values of a meal line item, then recalculates meal-level and day-level totals.",
        frontendDocument:
          "Triggered from inline edit on a meal line row. All fields optional. On success: update row values and refresh meal totals strip. On 404: show \&#39;Item not found\&#39;.",
        crudType: "update",
        dataObjectName: "mealLine",
        method: "PATCH",
        routePath: "/v1/meal-lines/:mealLineId",
        auth: {
          loginRequired: true,
          ownershipCheck: true,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "mealLineId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be updated",
            httpLocation: "urlpath",
          },
          {
            name: "itemName",
            type: "String",
            required: false,
            description: "Updated item name",
            httpLocation: "body",
          },
          {
            name: "consumedGrams",
            type: "Double",
            required: false,
            description: "Updated grams",
            httpLocation: "body",
          },
          {
            name: "itemCalories",
            type: "Double",
            required: false,
            description: "Updated calories",
            httpLocation: "body",
          },
          {
            name: "itemProtein",
            type: "Double",
            required: false,
            description: "Updated protein",
            httpLocation: "body",
          },
          {
            name: "itemCarbohydrates",
            type: "Double",
            required: false,
            description: "Updated carbohydrates",
            httpLocation: "body",
          },
          {
            name: "itemFat",
            type: "Double",
            required: false,
            description: "Updated fat",
            httpLocation: "body",
          },
          {
            name: "itemSugar",
            type: "Double",
            required: false,
            description: "Updated sugar",
            httpLocation: "body",
          },
          {
            name: "itemFiber",
            type: "Double",
            required: false,
            description: "Updated fiber",
            httpLocation: "body",
          },
        ],
      },
      deleteMealLine: {
        name: "deleteMealLine",
        description:
          "Deletes a meal line item and recomputes the parent meal log and daily nutrition totals.",
        frontendDocument:
          "Triggered from delete button on a meal line row (with confirmation). On success: remove row, recalculate meal totals, refresh daily progress. On 404: show \&#39;Item not found\&#39;.",
        crudType: "delete",
        dataObjectName: "mealLine",
        method: "DELETE",
        routePath: "/v1/meal-lines/:mealLineId",
        auth: {
          loginRequired: true,
          ownershipCheck: true,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "mealLineId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be deleted",
            httpLocation: "urlpath",
          },
        ],
      },
      listMealLines: {
        name: "listMealLines",
        description:
          "Lists meal lines for the authenticated user. mealLogId is an auto-filter param via isFilterParameter=true.",
        frontendDocument:
          "Used on meal detail page to load food items for a specific meal. Always called with ?mealLogId=&lt;id&gt;. Shows a table: itemName, consumedGrams, itemCalories, itemProtein, itemCarbohydrates, itemFat, itemSugar, itemFiber. Each row has edit and delete buttons.",
        crudType: "list",
        dataObjectName: "mealLine",
        method: "GET",
        routePath: "/v1/meal-lines",
        auth: {
          loginRequired: true,
          ownershipCheck: true,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "mealLogId",
            type: "ID",
            required: false,
            description: "",
            httpLocation: "query",
          },
        ],
        pagination: {
          enabled: true,
          defaultPageSize: 50,
          maxPageSize: 100,
        },
      },
      getDailyProgress: {
        name: "getDailyProgress",
        description:
          "Retrieves (or initializes) the nutritionDay record for a given date, defaulting to today. Used as the primary dashboard data source.",
        frontendDocument:
          "This is the primary dashboard API. Called on page load with no params (defaults to today) or with ?targetDate=YYYY-MM-DD. Response populates the 6-macro progress panel. Show a skeleton loader while fetching. On success update all progress bars/gauges with color coding. Refresh after any meal log write operation.",
        crudType: "get",
        dataObjectName: "nutritionDay",
        method: "GET",
        routePath: "/v1/nutrition-days/daily-progress",
        auth: {
          loginRequired: true,
          ownershipCheck: true,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "targetDate",
            type: "Date",
            required: false,
            description: "The day to retrieve progress for; defaults to today",
            httpLocation: "query",
          },
        ],
      },
      getNutritionDay: {
        name: "getNutritionDay",
        description:
          "Retrieves a single nutritionDay record by ID, scoped to the authenticated user.",
        frontendDocument:
          "Used when navigating to a specific past day\&#39;s nutrition detail. Standard get by ID. On 404: show \&#39;No data for this date\&#39;.",
        crudType: "get",
        dataObjectName: "nutritionDay",
        method: "GET",
        routePath: "/v1/nutrition-days/:nutritionDayId",
        auth: {
          loginRequired: true,
          ownershipCheck: true,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "nutritionDayId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
      },
      listNutritionDays: {
        name: "listNutritionDays",
        description:
          "Lists nutritionDay records for the authenticated user with optional date range filtering.",
        frontendDocument:
          "Used by analytics pages to fetch the raw daily data. Always scoped to session.userId. Pass fromDate/toDate for range queries. summaryDate is an auto-filter from isFilterParameter=true. Returns sorted by summaryDate descending.",
        crudType: "list",
        dataObjectName: "nutritionDay",
        method: "GET",
        routePath: "/v1/nutrition-days",
        auth: {
          loginRequired: true,
          ownershipCheck: true,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "fromDate",
            type: "Date",
            required: false,
            description: "Range start",
            httpLocation: "query",
          },
          {
            name: "toDate",
            type: "Date",
            required: false,
            description: "Range end",
            httpLocation: "query",
          },
          {
            name: "summaryDate",
            type: "Date",
            required: false,
            description: "",
            httpLocation: "query",
          },
        ],
        pagination: {
          enabled: true,
          defaultPageSize: 30,
          maxPageSize: 100,
        },
      },
      getWeeklyAnalytics: {
        name: "getWeeklyAnalytics",
        description:
          "Returns the last 7 days of nutritionDay records plus computed analytics (averages, goal hit rates, calorie trend) via LIB.buildWeeklyAnalytics.",
        frontendDocument:
          "Triggered on the Weekly Analytics page load. Shows: a 7-day calorie trend line chart, a per-macro average bar chart, and a goal-hit-rate table (% of days each macro stayed within target). weeklyAnalytics context value is written to the response for the chart data. Loading state: skeleton chart cards.",
        crudType: "list",
        dataObjectName: "nutritionDay",
        method: "GET",
        routePath: "/v1/analytics/weekly",
        auth: {
          loginRequired: true,
          ownershipCheck: true,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [],
        pagination: {
          enabled: true,
          defaultPageSize: 25,
          maxPageSize: 100,
        },
      },
      getMonthlyAnalytics: {
        name: "getMonthlyAnalytics",
        description:
          "Returns the last 30 days of nutritionDay records plus computed analytics (averages, goal hit rates, multi-macro trends) via LIB.buildMonthlyAnalytics.",
        frontendDocument:
          "Triggered on the Monthly Analytics page load. Shows: 6 trend line charts (one per macro), per-macro average and goal-hit-rate summary cards. monthlyAnalytics context value is written to the response. Loading state: skeleton chart panel.",
        crudType: "list",
        dataObjectName: "nutritionDay",
        method: "GET",
        routePath: "/v1/analytics/monthly",
        auth: {
          loginRequired: true,
          ownershipCheck: true,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [],
        pagination: {
          enabled: true,
          defaultPageSize: 25,
          maxPageSize: 100,
        },
      },
      triggerDailyReminderCheck: {
        name: "triggerDailyReminderCheck",
        description:
          "Admin-only scheduled endpoint that finds users with no meals today and emits a Kafka reminder event for each.",
        frontendDocument:
          "Internal scheduled endpoint — not surfaced in any user-facing UI. Called by external cron at ~20:00 Turkish time. No user interaction.",
        crudType: "update",
        dataObjectName: "nutritionDay",
        method: "PATCH",
        routePath: "/v1/scheduled/daily-reminder-check",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["admin", "superAdmin"],
        },
        parameters: [],
      },
      triggerDailySummary: {
        name: "triggerDailySummary",
        description:
          "Admin-only scheduled endpoint that finds users with meals today and emits a Kafka daily summary event for each.",
        frontendDocument:
          "Internal scheduled endpoint — not surfaced in any user-facing UI. Called by external cron at ~23:59 Turkish time. No user interaction.",
        crudType: "update",
        dataObjectName: "nutritionDay",
        method: "PATCH",
        routePath: "/v1/scheduled/daily-summary",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["admin", "superAdmin"],
        },
        parameters: [],
      },
    },
  },
  nutritionai: {
    name: "nutritionai",
    fullname: "nutritionai",
    port: 3053,
    apis: {
      parseMeal: {
        name: "parseMeal",
        description:
          "Accepts a natural-language Turkish meal description, creates an aiSession record, invokes the AI parsing library function, and creates the resulting aiCandidateMeal and aiCandidateLine records.",
        frontendDocument:
          "Triggered from the AI chat input box on the meal log page. Show a loading spinner labeled \&#34;AI analiz ediyor...\&#34; while the request is in flight (can take 3–8 seconds). On 201, navigate to the candidate meal confirmation page (`/ai-candidate-meals/:candidateMealId`). If `confirmationRequired=true`, show the warning banner prominently before showing the food line table. On error, show a Turkish-language toast using `finalResponseText` from the response.",
        crudType: "create",
        dataObjectName: "aiSession",
        method: "POST",
        routePath: "/v1/ai-sessions/parse-meal",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "inputText",
            type: "Text",
            required: true,
            description: "Raw Turkish meal description from the user",
            httpLocation: "body",
          },
          {
            name: "proposedMealDate",
            type: "Date",
            required: false,
            description: "Optional date hint from user",
            httpLocation: "body",
          },
          {
            name: "proposedMealTime",
            type: "String",
            required: false,
            description: "Optional time hint from user",
            httpLocation: "body",
          },
          {
            name: "proposedSlotName",
            type: "String",
            required: false,
            description: "Optional meal slot override",
            httpLocation: "body",
          },
        ],
      },
      confirmCandidateMeal: {
        name: "confirmCandidateMeal",
        description:
          "Confirms a candidate meal after user review — applies optional line adjustments, recalculates totals, writes meal log and lines to mealTracker, saves foods to nutritionLibrary where requested, and marks the candidate as committed.",
        frontendDocument:
          "Triggered by the \&#39;Onayla\&#39; button on the candidate meal confirmation page. Disable the button while in flight. On success (200), show toast \&#34;Öğün başarıyla kaydedildi!\&#34; and navigate to the daily meal log page. If `lineAdjustments` are passed, the UI should pre-populate them from user edits in the confirmation table before submitting. On error, display the error message inline without navigating away.",
        crudType: "update",
        dataObjectName: "aiCandidateMeal",
        method: "PATCH",
        routePath: "/v1/ai-candidate-meals/:aiCandidateMealId/confirm",
        auth: {
          loginRequired: true,
          ownershipCheck: true,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "aiCandidateMealId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be updated",
            httpLocation: "urlpath",
          },
          {
            name: "proposedMealDate",
            type: "Date",
            required: false,
            description: "User may override the proposed date",
            httpLocation: "body",
          },
          {
            name: "proposedMealTime",
            type: "String",
            required: false,
            description: "User may override the proposed time",
            httpLocation: "body",
          },
          {
            name: "proposedSlotName",
            type: "String",
            required: false,
            description: "User may override the meal slot",
            httpLocation: "body",
          },
          {
            name: "lineAdjustments",
            type: "Object",
            required: false,
            description: "Array of per-line gram/saveAsFood overrides",
            httpLocation: "body",
          },
        ],
      },
      askNutritionQuestion: {
        name: "askNutritionQuestion",
        description:
          "Creates an aiSession for nutrition guidance, fetches macro targets and meal context from sibling services, invokes the AI guidance library function, and persists the structured guidance note.",
        frontendDocument:
          "Triggered from the AI Q&amp;A chat widget on the nutrition dashboard. Show a loading spinner labeled \&#34;Yanıt hazırlanıyor...\&#34; while the request is in flight (can take 3–8 seconds). On 201, render the guidance response card inline in the chat widget showing `finalResponseText` from the session and the full `aiGuidanceNote` details. The context range selector (today/week/month) should be a toggle above the text input; default is \&#39;today\&#39;.",
        crudType: "create",
        dataObjectName: "aiSession",
        method: "POST",
        routePath: "/v1/ai-sessions/ask",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "inputText",
            type: "Text",
            required: true,
            description: "Natural-language nutrition question in Turkish",
            httpLocation: "body",
          },
          {
            name: "contextRange",
            type: "String",
            required: false,
            description: "Time scope for context: today, week, month",
            httpLocation: "body",
          },
        ],
      },
      getAiSession: {
        name: "getAiSession",
        description:
          "Retrieves a single AI session by ID, scoped to the authenticated user.",
        frontendDocument:
          "Used on the session detail page. Display session metadata at the top (type badge, state badge, creation time). Below, render either the candidate meal card (if `sessionType=mealParsing`) or the guidance note card (if `sessionType=nutritionGuidance`). These are loaded separately via their respective GET endpoints using the session id as a filter.",
        crudType: "get",
        dataObjectName: "aiSession",
        method: "GET",
        routePath: "/v1/ai-sessions/:aiSessionId",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "aiSessionId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
      },
      listAiSessions: {
        name: "listAiSessions",
        description:
          "Lists all AI sessions for the authenticated user, ordered by most recent first.",
        frontendDocument:
          "Displayed on the AI session history page as a paginated list. Each row shows: `sessionType` badge, `sessionState` status chip, a preview of `inputText` (truncated to 80 chars), and `createdAt` as relative time. Default sort: newest first. Support filter chips by `sessionType` and `sessionState` using the auto-filter parameters. Clicking a row opens the session detail page.",
        crudType: "list",
        dataObjectName: "aiSession",
        method: "GET",
        routePath: "/v1/ai-sessions",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "userId",
            type: "ID",
            required: false,
            description: "",
            httpLocation: "query",
          },
          {
            name: "sessionType",
            type: "Enum",
            required: false,
            description: "",
            httpLocation: "query",
          },
          {
            name: "sessionState",
            type: "Enum",
            required: false,
            description: "",
            httpLocation: "query",
          },
        ],
        pagination: {
          enabled: true,
          defaultPageSize: 20,
          maxPageSize: 100,
        },
      },
      getAiCandidateMeal: {
        name: "getAiCandidateMeal",
        description:
          "Retrieves a single candidate meal by ID, scoped to the authenticated user.",
        frontendDocument:
          "Used on the candidate meal confirmation page. Load this first to show meal slot/date info and totals. Then load the candidate lines via the list endpoint filtered by `aiCandidateMealId`. If `isCommitted=true`, show the committed state with a link to the meal log.",
        crudType: "get",
        dataObjectName: "aiCandidateMeal",
        method: "GET",
        routePath: "/v1/ai-candidate-meals/:aiCandidateMealId",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "aiCandidateMealId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
      },
      listAiCandidateMeals: {
        name: "listAiCandidateMeals",
        description: "Lists candidate meals for the authenticated user.",
        frontendDocument:
          "Used when showing the user\&#39;s AI parsing history. Each row shows: proposed meal slot, proposed date, total calories, confirmation state (isConfirmed/isCommitted chips). Support auto-filters by `isConfirmed`, `isCommitted`, `aiSessionId`.",
        crudType: "list",
        dataObjectName: "aiCandidateMeal",
        method: "GET",
        routePath: "/v1/ai-candidate-meals",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "userId",
            type: "ID",
            required: false,
            description: "",
            httpLocation: "query",
          },
          {
            name: "aiSessionId",
            type: "ID",
            required: false,
            description: "",
            httpLocation: "query",
          },
          {
            name: "isConfirmed",
            type: "Boolean",
            required: false,
            description: "",
            httpLocation: "query",
          },
          {
            name: "isCommitted",
            type: "Boolean",
            required: false,
            description: "",
            httpLocation: "query",
          },
        ],
        pagination: {
          enabled: true,
          defaultPageSize: 20,
          maxPageSize: 100,
        },
      },
      updateAiCandidateLine: {
        name: "updateAiCandidateLine",
        description:
          "Updates a single candidate food line — allows the user to adjust gram amounts, toggle save-as-food, or rename the detected food. Recalculates nutrition values proportionally when grams change.",
        frontendDocument:
          "Triggered by inline editing in the confirmation table. Debounce gram input changes by 500ms before firing. After a successful 200, update the line row in the table with the new nutrition values from the response and refresh the meal totals card client-side. Show a brief inline checkmark on success.",
        crudType: "update",
        dataObjectName: "aiCandidateLine",
        method: "PATCH",
        routePath: "/v1/ai-candidate-lines/:aiCandidateLineId",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "aiCandidateLineId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be updated",
            httpLocation: "urlpath",
          },
          {
            name: "estimatedGrams",
            type: "Double",
            required: false,
            description: "Updated gram amount",
            httpLocation: "body",
          },
          {
            name: "saveAsFood",
            type: "Boolean",
            required: false,
            description: "Toggle save-to-library intent",
            httpLocation: "body",
          },
          {
            name: "detectedFoodName",
            type: "String",
            required: false,
            description: "User may rename the detected food",
            httpLocation: "body",
          },
        ],
      },
      rejectCandidateMeal: {
        name: "rejectCandidateMeal",
        description:
          "Rejects a candidate meal, marking it as not confirmed and updating the parent session state to failed.",
        frontendDocument:
          "Triggered by the \&#39;Reddet\&#39; button on the candidate meal confirmation page. On success, show toast \&#34;Öğün reddedildi\&#34; and navigate back to the meal log page.",
        crudType: "update",
        dataObjectName: "aiCandidateMeal",
        method: "PATCH",
        routePath: "/v1/ai-candidate-meals/:aiCandidateMealId/reject",
        auth: {
          loginRequired: true,
          ownershipCheck: true,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "aiCandidateMealId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be updated",
            httpLocation: "urlpath",
          },
        ],
      },
      getAiGuidanceNote: {
        name: "getAiGuidanceNote",
        description:
          "Retrieves a single AI guidance note by ID, scoped to the authenticated user.",
        frontendDocument:
          "Used on the session detail page for guidance sessions. Show the guidance card with answerSummary prominently, rationaleText in collapsible accordion, cautionText as amber callout.",
        crudType: "get",
        dataObjectName: "aiGuidanceNote",
        method: "GET",
        routePath: "/v1/ai-guidance-notes/:aiGuidanceNoteId",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "aiGuidanceNoteId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
      },
      listAiGuidanceNotes: {
        name: "listAiGuidanceNotes",
        description: "Lists all AI guidance notes for the authenticated user.",
        frontendDocument:
          "Displayed in the guidance history section. Each row shows: question type badge, context range label, creation time, and a truncated preview of answerSummary. Support auto-filters by `questionType` and `contextRange`.",
        crudType: "list",
        dataObjectName: "aiGuidanceNote",
        method: "GET",
        routePath: "/v1/ai-guidance-notes",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "userId",
            type: "ID",
            required: false,
            description: "",
            httpLocation: "query",
          },
          {
            name: "questionType",
            type: "String",
            required: false,
            description: "",
            httpLocation: "query",
          },
          {
            name: "contextRange",
            type: "String",
            required: false,
            description: "",
            httpLocation: "query",
          },
        ],
        pagination: {
          enabled: true,
          defaultPageSize: 20,
          maxPageSize: 100,
        },
      },
    },
  },
  agenthub: {
    name: "agenthub",
    fullname: "agenthub",
    port: 3006,
    apis: {
      getAgentOverride: {
        name: "getAgentOverride",
        description: "",
        frontendDocument: "",
        crudType: "get",
        dataObjectName: "sys_agentOverride",
        method: "GET",
        routePath: "/v1/agentoverride/:sys_agentOverrideId",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "sys_agentOverrideId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
      },
      listAgentOverrides: {
        name: "listAgentOverrides",
        description: "",
        frontendDocument: "",
        crudType: "list",
        dataObjectName: "sys_agentOverride",
        method: "GET",
        routePath: "/v1/agentoverrides",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [],
        pagination: {
          enabled: true,
          defaultPageSize: 25,
          maxPageSize: 100,
        },
      },
      createAgentOverride: {
        name: "createAgentOverride",
        description: "",
        frontendDocument: "",
        crudType: "create",
        dataObjectName: "sys_agentOverride",
        method: "POST",
        routePath: "/v1/agentoverride",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "agentName",
            type: "String",
            required: true,
            description: "Design-time agent name this override applies to.",
            httpLocation: "body",
          },
          {
            name: "provider",
            type: "String",
            required: false,
            description: "Override AI provider (e.g., openai, anthropic).",
            httpLocation: "body",
          },
          {
            name: "model",
            type: "String",
            required: false,
            description: "Override model name.",
            httpLocation: "body",
          },
          {
            name: "systemPrompt",
            type: "Text",
            required: false,
            description: "Override system prompt.",
            httpLocation: "body",
          },
          {
            name: "temperature",
            type: "Double",
            required: false,
            description: "Override temperature (0-2).",
            httpLocation: "body",
          },
          {
            name: "maxTokens",
            type: "Integer",
            required: false,
            description: "Override max tokens.",
            httpLocation: "body",
          },
          {
            name: "responseFormat",
            type: "String",
            required: false,
            description: "Override response format (text/json).",
            httpLocation: "body",
          },
          {
            name: "selectedTools",
            type: "Object",
            required: false,
            description:
              "Array of tool names from the catalog that this agent can use.",
            httpLocation: "body",
          },
          {
            name: "guardrails",
            type: "Object",
            required: false,
            description:
              "Override guardrails: { maxToolCalls, timeout, maxTokenBudget }.",
            httpLocation: "body",
          },
          {
            name: "enabled",
            type: "Boolean",
            required: false,
            description:
              "Optional caller override; defaults to true when omitted.",
            httpLocation: "body",
          },
        ],
      },
      updateAgentOverride: {
        name: "updateAgentOverride",
        description: "",
        frontendDocument: "",
        crudType: "update",
        dataObjectName: "sys_agentOverride",
        method: "PATCH",
        routePath: "/v1/agentoverride/:sys_agentOverrideId",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "sys_agentOverrideId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be updated",
            httpLocation: "urlpath",
          },
          {
            name: "provider",
            type: "String",
            required: false,
            description: "Override AI provider (e.g., openai, anthropic).",
            httpLocation: "body",
          },
          {
            name: "model",
            type: "String",
            required: false,
            description: "Override model name.",
            httpLocation: "body",
          },
          {
            name: "systemPrompt",
            type: "Text",
            required: false,
            description: "Override system prompt.",
            httpLocation: "body",
          },
          {
            name: "temperature",
            type: "Double",
            required: false,
            description: "Override temperature (0-2).",
            httpLocation: "body",
          },
          {
            name: "maxTokens",
            type: "Integer",
            required: false,
            description: "Override max tokens.",
            httpLocation: "body",
          },
          {
            name: "responseFormat",
            type: "String",
            required: false,
            description: "Override response format (text/json).",
            httpLocation: "body",
          },
          {
            name: "selectedTools",
            type: "Object",
            required: false,
            description:
              "Array of tool names from the catalog that this agent can use.",
            httpLocation: "body",
          },
          {
            name: "guardrails",
            type: "Object",
            required: false,
            description:
              "Override guardrails: { maxToolCalls, timeout, maxTokenBudget }.",
            httpLocation: "body",
          },
          {
            name: "enabled",
            type: "Boolean",
            required: false,
            description: "Update the enabled flag.",
            httpLocation: "body",
          },
        ],
      },
      deleteAgentOverride: {
        name: "deleteAgentOverride",
        description: "",
        frontendDocument: "",
        crudType: "delete",
        dataObjectName: "sys_agentOverride",
        method: "DELETE",
        routePath: "/v1/agentoverride/:sys_agentOverrideId",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "sys_agentOverrideId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be deleted",
            httpLocation: "urlpath",
          },
        ],
      },
      listToolCatalog: {
        name: "listToolCatalog",
        description: "",
        frontendDocument: "",
        crudType: "list",
        dataObjectName: "sys_toolCatalog",
        method: "GET",
        routePath: "/v1/toolcatalog",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "serviceName",
            type: "String",
            required: false,
            description: "Source service name.",
            httpLocation: "query",
          },
        ],
        pagination: {
          enabled: true,
          defaultPageSize: 25,
          maxPageSize: 100,
        },
      },
      getToolCatalogEntry: {
        name: "getToolCatalogEntry",
        description: "",
        frontendDocument: "",
        crudType: "get",
        dataObjectName: "sys_toolCatalog",
        method: "GET",
        routePath: "/v1/toolcatalogentry/:sys_toolCatalogId",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "sys_toolCatalogId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
      },
      listAgentExecutions: {
        name: "listAgentExecutions",
        description: "",
        frontendDocument: "",
        crudType: "list",
        dataObjectName: "sys_agentExecution",
        method: "GET",
        routePath: "/v1/agentexecutions",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "agentName",
            type: "String",
            required: false,
            description: "Agent that was executed.",
            httpLocation: "query",
          },
          {
            name: "agentType",
            type: "Enum",
            required: false,
            description: "Whether this was a design-time or dynamic agent.",
            httpLocation: "query",
          },
          {
            name: "source",
            type: "Enum",
            required: false,
            description: "How the agent was triggered.",
            httpLocation: "query",
          },
          {
            name: "userId",
            type: "ID",
            required: false,
            description: "User who triggered the execution.",
            httpLocation: "query",
          },
          {
            name: "status",
            type: "Enum",
            required: false,
            description: "Execution status.",
            httpLocation: "query",
          },
        ],
        pagination: {
          enabled: true,
          defaultPageSize: 25,
          maxPageSize: 100,
        },
      },
      getAgentExecution: {
        name: "getAgentExecution",
        description: "",
        frontendDocument: "",
        crudType: "get",
        dataObjectName: "sys_agentExecution",
        method: "GET",
        routePath: "/v1/agentexecution/:sys_agentExecutionId",
        auth: {
          loginRequired: true,
          ownershipCheck: false,
          checkRoles: [],
          absoluteRoles: ["superAdmin"],
        },
        parameters: [
          {
            name: "sys_agentExecutionId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
      },
    },
  },
};

/**
 * Get all services with their API documentation
 */
const getAllServices = () => {
  return Object.keys(API_DOCS).map((serviceName) => ({
    name: serviceName,
    fullname: API_DOCS[serviceName].fullname,
    apiCount: Object.keys(API_DOCS[serviceName].apis).length,
  }));
};

/**
 * Get all APIs for a specific service
 */
const getServiceApis = (serviceName) => {
  const service = API_DOCS[serviceName?.toLowerCase()];
  if (!service) return null;
  return {
    name: service.name,
    fullname: service.fullname,
    apis: Object.values(service.apis),
  };
};

/**
 * Get documentation for a specific API
 */
const getApiDoc = (serviceName, apiName) => {
  const service = API_DOCS[serviceName?.toLowerCase()];
  if (!service) return null;
  return service.apis[apiName] || null;
};

/**
 * Search APIs across all services
 */
const searchApis = (query) => {
  const results = [];
  const queryLower = query?.toLowerCase() || "";

  for (const [serviceName, service] of Object.entries(API_DOCS)) {
    for (const [apiName, api] of Object.entries(service.apis)) {
      if (
        apiName.toLowerCase().includes(queryLower) ||
        api.description?.toLowerCase().includes(queryLower) ||
        api.routePath?.toLowerCase().includes(queryLower) ||
        api.dataObjectName?.toLowerCase().includes(queryLower)
      ) {
        results.push({
          serviceName,
          serviceFullname: service.fullname,
          ...api,
        });
      }
    }
  }

  return results;
};

/**
 * Get APIs grouped by data object
 */
const getApisByDataObject = (serviceName) => {
  const service = API_DOCS[serviceName?.toLowerCase()];
  if (!service) return null;

  const grouped = {};
  for (const api of Object.values(service.apis)) {
    const objectName = api.dataObjectName || "Other";
    if (!grouped[objectName]) grouped[objectName] = [];
    grouped[objectName].push(api);
  }

  return grouped;
};

module.exports = {
  API_DOCS,
  getAllServices,
  getServiceApis,
  getApiDoc,
  searchApis,
  getApisByDataObject,
};
