module.exports = function (sequalize, DataTypes) {
    return sequalize.define(
      "section",
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
      },
      {
        tableName: "cri_section",
      }
    );
  };