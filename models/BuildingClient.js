module.exports = function (sequalize, DataTypes) {
  return sequalize.define(
    "buildingClient",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      tableName: "cri_buildings_clients",
    }
  );
};
