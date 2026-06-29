const sessionRouter = require("./session-router");

module.exports = {
  getUser: require("./get-user-api"),
  updateUser: require("./update-user-api"),
  updateProfile: require("./update-profile-api"),
  createUser: require("./create-user-api"),
  deleteUser: require("./delete-user-api"),
  archiveProfile: require("./archive-profile-api"),
  listUsers: require("./list-users-api"),
  searchUsers: require("./search-users-api"),
  updateUserRole: require("./update-userrole-api"),
  updateUserPassword: require("./update-userpassword-api"),
  updateUserPasswordByAdmin: require("./update-userpasswordbyadmin-api"),
  getBriefUser: require("./get-briefuser-api"),
  ...sessionRouter,
};
