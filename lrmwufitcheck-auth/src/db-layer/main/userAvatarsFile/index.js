const utils = require("./utils");
const dbApiScripts = require("./dbApiScripts");

module.exports = {
  createUserAvatarsFile: utils.createUserAvatarsFile,
  createBulkUserAvatarsFile: utils.createBulkUserAvatarsFile,
  getIdListOfUserAvatarsFileByField: utils.getIdListOfUserAvatarsFileByField,
  getUserAvatarsFileById: utils.getUserAvatarsFileById,
  getUserAvatarsFileAggById: utils.getUserAvatarsFileAggById,
  getUserAvatarsFileListByQuery: utils.getUserAvatarsFileListByQuery,
  getUserAvatarsFileListByMQuery: utils.getUserAvatarsFileListByMQuery,
  getUserAvatarsFileStatsByQuery: utils.getUserAvatarsFileStatsByQuery,
  getUserAvatarsFileStatsByMQuery: utils.getUserAvatarsFileStatsByMQuery,
  getUserAvatarsFileByQuery: utils.getUserAvatarsFileByQuery,
  getUserAvatarsFileByMQuery: utils.getUserAvatarsFileByMQuery,
  updateUserAvatarsFileById: utils.updateUserAvatarsFileById,
  updateUserAvatarsFileByIdList: utils.updateUserAvatarsFileByIdList,
  updateUserAvatarsFileByQuery: utils.updateUserAvatarsFileByQuery,
  updateUserAvatarsFileByMQuery: utils.updateUserAvatarsFileByMQuery,
  deleteUserAvatarsFileById: utils.deleteUserAvatarsFileById,
  deleteUserAvatarsFileByQuery: utils.deleteUserAvatarsFileByQuery,
  deleteUserAvatarsFileByMQuery: utils.deleteUserAvatarsFileByMQuery,
  dbScriptGetUseravatarsfile: dbApiScripts.dbScriptGetUseravatarsfile,
  dbScriptListUseravatarsfiles: dbApiScripts.dbScriptListUseravatarsfiles,
  dbScriptDeleteUseravatarsfile: dbApiScripts.dbScriptDeleteUseravatarsfile,
  dbScript_fetchListuseravatarsfile:
    dbApiScripts.dbScript_fetchListuseravatarsfile,
};
