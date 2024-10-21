const asyncHandler = require("express-async-handler");
const { QueryTypes, Op, where } = require("sequelize");
const ExcelJS = require("exceljs");

const depIds = [2, 3, 1, 6, 5, 4, 15, 9, 10];
// repair huraangui
exports.getRepairsAbstract = asyncHandler(async (req, res) => {
  const data = await getAbstractData(req, "cri_repairs", "repairId");
  res.status(200).json({
    success: true,
    data,
  });
});

// building huraangui
exports.getBuildingsAbstract = asyncHandler(async (req, res) => {
  const data = await getAbstractData(req, "cri_buildings", "buildingId");
  res.status(200).json({
    success: true,
    data,
  });
});

// repair, building tulwuur
exports.getRepairsOrBuildingsByStatus = asyncHandler(async (req, res) => {
  const statuses = await req.db.status.findAll();
  const data = await getDataByStatuses(req, statuses);
  res.status(200).json({
    success: true,
    data,
  });
});

// huraangui datag beldeh
async function getAbstractData(req, tableName, mainKey) {
  const { year, month } = req.query;
  let condition = "";
  if (month < 4) {
    condition = `p.[plan1] > 0`;
  } else if (month < 7) {
    condition = `(p.[plan1] + p.[plan2]) > 0`;
  } else if (month < 10) {
    condition = `(p.[plan1] + p.[plan2] + p.[plan3])> 0`;
  } else {
    condition = `(p.[plan1] + p.[plan2] + p.[plan3] + p.[plan4]) > 0`;
  }
  const rows = await req.db.sequelize.query(
    `SELECT (SELECT [departmentId] FROM cri_divisions WHERE depcode = a.[depcode]) AS depId,
      (SELECT nameShortMn FROM cri_divisions WHERE depcode= a.[depcode]) AS divName,
      [depcode],SUM(ISNULL([plan1],0)) AS plan1,SUM(ISNULL([plan2],0)) AS plan2,
      SUM(ISNULL([plan3],0)) AS plan3,SUM(ISNULL([plan4],0)) AS plan4,SUM(ISNULL([amount],0)) AS amount
    FROM (
      SELECT r.[id],r.[depcode], p.*,c.[amount]
      FROM (
        SELECT [${mainKey}], [plan1],[plan2],[plan3],[plan4]
        FROM cri_plans
        WHERE [${mainKey}] IS NOT NULL AND [planYear] = ${year}
      ) AS p
    INNER JOIN ${tableName} r ON r.[id] = p.[${mainKey}]
    LEFT JOIN (
      SELECT [${mainKey}],SUM(ISNULL([amount],0)) AS amount
      FROM cri_completions
      WHERE [${mainKey}] IS NOT NULL  AND [month] > 0 AND [month] <= ${month} AND [year] = ${year}
      GROUP BY [${mainKey}]
    ) c ON c.[${mainKey}] = p.[${mainKey}]
    LEFT JOIN cri_divisions div ON div.[depcode] = r.[depcode]
    WHERE r.[active] = 1 AND r.[rYear] = ${year} AND ${condition}
  ) a
  GROUP BY [depcode]`,
    { type: QueryTypes.SELECT }
  );

  const departments = await req.db.department.findAll({
    where: { id: { [Op.in]: depIds } },
  });

  let data = [],
    plan1,
    plan2,
    plan3,
    plan4,
    amount;
  departments.forEach((dep) => {
    plan1 = 0;
    plan2 = 0;
    plan3 = 0;
    plan4 = 0;
    amount = 0;
    const childs = rows.filter((row) => {
      if (row.depId === dep.id) {
        plan1 += row.plan1 ?? 0;
        plan2 += row.plan2 ?? 0;
        plan3 += row.plan3 ?? 0;
        plan4 += row.plan4 ?? 0;
        amount += row.amount ?? 0;
        return row;
      }
    });
    if (childs.length > 0) {
      data.push({
        depId: dep.id,
        plan1,
        plan2,
        plan3,
        plan4,
        amount,
        depName: dep.nameShortMn,
        childs,
      });
    }
  });
  rows.forEach((row) => {
    if (!depIds.includes(row.depId)) {
      data.push({
        depId: row.depcode,
        depName: row.divName,
        plan1: row.plan1,
        plan2: row.plan2,
        plan3: row.plan3,
        plan4: row.plan4,
        amount: row.amount,
        childs: [
          {
            depcode: row.depcode,
            depName: row.divName,
            plan1: row.plan1,
            plan2: row.plan2,
            plan3: row.plan3,
            plan4: row.plan4,
            amount: row.amount,
          },
        ],
      });
    }
  });
  return data;
}

// abstract report
exports.createExcelReportForAbstract = asyncHandler(async (req, res) => {
  const { year, month, type } = req.query;
  const user = await req.db.user.findByPk(req.userId);
  const tableName = type === "repair" ? "cri_repairs" : "cri_buildings";
  const mainKey = type === "repair" ? "repairId" : "buildingId";
  const reportTitle = `Их ${
    type === "repair" ? "засварын " : "барилгын"
  } хураангүй тайлан ${year} оны ${month}-р сарын байдлаар`;
  const reportFooter = `Тайлан бэлтгэсэн: ${user.jobName} ${user.lastname[0]}.${user.firstname}`;
  const rows = await getAbstractData(req, tableName, mainKey);
  const workBook = new ExcelJS.Workbook();
  workBook.creator = "НРП хэлтэс";
  workBook.created = new Date();
  workBook.title = "ИХ БАРИЛГА ИХ ЗАСВАР";
  const worksheet = workBook.addWorksheet("Тайлан");
  let totalPlan = 0,
    totalAmount = 0,
    plan = 0;
  const excelRows = rows.map((row, rowIdx) => {
    plan = 0;
    if (month < 4) {
      plan = row.plan1;
    } else if (month < 7) {
      plan = row.plan1 + row.plan2;
    } else if (month < 10) {
      plan = row.plan1 + row.plan2 + row.plan3;
    } else {
      plan = row.plan1 + row.plan2 + row.plan3 + row.plan4;
    }
    totalPlan += plan;
    totalAmount += row.amount;
    return [
      rowIdx + 1,
      row.depName,
      plan,
      row.amount,
      (row.amount * 100) / plan,
      plan - row.amount,
    ];
  });
  const excelHeader = worksheet.getRow(1),
    excelFooter = worksheet.getRow(rows.length + 6);
  excelHeader.font = { bold: true };
  excelHeader.getCell(2).value = reportTitle;
  excelFooter.getCell(2).value = reportFooter;
  worksheet.addTable({
    name: "abstractReport",
    ref: "A3",
    headerRow: true,
    totalsRow: true,
    style: {
      theme: "TableStyleLight8",
      showRowStripes: true,
    },
    columns: [
      { name: "#", totalsRowLabel: "Нийт:" },
      { name: "Аж ахуй нэгж", totalsRowFunction: "count" },
      { name: "Төлөвлөгөө", totalsRowFunction: "sum" },
      { name: "Гүйцэтгэл", totalsRowFunction: "sum" },
      { name: "Биелэлт %", totalsRowFunction: "average" },
      { name: "Зөрүү", totalsRowFunction: "sum" },
    ],
    rows: excelRows,
  });
  worksheet.getColumn(2).width = 25;
  [3, 4, 5, 6].forEach((columnIndex) => {
    worksheet.getColumn(columnIndex).width = 25;
    worksheet.getColumn(columnIndex).style = {
      alignment: { horizontal: "center", vertical: "middle" },
    };
    worksheet.getColumn(columnIndex).numFmt = "#,##0.00";
  });
  await workBook.xlsx.write(res);
  res.end();
});

// repair, building tulwuur datag beldeh
async function getDataByStatuses(req, statuses) {
  const { year, type } = req.query;
  const mainTableName = type === "repair" ? "cri_repairs" : "cri_buildings";
  const mainKey = type === "repair" ? "repairId" : "buildingId";
  let statusCase = "",
    sumCase = "";
  statuses.forEach((status, statusIdx) => {
    statusCase += ` COUNT(CASE WHEN pg.[statusId] = ${status.id} THEN 1 END) AS [status-${status.id}],`;
    sumCase += ` SUM([status-${status.id}]) AS [status-${status.id}] ${
      statusIdx + 1 === statuses.length ? "" : ","
    }`;
  });
  const data = await req.db.sequelize.query(
    `SELECT [depId],[depName],SUM([plan]) AS [plan],SUM([amount]) AS [amount],SUM([budget]) AS budget,
      SUM(totalJobs) AS [totalJobs],SUM([status-0]) AS [status-0], ${sumCase} 
     FROM (
        SELECT CASE WHEN div.[departmentId] IN (${depIds}) THEN div.[departmentId] ELSE r.[depcode] END AS depId, r.[depcode],
          SUM(ISNULL(p.[plan1],0)+ISNULL(p.[plan2],0)+ISNULL(p.[plan3],0)+ISNULL(p.[plan4],0)) AS [plan],
          CASE WHEN div.[departmentId] IN (${depIds}) THEN (SELECT nameShortMn FROM cri_departments WHERE [id] = div.[departmentId]) ELSE div.[nameShortMn] END AS depName,
          SUM(ISNULL(c.[amount],0)) AS [amount],COUNT(CASE WHEN ISNULL(c.[budget],0) > 0 THEN 1 END) AS budget,
          ${statusCase} COUNT(CASE WHEN pg.[statusId] IS NULL THEN 1 END) AS [status-0], COUNT(*) AS [totalJobs]
        FROM ${mainTableName} r
        INNER JOIN cri_divisions div ON div.[depcode] = r.[depcode]
        LEFT JOIN cri_plans p ON p.[${mainKey}] = r.[id]
        LEFT JOIN (
          SELECT [${mainKey}],SUM(CASE WHEN [month] = 0 AND [year] = 0 THEN 0 ELSE ISNULL([amount],0) END) AS [amount],
            COUNT(CASE WHEN [year] = 0 AND [month] = 0 AND [amount] > 0 THEN 1 END) budget
          FROM cri_completions
          WHERE [year] = ${year} OR [year] = 0
          GROUP BY [${mainKey}]
        ) c ON c.[${mainKey}] = r.[id]
        LEFT JOIN (
          SELECT *
          FROM (
            SELECT ROW_NUMBER() OVER(PARTITION BY [${mainKey}] ORDER BY [${mainKey}],[createdAt] DESC) AS RN,[${mainKey}],[statusId]
            FROM cri_progresses
            WHERE [${mainKey}] IS NOT NULL AND [active] = 1
          ) a WHERE [RN] = 1
        ) pg ON pg.[${mainKey}] = r.[id]
        WHERE r.[active] = 1 AND r.[rYear] = ${year}
        GROUP BY r.[depcode],div.[departmentId], div.[nameShortMn]
    ) rps GROUP BY [depId],[depName] ORDER BY [depId]`,
    {
      type: QueryTypes.SELECT,
    }
  );
  return data;
}

// repair, building tulwuur tailan
exports.createExcelReportWithStatus = asyncHandler(async (req, res) => {
  const { year, type, report } = req.query;
  const statuses = await req.db.status.findAll();
  const filteredStatuses = statuses.filter((status) =>
    report === "all"
      ? status.nameMn.toLowerCase().indexOf("эхлээгүй") < 0
      : status.nameMn.toLowerCase().indexOf("эхлээгүй") > -1
  );
  const rows = await getDataByStatuses(req, statuses);
  const user = await req.db.user.findByPk(req.userId);
  const reportTitle = `Их ${
    type === "repair" ? "засварын " : "барилгын"
  } ажлын тайлан төлвөөр ${year} оны  байдлаар`;
  const reportFooter = `Тайлан бэлтгэсэн: ${user.jobName} ${user.lastname[0]}.${user.firstname}`;
  const workBook = new ExcelJS.Workbook();
  workBook.creator = "НРП хэлтэс";
  workBook.created = new Date();
  workBook.title = "ИХ БАРИЛГА ИХ ЗАСВАР";
  const worksheet = workBook.addWorksheet("Тайлан");
  const excelHeader = worksheet.getRow(1),
    excelFooter = worksheet.getRow(rows.length + 6);
  excelHeader.font = { bold: true };
  excelHeader.getCell(2).value = reportTitle;
  excelFooter.getCell(2).value = reportFooter;
  const excelRows = rows.map((row, rowIdx) => {
    const excelRow = [
      rowIdx + 1,
      row.depName,
      row.plan,
      row.amount,
      (row.amount * 100) / row.plan,
      row.budget,
      row.totalJobs,
      row[`status-0`],
    ];
    filteredStatuses.forEach((status) =>
      excelRow.push(row[`status-${status.id}`])
    );
    return excelRow;
  });
  const excelColumns = [
    { name: "#", totalsRowLabel: "Нийт:" },
    { name: "Аж ахуй нэгж", totalsRowFunction: "count" },
    { name: "Төлөвлөгөө", totalsRowFunction: "sum" },
    { name: "Гүйцэтгэл", totalsRowFunction: "sum" },
    { name: "Биелэлт %", totalsRowFunction: "average" },
    { name: "Төсвийн тоо", totalsRowFunction: "sum" },
    { name: "Ажлын тоо", totalsRowFunction: "sum" },
    { name: "Төлөв сонгоогүй", totalsRowFunction: "count" },
  ];
  filteredStatuses.forEach((status, statusIdx) => {
    excelColumns.push({ name: status.nameMn, totalsRowFunction: "sum" });
  });
  worksheet.getColumn(2).width = 25;
  [3, 4, 5].forEach((columnIndex) => {
    worksheet.getColumn(columnIndex).width = 25;
    worksheet.getColumn(columnIndex).style = {
      alignment: { horizontal: "right", vertical: "middle" },
    };
    worksheet.getColumn(columnIndex).numFmt = "#,##0.00";
  });
  worksheet.addTable({
    name: "abstractReport",
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
