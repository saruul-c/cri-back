module.exports = function (sequalize, DataTypes) {
  return sequalize.define(
    "research",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      nameMn: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      nameRu: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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
      value: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.id;
        },
      },
    },
    {
      tableName: "cri_researches",
    }
  );
};
