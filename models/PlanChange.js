module.exports = function (sequalize, DataTypes) {
  return sequalize.define(
    "planChange",
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
        default: 1,
      },
      kind: {
        type: DataTypes.INTEGER,
        allowNull: false,
        default: 1,
      },
      changeDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      no: {
        type: DataTypes.STRING(5),
        allowNull: true,
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
      confirmPlan: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      comment: {
        type: DataTypes.STRING(250),
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
      tableName: "cri_plan_changes",
    }
  );
};
