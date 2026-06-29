module.exports = {
  // main Database Crud Object Routes Manager Layer Classes
  // User Db Object
  GetUserManager: require("./user/get-user-api"),
  UpdateUserManager: require("./user/update-user-api"),
  UpdateProfileManager: require("./user/update-profile-api"),
  CreateUserManager: require("./user/create-user-api"),
  DeleteUserManager: require("./user/delete-user-api"),
  ArchiveProfileManager: require("./user/archive-profile-api"),
  ListUsersManager: require("./user/list-users-api"),
  SearchUsersManager: require("./user/search-users-api"),
  UpdateUserRoleManager: require("./user/update-userrole-api"),
  UpdateUserPasswordManager: require("./user/update-userpassword-api"),
  UpdateUserPasswordByAdminManager: require("./user/update-userpasswordbyadmin-api"),
  GetBriefUserManager: require("./user/get-briefuser-api"),
  StreamTestManager: require("./user/stream-test-api"),
  // UserAvatarsFile Db Object
  GetUserAvatarsFileManager: require("./userAvatarsFile/get-useravatarsfile-api"),
  ListUserAvatarsFilesManager: require("./userAvatarsFile/list-useravatarsfiles-api"),
  DeleteUserAvatarsFileManager: require("./userAvatarsFile/delete-useravatarsfile-api"),
  _fetchListUserAvatarsFileManager: require("./userAvatarsFile/_fetch-listuseravatarsfile-api"),
};
