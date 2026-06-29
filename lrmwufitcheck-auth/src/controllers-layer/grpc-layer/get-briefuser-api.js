const { GetBriefUserManager } = require("apiLayer");
const AuthServiceGrpcController = require("./AuthServiceGrpcController");
const { status } = require("@grpc/grpc-js");

class GetBriefUserGrpcController extends AuthServiceGrpcController {
  constructor(call, callback) {
    super("getBriefUser", "getbriefuser", call, callback);
    this.crudType = "get";
    this.dataName = "user";
    this.responseFormat = "dataItem";
    this.responseType = "single";
  }

  async createApiManager() {
    return new GetBriefUserManager(this.request, "grpc");
  }
}

const getBriefUser = async (call, callback) => {
  try {
    const controller = new GetBriefUserGrpcController(call, callback);
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

module.exports = getBriefUser;
