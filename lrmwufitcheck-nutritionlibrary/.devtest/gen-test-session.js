/*
 * DEV-ONLY test helper: mints a valid RSA-signed access token + a matching
 * Redis-backed session, WITHOUT needing the real auth microservice running.
 * Mirrors src/project-session/hexa-auth.js's verifyJWTAccessToken +
 * buildSessionFromRequest("readFromSessionStore") flow exactly:
 *   1. JWT signed RS256, payload.tokenMark = "<projectCodename>-inapp-token",
 *      payload.keyId used to locate keysdev/rsa.key.pub.<keyId> for verification.
 *   2. Session content is read from Redis key `hexasession:<sessionId>` verbatim.
 *
 * Usage:
 *   node .devtest/gen-test-session.js            -> "user" role session (default)
 *   node .devtest/gen-test-session.js user        -> "user" role session
 *   node .devtest/gen-test-session.js admin       -> "admin" role session (distinct userId)
 *
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
const PROJECT_CODENAME = "lrmwufitcheck";

const ROLE_PROFILES = {
  user: {
    userId: "11111111-1111-4111-8111-111111111111",
    sessionId: "22222222-2222-4222-8222-222222222222",
    roleId: "user",
    fullname: "Dev Test User",
    email: "devtest@example.com",
  },
  admin: {
    userId: "33333333-3333-4333-8333-333333333333",
    sessionId: "44444444-4444-4444-8444-444444444444",
    roleId: "admin",
    fullname: "Dev Test Admin",
    email: "devtest-admin@example.com",
  },
};

async function generateSession(role) {
  const profile = ROLE_PROFILES[role];
  if (!profile) {
    throw new Error(
      `Unknown role "${role}". Valid roles: ${Object.keys(ROLE_PROFILES).join(", ")}`,
    );
  }

  if (!fs.existsSync(KEYS_FOLDER)) fs.mkdirSync(KEYS_FOLDER, { recursive: true });

  const pubPath = path.join(KEYS_FOLDER, `rsa.key.pub.${KEY_ID}`);
  // Reuse the keypair generated earlier in this same process (so a single
  // `node gen-test-session.js all` call issues tokens that stay mutually
  // valid). A fresh process regenerates the key, which invalidates tokens
  // from earlier invocations - always use `all` when you need both roles
  // valid at once instead of calling this script twice.
  let privateKey = global.__devtestPrivateKey;
  if (!privateKey) {
    const generated = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs1", format: "pem" },
    });
    fs.writeFileSync(pubPath, generated.publicKey);
    privateKey = generated.privateKey;
    global.__devtestPrivateKey = privateKey;
  }

  const payload = {
    tokenMark: `${PROJECT_CODENAME}-inapp-token`,
    keyId: KEY_ID,
    tokenName: `${PROJECT_CODENAME}-access-token`,
    sessionId: profile.sessionId,
    userId: profile.userId,
    sub: profile.userId,
    loginDate: new Date().toISOString(),
  };

  const token = jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn: "6h",
  });

  const session = {
    sessionId: profile.sessionId,
    userId: profile.userId,
    _USERID: profile.userId,
    roleId: profile.roleId,
    fullname: profile.fullname,
    email: profile.email,
    loginDate: payload.loginDate,
    loginIp: "127.0.0.1",
  };

  const redisClient = createClient({
    socket: { host: "127.0.0.1", port: 6379 },
  });
  redisClient.on("error", (err) => console.error("Redis error", err));
  await redisClient.connect();
  await redisClient.set(`hexasession:${profile.sessionId}`, JSON.stringify(session), {
    EX: 60 * 60 * 6,
  });
  await redisClient.quit();

  return { token, userId: profile.userId, role: profile.roleId };
}

async function main() {
  const roleArg = (process.argv[2] || "user").toLowerCase();
  const roles = roleArg === "all" ? Object.keys(ROLE_PROFILES) : [roleArg];

  for (const role of roles) {
    const { token, userId } = await generateSession(role);
    console.log(`\n=== ROLE: ${role} ===`);
    console.log("USER ID:", userId);
    console.log("BEARER TOKEN:");
    console.log(token);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
