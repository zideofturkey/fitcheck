const { UpdateProfileManager } = require("apiLayer");
const AuthServiceGrpcController = require("./AuthServiceGrpcController");
const { status } = require("@grpc/grpc-js");

class UpdateProfileGrpcController extends AuthServiceGrpcController {
  constructor(call, callback) {
    super("updateProfile", "updateprofile", call, callback);
    this.crudType = "update";
    this.dataName = "user";
    this.responseFormat = "dataItem";
    this.responseType = "single";
  }

  async createApiManager() {
    return new UpdateProfileManager(this.request, "grpc");
  }
}

const updateProfile = async (call, callback) => {
  try {
    const controller = new UpdateProfileGrpcController(call, callback);
    await controller.processRequest();
  } catch (error) {
    const grpcError = {
      code: error.grpcStatus || status.INTERNAL,
      message:
        error.message || "An error occurred while processing the request.",
    };

    //**errorLog

    callback(grpcError);
  }
};

module.exports = updateProfile;
