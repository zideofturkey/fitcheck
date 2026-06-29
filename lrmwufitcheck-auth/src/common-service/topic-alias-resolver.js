const ALIAS_MAP = {
  getuser: "lrmwufitcheck-auth-service-user-retrived",
  "getuser:done": "lrmwufitcheck-auth-service-user-retrived",
  "getuser:executed": "lrmwufitcheck-auth-service-user-retrived",
  "getuser:ended": "lrmwufitcheck-auth-service-user-retrived",
  "getuser:finished": "lrmwufitcheck-auth-service-user-retrived",
  "getuser:completed": "lrmwufitcheck-auth-service-user-retrived",
  "getuser:got": "lrmwufitcheck-auth-service-user-retrived",
  "dbevent:getuser": "lrmwufitcheck-auth-service-dbevent-user-got",
  "dbevent:getuser:done": "lrmwufitcheck-auth-service-dbevent-user-got",
  "dbevent:getuser:executed": "lrmwufitcheck-auth-service-dbevent-user-got",
  "dbevent:getuser:ended": "lrmwufitcheck-auth-service-dbevent-user-got",
  "dbevent:getuser:finished": "lrmwufitcheck-auth-service-dbevent-user-got",
  "dbevent:getuser:completed": "lrmwufitcheck-auth-service-dbevent-user-got",
  "dbevent:getuser:got": "lrmwufitcheck-auth-service-dbevent-user-got",
  updateuser: "lrmwufitcheck-auth-service-user-updated",
  "updateuser:done": "lrmwufitcheck-auth-service-user-updated",
  "updateuser:executed": "lrmwufitcheck-auth-service-user-updated",
  "updateuser:ended": "lrmwufitcheck-auth-service-user-updated",
  "updateuser:finished": "lrmwufitcheck-auth-service-user-updated",
  "updateuser:completed": "lrmwufitcheck-auth-service-user-updated",
  "updateuser:updated": "lrmwufitcheck-auth-service-user-updated",
  "dbevent:updateuser": "lrmwufitcheck-auth-service-dbevent-user-updated",
  "dbevent:updateuser:done": "lrmwufitcheck-auth-service-dbevent-user-updated",
  "dbevent:updateuser:executed":
    "lrmwufitcheck-auth-service-dbevent-user-updated",
  "dbevent:updateuser:ended": "lrmwufitcheck-auth-service-dbevent-user-updated",
  "dbevent:updateuser:finished":
    "lrmwufitcheck-auth-service-dbevent-user-updated",
  "dbevent:updateuser:completed":
    "lrmwufitcheck-auth-service-dbevent-user-updated",
  "dbevent:updateuser:updated":
    "lrmwufitcheck-auth-service-dbevent-user-updated",
  updateprofile: "lrmwufitcheck-auth-service-profile-updated",
  "updateprofile:done": "lrmwufitcheck-auth-service-profile-updated",
  "updateprofile:executed": "lrmwufitcheck-auth-service-profile-updated",
  "updateprofile:ended": "lrmwufitcheck-auth-service-profile-updated",
  "updateprofile:finished": "lrmwufitcheck-auth-service-profile-updated",
  "updateprofile:completed": "lrmwufitcheck-auth-service-profile-updated",
  "updateprofile:updated": "lrmwufitcheck-auth-service-profile-updated",
  "dbevent:updateprofile": "lrmwufitcheck-auth-service-dbevent-user-updated",
  "dbevent:updateprofile:done":
    "lrmwufitcheck-auth-service-dbevent-user-updated",
  "dbevent:updateprofile:executed":
    "lrmwufitcheck-auth-service-dbevent-user-updated",
  "dbevent:updateprofile:ended":
    "lrmwufitcheck-auth-service-dbevent-user-updated",
  "dbevent:updateprofile:finished":
    "lrmwufitcheck-auth-service-dbevent-user-updated",
  "dbevent:updateprofile:completed":
    "lrmwufitcheck-auth-service-dbevent-user-updated",
  "dbevent:updateprofile:updated":
    "lrmwufitcheck-auth-service-dbevent-user-updated",
  createuser: "lrmwufitcheck-auth-service-user-created",
  "createuser:done": "lrmwufitcheck-auth-service-user-created",
  "createuser:executed": "lrmwufitcheck-auth-service-user-created",
  "createuser:ended": "lrmwufitcheck-auth-service-user-created",
  "createuser:finished": "lrmwufitcheck-auth-service-user-created",
  "createuser:completed": "lrmwufitcheck-auth-service-user-created",
  "createuser:created": "lrmwufitcheck-auth-service-user-created",
  "dbevent:createuser": "lrmwufitcheck-auth-service-dbevent-user-created",
  "dbevent:createuser:done": "lrmwufitcheck-auth-service-dbevent-user-created",
  "dbevent:createuser:executed":
    "lrmwufitcheck-auth-service-dbevent-user-created",
  "dbevent:createuser:ended": "lrmwufitcheck-auth-service-dbevent-user-created",
  "dbevent:createuser:finished":
    "lrmwufitcheck-auth-service-dbevent-user-created",
  "dbevent:createuser:completed":
    "lrmwufitcheck-auth-service-dbevent-user-created",
  "dbevent:createuser:created":
    "lrmwufitcheck-auth-service-dbevent-user-created",
  deleteuser: "lrmwufitcheck-auth-service-user-deleted",
  "deleteuser:done": "lrmwufitcheck-auth-service-user-deleted",
  "deleteuser:executed": "lrmwufitcheck-auth-service-user-deleted",
  "deleteuser:ended": "lrmwufitcheck-auth-service-user-deleted",
  "deleteuser:finished": "lrmwufitcheck-auth-service-user-deleted",
  "deleteuser:completed": "lrmwufitcheck-auth-service-user-deleted",
  "deleteuser:deleted": "lrmwufitcheck-auth-service-user-deleted",
  "dbevent:deleteuser": "lrmwufitcheck-auth-service-dbevent-user-deleted",
  "dbevent:deleteuser:done": "lrmwufitcheck-auth-service-dbevent-user-deleted",
  "dbevent:deleteuser:executed":
    "lrmwufitcheck-auth-service-dbevent-user-deleted",
  "dbevent:deleteuser:ended": "lrmwufitcheck-auth-service-dbevent-user-deleted",
  "dbevent:deleteuser:finished":
    "lrmwufitcheck-auth-service-dbevent-user-deleted",
  "dbevent:deleteuser:completed":
    "lrmwufitcheck-auth-service-dbevent-user-deleted",
  "dbevent:deleteuser:deleted":
    "lrmwufitcheck-auth-service-dbevent-user-deleted",
  archiveprofile: "lrmwufitcheck-auth-service-profile-archived",
  "archiveprofile:done": "lrmwufitcheck-auth-service-profile-archived",
  "archiveprofile:executed": "lrmwufitcheck-auth-service-profile-archived",
  "archiveprofile:ended": "lrmwufitcheck-auth-service-profile-archived",
  "archiveprofile:finished": "lrmwufitcheck-auth-service-profile-archived",
  "archiveprofile:completed": "lrmwufitcheck-auth-service-profile-archived",
  "archiveprofile:archived": "lrmwufitcheck-auth-service-profile-archived",
  "dbevent:archiveprofile": "lrmwufitcheck-auth-service-dbevent-user-archived",
  "dbevent:archiveprofile:done":
    "lrmwufitcheck-auth-service-dbevent-user-archived",
  "dbevent:archiveprofile:executed":
    "lrmwufitcheck-auth-service-dbevent-user-archived",
  "dbevent:archiveprofile:ended":
    "lrmwufitcheck-auth-service-dbevent-user-archived",
  "dbevent:archiveprofile:finished":
    "lrmwufitcheck-auth-service-dbevent-user-archived",
  "dbevent:archiveprofile:completed":
    "lrmwufitcheck-auth-service-dbevent-user-archived",
  "dbevent:archiveprofile:archived":
    "lrmwufitcheck-auth-service-dbevent-user-archived",
  listusers: "lrmwufitcheck-auth-service-users-listed",
  "listusers:done": "lrmwufitcheck-auth-service-users-listed",
  "listusers:executed": "lrmwufitcheck-auth-service-users-listed",
  "listusers:ended": "lrmwufitcheck-auth-service-users-listed",
  "listusers:finished": "lrmwufitcheck-auth-service-users-listed",
  "listusers:completed": "lrmwufitcheck-auth-service-users-listed",
  "listusers:listed": "lrmwufitcheck-auth-service-users-listed",
  "dbevent:listusers": "lrmwufitcheck-auth-service-dbevent-user-listed",
  "dbevent:listusers:done": "lrmwufitcheck-auth-service-dbevent-user-listed",
  "dbevent:listusers:executed":
    "lrmwufitcheck-auth-service-dbevent-user-listed",
  "dbevent:listusers:ended": "lrmwufitcheck-auth-service-dbevent-user-listed",
  "dbevent:listusers:finished":
    "lrmwufitcheck-auth-service-dbevent-user-listed",
  "dbevent:listusers:completed":
    "lrmwufitcheck-auth-service-dbevent-user-listed",
  "dbevent:listusers:listed": "lrmwufitcheck-auth-service-dbevent-user-listed",
  searchusers: "lrmwufitcheck-auth-service-users-searched",
  "searchusers:done": "lrmwufitcheck-auth-service-users-searched",
  "searchusers:executed": "lrmwufitcheck-auth-service-users-searched",
  "searchusers:ended": "lrmwufitcheck-auth-service-users-searched",
  "searchusers:finished": "lrmwufitcheck-auth-service-users-searched",
  "searchusers:completed": "lrmwufitcheck-auth-service-users-searched",
  "searchusers:searched": "lrmwufitcheck-auth-service-users-searched",
  "dbevent:searchusers": "lrmwufitcheck-auth-service-dbevent-user-searched",
  "dbevent:searchusers:done":
    "lrmwufitcheck-auth-service-dbevent-user-searched",
  "dbevent:searchusers:executed":
    "lrmwufitcheck-auth-service-dbevent-user-searched",
  "dbevent:searchusers:ended":
    "lrmwufitcheck-auth-service-dbevent-user-searched",
  "dbevent:searchusers:finished":
    "lrmwufitcheck-auth-service-dbevent-user-searched",
  "dbevent:searchusers:completed":
    "lrmwufitcheck-auth-service-dbevent-user-searched",
  "dbevent:searchusers:searched":
    "lrmwufitcheck-auth-service-dbevent-user-searched",
  updateuserrole: "lrmwufitcheck-auth-service-userrole-updated",
  "updateuserrole:done": "lrmwufitcheck-auth-service-userrole-updated",
  "updateuserrole:executed": "lrmwufitcheck-auth-service-userrole-updated",
  "updateuserrole:ended": "lrmwufitcheck-auth-service-userrole-updated",
  "updateuserrole:finished": "lrmwufitcheck-auth-service-userrole-updated",
  "updateuserrole:completed": "lrmwufitcheck-auth-service-userrole-updated",
  "updateuserrole:updated": "lrmwufitcheck-auth-service-userrole-updated",
  "dbevent:updateuserrole": "lrmwufitcheck-auth-service-dbevent-user-updated",
  "dbevent:updateuserrole:done":
    "lrmwufitcheck-auth-service-dbevent-user-updated",
  "dbevent:updateuserrole:executed":
    "lrmwufitcheck-auth-service-dbevent-user-updated",
  "dbevent:updateuserrole:ended":
    "lrmwufitcheck-auth-service-dbevent-user-updated",
  "dbevent:updateuserrole:finished":
    "lrmwufitcheck-auth-service-dbevent-user-updated",
  "dbevent:updateuserrole:completed":
    "lrmwufitcheck-auth-service-dbevent-user-updated",
  "dbevent:updateuserrole:updated":
    "lrmwufitcheck-auth-service-dbevent-user-updated",
  updateuserpassword: "lrmwufitcheck-auth-service-userpassword-updated",
  "updateuserpassword:done": "lrmwufitcheck-auth-service-userpassword-updated",
  "updateuserpassword:executed":
    "lrmwufitcheck-auth-service-userpassword-updated",
  "updateuserpassword:ended": "lrmwufitcheck-auth-service-userpassword-updated",
  "updateuserpassword:finished":
    "lrmwufitcheck-auth-service-userpassword-updated",
  "updateuserpassword:completed":
    "lrmwufitcheck-auth-service-userpassword-updated",
  "updateuserpassword:updated":
    "lrmwufitcheck-auth-service-userpassword-updated",
  "dbevent:updateuserpassword":
    "lrmwufitcheck-auth-service-dbevent-user-updated",
  "dbevent:updateuserpassword:done":
    "lrmwufitcheck-auth-service-dbevent-user-updated",
  "dbevent:updateuserpassword:executed":
    "lrmwufitcheck-auth-service-dbevent-user-updated",
  "dbevent:updateuserpassword:ended":
    "lrmwufitcheck-auth-service-dbevent-user-updated",
  "dbevent:updateuserpassword:finished":
    "lrmwufitcheck-auth-service-dbevent-user-updated",
  "dbevent:updateuserpassword:completed":
    "lrmwufitcheck-auth-service-dbevent-user-updated",
  "dbevent:updateuserpassword:updated":
    "lrmwufitcheck-auth-service-dbevent-user-updated",
  updateuserpasswordbyadmin:
    "lrmwufitcheck-auth-service-userpasswordbyadmin-updated",
  "updateuserpasswordbyadmin:done":
    "lrmwufitcheck-auth-service-userpasswordbyadmin-updated",
  "updateuserpasswordbyadmin:executed":
    "lrmwufitcheck-auth-service-userpasswordbyadmin-updated",
  "updateuserpasswordbyadmin:ended":
    "lrmwufitcheck-auth-service-userpasswordbyadmin-updated",
  "updateuserpasswordbyadmin:finished":
    "lrmwufitcheck-auth-service-userpasswordbyadmin-updated",
  "updateuserpasswordbyadmin:completed":
    "lrmwufitcheck-auth-service-userpasswordbyadmin-updated",
  "updateuserpasswordbyadmin:updated":
    "lrmwufitcheck-auth-service-userpasswordbyadmin-updated",
  "dbevent:updateuserpasswordbyadmin":
    "lrmwufitcheck-auth-service-dbevent-user-updated",
  "dbevent:updateuserpasswordbyadmin:done":
    "lrmwufitcheck-auth-service-dbevent-user-updated",
  "dbevent:updateuserpasswordbyadmin:executed":
    "lrmwufitcheck-auth-service-dbevent-user-updated",
  "dbevent:updateuserpasswordbyadmin:ended":
    "lrmwufitcheck-auth-service-dbevent-user-updated",
  "dbevent:updateuserpasswordbyadmin:finished":
    "lrmwufitcheck-auth-service-dbevent-user-updated",
  "dbevent:updateuserpasswordbyadmin:completed":
    "lrmwufitcheck-auth-service-dbevent-user-updated",
  "dbevent:updateuserpasswordbyadmin:updated":
    "lrmwufitcheck-auth-service-dbevent-user-updated",
  getbriefuser: "lrmwufitcheck-auth-service-briefuser-retrived",
  "getbriefuser:done": "lrmwufitcheck-auth-service-briefuser-retrived",
  "getbriefuser:executed": "lrmwufitcheck-auth-service-briefuser-retrived",
  "getbriefuser:ended": "lrmwufitcheck-auth-service-briefuser-retrived",
  "getbriefuser:finished": "lrmwufitcheck-auth-service-briefuser-retrived",
  "getbriefuser:completed": "lrmwufitcheck-auth-service-briefuser-retrived",
  "getbriefuser:got": "lrmwufitcheck-auth-service-briefuser-retrived",
  "dbevent:getbriefuser": "lrmwufitcheck-auth-service-dbevent-user-got",
  "dbevent:getbriefuser:done": "lrmwufitcheck-auth-service-dbevent-user-got",
  "dbevent:getbriefuser:executed":
    "lrmwufitcheck-auth-service-dbevent-user-got",
  "dbevent:getbriefuser:ended": "lrmwufitcheck-auth-service-dbevent-user-got",
  "dbevent:getbriefuser:finished":
    "lrmwufitcheck-auth-service-dbevent-user-got",
  "dbevent:getbriefuser:completed":
    "lrmwufitcheck-auth-service-dbevent-user-got",
  "dbevent:getbriefuser:got": "lrmwufitcheck-auth-service-dbevent-user-got",
  streamtest: "lrmwufitcheck-auth-service-test-streamed",
  "streamtest:done": "lrmwufitcheck-auth-service-test-streamed",
  "streamtest:executed": "lrmwufitcheck-auth-service-test-streamed",
  "streamtest:ended": "lrmwufitcheck-auth-service-test-streamed",
  "streamtest:finished": "lrmwufitcheck-auth-service-test-streamed",
  "streamtest:completed": "lrmwufitcheck-auth-service-test-streamed",
  "streamtest:streamed": "lrmwufitcheck-auth-service-test-streamed",
  "dbevent:streamtest": "lrmwufitcheck-auth-service-dbevent-user-streamed",
  "dbevent:streamtest:done": "lrmwufitcheck-auth-service-dbevent-user-streamed",
  "dbevent:streamtest:executed":
    "lrmwufitcheck-auth-service-dbevent-user-streamed",
  "dbevent:streamtest:ended":
    "lrmwufitcheck-auth-service-dbevent-user-streamed",
  "dbevent:streamtest:finished":
    "lrmwufitcheck-auth-service-dbevent-user-streamed",
  "dbevent:streamtest:completed":
    "lrmwufitcheck-auth-service-dbevent-user-streamed",
  "dbevent:streamtest:streamed":
    "lrmwufitcheck-auth-service-dbevent-user-streamed",
  getuseravatarsfile: "lrmwufitcheck-auth-service-useravatarsfile-retrived",
  "getuseravatarsfile:done":
    "lrmwufitcheck-auth-service-useravatarsfile-retrived",
  "getuseravatarsfile:executed":
    "lrmwufitcheck-auth-service-useravatarsfile-retrived",
  "getuseravatarsfile:ended":
    "lrmwufitcheck-auth-service-useravatarsfile-retrived",
  "getuseravatarsfile:finished":
    "lrmwufitcheck-auth-service-useravatarsfile-retrived",
  "getuseravatarsfile:completed":
    "lrmwufitcheck-auth-service-useravatarsfile-retrived",
  "getuseravatarsfile:got":
    "lrmwufitcheck-auth-service-useravatarsfile-retrived",
  "dbevent:getuseravatarsfile":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-got",
  "dbevent:getuseravatarsfile:done":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-got",
  "dbevent:getuseravatarsfile:executed":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-got",
  "dbevent:getuseravatarsfile:ended":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-got",
  "dbevent:getuseravatarsfile:finished":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-got",
  "dbevent:getuseravatarsfile:completed":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-got",
  "dbevent:getuseravatarsfile:got":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-got",
  listuseravatarsfiles: "lrmwufitcheck-auth-service-useravatarsfiles-listed",
  "listuseravatarsfiles:done":
    "lrmwufitcheck-auth-service-useravatarsfiles-listed",
  "listuseravatarsfiles:executed":
    "lrmwufitcheck-auth-service-useravatarsfiles-listed",
  "listuseravatarsfiles:ended":
    "lrmwufitcheck-auth-service-useravatarsfiles-listed",
  "listuseravatarsfiles:finished":
    "lrmwufitcheck-auth-service-useravatarsfiles-listed",
  "listuseravatarsfiles:completed":
    "lrmwufitcheck-auth-service-useravatarsfiles-listed",
  "listuseravatarsfiles:listed":
    "lrmwufitcheck-auth-service-useravatarsfiles-listed",
  "dbevent:listuseravatarsfiles":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-listed",
  "dbevent:listuseravatarsfiles:done":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-listed",
  "dbevent:listuseravatarsfiles:executed":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-listed",
  "dbevent:listuseravatarsfiles:ended":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-listed",
  "dbevent:listuseravatarsfiles:finished":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-listed",
  "dbevent:listuseravatarsfiles:completed":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-listed",
  "dbevent:listuseravatarsfiles:listed":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-listed",
  deleteuseravatarsfile: "lrmwufitcheck-auth-service-useravatarsfile-deleted",
  "deleteuseravatarsfile:done":
    "lrmwufitcheck-auth-service-useravatarsfile-deleted",
  "deleteuseravatarsfile:executed":
    "lrmwufitcheck-auth-service-useravatarsfile-deleted",
  "deleteuseravatarsfile:ended":
    "lrmwufitcheck-auth-service-useravatarsfile-deleted",
  "deleteuseravatarsfile:finished":
    "lrmwufitcheck-auth-service-useravatarsfile-deleted",
  "deleteuseravatarsfile:completed":
    "lrmwufitcheck-auth-service-useravatarsfile-deleted",
  "deleteuseravatarsfile:deleted":
    "lrmwufitcheck-auth-service-useravatarsfile-deleted",
  "dbevent:deleteuseravatarsfile":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-deleted",
  "dbevent:deleteuseravatarsfile:done":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-deleted",
  "dbevent:deleteuseravatarsfile:executed":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-deleted",
  "dbevent:deleteuseravatarsfile:ended":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-deleted",
  "dbevent:deleteuseravatarsfile:finished":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-deleted",
  "dbevent:deleteuseravatarsfile:completed":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-deleted",
  "dbevent:deleteuseravatarsfile:deleted":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-deleted",
  _fetchlistuseravatarsfile:
    "lrmwufitcheck-auth-service-listuseravatarsfile-_fetched",
  "_fetchlistuseravatarsfile:done":
    "lrmwufitcheck-auth-service-listuseravatarsfile-_fetched",
  "_fetchlistuseravatarsfile:executed":
    "lrmwufitcheck-auth-service-listuseravatarsfile-_fetched",
  "_fetchlistuseravatarsfile:ended":
    "lrmwufitcheck-auth-service-listuseravatarsfile-_fetched",
  "_fetchlistuseravatarsfile:finished":
    "lrmwufitcheck-auth-service-listuseravatarsfile-_fetched",
  "_fetchlistuseravatarsfile:completed":
    "lrmwufitcheck-auth-service-listuseravatarsfile-_fetched",
  "_fetchlistuseravatarsfile:_fetched":
    "lrmwufitcheck-auth-service-listuseravatarsfile-_fetched",
  "dbevent:_fetchlistuseravatarsfile":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-_fetched",
  "dbevent:_fetchlistuseravatarsfile:done":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-_fetched",
  "dbevent:_fetchlistuseravatarsfile:executed":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-_fetched",
  "dbevent:_fetchlistuseravatarsfile:ended":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-_fetched",
  "dbevent:_fetchlistuseravatarsfile:finished":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-_fetched",
  "dbevent:_fetchlistuseravatarsfile:completed":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-_fetched",
  "dbevent:_fetchlistuseravatarsfile:_fetched":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-_fetched",
  "user:created": "lrmwufitcheck-auth-service-user-created",
  "dbevent:user:created": "lrmwufitcheck-auth-service-dbevent-user-created",
  "user:updated": "lrmwufitcheck-auth-service-user-updated",
  "dbevent:user:updated": "lrmwufitcheck-auth-service-dbevent-user-updated",
  "user:deleted": "lrmwufitcheck-auth-service-user-deleted",
  "dbevent:user:deleted": "lrmwufitcheck-auth-service-dbevent-user-deleted",
  "user:listed": "lrmwufitcheck-auth-service-dbevent-user-listed",
  "dbevent:user:listed": "lrmwufitcheck-auth-service-dbevent-user-listed",
  "user:retrieved": "lrmwufitcheck-auth-service-dbevent-user-retrieved",
  "dbevent:user:retrieved": "lrmwufitcheck-auth-service-dbevent-user-retrieved",
  "user:got": "lrmwufitcheck-auth-service-user-retrived",
  "user:archived": "lrmwufitcheck-auth-service-profile-archived",
  "user:searched": "lrmwufitcheck-auth-service-users-searched",
  "user:streamed": "lrmwufitcheck-auth-service-test-streamed",
  "useravatarsfile:created":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-created",
  "dbevent:useravatarsfile:created":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-created",
  "useravatarsfile:updated":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-updated",
  "dbevent:useravatarsfile:updated":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-updated",
  "useravatarsfile:deleted":
    "lrmwufitcheck-auth-service-useravatarsfile-deleted",
  "dbevent:useravatarsfile:deleted":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-deleted",
  "useravatarsfile:listed":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-listed",
  "dbevent:useravatarsfile:listed":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-listed",
  "useravatarsfile:retrieved":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-retrieved",
  "dbevent:useravatarsfile:retrieved":
    "lrmwufitcheck-auth-service-dbevent-useravatarsfile-retrieved",
  "useravatarsfile:got": "lrmwufitcheck-auth-service-useravatarsfile-retrived",
  "useravatarsfile:_fetched":
    "lrmwufitcheck-auth-service-listuseravatarsfile-_fetched",
  getagentoverride: "lrmwufitcheck-agenthub-service-agentoverride-retrived",
  "getagentoverride:done":
    "lrmwufitcheck-agenthub-service-agentoverride-retrived",
  "getagentoverride:executed":
    "lrmwufitcheck-agenthub-service-agentoverride-retrived",
  "getagentoverride:ended":
    "lrmwufitcheck-agenthub-service-agentoverride-retrived",
  "getagentoverride:finished":
    "lrmwufitcheck-agenthub-service-agentoverride-retrived",
  "getagentoverride:completed":
    "lrmwufitcheck-agenthub-service-agentoverride-retrived",
  "getagentoverride:got":
    "lrmwufitcheck-agenthub-service-agentoverride-retrived",
  "dbevent:getagentoverride":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-got",
  "dbevent:getagentoverride:done":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-got",
  "dbevent:getagentoverride:executed":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-got",
  "dbevent:getagentoverride:ended":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-got",
  "dbevent:getagentoverride:finished":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-got",
  "dbevent:getagentoverride:completed":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-got",
  "dbevent:getagentoverride:got":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-got",
  listagentoverrides: "lrmwufitcheck-agenthub-service-agentoverrides-listed",
  "listagentoverrides:done":
    "lrmwufitcheck-agenthub-service-agentoverrides-listed",
  "listagentoverrides:executed":
    "lrmwufitcheck-agenthub-service-agentoverrides-listed",
  "listagentoverrides:ended":
    "lrmwufitcheck-agenthub-service-agentoverrides-listed",
  "listagentoverrides:finished":
    "lrmwufitcheck-agenthub-service-agentoverrides-listed",
  "listagentoverrides:completed":
    "lrmwufitcheck-agenthub-service-agentoverrides-listed",
  "listagentoverrides:listed":
    "lrmwufitcheck-agenthub-service-agentoverrides-listed",
  "dbevent:listagentoverrides":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-listed",
  "dbevent:listagentoverrides:done":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-listed",
  "dbevent:listagentoverrides:executed":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-listed",
  "dbevent:listagentoverrides:ended":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-listed",
  "dbevent:listagentoverrides:finished":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-listed",
  "dbevent:listagentoverrides:completed":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-listed",
  "dbevent:listagentoverrides:listed":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-listed",
  createagentoverride: "lrmwufitcheck-agenthub-service-agentoverride-created",
  "createagentoverride:done":
    "lrmwufitcheck-agenthub-service-agentoverride-created",
  "createagentoverride:executed":
    "lrmwufitcheck-agenthub-service-agentoverride-created",
  "createagentoverride:ended":
    "lrmwufitcheck-agenthub-service-agentoverride-created",
  "createagentoverride:finished":
    "lrmwufitcheck-agenthub-service-agentoverride-created",
  "createagentoverride:completed":
    "lrmwufitcheck-agenthub-service-agentoverride-created",
  "createagentoverride:created":
    "lrmwufitcheck-agenthub-service-agentoverride-created",
  "dbevent:createagentoverride":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-created",
  "dbevent:createagentoverride:done":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-created",
  "dbevent:createagentoverride:executed":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-created",
  "dbevent:createagentoverride:ended":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-created",
  "dbevent:createagentoverride:finished":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-created",
  "dbevent:createagentoverride:completed":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-created",
  "dbevent:createagentoverride:created":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-created",
  updateagentoverride: "lrmwufitcheck-agenthub-service-agentoverride-updated",
  "updateagentoverride:done":
    "lrmwufitcheck-agenthub-service-agentoverride-updated",
  "updateagentoverride:executed":
    "lrmwufitcheck-agenthub-service-agentoverride-updated",
  "updateagentoverride:ended":
    "lrmwufitcheck-agenthub-service-agentoverride-updated",
  "updateagentoverride:finished":
    "lrmwufitcheck-agenthub-service-agentoverride-updated",
  "updateagentoverride:completed":
    "lrmwufitcheck-agenthub-service-agentoverride-updated",
  "updateagentoverride:updated":
    "lrmwufitcheck-agenthub-service-agentoverride-updated",
  "dbevent:updateagentoverride":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-updated",
  "dbevent:updateagentoverride:done":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-updated",
  "dbevent:updateagentoverride:executed":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-updated",
  "dbevent:updateagentoverride:ended":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-updated",
  "dbevent:updateagentoverride:finished":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-updated",
  "dbevent:updateagentoverride:completed":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-updated",
  "dbevent:updateagentoverride:updated":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-updated",
  deleteagentoverride: "lrmwufitcheck-agenthub-service-agentoverride-deleted",
  "deleteagentoverride:done":
    "lrmwufitcheck-agenthub-service-agentoverride-deleted",
  "deleteagentoverride:executed":
    "lrmwufitcheck-agenthub-service-agentoverride-deleted",
  "deleteagentoverride:ended":
    "lrmwufitcheck-agenthub-service-agentoverride-deleted",
  "deleteagentoverride:finished":
    "lrmwufitcheck-agenthub-service-agentoverride-deleted",
  "deleteagentoverride:completed":
    "lrmwufitcheck-agenthub-service-agentoverride-deleted",
  "deleteagentoverride:deleted":
    "lrmwufitcheck-agenthub-service-agentoverride-deleted",
  "dbevent:deleteagentoverride":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-deleted",
  "dbevent:deleteagentoverride:done":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-deleted",
  "dbevent:deleteagentoverride:executed":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-deleted",
  "dbevent:deleteagentoverride:ended":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-deleted",
  "dbevent:deleteagentoverride:finished":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-deleted",
  "dbevent:deleteagentoverride:completed":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-deleted",
  "dbevent:deleteagentoverride:deleted":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-deleted",
  listtoolcatalog: "lrmwufitcheck-agenthub-service-toolcatalog-listed",
  "listtoolcatalog:done": "lrmwufitcheck-agenthub-service-toolcatalog-listed",
  "listtoolcatalog:executed":
    "lrmwufitcheck-agenthub-service-toolcatalog-listed",
  "listtoolcatalog:ended": "lrmwufitcheck-agenthub-service-toolcatalog-listed",
  "listtoolcatalog:finished":
    "lrmwufitcheck-agenthub-service-toolcatalog-listed",
  "listtoolcatalog:completed":
    "lrmwufitcheck-agenthub-service-toolcatalog-listed",
  "listtoolcatalog:listed": "lrmwufitcheck-agenthub-service-toolcatalog-listed",
  "dbevent:listtoolcatalog":
    "lrmwufitcheck-agenthub-service-dbevent-sys_toolcatalog-listed",
  "dbevent:listtoolcatalog:done":
    "lrmwufitcheck-agenthub-service-dbevent-sys_toolcatalog-listed",
  "dbevent:listtoolcatalog:executed":
    "lrmwufitcheck-agenthub-service-dbevent-sys_toolcatalog-listed",
  "dbevent:listtoolcatalog:ended":
    "lrmwufitcheck-agenthub-service-dbevent-sys_toolcatalog-listed",
  "dbevent:listtoolcatalog:finished":
    "lrmwufitcheck-agenthub-service-dbevent-sys_toolcatalog-listed",
  "dbevent:listtoolcatalog:completed":
    "lrmwufitcheck-agenthub-service-dbevent-sys_toolcatalog-listed",
  "dbevent:listtoolcatalog:listed":
    "lrmwufitcheck-agenthub-service-dbevent-sys_toolcatalog-listed",
  gettoolcatalogentry:
    "lrmwufitcheck-agenthub-service-toolcatalogentry-retrived",
  "gettoolcatalogentry:done":
    "lrmwufitcheck-agenthub-service-toolcatalogentry-retrived",
  "gettoolcatalogentry:executed":
    "lrmwufitcheck-agenthub-service-toolcatalogentry-retrived",
  "gettoolcatalogentry:ended":
    "lrmwufitcheck-agenthub-service-toolcatalogentry-retrived",
  "gettoolcatalogentry:finished":
    "lrmwufitcheck-agenthub-service-toolcatalogentry-retrived",
  "gettoolcatalogentry:completed":
    "lrmwufitcheck-agenthub-service-toolcatalogentry-retrived",
  "gettoolcatalogentry:got":
    "lrmwufitcheck-agenthub-service-toolcatalogentry-retrived",
  "dbevent:gettoolcatalogentry":
    "lrmwufitcheck-agenthub-service-dbevent-sys_toolcatalog-got",
  "dbevent:gettoolcatalogentry:done":
    "lrmwufitcheck-agenthub-service-dbevent-sys_toolcatalog-got",
  "dbevent:gettoolcatalogentry:executed":
    "lrmwufitcheck-agenthub-service-dbevent-sys_toolcatalog-got",
  "dbevent:gettoolcatalogentry:ended":
    "lrmwufitcheck-agenthub-service-dbevent-sys_toolcatalog-got",
  "dbevent:gettoolcatalogentry:finished":
    "lrmwufitcheck-agenthub-service-dbevent-sys_toolcatalog-got",
  "dbevent:gettoolcatalogentry:completed":
    "lrmwufitcheck-agenthub-service-dbevent-sys_toolcatalog-got",
  "dbevent:gettoolcatalogentry:got":
    "lrmwufitcheck-agenthub-service-dbevent-sys_toolcatalog-got",
  listagentexecutions: "lrmwufitcheck-agenthub-service-agentexecutions-listed",
  "listagentexecutions:done":
    "lrmwufitcheck-agenthub-service-agentexecutions-listed",
  "listagentexecutions:executed":
    "lrmwufitcheck-agenthub-service-agentexecutions-listed",
  "listagentexecutions:ended":
    "lrmwufitcheck-agenthub-service-agentexecutions-listed",
  "listagentexecutions:finished":
    "lrmwufitcheck-agenthub-service-agentexecutions-listed",
  "listagentexecutions:completed":
    "lrmwufitcheck-agenthub-service-agentexecutions-listed",
  "listagentexecutions:listed":
    "lrmwufitcheck-agenthub-service-agentexecutions-listed",
  "dbevent:listagentexecutions":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentexecution-listed",
  "dbevent:listagentexecutions:done":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentexecution-listed",
  "dbevent:listagentexecutions:executed":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentexecution-listed",
  "dbevent:listagentexecutions:ended":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentexecution-listed",
  "dbevent:listagentexecutions:finished":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentexecution-listed",
  "dbevent:listagentexecutions:completed":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentexecution-listed",
  "dbevent:listagentexecutions:listed":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentexecution-listed",
  getagentexecution: "lrmwufitcheck-agenthub-service-agentexecution-retrived",
  "getagentexecution:done":
    "lrmwufitcheck-agenthub-service-agentexecution-retrived",
  "getagentexecution:executed":
    "lrmwufitcheck-agenthub-service-agentexecution-retrived",
  "getagentexecution:ended":
    "lrmwufitcheck-agenthub-service-agentexecution-retrived",
  "getagentexecution:finished":
    "lrmwufitcheck-agenthub-service-agentexecution-retrived",
  "getagentexecution:completed":
    "lrmwufitcheck-agenthub-service-agentexecution-retrived",
  "getagentexecution:got":
    "lrmwufitcheck-agenthub-service-agentexecution-retrived",
  "dbevent:getagentexecution":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentexecution-got",
  "dbevent:getagentexecution:done":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentexecution-got",
  "dbevent:getagentexecution:executed":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentexecution-got",
  "dbevent:getagentexecution:ended":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentexecution-got",
  "dbevent:getagentexecution:finished":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentexecution-got",
  "dbevent:getagentexecution:completed":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentexecution-got",
  "dbevent:getagentexecution:got":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentexecution-got",
  _fetchlistsys_agentoverride:
    "lrmwufitcheck-agenthub-service-listsys_agentoverride-_fetched",
  "_fetchlistsys_agentoverride:done":
    "lrmwufitcheck-agenthub-service-listsys_agentoverride-_fetched",
  "_fetchlistsys_agentoverride:executed":
    "lrmwufitcheck-agenthub-service-listsys_agentoverride-_fetched",
  "_fetchlistsys_agentoverride:ended":
    "lrmwufitcheck-agenthub-service-listsys_agentoverride-_fetched",
  "_fetchlistsys_agentoverride:finished":
    "lrmwufitcheck-agenthub-service-listsys_agentoverride-_fetched",
  "_fetchlistsys_agentoverride:completed":
    "lrmwufitcheck-agenthub-service-listsys_agentoverride-_fetched",
  "_fetchlistsys_agentoverride:_fetched":
    "lrmwufitcheck-agenthub-service-listsys_agentoverride-_fetched",
  "dbevent:_fetchlistsys_agentoverride":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-_fetched",
  "dbevent:_fetchlistsys_agentoverride:done":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-_fetched",
  "dbevent:_fetchlistsys_agentoverride:executed":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-_fetched",
  "dbevent:_fetchlistsys_agentoverride:ended":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-_fetched",
  "dbevent:_fetchlistsys_agentoverride:finished":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-_fetched",
  "dbevent:_fetchlistsys_agentoverride:completed":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-_fetched",
  "dbevent:_fetchlistsys_agentoverride:_fetched":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentoverride-_fetched",
  _fetchlistsys_agentexecution:
    "lrmwufitcheck-agenthub-service-listsys_agentexecution-_fetched",
  "_fetchlistsys_agentexecution:done":
    "lrmwufitcheck-agenthub-service-listsys_agentexecution-_fetched",
  "_fetchlistsys_agentexecution:executed":
    "lrmwufitcheck-agenthub-service-listsys_agentexecution-_fetched",
  "_fetchlistsys_agentexecution:ended":
    "lrmwufitcheck-agenthub-service-listsys_agentexecution-_fetched",
  "_fetchlistsys_agentexecution:finished":
    "lrmwufitcheck-agenthub-service-listsys_agentexecution-_fetched",
  "_fetchlistsys_agentexecution:completed":
    "lrmwufitcheck-agenthub-service-listsys_agentexecution-_fetched",
  "_fetchlistsys_agentexecution:_fetched":
    "lrmwufitcheck-agenthub-service-listsys_agentexecution-_fetched",
  "dbevent:_fetchlistsys_agentexecution":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentexecution-_fetched",
  "dbevent:_fetchlistsys_agentexecution:done":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentexecution-_fetched",
  "dbevent:_fetchlistsys_agentexecution:executed":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentexecution-_fetched",
  "dbevent:_fetchlistsys_agentexecution:ended":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentexecution-_fetched",
  "dbevent:_fetchlistsys_agentexecution:finished":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentexecution-_fetched",
  "dbevent:_fetchlistsys_agentexecution:completed":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentexecution-_fetched",
  "dbevent:_fetchlistsys_agentexecution:_fetched":
    "lrmwufitcheck-agenthub-service-dbevent-sys_agentexecution-_fetched",
  _fetchlistsys_toolcatalog:
    "lrmwufitcheck-agenthub-service-listsys_toolcatalog-_fetched",
  "_fetchlistsys_toolcatalog:done":
    "lrmwufitcheck-agenthub-service-listsys_toolcatalog-_fetched",
  "_fetchlistsys_toolcatalog:executed":
    "lrmwufitcheck-agenthub-service-listsys_toolcatalog-_fetched",
  "_fetchlistsys_toolcatalog:ended":
    "lrmwufitcheck-agenthub-service-listsys_toolcatalog-_fetched",
  "_fetchlistsys_toolcatalog:finished":
    "lrmwufitcheck-agenthub-service-listsys_toolcatalog-_fetched",
  "_fetchlistsys_toolcatalog:completed":
    "lrmwufitcheck-agenthub-service-listsys_toolcatalog-_fetched",
  "_fetchlistsys_toolcatalog:_fetched":
    "lrmwufitcheck-agenthub-service-listsys_toolcatalog-_fetched",
  "dbevent:_fetchlistsys_toolcatalog":
    "lrmwufitcheck-agenthub-service-dbevent-sys_toolcatalog-_fetched",
  "dbevent:_fetchlistsys_toolcatalog:done":
    "lrmwufitcheck-agenthub-service-dbevent-sys_toolcatalog-_fetched",
  "dbevent:_fetchlistsys_toolcatalog:executed":
    "lrmwufitcheck-agenthub-service-dbevent-sys_toolcatalog-_fetched",
  "dbevent:_fetchlistsys_toolcatalog:ended":
    "lrmwufitcheck-agenthub-service-dbevent-sys_toolcatalog-_fetched",
  "dbevent:_fetchlistsys_toolcatalog:finished":
    "lrmwufitcheck-agenthub-service-dbevent-sys_toolcatalog-_fetched",
  "dbevent:_fetchlistsys_toolcatalog:completed":
    "lrmwufitcheck-agenthub-service-dbevent-sys_toolcatalog-_fetched",
  "dbevent:_fetchlistsys_toolcatalog:_fetched":
    "lrmwufitcheck-agenthub-service-dbevent-sys_toolcatalog-_fetched",
  "sysagentoverride:created":
    "lrmwufitcheck-agenthub-service-agentoverride-created",
  "dbevent:sysagentoverride:created":
    "lrmwufitcheck-agenthub-service-dbevent-sysagentoverride-created",
  "sysagentoverride:updated":
    "lrmwufitcheck-agenthub-service-dbevent-sysagentoverride-updated",
  "dbevent:sysagentoverride:updated":
    "lrmwufitcheck-agenthub-service-dbevent-sysagentoverride-updated",
  "sysagentoverride:deleted":
    "lrmwufitcheck-agenthub-service-agentoverride-deleted",
  "dbevent:sysagentoverride:deleted":
    "lrmwufitcheck-agenthub-service-dbevent-sysagentoverride-deleted",
  "sysagentoverride:listed":
    "lrmwufitcheck-agenthub-service-dbevent-sysagentoverride-listed",
  "dbevent:sysagentoverride:listed":
    "lrmwufitcheck-agenthub-service-dbevent-sysagentoverride-listed",
  "sysagentoverride:retrieved":
    "lrmwufitcheck-agenthub-service-dbevent-sysagentoverride-retrieved",
  "dbevent:sysagentoverride:retrieved":
    "lrmwufitcheck-agenthub-service-dbevent-sysagentoverride-retrieved",
  "sysagentoverride:got":
    "lrmwufitcheck-agenthub-service-agentoverride-retrived",
  "sysagentoverride:_fetched":
    "lrmwufitcheck-agenthub-service-listsys_agentoverride-_fetched",
  "sysagentexecution:created":
    "lrmwufitcheck-agenthub-service-dbevent-sysagentexecution-created",
  "dbevent:sysagentexecution:created":
    "lrmwufitcheck-agenthub-service-dbevent-sysagentexecution-created",
  "sysagentexecution:updated":
    "lrmwufitcheck-agenthub-service-dbevent-sysagentexecution-updated",
  "dbevent:sysagentexecution:updated":
    "lrmwufitcheck-agenthub-service-dbevent-sysagentexecution-updated",
  "sysagentexecution:deleted":
    "lrmwufitcheck-agenthub-service-dbevent-sysagentexecution-deleted",
  "dbevent:sysagentexecution:deleted":
    "lrmwufitcheck-agenthub-service-dbevent-sysagentexecution-deleted",
  "sysagentexecution:listed":
    "lrmwufitcheck-agenthub-service-dbevent-sysagentexecution-listed",
  "dbevent:sysagentexecution:listed":
    "lrmwufitcheck-agenthub-service-dbevent-sysagentexecution-listed",
  "sysagentexecution:retrieved":
    "lrmwufitcheck-agenthub-service-dbevent-sysagentexecution-retrieved",
  "dbevent:sysagentexecution:retrieved":
    "lrmwufitcheck-agenthub-service-dbevent-sysagentexecution-retrieved",
  "sysagentexecution:got":
    "lrmwufitcheck-agenthub-service-agentexecution-retrived",
  "sysagentexecution:_fetched":
    "lrmwufitcheck-agenthub-service-listsys_agentexecution-_fetched",
  "systoolcatalog:created":
    "lrmwufitcheck-agenthub-service-dbevent-systoolcatalog-created",
  "dbevent:systoolcatalog:created":
    "lrmwufitcheck-agenthub-service-dbevent-systoolcatalog-created",
  "systoolcatalog:updated":
    "lrmwufitcheck-agenthub-service-dbevent-systoolcatalog-updated",
  "dbevent:systoolcatalog:updated":
    "lrmwufitcheck-agenthub-service-dbevent-systoolcatalog-updated",
  "systoolcatalog:deleted":
    "lrmwufitcheck-agenthub-service-dbevent-systoolcatalog-deleted",
  "dbevent:systoolcatalog:deleted":
    "lrmwufitcheck-agenthub-service-dbevent-systoolcatalog-deleted",
  "systoolcatalog:listed":
    "lrmwufitcheck-agenthub-service-dbevent-systoolcatalog-listed",
  "dbevent:systoolcatalog:listed":
    "lrmwufitcheck-agenthub-service-dbevent-systoolcatalog-listed",
  "systoolcatalog:retrieved":
    "lrmwufitcheck-agenthub-service-dbevent-systoolcatalog-retrieved",
  "dbevent:systoolcatalog:retrieved":
    "lrmwufitcheck-agenthub-service-dbevent-systoolcatalog-retrieved",
  "systoolcatalog:got":
    "lrmwufitcheck-agenthub-service-toolcatalogentry-retrived",
  "systoolcatalog:_fetched":
    "lrmwufitcheck-agenthub-service-listsys_toolcatalog-_fetched",
};

const ALIAS_DELIMITERS = /[.:_]/;

function normalizeName(name) {
  return String(name || "")
    .replace(/[-_]/g, "")
    .toLowerCase();
}

/**
 * Resolve a Kafka topic alias to a real topic name at runtime.
 * Accepts aliases like "createUser:done", "user.created", "review_updated".
 * If the input is not a recognized alias, returns it unchanged.
 */
function resolveTopicAlias(input) {
  if (!input || typeof input !== "string") return input;
  const trimmed = input.trim();

  let asset, event;

  if (ALIAS_DELIMITERS.test(trimmed)) {
    const idx = trimmed.search(ALIAS_DELIMITERS);
    asset = trimmed.slice(0, idx);
    event = trimmed.slice(idx + 1);
  } else {
    // Single word — try as an API name for its default event
    const singleKey = trimmed.toLowerCase();
    if (ALIAS_MAP[singleKey]) return ALIAS_MAP[singleKey];

    const lastHyphen = trimmed.lastIndexOf("-");
    if (lastHyphen > 0 && lastHyphen < trimmed.length - 1) {
      asset = trimmed.slice(0, lastHyphen);
      event = trimmed.slice(lastHyphen + 1);
    } else {
      return trimmed;
    }
  }

  if (!asset || !event) return trimmed;

  // Explicit "dbEvent:object:action" prefix — force DB-level topic
  if (normalizeName(asset) === "dbevent" && event) {
    let innerAsset, innerEvent;
    if (ALIAS_DELIMITERS.test(event)) {
      const innerIdx = event.search(ALIAS_DELIMITERS);
      innerAsset = event.slice(0, innerIdx);
      innerEvent = event.slice(innerIdx + 1);
    } else {
      const lh = event.lastIndexOf("-");
      if (lh > 0) {
        innerAsset = event.slice(0, lh);
        innerEvent = event.slice(lh + 1);
      }
    }
    if (innerAsset && innerEvent) {
      const dbKey = `dbevent:${normalizeName(innerAsset)}:${innerEvent.toLowerCase().trim()}`;
      if (ALIAS_MAP[dbKey]) return ALIAS_MAP[dbKey];
    } else if (event) {
      // Two-segment: dbEvent:apiName — look up the API's default DB event
      const dbApiKey = `dbevent:${normalizeName(event)}`;
      if (ALIAS_MAP[dbApiKey]) return ALIAS_MAP[dbApiKey];
    }
    return trimmed;
  }

  const key = `${normalizeName(asset)}:${event.toLowerCase().trim()}`;
  if (ALIAS_MAP[key]) return ALIAS_MAP[key];

  // Fallback: try the input as-is (it's a literal topic name)
  return trimmed;
}

module.exports = { resolveTopicAlias, ALIAS_MAP };
