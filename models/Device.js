module.exports = function (sequalize, DataTypes) {
  return sequalize.define(
    "device",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      nameMn: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nameRu: {
        type: DataTypes.STRING,
        allowNull: false,
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
      tableName: "cri_devices",
    }
  );
};
