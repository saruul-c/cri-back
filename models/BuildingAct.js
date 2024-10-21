module.exports = function (sequalize, DataTypes) {
  return sequalize.define(
    "buildingAct",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      notice: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      commission: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      control: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      approve: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      drawer: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      specification: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      fail: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      additional: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      decision: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      performance: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      result: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      comment: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      nn: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      director: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      economist: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      accountant: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      engineer: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      receivedPosition1: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      receivedEmployee1: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      receivedPosition2: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      receivedEmployee2: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      receivedPosition3: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      receivedEmployee3: {
        type: DataTypes.STRING(50),
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
    },
    {
      tableName: "cri_building_acts",
    }
  );
};
