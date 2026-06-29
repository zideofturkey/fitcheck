module.exports = (headers) => {
  // Sys_toolCatalog Db Object Rest Api Router
  const sys_toolCatalogMcpRouter = [];

  // listToolCatalog controller
  sys_toolCatalogMcpRouter.push(require("./list-toolcatalog-api")(headers));
  // getToolCatalogEntry controller
  sys_toolCatalogMcpRouter.push(require("./get-toolcatalogentry-api")(headers));
  // _fetchListSys_toolCatalog controller
  sys_toolCatalogMcpRouter.push(
    require("./_fetch-listsys_toolcatalog-api")(headers),
  );

  return sys_toolCatalogMcpRouter;
};
