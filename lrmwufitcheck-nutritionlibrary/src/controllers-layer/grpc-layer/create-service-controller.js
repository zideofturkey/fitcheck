const NutritionLibraryServiceGrpcController = require("./NutritionLibraryServiceGrpcController");

module.exports = (name, routeName, call, callback) => {
  const grpcController = new NutritionLibraryServiceGrpcController(
    name,
    routeName,
    call,
    callback,
  );
  return grpcController;
};
