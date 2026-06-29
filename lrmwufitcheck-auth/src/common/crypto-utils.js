const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { SignJWT, jwtVerify, createRemoteJWKSet, importPKCS8 } = require("jose");

const algorithm = "aes-256-ctr";
const secretKeyValue =
  process.env.SECRET_KEY ?? "---myTestSecretKeyLengthMustBe32";
const secretKey = Buffer.from(secretKeyValue, "binary"); //secret key length must be 32

const createJWT = (payload, jwt_Key) => {
  const jwtKey =
    jwt_Key ??
    (process.env.JWT_KEY || "aSecretJwtKeyWillBeDefinedLaterInKubernetes");
  const token = jwt.sign(payload, jwtKey);

  return token;
};

const createJWT_RSA = (payload, privateKeyPem, passPhrase, expiresIn) => {
  const privateKey = crypto.createPrivateKey({
    key: privateKeyPem,
    format: "pem",
    type: "pkcs1",
    passphrase: passPhrase,
  });

  const jwtOptions = { algorithm: "RS256" };
  if (expiresIn) jwtOptions.expiresIn = expiresIn;

  const token = jwt.sign(payload, privateKey, jwtOptions);
  return token;
};

const validateJWT = (token, jwt_Key) => {
  const jwtKey =
    jwt_Key ??
    (process.env.JWT_KEY || "aSecretJwtKeyWillBeDefinedLaterInKubernetes");
  try {
    const payload = jwt.verify(token, jwtKey);
    return payload;
  } catch (e) {
    console.log(e.message);
    //**errorLog
    return null;
  }
};

const validateJWT_RSA = (token, publicKey) => {
  try {
    const payload = jwt.verify(token, publicKey, { algorithm: "RS256" });
    return payload;
  } catch (e) {
    console.log(e.message);
    //**errorLog
    return null;
  }
};

const decodeJWT = (token) => {
  try {
    const decodedToken = jwt.decode(token, {
      complete: true,
    });
    return decodedToken;
  } catch (e) {
    console.log(e.message);
    //**errorLog
    return null;
  }
};

const decryptToken = (hash) => {
  try {
    const decipher = crypto.createDecipheriv(
      algorithm,
      secretKey,
      Buffer.from(hash.iv, "hex"),
    );
    const decrpyted = Buffer.concat([
      decipher.update(Buffer.from(hash.content, "hex")),
      decipher.final(),
    ]);
    return decrpyted.toString();
  } catch (err) {
    //**errorLog
    return null;
  }
};

const decodeToken = (tokenText) => {
  const hArray = tokenText.split(".");

  if (hArray.length != 2) {
    return null;
  }
  const hash = { iv: hArray[0], content: hArray[1] };
  return decryptToken(hash);
};

const encodeToken = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  const hash = {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
  };
  return hash.iv + "." + hash.content;
};

const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
const charactersLength = characters.length;
const randomCode = () => {
  let result = "";
  for (let i = 0; i < 40; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const hashString = (strValue) => {
  if (strValue == null) return null;
  return bcrypt.hashSync(strValue, 4);
};

const hashCompare = (strValue, hashValue) => {
  if (strValue == null || hashValue == null) return false;
  return bcrypt.compareSync(strValue, hashValue);
};

const md5 = (input) => crypto.createHash("md5").update(input).digest("hex");

const intHash = (str) => {
  let hash = 0;
  const prime = 31;

  for (let i = 0; i < str.length; i++) {
    hash = (hash * prime + str.charCodeAt(i)) >>> 0; // unsigned int
  }

  // Normalize to 6-digit integer
  return hash % 1000000;
};

/**
 * Creates a machine-to-machine (M2M) JWT token using Ed25519 algorithm
 * @param {Object} payload - The payload to include in the token (must include 'sender' property)
 * @param {Object} options - Optional token options
 * @param {string} options.requestPayloadHash - Hash of the request payload to prevent token reuse
 * @param {string|number} options.expiresIn - Token expiration time (default: 15 minutes)
 * @returns {Promise<string>} The signed JWT token
 */
const createM2MToken = async (payload, options = {}) => {
  try {
    // Skip M2M token creation in test/preview mode
    const configEnv = process.env.CONFIG_ENV;
    const isTestMode = !configEnv || configEnv === "test";

    if (isTestMode) {
      // Return null in test mode - M2M tokens are not needed
      return null;
    }

    const privateKeyPem = process.env.SERVICE_SECRET_KEY;

    if (!privateKeyPem) {
      console.error("SERVICE_SECRET_KEY environment variable is not set");
      //**errorLog
      return null;
    }

    if (!payload.sender) {
      console.error("Payload must include 'sender' property");
      //**errorLog
      return null;
    }

    // Create token payload with request hash if provided
    const tokenPayload = { ...payload };
    if (options.requestPayloadHash) {
      tokenPayload.requestHash = options.requestPayloadHash;
    }

    // Import the private key from PEM format
    const privateKey = await importPKCS8(privateKeyPem, "EdDSA");

    // Create the JWT with Ed25519 algorithm
    const signJWT = new SignJWT(tokenPayload)
      .setProtectedHeader({ alg: "EdDSA" })
      .setIssuedAt()
      .setIssuer(payload.sender);

    // Set expiration (default: 15 minutes)
    const expiresIn = options.expiresIn || "15m";
    signJWT.setExpirationTime(expiresIn);

    // Sign and return the token
    const token = await signJWT.sign(privateKey);
    return token;
  } catch (error) {
    console.error("Error creating M2M token:", error.message);
    //**errorLog
    return null;
  }
};

/**
 * Validates a machine-to-machine (M2M) JWT token using Ed25519 algorithm
 * @param {string} token - The JWT token to validate
 * @returns {Promise<Object|null>} The decoded payload if valid, null otherwise
 */
const validateM2MToken = async (token) => {
  try {
    // Skip M2M token validation in test/preview mode
    const configEnv = process.env.CONFIG_ENV;
    const isTestMode = !configEnv || configEnv === "preview";

    if (isTestMode) {
      // In test mode, return a mock payload to allow requests to proceed
      // Try to decode the token to get sender if possible, otherwise use a default
      let sender = "test-service";
      try {
        const decoded = jwt.decode(token, { complete: true });
        if (decoded && decoded.payload && decoded.payload.sender) {
          sender = decoded.payload.sender;
        }
      } catch (e) {
        // Ignore decode errors in test mode
      }
      return { sender, testMode: true };
    }

    const jwksUrl = process.env.JWKS_URL;

    if (!jwksUrl) {
      console.error("JWKS_URL environment variable is not set");
      //**errorLog
      return null;
    }

    // First, decode the token to get the sender without verification
    const decoded = jwt.decode(token, { complete: true });

    if (!decoded || !decoded.payload || !decoded.payload.sender) {
      console.error("Token does not contain 'sender' property");
      //**errorLog
      return null;
    }

    const sender = decoded.payload.sender;

    // Check M2M access control (only in stage/prod)
    const isStageOrProd = configEnv === "staging" || configEnv === "prod";

    if (isStageOrProd) {
      const blockList = process.env.M2M_BLOCK_LIST;
      const allowedClients = process.env.ALLOWED_M2M_CLIENTS;

      // If block list exists (has at least one blocked client), check only block list
      // Block list takes priority and conflicts with allowed list logic
      if (blockList && blockList.trim().length > 0) {
        const blockedServices = blockList
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
        if (blockedServices.length > 0 && blockedServices.includes(sender)) {
          console.error(
            `M2M token sender '${sender}' is in the M2M block list`,
          );
          //**errorLog
          return null;
        }
      } else if (allowedClients && allowedClients.trim().length > 0) {
        // Only check allowed list if block list doesn't exist
        // If allowed list exists, only allow those in the list
        const allowedList = allowedClients
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
        if (allowedList.length > 0 && !allowedList.includes(sender)) {
          console.error(
            `M2M token sender '${sender}' is not in the allowed M2M clients list`,
          );
          //**errorLog
          return null;
        }
      }
    }

    // Replace $service parameter in JWKS URL with the actual sender
    const serviceJwksUrl = jwksUrl.replace("$service", sender);

    // Create a remote JWK set for the sender's public key
    const JWKS = createRemoteJWKSet(new URL(serviceJwksUrl));

    // Verify the token using the remote JWK set
    const { payload } = await jwtVerify(token, JWKS, {
      algorithms: ["EdDSA"],
    });

    return payload;
  } catch (error) {
    console.error("Error validating M2M token:", error.message);
    //**errorLog
    return null;
  }
};

module.exports = {
  createJWT,
  validateJWT,
  createJWT_RSA,
  validateJWT_RSA,
  decodeJWT,
  encodeToken,
  decodeToken,
  randomCode,
  hashString,
  hashCompare,
  md5,
  intHash,
  createM2MToken,
  validateM2MToken,
};
