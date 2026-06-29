# EVENT API GUIDE

## BFF SERVICE

The BFF service is a microservice that acts as a bridge between the client and backend services. It provides a unified API for the client to interact with multiple backend services, simplifying the communication process and improving performance.

## Architectural Design Credit and Contact Information

The architectural design of this microservice is credited to.  
For inquiries, feedback, or further information regarding the architecture, please direct your communication to:

**Email**:

We encourage open communication and welcome any questions or discussions related to the architectural aspects of this microservice.

## Documentation Scope

Welcome to the official documentation for the BFF Service Event Listeners. This guide details the Kafka-based event listeners responsible for reacting to ElasticSearch index events. It describes listener responsibilities, the topics they subscribe to, and expected payloads.

**Intended Audience**  
This documentation is intended for developers, architects, and system administrators involved in the design, implementation, and maintenance of the BFF Service. It assumes familiarity with microservices architecture, the Kafka messaging system, and ElasticSearch.

**Overview**  
Each ElasticSearch index operation (create, update, delete) emits a corresponding event to Kafka. These events are consumed by listeners responsible for executing aggregate functions to ensure index- and system-level consistency.

## Kafka Event Listeners

### Kafka Event Listener: invitelink-created

**Event Topic**: `elastic-index-lrmwufitcheck_invitelink-created`

When a `invitelink` is created in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `inviteLinkDeliveredNotificationViewAggregateData` function to enrich and store the final document in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: invitelink-updated

**Event Topic**: `elastic-index-lrmwufitcheck_invitelink-updated`

When a `invitelink` is updated in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `inviteLinkDeliveredNotificationViewAggregateData` function to update the enriched document in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: invitelink-deleted

**Event Topic**: `elastic-index-lrmwufitcheck>_invitelink-deleted`

When a `invitelink` is deleted in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `inviteLinkDeliveredNotificationViewAggregateData` function to handle removal or cleanup in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: invitelink-created

**Event Topic**: `elastic-index-lrmwufitcheck_invitelink-created`

When a `invitelink` is created in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `inviteLinkListViewAggregateData` function to enrich and store the final document in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: invitelink-updated

**Event Topic**: `elastic-index-lrmwufitcheck_invitelink-updated`

When a `invitelink` is updated in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `inviteLinkListViewAggregateData` function to update the enriched document in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: invitelink-deleted

**Event Topic**: `elastic-index-lrmwufitcheck>_invitelink-deleted`

When a `invitelink` is deleted in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `inviteLinkListViewAggregateData` function to handle removal or cleanup in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: user-created

**Event Topic**: `elastic-index-user-created`

When a `user` is created in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `registeredUserReInviteLinkListView` function to update dependent documents in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: user-updated

**Event Topic**: `elastic-index-lrmwufitcheck>_user-updated`

When a `user` is updated in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `registeredUserReInviteLinkListView` function to re-enrich dependent data in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: user-deleted

**Event Topic**: `elastic-index-lrmwufitcheck>_user-deleted`

When a `user` is deleted from the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `registeredUserReInviteLinkListView` function to handle dependent data cleanup or updates.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: presetmeal-created

**Event Topic**: `elastic-index-lrmwufitcheck_presetmeal-created`

When a `presetmeal` is created in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `presetMealWithLinesAggregateData` function to enrich and store the final document in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: presetmeal-updated

**Event Topic**: `elastic-index-lrmwufitcheck_presetmeal-updated`

When a `presetmeal` is updated in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `presetMealWithLinesAggregateData` function to update the enriched document in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: presetmeal-deleted

**Event Topic**: `elastic-index-lrmwufitcheck>_presetmeal-deleted`

When a `presetmeal` is deleted in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `presetMealWithLinesAggregateData` function to handle removal or cleanup in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: fooditem-created

**Event Topic**: `elastic-index-fooditem-created`

When a `fooditem` is created in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `foodItemsRePresetMealWithLines` function to update dependent documents in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: fooditem-updated

**Event Topic**: `elastic-index-lrmwufitcheck>_fooditem-updated`

When a `fooditem` is updated in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `foodItemsRePresetMealWithLines` function to re-enrich dependent data in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: fooditem-deleted

**Event Topic**: `elastic-index-lrmwufitcheck>_fooditem-deleted`

When a `fooditem` is deleted from the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `foodItemsRePresetMealWithLines` function to handle dependent data cleanup or updates.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: presetline-created

**Event Topic**: `elastic-index-presetline-created`

When a `presetline` is created in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `linesRePresetMealWithLines` function to update dependent documents in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: presetline-updated

**Event Topic**: `elastic-index-lrmwufitcheck>_presetline-updated`

When a `presetline` is updated in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `linesRePresetMealWithLines` function to re-enrich dependent data in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: presetline-deleted

**Event Topic**: `elastic-index-lrmwufitcheck>_presetline-deleted`

When a `presetline` is deleted from the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `linesRePresetMealWithLines` function to handle dependent data cleanup or updates.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: fooditem-created

**Event Topic**: `elastic-index-lrmwufitcheck_fooditem-created`

When a `fooditem` is created in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `foodItemListAggregateData` function to enrich and store the final document in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: fooditem-updated

**Event Topic**: `elastic-index-lrmwufitcheck_fooditem-updated`

When a `fooditem` is updated in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `foodItemListAggregateData` function to update the enriched document in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: fooditem-deleted

**Event Topic**: `elastic-index-lrmwufitcheck>_fooditem-deleted`

When a `fooditem` is deleted in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `foodItemListAggregateData` function to handle removal or cleanup in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: aicandidatemeal-created

**Event Topic**: `elastic-index-lrmwufitcheck_aicandidatemeal-created`

When a `aicandidatemeal` is created in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `aiCandidateMealWithLinesAggregateData` function to enrich and store the final document in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: aicandidatemeal-updated

**Event Topic**: `elastic-index-lrmwufitcheck_aicandidatemeal-updated`

When a `aicandidatemeal` is updated in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `aiCandidateMealWithLinesAggregateData` function to update the enriched document in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: aicandidatemeal-deleted

**Event Topic**: `elastic-index-lrmwufitcheck>_aicandidatemeal-deleted`

When a `aicandidatemeal` is deleted in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `aiCandidateMealWithLinesAggregateData` function to handle removal or cleanup in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: aisession-created

**Event Topic**: `elastic-index-aisession-created`

When a `aisession` is created in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `sessionReAiCandidateMealWithLines` function to update dependent documents in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: aisession-updated

**Event Topic**: `elastic-index-lrmwufitcheck>_aisession-updated`

When a `aisession` is updated in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `sessionReAiCandidateMealWithLines` function to re-enrich dependent data in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: aisession-deleted

**Event Topic**: `elastic-index-lrmwufitcheck>_aisession-deleted`

When a `aisession` is deleted from the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `sessionReAiCandidateMealWithLines` function to handle dependent data cleanup or updates.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: aicandidateline-created

**Event Topic**: `elastic-index-aicandidateline-created`

When a `aicandidateline` is created in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `linesReAiCandidateMealWithLines` function to update dependent documents in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: aicandidateline-updated

**Event Topic**: `elastic-index-lrmwufitcheck>_aicandidateline-updated`

When a `aicandidateline` is updated in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `linesReAiCandidateMealWithLines` function to re-enrich dependent data in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: aicandidateline-deleted

**Event Topic**: `elastic-index-lrmwufitcheck>_aicandidateline-deleted`

When a `aicandidateline` is deleted from the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `linesReAiCandidateMealWithLines` function to handle dependent data cleanup or updates.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: meallog-created

**Event Topic**: `elastic-index-lrmwufitcheck_meallog-created`

When a `meallog` is created in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `mealLogWithLinesAggregateData` function to enrich and store the final document in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: meallog-updated

**Event Topic**: `elastic-index-lrmwufitcheck_meallog-updated`

When a `meallog` is updated in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `mealLogWithLinesAggregateData` function to update the enriched document in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: meallog-deleted

**Event Topic**: `elastic-index-lrmwufitcheck>_meallog-deleted`

When a `meallog` is deleted in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `mealLogWithLinesAggregateData` function to handle removal or cleanup in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: mealline-created

**Event Topic**: `elastic-index-mealline-created`

When a `mealline` is created in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `mealLinesReMealLogWithLines` function to update dependent documents in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: mealline-updated

**Event Topic**: `elastic-index-lrmwufitcheck>_mealline-updated`

When a `mealline` is updated in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `mealLinesReMealLogWithLines` function to re-enrich dependent data in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: mealline-deleted

**Event Topic**: `elastic-index-lrmwufitcheck>_mealline-deleted`

When a `mealline` is deleted from the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `mealLinesReMealLogWithLines` function to handle dependent data cleanup or updates.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: aisession-created

**Event Topic**: `elastic-index-lrmwufitcheck_aisession-created`

When a `aisession` is created in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `aiSessionHistoryAggregateData` function to enrich and store the final document in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: aisession-updated

**Event Topic**: `elastic-index-lrmwufitcheck_aisession-updated`

When a `aisession` is updated in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `aiSessionHistoryAggregateData` function to update the enriched document in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: aisession-deleted

**Event Topic**: `elastic-index-lrmwufitcheck>_aisession-deleted`

When a `aisession` is deleted in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `aiSessionHistoryAggregateData` function to handle removal or cleanup in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: aiguidancenote-created

**Event Topic**: `elastic-index-aiguidancenote-created`

When a `aiguidancenote` is created in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `guidanceNoteReAiSessionHistory` function to update dependent documents in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: aiguidancenote-updated

**Event Topic**: `elastic-index-lrmwufitcheck>_aiguidancenote-updated`

When a `aiguidancenote` is updated in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `guidanceNoteReAiSessionHistory` function to re-enrich dependent data in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: aiguidancenote-deleted

**Event Topic**: `elastic-index-lrmwufitcheck>_aiguidancenote-deleted`

When a `aiguidancenote` is deleted from the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `guidanceNoteReAiSessionHistory` function to handle dependent data cleanup or updates.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: aicandidatemeal-created

**Event Topic**: `elastic-index-aicandidatemeal-created`

When a `aicandidatemeal` is created in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `candidateMealReAiSessionHistory` function to update dependent documents in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: aicandidatemeal-updated

**Event Topic**: `elastic-index-lrmwufitcheck>_aicandidatemeal-updated`

When a `aicandidatemeal` is updated in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `candidateMealReAiSessionHistory` function to re-enrich dependent data in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: aicandidatemeal-deleted

**Event Topic**: `elastic-index-lrmwufitcheck>_aicandidatemeal-deleted`

When a `aicandidatemeal` is deleted from the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `candidateMealReAiSessionHistory` function to handle dependent data cleanup or updates.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: nutritionday-created

**Event Topic**: `elastic-index-lrmwufitcheck_nutritionday-created`

When a `nutritionday` is created in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `dailyProgressViewAggregateData` function to enrich and store the final document in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: nutritionday-updated

**Event Topic**: `elastic-index-lrmwufitcheck_nutritionday-updated`

When a `nutritionday` is updated in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `dailyProgressViewAggregateData` function to update the enriched document in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: nutritionday-deleted

**Event Topic**: `elastic-index-lrmwufitcheck>_nutritionday-deleted`

When a `nutritionday` is deleted in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `dailyProgressViewAggregateData` function to handle removal or cleanup in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: user-created

**Event Topic**: `elastic-index-user-created`

When a `user` is created in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `userProfileReDailyProgressView` function to update dependent documents in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: user-updated

**Event Topic**: `elastic-index-lrmwufitcheck>_user-updated`

When a `user` is updated in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `userProfileReDailyProgressView` function to re-enrich dependent data in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: user-deleted

**Event Topic**: `elastic-index-lrmwufitcheck>_user-deleted`

When a `user` is deleted from the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `userProfileReDailyProgressView` function to handle dependent data cleanup or updates.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: nutritionday-created

**Event Topic**: `elastic-index-lrmwufitcheck_nutritionday-created`

When a `nutritionday` is created in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `weeklyAnalyticsViewAggregateData` function to enrich and store the final document in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: nutritionday-updated

**Event Topic**: `elastic-index-lrmwufitcheck_nutritionday-updated`

When a `nutritionday` is updated in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `weeklyAnalyticsViewAggregateData` function to update the enriched document in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: nutritionday-deleted

**Event Topic**: `elastic-index-lrmwufitcheck>_nutritionday-deleted`

When a `nutritionday` is deleted in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `weeklyAnalyticsViewAggregateData` function to handle removal or cleanup in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: nutritionday-created

**Event Topic**: `elastic-index-lrmwufitcheck_nutritionday-created`

When a `nutritionday` is created in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `monthlyAnalyticsViewAggregateData` function to enrich and store the final document in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: nutritionday-updated

**Event Topic**: `elastic-index-lrmwufitcheck_nutritionday-updated`

When a `nutritionday` is updated in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `monthlyAnalyticsViewAggregateData` function to update the enriched document in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: nutritionday-deleted

**Event Topic**: `elastic-index-lrmwufitcheck>_nutritionday-deleted`

When a `nutritionday` is deleted in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `monthlyAnalyticsViewAggregateData` function to handle removal or cleanup in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: nutritionday-created

**Event Topic**: `elastic-index-lrmwufitcheck_nutritionday-created`

When a `nutritionday` is created in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `dailyNutritionSummaryNotificationViewAggregateData` function to enrich and store the final document in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: nutritionday-updated

**Event Topic**: `elastic-index-lrmwufitcheck_nutritionday-updated`

When a `nutritionday` is updated in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `dailyNutritionSummaryNotificationViewAggregateData` function to update the enriched document in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: nutritionday-deleted

**Event Topic**: `elastic-index-lrmwufitcheck>_nutritionday-deleted`

When a `nutritionday` is deleted in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `dailyNutritionSummaryNotificationViewAggregateData` function to handle removal or cleanup in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: user-created

**Event Topic**: `elastic-index-user-created`

When a `user` is created in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `userProfileReDailyNutritionSummaryNotificationView` function to update dependent documents in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: user-updated

**Event Topic**: `elastic-index-lrmwufitcheck>_user-updated`

When a `user` is updated in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `userProfileReDailyNutritionSummaryNotificationView` function to re-enrich dependent data in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: user-deleted

**Event Topic**: `elastic-index-lrmwufitcheck>_user-deleted`

When a `user` is deleted from the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `userProfileReDailyNutritionSummaryNotificationView` function to handle dependent data cleanup or updates.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: user-created

**Event Topic**: `elastic-index-lrmwufitcheck_user-created`

When a `user` is created in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `dailyMealReminderNotificationViewAggregateData` function to enrich and store the final document in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: user-updated

**Event Topic**: `elastic-index-lrmwufitcheck_user-updated`

When a `user` is updated in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `dailyMealReminderNotificationViewAggregateData` function to update the enriched document in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: user-deleted

**Event Topic**: `elastic-index-lrmwufitcheck>_user-deleted`

When a `user` is deleted in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `dailyMealReminderNotificationViewAggregateData` function to handle removal or cleanup in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: nutritionday-created

**Event Topic**: `elastic-index-nutritionday-created`

When a `nutritionday` is created in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `todayNutritionDayReDailyMealReminderNotificationView` function to update dependent documents in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: nutritionday-updated

**Event Topic**: `elastic-index-lrmwufitcheck>_nutritionday-updated`

When a `nutritionday` is updated in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `todayNutritionDayReDailyMealReminderNotificationView` function to re-enrich dependent data in the related index.

**Expected Payload**:

```json
{
  "id": "String"
}
```

### Kafka Event Listener: nutritionday-deleted

**Event Topic**: `elastic-index-lrmwufitcheck>_nutritionday-deleted`

When a `nutritionday` is deleted from the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `todayNutritionDayReDailyMealReminderNotificationView` function to handle dependent data cleanup or updates.

**Expected Payload**:

```json
{
  "id": "String"
}
```
