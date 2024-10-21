const asyncHandler = require("express-async-handler");
const { groupBy, orderBy } = require("lodash");
const { QueryTypes } = require("sequelize");
const ExcelJS = require("exceljs");

async function createMainReportRepairData(
  req,
  depcode,
  year,
  month,
  onlyUsers
) {
  const data = await req.db.sequelize.query(
    `SELECT a.[id], [depname], ISNULL(a.[agent],'') AS [agent], [name], [plan], ISNULL(b.[budget], 0) AS [budget], ISNULL(b.[currentAmount], 0) AS [currentAmount], 
      ISNULL(b.[prevAmount], 0) AS [prevAmount],ISNULL(b.[closedAmount],0) AS [closedAmount],[status], [owner], [comment],divisions.departmentId,divisions.[id] AS [divisionId] 
    FROM (
      SELECT r.id,r.userId,r.depcode,
        (SELECT nameShortMn FROM cri_divisions WHERE depcode = r.depcode) AS depname,
        ISNULL((SELECT [nameShortMn] FROM cri_divisions WHERE [id] = rd.[divisionId]), (SELECT [label] FROM cri_clients WHERE [id] = rc.[clientId])) AS agent, r.[name], 
        ISNULL((SELECT plan1 + plan2 + plan3 + plan4 FROM cri_plans WHERE planYear = ${year} AND repairId = r.id), 0) AS [plan],
        ISNULL((SELECT TOP 1 [statusId]  FROM cri_progresses WHERE active = 1 AND repairId = r.id ORDER BY [createdAt] DESC ), 0) AS [status], 0 AS progress,
        ISNULL((SELECT LEFT(lastname, 1) + '.' + firstname FROM cri_users WHERE active = 1 AND id = r.userId), '') AS [owner],
        ISNULL((SELECT TOP 1 comment FROM cri_progresses WHERE active = 1 AND repairId = r.id ORDER BY createdAt DESC), 0) AS [comment]
      FROM cri_repairs r 
      LEFT JOIN cri_repairs_divisions rd
      ON r.id = rd.repairId
      LEFT JOIN cri_repairs_clients rc
      ON r.id = rc.repairId
      WHERE r.active = 1 AND r.depcode IN (${depcode}) AND rYear = ${year}
    ) a LEFT JOIN (
      SELECT 
        c.repairId,
        ISNULL(SUM(CASE WHEN [year] = 0 THEN amount ELSE 0 END), 0) AS budget, 
        SUM(CASE WHEN [year] = ${year} AND [month] = ${month} THEN amount ELSE 0 END) AS currentAmount, 
        SUM(CASE WHEN [year] = ${year} AND [month] < ${month} THEN amount ELSE 0 END) AS prevAmount,
        SUM(CASE WHEN [month] > 0 THEN amount ELSE 0 END) AS closedAmount
      FROM cri_completions c
      LEFT JOIN cri_divisions d
      ON c.depcode = d.depcode
      LEFT JOIN cri_clients cl
      ON c.client = cl.[value]
      WHERE buildingId IS NULL
      GROUP BY c.repairId
    ) b
    ON a.id = b.repairId
    LEFT JOIN cri_divisions divisions ON divisions.depcode = a.depcode
    ${onlyUsers}
    ORDER BY divisions.orderby`,
    {
      type: QueryTypes.SELECT,
    }
  );
  return data;
}
async function createMainReportBuildingData(req,month,year,depcode,onlyUsers){
  const data = await req.db.sequelize.query(
    `SELECT a.id, [depname], ISNULL(a.[agent],'') AS [agent], [name], [plan], [planAcceptDate], [startDate], [endDate], ISNULL(b.[budget], 0) AS [budget], 
    ISNULL(b.[currentAmount], 0) AS [currentAmount], ISNULL(b.[closedAmount],0) AS [closedAmount],
    ISNULL(b.[prevAmount], 0) AS [prevAmount], [status], ROUND(ISNULL(([prevAmount] + [currentAmount]) / ([plan]+1) * ${month}0, 0), 2) AS [progress], [owner], [comment],divisions.departmentId,
    divisions.[id] AS [divisionId] 
    FROM (
      SELECT r.id, r.planAcceptDate, r.startDate, r.endDate,r.userId,r.depcode,
        (SELECT nameShortMn FROM cri_divisions WHERE depcode = r.depcode) AS depname,
        ISNULL((SELECT [nameShortMn] FROM cri_divisions WHERE [id] = rd.[divisionId]), (SELECT [label] FROM cri_clients WHERE [id] = rc.[clientId])) AS agent, r.[name], 
        ISNULL((SELECT plan1 + plan2 + plan3 + plan4 FROM cri_plans WHERE planYear = ${year} AND buildingId = r.id), 0) AS [plan],
        ISNULL((SELECT TOP 1 [statusId] FROM cri_progresses WHERE active = 1 AND buildingId = r.id ORDER BY [createdAt] DESC), 0) AS [status], 0 AS progress,
        ISNULL((SELECT LEFT(lastname, 1) + '.' + firstname FROM cri_users WHERE active = 1 AND id = r.userId), '') AS [owner],
        ISNULL((SELECT TOP 1 comment FROM cri_progresses WHERE active = 1 AND buildingId = r.id ORDER BY createdAt DESC), 0) AS [comment]
      FROM cri_buildings r 
      LEFT JOIN cri_buildings_divisions rd
      ON r.id = rd.buildingId
      LEFT JOIN cri_buildings_clients rc
      ON r.id = rc.buildingId
      WHERE r.active = 1 AND r.depcode IN (${depcode}) AND (rYear = ${year} OR (r.id IN (
        SELECT buildingId 
        FROM (SELECT ROW_NUMBER() OVER(PARTITION BY buildingId ORDER BY createdAt DESC) RN, buildingId, statusId FROM cri_progresses WHERE buildingId IS NOT NULL AND active = 1 ) a 
        WHERE RN = 1 AND statusId <> 17) 
        AND rYear < ${year}))
    ) a LEFT JOIN (
      SELECT 
        c.buildingId,
        ISNULL(SUM(CASE WHEN [year] = 0 THEN amount ELSE 0 END), 0) AS budget, 
        SUM(CASE WHEN [year] = ${year} AND [month] = ${month} THEN amount ELSE 0 END) AS currentAmount, 
        SUM(CASE WHEN [year] = ${year} AND [month] < ${month} THEN amount ELSE 0 END) AS prevAmount,
        SUM(CASE WHEN [month] > 0 THEN amount ELSE 0 END) AS closedAmount
      FROM cri_completions c
      LEFT JOIN cri_divisions d
      ON c.depcode = d.depcode
      LEFT JOIN cri_clients cl
      ON c.client = cl.[value]
      WHERE repairId IS NULL
      GROUP BY c.buildingId
    ) b
    ON a.id = b.buildingId
    LEFT JOIN cri_divisions divisions ON divisions.depcode = a.depcode
    ${onlyUsers}
    ORDER BY divisions.orderby`,
    {
      type: QueryTypes.SELECT,
    }
  );
  return data;
}
exports.getMainReportRepair = asyncHandler(async (req, res, next) => {
  const year = req.query.year || new Date().getFullYear();
  const month = req.query.month || new Date().getMonth() + 1;
  const depcode = req.query.depcode;
  const userId = req.query.userId;
  const onlyUsers = userId ? `WHERE a.userId = ${userId}` : "";
  const report = await createMainReportRepairData(
    req,
    depcode,
    year,
    month,
    onlyUsers
  );

  res.status(200).json({
    success: true,
    data: report,
  });
});

exports.getMainReportBuilding = asyncHandler(async (req, res, next) => {
  const year = req.query.year || new Date().getFullYear();
  const month = req.query.month || new Date().getMonth() + 1;
  const depcode = req.query.depcode || "120611";
  const userId = req.query.userId;
  const onlyUsers = userId ? `WHERE a.userId = ${userId}` : "";
  const data = await createMainReportBuildingData(req,month,year,depcode,onlyUsers);

  res.status(200).json({
    success: true,
    data,
  });
});

async function createTimeReportRepairData(req, year,depcode) {
  const data = await req.db.sequelize.query(
    `SELECT 
      div.[departmentId],r.[id],r.[workWayId],div.[nameShortMn] AS [divName],div.[id] AS [divisionId],
      CASE WHEN r.[workWayId] = 3 THEN 
        ISNULL((SELECT STRING_AGG(label,',') FROM cris.logcris.cri_clients WHERE id IN (SELECT [clientId] FROM cris.logcris.cri_buildings_clients WHERE buildingId = r.id)),'')
        ELSE ISNULL((SELECT STRING_AGG(nameShortMn, ',') FROM cri_divisions WHERE id IN (SELECT [divisionId] FROM cri_repairs_divisions WHERE [repairId] = r.id)),'') 
      END AS clients,
    r.[name],ISNULL(comp.[amount],0) AS budget,r.[aktDate],r.[budgetDate],r.[jobStartDate],r.[graphStart],r.[graphEnd],r.[performanceStart],r.[performanceEnd],r.[closedDate],
    ISNULL(DATEDIFF(day,r.[graphEnd],r.[performanceEnd]),'-') AS [overdue]
    FROM cri_repairs r
    LEFT JOIN cri_divisions div ON div.[depcode] = r.[depcode]
    LEFT JOIN (
      SELECT [repairId],SUM(amount) AS amount FROM cri_completions WHERE [year] = 0 AND [month] = 0 AND [repairId] IS NOT NULL
      GROUP BY [repairId]
    ) comp ON comp.[repairId] = r.[id]
    WHERE r.[rYear] = ${year} AND r.[active] = 1 AND r.[depcode] IN (${depcode})
    ORDER BY div.[orderby]
  `,
    {
      type: QueryTypes.SELECT,
    }
  );
  return data;
}

async function createTimeReportBuildingData(req, year,depcode) {
  const data = await req.db.sequelize.query(
    `SELECT 
      div.[departmentId],r.[id],r.[workWayId],div.[nameShortMn] AS [divName],div.[id] AS [divisionId],
      CASE WHEN r.[workWayId] = 3 THEN 
      ISNULL((SELECT STRING_AGG(label,',') FROM cris.logcris.cri_clients WHERE id IN (SELECT [clientId] FROM cris.logcris.cri_buildings_clients WHERE buildingId = r.id)),'')
      ELSE ISNULL((SELECT STRING_AGG(nameShortMn, ',') FROM cri_divisions WHERE id IN (SELECT [divisionId] FROM cri_buildings_divisions WHERE [buildingId] = r.id)),'') END AS clients,
    r.[name],ISNULL(comp.[amount],0) AS budget,r.[landDate],r.[pictureDate],r.[planDate],r.[planAcceptDate],r.[budgetDate],r.[jobStartDate],r.[graphStart],r.[graphEnd],
    r.[performanceStart],r.[performanceEnd],r.[closedDate],ISNULL(DATEDIFF(day,r.[graphEnd],r.[performanceEnd]),'-') AS [overdue]
    FROM cri_buildings r
    LEFT JOIN cri_divisions div ON div.[depcode] = r.[depcode]
    LEFT JOIN (
      SELECT [buildingId],SUM(amount) AS amount FROM cri_completions WHERE [year] = 0 AND [month] = 0 AND [buildingId] IS NOT NULL
      GROUP BY [buildingId]
    ) comp ON comp.[buildingId] = r.[id]
    WHERE r.[rYear] = ${year} AND r.[depcode] IN (${depcode})
    ORDER BY div.[orderby]`,
    {
      type: QueryTypes.SELECT,
    }
  );
  return data;
}

async function createMainReportInvestmentData(req, year,depcode) {
  const data = await req.db.sequelize.query(
    `SELECT div.[id],div.[departmentId],div.[orderby],div.[nameShortMn] AS [divName],
      ISNULL(invest.[cost1] ,0) AS [cost1],ISNULL(invest.[cost2] ,0) AS [cost2],
      ISNULL(invest.[cost3] ,0) AS [cost3],ISNULL(invest.[cost4] ,0) AS [cost4],
      ISNULL(invest.[price1],0) AS [price1],ISNULL(invest.[price2] ,0) AS [price2],
      ISNULL(invest.[price3] ,0) AS [price3],ISNULL(invest.[price4] ,0) AS [price4]
    FROM cri_divisions div
    LEFT JOIN (
      SELECT i.[divisionId],
      SUM(CASE WHEN p.[season] = 1 THEN p.[cost] END) AS [cost1],
      SUM(CASE WHEN p.[season] = 2 THEN p.[cost] END) AS [cost2],
      SUM(CASE WHEN p.[season] = 3 THEN p.[cost] END) AS [cost3],
      SUM(CASE WHEN p.[season] = 4 THEN p.[cost] END) AS [cost4],
      SUM(CASE WHEN p.[season] = 1 THEN p.[price] END) AS [price1],
      SUM(CASE WHEN p.[season] = 2 THEN p.[price] END) AS [price2],
      SUM(CASE WHEN p.[season] = 3 THEN p.[price] END) AS [price3],
      SUM(CASE WHEN p.[season] = 4 THEN p.[price] END) AS [price4]
      FROM cri_investments i
      LEFT JOIN (
        SELECT * FROM cri_investment_plans WHERE [active] = 1
      ) p ON i.[id] = p.[investmentId]
      WHERE i.[year] = ${year} AND i.[active] = 1
      GROUP BY i.[divisionId]
    ) invest ON invest.[divisionId] = div.[id]
    WHERE div.[active] = 1 AND div.[depcode] IN (${depcode})
    ORDER BY div.[orderby]`,
    {
      type: QueryTypes.SELECT,
    }
  );
  return data;
}

exports.getTimeReportRepair = asyncHandler(async (req, res, next) => {
  const {year,depcode} = req.query;
  const data = await createTimeReportRepairData(req, year,depcode);
  res.status(200).json({
    success: true,
    data,
  });
});

exports.getTimeReportBuilding = asyncHandler(async (req, res, next) => {
  const {year,depcode} = req.query;
  const data = await createTimeReportBuildingData(req, year,depcode);
  res.status(200).json({
    success: true,
    data,
  });
});

exports.getMainReportInvestmentData = asyncHandler(async (req, res, next) => {
  const {year,depcode} = req.query;
  const data = await createMainReportInvestmentData(req, year,depcode);
  res.status(200).json({
    success: true,
    data,
  });
});

exports.getTimeReportExcelRepair = asyncHandler(async (req, res, next) => {
  const user = await req.db.user.findByPk(req.userId);
  const {year,depcode} = req.query;
  const allDepartments = await req.db.department.findAll();
  const divIds = `${req.query.divIds}`.split(",");
  let reportData = await createTimeReportRepairData(req, year,depcode);
  reportData = reportData.filter((row) =>
    divIds.includes(row.divisionId.toString())
  );
  const groupedReportData = groupBy(reportData, "departmentId");
  const newDepartments = orderBy(allDepartments, "orderby", "asc")
    .map((dep) => ({
      name: dep.nameShortMn,
      id: dep.id,
    }))
    .filter((newDepartment) =>
      Object.keys(groupedReportData).includes(newDepartment.id.toString())
    );
  // excel info
  const reportTitle = `Их засварын ажлын хугацааны тайлан ${year} оны  байдлаар`;
  const reportFooter = `Тайлан бэлтгэсэн: ${user.jobName} ${user.lastname[0]}.${user.firstname}`;
  const workBook = new ExcelJS.Workbook();
  workBook.creator = "НРП хэлтэс";

  workBook.created = new Date();
  workBook.title = "ИХ БАРИЛГА ИХ ЗАСВАР";
  const worksheet = workBook.addWorksheet("Тайлан");
  const excelHeader = worksheet.getRow(1),
    excelFooter = worksheet.getRow(
      reportData.length + newDepartments.length + 6
    );
  excelHeader.font = { bold: true };
  excelHeader.getCell(2).value = reportTitle;
  excelFooter.getCell(2).value = reportFooter;
  // end excel info
  const excelRows = [];
  let ubtzPepBudget = 0,
    rowNumber = 0,
    ubtzBudget = 0;
  // excel rows
  newDepartments.forEach((currentDep, currentDepIdx) => {
    depBudget = 0;
    groupedReportData[currentDep.id].forEach((row, rowIdx) => {
      rowNumber += 1;
      depBudget += row.budget;
      const excelRow = [
        rowIdx + 1,
        row.divName,
        row.clients,
        row.name,
        row.budget,
        row.aktDate,
        row.budgetDate,
        row.jobStartDate,
        row.graphStart,
        row.graphEnd,
        row.performanceStart,
        row.performanceEnd,
        row.closedDate,
        row.overdue,
      ];
      excelRows.push(excelRow);
    });
    ubtzBudget += depBudget;
    excelRows.push([
      "",
      "",
      "",
      `${currentDep.name} албаны дүн`,
      depBudget,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
    // albanii duntai row bolon niit dung bold bolgoj border nemeh
    worksheet.getCell(`E${rowNumber + currentDepIdx + 4}`).numFmt = "#,##0.00";
    worksheet.getCell(
      `E${newDepartments.length + reportData.length + 4}`
    ).numFmt = "#,##0.00";
    worksheet.getCell(`E${rowNumber + currentDepIdx + 4}`).font = {
      bold: true,
    };
    worksheet.getCell(`D${rowNumber + currentDepIdx + 4}`).font = {
      bold: true,
    };
    [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
    ].forEach((letter) => {
      worksheet.getCell(`${letter}${rowNumber + currentDepIdx + 4}`).border = {
        top: { style: "thin", color: { argb: "242222" } },
      };
      worksheet.getCell(
        `${letter}${newDepartments.length + reportData.length + 4}`
      ).border = {
        top: { style: "thin", color: { argb: "242222" } },
      };
      worksheet.getCell(
        `${letter}${newDepartments.length + reportData.length + 4}`
      ).font = {
        bold: true,
        size: 12,
      };
    });
  });

  excelRows.push([
    "",
    "",
    "",
    `Нийт дүн`,
    ubtzBudget,
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const excelColumns = [
    { name: "#" },
    { name: "Захиалгч" },
    { name: "Гүйцэтгэгч" },
    { name: "Ажлын нэр" },
    { name: "Төсөвт дүн, төг" },
    { name: "Гэмтлийн акт тогтоосон огноо" },
    { name: "Төсөв батлагдсан огноо" },
    { name: "АЭЗ авсан огноо" },
    { name: "График эхлэх огноо" },
    { name: "График дуусах огноо" },
    { name: "Ажлын явц эхлэх огноо" },
    { name: "Ажлын явц дуусах огноо" },
    { name: "Хаасан огноо" },
    { name: "Хэтэрсэн хоног" },
  ];
  // end excel rows
  const reportColumnLength = 14;
  for (let columnIndex = 1; columnIndex <= reportColumnLength; columnIndex++) {
    worksheet.getColumn(columnIndex).width = 25;

    if (columnIndex === 5) {
      worksheet.getColumn(columnIndex).style = {
        alignment: { horizontal: "right", vertical: "middle" },
      };
      worksheet.getColumn(columnIndex).numFmt = "#,##0.00";
    } else if (columnIndex < 5) {
      worksheet.getColumn(columnIndex).style = {
        alignment: { horizontal: "left", vertical: "middle" },
      };
    } else {
      worksheet.getColumn(columnIndex).style = {
        alignment: { horizontal: "center", vertical: "middle" },
      };
    }
  }
  worksheet.addTable({
    name: "reportTimeExeclRepair",
    ref: "A3",
    headerRow: true,
    totalsRow: true,
    style: {
      theme: "TableStyleLight8",
      showRowStripes: true,
    },
    columns: excelColumns,
    rows: excelRows,
  });
  await workBook.xlsx.write(res);
  res.end();
});

exports.getTimeReportExcelBuilding = asyncHandler(async (req, res, next) => {
  const user = await req.db.user.findByPk(req.userId);
  const {year,depcode} = req.query;
  const allDepartments = await req.db.department.findAll();
  const divIds = `${req.query.divIds}`.split(",");
  let reportData = await createTimeReportBuildingData(req, year,depcode);
  reportData = await reportData.filter((row) =>
    divIds.includes(row.divisionId.toString())
  );
  const groupedReportData = groupBy(reportData, "departmentId");
  const newDepartments = orderBy(allDepartments, "orderby", "asc")
    .map((dep) => ({
      name: dep.nameShortMn,
      id: dep.id,
    }))
    .filter((newDepartment) =>
      Object.keys(groupedReportData).includes(newDepartment.id.toString())
    );
  // excel info
  const reportTitle = `Их барилгын ажлын хугацааны тайлан ${year} оны  байдлаар`;
  const reportFooter = `Тайлан бэлтгэсэн: ${user.jobName} ${user.lastname[0]}.${user.firstname}`;
  const workBook = new ExcelJS.Workbook();
  workBook.creator = "НРП хэлтэс";

  workBook.created = new Date();
  workBook.title = "ИХ БАРИЛГА ИХ ЗАСВАР";
  const worksheet = workBook.addWorksheet("Тайлан");
  const excelHeader = worksheet.getRow(1),
    excelFooter = worksheet.getRow(
      reportData.length + newDepartments.length + 6
    );
  excelHeader.font = { bold: true };
  excelHeader.getCell(2).value = reportTitle;
  excelFooter.getCell(2).value = reportFooter;
  // end excel info
  const excelRows = [];
  let depBudget = 0,
    rowNumber = 0,
    ubtzBudget = 0;
  // excel rows
  newDepartments.forEach((currentDep, currentDepIdx) => {
    depBudget = 0;
    groupedReportData[currentDep.id].forEach((row, rowIdx) => {
      rowNumber += 1;
      depBudget += row.budget;
      const excelRow = [
        rowIdx + 1,
        row.divName,
        row.clients,
        row.name,
        row.budget,
        row.landDate,
        row.pictureDate,
        row.planDate,
        row.planAcceptDate,
        row.budgetDate,
        row.jobStartDate,
        row.graphStart,
        row.graphEnd,
        row.performanceStart,
        row.performanceEnd,
        row.closedDate,
        row.overdue,
      ];
      excelRows.push(excelRow);
    });
    ubtzBudget += depBudget;
    excelRows.push([
      "",
      "",
      "",
      `${currentDep.name} албаны дүн`,
      depBudget,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
    // albanii duntai row bolon niit dung bold bolgoj border nemeh
    worksheet.getCell(`E${rowNumber + currentDepIdx + 4}`).numFmt = "#,##0.00";
    worksheet.getCell(
      `E${newDepartments.length + reportData.length + 4}`
    ).numFmt = "#,##0.00";
    worksheet.getCell(`E${rowNumber + currentDepIdx + 4}`).font = {
      bold: true,
    };
    worksheet.getCell(`D${rowNumber + currentDepIdx + 4}`).font = {
      bold: true,
    };
    [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
    ].forEach((letter) => {
      worksheet.getCell(`${letter}${rowNumber + currentDepIdx + 4}`).border = {
        top: { style: "thin", color: { argb: "242222" } },
      };
      worksheet.getCell(
        `${letter}${newDepartments.length + reportData.length + 4}`
      ).border = {
        top: { style: "thin", color: { argb: "242222" } },
      };
      worksheet.getCell(
        `${letter}${newDepartments.length + reportData.length + 4}`
      ).font = {
        bold: true,
        size: 12,
      };
    });
  });

  excelRows.push([
    "",
    "",
    "",
    `Нийт дүн`,
    ubtzBudget,
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  // end excel rows
  const excelColumns = [
    { name: "#" },
    { name: "Захиалгч" },
    { name: "Гүйцэтгэгч" },
    { name: "Ажлын нэр" },
    { name: "Төсөвт дүн, төг" },
    { name: "Газар сонголтын актын огноо" },
    { name: "Зургын даалгаврын огноо" },
    { name: "Зураг төсөл дууссан огноо" },
    { name: "Зураг төсөл батлагдсан огноо" },
    { name: "Төсөв батлагдсан огноо" },
    { name: "АЭЗ авсан огноо" },
    { name: "График эхлэх огноо" },
    { name: "График дуусах огноо" },
    { name: "Ажлын явц эхлэх огноо" },
    { name: "Ажлын явц дуусах огноо" },
    { name: "Хаасан огноо" },
    { name: "Хэтэрсэн хоног" },
  ];
  const reportColumnLength = 17;
  for (let columnIndex = 1; columnIndex <= reportColumnLength; columnIndex++) {
    worksheet.getColumn(columnIndex).width = 25;

    if (columnIndex === 5) {
      worksheet.getColumn(columnIndex).style = {
        alignment: { horizontal: "right", vertical: "middle" },
      };
      worksheet.getColumn(columnIndex).numFmt = "#,##0.00";
    } else if (columnIndex < 5) {
      worksheet.getColumn(columnIndex).style = {
        alignment: { horizontal: "left", vertical: "middle" },
      };
    } else {
      worksheet.getColumn(columnIndex).style = {
        alignment: { horizontal: "center", vertical: "middle" },
      };
    }
  }
  worksheet.addTable({
    name: "reportTimeExeclBuilding",
    ref: "A3",
    headerRow: true,
    totalsRow: true,
    style: {
      theme: "TableStyleLight8",
      showRowStripes: true,
    },
    columns: excelColumns,
    rows: excelRows,
  });
  await workBook.xlsx.write(res);
  res.end();
});

exports.getMainReportExcelInvestment = asyncHandler(async (req, res, next) => {
  const user = await req.db.user.findByPk(req.userId);
  const {year,depcode} = req.query;
  const allDepartments = await req.db.department.findAll();
  const reportData = await createMainReportInvestmentData(req, year,depcode);
  const groupedReportData = groupBy(reportData, "departmentId");
  const newDepartments = orderBy(allDepartments, "orderby", "asc")
    .map((dep) => ({
      name: dep.nameShortMn,
      id: dep.id,
    }))
    .filter((newDepartment) =>
      Object.keys(groupedReportData).includes(newDepartment.id.toString())
    );
  // excel info
  const reportTitle = `Хөрөнгө оруулалтын тайлан ${year} оны  байдлаар`;
  const reportFooter = `Тайлан бэлтгэсэн: ${user.jobName} ${user.lastname[0]}.${user.firstname}`;
  const workBook = new ExcelJS.Workbook();
  workBook.creator = "НРП хэлтэс";
  workBook.created = new Date();
  workBook.title = "ИХ БАРИЛГА ИХ ЗАСВАР";
  const worksheet = workBook.addWorksheet("Тайлан");
  const excelHeader = worksheet.getRow(1),
    excelFooter = worksheet.getRow(
      reportData.length + newDepartments.length + 6
    );
  excelHeader.font = { bold: true };
  excelHeader.getCell(2).value = reportTitle;
  excelFooter.getCell(2).value = reportFooter;
  // end excel info
  // excel rows
  const excelRows = [];
  let rowNumber = 0,
    depCost1 = 0,
    depCost2 = 0,
    depCost3 = 0,
    depCost4 = 0,
    depPrice1 = 0,
    depPrice2 = 0,
    depPrice3 = 0,
    depPrice4 = 0,
    ubtzCost1 = 0,
    ubtzCost2 = 0,
    ubtzCost3 = 0,
    ubtzCost4 = 0,
    ubtzPrice1 = 0,
    ubtzPrice2 = 0,
    ubtzPrice3 = 0,
    ubtzPrice4 = 0;

  newDepartments.forEach((currentDep, currentDepIdx) => {
    depCost1 = 0;
    depCost2 = 0;
    depCost3 = 0;
    depCost4 = 0;
    depPrice1 = 0;
    depPrice2 = 0;
    depPrice3 = 0;
    depPrice4 = 0;
    groupedReportData[currentDep.id].forEach((row, rowIdx) => {
      depCost1 += row.cost1;
      depCost2 += row.cost2;
      depCost3 += row.cost3;
      depCost4 += row.cost4;
      depPrice1 += row.price1;
      depPrice2 += row.price2;
      depPrice3 += row.price3;
      depPrice4 += row.price4;
      rowNumber += 1;
      const excelRow = [
        rowIdx + 1,
        row.divName,
        row.cost1,
        row.price1,
        row.cost2,
        row.price2,
        row.cost3,
        row.price3,
        row.cost4,
        row.price4,
        row.cost1 + row.cost2 + row.cost3 + row.cost4,
        row.price1 + row.price2 + row.price3 + row.price4,
        row.cost1 * row.cost2 * row.cost3 * row.cost4 === 0
          ? 0
          : ((row.price1 + row.price2 + row.price3 + row.price) * 100) /
            (row.cost1 + row.cost2 + row.cost3 + row.cost4),
        row.cost1 +
          row.cost2 +
          row.cost3 +
          row.cost4 -
          row.price1 -
          row.price2 -
          row.price3 -
          row.price,
      ];
      excelRows.push(excelRow);
    });
    ubtzCost1 += depCost1;
    ubtzCost2 += depCost2;
    ubtzCost3 += depCost3;
    ubtzCost4 += depCost4;
    ubtzPrice1 += depPrice1;
    ubtzPrice2 += depPrice2;
    ubtzPrice3 += depPrice3;
    ubtzPrice4 += depPrice4;
    excelRows.push([
      "",
      `${currentDep.name} албаны дүн`,
      depCost1,
      depPrice1,
      depCost2,
      depPrice2,
      depCost3,
      depPrice3,
      depCost4,
      depPrice4,
      depCost1 + depCost2 + depCost3 + depCost4,
      depPrice1 + depPrice2 + depPrice3 + depPrice4,
      depCost1 + depCost2 + depCost3 + depCost4 === 0
        ? 0
        : ((depPrice1 + depPrice2 + depPrice3 + depPrice4) * 100) /
          (depCost1 + depCost2 + depCost3 + depCost4),
      depCost1 +
        depCost2 +
        depCost3 +
        depCost4 -
        depPrice1 -
        depPrice2 -
        depPrice3 -
        depPrice4,
    ]);
    // albanii duntai row bolon niit dung bold bolgoj border nemeh
    [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
    ].forEach((letter) => {
      worksheet.getCell(`${letter}${rowNumber + currentDepIdx + 4}`).border = {
        top: { style: "double", color: { argb: "000000" } },
      };
      worksheet.getCell(`${letter}${rowNumber + currentDepIdx + 4}`).numFmt =
        "#,##0.00";
      worksheet.getCell(`${letter}${rowNumber + currentDepIdx + 4}`).font = {
        bold: true,
      };
      worksheet.getCell(
        `${letter}${newDepartments.length + reportData.length + 4}`
      ).font = {
        bold: true,
        size: 12,
      };
      worksheet.getCell(
        `${letter}${newDepartments.length + reportData.length + 4}`
      ).numFmt = "#,##0.00";
    });
  });
  excelRows.push([
    "",
    `Нийт дүн`,
    ubtzCost1,
    ubtzPrice1,
    ubtzCost2,
    ubtzPrice2,
    ubtzCost3,
    ubtzPrice3,
    ubtzCost4,
    ubtzPrice4,
    ubtzCost1 + ubtzCost2 + ubtzCost3 + ubtzCost4,
    ubtzPrice1 + ubtzPrice2 + ubtzPrice3 + ubtzPrice4,
    ubtzCost1 + ubtzCost2 + ubtzCost3 + ubtzCost4 === 0
      ? 0
      : ((ubtzPrice1 + ubtzPrice2 + ubtzPrice3 + ubtzPrice4) * 100) /
        (ubtzCost1 + ubtzCost2 + ubtzCost3 + ubtzCost4),
    ubtzCost1 +
      ubtzCost2 +
      ubtzCost3 +
      ubtzCost4 -
      ubtzPrice1 -
      ubtzPrice2 -
      ubtzPrice3 -
      ubtzPrice4,
  ]);
  // end excel rows
  const excelColumns = [
    { name: "#" },
    { name: "Байгууллага" },
    { name: "Төлөвлөгөө I улирал" },
    { name: "Гүйцэтгэл I улирал" },
    { name: "Төлөвлөгөө II улирал" },
    { name: "Гүйцэтгэл II улирал" },
    { name: "Төлөвлөгөө III улирал" },
    { name: "Гүйцэтгэл III улирал" },
    { name: "Төлөвлөгөө IV улирал" },
    { name: "Гүйцэтгэл IV улирал" },
    { name: "Төлөвлөгөө нийт" },
    { name: "Гүйцэтгэл нийт" },
    { name: "Биелэлтийн хувь %" },
    { name: "Зөрүү төг" },
  ];
  const reportColumnLength = 15;
  for (let columnIndex = 1; columnIndex <= reportColumnLength; columnIndex++) {
    worksheet.getColumn(columnIndex).width = 25;
    if (columnIndex < 3) {
      worksheet.getColumn(columnIndex).style = {
        alignment: { horizontal: "left", vertical: "middle" },
      };
    } else {
      worksheet.getColumn(columnIndex).numFmt = "#,##0.00";
    }
  }

  worksheet.addTable({
    name: "reportMainExeclInvestment",
    ref: "A3",
    headerRow: true,
    totalsRow: true,
    style: {
      theme: "TableStyleLight8",
      showRowStripes: true,
    },
    columns: excelColumns,
    rows: excelRows,
  });
  await workBook.xlsx.write(res);
  res.end();
});

exports.getPhotoReportRepair = asyncHandler(async (req, res, next) => {
  const { year, getAll } = req.query;
  const userId = req.userId;
  const onlyUsers = getAll ? "" : `AND WHERE r.[userId] = ${userId}`;
  const report = await req.db.sequelize.query(
    `SELECT 
      r.[id],div.[id] AS [divisionId],div.[departmentId] AS [departmentId], div.[nameShortMn] AS [divName],r.[name],
      ISNULL(p.[totalPlan],0) AS [totalPlan],r.[depcode],ISNULL(c.[amount],0) AS [amount],r.[performanceStart],
      r.[performanceEnd],imgFirst.[id] AS firstImageName, imgFirst.[picture1] AS firstImageType,
      imgLast.[id] AS lastImageName,imgLast.[picture1] AS lastImageType
    FROM cri_repairs r
    LEFT JOIN (
        SELECT repairId, SUM([plan1]+[plan2]+[plan3]+[plan4]) AS [totalPlan]
        FROM cri_plans WHERE [buildingId] IS NULL AND [repairId] IS NOT NULL
        GROUP BY [repairId] 
    ) p ON p.[repairId] = r.[id]
    LEFT JOIN (
      SELECT [repairId], SUM([amount])  AS [amount]
      FROM cri_completions WHERE [month] > 0 AND [repairId] IS NOT NULL AND [buildingId] IS NULL
      GROUP BY [repairId]
    ) c ON c.[repairId] = r.[id]
    LEFT JOIN cri_divisions div ON div.[depcode] = r.[depcode] 
    LEFT JOIN (
      SELECT * 
      FROM  (
        SELECT [id],[repairId],[picture1], ROW_NUMBER() OVER(PARTITION BY repairId ORDER BY [createdAt] DESC) AS RN
        FROM cri_progresses
        WHERE [picture1] <> '0' AND [buildingId] IS NULL AND [active] = 1
      ) prog
      WHERE [RN] = 1
    ) imgLast ON imgLast.[repairId] = r.[id]
    LEFT JOIN (
      SELECT * 
      FROM  (
        SELECT [id],[repairId],[picture1], ROW_NUMBER() OVER(PARTITION BY repairId ORDER BY [createdAt] ASC) AS RN
        FROM cri_progresses
        WHERE [picture1] <> '0' AND [buildingId] IS NULL AND [active] = 1
      ) prog
      WHERE [RN] = 1
    ) imgFirst ON imgFirst.[repairId] = r.[id]
    WHERE r.[rYear] = ${year} AND r.[active] = 1 ${onlyUsers}  ORDER BY div.[orderby]`,
    {
      type: QueryTypes.SELECT,
    }
  );

  res.status(200).json({
    success: true,
    data: report,
  });
});

exports.getPhotoReportBuilding = asyncHandler(async (req, res, next) => {
  const { year, getAll } = req.query;
  const userId = req.userId;
  const onlyUsers = getAll ? "" : `AND WHERE r.[userId] = ${userId}`;
  const report = await req.db.sequelize.query(
    `SELECT 
      r.[id],div.[id] AS [divisionId],div.[departmentId] AS [departmentId], div.[nameShortMn] AS [divName],r.[name],
      ISNULL(p.[totalPlan],0) AS [totalPlan],r.[depcode],ISNULL(c.[amount],0) AS [amount],r.[performanceStart],
      r.[performanceEnd],imgFirst.[id] AS firstImageName, imgFirst.[picture1] AS firstImageType,
      imgLast.[id] AS lastImageName,imgLast.[picture1] AS lastImageType
    FROM cri_buildings r
    LEFT JOIN (
        SELECT buildingId, SUM([plan1]+[plan2]+[plan3]+[plan4]) AS [totalPlan]
        FROM cri_plans WHERE [repairId] IS NULL AND [buildingId] IS NOT NULL
        GROUP BY [buildingId] 
    ) p ON p.[buildingId] = r.[id]
    LEFT JOIN (
      SELECT [buildingId], SUM([amount])  AS [amount]
      FROM cri_completions WHERE [month] > 0 AND [buildingId] IS NOT NULL AND [repairId] IS NULL
      GROUP BY [buildingId]
    ) c ON c.[buildingId] = r.[id]
    LEFT JOIN cri_divisions div ON div.[depcode] = r.[depcode] 
    LEFT JOIN (
      SELECT * 
      FROM  (
        SELECT [id],[buildingId],[picture1], ROW_NUMBER() OVER(PARTITION BY buildingId ORDER BY [createdAt] DESC) AS RN
        FROM cri_progresses
        WHERE [picture1] <> '0' AND [repairId] IS NULL AND [active] = 1
      ) prog
      WHERE [RN] = 1
    ) imgLast ON imgLast.[buildingId] = r.[id]
    LEFT JOIN (
      SELECT * 
      FROM  (
        SELECT [id],[buildingId],[picture1], ROW_NUMBER() OVER(PARTITION BY buildingId ORDER BY [createdAt] ASC) AS RN
        FROM cri_progresses
        WHERE [picture1] <> '0' AND [repairId] IS NULL AND [active] = 1
      ) prog
      WHERE [RN] = 1
    ) imgFirst ON imgFirst.[buildingId] = r.[id]
    WHERE r.[rYear] = ${year} AND r.[active] = 1 ${onlyUsers}  ORDER BY div.[orderby]`,
    {
      type: QueryTypes.SELECT,
    }
  );

  res.status(200).json({
    success: true,
    data: report,
  });
});

exports.getMainReportExcelRepair = asyncHandler(async (req, res, next) => {
  const user = await req.db.user.findByPk(req.userId);
  const allDepartments = await req.db.department.findAll();
  const divIds = `${req.query.divIds}`.split(",");
  const year = req.query.year || new Date().getFullYear();
  const month = req.query.month || new Date().getMonth() + 1;
  const depcode = req.query.depcode || "120611";
  const userId = req.query.userId;
  const onlyUsers = userId ? `WHERE a.userId = ${userId}` : "";
  let reportData = await createMainReportRepairData(
    req,
    depcode,
    year,
    month,
    onlyUsers
  );
  reportData = reportData.filter((row) =>
    divIds.includes(row.divisionId.toString())
  );
  const groupedReportData = groupBy(reportData, "departmentId");
  const newDepartments = orderBy(allDepartments, "orderby", "asc")
    .map((dep) => ({
      name: dep.nameShortMn,
      id: dep.id,
    }))
    .filter((newDepartment) =>
      Object.keys(groupedReportData).includes(newDepartment.id.toString())
    );
  const reportTitle = `Их засварын үндсэн тайлан ${year} оны ${month} сарын байдлаар`;
  const reportFooter = `Тайлан бэлтгэсэн: ${user.jobName} ${user.lastname[0]}.${user.firstname}`;
  const workBook = new ExcelJS.Workbook();
  workBook.creator = "НРП хэлтэс";

  workBook.created = new Date();
  workBook.title = "ИХ БАРИЛГА ИХ ЗАСВАР";
  const worksheet = workBook.addWorksheet("Тайлан");
  const excelHeader = worksheet.getRow(1),
    excelFooter = worksheet.getRow(
      reportData.length + newDepartments.length + 6
    );
  excelHeader.font = { bold: true };
  excelHeader.getCell(2).value = reportTitle;
  excelFooter.getCell(2).value = reportFooter;
  // end excel info
  const excelRows = [];
  let rowNumber = 0,
    plan = 0,
    budget = 0,
    prevAmount = 0,
    currentAmount = 0,
    closedAmount = 0,
    sum1 = 0,
    sum2 = 0,
    ubtzPlan = 0,
    ubtzBudget = 0,
    ubtzPrevAmount = 0,
    ubtzCurrentAmount = 0,
    ubtzClosedAmount = 0,
    ubtzSum1 = 0,
    ubtzSum2 = 0;
  newDepartments.forEach((currentDep, currentDepIdx) => {
    plan = 0;
    budget = 0;
    prevAmount = 0;
    currentAmount = 0;
    closedAmount = 0;
    (sum1 = 0),
      (sum2 = 0),
      groupedReportData[currentDep.id].forEach((row, rowIdx) => {
        rowNumber += 1;
        plan += row.plan;
        budget += row.budget;
        prevAmount += row.prevAmount;
        currentAmount += row.currentAmount;
        closedAmount += row.status === 17 ? row.closedAmount : 0;
        sum1 += row.prevAmount + row.currentAmount;
        sum2 += row.status === 17 ? row.closedAmount : 0;
        excelRows.push([
          rowIdx + 1,
          row.depname,
          row.agent,
          row.name,
          row.plan,
          row.budget,
          row.prevAmount,
          row.currentAmount,
          row.prevAmount + row.currentAmount,
          row.status === 17 ? row.prevAmount + row.currentAmount : 0,
          row.plan === 0
            ? 0
            : ((row.prevAmount + row.currentAmount) * 100) / row.plan,
          row.owner,
          row.comment,
        ]);
      });
    ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"].forEach(
      (letter) => {
        worksheet.getCell(`${letter}${rowNumber + currentDepIdx + 4}`).numFmt =
          "#,##0.00";
        worksheet.getCell(`${letter}${rowNumber + currentDepIdx + 4}`).font = {
          bold: true,
        };
        worksheet.getCell(`${letter}${rowNumber + currentDepIdx + 4}`).border =
          {
            top: { style: "thin", color: { argb: "242222" } },
          };
        worksheet.getCell(
          `${letter}${newDepartments.length + reportData.length + 4}`
        ).numFmt = "#,##0.00";
        worksheet.getCell(
          `${letter}${newDepartments.length + reportData.length + 4}`
        ).font = {
          bold: true,
          size: 12,
        };
        worksheet.getCell(
          `${letter}${newDepartments.length + reportData.length + 4}`
        ).border = {
          top: { style: "thin", color: { argb: "242222" } },
        };
      }
    );
    ubtzPlan += plan;
    ubtzBudget += budget;
    ubtzPrevAmount += prevAmount;
    ubtzCurrentAmount += currentAmount;
    ubtzClosedAmount += closedAmount;
    ubtzSum1 += sum1;
    ubtzSum2 += sum2;
    excelRows.push([
      "",
      `${currentDep.name} албаны дүн`,
      "",
      "",
      plan,
      budget,
      prevAmount,
      currentAmount,
      sum1,
      sum2,
      plan === 0 ? 0 : (sum1 * 100) / plan,
      "",
      "",
    ]);
  });
  excelRows.push([
    "",
    `Нийт дүн`,
    "",
    "",
    ubtzPlan,
    ubtzBudget,
    ubtzPrevAmount,
    ubtzCurrentAmount,
    ubtzSum1,
    ubtzSum2,
    ubtzPlan === 0 ? 0 : (ubtzSum1 * 100) / ubtzPlan,
    "",
    "",
  ]);
  // end excel rows
  const excelColumns = [
    { name: "#Д/д" },
    { name: "Захиалгч" },
    { name: "Гүйцэтгэгч" },
    { name: "Ажлын нэр" },
    { name: "Төлөвлөгөө" },
    { name: "Төсөвт дүн, төг" },
    { name: "Өмнөх сарын өссөн дүн" },
    { name: "Тайлант сарын дүн" },
    { name: "Нийт сарын өссөн дүн" },
    { name: "Үүнээс хаасан дүн" },
    { name: "Биелэлтийн хувь %" },
    { name: "Хариуцагч" },
    { name: "Тайлбар" },
  ];
  const reportColumnLength = 13;
  for (let columnIndex = 1; columnIndex <= reportColumnLength; columnIndex++) {
    worksheet.getColumn(columnIndex).width = 25;

    if (columnIndex > 4 && columnIndex < 12) {
      worksheet.getColumn(columnIndex).style = {
        alignment: { horizontal: "right", vertical: "middle" },
      };
      worksheet.getColumn(columnIndex).numFmt = "#,##0.00";
    } else {
      worksheet.getColumn(columnIndex).style = {
        alignment: { horizontal: "left", vertical: "middle" },
      };
    }
  }
  worksheet.addTable({
    name: "reportMainExcelRepair",
    ref: "A3",
    headerRow: true,
    totalsRow: true,
    style: {
      theme: "TableStyleLight8",
      showRowStripes: true,
    },
    columns: excelColumns,
    rows: excelRows,
  });
  await workBook.xlsx.write(res);
  res.end();
});

exports.getMainReportExcelBuilding = asyncHandler(async (req, res, next) => {
  const user = await req.db.user.findByPk(req.userId);
  const allDepartments = await req.db.department.findAll();
  const divIds = `${req.query.divIds}`.split(",");
  const year = req.query.year || new Date().getFullYear();
  const month = req.query.month || new Date().getMonth() + 1;
  const depcode = req.query.depcode || "120611";
  const userId = req.query.userId;
  const onlyUsers = userId ? `WHERE a.userId = ${userId}` : "";
  let reportData = await createMainReportBuildingData(
    req,month,year,depcode,onlyUsers
  );
  reportData = reportData.filter((row) =>
    divIds.includes(row.divisionId.toString())
  );
  const groupedReportData = groupBy(reportData, "departmentId");
  const newDepartments = orderBy(allDepartments, "orderby", "asc")
    .map((dep) => ({
      name: dep.nameShortMn,
      id: dep.id,
    }))
    .filter((newDepartment) =>
      Object.keys(groupedReportData).includes(newDepartment.id.toString())
    );
  const reportTitle = `Их барилгын үндсэн тайлан ${year} оны ${month} сарын байдлаар`;
  const reportFooter = `Тайлан бэлтгэсэн: ${user.jobName} ${user.lastname[0]}.${user.firstname}`;
  const workBook = new ExcelJS.Workbook();
  workBook.creator = "НРП хэлтэс";

  workBook.created = new Date();
  workBook.title = "ИХ БАРИЛГА ИХ ЗАСВАР";
  const worksheet = workBook.addWorksheet("Тайлан");
  const excelHeader = worksheet.getRow(1),
    excelFooter = worksheet.getRow(
      reportData.length + newDepartments.length + 6
    );
  excelHeader.font = { bold: true };
  excelHeader.getCell(2).value = reportTitle;
  excelFooter.getCell(2).value = reportFooter;
  // end excel info
  const excelRows = [];
  let rowNumber = 0,
    plan = 0,
    budget = 0,
    closedAmount = 0,
    sum1 = 0,
    sum2 = 0,
    ubtzPlan = 0,
    ubtzBudget = 0,
    ubtzSum1 = 0,
    ubtzSum2 = 0;
  newDepartments.forEach((currentDep, currentDepIdx) => {
    plan = 0;
    budget = 0;
    prevAmount = 0;
    currentAmount = 0;
    closedAmount = 0;
    sum1 = 0;
      sum2 = 0;
      groupedReportData[currentDep.id].forEach((row, rowIdx) => {
        rowNumber += 1;
        plan += row.plan;
        budget += row.budget;
        closedAmount += row.status === 17 ? row.closedAmount : 0;
        sum1 += row.prevAmount + row.currentAmount;
        sum2 += row.status === 17 ? row.closedAmount : 0;
        excelRows.push([
          rowIdx + 1,
          row.depname,
          row.agent,
          row.name,
          row.plan,
          row.budget,
          row.prevAmount + row.currentAmount,
          row.status === 17 ? row.prevAmount + row.currentAmount : 0,
          row.plan === 0
            ? 0
            : ((row.prevAmount + row.currentAmount) * 100) / row.plan,
          row.owner,
          row.comment,
        ]);
      });
    ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"].forEach(
      (letter) => {
        worksheet.getCell(`${letter}${rowNumber + currentDepIdx + 4}`).numFmt =
          "#,##0.00";
        worksheet.getCell(`${letter}${rowNumber + currentDepIdx + 4}`).font = {
          bold: true,
        };
        worksheet.getCell(`${letter}${rowNumber + currentDepIdx + 4}`).border =
          {
            top: { style: "thin", color: { argb: "242222" } },
          };
        worksheet.getCell(
          `${letter}${newDepartments.length + reportData.length + 4}`
        ).numFmt = "#,##0.00";
        worksheet.getCell(
          `${letter}${newDepartments.length + reportData.length + 4}`
        ).font = {
          bold: true,
          size: 12,
        };
        worksheet.getCell(
          `${letter}${newDepartments.length + reportData.length + 4}`
        ).border = {
          top: { style: "thin", color: { argb: "242222" } },
        };
      }
    );
    ubtzPlan += plan;
    ubtzBudget += budget;
    ubtzSum1 += sum1;
    ubtzSum2 += sum2;
    excelRows.push([
      "",
      `${currentDep.name} албаны дүн`,
      "",
      "",
      plan,
      budget,
      sum1,
      sum2,
      plan === 0 ? 0 : (sum1 * 100) / plan,
      "",
      "",
    ]);
  });
  excelRows.push([
    "",
    `Нийт дүн`,
    "",
    "",
    ubtzPlan,
    ubtzBudget,
    ubtzSum1,
    ubtzSum2,
    ubtzPlan === 0 ? 0 : (ubtzSum1 * 100) / ubtzPlan,
    "",
    "",
  ]);
  // end excel rows
  const excelColumns = [
    { name: "#Д/д" },
    { name: "Захиалгч" },
    { name: "Гүйцэтгэгч" },
    { name: "Ажлын нэр" },
    { name: "Төлөвлөгөө" },
    { name: "Төсөвт дүн, төг" },
    { name: "Нийт сарын өссөн дүн" },
    { name: "Үүнээс хаасан дүн" },
    { name: "Биелэлтийн хувь %" },
    { name: "Хариуцагч" },
    { name: "Тайлбар" },
  ];
  const reportColumnLength = 11;
  for (let columnIndex = 1; columnIndex <= reportColumnLength; columnIndex++) {
    worksheet.getColumn(columnIndex).width = 25;

    if (columnIndex > 4 && columnIndex < 10) {
      worksheet.getColumn(columnIndex).style = {
        alignment: { horizontal: "right", vertical: "middle" },
      };
      worksheet.getColumn(columnIndex).numFmt = "#,##0.00";
    } else {
      worksheet.getColumn(columnIndex).style = {
        alignment: { horizontal: "left", vertical: "middle" },
      };
    }
  }
  worksheet.addTable({
    name: "reportMainExcelRepair",
    ref: "A3",
    headerRow: true,
    totalsRow: true,
    style: {
      theme: "TableStyleLight8",
      showRowStripes: true,
    },
    columns: excelColumns,
    rows: excelRows,
  });
  await workBook.xlsx.write(res);
  res.end();
});
