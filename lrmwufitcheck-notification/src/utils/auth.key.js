const axios = require("axios");
const fs = require("fs");
const path = require("path");

const getPublicKey = async (keyId = "dev") => {
  const checkIfExistsFolder = await fs.existsSync(
    path.join(__dirname, `../../keys`),
  );
  if (!checkIfExistsFolder) {
    await fs.mkdirSync(path.join(__dirname, `../../keys`), { recursive: true });
  }
  const checkIfExists = await fs.existsSync(
    path.join(__dirname, `../../keys/${keyId}.key`),
  );
  if (!checkIfExists) {
    const remoteKey = await getRemotePublicKey(keyId);
    if (remoteKey && remoteKey.keyData) {
      await fs.writeFileSync(
        path.join(__dirname, `../../keys/${keyId}.key`),
        remoteKey.keyData,
      );
      return remoteKey.keyData;
    }
    throw new Error(`Key for ${keyId} not found`);
  }
  const key = await fs.readFileSync(
    path.join(__dirname, `../../keys/${keyId}.key`),
    "utf8",
  );
  return key;
};

const getRemotePublicKey = async (keyId = "dev") => {
  const response = await axios.get(
    `${process.env.AUTH_SERVICE_URL}/publickey?keyId=${keyId}`,
  );
  return response.data;
};

module.exports = {
  getPublicKey,
};
