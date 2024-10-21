module.exports = function (sequalize, DataTypes) {
  return sequalize.define(
    "investmentSupplyWorker",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      tableName: "cri_investments_supply_workers",
    }
  );
};
