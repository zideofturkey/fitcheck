/*
 * DEV-ONLY test helper: mints a valid RSA-signed access token + a matching
 * Redis-backed session, WITHOUT needing the real auth microservice running.
 * Mirrors src/project-session/hexa-auth.js's verifyJWTAccessToken +
 * buildSessionFromRequest("readFromSessionStore") flow exactly:
 *   1. JWT signed RS256, payload.tokenMark = "<projectCodename>-inapp-token",
 *      payload.keyId used to locate keysdev/rsa.key.pub.<keyId> for verification.
 *   2. Session content is read from Redis key `hexasession:<sessionId>` verbatim.
 *
 * Usage: node .devtest/gen-test-session.js
 * Requires: node_modules already installed (jsonwebtoken, redis), and the
 * dev Redis container reachable at 127.0.0.1:6379 (see docker-compose.dev.yml).
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { createClient } = require("redis");

const KEYS_FOLDER = path.join(__dirname, "..", "keysdev");
const KEY_ID = "devtestkey001";
const USER_ID = "11111111-1111-4111-8111-111111111111";
const SESSION_ID = "22222222-2222-4222-8222-222222222222";
const PROJECT_CODENAME = "lrmwufitcheck";

async function main() {
  if (!fs.existsSync(KEYS_FOLDER)) fs.mkdirSync(KEYS_FOLDER, { recursive: true });

  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs1", format: "pem" },
  });

  const pubPath = path.join(KEYS_FOLDER, `rsa.key.pub.${KEY_ID}`);
  fs.writeFileSync(pubPath, publicKey);
  console.log("Wrote public key:", pubPath);

  const payload = {
    tokenMark: `${PROJECT_CODENAME}-inapp-token`,
    keyId: KEY_ID,
    tokenName: `${PROJECT_CODENAME}-access-token`,
    sessionId: SESSION_ID,
    userId: USER_ID,
    sub: USER_ID,
    loginDate: new Date().toISOString(),
  };

  const token = jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn: "6h",
  });

  const session = {
    sessionId: SESSION_ID,
    userId: USER_ID,
    _USERID: USER_ID,
    roleId: "user",
    fullname: "Dev Test User",
    email: "devtest@example.com",
    loginDate: payload.loginDate,
    loginIp: "127.0.0.1",
  };

  const redisClient = createClient({
    socket: { host: "127.0.0.1", port: 6379 },
  });
  redisClient.on("error", (err) => console.error("Redis error", err));
  await redisClient.connect();
  await redisClient.set(`hexasession:${SESSION_ID}`, JSON.stringify(session), {
    EX: 60 * 60 * 6,
  });
  await redisClient.quit();
  console.log("Session written to Redis key hexasession:" + SESSION_ID);

  console.log("\n=== TEST BEARER TOKEN ===");
  console.log(token);
  console.log("\n=== USER ID ===");
  console.log(USER_ID);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
