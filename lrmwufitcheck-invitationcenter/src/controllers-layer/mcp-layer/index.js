const invitationcenterMcpRouters = require("./invitationcenter");
const sessionRouter = require("./session-router");

const dataVisualizationTools = require("./data-visualization-tools");
module.exports = (headers) => {
  return {
    ...invitationcenterMcpRouters(headers),
    InvitationCenterServiceMcpController: require("./InvitationCenterServiceMcpController"),
    ...dataVisualizationTools(headers),
    ...sessionRouter,
  };
};
