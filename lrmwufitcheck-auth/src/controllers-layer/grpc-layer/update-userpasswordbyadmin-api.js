const { UpdateUserPasswordByAdminManager } = require("apiLayer");
const AuthServiceGrpcController = require("./AuthServiceGrpcController");
const { status } = require("@grpc/grpc-js");

class UpdateUserPasswordByAdminGrpcController extends AuthServiceGrpcController {
  constructor(call, callback) {
    super(
      "updateUserPasswordByAdmin",
      "updateuserpasswordbyadmin",
      call,
      callback,
    );
    this.crudType = "update";
    this.dataName = "user";
    this.responseFormat = "dataItem";
    this.responseType = "single";
  }

  async createApiManager() {
    return new UpdateUserPasswordByAdminManager(this.request, "grpc");
  }
}

const updateUserPasswordByAdmin = async (call, callback) => {
  try {
    const controller = new UpdateUserPasswordByAdminGrpcController(
      call,
      callback,
    );
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

module.exports = updateUserPasswordByAdmin;
