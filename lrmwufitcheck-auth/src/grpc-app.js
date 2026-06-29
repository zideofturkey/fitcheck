const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const protoFile = path.join(
  __dirname,
  "controllers-layer",
  "grpc-layer",
  "proto",
  "auth.proto",
);

console.log("Loading proto file from:", protoFile);
try {
  const stats = require("fs").statSync(protoFile);
  console.log("Proto file exists, size:", stats.size, "bytes");
} catch (err) {
  console.error("Error accessing proto file:", err.message);
  //**errorLog
}

const { getLoginRouter } = require("grpcLayer");
const sessionRouter = getLoginRouter();

const packageDef = protoLoader.loadSync(protoFile, {});
const grpcObject = grpc.loadPackageDefinition(packageDef);
const authPackage = grpcObject.auth;

const server = new grpc.Server();

function helloMessage(call, callback) {
  callback(null, { hello: "hello, this is fitcheck-auth-service" });
}

const {
  getUser,
  updateUser,
  updateProfile,
  createUser,
  deleteUser,
  archiveProfile,
  listUsers,
  searchUsers,
  updateUserRole,
  updateUserPassword,
  updateUserPasswordByAdmin,
  getBriefUser,
} = require("./controllers-layer/grpc-layer");

server.addService(authPackage.authService.service, {
  getUser: getUser,
  updateUser: updateUser,
  updateProfile: updateProfile,
  createUser: createUser,
  deleteUser: deleteUser,
  archiveProfile: archiveProfile,
  listUsers: listUsers,
  searchUsers: searchUsers,
  updateUserRole: updateUserRole,
  updateUserPassword: updateUserPassword,
  updateUserPasswordByAdmin: updateUserPasswordByAdmin,
  getBriefUser: getBriefUser,
  helloMessage,
  ...sessionRouter,
});

module.exports = server;
