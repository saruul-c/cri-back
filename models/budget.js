module.exports = function (sequalize, DataTypes) {
  return sequalize.define(
    "budget",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      type: { type: DataTypes.INTEGER, allowNull: false },
      materCode: { type: DataTypes.STRING(14), allowNull: false },
      materName: { type: DataTypes.STRING, allowNull: false },
      brandName: { type: DataTypes.STRING, allowNull: false },
      markName: { type: DataTypes.STRING, allowNull: false },
      serialNo: { type: DataTypes.STRING(100), allowNull: true },
      unitSize: { type: DataTypes.STRING(50), allowNull: false },
      price: { type: DataTypes.FLOAT, allowNull: false, default: 0 },
      quantity: { type: DataTypes.FLOAT, allowNull: false, default: 0 },
      totalPrice: { type: DataTypes.FLOAT, allowNull: false, default: 0 },
      active: { type: DataTypes.BOOLEAN, defaultValue: true, allowNull: false },
      createdUser: { type: DataTypes.INTEGER, allowNull: false },
      updatedUser: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      tableName: "cri_budgets",
    }
  );
};
