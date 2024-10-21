module.exports = function (sequalize, DataTypes) {
  return sequalize.define(
    "supply",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      cost: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      contractType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      contractKind: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      selectionType: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: true,
      },
      selectionMeeting: {
        type: DataTypes.STRING(250),
        defaultValue: "",
        allowNull: true,
      },
      selectionDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      selectionApproveDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      selectionDecision: {
        type: DataTypes.STRING(250),
        defaultValue: "",
        allowNull: true,
      },
      selectionDecisionDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      tech: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      techDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      techReason: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: true,
      },
      finance: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      finReason: {
        type: DataTypes.STRING(250),
        defaultValue: "",
        allowNull: true,
      },
      finSentDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      finVerifyDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      confirm: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      confirmNo: {
        type: DataTypes.STRING(50),
        defaultValue: "",
        allowNull: true,
      },
      confirmDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      confirmReason: {
        type: DataTypes.STRING(250),
        defaultValue: "",
        allowNull: true,
      },
      estimate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      estimateNo: {
        type: DataTypes.STRING(50),
        defaultValue: "",
        allowNull: true,
      },
      estimateDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      estimateReason: {
        type: DataTypes.STRING(250),
        defaultValue: "",
        allowNull: true,
      },
      tenderSelection: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      tenderSelectionReason: {
        type: DataTypes.STRING(250),
        defaultValue: "",
        allowNull: true,
      },
      project: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      projectEndDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      projectReason: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: true,
      },
      projectAgreement: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: true,
      },
      projectVizAccept: {
        type: DataTypes.STRING(50),
        defaultValue: "",
        allowNull: true,
      },
      projectVizDecline: {
        type: DataTypes.STRING(50),
        defaultValue: "",
        allowNull: true,
      },
      contractApprove: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      contractNo: {
        type: DataTypes.STRING(20),
        defaultValue: "",
        allowNull: true,
      },
      contractApproveDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      contractCurrency: {
        type: DataTypes.STRING(3),
        defaultValue: "MNT",
        allowNull: true,
      },
      contractCost: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: true,
      },
      fundInfo: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: true,
      },
      prepayment: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      prepaymentDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      prepayedDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      prepaymentReason: {
        type: DataTypes.STRING(250),
        defaultValue: "",
        allowNull: true,
      },
      shipment: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      shipmentDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      shipmentReason: {
        type: DataTypes.STRING(250),
        defaultValue: "",
        allowNull: true,
      },
      shipmentStatus: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: true,
      },
      wharehouse: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      wharehouseInDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      wharehouseReason: {
        type: DataTypes.STRING(250),
        defaultValue: "",
        allowNull: true,
      },
      wharehouseOutInfo: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: true,
      },
      wharehouseOutDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      wharehouseOutComment: {
        type: DataTypes.STRING(250),
        defaultValue: "",
        allowNull: true,
      },
      step: {
        type: DataTypes.STRING(50),
        defaultValue: "",
        allowNull: true,
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },
    },
    {
      tableName: "cri_supplies",
    }
  );
};
