module.exports = function (sequalize, DataTypes) {
  return sequalize.define(
    "delivery",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(250),
        defaultValue: "",
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      status: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      info: {
        type: DataTypes.STRING(250),
        defaultValue: "",
        allowNull: true,
      },
      reason: {
        type: DataTypes.STRING(250),
        defaultValue: "",
        allowNull: true,
      },
    },
    {
      tableName: "cri_supply_deliveries",
    }
  );
};
