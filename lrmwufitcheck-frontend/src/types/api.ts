/**
 * Common Mindbricks API types and interfaces
 * Auto-generated from project definition — DO NOT EDIT.
 *
 * AI agents: READ-ONLY. This file is overwritten on every codegen run.
 * Add custom types as NEW files in this folder (e.g. `ui-types.ts`,
 * `domain.ts`) — any file whose name doesn't match Genesis's generated set
 * (currently just `api.ts`) survives rebuilds.
 */

// ---------------------------------------------------------------------------
// Base response envelope
// ---------------------------------------------------------------------------

export interface MindbricksResponse {
  status: "OK";
  statusCode: number;
  httpStatus?: number;
  elapsedMs?: number;
  source?: "db" | "cache";
  cacheKey?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  dataName?: string;
  method?: string;
  action?: "create" | "get" | "list" | "update" | "delete" | string;
  appVersion?: string;
  rowCount?: number;
  paging?: MindbricksPaging;
  filters?: unknown[];
  [key: string]: unknown;
}

export interface MindbricksUpdateEnvelope extends MindbricksResponse {
  oldDataValues?: Record<string, unknown>;
  newDataValues?: Record<string, unknown>;
}

export interface MindbricksError {
  result: "ERR";
  status: number;
  message: string;
  errCode: string | number;
  date: string;
  detail?: string;
}

export interface MindbricksPaging {
  pageNumber: number;
  pageRowCount: number;
  totalRowCount: number;
  pageCount: number;
}

// Universal transport flags read off `req.query` by requestIdStamper.js on
// every request, regardless of CRUD type or HTTP method. `getJoins` toggles
// FK join expansion in the response. The catchall index signature lets
// dynamic filter-builder UIs and any per-API query field flow through
// without TS errors. Used as the base for `ListParams` and intersected
// onto non-paginated GET signatures that carry declared query params.
export interface RequestParams {
  getJoins?: boolean;
  [key: string]: string | number | boolean | undefined;
}

// Paginated-list query params on top of the universal transport flags.
// `pageNumber` / `pageRowCount` are read by requestIdStamper.js but only
// the list codepath consumes `apiManager.pagination`, so we expose them
// here (not on RequestParams) to avoid advertising pagination on routes
// that don't paginate. Sorting on standard list APIs is hardcoded at
// codegen from `listOptions.listSortBy` — request-side `sortBy` /
// `sortOrder` are silently dropped by the backend, so they're omitted.
// Full-text `q` belongs to BFF DataViews only, not regular list APIs.
export interface ListParams extends RequestParams {
  pageNumber?: number;
  pageRowCount?: number;
}

// ---------------------------------------------------------------------------
// Auth / User
// ---------------------------------------------------------------------------

export interface User {
  id: string;

  email: string;

  fullname: string;

  avatar?: string;

  roleId: string;

  emailVerified: boolean;

  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Forward-compat safety net: every column from the auth `user` dataObject
  // (incl. custom additionals) is enumerated above, so this index signature
  // only catches BE schema changes that haven't yet been regenerated FE-side.
  [key: string]: unknown;
}

/**
 * Browser/device summary attached to login + current-user responses.
 */
export interface SessionAgent {
  deviceType?: string;
  os?: string;
  osVersion?: string;
  browserName?: string;
  browserVersion?: string;
  architecture?: string | null;
  model?: string | null;
  vendor?: string;
}

/**
 * Response shape for `POST /login`, `POST /relogin`, and the social-login
 * exchange. Auth responses do NOT use the standard `{ status: "OK", user: {...} }`
 * envelope — instead user/session fields are returned FLAT at the top level
 * alongside `accessToken` and several bucket / event tokens. Custom user
 * properties defined in the project (age, bio, location, …) are included flat
 * too — read them via the index signature.
 */
export interface SessionResponse {
  status: "OK";
  accessToken: string;

  // Session identity
  sessionId: string;
  userId: string;
  appCodename?: string;
  isAbsolute?: boolean;

  // User core fields (returned flat, not under `user`)
  email?: string;
  fullname?: string;
  avatar?: string;
  roleId: string;
  mobile?: string;
  emailVerified?: boolean;
  mobileVerified?: boolean;
  registeredAt?: string;
  loginAt?: string;

  // Login telemetry
  loginIp?: string;
  city?: string;
  country?: string;
  localDateTime?: string;
  gmtOffset?: string;
  timeZoneCode?: string;
  agent?: SessionAgent;

  checkTokenMark?: string;

  // Multi-tenant: resolved tenant codename (when applicable)
  tenantCodename?: string;

  // Custom user properties from project config + any other backend-added fields
  [key: string]: unknown;
}

/**
 * Response shape for `GET /currentuser`. Same flat fields as `SessionResponse`
 * plus a few session-store metadata fields. When the user is not logged in,
 * the endpoint instead returns HTTP 401 with `NoLoginResponse` and the auth
 * service maps that to `null` in `getCurrentUser()`.
 */
export interface CurrentUserResponse extends SessionResponse {
  source?: "redis" | "db" | "cache";
  expiresAt?: string;
  lastActiveAt?: string;
  lastActiveIp?: string;
}

/**
 * Response shape for `POST /logout`. Always `{ status: "OK" }`.
 */
export interface LogoutResponse {
  status: "OK";
}

/**
 * Returned by `GET /currentuser` with HTTP 401 when no session is active.
 * Note this is NOT a MindbricksError envelope (no `result`, `errCode`, or
 * `detail`). The auth service catches this case and returns `null` instead of
 * throwing, so callers should not see this shape directly.
 */
export interface NoLoginResponse {
  status: "ERR";
  message: string;
}

/**
 * One session record as returned by `GET /getusersessions`.
 * Same flat shape as the session envelope but without `accessToken` / bucket
 * tokens; adds `source` (where it was loaded from), `expiresAt`, lastActive
 * fields, and `currentOne: true` flag on the caller's active session.
 *
 * The endpoint returns a bare `UserSessionRecord[]` — no envelope.
 */
export interface UserSessionRecord {
  sessionId: string;
  userId: string;
  appCodename?: string;
  isAbsolute?: boolean;
  email?: string;
  fullname?: string;
  avatar?: string;
  roleId?: string;
  emailVerified?: boolean;
  registeredAt?: string;
  loginAt?: string;
  loginIp?: string;
  city?: string;
  country?: string;
  localDateTime?: string;
  gmtOffset?: string;
  timeZoneCode?: string;
  agent?: SessionAgent;
  checkTokenMark?: string;
  source?: "redis" | "db" | "cache";
  expiresAt?: string;
  lastActiveAt?: string;
  lastActiveIp?: string;
  /** True only for the session that owns the current request. */
  currentOne?: boolean;
  [key: string]: unknown;
}

/**
 * One login-history entry as returned by `GET /getuserhistory`.
 * The endpoint returns a bare `UserHistoryEntry[]` — no envelope.
 */
export interface UserHistoryEntry {
  ip?: string;
  city?: string;
  country?: string;
  localDateTime?: string;
  gmtOffset?: string;
  timeZoneCode?: string;
  agent?: SessionAgent;
  loginAt?: string;
  [key: string]: unknown;
}

export interface UserResponse extends MindbricksResponse {
  user: User;
}

export interface UsersResponse extends MindbricksResponse {
  users: User[];
}

export interface UserListResponse extends MindbricksResponse {
  users: User[];
}

export interface RegisterResponse extends MindbricksResponse {
  user: User;
  accessToken?: string;
  emailVerificationNeeded?: boolean;
  mobileVerificationNeeded?: boolean;
}

export interface VerificationStartResponse {
  status: "OK";
  codeIndex?: number;
  timeStamp?: number;
  date?: string;
  expireTime?: number;
  verificationType?: string;
  secretCode?: number;
  userId?: string;
}

export interface VerificationCompleteResponse {
  status: "OK";
  isVerified: boolean;
}

// ---------------------------------------------------------------------------
// Bucket
// ---------------------------------------------------------------------------

export interface BucketFileMetadata {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  accessKey: string;
  ownerId?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface BucketUploadResponse {
  status: "OK";
  action: "upload";
  bucket: string;
  file: BucketFileMetadata;
}

// ---------------------------------------------------------------------------
// AuthUserAvatarsFile
// ---------------------------------------------------------------------------

export interface AuthUserAvatarsFile {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  accessKey: string;
  ownerId?: string;
  fileData: unknown;
  metadata?: Record<string, unknown>;
  scanStatus: string;
  scanResult?: string;
  scannedAt?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthUserAvatarsFileResponse extends MindbricksResponse {
  userAvatarsFile: AuthUserAvatarsFile;
}

export interface AuthUserAvatarsFileListResponse extends MindbricksResponse {
  userAvatarsFiles: AuthUserAvatarsFile[];
}

// ---------------------------------------------------------------------------
// InvitationcenterInviteLink
// ---------------------------------------------------------------------------

export interface InvitationcenterInviteLink {
  id: string;
  ownerUserId: string;
  inviteCode: string;
  invitedEmail?: string;
  usageMode: "singleUse" | "limitedUse";
  usageLimit?: number;
  usageCount: number;
  inviteState:
    | "draft"
    | "active"
    | "exhausted"
    | "revoked"
    | "expired"
    | "consumed";
  expiresAt?: string;
  lastUsedAt?: string;
  registeredUserId?: string;
  deliveryRequestedAt?: string;
  lastDeliveredAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvitationcenterInviteLinkResponse extends MindbricksResponse {
  inviteLink: InvitationcenterInviteLink;
}

export interface InvitationcenterInviteLinkListResponse
  extends MindbricksResponse {
  inviteLinks: InvitationcenterInviteLink[];
}

// ---------------------------------------------------------------------------
// InvitationcenterInviteAudit
// ---------------------------------------------------------------------------

export interface InvitationcenterInviteAudit {
  id: string;
  inviteLinkId: string;
  eventType:
    | "created"
    | "activated"
    | "delivered"
    | "validated"
    | "consumed"
    | "revoked"
    | "expired";
  eventAt: string;
  actorUserId?: string;
  eventNote?: string;
  relatedEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvitationcenterInviteAuditResponse
  extends MindbricksResponse {
  inviteAudit: InvitationcenterInviteAudit;
}

export interface InvitationcenterInviteAuditListResponse
  extends MindbricksResponse {
  inviteAudits: InvitationcenterInviteAudit[];
}

// ---------------------------------------------------------------------------
// NutritionlibraryMacroTarget
// ---------------------------------------------------------------------------

export interface NutritionlibraryMacroTarget {
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

export interface NutritionlibraryMacroTargetResponse
  extends MindbricksResponse {
  macroTarget: NutritionlibraryMacroTarget;
}

export interface NutritionlibraryMacroTargetListResponse
  extends MindbricksResponse {
  macroTargets: NutritionlibraryMacroTarget[];
}

// ---------------------------------------------------------------------------
// NutritionlibraryFoodItem
// ---------------------------------------------------------------------------

export interface NutritionlibraryFoodItem {
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
  creationSource: "manualEntry" | "aiAssistant";
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface NutritionlibraryFoodItemResponse extends MindbricksResponse {
  foodItem: NutritionlibraryFoodItem;
}

export interface NutritionlibraryFoodItemListResponse
  extends MindbricksResponse {
  foodItems: NutritionlibraryFoodItem[];
}

// ---------------------------------------------------------------------------
// NutritionlibraryPresetMeal
// ---------------------------------------------------------------------------

export interface NutritionlibraryPresetMeal {
  id: string;
  userId: string;
  templateName: string;
  descriptionText?: string;
  presetCategory?: string | null;
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

export interface NutritionlibraryPresetMealResponse extends MindbricksResponse {
  presetMeal: NutritionlibraryPresetMeal;
}

export interface NutritionlibraryPresetMealListResponse
  extends MindbricksResponse {
  presetMeals: NutritionlibraryPresetMeal[];
}

// ---------------------------------------------------------------------------
// NutritionlibraryPresetLine
// ---------------------------------------------------------------------------

export interface NutritionlibraryPresetLine {
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

export interface NutritionlibraryPresetLineResponse extends MindbricksResponse {
  presetLine: NutritionlibraryPresetLine;
}

export interface NutritionlibraryPresetLineListResponse
  extends MindbricksResponse {
  presetLines: NutritionlibraryPresetLine[];
}

// ---------------------------------------------------------------------------
// MealtrackerMealLog
// ---------------------------------------------------------------------------

export interface MealtrackerMealLog {
  id: string;
  userId: string;
  mealDate: string;
  mealTime: string;
  slotName: string;
  logSource: "foodLibrary" | "presetTemplate" | "manualEntry" | "aiAssistant";
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

export interface MealtrackerMealLogResponse extends MindbricksResponse {
  mealLog: MealtrackerMealLog;
}

export interface MealtrackerMealLogListResponse extends MindbricksResponse {
  mealLogs: MealtrackerMealLog[];
}

// ---------------------------------------------------------------------------
// MealtrackerMealLine
// ---------------------------------------------------------------------------

export interface MealtrackerMealLine {
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
  lineSource:
    | "foodLibrary"
    | "presetTemplate"
    | "manualEntry"
    | "aiAssistant"
    | "temporaryAi";
  createdAt?: string;
  updatedAt?: string;
}

export interface MealtrackerMealLineResponse extends MindbricksResponse {
  mealLine: MealtrackerMealLine;
}

export interface MealtrackerMealLineListResponse extends MindbricksResponse {
  mealLines: MealtrackerMealLine[];
}

// ---------------------------------------------------------------------------
// MealtrackerNutritionDay
// ---------------------------------------------------------------------------

export interface MealtrackerNutritionDay {
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

export interface MealtrackerNutritionDayResponse extends MindbricksResponse {
  nutritionDay: MealtrackerNutritionDay;
}

export interface MealtrackerNutritionDayListResponse
  extends MindbricksResponse {
  nutritionDays: MealtrackerNutritionDay[];
}

// ---------------------------------------------------------------------------
// NutritionaiAiSession
// ---------------------------------------------------------------------------

export interface NutritionaiAiSession {
  id: string;
  userId: string;
  sessionType: "mealParsing" | "nutritionGuidance";
  inputText: string;
  detectedLanguage?: string;
  sessionState: "pending" | "needsConfirmation" | "completed" | "failed";
  confidenceScore?: number;
  finalResponseText?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NutritionaiAiSessionResponse extends MindbricksResponse {
  aiSession: NutritionaiAiSession;
}

export interface NutritionaiAiSessionListResponse extends MindbricksResponse {
  aiSessions: NutritionaiAiSession[];
}

// ---------------------------------------------------------------------------
// NutritionaiAiCandidateMeal
// ---------------------------------------------------------------------------

export interface NutritionaiAiCandidateMeal {
  id: string;
  userId: string;
  aiSessionId: string;
  proposedMealDate?: string;
  proposedMealTime?: string;
  proposedSlotName?: string;
  candidateSource: "aiAssistant";
  warningText?: string;
  confirmationRequired: boolean;
  isConfirmed: boolean;
  isCommitted: boolean;
  totalCalories?: number;
  totalProtein?: number;
  totalCarbohydrates?: number;
  totalFat?: number;
  totalSugar?: number;
  totalFiber?: number;
  committedMealLogId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NutritionaiAiCandidateMealResponse extends MindbricksResponse {
  aiCandidateMeal: NutritionaiAiCandidateMeal;
}

export interface NutritionaiAiCandidateMealListResponse
  extends MindbricksResponse {
  aiCandidateMeals: NutritionaiAiCandidateMeal[];
}

// ---------------------------------------------------------------------------
// NutritionaiAiCandidateLine
// ---------------------------------------------------------------------------

export interface NutritionaiAiCandidateLine {
  id: string;
  userId: string;
  aiCandidateMealId: string;
  detectedFoodName: string;
  estimatedGrams: number;
  estimatedCalories?: number;
  estimatedProtein?: number;
  estimatedCarbohydrates?: number;
  estimatedFat?: number;
  estimatedSugar?: number;
  estimatedFiber?: number;
  quantityConfidence?: number;
  nutritionReference?: string;
  saveAsFood: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface NutritionaiAiCandidateLineResponse extends MindbricksResponse {
  aiCandidateLine: NutritionaiAiCandidateLine;
}

export interface NutritionaiAiCandidateLineListResponse
  extends MindbricksResponse {
  aiCandidateLines: NutritionaiAiCandidateLine[];
}

// ---------------------------------------------------------------------------
// NutritionaiAiGuidanceNote
// ---------------------------------------------------------------------------

export interface NutritionaiAiGuidanceNote {
  id: string;
  userId: string;
  aiSessionId: string;
  questionType: string;
  contextRange: string;
  answerSummary: string;
  rationaleText?: string;
  referencedMetricKeys?: string;
  cautionText?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NutritionaiAiGuidanceNoteResponse extends MindbricksResponse {
  aiGuidanceNote: NutritionaiAiGuidanceNote;
}

export interface NutritionaiAiGuidanceNoteListResponse
  extends MindbricksResponse {
  aiGuidanceNotes: NutritionaiAiGuidanceNote[];
}

// ---------------------------------------------------------------------------
// AgenthubSys_agentOverride
// ---------------------------------------------------------------------------

export interface AgenthubSys_agentOverride {
  id: string;
  agentName: string;
  provider?: string;
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: string;
  selectedTools?: Record<string, unknown>;
  guardrails?: Record<string, unknown>;
  enabled: boolean;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AgenthubSys_agentOverrideResponse extends MindbricksResponse {
  sys_agentOverride: AgenthubSys_agentOverride;
}

export interface AgenthubSys_agentOverrideListResponse
  extends MindbricksResponse {
  sys_agentOverrides: AgenthubSys_agentOverride[];
}

// ---------------------------------------------------------------------------
// AgenthubSys_agentExecution
// ---------------------------------------------------------------------------

export interface AgenthubSys_agentExecution {
  id: string;
  agentName: string;
  agentType: "design" | "dynamic";
  source: "rest" | "sse" | "kafka" | "agent";
  userId?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  toolCalls?: number;
  tokenUsage?: Record<string, unknown>;
  durationMs?: number;
  status: "success" | "error" | "timeout";
  error?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AgenthubSys_agentExecutionResponse extends MindbricksResponse {
  sys_agentExecution: AgenthubSys_agentExecution;
}

export interface AgenthubSys_agentExecutionListResponse
  extends MindbricksResponse {
  sys_agentExecutions: AgenthubSys_agentExecution[];
}

// ---------------------------------------------------------------------------
// AgenthubSys_toolCatalog
// ---------------------------------------------------------------------------

export interface AgenthubSys_toolCatalog {
  id: string;
  toolName: string;
  serviceName: string;
  description?: string;
  parameters?: Record<string, unknown>;
  lastRefreshed?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AgenthubSys_toolCatalogResponse extends MindbricksResponse {
  sys_toolCatalog: AgenthubSys_toolCatalog;
}

export interface AgenthubSys_toolCatalogListResponse
  extends MindbricksResponse {
  sys_toolCatalogs: AgenthubSys_toolCatalog[];
}

// ---------------------------------------------------------------------------
// AgenthubSys_agentConversation
// ---------------------------------------------------------------------------

export interface AgenthubSys_agentConversation {
  id: string;
  sessionId: string;
  agentName: string;
  userId?: string;
  messages: Record<string, unknown>;
  messageCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AgenthubSys_agentConversationResponse
  extends MindbricksResponse {
  sys_agentConversation: AgenthubSys_agentConversation;
}

export interface AgenthubSys_agentConversationListResponse
  extends MindbricksResponse {
  sys_agentConversations: AgenthubSys_agentConversation[];
}

// ---------------------------------------------------------------------------
// SSE (Server-Sent Events) types
// ---------------------------------------------------------------------------

/** Stream mode — emitted first with metadata about the stream */
export interface SseMetaEvent {
  dataName: string;
  action: string;
  chunkSize: number;
  [key: string]: unknown;
}

/** Stream mode — emitted for each data chunk */
export interface SseChunkEvent {
  index: number;
  count: number;
  [key: string]: unknown;
}

/** Stream mode — emitted when all chunks have been sent */
export interface SseCompleteEvent {
  totalChunks: number;
  totalRows: number;
  [key: string]: unknown;
}

/** Events mode — emitted during long-running operations. Extra data is spread flat. */
export interface SseProgressEvent {
  step: string;
  message: string;
  [key: string]: unknown;
}

/** Events mode — emitted with the final operation result */
export interface SseResultEvent {
  httpStatus: number;
  [key: string]: unknown;
}

/** Error event from the SSE stream */
export interface SseErrorEvent {
  message: string;
  code?: string;
  httpStatus?: number;
}

/** Callback handlers for SSE stream events */
export interface SseEventHandlers {
  onMeta?: (data: SseMetaEvent) => void;
  onChunk?: (data: SseChunkEvent) => void;
  onComplete?: (data: SseCompleteEvent) => void;
  onProgress?: (data: SseProgressEvent) => void;
  onResult?: (data: SseResultEvent) => void;
  onError?: (error: SseErrorEvent) => void;
}

// ---------------------------------------------------------------------------
// BFF types
// ---------------------------------------------------------------------------

export type BffOperator =
  | "eq"
  | "ne"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "contains"
  | "startsWith"
  | "in"
  | "between"
  | "exists";

export type BffFilter = {
  [field: string]: {
    operator: BffOperator;
    value?: string | number | boolean;
    values?: Array<string | number | boolean>;
  };
};

export interface BffCountResponse {
  total: number;
}

// ---------------------------------------------------------------------------
// BFF DataView interfaces
// ---------------------------------------------------------------------------

export interface inviteLinkDeliveredNotificationView {
  id: string;

  inviteCode?: string;

  invitedEmail?: string;

  usageMode?: "singleUse" | "limitedUse";

  usageLimit?: number;

  inviteState?:
    | "draft"
    | "active"
    | "exhausted"
    | "revoked"
    | "expired"
    | "consumed";

  expiresAt?: string;
}

export interface inviteLinkDeliveredNotificationViewListResponse {
  items?: inviteLinkDeliveredNotificationView[];
  total?: number;
  totalPage?: number;
  currentPage?: number;
  nextPage?: number | null;
  prevPage?: number | null;
  pageItem?: number;
  filters?: unknown[];
}

export interface inviteLinkListView {
  id: string;

  inviteCode?: string;

  invitedEmail?: string;

  usageMode?: "singleUse" | "limitedUse";

  usageLimit?: number;

  usageCount?: number;

  inviteState?:
    | "draft"
    | "active"
    | "exhausted"
    | "revoked"
    | "expired"
    | "consumed";

  expiresAt?: string;

  lastUsedAt?: string;

  registeredUserId?: string;

  deliveryRequestedAt?: string;

  lastDeliveredAt?: string;

  createdAt?: string | undefined;

  updatedAt?: string | undefined;

  isActive?: unknown;

  /** Joined from auth:user */
  registeredUser?: {
    id?: string;
    fullname?: string;
    email?: string;
  };
}

export interface inviteLinkListViewListResponse {
  items?: inviteLinkListView[];
  total?: number;
  totalPage?: number;
  currentPage?: number;
  nextPage?: number | null;
  prevPage?: number | null;
  pageItem?: number;
  filters?: unknown[];
}

export interface presetMealWithLines {
  id: string;

  userId?: string;

  templateName?: string;

  descriptionText?: string;

  totalCalories?: number;

  totalProtein?: number;

  totalCarbohydrates?: number;

  totalFat?: number;

  totalSugar?: number;

  totalFiber?: number;

  createdAt?: string | undefined;

  updatedAt?: string | undefined;

  /** Joined from nutritionLibrary:fooditem */
  foodItems?: Array<{
    id?: string;
    foodName?: string;
    caloriePer100g?: number;
    proteinPer100g?: number;
    carbohydratePer100g?: number;
    fatPer100g?: number;
    sugarPer100g?: number;
    fiberPer100g?: number;
    brandName?: string;
    foodCategory?: string;
  }>;

  /** Joined from nutritionLibrary:presetline */
  lines?: Array<{
    id?: string;
    foodItemId?: string;
    lineFoodName?: string;
    gramAmount?: number;
    lineCalories?: number;
    lineProtein?: number;
    lineCarbohydrates?: number;
    lineFat?: number;
    lineSugar?: number;
    lineFiber?: number;
  }>;
}

export interface presetMealWithLinesListResponse {
  items?: presetMealWithLines[];
  total?: number;
  totalPage?: number;
  currentPage?: number;
  nextPage?: number | null;
  prevPage?: number | null;
  pageItem?: number;
  filters?: unknown[];
}

export interface foodItemList {
  id: string;

  userId?: string;

  foodName?: string;

  caloriePer100g?: number;

  proteinPer100g?: number;

  carbohydratePer100g?: number;

  fatPer100g?: number;

  sugarPer100g?: number;

  fiberPer100g?: number;

  brandName?: string;

  foodCategory?: string;

  creationSource?: "manualEntry" | "aiAssistant";

  createdAt?: string | undefined;

  updatedAt?: string | undefined;

  /** Aggregation stat from nutritionLibrary:foodItem */
  rowCount?: {
    rowCount?: number;
  };
}

export interface foodItemListListResponse {
  items?: foodItemList[];
  total?: number;
  totalPage?: number;
  currentPage?: number;
  nextPage?: number | null;
  prevPage?: number | null;
  pageItem?: number;
  filters?: unknown[];
}

export interface aiCandidateMealWithLines {
  id: string;

  userId?: string;

  aiSessionId?: string;

  proposedMealDate?: string;

  proposedMealTime?: string;

  proposedSlotName?: string;

  candidateSource?: "aiAssistant";

  warningText?: string;

  confirmationRequired?: boolean;

  isConfirmed?: boolean;

  isCommitted?: boolean;

  totalCalories?: number;

  totalProtein?: number;

  totalCarbohydrates?: number;

  totalFat?: number;

  totalSugar?: number;

  totalFiber?: number;

  committedMealLogId?: string;

  createdAt?: string | undefined;

  updatedAt?: string | undefined;

  /** Joined from nutritionAi:aisession */
  session?: {
    id?: string;
    sessionType?: "mealParsing" | "nutritionGuidance";
    inputText?: string;
    sessionState?: "pending" | "needsConfirmation" | "completed" | "failed";
    confidenceScore?: number;
    detectedLanguage?: string;
  };

  /** Joined from nutritionAi:aicandidateline */
  lines?: Array<{
    id?: string;
    detectedFoodName?: string;
    estimatedGrams?: number;
    estimatedCalories?: number;
    estimatedProtein?: number;
    estimatedCarbohydrates?: number;
    estimatedFat?: number;
    estimatedSugar?: number;
    estimatedFiber?: number;
    quantityConfidence?: number;
    nutritionReference?: string;
    saveAsFood?: boolean;
  }>;
}

export interface aiCandidateMealWithLinesListResponse {
  items?: aiCandidateMealWithLines[];
  total?: number;
  totalPage?: number;
  currentPage?: number;
  nextPage?: number | null;
  prevPage?: number | null;
  pageItem?: number;
  filters?: unknown[];
}

export interface mealLogWithLines {
  id: string;

  userId?: string;

  mealDate?: string;

  mealTime?: string;

  slotName?: string;

  logSource?: "foodLibrary" | "presetTemplate" | "manualEntry" | "aiAssistant";

  noteText?: string;

  totalCalories?: number;

  totalProtein?: number;

  totalCarbohydrates?: number;

  totalFat?: number;

  totalSugar?: number;

  totalFiber?: number;

  createdAt?: string | undefined;

  updatedAt?: string | undefined;

  /** Joined from mealTracker:mealline */
  mealLines?: Array<{
    id?: string;
    itemName?: string;
    consumedGrams?: number;
    itemCalories?: number;
    itemProtein?: number;
    itemCarbohydrates?: number;
    itemFat?: number;
    itemSugar?: number;
    itemFiber?: number;
    lineSource?:
      | "foodLibrary"
      | "presetTemplate"
      | "manualEntry"
      | "aiAssistant"
      | "temporaryAi";
    sourceFoodItemId?: string;
    sourcePresetMealId?: string;
  }>;
}

export interface mealLogWithLinesListResponse {
  items?: mealLogWithLines[];
  total?: number;
  totalPage?: number;
  currentPage?: number;
  nextPage?: number | null;
  prevPage?: number | null;
  pageItem?: number;
  filters?: unknown[];
}

export interface aiSessionHistory {
  id: string;

  userId?: string;

  sessionType?: "mealParsing" | "nutritionGuidance";

  inputText?: string;

  detectedLanguage?: string;

  sessionState?: "pending" | "needsConfirmation" | "completed" | "failed";

  confidenceScore?: number;

  finalResponseText?: string;

  createdAt?: string | undefined;

  updatedAt?: string | undefined;

  /** Joined from nutritionAi:aiguidancenote */
  guidanceNote?: {
    id?: string;
    questionType?: string;
    contextRange?: string;
    answerSummary?: string;
    cautionText?: string;
  };

  /** Joined from nutritionAi:aicandidatemeal */
  candidateMeal?: {
    id?: string;
    proposedMealDate?: string;
    proposedSlotName?: string;
    totalCalories?: number;
    confirmationRequired?: boolean;
    warningText?: string;
  };
}

export interface aiSessionHistoryListResponse {
  items?: aiSessionHistory[];
  total?: number;
  totalPage?: number;
  currentPage?: number;
  nextPage?: number | null;
  prevPage?: number | null;
  pageItem?: number;
  filters?: unknown[];
}

export interface dailyProgressView {
  id: string;

  userId?: string;

  summaryDate?: string;

  consumedCalories?: number;

  consumedProtein?: number;

  consumedCarbohydrates?: number;

  consumedFat?: number;

  consumedSugar?: number;

  consumedFiber?: number;

  targetCalories?: number;

  targetProtein?: number;

  targetCarbohydrates?: number;

  targetFat?: number;

  targetSugar?: number;

  targetFiber?: number;

  exceededMetrics?: string;

  mealCount?: number;

  createdAt?: string | undefined;

  updatedAt?: string | undefined;

  /** Joined from auth:user */
  userProfile?: {
    id?: string;
    fullname?: string;
    email?: string;
  };
}

export interface dailyProgressViewListResponse {
  items?: dailyProgressView[];
  total?: number;
  totalPage?: number;
  currentPage?: number;
  nextPage?: number | null;
  prevPage?: number | null;
  pageItem?: number;
  filters?: unknown[];
}

export interface weeklyAnalyticsView {
  summaryDate?: string;

  consumedCalories?: number;

  consumedProtein?: number;

  consumedCarbohydrates?: number;

  consumedFat?: number;

  consumedSugar?: number;

  consumedFiber?: number;

  targetCalories?: number;

  targetProtein?: number;

  targetCarbohydrates?: number;

  targetFat?: number;

  targetSugar?: number;

  targetFiber?: number;

  exceededMetrics?: string;

  mealCount?: number;

  /** Aggregation stat from mealTracker:nutritionDay */
  avgDailyCalories?: {
    avgDailyCalories?: number;
  };

  /** Aggregation stat from mealTracker:nutritionDay */
  avgDailyProtein?: {
    avgDailyProtein?: number;
  };

  /** Aggregation stat from mealTracker:nutritionDay */
  avgDailyCarbohydrates?: {
    avgDailyCarbohydrates?: number;
  };

  /** Aggregation stat from mealTracker:nutritionDay */
  avgDailyFat?: {
    avgDailyFat?: number;
  };

  /** Aggregation stat from mealTracker:nutritionDay */
  avgDailySugar?: {
    avgDailySugar?: number;
  };

  /** Aggregation stat from mealTracker:nutritionDay */
  avgDailyFiber?: {
    avgDailyFiber?: number;
  };

  /** Aggregation stat from mealTracker:nutritionDay */
  goalHitRateCalories?: {
    goalHitRateCalories?: number;
  };

  /** Aggregation stat from mealTracker:nutritionDay */
  goalHitRateProtein?: {
    goalHitRateProtein?: number;
  };

  /** Aggregation stat from mealTracker:nutritionDay */
  goalHitRateCarbohydrates?: {
    goalHitRateCarbohydrates?: number;
  };

  /** Aggregation stat from mealTracker:nutritionDay */
  goalHitRateFat?: {
    goalHitRateFat?: number;
  };

  /** Aggregation stat from mealTracker:nutritionDay */
  goalHitRateSugar?: {
    goalHitRateSugar?: number;
  };

  /** Aggregation stat from mealTracker:nutritionDay */
  goalHitRateFiber?: {
    goalHitRateFiber?: number;
  };
}

export interface weeklyAnalyticsViewListResponse {
  items?: weeklyAnalyticsView[];
  total?: number;
  totalPage?: number;
  currentPage?: number;
  nextPage?: number | null;
  prevPage?: number | null;
  pageItem?: number;
  filters?: unknown[];
}

export interface monthlyAnalyticsView {
  summaryDate?: string;

  consumedCalories?: number;

  consumedProtein?: number;

  consumedCarbohydrates?: number;

  consumedFat?: number;

  consumedSugar?: number;

  consumedFiber?: number;

  targetCalories?: number;

  targetProtein?: number;

  targetCarbohydrates?: number;

  targetFat?: number;

  targetSugar?: number;

  targetFiber?: number;

  exceededMetrics?: string;

  mealCount?: number;

  /** Aggregation stat from mealTracker:nutritionDay */
  avgDailyCalories?: {
    avgDailyCalories?: number;
  };

  /** Aggregation stat from mealTracker:nutritionDay */
  avgDailyProtein?: {
    avgDailyProtein?: number;
  };

  /** Aggregation stat from mealTracker:nutritionDay */
  avgDailyCarbohydrates?: {
    avgDailyCarbohydrates?: number;
  };

  /** Aggregation stat from mealTracker:nutritionDay */
  avgDailySugar?: {
    avgDailySugar?: number;
  };

  /** Aggregation stat from mealTracker:nutritionDay */
  avgDailyFat?: {
    avgDailyFat?: number;
  };

  /** Aggregation stat from mealTracker:nutritionDay */
  avgDailyFiber?: {
    avgDailyFiber?: number;
  };

  /** Aggregation stat from mealTracker:nutritionDay */
  goalHitRateProtein?: {
    goalHitRateProtein?: number;
  };

  /** Aggregation stat from mealTracker:nutritionDay */
  goalHitRateCarbohydrates?: {
    goalHitRateCarbohydrates?: number;
  };

  /** Aggregation stat from mealTracker:nutritionDay */
  goalHitRateCalories?: {
    goalHitRateCalories?: number;
  };

  /** Aggregation stat from mealTracker:nutritionDay */
  goalHitRateFat?: {
    goalHitRateFat?: number;
  };

  /** Aggregation stat from mealTracker:nutritionDay */
  goalHitRateSugar?: {
    goalHitRateSugar?: number;
  };

  /** Aggregation stat from mealTracker:nutritionDay */
  goalHitRateFiber?: {
    goalHitRateFiber?: number;
  };
}

export interface monthlyAnalyticsViewListResponse {
  items?: monthlyAnalyticsView[];
  total?: number;
  totalPage?: number;
  currentPage?: number;
  nextPage?: number | null;
  prevPage?: number | null;
  pageItem?: number;
  filters?: unknown[];
}

export interface dailyNutritionSummaryNotificationView {
  userId?: string;

  summaryDate?: string;

  consumedCalories?: number;

  consumedProtein?: number;

  consumedCarbohydrates?: number;

  consumedFat?: number;

  consumedSugar?: number;

  consumedFiber?: number;

  targetCalories?: number;

  targetProtein?: number;

  targetCarbohydrates?: number;

  targetFat?: number;

  targetSugar?: number;

  targetFiber?: number;

  exceededMetrics?: string;

  mealCount?: number;

  /** Joined from auth:user */
  userProfile?: {
    id?: string;
    fullname?: string;
    email?: string;
  };
}

export interface dailyNutritionSummaryNotificationViewListResponse {
  items?: dailyNutritionSummaryNotificationView[];
  total?: number;
  totalPage?: number;
  currentPage?: number;
  nextPage?: number | null;
  prevPage?: number | null;
  pageItem?: number;
  filters?: unknown[];
}

export interface dailyMealReminderNotificationView {
  id: string;

  fullname?: string;

  email?: string;

  /** Joined from mealTracker:nutritionday */
  todayNutritionDay?: {
    mealCount?: number;
  };
}

export interface dailyMealReminderNotificationViewListResponse {
  items?: dailyMealReminderNotificationView[];
  total?: number;
  totalPage?: number;
  currentPage?: number;
  nextPage?: number | null;
  prevPage?: number | null;
  pageItem?: number;
  filters?: unknown[];
}
