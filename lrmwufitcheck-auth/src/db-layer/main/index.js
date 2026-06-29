const userFunctions = require("./user");
const userAvatarsFileFunctions = require("./userAvatarsFile");

module.exports = {
  // main Database
  createUser: userFunctions.createUser,
  createBulkUser: userFunctions.createBulkUser,
  getIdListOfUserByField: userFunctions.getIdListOfUserByField,
  getUserById: userFunctions.getUserById,
  getUserAggById: userFunctions.getUserAggById,
  getUserListByQuery: userFunctions.getUserListByQuery,
  getUserListByMQuery: userFunctions.getUserListByMQuery,
  getUserStatsByQuery: userFunctions.getUserStatsByQuery,
  getUserStatsByMQuery: userFunctions.getUserStatsByMQuery,
  getUserByQuery: userFunctions.getUserByQuery,
  getUserByMQuery: userFunctions.getUserByMQuery,
  updateUserById: userFunctions.updateUserById,
  updateUserByIdList: userFunctions.updateUserByIdList,
  updateUserByQuery: userFunctions.updateUserByQuery,
  updateUserByMQuery: userFunctions.updateUserByMQuery,
  deleteUserById: userFunctions.deleteUserById,
  deleteUserByQuery: userFunctions.deleteUserByQuery,
  deleteUserByMQuery: userFunctions.deleteUserByMQuery,
  getUserByEmail: userFunctions.getUserByEmail,
  getCachedUserById: userFunctions.getCachedUserById,
  dbScriptGetUser: userFunctions.dbScriptGetUser,
  dbScriptUpdateUser: userFunctions.dbScriptUpdateUser,
  dbScriptUpdateProfile: userFunctions.dbScriptUpdateProfile,
  dbScriptCreateUser: userFunctions.dbScriptCreateUser,
  dbScriptDeleteUser: userFunctions.dbScriptDeleteUser,
  dbScriptArchiveProfile: userFunctions.dbScriptArchiveProfile,
  dbScriptListUsers: userFunctions.dbScriptListUsers,
  dbScriptSearchUsers: userFunctions.dbScriptSearchUsers,
  dbScriptUpdateUserrole: userFunctions.dbScriptUpdateUserrole,
  dbScriptUpdateUserpassword: userFunctions.dbScriptUpdateUserpassword,
  dbScriptUpdateUserpasswordbyadmin:
    userFunctions.dbScriptUpdateUserpasswordbyadmin,
  dbScriptGetBriefuser: userFunctions.dbScriptGetBriefuser,
  dbScriptStreamTest: userFunctions.dbScriptStreamTest,
  createUserAvatarsFile: userAvatarsFileFunctions.createUserAvatarsFile,
  createBulkUserAvatarsFile: userAvatarsFileFunctions.createBulkUserAvatarsFile,
  getIdListOfUserAvatarsFileByField:
    userAvatarsFileFunctions.getIdListOfUserAvatarsFileByField,
  getUserAvatarsFileById: userAvatarsFileFunctions.getUserAvatarsFileById,
  getUserAvatarsFileAggById: userAvatarsFileFunctions.getUserAvatarsFileAggById,
  getUserAvatarsFileListByQuery:
    userAvatarsFileFunctions.getUserAvatarsFileListByQuery,
  getUserAvatarsFileListByMQuery:
    userAvatarsFileFunctions.getUserAvatarsFileListByMQuery,
  getUserAvatarsFileStatsByQuery:
    userAvatarsFileFunctions.getUserAvatarsFileStatsByQuery,
  getUserAvatarsFileStatsByMQuery:
    userAvatarsFileFunctions.getUserAvatarsFileStatsByMQuery,
  getUserAvatarsFileByQuery: userAvatarsFileFunctions.getUserAvatarsFileByQuery,
  getUserAvatarsFileByMQuery:
    userAvatarsFileFunctions.getUserAvatarsFileByMQuery,
  updateUserAvatarsFileById: userAvatarsFileFunctions.updateUserAvatarsFileById,
  updateUserAvatarsFileByIdList:
    userAvatarsFileFunctions.updateUserAvatarsFileByIdList,
  updateUserAvatarsFileByQuery:
    userAvatarsFileFunctions.updateUserAvatarsFileByQuery,
  updateUserAvatarsFileByMQuery:
    userAvatarsFileFunctions.updateUserAvatarsFileByMQuery,
  deleteUserAvatarsFileById: userAvatarsFileFunctions.deleteUserAvatarsFileById,
  deleteUserAvatarsFileByQuery:
    userAvatarsFileFunctions.deleteUserAvatarsFileByQuery,
  deleteUserAvatarsFileByMQuery:
    userAvatarsFileFunctions.deleteUserAvatarsFileByMQuery,
  dbScriptGetUseravatarsfile:
    userAvatarsFileFunctions.dbScriptGetUseravatarsfile,
  dbScriptListUseravatarsfiles:
    userAvatarsFileFunctions.dbScriptListUseravatarsfiles,
  dbScriptDeleteUseravatarsfile:
    userAvatarsFileFunctions.dbScriptDeleteUseravatarsfile,
  dbScript_fetchListuseravatarsfile:
    userAvatarsFileFunctions.dbScript_fetchListuseravatarsfile,
};
