module.exports = function (sequalize, DataTypes) {
  return sequalize.define(
    "assetType",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      nameMn: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      nameRu: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
    },
    {
      tableName: "cri_asset_types",
    }
  );
};
