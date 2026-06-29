module.exports = (headers) => {
  // UserAvatarsFile Db Object Rest Api Router
  const userAvatarsFileMcpRouter = [];

  // getUserAvatarsFile controller
  userAvatarsFileMcpRouter.push(require("./get-useravatarsfile-api")(headers));
  // listUserAvatarsFiles controller
  userAvatarsFileMcpRouter.push(
    require("./list-useravatarsfiles-api")(headers),
  );
  // deleteUserAvatarsFile controller
  userAvatarsFileMcpRouter.push(
    require("./delete-useravatarsfile-api")(headers),
  );
  // _fetchListUserAvatarsFile controller
  userAvatarsFileMcpRouter.push(
    require("./_fetch-listuseravatarsfile-api")(headers),
  );

  return userAvatarsFileMcpRouter;
};
