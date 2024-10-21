const fs = require("fs");
const { Sequelize } = require("sequelize");
const colors = require("colors");
const dotenv = require("dotenv");
const Role = require("./models/Role");
const User = require("./models/User");

dotenv.config({ path: "./config/config.env" });

let db = {};

const sequelize = new Sequelize(
  process.env.SQL_DB,
  process.env.SQL_USER,
  process.env.SQL_PASS,
  {
    host: process.env.MYSQL_HOST,
    dialect: process.env.SQL_DL,
    define: { freezeTableName: true },
    pool: { min: 1, max: 10, acquire: 30000, idle: 10000 },
    operatorAliases: false,
  }
);

const roles = JSON.parse(
  fs.readFileSync(__dirname + "/data/roles.json", "utf-8")
);

const users = JSON.parse(
  fs.readFileSync(__dirname + "/data/users.json", "utf-8")
);

const importData = async () => {
  try {
    await Role.create(roles);
    // await User.create(users);
    console.log("Бүх өгөгдлийг импортлолоо...".green.inverse);
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    await Role.deleteMany();
    // await User.deleteMany();
    console.log("Бүх өгөгдлийг устгалаа...".red.inverse);
  } catch (err) {
    console.log(err.red.inverse);
  }
};

if (process.argv[2] == "-i") {
  importData();
} else if (process.argv[2] == "-d") {
  deleteData();
}
