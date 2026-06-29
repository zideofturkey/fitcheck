const { SearchUsersManager } = require("apiLayer");
const AuthServiceGrpcController = require("./AuthServiceGrpcController");
const { status } = require("@grpc/grpc-js");

class SearchUsersGrpcController extends AuthServiceGrpcController {
  constructor(call, callback) {
    super("searchUsers", "searchusers", call, callback);
    this.crudType = "list";
    this.dataName = "users";
    this.responseFormat = "dataItem";
    this.responseType = "single";
  }

  async createApiManager() {
    return new SearchUsersManager(this.request, "grpc");
  }
}

const searchUsers = async (call, callback) => {
  try {
    const controller = new SearchUsersGrpcController(call, callback);
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

module.exports = searchUsers;
