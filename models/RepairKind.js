module.exports = function (sequalize, DataTypes) {
  return sequalize.define(
    "repairKind",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      tableName: "cri_repairs_kinds",
    }
  );
};
