const Sequelize = require("sequelize");
const { DataTypes } = Sequelize;
const { getEnumValue } = require("serviceCommon");
const { ElasticIndexer } = require("serviceCommon");
const {
  updateElasticIndexMappings,
  getElasticMapping,
  ELASTIC_MAPPINGS,
} = require("./elastic-index");
const { hexaLogger, sequelize } = require("common");

const InviteLink = require("./inviteLink");
const InviteAudit = require("./inviteAudit");

InviteLink.prototype.getData = function () {
  const data = this.dataValues;

  for (const key of Object.keys(data)) {
    if (key.startsWith("json_")) {
      data[key] = JSON.parse(data[key]);
      const newKey = key.slice(5);
      data[newKey] = data[key];
      delete data[key];
    }
  }

  // set enum Index and enum value
  const usageModeOptions = ["singleUse", "limitedUse"];
  const dataTypeusageModeInviteLink = typeof data.usageMode;
  const enumIndexusageModeInviteLink =
    dataTypeusageModeInviteLink === "string"
      ? usageModeOptions.indexOf(data.usageMode)
      : data.usageMode;
  data.usageMode_idx = enumIndexusageModeInviteLink;
  data.usageMode =
    enumIndexusageModeInviteLink > -1
      ? usageModeOptions[enumIndexusageModeInviteLink]
      : null;
  // set enum Index and enum value
  const inviteStateOptions = [
    "draft",
    "active",
    "exhausted",
    "revoked",
    "expired",
    "consumed",
  ];
  const dataTypeinviteStateInviteLink = typeof data.inviteState;
  const enumIndexinviteStateInviteLink =
    dataTypeinviteStateInviteLink === "string"
      ? inviteStateOptions.indexOf(data.inviteState)
      : data.inviteState;
  data.inviteState_idx = enumIndexinviteStateInviteLink;
  data.inviteState =
    enumIndexinviteStateInviteLink > -1
      ? inviteStateOptions[enumIndexinviteStateInviteLink]
      : null;

  data._owner = data.ownerUserId ?? undefined;

  return data;
};

InviteAudit.prototype.getData = function () {
  const data = this.dataValues;

  data.inviteLink = this.inviteLink ? this.inviteLink.getData() : undefined;

  for (const key of Object.keys(data)) {
    if (key.startsWith("json_")) {
      data[key] = JSON.parse(data[key]);
      const newKey = key.slice(5);
      data[newKey] = data[key];
      delete data[key];
    }
  }

  // set enum Index and enum value
  const eventTypeOptions = [
    "created",
    "activated",
    "delivered",
    "validated",
    "consumed",
    "revoked",
    "expired",
  ];
  const dataTypeeventTypeInviteAudit = typeof data.eventType;
  const enumIndexeventTypeInviteAudit =
    dataTypeeventTypeInviteAudit === "string"
      ? eventTypeOptions.indexOf(data.eventType)
      : data.eventType;
  data.eventType_idx = enumIndexeventTypeInviteAudit;
  data.eventType =
    enumIndexeventTypeInviteAudit > -1
      ? eventTypeOptions[enumIndexeventTypeInviteAudit]
      : null;

  return data;
};

InviteAudit.belongsTo(InviteLink, {
  as: "inviteLink",
  foreignKey: "inviteLinkId",
  targetKey: "id",
  constraints: false,
});

module.exports = {
  InviteLink,
  InviteAudit,
  updateElasticIndexMappings,
  getElasticMapping,
  ELASTIC_MAPPINGS,
  sequelize,
  Sequelize, // Export Sequelize class for migrations (DataTypes)
};
