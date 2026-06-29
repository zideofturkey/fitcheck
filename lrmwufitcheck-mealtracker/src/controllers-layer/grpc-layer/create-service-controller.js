const MealTrackerServiceGrpcController = require("./MealTrackerServiceGrpcController");

module.exports = (name, routeName, call, callback) => {
  const grpcController = new MealTrackerServiceGrpcController(
    name,
    routeName,
    call,
    callback,
  );
  return grpcController;
};
