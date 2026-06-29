# **FITCHECK**

**FRONTEND GUIDE FOR AI CODING AGENTS - PART 1 - Project Introduction &amp; Setup**

This is the introductory document for the **fitcheck** frontend project. It is designed for AI agents that will generate frontend code to consume the project's backend. Read it carefully — it describes the project scope, architecture, API conventions, and initial screens you must build before proceeding to the feature-specific prompts that follow.

This prompt will help you set up the project infrastructure, create the initial layout, home page, navigation, and any dummy screens. The subsequent prompts will provide detailed API documentation for each feature area.

## Project Introduction

FitCheck is a private, invite-only nutrition and meal tracking web application designed for individual users who want to manage their daily nutrition intake in a secure, personal environment. Users can log meals through multiple methods—food library, preset templates, manual entry, or AI-assisted parsing—track daily progress against personalized macro targets, and gain insights through weekly and monthly analytics. The platform includes an integrated AI assistant that parses natural-language meal descriptions and provides context-aware nutrition guidance, all while maintaining strict data isolation and privacy for each user.

## Application Frontend Description By The Backend Architect

FitCheck is a focused, data-driven nutrition tracking dashboard for health-conscious individuals. The primary navigation pattern follows a hub-and-spoke model: a central dashboard showing daily progress, with sidebar or top-bar access to meal logging, food library, presets, targets, analytics, and the AI chat interface. The authentication flow uses a dedicated login route (no modal popups) that enforces email verification before access. The overall visual theme should be clean and minimal—light mode preferred, with a calm, wellness-oriented color palette (soft blues, greens, light grays) and a sans-serif typography mood. Empty states for new users should be illustrated and encouraging rather than blank; loading states use skeleton screens for data-heavy tables and spinners for API calls; error messages appear as inline alerts on forms or toast notifications for transient errors. The app prioritizes responsive mobile design with touch-friendly input fields and readable text sizes for long tracking sessions. Accessibility is important: the app should support screen readers, high-contrast mode for visibility, and clear focus indicators. The AI chat interface is conversational and user-friendly, accepting natural-language input and returning readable, contextual responses. All meal logging flows are wizard-like but not modal-heavy—progressive disclosure of fields as the user advances through date selection, meal slot choice, and item entry. Nutrition numbers and comparisons to targets use color coding (green for on-track, yellow for approaching, red for exceeded) to provide immediate visual feedback.

## Project Description and Scope

**Project Description:** FitCheck is a Turkish-language, multi-user nutrition and meal tracking web application designed for individual users who want to privately monitor their daily food intake, nutritional targets, and dietary trends. Its purpose is to help users log meals through manual entry, reusable personal food libraries, preset meal templates, and an AI assistant that can interpret natural-language meal descriptions, estimate nutritional values, answer nutrition-related questions, and provide context-aware guidance based on each user’s live meal data and personal daily macro goals.

**Project Scope:** The project includes invite-only user registration, email-and-password authentication, private user accounts, personal food libraries with editable nutrition values per 100g, preset meal templates with adjustable day-specific usage, detailed meal logging with per-item and per-meal nutritional calculations, daily macro target management for calories, protein, carbohydrates, fat, sugar, and fiber, dashboard-based daily, weekly, and monthly nutrition analytics, and email notifications for invites, email verification, password resets, daily meal reminders, and daily nutrition summaries. The system is intended only for private self-service use by individual users at this stage and explicitly excludes public sign-up, social login, admin roles, coaches, nutritionists, support staff, shared or global food databases, barcode support, default serving sizes, weight goals, body metrics, custom goal periods, weekly summary emails, push notifications, and any frontend implementation beyond the backend architecture and services generated on the Mindbricks platform.

## Use Cases

### Manage Invitation Lifecycle

- Actor: Platform Operator
- Goal: Control who can join FitCheck through secure invite-only onboarding
- Main Flow:
  1. Platform Operator creates a new invite link for onboarding.
  2. Operator configures the invite as single-use or limited-use.
  3. System generates a unique, hard-to-guess registration link.
  4. System stores invite usage rules, status, and tracking metadata.
  5. Operator reviews invite validity and usage status when needed.
  6. Operator triggers sending of the invite email containing the registration link.
  7. System records invitation delivery and keeps the invite associated with the onboarding workflow.

### Register Through Invite Link

- Actor: Invited User
- Goal: Create a FitCheck account through a valid invitation
- Main Flow:
  1. Invited User opens the unique invite link received by email.
  2. System validates the invite link status, usage rules, and eligibility.
  3. User enters email and password to create an account.
  4. System creates the user account in a pending verification state.
  5. System sends an email verification message to the registered email address.
  6. User opens the verification link.
  7. System verifies the email address, activates the account for login, and updates invite usage tracking.

### Authenticate With Verified Email

- Actor: User
- Goal: Securely access the private FitCheck account
- Main Flow:
  1. User opens the login flow.
  2. User enters email and password.
  3. System validates the credentials.
  4. System checks whether the email address has been verified.
  5. If verified, system creates an authenticated session or token and grants access to the user’s private resources.
  6. If not verified, system denies login and instructs the user to complete email verification first.

### Reset Forgotten Password

- Actor: User
- Goal: Recover account access after forgetting the password
- Main Flow:
  1. User requests password reset from the authentication flow.
  2. User submits the account email address.
  3. System generates a secure password reset token.
  4. System sends a password reset email to the user.
  5. User opens the reset link and enters a new password.
  6. System validates the token and updates the password securely.
  7. User signs in with the new credentials.

### Access Only Personal Nutrition Data

- Actor: User
- Goal: Use FitCheck with full privacy and access limited to personal records
- Main Flow:
  1. User authenticates successfully.
  2. User requests private resources such as meal logs, foods, presets, targets, analytics, or AI-supported outputs.
  3. System scopes every request to the authenticated user identity.
  4. System returns only the records owned by that user.
  5. System blocks access to any record owned by another user.
  6. User continues using the application with isolated personal data only.

### Set And Update Daily Macro Targets

- Actor: User
- Goal: Define and maintain daily nutrition goals for tracking and guidance
- Main Flow:
  1. User opens daily target settings.
  2. User enters target values for calories, protein, carbohydrates, fat, sugar, and fiber.
  3. System saves the six daily macro targets.
  4. User later revisits the settings when nutrition goals change.
  5. User updates any of the six target values.
  6. System stores the latest targets and makes them available for dashboard progress, summary emails, and AI responses.

### Manage Private Food Library Items

- Actor: User
- Goal: Maintain a reusable personal food library with editable nutrition definitions
- Main Flow:
  1. User opens the private food library.
  2. User creates a food item manually.
  3. User provides food name and nutrition values per 100g for calories, protein, carbohydrates, fat, sugar, and fiber.
  4. User optionally adds brand and category information.
  5. System stores the food item with creation source metadata.
  6. User views whether the item was created manually or by the AI assistant.
  7. User edits nutritional values later to reflect an exact branded or customized product.
  8. User optionally renames the item after editing.
  9. System saves the updated food definition while keeping it private and reusable for future logs and presets.

### Create And Maintain Preset Meal Templates

- Actor: User
- Goal: Save reusable meal templates for faster recurring meal logging
- Main Flow:
  1. User starts creating a preset meal template.
  2. User enters a template name and optional description.
  3. User adds multiple food items with predefined gram amounts.
  4. System calculates total calories, protein, carbohydrates, fat, sugar, and fiber for the preset.
  5. System stores the preset along with its creation date.
  6. User reviews and manages saved presets in the private preset library.

### Log Meal From Private Food Library

- Actor: User
- Goal: Quickly create a meal log using saved food items
- Main Flow:
  1. User starts a new meal log.
  2. User selects the meal date and time.
  3. User chooses a standard or custom meal slot.
  4. User adds one or more foods from the private food library.
  5. User enters or adjusts consumed gram amounts for each food item.
  6. System calculates calories, protein, carbohydrates, fat, sugar, and fiber for each item based on consumed grams.
  7. System calculates the meal totals across all items.
  8. User optionally adds notes.
  9. System stores the meal log with source marked as food library.
  10. System preserves day-specific gram amounts and nutrition values without changing the original saved food definitions.

### Log Meal From Preset Template

- Actor: User
- Goal: Reuse a saved preset to log a recurring meal efficiently
- Main Flow:
  1. User starts a new meal log.
  2. User selects the meal date and time.
  3. User chooses a standard or custom meal slot.
  4. User selects an existing preset template.
  5. System loads the preset food items and predefined gram amounts.
  6. User adjusts gram amounts for that specific day if needed.
  7. System recalculates per-item nutrition and meal totals for the actual consumed amounts.
  8. User optionally adds notes.
  9. System stores the meal log with source marked as preset template.
  10. System keeps the original preset unchanged while preserving the historical meal snapshot.

### Log Meal Through Manual Entry

- Actor: User
- Goal: Record a meal even when foods are not already saved in the library
- Main Flow:
  1. User starts a new meal log.
  2. User selects the meal date and time.
  3. User chooses a standard or custom meal slot.
  4. User manually enters one or more food items from scratch.
  5. For each item, user enters food name, consumed grams, and nutrition values needed for the log.
  6. System calculates per-item nutrition totals for the consumed amounts.
  7. System calculates total meal calories, protein, carbohydrates, fat, sugar, and fiber.
  8. User optionally adds notes.
  9. System stores the meal log with source marked as manual entry.

### Review Daily Meal History

- Actor: User
- Goal: Check meals logged on a specific day and understand intake details
- Main Flow:
  1. User opens meal history.
  2. User selects a day to review.
  3. System retrieves all meal logs for that day belonging to the user.
  4. System displays each meal with date, time, slot, items, notes, source, and meal totals.
  5. User reviews what was eaten and uses the information to understand daily target impact.

### Monitor Daily Dashboard Progress

- Actor: User
- Goal: See current-day nutrition intake against personal daily targets
- Main Flow:
  1. User opens the dashboard.
  2. System aggregates the user’s meal logs for the selected day or current day.
  3. System retrieves the latest daily targets for calories, protein, carbohydrates, fat, sugar, and fiber.
  4. System displays consumed versus target values for all six metrics.
  5. System highlights any target that has been exceeded.
  6. User reviews progress and decides how to adjust remaining meals for the day.

### View Weekly And Monthly Nutrition Analytics

- Actor: User
- Goal: Analyze short-term and longer-term nutrition patterns from the dashboard
- Main Flow:
  1. User opens the analytics section within the authenticated dashboard.
  2. User views the weekly nutrition overview.
  3. System calculates average daily calories, protein, carbohydrates, fat, sugar, and fiber over the past 7 days.
  4. System displays calorie and macro trends over time for the weekly period.
  5. System calculates and displays weekly goal hit rates.
  6. User switches to the monthly nutrition overview.
  7. System calculates average daily calories and macros over the past 30 days.
  8. System displays calorie and macro trends over time for the monthly period.
  9. User reviews patterns directly inside the app dashboard.

### Log Meal With AI Assistant

- Actor: User
- Goal: Turn a natural-language meal description into a structured meal log
- Main Flow:
  1. User sends a natural-language meal description to the AI assistant.
  2. AI assistant identifies the individual food items mentioned in the message.
  3. AI assistant estimates gram amounts when the user did not specify them.
  4. AI assistant estimates nutritional values for the detected ingredients using standard reference data when needed.
  5. AI assistant determines the appropriate meal slot.
  6. If a quantity appears unrealistic, AI assistant warns the user and suggests a corrected amount.
  7. User confirms or adjusts the parsed result.
  8. AI assistant creates the meal log entry with item-level and meal-level nutrition values.
  9. System stores the meal log with source marked as AI assistant.
  10. User may optionally save detected foods to the private food library or keep them as one-time temporary entries only.

### Ask AI Assistant For Personalized Nutrition Guidance

- Actor: User
- Goal: Receive context-aware nutrition answers based on live meal data and targets
- Main Flow:
  1. User asks a nutrition-related question in natural language.
  2. AI assistant retrieves the user’s relevant meal logs and current daily macro targets.
  3. AI assistant analyzes the user’s live data in the context of the question.
  4. AI assistant generates a personalized answer, such as whether fat target has been exceeded today, how much protein has been consumed so far, or which logged option was healthiest this week.
  5. System returns the response in a user-friendly form for the authenticated user only.

### Receive Operational And Daily Nutrition Emails

- Actor: User
- Goal: Stay informed about account actions and daily tracking status through email
- Main Flow:
  1. System sends an invite email when the user is invited to join FitCheck.
  2. System sends an email verification message after registration.
  3. System sends a password reset email when recovery is requested.
  4. In the evening, system checks whether the user has logged any meals that day.
  5. If no meals exist for the day, system sends a daily reminder email.
  6. At end of day, system calculates actual daily totals versus current targets for calories, protein, carbohydrates, fat, sugar, and fiber.
  7. System sends a daily nutrition summary email with actual-versus-target results.

### Use FitCheck In Turkish

- Actor: User
- Goal: Interact with FitCheck in Turkish-language context
- Main Flow:
  1. User accesses backend-driven features of FitCheck.
  2. System provides Turkish-ready user-facing content such as email templates, default meal slot labels, and AI-generated outputs.
  3. User receives nutrition tracking and guidance content in a consistent Turkish-language experience.

## Project Services Overview

The project has **1 auth service**, **1 notification service**, **1 BFF service**, and **1 business service**, plus other helper services such as bucket and realtime.

Each service is a separate microservice application and listens for HTTP requests at different service URLs.

| #   | Service  | Description                        | API Prefix      |
| --- | -------- | ---------------------------------- | --------------- |
| 1   | auth     | Authentication and user management | `/auth-api`     |
| 2   | agentHub | AI Agent Hub                       | `/agentHub-api` |

Detailed API documentation for each service will be given in the following prompts. In this document, you will build the initial project structure, home pages, and navigation.

## API Structure

### Object Structure of a Successful Response

When the service processes requests successfully, it wraps the requested resource(s) within a JSON envelope. This envelope includes the data and essential metadata such as configuration details and pagination information, providing context to the client.

**HTTP Status Codes:**

- **200 OK**: Returned for successful GET, LIST, UPDATE, or DELETE operations, indicating that the request was processed successfully.
- **201 Created**: Returned for CREATE operations, indicating that the resource was created successfully.

**Success Response Format:**

For successful operations, the response includes a `"status": "OK"` property, signaling that the request executed successfully. The structure of a successful response is outlined below:

```json
{
  "status": "OK",
  "statusCode": 200,
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "products",
  "method": "GET",
  "action": "list",
  "appVersion": "Version",
  "rowCount": 3,
  "products": [{}, {}, {}],
  "paging": {
    "pageNumber": 1,
    "pageRowCount": 25,
    "totalRowCount": 3,
    "pageCount": 1
  },
  "filters": [],
  "uiPermissions": []
}
```

- **`products`**: In this example, this key contains the actual response content, which may be a single object or an array of objects depending on the operation.

### Additional Data

Each API may include additional data besides the main data object, depending on the business logic of the API. These will be provided in each API's response signature.

### Error Response

If a request encounters an issue—whether due to a logical fault or a technical problem—the service responds with a standardized JSON error structure. The HTTP status code indicates the nature of the error, using commonly recognized codes for clarity:

- **400 Bad Request**: The request was improperly formatted or contained invalid parameters.
- **401 Unauthorized**: The request lacked a valid authentication token; login is required.
- **403 Forbidden**: The current token does not grant access to the requested resource.
- **404 Not Found**: The requested resource was not found on the server.
- **500 Internal Server Error**: The server encountered an unexpected condition.

Each error response is structured to provide meaningful insight into the problem, assisting in efficient diagnosis and resolution.

```js
{
  "result": "ERR",
  "status": 400,
  "message": "errMsg_organizationIdisNotAValidID",
  "errCode": 400,
  "date": "2024-03-19T12:13:54.124Z",
  "detail": "String"
}
```

## Accessing the Backend Using Rest API

Each backend service has its own URL for each deployment environment. Users may want to test the frontend in one of the three deployments—preview, staging, or production.
Please ensure that the home page includes a deployment server selection option so that, as the frontend coding agent, you can set the base URL for all services.

The base URL of the application in each environment is as follows:

- **Preview:** `https://lrmwufitcheck.preview.mindbricks.com`
- **Staging:** `https://lrmwufitcheck-stage.mindbricks.co`
- **Production:** `https://lrmwufitcheck.mindbricks.co`

For the auth service, the base URLs are:

- **Preview:** `https://lrmwufitcheck.preview.mindbricks.com/auth-api`
- **Staging:** `https://lrmwufitcheck-stage.mindbricks.co/auth-api`
- **Production:** `https://lrmwufitcheck.mindbricks.co/auth-api`

For each other service, append `/{serviceName}-api` to the environment base URL.

Any request that requires login must include a valid token in the Bearer authorization header.

Please note that for each service in the project (which will be introduced in following prompts) will use a different address so it is a good practice to define a separate client for each service in the frontend application lib source. Not only the different base urls, some services even may need different access rules when shaping the request.

Services may be deployed to the preview server, staging server, or production server. Therefore, each service has 3 access URLs.
The frontend application must support all deployment environments during development, and the user should be able to select the target API server on the home page.

## Home Page

First build a home page which shows some static content about the application, and has got login and registration (if is public) buttons. The home page should be updated later according to the content that each service provides, as a frontend developer use best and common practices to reflect the service content to the home page. User may also give extra information for the home page content in addition to this prompt.

Note that this page should include a deployment (environment) selection option to set the base URL. Set the default to `production`.

After user logs in, page header should show the current login state as in modern web pages, logged in user fullname, avatar, email and with a logout link, make a fancy current user component. The home page may have different views before and after login.

## Initial Navigation Structure

Build the initial navigation/sidebar with placeholder pages for each area of the application. These will be implemented in detail by the subsequent prompts:

- Home / Landing
- Login
- Verification
- Profile
- User Management (admin)

Create these as placeholder/dummy pages with a title and "Coming soon" note. They will be filled in by the following prompts.

## What To Build Now

With this prompt, build:

1. **Project infrastructure** — routing (using `react-router` v7 — import from `react-router`, not `react-router-dom`), layout, environment config, API client setup (one client per service)
2. **Home page** with environment selector, login/register buttons, project description
3. **Placeholder pages** for all navigation items listed above
4. **Common components** — header with user info, navigation sidebar/menu, layout wrapper

Do **not** implement authentication flows, registration, or any service-specific features yet — those will be covered in the next prompts.

## Common Reminders

1. When the application starts, please ensure that the `baseUrl` is set to the production server URL, and that the environment selector dropdown has the **Production** option selected by default.
2. Note that any API call to the application backend is based on a service base URL. Auth APIs use `/auth-api` prefix, and each business service uses `/{serviceName}-api` prefix after the application's base URL.
3. The deployment environment selector will only be used in the home page. If any page is called directly bypassing the home page, the page will use the stored or default environment.
