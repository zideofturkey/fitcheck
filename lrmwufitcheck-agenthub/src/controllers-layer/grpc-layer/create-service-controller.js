const AgentHubServiceGrpcController = require("./AgentHubServiceGrpcController");

module.exports = (name, routeName, call, callback) => {
  const grpcController = new AgentHubServiceGrpcController(
    name,
    routeName,
    call,
    callback,
  );
  return grpcController;
};
