/**
 * Conversation Store - Elasticsearch Backend
 *
 * Persistent storage for conversation history using Elasticsearch.
 * Index: lrmwufitcheck_mcpchat
 */

const { Client } = require("@elastic/elasticsearch");
const logger = require("../common/logger");

// Elasticsearch configuration (matches nodejs2 pattern)
const ELASTIC_URI = process.env.ELASTIC_URI || "http://localhost:9200";
const ELASTIC_USER = process.env.ELASTIC_USER || "elastic";
const ELASTIC_PWD = process.env.ELASTIC_PWD || "zci+imLCfkbSC=RxLHjH";
const INDEX_NAME = process.env.ES_CHAT_INDEX || "lrmwufitcheck_mcpchat";

// Maximum messages per conversation
const MAX_MESSAGES = 200;

// Create Elasticsearch client (following nodejs2 pattern)
const getElasticParams = () => {
  return {
    node: ELASTIC_URI,
    requestTimeout: 10000,
    auth: ELASTIC_PWD
      ? {
          username: ELASTIC_USER,
          password: ELASTIC_PWD,
        }
      : undefined,
    tls: {
      rejectUnauthorized: false, // Allow self-signed certs
    },
  };
};

let esClient = null;
try {
  esClient = new Client(getElasticParams());
  logger.info(`Elasticsearch client created for: ${ELASTIC_URI}`);
} catch (err) {
  logger.error("Elasticsearch client creation failed:", err.message);
}

// Index mapping
const INDEX_MAPPING = {
  mappings: {
    properties: {
      id: { type: "keyword" },
      userId: { type: "keyword" },
      title: { type: "text", fields: { keyword: { type: "keyword" } } },
      messages: {
        type: "nested",
        properties: {
          role: { type: "keyword" },
          content: { type: "text" },
          segments: { type: "object", enabled: false }, // Store as-is
          toolCalls: { type: "object", enabled: false },
          timestamp: { type: "date" },
        },
      },
      messageCount: { type: "integer" },
      createdAt: { type: "date" },
      updatedAt: { type: "date" },
    },
  },
  settings: {
    number_of_shards: 1,
    number_of_replicas: 0,
  },
};

/**
 * Initialize the Elasticsearch index
 */
async function initializeIndex() {
  if (!esClient) {
    logger.warn(
      "Elasticsearch client not available, skipping index initialization",
    );
    return;
  }

  try {
    const exists = await esClient.indices.exists({ index: INDEX_NAME });

    if (!exists) {
      await esClient.indices.create({
        index: INDEX_NAME,
        body: INDEX_MAPPING,
      });
      logger.info(`Created Elasticsearch index: ${INDEX_NAME}`);
    } else {
      logger.info(`Elasticsearch index already exists: ${INDEX_NAME}`);
    }
  } catch (error) {
    logger.error("Failed to initialize Elasticsearch index:", error.message);
  }
}

/**
 * Generate document ID from conversationId and userId
 */
function getDocId(conversationId, userId) {
  return `${userId}_${conversationId}`;
}

/**
 * Generate a title from the first user message
 */
function generateTitle(messages) {
  const firstUserMessage = messages.find((m) => m.role === "user");
  if (!firstUserMessage) return "New Conversation";

  let content = "";
  if (firstUserMessage.content) {
    content = firstUserMessage.content;
  } else if (firstUserMessage.segments) {
    content = firstUserMessage.segments
      .filter((s) => s.type === "text")
      .map((s) => s.content)
      .join(" ");
  }

  if (content.length > 50) {
    return content.substring(0, 47) + "...";
  }
  return content || "New Conversation";
}

/**
 * Load a conversation from Elasticsearch
 */
async function loadConversation(userId, conversationId) {
  if (!esClient) {
    logger.warn("Elasticsearch client not available");
    return null;
  }

  try {
    const result = await esClient.get({
      index: INDEX_NAME,
      id: getDocId(conversationId, userId),
    });
    return result._source;
  } catch (error) {
    if (error.meta?.statusCode === 404) {
      return null;
    }
    logger.error(
      `Failed to load conversation ${conversationId}:`,
      error.message,
    );
    return null;
  }
}

/**
 * Save a conversation to Elasticsearch
 */
async function saveConversation(userId, conversationId, conversation) {
  if (!esClient) {
    logger.warn("Elasticsearch client not available, cannot save conversation");
    return;
  }

  try {
    await esClient.index({
      index: INDEX_NAME,
      id: getDocId(conversationId, userId),
      body: conversation,
      refresh: true,
    });
    logger.debug(`Saved conversation ${conversationId} for user ${userId}`);
  } catch (error) {
    logger.error(
      `Failed to save conversation ${conversationId}:`,
      error.message,
    );
    throw error;
  }
}

/**
 * Add a message to a conversation
 */
async function addMessage(conversationId, message, userId = "anonymous") {
  let conversation = await loadConversation(userId, conversationId);

  if (!conversation) {
    conversation = {
      id: conversationId,
      userId,
      title: null,
      messages: [],
      messageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  conversation.messages.push(message);
  conversation.messageCount = conversation.messages.length;
  conversation.updatedAt = new Date().toISOString();

  if (!conversation.title) {
    conversation.title = generateTitle(conversation.messages);
  }

  if (conversation.messages.length > MAX_MESSAGES) {
    conversation.messages = conversation.messages.slice(-MAX_MESSAGES);
    conversation.messageCount = conversation.messages.length;
  }

  await saveConversation(userId, conversationId, conversation);

  logger.debug(
    `Message added to conversation ${conversationId}, total: ${conversation.messageCount}`,
  );
}

/**
 * Get all messages from a conversation
 */
async function getMessages(conversationId, userId = "anonymous") {
  const conversation = await loadConversation(userId, conversationId);
  return conversation ? conversation.messages : [];
}

/**
 * Get recent messages from a conversation
 */
async function getRecentMessages(
  conversationId,
  count = 10,
  userId = "anonymous",
) {
  const conversation = await loadConversation(userId, conversationId);
  if (!conversation) return [];
  return conversation.messages.slice(-count);
}

/**
 * Get full conversation with metadata
 */
async function getConversation(conversationId, userId = "anonymous") {
  return await loadConversation(userId, conversationId);
}

/**
 * Clear/delete a conversation
 */
async function clearConversation(conversationId, userId = "anonymous") {
  if (!esClient) {
    logger.warn("Elasticsearch client not available");
    return false;
  }

  try {
    await esClient.delete({
      index: INDEX_NAME,
      id: getDocId(conversationId, userId),
      refresh: true,
    });
    logger.debug(`Conversation ${conversationId} deleted`);
    return true;
  } catch (error) {
    if (error.meta?.statusCode === 404) {
      return false;
    }
    logger.error(
      `Failed to delete conversation ${conversationId}:`,
      error.message,
    );
    return false;
  }
}

/**
 * Update conversation title
 */
async function updateTitle(conversationId, title, userId = "anonymous") {
  const conversation = await loadConversation(userId, conversationId);
  if (!conversation) return false;

  conversation.title = title;
  conversation.updatedAt = new Date().toISOString();
  await saveConversation(userId, conversationId, conversation);
  return true;
}

/**
 * Get conversation metadata
 */
async function getConversationInfo(conversationId, userId = "anonymous") {
  const conversation = await loadConversation(userId, conversationId);
  if (!conversation) return null;

  return {
    id: conversation.id,
    title: conversation.title,
    messageCount:
      conversation.messageCount || conversation.messages?.length || 0,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
}

/**
 * List all conversations for a user
 */
async function listConversations(userId = "anonymous", limit = 50, offset = 0) {
  if (!esClient) {
    logger.warn("Elasticsearch client not available");
    return { conversations: [], total: 0, limit, offset };
  }

  try {
    const result = await esClient.search({
      index: INDEX_NAME,
      body: {
        query: {
          term: { userId: userId },
        },
        sort: [{ updatedAt: { order: "desc" } }],
        from: offset,
        size: limit,
        _source: ["id", "title", "messageCount", "createdAt", "updatedAt"],
      },
    });

    const conversations = result.hits.hits.map((hit) => ({
      id: hit._source.id,
      title: hit._source.title,
      messageCount: hit._source.messageCount || 0,
      createdAt: hit._source.createdAt,
      updatedAt: hit._source.updatedAt,
    }));

    const total =
      typeof result.hits.total === "object"
        ? result.hits.total.value
        : result.hits.total;

    return {
      conversations,
      total,
      limit,
      offset,
    };
  } catch (error) {
    logger.error(
      `Failed to list conversations for user ${userId}:`,
      error.message,
    );
    return { conversations: [], total: 0, limit, offset };
  }
}

/**
 * Search conversations by content
 */
async function searchConversations(userId, query, limit = 20) {
  if (!esClient) {
    logger.warn("Elasticsearch client not available");
    return [];
  }

  try {
    const result = await esClient.search({
      index: INDEX_NAME,
      body: {
        query: {
          bool: {
            must: [
              { term: { userId: userId } },
              {
                bool: {
                  should: [
                    { match: { title: query } },
                    {
                      nested: {
                        path: "messages",
                        query: { match: { "messages.content": query } },
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        sort: [{ updatedAt: { order: "desc" } }],
        size: limit,
        _source: ["id", "title", "messageCount", "createdAt", "updatedAt"],
      },
    });

    return result.hits.hits.map((hit) => ({
      id: hit._source.id,
      title: hit._source.title,
      messageCount: hit._source.messageCount || 0,
      createdAt: hit._source.createdAt,
      updatedAt: hit._source.updatedAt,
      score: hit._score,
    }));
  } catch (error) {
    logger.error(`Failed to search conversations:`, error.message);
    return [];
  }
}

/**
 * Check Elasticsearch connection health
 */
async function healthCheck() {
  if (!esClient) {
    return {
      connected: false,
      error: "Elasticsearch client not initialized",
      index: INDEX_NAME,
    };
  }

  try {
    const health = await esClient.cluster.health();
    return {
      connected: true,
      status: health.status,
      index: INDEX_NAME,
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
      index: INDEX_NAME,
    };
  }
}

// Initialize index on module load
initializeIndex().catch((err) => {
  logger.warn("Index initialization deferred:", err.message);
});

module.exports = {
  addMessage,
  getMessages,
  getRecentMessages,
  getConversation,
  clearConversation,
  updateTitle,
  getConversationInfo,
  listConversations,
  searchConversations,
  healthCheck,
  initializeIndex,
};
