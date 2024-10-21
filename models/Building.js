module.exports = function (sequalize, DataTypes) {
  return sequalize.define(
    "building",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      rYear: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      depcode: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(250),
        allowNull: false,
      },
      nameRu: {
        type: DataTypes.STRING(250),
        allowNull: false,
      },
      quantity: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: false,
      },
      sectionCode: {
        type: DataTypes.STRING(5),
        allowNull: false,
      },
      planSeason: {
        type: DataTypes.STRING(10),
        allowNull: false,
        default: "1",
      },
      landDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      archDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      pictureDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      techDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      groundDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      landAgreeDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      landLicenseDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      landCadastreDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      electricDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      heatDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      networkDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      waterDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      dirtyWaterDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      planDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      planAcceptDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      //   гэмтлийн акт тогтоосон огноо
      aktDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      budgetType: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: true,
      },
      // төсөв батлагдсан огноо
      budgetDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      // ажил эхлүүлэх зөвршөөрөл авсан огноо
      jobStartDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      // ажлын график батлагдсан огноо
      graphDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      // графикт ажил эхлэх огноо
      graphStart: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      // графикт ажил дуусах огноо
      graphEnd: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      // гүйцэтгэл эхлэх огноо
      performanceStart: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      // гүйцэтгэл дуусах огноо
      performanceEnd: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      // хүлээж авсан огноо
      acceptDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      // хаасан огноо
      closedDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      // төсөв
      budgetSalary: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: true,
      },
      budgetTax: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: true,
      },
      budgetElectric: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: true,
      },
      budgetOther: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
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
      fav: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },
      archive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
    },
    {
      tableName: "cri_buildings",
    }
  );
};
