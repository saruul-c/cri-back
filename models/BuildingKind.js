module.exports = function (sequalize, DataTypes) {
  return sequalize.define(
    "buildingKind",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      tableName: "cri_buildings_kinds",
    }
  );
};
