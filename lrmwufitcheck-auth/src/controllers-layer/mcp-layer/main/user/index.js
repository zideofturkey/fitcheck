module.exports = (headers) => {
  // User Db Object Rest Api Router
  const userMcpRouter = [];

  // getUser controller
  userMcpRouter.push(require("./get-user-api")(headers));
  // updateUser controller
  userMcpRouter.push(require("./update-user-api")(headers));
  // updateProfile controller
  userMcpRouter.push(require("./update-profile-api")(headers));
  // createUser controller
  userMcpRouter.push(require("./create-user-api")(headers));
  // deleteUser controller
  userMcpRouter.push(require("./delete-user-api")(headers));
  // archiveProfile controller
  userMcpRouter.push(require("./archive-profile-api")(headers));
  // listUsers controller
  userMcpRouter.push(require("./list-users-api")(headers));
  // searchUsers controller
  userMcpRouter.push(require("./search-users-api")(headers));
  // updateUserRole controller
  userMcpRouter.push(require("./update-userrole-api")(headers));
  // updateUserPassword controller
  userMcpRouter.push(require("./update-userpassword-api")(headers));
  // updateUserPasswordByAdmin controller
  userMcpRouter.push(require("./update-userpasswordbyadmin-api")(headers));
  // getBriefUser controller
  userMcpRouter.push(require("./get-briefuser-api")(headers));
  // streamTest controller
  userMcpRouter.push(require("./stream-test-api")(headers));

  return userMcpRouter;
};
