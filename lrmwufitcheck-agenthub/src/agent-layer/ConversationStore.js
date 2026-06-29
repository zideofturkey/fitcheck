class MemoryConversationStore {
  constructor(maxMessages = 100) {
    this._sessions = new Map();
    this._maxMessages = maxMessages;
  }

  async load(sessionId) {
    if (!sessionId) return [];
    return this._sessions.get(sessionId) ?? [];
  }

  async save(sessionId, messages) {
    if (!sessionId) return;
    const trimmed = messages.slice(-this._maxMessages);
    this._sessions.set(sessionId, trimmed);
  }

  async clear(sessionId) {
    this._sessions.delete(sessionId);
  }
}

class DatabaseConversationStore {
  /**
   * @param {object} dbFunctions - Object with { getByQuery, create, update, deleteByQuery }
   *   matching the generated dbLayer functions for sys_agentConversation.
   * @param {number} maxMessages - Maximum messages to keep per session.
   * @param {string} agentName - Agent name (stored alongside conversation for querying).
   */
  constructor(dbFunctions, maxMessages = 100, agentName = null) {
    this._db = dbFunctions;
    this._maxMessages = maxMessages;
    this._agentName = agentName;
  }

  async load(sessionId) {
    if (!sessionId) return [];
    try {
      const record = await this._db.getByQuery({ sessionId });
      return record?.messages ?? [];
    } catch (_) {
      return [];
    }
  }

  async save(sessionId, messages) {
    if (!sessionId) return;
    const trimmed = messages.slice(-this._maxMessages);
    try {
      const existing = await this._db.getByQuery({ sessionId });
      if (existing) {
        await this._db.update(existing.id, {
          messages: trimmed,
          messageCount: trimmed.length,
          updatedAt: new Date(),
        });
      } else {
        await this._db.create({
          sessionId,
          agentName: this._agentName,
          messages: trimmed,
          messageCount: trimmed.length,
        });
      }
    } catch (error) {
      console.error("ConversationStore save error:", error.message);
    }
  }

  async clear(sessionId) {
    try {
      await this._db.deleteByQuery({ sessionId });
    } catch (_) {}
  }
}

function createConversationStore(type, options = {}) {
  if (type === "database") {
    return new DatabaseConversationStore(
      options.dbFunctions,
      options.maxMessages,
      options.agentName,
    );
  }
  return new MemoryConversationStore(options.maxMessages);
}

module.exports = {
  MemoryConversationStore,
  DatabaseConversationStore,
  createConversationStore,
};
