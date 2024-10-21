module.exports = function (sequalize, DataTypes) {
  return sequalize.define(
    "investmentPlanChange",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      season: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: false,
      },
      cost: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      comment: {
        type: DataTypes.STRING(250),
        defaultValue: "",
        allowNull: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: true,
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
      tableName: "cri_investment_plan_changes",
    }
  );
};
