const jwt = require("jsonwebtoken");
const { getPublicKey } = require("common/auth.key");

const getTokenFromRequest = (req) => {
  const authHeader =
    req.headers["authorization"] || req.headers["Authorization"];
  if (authHeader) {
    const [type, token] = authHeader.split(" ");
    if (type.toLowerCase() === "bearer" && token && token !== "null") {
      return token;
    }
  }

  const cookieValue = req.cookies[`lrmwufitcheck-access-token`];
  if (cookieValue) {
    return cookieValue;
  }

  return null;
};

const verifyToken = (token, publicKey) => {
  try {
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
    });

    return decoded;
  } catch (error) {
    return null;
  }
};

const decodeToken = (token) => {
  try {
    return jwt.decode(token, {
      complete: true,
    });
  } catch (error) {
    return null;
  }
};

const authenticationMiddleware = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "errMsg_UserNotLoggedIn Not Token",
      });
    }

    const decoded = decodeToken(token);
    if (!decoded) {
      return res.status(401).json({
        status: "error",
        message: "errMsg_UserNotLoggedIn Not Valid Token",
      });
    }

    const publicKey = await getPublicKey(decoded.payload.keyId);
    if (!publicKey) {
      return res.status(401).json({
        status: "error",
        message: "errMsg_UserNotLoggedIn Not Valid Token",
      });
    }

    const verified = verifyToken(token, publicKey);
    if (!verified) {
      return res.status(401).json({
        status: "error",
        message: "errMsg_UserNotLoggedIn Not Valid Token",
      });
    }

    req.user = verified;
    req.userId = verified.userId;
    req.token = token;

    next();
  } catch (error) {
    console.log("Authentication error:", error);
    return res.status(401).json({
      status: "error",
      message: "errMsg_UserNotLoggedIn Authentication Error",
    });
  }
};

module.exports = {
  authenticationMiddleware,
};
