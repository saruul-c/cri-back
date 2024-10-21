module.exports = function (sequalize, DataTypes) {
  return sequalize.define(
    "supplyOption",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      type: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      tableName: "cri_supply_options",
    }
  );
};
