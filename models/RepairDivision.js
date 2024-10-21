module.exports = function (sequalize, DataTypes) {
  return sequalize.define(
    "repairDivision",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      tableName: "cri_repairs_divisions",
    }
  );
};
