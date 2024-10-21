module.exports = function (sequalize, DataTypes) {
  return sequalize.define(
    "status",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      nameMn: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
      nameRu: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
    },
    {
      tableName: "cri_statuses",
    }
  );
};
