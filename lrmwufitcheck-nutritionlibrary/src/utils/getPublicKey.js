const path = require("path");
const fs = require("fs");
const { getRestData, hexaLogger } = require("common");

module.exports = async (keyId) => {
  let userServicePublickKeyApi = "";
  try {
    const keysFolder = process.env.KEYS_FOLDER || "keys";

    const publicKeyFolder = path.join(__dirname, "../", "../", keysFolder);
    if (!fs.existsSync(publicKeyFolder)) {
      fs.mkdirSync(publicKeyFolder);
      console.log("Keys folder created:", publicKeyFolder);
    }

    const authUrl = process.env.AUTH_SERVICE_URL;

    userServicePublickKeyApi =
      authUrl + "/publickey" + (keyId ? "?keyId=" + keyId : "");

    const publicKey = await getRestData(userServicePublickKeyApi);
    if (publicKey instanceof Error) {
      throw publicKey;
    }
    if (
      publicKey &&
      publicKey.keyId &&
      publicKey.keyData &&
      publicKey.keyData.startsWith("-----BEGIN PUBLIC KEY-----")
    ) {
      const publicKeyPath = path.join(
        publicKeyFolder,
        "rsa.key.pub." + publicKey.keyId,
      );

      fs.writeFileSync(publicKeyPath, publicKey.keyData);
      console.log(
        "Public key with id updated from the server",
        publicKey.keyId,
      );
      return publicKey;
    } else {
      console.log(
        "Public key not found from the server",
        userServicePublickKeyApi,
      );

      return null;
    }
  } catch (err) {
    //**errorLog
    console.log("Error in getPublicKey", userServicePublickKeyApi);
    console.log(err?.message || err);

    hexaLogger.insertError(
      "GetPublicKeyError",
      { message: err.message, api: userServicePublickKeyApi },
      "getPublicKey.js->export",
      err,
    );
    return null;
  }
};
