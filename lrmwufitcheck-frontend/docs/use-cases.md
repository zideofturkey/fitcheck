# Use Cases

> **18 use cases** covering **85 user stories**.

---

## Summary

| ID | Title | User Stories |
|----|-------|-------------|
| **UC01** | Manage Invitation Lifecycle | `US01` `US02` `US03` `US04` |
| **UC02** | Register Through Invite Link | `US05` `US06` `US07` `US80` `US81` |
| **UC03** | Authenticate With Verified Email | `US08` `US10` |
| **UC04** | Reset Forgotten Password | `US09` `US82` |
| **UC05** | Access Only Personal Nutrition Data | `US11` `US26` `US35` |
| **UC06** | Set And Update Daily Macro Targets | `US12` `US13` `US14` `US15` `US16` `US17` `US18` |
| **UC07** | Manage Private Food Library Items | `US19` `US20` `US21` `US22` `US23` `US24` `US25` `US26` `US27` |
| **UC08** | Create And Maintain Preset Meal Templates | `US28` `US29` `US30` `US31` `US32` `US35` |
| **UC09** | Log Meal From Private Food Library | `US36` `US37` `US38` `US39` `US42` `US43` `US44` `US45` `US46` `US47` `US48` |
| **UC10** | Log Meal From Preset Template | `US33` `US34` `US36` `US37` `US38` `US40` `US42` `US43` `US44` `US45` `US46` `US47` `US48` |
| **UC11** | Log Meal Through Manual Entry | `US36` `US37` `US38` `US41` `US42` `US43` `US44` `US45` `US46` `US47` |
| **UC12** | Review Daily Meal History | `US49` |
| **UC13** | Monitor Daily Dashboard Progress | `US50` `US51` `US52` `US53` `US54` `US55` `US56` |
| **UC14** | View Weekly And Monthly Nutrition Analytics | `US57` `US58` `US59` `US60` `US61` `US62` `US63` `US64` |
| **UC15** | Log Meal With AI Assistant | `US65` `US66` `US67` `US68` `US69` `US70` `US71` `US72` `US78` `US79` |
| **UC16** | Ask AI Assistant For Personalized Nutrition Guidance | `US73` `US74` `US75` `US76` `US77` |
| **UC17** | Receive Operational And Daily Nutrition Emails | `US80` `US81` `US82` `US83` `US84` |
| **UC18** | Use FitCheck In Turkish | `US85` |

---

## Use Cases

### `UC01` — Manage Invitation Lifecycle

**Related User Stories:** `US01` · `US02` · `US03` · `US04`

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

---

### `UC02` — Register Through Invite Link

**Related User Stories:** `US05` · `US06` · `US07` · `US80` · `US81`

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

---

### `UC03` — Authenticate With Verified Email

**Related User Stories:** `US08` · `US10`

- Actor: User
- Goal: Securely access the private FitCheck account
- Main Flow:
    1. User opens the login flow.
    2. User enters email and password.
    3. System validates the credentials.
    4. System checks whether the email address has been verified.
    5. If verified, system creates an authenticated session or token and grants access to the user’s private resources.
    6. If not verified, system denies login and instructs the user to complete email verification first.

---

### `UC04` — Reset Forgotten Password

**Related User Stories:** `US09` · `US82`

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

---

### `UC05` — Access Only Personal Nutrition Data

**Related User Stories:** `US11` · `US26` · `US35`

- Actor: User
- Goal: Use FitCheck with full privacy and access limited to personal records
- Main Flow:
    1. User authenticates successfully.
    2. User requests private resources such as meal logs, foods, presets, targets, analytics, or AI-supported outputs.
    3. System scopes every request to the authenticated user identity.
    4. System returns only the records owned by that user.
    5. System blocks access to any record owned by another user.
    6. User continues using the application with isolated personal data only.

---

### `UC06` — Set And Update Daily Macro Targets

**Related User Stories:** `US12` · `US13` · `US14` · `US15` · `US16` · `US17` · `US18`

- Actor: User
- Goal: Define and maintain daily nutrition goals for tracking and guidance
- Main Flow:
    1. User opens daily target settings.
    2. User enters target values for calories, protein, carbohydrates, fat, sugar, and fiber.
    3. System saves the six daily macro targets.
    4. User later revisits the settings when nutrition goals change.
    5. User updates any of the six target values.
    6. System stores the latest targets and makes them available for dashboard progress, summary emails, and AI responses.

---

### `UC07` — Manage Private Food Library Items

**Related User Stories:** `US19` · `US20` · `US21` · `US22` · `US23` · `US24` · `US25` · `US26` · `US27`

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

---

### `UC08` — Create And Maintain Preset Meal Templates

**Related User Stories:** `US28` · `US29` · `US30` · `US31` · `US32` · `US35`

- Actor: User
- Goal: Save reusable meal templates for faster recurring meal logging
- Main Flow:
    1. User starts creating a preset meal template.
    2. User enters a template name and optional description.
    3. User adds multiple food items with predefined gram amounts.
    4. System calculates total calories, protein, carbohydrates, fat, sugar, and fiber for the preset.
    5. System stores the preset along with its creation date.
    6. User reviews and manages saved presets in the private preset library.

---

### `UC09` — Log Meal From Private Food Library

**Related User Stories:** `US36` · `US37` · `US38` · `US39` · `US42` · `US43` · `US44` · `US45` · `US46` · `US47` · `US48`

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

---

### `UC10` — Log Meal From Preset Template

**Related User Stories:** `US33` · `US34` · `US36` · `US37` · `US38` · `US40` · `US42` · `US43` · `US44` · `US45` · `US46` · `US47` · `US48`

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

---

### `UC11` — Log Meal Through Manual Entry

**Related User Stories:** `US36` · `US37` · `US38` · `US41` · `US42` · `US43` · `US44` · `US45` · `US46` · `US47`

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

---

### `UC12` — Review Daily Meal History

**Related User Stories:** `US49`

- Actor: User
- Goal: Check meals logged on a specific day and understand intake details
- Main Flow:
    1. User opens meal history.
    2. User selects a day to review.
    3. System retrieves all meal logs for that day belonging to the user.
    4. System displays each meal with date, time, slot, items, notes, source, and meal totals.
    5. User reviews what was eaten and uses the information to understand daily target impact.

---

### `UC13` — Monitor Daily Dashboard Progress

**Related User Stories:** `US50` · `US51` · `US52` · `US53` · `US54` · `US55` · `US56`

- Actor: User
- Goal: See current-day nutrition intake against personal daily targets
- Main Flow:
    1. User opens the dashboard.
    2. System aggregates the user’s meal logs for the selected day or current day.
    3. System retrieves the latest daily targets for calories, protein, carbohydrates, fat, sugar, and fiber.
    4. System displays consumed versus target values for all six metrics.
    5. System highlights any target that has been exceeded.
    6. User reviews progress and decides how to adjust remaining meals for the day.

---

### `UC14` — View Weekly And Monthly Nutrition Analytics

**Related User Stories:** `US57` · `US58` · `US59` · `US60` · `US61` · `US62` · `US63` · `US64`

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

---

### `UC15` — Log Meal With AI Assistant

**Related User Stories:** `US65` · `US66` · `US67` · `US68` · `US69` · `US70` · `US71` · `US72` · `US78` · `US79`

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

---

### `UC16` — Ask AI Assistant For Personalized Nutrition Guidance

**Related User Stories:** `US73` · `US74` · `US75` · `US76` · `US77`

- Actor: User
- Goal: Receive context-aware nutrition answers based on live meal data and targets
- Main Flow:
    1. User asks a nutrition-related question in natural language.
    2. AI assistant retrieves the user’s relevant meal logs and current daily macro targets.
    3. AI assistant analyzes the user’s live data in the context of the question.
    4. AI assistant generates a personalized answer, such as whether fat target has been exceeded today, how much protein has been consumed so far, or which logged option was healthiest this week.
    5. System returns the response in a user-friendly form for the authenticated user only.

---

### `UC17` — Receive Operational And Daily Nutrition Emails

**Related User Stories:** `US80` · `US81` · `US82` · `US83` · `US84`

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

---

### `UC18` — Use FitCheck In Turkish

**Related User Stories:** `US85`

- Actor: User
- Goal: Interact with FitCheck in Turkish-language context
- Main Flow:
    1. User accesses backend-driven features of FitCheck.
    2. System provides Turkish-ready user-facing content such as email templates, default meal slot labels, and AI-generated outputs.
    3. User receives nutrition tracking and guidance content in a consistent Turkish-language experience.

---


*Total: 18 use cases*
