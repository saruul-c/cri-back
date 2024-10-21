module.exports = function (sequalize, DataTypes) {
  return sequalize.define(
    "role",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      comment: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      menu: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      path: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
    },
    {
      tableName: "cri_roles",
    }
  );
};
