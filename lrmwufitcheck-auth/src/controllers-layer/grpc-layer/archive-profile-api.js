const { ArchiveProfileManager } = require("apiLayer");
const AuthServiceGrpcController = require("./AuthServiceGrpcController");
const { status } = require("@grpc/grpc-js");

class ArchiveProfileGrpcController extends AuthServiceGrpcController {
  constructor(call, callback) {
    super("archiveProfile", "archiveprofile", call, callback);
    this.crudType = "delete";
    this.dataName = "user";
    this.responseFormat = "dataItem";
    this.responseType = "single";
  }

  async createApiManager() {
    return new ArchiveProfileManager(this.request, "grpc");
  }
}

const archiveProfile = async (call, callback) => {
  try {
    const controller = new ArchiveProfileGrpcController(call, callback);
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

module.exports = archiveProfile;
