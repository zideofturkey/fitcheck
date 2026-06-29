const { HttpServerError } = require("common");
const { getEntityFromCache, createEntityCache } = require("./helper");
const getUserById = require("./getUserById");

/**
 * Cache-first read of a User by id. Tries the entity cache
 * (Redis) first; on a miss falls through to the database and populates the
 * cache for the next read. Returns null when neither cache nor DB has the row.
 *
 * For an array of ids the helper short-circuits to the standard DB getter —
 * cache lookups are id-by-id and we keep the array path simple.
 *
 * Only generated when entity caching is enabled for this data object. Custom
 * code that needs fast-path reads (hot tickets, gates, etc.) should use this
 * instead of getUserById.
 *
 * @param {String|Array<String>} userId
 * @returns {Promise<Object|Array<Object>|null>}
 */
const getCachedUserById = async (userId) => {
  try {
    if (!userId) return null;

    if (Array.isArray(userId)) {
      return await getUserById(userId);
    }

    const cached = await getEntityFromCache(userId);
    if (cached) return cached;

    const data = await getUserById(userId);
    if (!data) return null;

    await createEntityCache(data);
    return data;
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingCachedUserById",
      err,
    );
  }
};

module.exports = getCachedUserById;
