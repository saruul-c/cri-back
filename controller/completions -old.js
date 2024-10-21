const asyncHandler = require("express-async-handler");
const MyError = require("../utils/myError");
const { QueryTypes } = require("sequelize");

exports.getCompletion = asyncHandler(async (req, res, next) => {
  const workWayId = req.query.workWayId;
  const table = req.query.repair == 1 ? "repair" : "building";
  const debet =
    req.query.repair == 1
      ? "SUM(ISNULL(debet, 0)) debet"
      : "SUM(ISNULL(debet, 0) - ISNULL(credit, 0)) debet";
  const account1 =
    req.query.repair == 1
      ? "RTRIM(account) = '14-03-01-43' AND attr = '0712'"
      : "LEFT(account, 5) = '20-04'";
  const account2 =
    req.query.repair == 1
      ? `RTRIM(account) = '14-03-01-4${workWayId}'`
      : "LEFT(account, 5) = '20-04'";
  const comp = await req.db.sequelize.query(
    `SELECT c.year, r.depcode, r.sectionCode, r.workWayId FROM cri_completions c
    INNER JOIN cri_${table}s r ON c.${table}Id = r.id WHERE c.year <> 0 AND ${table}Id = ${req.params.id} 
    GROUP BY c.year, r.depcode, r.sectionCode, r.workWayId`,
    {
      type: QueryTypes.SELECT,
    }
  );

  let completions = [];
  for (const com of comp) {
    if (com.workWayId == 3) {
      completions.push(
        await req.db.sequelize.query(
          `SELECT comp.[year], comp.[month], SUM(comp.[amount]) AS amount, SUM(ISNULL(coss.[debet], 0)) AS debet, comp.[depcode]
          FROM (
            SELECT c.[year], c.[month], c.[amount], r.[sectionCode], c.[client] AS [depcode]
            FROM cri_completions c
            INNER JOIN cri_${table}s r ON c.${table}Id = r.id
            WHERE r.id = ${req.params.id} AND c.year = ${com.year}) AS comp
          LEFT JOIN (
            SELECT [smonth], SUM(ISNULL([credit], 0)) AS debet, [code] AS [depcode]
            FROM fas_coss_${com.year}.logcoss.jrn_list
            WHERE [active] = 'Y' AND [depcode] = ${req.query.depcodes} AND LEFT(account, 2) = '31' AND credit > 0 AND code IN (${req.query.clients}) AND routeid IN (
		          SELECT routeid FROM fas_coss_${com.year}.logcoss.jrn_list WHERE active = 'Y' AND depcode = ${com.depcode} AND ${account1} AND code = '${com.sectionCode}' AND debet > 0)
            GROUP BY smonth, code) AS coss 
          ON coss.[smonth] = comp.[month] AND coss.[depcode] = comp.[depcode]
          GROUP BY [year], [month], comp.[depcode]`,
          {
            type: QueryTypes.SELECT,
          }
        )
      );
    } else {
      completions.push(
        await req.db.sequelize.query(
          `SELECT comp.[month] AS id, comp.[year], comp.[month], comp.amount, ISNULL(coss.debet, 0) AS debet, ISNULL(comp.depcode, coss.depcode) AS depcode, 0 AS client
          FROM (
            SELECT c.[year], c.[month], SUM(c.amount) AS amount, r.[sectionCode], c.[depcode]
            FROM cri_completions c
            INNER JOIN cri_${table}s r ON c.${table}Id = r.id
            WHERE r.id = ${req.params.id} AND c.year = ${com.year}
            GROUP BY c.[year], c.[month], r.[sectionCode], c.[depcode]
          ) comp
          LEFT JOIN (
            SELECT smonth, ${debet}, depcode
            FROM fas_coss_${com.year}.logcoss.jrn_list
            WHERE active = 'Y' AND depcode IN (${req.query.depcodes}) AND ${account2} AND LEFT(attr, 1) = '0' AND attr <> '0999' AND code = '${com.sectionCode}'
            GROUP BY smonth, depcode
          ) coss ON coss.smonth = comp.[month]`,
          {
            type: QueryTypes.SELECT,
          }
        )
      );
    }
  }
  res.status(200).json({
    success: true,
    years: comp,
    data: completions,
  });
});

exports.fromCoss = asyncHandler(async (req, res, next) => {
  const year = req.query.year || new Date().getFullYear();
  const month = req.query.month || 1;
  const code = req.query.code || "00001";
  const depcode =
    req.query.workWay != 1
      ? req.query.client
      : req.query.depcode || req.depcode;

    const cossDepcode = req.query.workWay === '2' ? req.query.client : req.query.depcode;
    console.log("\n*********************************: cossDEPCODE: \n",cossDepcode,"workWay: ", req.query.workWay," depcode: ",req.query.depcode," client: ",req.query.client,"\n*****************************************")
  const account =
    req.query.repair == 1
      ? `'14-03-01-4${req.query.workWay}'`
      : "'20-04-01-00'";
  const type = req.query.repair == 1 ? "repairId" : "buildingId";
  const txt =
    req.query.workWay == 3
      ? `AND routeid IN (SELECT routeid FROM fas_coss_${year}.logcoss.jrn_list WHERE active = 'Y' AND depcode = ${req.query.depcode} AND LEFT(account, 2) IN ('15', '31') AND code IN (${req.query.client}) AND credit > 0)`
      : "";
  const isClient = req.query.workWay == 3 ? `[client]` : `[depcode]`;
  const pvt =
    req.query.budgetType == 1
      ? "[1], [9], [10], [11], [12], [28], [34]"
      : "[1], [3], [5], [7], [8], [9], [18], [24], [29]";
  const select =
    req.query.budgetType == 1
      ? `SUM(CASE WHEN LEFT(attr, 2) = '01' THEN amount ELSE 0 END) AS '1',
          SUM(CASE WHEN LEFT(attr, 2) = '02' THEN amount ELSE 0 END) AS '9',
          SUM(CASE WHEN LEFT(attr, 2) = '03' THEN amount ELSE 0 END) AS '10',
          SUM(CASE WHEN attr IN ('0751', '0754', '0758', '0960', '0752', '0756', '0757', '0781', '0782', '0783', '0785', '0786', '0792', '0794', '0884') THEN amount ELSE 0 END) AS '11',
          SUM(CASE WHEN LEFT(attr, 2) = '04' THEN amount ELSE 0 END) AS '12',
          SUM(CASE WHEN attr = '0873' THEN amount ELSE 0 END) AS '28',
          SUM(amount) AS '34'`
      : `SUM(CASE WHEN attr IN ('0111', '0112') THEN amount ELSE 0 END) AS '1',
          SUM(CASE WHEN LEFT(attr, 2) = '01' AND ATTR <> '0111' AND ATTR <> '0112' THEN amount ELSE 0 END) AS '3',
          SUM(CASE WHEN LEFT(attr, 2) = '02' THEN amount ELSE 0 END) AS '5',
          SUM(CASE WHEN LEFT(attr, 2) = '03' THEN amount ELSE 0 END) AS '7',
          SUM(CASE WHEN attr IN ('0751', '0754', '0758', '0884', '0960') THEN amount ELSE 0 END) AS '8',
          SUM(CASE WHEN LEFT(attr, 2) = '04' THEN amount ELSE 0 END) AS '9',
          SUM(CASE WHEN attr = '0873' THEN amount ELSE 0 END) AS '18',
          SUM(CASE WHEN attr IN ('0752', '0756', '0757', '0781', '0782', '0783', '0785', '0786', '0792', '0794') THEN amount ELSE 0 END) AS '24',
          SUM(amount) AS '29'`;

  const completions = await req.db.sequelize.query(
    `SELECT ISNULL(coss.[row], com.[row]) AS [row], ${year} AS year, ISNULL(coss.[month], com.[month]) AS [month], ISNULL(coss.[amount], 0) AS coss_amount, ISNULL(com.[amount], 0) AS com_amount FROM (
      SELECT ${month} AS [month], [row], [amount] FROM (
        SELECT
          ${select}
        FROM (
          SELECT attr, debet AS amount
          FROM fas_coss_${year}.logcoss.jrn_list
          WHERE active = 'Y' AND smonth = ${month} AND LEFT(ATTR, 1) = '0' AND Attr <> '0999' AND RTRIM(LTRIM(account)) = ${account} AND code = '${code}' AND depcode = ${cossDepcode} AND debet > 0 ${txt}
          UNION ALL
          SELECT attr, credit * -1 AS amount
          FROM fas_coss_${year}.logcoss.jrn_list
          WHERE active = 'Y' AND smonth = ${month} AND LEFT(ATTR, 1) = '0' AND Attr <> '0999' AND RTRIM(LTRIM(account)) = ${account} AND code = '${code}' AND depcode = ${cossDepcode} AND credit > 0 AND routeid NOT IN (
            SELECT routeid FROM fas_coss_${year}.logcoss.jrn_list WHERE active = 'Y' AND smonth = ${month} AND LEFT(account, 5) IN ('12-11', '14-05') AND debet > 0
          )
        ) jrn
      ) a
      UNPIVOT (amount FOR [row] IN (${pvt})) unpvt
    ) coss
    FULL JOIN (SELECT [month], [row], [amount] FROM cri_completions WHERE ${isClient} = ${depcode} AND [year] = ${year} AND [month] = ${month} AND ${type} = ${req.query.id}) com
    ON coss.[month] = com.[month] AND coss.[row] = com.[row]`,
    {
      type: QueryTypes.SELECT,
    }
  );

  res.status(200).json({
    success: true,
    data: completions,
  });
});

exports.getCompletionAct = asyncHandler(async (req, res, next) => {
  const year = req.query.year || new Date().getFullYear();
  const month = req.query.month || 1;
  const code = req.query.code || "00001";
  const depcode =
    req.query.workWay != 1
      ? req.query.client
      : req.query.depcode || req.depcode;
  const isClient = req.query.workWay == 3 ? `[client]` : `[depcode]`;
  const account =
    req.query.repair == 1
      ? `'14-03-01-4${req.query.workWay}'`
      : "'20-04-01-00'";
  const type = req.query.repair == 1 ? "repairId" : "buildingId";
  const txt =
    req.query.workWay == 3
      ? `AND routeid IN (SELECT routeid FROM fas_coss_${year}.logcoss.jrn_list WHERE active = 'Y' AND depcode = ${req.query.depcode} AND LEFT(RTRIM(LTRIM(account)), 2) = '31' AND Code IN (${req.query.client}) AND credit > 0)`
      : "";
  const pvt =
    req.query.budgetType == 1
      ? "[1], [9], [10], [11], [12], [28], [34]"
      : "[1], [3], [5], [7], [8], [9], [18], [24], [29]";
  const select =
    req.query.budgetType == 1
      ? `SUM(CASE WHEN LEFT(attr, 2) = '01' THEN amount ELSE 0 END) AS '1',
          SUM(CASE WHEN LEFT(attr, 2) = '02' THEN amount ELSE 0 END) AS '9',
          SUM(CASE WHEN LEFT(attr, 2) = '03' THEN amount ELSE 0 END) AS '10',
          SUM(CASE WHEN attr IN ('0751', '0754', '0758', '0960', '0752', '0756', '0757', '0781', '0782', '0783', '0785', '0786', '0792', '0794', '0884') THEN amount ELSE 0 END) AS '11',
          SUM(CASE WHEN LEFT(attr, 2) = '04' THEN amount ELSE 0 END) AS '12',
          SUM(CASE WHEN attr = '0873' THEN amount ELSE 0 END) AS '28',
          SUM(amount) AS '34'`
      : `SUM(CASE WHEN attr IN ('0111', '0112') THEN amount ELSE 0 END) AS '1',
          SUM(CASE WHEN LEFT(attr, 2) = '01' THEN amount ELSE 0 END) AS '3',
          SUM(CASE WHEN LEFT(attr, 2) = '02' THEN amount ELSE 0 END) AS '5',
          SUM(CASE WHEN LEFT(attr, 2) = '03' THEN amount ELSE 0 END) AS '7',
          SUM(CASE WHEN attr IN ('0751', '0754', '0758', '0884', '0960') THEN amount ELSE 0 END) AS '8',
          SUM(CASE WHEN LEFT(attr, 2) = '04' THEN amount ELSE 0 END) AS '9',
          SUM(CASE WHEN attr = '0873' THEN amount ELSE 0 END) AS '18',
          SUM(CASE WHEN attr IN ('0752', '0756', '0757', '0781', '0782', '0783', '0785', '0786', '0792', '0794') THEN amount ELSE 0 END) AS '24',
          SUM(amount) AS '29'`;

  const completions = await req.db.sequelize.query(
    `SELECT ISNULL(coss.[row], com.[row]) AS [row], ${year} AS year, ISNULL(coss.[month], com.[month]) AS [month], ISNULL(coss.[amount], 0) AS coss_amount, ISNULL(com.[amount], 0) AS com_amount FROM (
      SELECT ${month} AS [month], [row], [amount] FROM (
        SELECT
          ${select}
        FROM (
          SELECT attr, debet AS amount
          FROM fas_coss_${year}.logcoss.jrn_list
          WHERE active = 'Y' AND smonth = ${month} AND LEFT(ATTR, 1) = '0' AND Attr <> '0999' AND RTRIM(LTRIM(account)) = ${account} AND code = '${code}' AND depcode = ${req.query.depcode} AND debet > 0 ${txt}
          UNION
          SELECT attr, credit * -1 AS amount
          FROM fas_coss_${year}.logcoss.jrn_list
          WHERE active = 'Y' AND smonth = ${month} AND LEFT(ATTR, 1) = '0' AND Attr <> '0999' AND RTRIM(LTRIM(account)) = ${account} AND code = '${code}' AND depcode = ${req.query.depcode} AND credit > 0 AND routeid NOT IN (
            SELECT routeid FROM fas_coss_${year}.logcoss.jrn_list WHERE active = 'Y' AND smonth = ${month} AND LEFT(account, 5) IN ('12-11', '14-05') AND debet > 0
          )
        ) jrn
      ) a
      UNPIVOT (amount FOR [row] IN (${pvt})) unpvt
    ) coss
    FULL JOIN (SELECT [month], [row], [amount] FROM cri_completions WHERE (${isClient} IN (${depcode}) OR [depcode] = 0) AND ([year] = ${year} OR [year] = 0) AND [month] <= ${month} AND ${type} = ${req.query.id}) com
    ON coss.[month] = com.[month] AND coss.[row] = com.[row]`,
    {
      type: QueryTypes.SELECT,
    }
  );

  res.status(200).json({
    success: true,
    data: completions,
  });
});

exports.createCompletion = asyncHandler(async (req, res, next) => {
  const year = req.params.year || new Date().getFullYear();
  const month = req.params.month || new Date().getMonth();
  if (req.params.repair == 1) {
    const repair = await req.db.repair.findByPk(req.params.id);
    if (!repair) {
      throw new MyError(`${req.params.id} дугаартай их засвар олдсонгүй!`, 404);
    }
    await req.db.completion.destroy({
      where: {
        repairId: req.params.id,
        year: year,
        month: month,
      },
    });

    req.body.forEach(async (item) => {
      await req.db.completion.create({
        ...item,
        repairId: req.params.id,
        createdUser: req.userId,
      });
    });
  } else {
    const building = await req.db.building.findByPk(req.params.id);
    if (!building) {
      throw new MyError(
        `${req.params.id} дугаартай их барилга олдсонгүй!`,
        404
      );
    }
    await req.db.completion.destroy({
      where: {
        buildingId: req.params.id,
        year: year,
        month: month,
      },
    });

    req.body.forEach(async (item) => {
      await req.db.completion.create({
        ...item,
        buildingId: req.params.id,
        createdUser: req.userId,
      });
    });
  }

  res.status(200).json({
    success: true,
  });
});

exports.updateCompletion = asyncHandler(async (req, res, next) => {
  req.body.updatedUser = req.userId;
  let completion = await req.db.completion.findByPk(req.params.id);

  if (!completion) {
    throw new MyError(`${req.params.id} дугаартай чиглэл олдсонгүй!`, 400);
  }

  completion = await completion.update(req.body);

  res.status(200).json({
    success: true,
    data: completion,
  });
});

exports.deleteCompletion = asyncHandler(async (req, res, next) => {
  const repair = req.params.repair || true;
  const client = req.params.client || "depcode";
  const year = req.params.year || 2023;
  const month = req.params.month || 1;
  const agent = req.params.agent;
  const id = req.params.id;

  if (repair) {
    if (client == "depcode") {
      await req.db.completion.destroy({
        where: {
          year: year,
          month: month,
          depcode: agent,
          repairId: id,
        },
      });
    } else {
      await req.db.completion.destroy({
        where: {
          year: year,
          month: month,
          client: agent,
          repairId: id,
        },
      });
    }
  } else {
    if (client == "depcode") {
      await req.db.completion.destroy({
        where: {
          year: year,
          month: month,
          depcode: agent,
          buildingId: id,
        },
      });
    } else {
      await req.db.completion.destroy({
        where: {
          year: year,
          month: month,
          client: agent,
          buildingId: id,
        },
      });
    }
  }

  res.status(200).json({
    success: true,
  });
});
