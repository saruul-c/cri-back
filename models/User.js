const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

dotenv.config({ path: "./config/dev.env" });

module.exports = (sequalize, DataTypes) => {
  const User = sequalize.define(
    "user",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      lastname: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      firstname: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      mobile: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      birthDay: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      depcode: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      jobName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      jobShort: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      sex: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      status: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      resetPasswordToken: { type: DataTypes.STRING, allowNull: true },
      resetPasswordDate: { type: DataTypes.DATE, allowNull: true },
      value: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.id;
        },
      },
      label: {
        type: DataTypes.VIRTUAL,
        get() {
          return ` ${this.jobShort} - ${this.lastname} ${this.firstname}`;
        },
      },
    },
    {
      tableName: "cri_users",
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            const salt = await bcrypt.genSaltSync(10, "a");
            user.password = bcrypt.hashSync(user.password, salt);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            if (user.password) {
              const salt = await bcrypt.genSaltSync(10, "a");
              user.password = bcrypt.hashSync(user.password, salt);
            }
          }
        },
      },
    }
  );

  User.prototype.checkPassword = (password, hash) => {
    return bcrypt.compareSync(password, hash);
  };

  User.prototype.getAccessToken = (id, email, depcode) => {
    return jwt.sign({ id, email, depcode }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_AT_EXPIRE,
    });
  };

  User.prototype.getRefreshToken = (id, email, depcode) => {
    return jwt.sign({ id, email, depcode }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_RT_EXPIRE,
    });
  };

  User.prototype.getResetPasswordToken = () => {
    return crypto.randomBytes(20).toString("hex");
  };

  return User;
};
