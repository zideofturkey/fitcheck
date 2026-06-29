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

const User = require("./user");
const UserAvatarsFile = require("./userAvatarsFile");

User.prototype.getData = function () {
  const data = this.dataValues;

  for (const key of Object.keys(data)) {
    if (key.startsWith("json_")) {
      data[key] = JSON.parse(data[key]);
      const newKey = key.slice(5);
      data[newKey] = data[key];
      delete data[key];
    }
  }

  return data;
};

UserAvatarsFile.prototype.getData = function () {
  const data = this.dataValues;

  data.userAvatarsFile_user = this.userAvatarsFile_user
    ? this.userAvatarsFile_user.getData()
    : undefined;

  for (const key of Object.keys(data)) {
    if (key.startsWith("json_")) {
      data[key] = JSON.parse(data[key]);
      const newKey = key.slice(5);
      data[newKey] = data[key];
      delete data[key];
    }
  }

  data._owner = data.ownerId ?? undefined;

  data._iPublic = true;

  return data;
};

UserAvatarsFile.belongsTo(User, {
  as: "userAvatarsFile_user",
  foreignKey: "userId",
  targetKey: "id",
  constraints: false,
});

module.exports = {
  User,
  UserAvatarsFile,
  updateElasticIndexMappings,
  getElasticMapping,
  ELASTIC_MAPPINGS,
  sequelize,
  Sequelize, // Export Sequelize class for migrations (DataTypes)
};
