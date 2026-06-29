const { NotAuthenticatedError, ForbiddenError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const HexaAuth = require("./hexa-auth");

class FitcheckSession extends HexaAuth {
  constructor() {
    super();

    this.ROLES = { superAdmin: "superAdmin", admin: "admin", user: "user" };

    this.projectName = "fitcheck";
    this.projectCodename = "lrmwufitcheck";
    this.appCodename = "lrmwufitcheck";
    this.isJWT = true;
    this.isJWTAuthRSA = true;
    this.isRemoteAuth = false;
    this.useRemoteSession = false;
  }

  userHasRole(roleName) {
    const userRoleInSession = Array.isArray(this.session?.roleId ?? "user")
      ? (this.session?.roleId ?? "user").map((role) => role.toLowerCase())
      : (this.session?.roleId ?? "user").toLowerCase();
    if (!userRoleInSession) return false;
    return Array.isArray(userRoleInSession)
      ? userRoleInSession.includes(roleName.toLowerCase())
      : userRoleInSession == roleName.toLowerCase();
  }
}

module.exports = FitcheckSession;
