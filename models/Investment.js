module.exports = function (sequalize, DataTypes) {
  return sequalize.define(
    "investment",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      nameMn: {
        type: DataTypes.STRING(250),
        allowNull: false,
      },
      nameRu: {
        type: DataTypes.STRING(250),
        allowNull: true,
      },
      fav: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },
      archive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: true,
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
      tableName: "cri_investments",
    }
  );
};
