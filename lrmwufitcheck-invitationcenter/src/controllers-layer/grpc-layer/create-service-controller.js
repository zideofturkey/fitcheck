const InvitationCenterServiceGrpcController = require("./InvitationCenterServiceGrpcController");

module.exports = (name, routeName, call, callback) => {
  const grpcController = new InvitationCenterServiceGrpcController(
    name,
    routeName,
    call,
    callback,
  );
  return grpcController;
};
