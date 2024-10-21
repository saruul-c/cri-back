module.exports = function (sequalize, DataTypes) {
  return sequalize.define(
    "payment",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      amount: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: false,
      },
      complete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      payedAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: true,
      },
      payedDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      reason: {
        type: DataTypes.STRING(250),
        defaultValue: "",
        allowNull: true,
      },
    },
    {
      tableName: "cri_supply_payments",
    }
  );
};
