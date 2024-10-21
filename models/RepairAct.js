module.exports = function (sequalize, DataTypes) {
  return sequalize.define(
    "repairAct",
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
      performance: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      incomplate: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      fail: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      changes: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      act: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      standart: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      result: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      nn: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      engineerChief: {
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
      noks: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      noksEngineer: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      noksEngineerChief: {
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
      tableName: "cri_repair_acts",
    }
  );
};
