module.exports = function (sequalize, DataTypes) {
  return sequalize.define(
    "client",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      value: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      label: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      ctype: {
        type: DataTypes.CHAR(1),
        allowNull: false,
      },
      regno: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      mail: {
        type: DataTypes.STRING(150),
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
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdUser: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      updatedUser: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "cri_clients",
    }
  );
};
