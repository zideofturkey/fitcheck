const utils = require("./utils");
const dbApiScripts = require("./dbApiScripts");

module.exports = {
  createSys_toolCatalog: utils.createSys_toolCatalog,
  createBulkSys_toolCatalog: utils.createBulkSys_toolCatalog,
  getIdListOfSys_toolCatalogByField: utils.getIdListOfSys_toolCatalogByField,
  getSys_toolCatalogById: utils.getSys_toolCatalogById,
  getSys_toolCatalogAggById: utils.getSys_toolCatalogAggById,
  getSys_toolCatalogListByQuery: utils.getSys_toolCatalogListByQuery,
  getSys_toolCatalogListByMQuery: utils.getSys_toolCatalogListByMQuery,
  getSys_toolCatalogStatsByQuery: utils.getSys_toolCatalogStatsByQuery,
  getSys_toolCatalogStatsByMQuery: utils.getSys_toolCatalogStatsByMQuery,
  getSys_toolCatalogByQuery: utils.getSys_toolCatalogByQuery,
  getSys_toolCatalogByMQuery: utils.getSys_toolCatalogByMQuery,
  updateSys_toolCatalogById: utils.updateSys_toolCatalogById,
  updateSys_toolCatalogByIdList: utils.updateSys_toolCatalogByIdList,
  updateSys_toolCatalogByQuery: utils.updateSys_toolCatalogByQuery,
  updateSys_toolCatalogByMQuery: utils.updateSys_toolCatalogByMQuery,
  deleteSys_toolCatalogById: utils.deleteSys_toolCatalogById,
  deleteSys_toolCatalogByQuery: utils.deleteSys_toolCatalogByQuery,
  deleteSys_toolCatalogByMQuery: utils.deleteSys_toolCatalogByMQuery,
  dbScriptListToolcatalog: dbApiScripts.dbScriptListToolcatalog,
  dbScriptGetToolcatalogentry: dbApiScripts.dbScriptGetToolcatalogentry,
  dbScript_fetchListsys_toolcatalog:
    dbApiScripts.dbScript_fetchListsys_toolcatalog,
};
