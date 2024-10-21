const fs = require("fs");
const path = require("path");
const { Sequelize } = require("sequelize");

let db = {};
// const sequelize = new Sequelize(
//   process.env.MSSQL_DB,
//   process.env.MSSQL_USER,
//   process.env.MSSQL_PASS,
//   {
//     timezone: "+08:00",
//     host: process.env.MSSQL_HOST,
//     dialect: process.env.MSSQL_DL,
//     define: {
//       freezeTableName: true,
//     },
//     pool: {
//       max: 10,
//       min: 0,
//       acquire: 60000,
//       idle: 10000,
//     },
//     operatorAliases: false,
//   }
// );
db.mssql = new Sequelize(
  process.env.MSSQL_DB,
  process.env.MSSQL_USER,
  process.env.MSSQL_PASS,
  {
    timezone: "+08:00",
    host: process.env.MSSQL_HOST,
    dialect: process.env.MSSQL_DL,
    define: {
      freezeTableName: true,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
    operatorAliases: false,
  }
);
db.coss = new Sequelize(
  process.env.COSS_DB,
  process.env.COSS_USER,
  process.env.COSS_PASS,
  {
    timezone: "+08:00",
    host: process.env.COSS_HOST,
    dialect: process.env.COSS_DL,
    define: {
      freezeTableName: true,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
    operatorAliases: false,
  }
);
// undsen cri
fs.readdirSync(__dirname + "/../models")
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file.slice(-3) === ".js" &&
      file !== path.basename(__filename)
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname + "/../models", file))(
      db.mssql,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });
// fas_coss section
fs.readdirSync(__dirname + "/../models/coss")
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file.slice(-3) === ".js" &&
      file !== path.basename(__filename)
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname + "/../models/coss", file))(
      db.coss,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });
db.mssql.dialect.supports.schemas = true;
db.coss.dialect.supports.schemas = true;
db.sequelize = db.mssql;

module.exports = db;
