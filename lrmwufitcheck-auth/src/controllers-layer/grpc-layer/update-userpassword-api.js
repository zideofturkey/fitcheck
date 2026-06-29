const { UpdateUserPasswordManager } = require("apiLayer");
const AuthServiceGrpcController = require("./AuthServiceGrpcController");
const { status } = require("@grpc/grpc-js");

class UpdateUserPasswordGrpcController extends AuthServiceGrpcController {
  constructor(call, callback) {
    super("updateUserPassword", "updateuserpassword", call, callback);
    this.crudType = "update";
    this.dataName = "user";
    this.responseFormat = "dataItem";
    this.responseType = "single";
  }

  async createApiManager() {
    return new UpdateUserPasswordManager(this.request, "grpc");
  }
}

const updateUserPassword = async (call, callback) => {
  try {
    const controller = new UpdateUserPasswordGrpcController(call, callback);
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

module.exports = updateUserPassword;
