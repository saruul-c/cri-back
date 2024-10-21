module.exports = function (sequalize, DataTypes) {
  return sequalize.define(
    "department",
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
      nameShortMn: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      nameShortRu: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      orderby: {
        type: DataTypes.INTEGER,
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
      tableName: "cri_departments",
    }
  );
};
