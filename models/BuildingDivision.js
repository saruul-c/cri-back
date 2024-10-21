module.exports = function (sequalize, DataTypes) {
  return sequalize.define(
    "buildingDivision",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      tableName: "cri_buildings_divisions",
    }
  );
};
