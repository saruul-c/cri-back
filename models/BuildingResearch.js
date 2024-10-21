module.exports = function (sequalize, DataTypes) {
  return sequalize.define(
    "buildingResearch",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      conclusionDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
    },
    {
      tableName: "cri_buildings_researches",
    }
  );
};
