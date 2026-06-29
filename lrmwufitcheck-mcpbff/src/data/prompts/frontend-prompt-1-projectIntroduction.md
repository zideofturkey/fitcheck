

# **FITCHECK**

**FRONTEND GUIDE FOR AI CODING AGENTS - PART 1 - Project Introduction &amp; Setup**

This is the introductory document for the **fitcheck** frontend project. It is designed for AI agents that will generate frontend code to consume the project's backend. Read it carefully — it describes the project scope, architecture, API conventions, and initial screens you must build before proceeding to the feature-specific prompts that follow.

This prompt will help you set up the project infrastructure, create the initial layout, home page, navigation, and any dummy screens. The subsequent prompts will provide detailed API documentation for each feature area.

## Project Introduction

FitCheck is a private, invite-only nutrition and meal tracking web application designed for individual users who want to manage their daily nutrition intake in a secure, personal environment. Users can log meals through multiple methods—food library, preset templates, manual entry, or AI-assisted parsing—track daily progress against personalized macro targets, and gain insights through weekly and monthly analytics. The platform includes an integrated AI assistant that parses natural-language meal descriptions and provides context-aware nutrition guidance, all while maintaining strict data isolation and privacy for each user.

## Application Frontend Description By The Backend Architect

FitCheck is a focused, data-driven nutrition tracking dashboard for health-conscious individuals. The primary navigation pattern follows a hub-and-spoke model: a central dashboard showing daily progress, with sidebar or top-bar access to meal logging, food library, presets, targets, analytics, and the AI chat interface. The authentication flow uses a dedicated login route (no modal popups) that enforces email verification before access. The overall visual theme should be clean and minimal—light mode preferred, with a calm, wellness-oriented color palette (soft blues, greens, light grays) and a sans-serif typography mood. Empty states for new users should be illustrated and encouraging rather than blank; loading states use skeleton screens for data-heavy tables and spinners for API calls; error messages appear as inline alerts on forms or toast notifications for transient errors. The app prioritizes responsive mobile design with touch-friendly input fields and readable text sizes for long tracking sessions. Accessibility is important: the app should support screen readers, high-contrast mode for visibility, and clear focus indicators. The AI chat interface is conversational and user-friendly, accepting natural-language input and returning readable, contextual responses. All meal logging flows are wizard-like but not modal-heavy—progressive disclosure of fields as the user advances through date selection, meal slot choice, and item entry. Nutrition numbers and comparisons to targets use color coding (green for on-track, yellow for approaching, red for exceeded) to provide immediate visual feedback.



## Project Services Overview

The project has **1 auth service**, **1 notification service**, **1 BFF service**, and **5 business services**, plus other helper services such as bucket and realtime.

Each service is a separate microservice application and listens for HTTP requests at different service URLs.

| # | Service | Description | API Prefix |
|---|---------|-------------|------------|
| 1 | auth | Authentication and user management | `/auth-api` |
| 2 | invitationCenter | Manages invite-only onboarding links for platform operators, including creation,... | `/invitationCenter-api` |
| 3 | nutritionLibrary | Manages each user's private macro targets, personal food library, and reusable p... | `/nutritionLibrary-api` |
| 4 | mealTracker | Creates and manages user meal logs from multiple sources, calculates per-item an... | `/mealTracker-api` |
| 5 | nutritionAi | Processes natural-language Turkish meal descriptions into structured nutrition i... | `/nutritionAi-api` |
| 6 | agentHub | AI Agent Hub | `/agentHub-api` |

Detailed API documentation for each service will be given in the following prompts. In this document, you will build the initial project structure, home pages, and navigation.

## API Structure

### Object Structure of a Successful Response

When the service processes requests successfully, it wraps the requested resource(s) within a JSON envelope. This envelope includes the data and essential metadata such as configuration details and pagination information, providing context to the client.

**HTTP Status Codes:**

* **200 OK**: Returned for successful GET, LIST, UPDATE, or DELETE operations, indicating that the request was processed successfully.
* **201 Created**: Returned for CREATE operations, indicating that the resource was created successfully.

**Success Response Format:**

For successful operations, the response includes a `"status": "OK"` property, signaling that the request executed successfully. The structure of a successful response is outlined below:

```json
{
  "status":"OK",
  "statusCode": 200,
  "elapsedMs":126,
  "ssoTime":120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName":"products",
  "method":"GET",
  "action":"list",
  "appVersion":"Version",
  "rowCount":3,
  "products":[{},{},{}],
  "paging": {
    "pageNumber":1,
    "pageRowCount":25,
    "totalRowCount":3,
    "pageCount":1
  },
  "filters": [],
  "uiPermissions": []
}
```

* **`products`**: In this example, this key contains the actual response content, which may be a single object or an array of objects depending on the operation.

### Additional Data

Each API may include additional data besides the main data object, depending on the business logic of the API. These will be provided in each API's response signature.

### Error Response

If a request encounters an issue—whether due to a logical fault or a technical problem—the service responds with a standardized JSON error structure. The HTTP status code indicates the nature of the error, using commonly recognized codes for clarity:

* **400 Bad Request**: The request was improperly formatted or contained invalid parameters.
* **401 Unauthorized**: The request lacked a valid authentication token; login is required.
* **403 Forbidden**: The current token does not grant access to the requested resource.
* **404 Not Found**: The requested resource was not found on the server.
* **500 Internal Server Error**: The server encountered an unexpected condition.

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

* **Preview:** `https://lrmwufitcheck.preview.mindbricks.com`
* **Staging:** `https://lrmwufitcheck-stage.mindbricks.co`
* **Production:** `https://lrmwufitcheck.mindbricks.co`

For the auth service, the base URLs are:

* **Preview:** `https://lrmwufitcheck.preview.mindbricks.com/auth-api`
* **Staging:** `https://lrmwufitcheck-stage.mindbricks.co/auth-api`
* **Production:** `https://lrmwufitcheck.mindbricks.co/auth-api`

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
- InvitationCenter Service Pages
- NutritionLibrary Service Pages
- MealTracker Service Pages
- NutritionAi Service Pages

Create these as placeholder/dummy pages with a title and "Coming soon" note. They will be filled in by the following prompts.

## What To Build Now

With this prompt, build:
1. **Project infrastructure** — routing (using `react-router` v7 — import from `react-router`, not `react-router-dom`), layout, environment config, API client setup (one client per service)
2. **Home page** with environment selector, login/register buttons, project description
4. **Placeholder pages** for all navigation items listed above
5. **Common components** — header with user info, navigation sidebar/menu, layout wrapper

Do **not** implement authentication flows, registration, or any service-specific features yet — those will be covered in the next prompts.

## Common Reminders

1. When the application starts, please ensure that the `baseUrl` is set to the production server URL, and that the environment selector dropdown has the **Production** option selected by default.
2. Note that any API call to the application backend is based on a service base URL. Auth APIs use `/auth-api` prefix, and each business service uses `/{serviceName}-api` prefix after the application's base URL.
3. The deployment environment selector will only be used in the home page. If any page is called directly bypassing the home page, the page will use the stored or default environment.
