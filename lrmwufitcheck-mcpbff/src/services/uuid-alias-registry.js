/**
 * UUID Alias Registry
 *
 * Keeps a conversation-scoped in-memory map:
 * - alias -> UUID
 * - UUID  -> alias
 *
 * This allows the model to use readable IDs while backend tools keep UUID contracts.
 */

const logger = require("../common/logger");

const CONVERSATION_TTL_MS = parseInt(
  process.env.UUID_ALIAS_TTL_MS || `${60 * 60 * 1000}`,
  10,
); // 1 hour
const MAX_CONVERSATIONS = parseInt(
  process.env.UUID_ALIAS_MAX_CONVERSATIONS || "1000",
  10,
);
const MAX_TRAVERSAL_DEPTH = parseInt(
  process.env.UUID_ALIAS_MAX_DEPTH || "24",
  10,
);
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const conversationMaps = new Map();

function isUuid(value) {
  return typeof value === "string" && UUID_REGEX.test(value);
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function sanitizeToken(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function sanitizePrefix(value) {
  return String(value || "")
    .replace(/[^a-zA-Z0-9_]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function getConversationId(userContext = {}) {
  return userContext.conversationId || userContext.sessionId || "default";
}

function touchConversation(mapState) {
  mapState.lastUsedAt = Date.now();
}

function cleanupStaleMaps() {
  const now = Date.now();
  for (const [conversationId, state] of conversationMaps.entries()) {
    if (now - state.lastUsedAt > CONVERSATION_TTL_MS) {
      conversationMaps.delete(conversationId);
    }
  }
}

function enforceMapLimit() {
  if (conversationMaps.size <= MAX_CONVERSATIONS) return;
  const oldest = [...conversationMaps.entries()].sort(
    (a, b) => a[1].lastUsedAt - b[1].lastUsedAt,
  );
  const overflow = conversationMaps.size - MAX_CONVERSATIONS;
  for (let i = 0; i < overflow; i++) {
    conversationMaps.delete(oldest[i][0]);
  }
}

function getOrCreateConversationMap(conversationId) {
  cleanupStaleMaps();
  enforceMapLimit();

  if (!conversationMaps.has(conversationId)) {
    conversationMaps.set(conversationId, {
      aliasToUuid: new Map(),
      uuidToAlias: new Map(),
      aliasCounters: new Map(),
      lastUsedAt: Date.now(),
    });
  }

  const state = conversationMaps.get(conversationId);
  touchConversation(state);
  return state;
}

function clearConversationMap(conversationId) {
  conversationMaps.delete(conversationId);
}

function isIdentifierKey(key = "") {
  const k = String(key || "").toLowerCase();
  return (
    k === "id" ||
    k === "uuid" ||
    k === "identifier" ||
    /(?:_?id|_?uuid|_?identifier)$/i.test(k)
  );
}

function buildPrefixFromKey(key = "", parentObjectKey = "") {
  const keyText = String(key || "");
  const lowerKey = keyText.toLowerCase();

  // Generic id key should use parent object name as prefix.
  if (lowerKey === "id" || lowerKey === "uuid" || lowerKey === "identifier") {
    const parentPrefix = sanitizePrefix(parentObjectKey);
    if (parentPrefix) return parentPrefix;
    return "id";
  }

  // customerId -> customer, ticket_type_uuid -> ticket_type
  const stripped = keyText.replace(/(?:_?id|_?uuid|_?identifier)$/i, "");
  const keyPrefix = sanitizePrefix(stripped);
  if (keyPrefix) return keyPrefix;

  const parentPrefix = sanitizePrefix(parentObjectKey);
  if (parentPrefix) return parentPrefix;
  return "id";
}

function getNamingHint(node) {
  if (!isObject(node)) return "";

  // Priority 1: Fields that tend to be unique, human-readable identifiers.
  const uniqueCandidates = [
    node.orderNumber,
    node.number,
    node.code,
    node.codename,
    node.email,
    node.username,
    node.barcode,
    node.sku,
    node.slug,
    node.reference,
    node.ticketNumber,
    node.invoiceNumber,
  ].filter(Boolean);
  if (uniqueCandidates.length > 0) return sanitizeToken(uniqueCandidates[0]);

  // Priority 2: Name-like fields (human-readable but not necessarily unique).
  const nameCandidates = [
    node.fullname,
    node.name,
    node.title,
    node.label,
  ].filter(Boolean);
  if (nameCandidates.length > 0) return sanitizeToken(nameCandidates[0]);

  // Priority 3: Service/object metadata.
  const metaCandidates = [
    node.serviceName,
    node.objectName,
    node.apiName,
  ].filter(Boolean);
  return sanitizeToken(metaCandidates[0] || "");
}

function allocateAlias(
  state,
  uuid,
  keyHint = "",
  valueHint = "",
  parentObjectKey = "",
) {
  if (state.uuidToAlias.has(uuid)) return state.uuidToAlias.get(uuid);

  const prefix = buildPrefixFromKey(keyHint, parentObjectKey);
  const numericCounterKey = `num:${prefix}`;
  let nextNumber = (state.aliasCounters.get(numericCounterKey) || 0) + 1;
  let alias = `${prefix}_${String(nextNumber).padStart(3, "0")}`;
  while (
    state.aliasToUuid.has(alias) &&
    state.aliasToUuid.get(alias) !== uuid
  ) {
    nextNumber += 1;
    alias = `${prefix}_${String(nextNumber).padStart(3, "0")}`;
  }
  state.aliasCounters.set(numericCounterKey, nextNumber);

  state.aliasToUuid.set(alias, uuid);
  state.uuidToAlias.set(uuid, alias);
  return alias;
}

function promoteAlias(
  state,
  uuid,
  keyHint = "",
  valueHint = "",
  parentObjectKey = "",
) {
  if (!valueHint) return state.uuidToAlias.get(uuid) || null;

  const prefix = buildPrefixFromKey(keyHint, parentObjectKey);
  const readableHint = sanitizeToken(valueHint);
  if (!readableHint) return state.uuidToAlias.get(uuid) || null;

  // Skip promotion when the hint is essentially the same word as the prefix
  // (e.g. prefix "order" + hint "ordering" → redundant "order_ordering").
  const prefixLower = prefix.toLowerCase();
  const hintLower = readableHint.toLowerCase();
  if (
    hintLower === prefixLower ||
    (hintLower.startsWith(prefixLower) &&
      hintLower.length - prefixLower.length <= 3)
  ) {
    return state.uuidToAlias.get(uuid) || null;
  }

  const baseAlias = `${prefix}_${readableHint}`;
  let promotedAlias = baseAlias;

  if (
    state.aliasToUuid.has(promotedAlias) &&
    state.aliasToUuid.get(promotedAlias) !== uuid
  ) {
    let suffix = 2;
    while (
      state.aliasToUuid.has(`${baseAlias}_${suffix}`) &&
      state.aliasToUuid.get(`${baseAlias}_${suffix}`) !== uuid
    ) {
      suffix += 1;
    }
    promotedAlias = `${baseAlias}_${suffix}`;
  }

  // Keep old alias as a valid synonym; switch primary alias to the promoted one.
  state.aliasToUuid.set(promotedAlias, uuid);
  state.uuidToAlias.set(uuid, promotedAlias);
  return promotedAlias;
}

function looksLikeAlias(value) {
  if (typeof value !== "string") return false;
  if (isUuid(value)) return false;
  // readable aliases such as customer_xcorp, ticketType_001, id_001
  return /^[a-z][a-z0-9_]{0,63}_[a-z0-9_]+$/i.test(value);
}

function shouldResolveStringForKey(key = "") {
  const k = String(key || "").toLowerCase();
  return (
    k === "id" ||
    k.endsWith("id") ||
    k.endsWith("uuid") ||
    k.includes("identifier")
  );
}

function resolveAliasesInArgs(userContext, args) {
  const conversationId = getConversationId(userContext);
  const state = getOrCreateConversationMap(conversationId);
  const unknownAliases = [];

  const visited = new WeakSet();
  function walk(node, key = "", depth = 0) {
    if (depth > MAX_TRAVERSAL_DEPTH) return node;
    if (Array.isArray(node)) {
      return node.map((item) => walk(item, key, depth + 1));
    }

    if (isObject(node)) {
      if (visited.has(node)) return node;
      visited.add(node);
      const out = {};
      for (const [childKey, childValue] of Object.entries(node)) {
        out[childKey] = walk(childValue, childKey, depth + 1);
      }
      return out;
    }

    if (typeof node === "string") {
      if (state.aliasToUuid.has(node)) {
        return state.aliasToUuid.get(node);
      }

      if (shouldResolveStringForKey(key) && looksLikeAlias(node)) {
        unknownAliases.push(node);
      }
    }

    return node;
  }

  const resolvedArgs = walk(args);
  touchConversation(state);

  if (unknownAliases.length > 0) {
    return {
      success: false,
      resolvedArgs,
      unknownAliases: [...new Set(unknownAliases)],
      knownAliases: [...state.aliasToUuid.keys()],
    };
  }

  return {
    success: true,
    resolvedArgs,
    unknownAliases: [],
    knownAliases: [...state.aliasToUuid.keys()],
  };
}

// Keys whose subtrees are passed verbatim to the frontend and must keep real UUIDs.
// The walker still *registers* UUIDs it finds here (so later tool calls can resolve
// the same alias), but it does NOT replace them with aliases.
const FRONTEND_PASSTHROUGH_KEYS = new Set(["__frontendAction"]);

function replaceUuidsWithAliases(userContext, payload) {
  const conversationId = getConversationId(userContext);
  const state = getOrCreateConversationMap(conversationId);

  function maybeAliasifyEmbeddedJsonText(
    value,
    key,
    parentObjectKey,
    walkFn,
    depth,
    insideFrontend,
  ) {
    if (typeof value !== "string") return value;
    if (key !== "text" || parentObjectKey !== "content") return value;

    const trimmed = value.trim();
    if (!trimmed || (!trimmed.startsWith("{") && !trimmed.startsWith("["))) {
      return value;
    }

    try {
      const parsed = JSON.parse(trimmed);
      const aliasedParsed = walkFn(
        parsed,
        key,
        "",
        parentObjectKey,
        depth + 1,
        insideFrontend,
      );
      return JSON.stringify(aliasedParsed);
    } catch (error) {
      return value;
    }
  }

  const visited = new WeakSet();
  function walk(
    node,
    key = "",
    parentHint = "",
    parentObjectKey = "",
    depth = 0,
    insideFrontend = false,
  ) {
    if (depth > MAX_TRAVERSAL_DEPTH) return node;

    const enteringFrontend =
      insideFrontend || FRONTEND_PASSTHROUGH_KEYS.has(key);

    if (Array.isArray(node)) {
      return node.map((item) =>
        walk(
          item,
          key,
          parentHint,
          parentObjectKey,
          depth + 1,
          enteringFrontend,
        ),
      );
    }

    if (isObject(node)) {
      if (visited.has(node)) return node;
      visited.add(node);
      const hint = getNamingHint(node) || parentHint;

      if (hint) {
        for (const [childKey, childValue] of Object.entries(node)) {
          if (isIdentifierKey(childKey) && isUuid(childValue)) {
            promoteAlias(state, childValue, childKey, hint, key);
          }
        }
      }

      const out = {};
      for (const [childKey, childValue] of Object.entries(node)) {
        out[childKey] = walk(
          childValue,
          childKey,
          hint,
          key,
          depth + 1,
          enteringFrontend || FRONTEND_PASSTHROUGH_KEYS.has(childKey),
        );
      }
      return out;
    }

    if (isUuid(node)) {
      allocateAlias(state, node, key, parentHint, parentObjectKey);
      if (enteringFrontend) return node;
      return state.uuidToAlias.get(node) || node;
    }

    if (typeof node === "string") {
      return maybeAliasifyEmbeddedJsonText(
        node,
        key,
        parentObjectKey,
        walk,
        depth,
        enteringFrontend,
      );
    }

    return node;
  }

  const aliased = walk(payload);
  touchConversation(state);
  return aliased;
}

function listAliases(userContext) {
  const conversationId = getConversationId(userContext);
  const state = getOrCreateConversationMap(conversationId);
  touchConversation(state);
  return [...state.aliasToUuid.entries()].map(([alias, uuid]) => ({
    alias,
    uuid,
  }));
}

function getAliasMapSummary(userContext, sampleSize = 5) {
  const aliases = listAliases(userContext);
  return {
    count: aliases.length,
    samples: aliases
      .slice(0, sampleSize)
      .map((item) => ({ alias: item.alias })),
  };
}

function registerAlias(userContext, alias, uuid) {
  if (!alias || !isUuid(uuid)) return;
  const conversationId = getConversationId(userContext);
  const state = getOrCreateConversationMap(conversationId);

  const safeAlias = sanitizeToken(alias);
  if (!safeAlias) return;

  state.aliasToUuid.set(safeAlias, uuid);
  state.uuidToAlias.set(uuid, safeAlias);
  touchConversation(state);
}

function getRegistryStats() {
  const now = Date.now();
  let activeConversations = 0;
  let totalAliases = 0;

  for (const [, state] of conversationMaps.entries()) {
    if (now - state.lastUsedAt <= CONVERSATION_TTL_MS) {
      activeConversations += 1;
      totalAliases += state.aliasToUuid.size;
    }
  }

  return {
    activeConversations,
    totalAliases,
    maxConversations: MAX_CONVERSATIONS,
    ttlMs: CONVERSATION_TTL_MS,
  };
}

module.exports = {
  isUuid,
  getConversationId,
  getOrCreateConversationMap,
  clearConversationMap,
  resolveAliasesInArgs,
  replaceUuidsWithAliases,
  listAliases,
  getAliasMapSummary,
  registerAlias,
  getRegistryStats,
};
