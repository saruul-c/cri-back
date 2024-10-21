module.exports = function (sequalize, DataTypes) {
  return sequalize.define(
    "userDivision",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      tableName: "cri_users_divisions",
    }
  );
};
