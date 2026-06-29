const { createClient } = require("redis");

const redisHost = process.env.REDIS_HOST || "redis";
const redisPort = process.env.REDIS_PORT || 6379;
const redisUser = process.env.REDIS_USER || null;
const redisPwd = process.env.REDIS_PWD || null;

let redisUri = `redis://${redisHost}:${redisPort}`;
if (redisUser && redisPwd) {
  redisUri = `redis://${redisUser}:${redisPwd}@${redisHost}:${redisPort}`;
}

// const redisClient = createClient({
//   url: redisUri,
// });

const redisClient = createClient({
  socket: {
    host: redisHost,
    port: redisPort,
  },
  username: redisUser,
  password: redisPwd,
});
redisClient.on("error", (err) => console.log("Redis Client Error", err));

const getRedisData = async (key) => {
  try {
    if (!redisClient.isOpen) await connectToRedis();
    let data = null;
    const dataStr = await redisClient.get(key);
    if (dataStr) {
      try {
        data = JSON.parse(dataStr);
        if (typeof data === "object") data.source = "redis";
      } catch (err) {
        data = dataStr;
      }
    }
    return data;
  } catch (err) {
    console.log("[Redis] Error in getRedisData for key:", key, err);
    //**errorLog
    return null;
  }
};

const checkKeyExists = async (key) => {
  try {
    if (!redisClient.isOpen) await connectToRedis();
    const exists = await redisClient.exists(key);
    return exists === 1;
  } catch (err) {
    console.log("[Redis] Error in checkKeyExists for key:", key, err);
    return false;
  }
};

const getKeyTTL = async (key) => {
  try {
    if (!redisClient.isOpen) await connectToRedis();
    const ttl = await redisClient.ttl(key);
    // ttl returns:
    // -2 if key does not exist
    // -1 if key exists but has no TTL
    // >= 0 for the remaining TTL in seconds
    return ttl;
  } catch (err) {
    console.log("[Redis] Error in getKeyTTL for key:", key, err);
    return -2;
  }
};

const setRedisData = async (key, data, exp) => {
  try {
    if (!redisClient.isOpen) await connectToRedis();
    if (typeof data === "object") {
      data = JSON.stringify(data);
    }
    if (exp == "KEEPTTL") {
      // Use native KEEPTTL option (Redis 6.0+) for atomic operation
      // This prevents race conditions where TTL could be lost
      const result = await redisClient.set(key, data, { KEEPTTL: true });
      if (result === null) {
        // Key didn't exist, KEEPTTL requires existing key with TTL
        // Log this as it indicates a session that was already expired/deleted
        console.log(
          `[Redis] KEEPTTL failed for key ${key} - key does not exist, skipping update`,
        );
        return null;
      }
      return result;
    }
    return exp > 0
      ? await redisClient.set(key, data, { EX: exp })
      : await redisClient.set(key, data);
  } catch (err) {
    console.log("[Redis] Error in setRedisData:", err);
    //**errorLog
    return null;
  }
};

const connectToRedis = async () => {
  console.log("connecting to redis", `redis://${redisHost}:${redisPort}`);
  try {
    await redisClient.connect();
    console.log("connected to redis", `redis://${redisHost}:${redisPort}`);
  } catch (err) {
    console.log(err);
    //**errorLog
    console.log("cannot connect redis", `redis://${redisHost}:${redisPort}`);
  }
};

function ttlToHuman(ttl) {
  if (ttl === -1) return "No expiration";
  if (ttl === -2) return "Key does not exist";
  if (ttl === 0) return "Expired";

  const days = Math.floor(ttl / 86400);
  ttl %= 86400;

  const hours = Math.floor(ttl / 3600);
  ttl %= 3600;

  const minutes = Math.floor(ttl / 60);
  const seconds = ttl % 60;

  const parts = [];
  if (days) parts.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
  if (minutes) parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
  if (seconds) parts.push(`${seconds} second${seconds > 1 ? "s" : ""}`);

  return parts.join(", ");
}

module.exports = {
  redisClient,
  connectToRedis,
  getRedisData,
  setRedisData,
  ttlToHuman,
  checkKeyExists,
  getKeyTTL,
};
