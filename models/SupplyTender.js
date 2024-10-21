module.exports = function (sequalize, DataTypes) {
  return sequalize.define(
    "tender",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      pack: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },
      announceDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      openDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      finishDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      checkDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      selectionDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      noticeDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      feedbackDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      feedback: {
        type: DataTypes.STRING(250),
        defaultValue: "",
        allowNull: true,
      },
      reason: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: true,
      },
    },
    {
      tableName: "cri_supply_tenders",
    }
  );
};
