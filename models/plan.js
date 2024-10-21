module.exports = function (sequalize, DataTypes) {
  return sequalize.define(
    "plan",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      planYear: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      plan1: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      plan2: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      plan3: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      plan4: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: false,
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
      tableName: "cri_plans",
    }
  );
};
