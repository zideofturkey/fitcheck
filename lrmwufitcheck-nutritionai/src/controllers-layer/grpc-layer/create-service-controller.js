const NutritionAiServiceGrpcController = require("./NutritionAiServiceGrpcController");

module.exports = (name, routeName, call, callback) => {
  const grpcController = new NutritionAiServiceGrpcController(
    name,
    routeName,
    call,
    callback,
  );
  return grpcController;
};
