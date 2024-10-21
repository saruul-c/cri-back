module.exports = function (sequalize, DataTypes) {
  return sequalize.define(
    "benefit",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      decision: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      decisionDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      benefitAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      benefitMonth: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      benefitComment: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      progress: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      progressAmount: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      resultMonth: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      resultAmount: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      resultComment: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      completion: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      archiveDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      archiveComment: {
        type: DataTypes.STRING(500),
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
      tableName: "cri_benefits",
    }
  );
};
