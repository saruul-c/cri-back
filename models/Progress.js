module.exports = function (sequalize, DataTypes) {
  return sequalize.define(
    "progress",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      fail: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      comment: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      picture1: {
        type: DataTypes.STRING(5),
        allowNull: true,
        defaultValue: 0,
      },
      picture2: {
        type: DataTypes.STRING(5),
        allowNull: true,
        defaultValue: 0,
      },
      picture3: {
        type: DataTypes.STRING(5),
        allowNull: true,
        defaultValue: 0,
      },
      createdUser: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      updatedUser: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: true,
      },
    },
    {
      tableName: "cri_progresses",
    }
  );
};
