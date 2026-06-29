module.exports = {
  AuthServiceManager: require("./service-manager/AuthServiceManager"),
  // main Database Crud Object Routes Manager Layer Classes
  // User Db Object
  GetUserManager: require("./main/user/get-user-api"),
  UpdateUserManager: require("./main/user/update-user-api"),
  UpdateProfileManager: require("./main/user/update-profile-api"),
  CreateUserManager: require("./main/user/create-user-api"),
  DeleteUserManager: require("./main/user/delete-user-api"),
  ArchiveProfileManager: require("./main/user/archive-profile-api"),
  ListUsersManager: require("./main/user/list-users-api"),
  SearchUsersManager: require("./main/user/search-users-api"),
  UpdateUserRoleManager: require("./main/user/update-userrole-api"),
  UpdateUserPasswordManager: require("./main/user/update-userpassword-api"),
  UpdateUserPasswordByAdminManager: require("./main/user/update-userpasswordbyadmin-api"),
  GetBriefUserManager: require("./main/user/get-briefuser-api"),
  StreamTestManager: require("./main/user/stream-test-api"),
  // UserAvatarsFile Db Object
  GetUserAvatarsFileManager: require("./main/userAvatarsFile/get-useravatarsfile-api"),
  ListUserAvatarsFilesManager: require("./main/userAvatarsFile/list-useravatarsfiles-api"),
  DeleteUserAvatarsFileManager: require("./main/userAvatarsFile/delete-useravatarsfile-api"),
  _fetchListUserAvatarsFileManager: require("./main/userAvatarsFile/_fetch-listuseravatarsfile-api"),
  integrationRouter: require("./integrations/testRouter"),
};
