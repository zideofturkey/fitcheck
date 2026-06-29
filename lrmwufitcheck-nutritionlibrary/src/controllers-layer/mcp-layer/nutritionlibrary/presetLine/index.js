module.exports = (headers) => {
  // PresetLine Db Object Rest Api Router
  const presetLineMcpRouter = [];

  // addPresetLine controller
  presetLineMcpRouter.push(require("./add-presetline-api")(headers));
  // listPresetLines controller
  presetLineMcpRouter.push(require("./list-presetlines-api")(headers));
  // deletePresetLine controller
  presetLineMcpRouter.push(require("./delete-presetline-api")(headers));
  // _fetchListPresetLine controller
  presetLineMcpRouter.push(require("./_fetch-listpresetline-api")(headers));

  return presetLineMcpRouter;
};
