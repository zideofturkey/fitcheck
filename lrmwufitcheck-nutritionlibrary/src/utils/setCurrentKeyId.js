const path = require("path");
const fs = require("fs");

// setCurrentKeyId
module.exports = async () => {
  try {
    const keysFolder = process.env.KEYS_FOLDER || "keys";
    const currentKeyIdPath = path.join(
      __dirname,
      "../",
      "../",
      keysFolder,
      "currentKeyId",
    );

    global.currentKeyId = null;
    if (fs.existsSync(currentKeyIdPath)) {
      const currentKeyId = fs.readFileSync(currentKeyIdPath, "utf8");
      global.currentKeyId = currentKeyId;
    } else {
      console.log("Current Key Id not found");
    }
    console.log("Current Key Id: ", global.currentKeyId);
  } catch (err) {
    //**errorLog
    console.log("Current Key Id not Set");
  }
};
