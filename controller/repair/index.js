const colors = require("colors");
const asyncHandler = require("express-async-handler");
const { QueryTypes } = require("sequelize");
const maxId = require("../../services/criService");
const MyError = require("../../utils/myError");

exports.getRepairs = asyncHandler(async (req, res, next) => {
  const getAll = req.query.getAll
    ? ` AND r.[depcode] IN (${req.query.depcodes})`
    : ` AND r.[userId] = ${req.userId}`;
  const nowYear = new Date().getFullYear();
  const year = req.query.year ?? nowYear;
  const month =
    parseInt(year) === nowYear
      ? new Date().getMonth() + 1
      : parseInt(year) > nowYear
      ? 1
      : 12;
  const repair1 = await req.db.sequelize.query(
    `SELECT r.[createdUser], r.[rYear], r.[id], r.[fav], r.[archive], r.[depcode], r.[name], r.[nameRu], r.[workWayId], r.[activityId], r.[userId], r.[sectionCode],
      ISNULL((SELECT STRING_AGG(nameShortMn, ',') FROM cri_divisions WHERE id IN (SELECT divisionId FROM cri_repairs_divisions WHERE repairId = r.id)),'') AS divs,
      ISNULL((SELECT STRING_AGG(label,',') FROM cri_clients WHERE id IN (SELECT clientId FROM cri_repairs_clients WHERE repairId = r.id)),'') AS clients,
      ISNULL(sw.worker, 0) AS worker, ISNULL(CONCAT(u.lastname, ' ', u.firstName),'-') [owner], ISNULL(completions.budget_amount, 0) totalBudget, ISNULL(p.c1_plan, 0) AS c1_plan,
      ISNULL(p.plan1, 0) AS plan1, ISNULL(p.plan2, 0) AS plan2, ISNULL(p.plan3, 0) AS plan3, ISNULL(p.plan4, 0) AS plan4, prog.statusId, ISNULL(completions.comp_amount, 0) AS comp_amounts,
      divisions.[nameShortMn] AS depname,(SELECT id FROM cri_benefits WHERE repairId = r.id) AS benefit,
      CASE WHEN prog.statusId = 17 THEN ISNULL(completions.comp_amount, 0) ELSE 0 END AS close_amounts,prog.comment,
      ISNULL(completions.compPrevMonth_amount,0) completionsPrevMonth,ISNULL(completions.compCurrentMonth_amount,0) completionsCurrentMonth, 0 as compPrevYears, ISNULL(j.c1_coss,0) AS c1_coss, ISNULL(j.debet,0) AS debet
    FROM cri_repairs r
    LEFT JOIN (
      SELECT r.id, SUM(ISNULL(c1_coss, 0)) AS c1_coss, SUM(ISNULL(debet, 0)) AS debet
      FROM cri_repairs r
      LEFT JOIN (
        SELECT SUM(ISNULL(debet, 0)) AS c1_coss, depcode, code FROM fas_coss_${year}.logcoss.dns_list
        WHERE active = 'Y' AND smonth = 1 AND depcode != 120611 AND (ACCOUNT LIKE '6%' OR ACCOUNT LIKE '14-03%')
        GROUP BY depcode, code
      ) d ON r.sectionCode = d.code AND r.depcode = d.depcode
    INNER JOIN (
        SELECT SUM(ISNULL(a.[debet],0))-SUM(ISNULL(b.[debet],0)) AS [debet],a.[depcode],a.[CODE]
        FROM (
          SELECT SUM(debet) AS debet, depcode, code FROM fas_coss_${year}.logcoss.jrn_list
          WHERE active = 'Y' AND depcode != 120611 AND Attr != '0999' AND (ACCOUNT LIKE '6%' OR ACCOUNT LIKE '14-03%')
            AND [routeid] NOT IN (SELECT [routeid] FROM fas_coss_${year}.logcoss.jrn_list WHERE [active] = 'Y' AND RTRIM([ACCOUNT]) = '31-11-01-00' AND [CODE] = '00102' AND [CREDIT] > 0)
          GROUP BY depcode, code
        ) a
        LEFT JOIN (
          SELECT SUM(CREDIT) AS debet, depcode, code FROM fas_coss_${year}.logcoss.jrn_list
          WHERE active = 'Y' AND depcode != 120611 AND Attr != '0999' AND (ACCOUNT LIKE '6%' OR ACCOUNT LIKE '14-03%')
            AND [routeid] NOT IN (SELECT [routeid] FROM fas_coss_${year}.logcoss.jrn_list WHERE [active] = 'Y' AND (ACCOUNT LIKE '12-11%' OR ACCOUNT LIKE '14-05%') AND [DEBET] > 0)
          GROUP BY depcode, code
        ) b ON a.[depcode] = b.[depcode] AND a.[CODE] = b.[CODE]
        GROUP BY a.[depcode],a.[CODE]
        ) j ON r.sectionCode = j.code AND r.depcode != j.depcode
        WHERE r.active = 1 AND workWayId = 2 AND rYear = ${year}
        GROUP BY id
    ) j ON j.id = r.id
    LEFT JOIN cri_users u ON u.id = r.userId
    LEFT JOIN (
      SELECT repairId, ISNULL(SUM(CASE WHEN planYear < ${year} THEN ISNULL(plan1, 0) + ISNULL(plan2, 0) + ISNULL(plan3, 0) + ISNULL(plan4, 0) END), 0) AS c1_plan,
        ISNULL(SUM(CASE WHEN planYear = ${year} THEN plan1 END), 0) AS plan1, ISNULL(SUM(CASE WHEN planYear = ${year} THEN plan2 END), 0) AS plan2,
        ISNULL(SUM(CASE WHEN planYear = ${year} THEN plan3 END), 0) AS plan3, ISNULL(SUM(CASE WHEN planYear = ${year} THEN plan4 END), 0) AS plan4
      FROM cri_plans WHERE repairId IS NOT NULL GROUP BY repairId
    ) p ON p.repairId = r.id
    LEFT JOIN (SELECT statusId, repairId,comment FROM (SELECT ROW_NUMBER() OVER(PARTITION BY repairId ORDER BY createdAt DESC) as RN, statusId, repairId,comment FROM cri_progresses WHERE active = 1 AND repairId IS NOT NULL) pp WHERE RN = 1) prog ON prog.repairId  = r.id
    LEFT JOIN (
      SELECT [repairId], 
            SUM(CASE WHEN [month] > 0 THEN ISNULL([amount],0) ELSE 0 END) AS [comp_amount],
            SUM(CASE WHEN [month] = 0 AND [year] = 0 THEN ISNULL([amount],0) ELSE 0 END) AS [budget_amount],
            SUM(CASE WHEN [month] < ${month} AND [year] = ${year} THEN ISNULL([amount],0) ELSE 0 END) AS compPrevMonth_amount,
            SUM(CASE WHEN [month] = ${month} AND [year] = ${year} THEN ISNULL([amount],0) ELSE 0 END) AS compCurrentMonth_amount
      FROM cri_completions WHERE [repairId] IS NOT NULL GROUP BY [repairId]
    ) completions ON completions.[repairId] = r.[id]
    LEFT JOIN (SELECT repairId, COUNT(repairId) worker FROM cri_repairs_supply_workers GROUP BY repairId) sw ON sw.repairId = r.id
    INNER JOIN cri_divisions divisions ON divisions.depcode = r.depcode
    WHERE r.active = 1 AND workWayId = 2 ${getAll} AND rYear = ${year}
    ORDER BY divisions.orderby`,
        {
          type: QueryTypes.SELECT,
        }
  );

  const repair2 = await req.db.sequelize.query(
    `SELECT r.[createdUser], r.[rYear], r.[id], r.[fav], r.[archive], r.[depcode], r.[name], r.[nameRu], r.[workWayId], r.[activityId], r.[userId], r.[sectionCode],
      ISNULL((SELECT STRING_AGG(nameShortMn, ',') FROM cri_divisions WHERE id IN (SELECT divisionId FROM cri_repairs_divisions WHERE repairId = r.id)),'') AS divs,
      ISNULL((SELECT STRING_AGG(label,',') FROM cri_clients WHERE id IN (SELECT clientId FROM cri_repairs_clients WHERE repairId = r.id)),'') AS clients,
      ISNULL(sw.worker, 0) AS worker, ISNULL(CONCAT(u.lastname, ' ', u.firstName),'-') [owner], ISNULL(completions.budget_amount, 0) totalBudget, ISNULL(p.c1_plan, 0) AS c1_plan,
      ISNULL(p.plan1, 0) AS plan1, ISNULL(p.plan2, 0) AS plan2, ISNULL(p.plan3, 0) AS plan3, ISNULL(p.plan4, 0) AS plan4, prog.statusId, ISNULL(completions.comp_amount, 0) AS comp_amounts,
      divisions.[nameShortMn] AS depname,(SELECT id FROM cri_benefits WHERE repairId = r.id) AS benefit,
      CASE WHEN prog.statusId = 17 THEN ISNULL(completions.comp_amount, 0) ELSE 0 END AS close_amounts,prog.comment,
      ISNULL(completions.compPrevMonth_amount,0) completionsPrevMonth,ISNULL(completions.compCurrentMonth_amount,0) completionsCurrentMonth, 0 as compPrevYears, ISNULL(j.c1_coss,0) AS c1_coss, ISNULL(j.debet,0) AS debet
    FROM cri_repairs r
    LEFT JOIN (
      SELECT r.id, SUM(ISNULL(c1_coss, 0)) AS c1_coss, SUM(ISNULL(debet, 0)) AS debet
      FROM cri_repairs r
      LEFT JOIN (
        SELECT SUM(ISNULL(debet, 0)) AS c1_coss, depcode, code FROM fas_coss_2024.logcoss.dns_list
        WHERE active = 'Y' AND smonth = 1 AND depcode != 120611 AND (ACCOUNT LIKE '6%' OR ACCOUNT LIKE '14-03%')
        GROUP BY depcode, code
      ) d ON r.sectionCode = d.code AND r.depcode = d.depcode
    INNER JOIN (
        SELECT SUM(ISNULL(a.[debet],0))-SUM(ISNULL(b.[debet],0)) AS [debet],a.[depcode],a.[CODE]
        FROM (
          SELECT SUM(debet) AS debet, depcode, code FROM fas_coss_${year}.logcoss.jrn_list
          WHERE active = 'Y' AND depcode != 120611 AND Attr != '0999' AND (ACCOUNT LIKE '6%' OR ACCOUNT LIKE '14-03%')
            AND [routeid] NOT IN (SELECT [routeid] FROM fas_coss_${year}.logcoss.jrn_list WHERE [active] = 'Y' AND RTRIM([ACCOUNT]) = '31-11-01-00' AND [CODE] = '00102' AND [CREDIT] > 0)
          GROUP BY depcode, code
        ) a
        LEFT JOIN (
          SELECT SUM(CREDIT) AS debet, depcode, code FROM fas_coss_${year}.logcoss.jrn_list
          WHERE active = 'Y' AND depcode != 120611 AND Attr != '0999' AND (ACCOUNT LIKE '6%' OR ACCOUNT LIKE '14-03%')
            AND [routeid] NOT IN (SELECT [routeid] FROM fas_coss_${year}.logcoss.jrn_list WHERE [active] = 'Y' AND (ACCOUNT LIKE '12-11%' OR ACCOUNT LIKE '14-05%') AND [DEBET] > 0)
          GROUP BY depcode, code
        ) b ON a.[depcode] = b.[depcode] AND a.[CODE] = b.[CODE]
        GROUP BY a.[depcode],a.[CODE]
        ) j ON r.sectionCode = j.code AND r.depcode = j.depcode
        WHERE r.active = 1 AND workWayId != 2 AND rYear = ${year}
        GROUP BY id
    ) j ON j.id = r.id
    LEFT JOIN cri_users u ON u.id = r.userId
    LEFT JOIN (
      SELECT repairId, ISNULL(SUM(CASE WHEN planYear < ${year} THEN ISNULL(plan1, 0) + ISNULL(plan2, 0) + ISNULL(plan3, 0) + ISNULL(plan4, 0) END), 0) AS c1_plan,
        ISNULL(SUM(CASE WHEN planYear = ${year} THEN plan1 END), 0) AS plan1, ISNULL(SUM(CASE WHEN planYear = ${year} THEN plan2 END), 0) AS plan2,
        ISNULL(SUM(CASE WHEN planYear = ${year} THEN plan3 END), 0) AS plan3, ISNULL(SUM(CASE WHEN planYear = ${year} THEN plan4 END), 0) AS plan4
      FROM cri_plans WHERE repairId IS NOT NULL GROUP BY repairId
    ) p ON p.repairId = r.id
    LEFT JOIN (SELECT statusId, repairId,comment FROM (SELECT ROW_NUMBER() OVER(PARTITION BY repairId ORDER BY createdAt DESC) as RN, statusId, repairId,comment FROM cri_progresses WHERE active = 1 AND repairId IS NOT NULL) pp WHERE RN = 1) prog ON prog.repairId  = r.id
        LEFT JOIN (
        SELECT [repairId], 
                SUM(CASE WHEN [month] > 0 THEN ISNULL([amount],0) ELSE 0 END) AS [comp_amount],
                SUM(CASE WHEN [month] = 0 AND [year] = 0 THEN ISNULL([amount],0) ELSE 0 END) AS [budget_amount],
                SUM(CASE WHEN [month] < ${month} AND [year] = ${year} THEN ISNULL([amount],0) ELSE 0 END) AS compPrevMonth_amount,
                SUM(CASE WHEN [month] = ${month} AND [year] = ${year} THEN ISNULL([amount],0) ELSE 0 END) AS compCurrentMonth_amount
        FROM cri_completions WHERE [repairId] IS NOT NULL GROUP BY [repairId]) completions ON completions.[repairId] = r.[id]
    LEFT JOIN (SELECT repairId, COUNT(repairId) worker FROM cri_repairs_supply_workers GROUP BY repairId) sw ON sw.repairId = r.id
    INNER JOIN cri_divisions divisions ON divisions.depcode = r.depcode
    WHERE r.active = 1 AND workWayId != 2 ${getAll} AND rYear = ${year}
    ORDER BY divisions.orderby`,
    {
      type: QueryTypes.SELECT,
    }
  );

  res.status(200).json({
    success: true,
    data: [...repair1, ...repair2],
  });
});

exports.getRepair = asyncHandler(async (req, res, next) => {
  if (!req.params.id) {
    throw new MyError(`Их засварын дугаараа оруулна уу!`, 400);
  }

  let repair = await req.db.repair.findByPk(req.params.id, {
    include: [
      req.db.user,
      req.db.budget,
      req.db.client,
      req.db.division,
      req.db.repairAct,
      req.db.completion,
      { model: req.db.repairSupplyWorker, include: [req.db.user] },
      { model: req.db.plan, include: [req.db.planChange] },
      { model: req.db.progress, include: [req.db.user, req.db.status] },
      {
        model: req.db.repairKind,
        include: [
          {
            model: req.db.device,
            include: [{ model: req.db.sector, include: [req.db.category] }],
          },
        ],
      },
    ],
    order: [["performanceStart", "ASC"]],
  });

  if (!repair) {
    throw new MyError(`${req.params.id} дугаартай их засвар олдсонгүй!`, 400);
  }

  const division = await req.db.division.findOne({
    where: { depcode: repair.depcode },
  });

  res.status(200).json({
    success: true,
    data: repair,
    division,
  });
});

exports.createRepair = asyncHandler(async (req, res, next) => {
  req.body.createdUser = req.userId;
  req.body.sectionCode = await maxId.getMaxId(
    req.db.sequelize,
    req.body.rYear || new Date().getFullYear()
  );
  const nowDate = new Date().toISOString();
  const repair = await req.db.repair.create(req.body);
  const plan = {
    planYear: req.body.rYear,
    plan1: req.body.plan1,
    plan2: req.body.plan2,
    plan3: req.body.plan3,
    plan4: req.body.plan4,
    quantity: 0,
    active: 1,
    createdUser: req.body.createdUser,
    repairId: repair.id,
    buildingId: null,
  };
  await req.db.plan.create(plan);
  // section
  await req.db.section.sequelize.query(
    "INSERT INTO fas_coss.logcoss.id_section([id],[id_salbar],[name],[status],[cdate],[ccode],[active]) VALUES(?,?,?,?,?,?,?)",
    {
      type: QueryTypes.INSERT,
      replacements: [
        req.body.sectionCode,
        req.body.depcode,
        req.body.name,
        "A",
        nowDate,
        939,
        "Y",
      ],
    }
  );
  await req.db.section.sequelize.query(
    "INSERT INTO fas_coss.logcoss.id_section([id],[id_salbar],[name],[status],[cdate],[ccode],[active]) VALUES(?,?,?,?,?,?,?)",
    {
      type: QueryTypes.INSERT,
      replacements: [
        req.body.sectionCode,
        120611,
        req.body.name,
        "A",
        nowDate,
        939,
        "Y",
      ],
    }
  );
  if (req.body.workWayId === 2) {
    req.body.divisions?.forEach(async (division) => {
      const divisionData = await req.db.division.findByPk(division);
      await req.db.section.sequelize.query(
        "INSERT INTO fas_coss.logcoss.id_section([id],[id_salbar],[name],[status],[cdate],[ccode],[active]) VALUES(?,?,?,?,?,?,?)",
        {
          type: QueryTypes.INSERT,
          replacements: [
            req.body.sectionCode,
            divisionData.depcode,
            req.body.name,
            "A",
            nowDate,
            939,
            "Y",
          ],
        }
      );
    });
  }

  req.body.budgets?.map(async (budget) => {
    await repair.addBudget(
      await req.db.budget.create({ ...budget, createdUser: req.userId })
    );
  });

  req.body.completions?.map(async (completion) => {
    await repair.addCompletion(
      await req.db.completion.create({
        year: 0,
        month: 0,
        depcode: 0,
        row: completion.row,
        amount: completion.amount,
        createdUser: req.userId,
      })
    );
  });

  req.body.kinds?.map(async (kind) => {
    await repair.addDevice(await req.db.device.findByPk(kind.deviceId), {
      through: req.db.repairKind,
    });
  });

  req.body.divisions?.map(async (division) => {
    await repair.addDivision(await req.db.division.findByPk(division), {
      through: req.db.repairDivision,
    });
  });

  req.body.clients?.map(async (client) => {
    await repair.addClient(
      (await req.db.client.findOne({
        where: { value: client.value },
      })) ??
        (await req.db.client.create({
          ...client,
          active: true,
          createdUser: req.userId,
        }))
    );
  });

  res.status(200).json({
    success: true,
    data: repair,
  });
});

exports.updateRepair = asyncHandler(async (req, res, next) => {
  req.body.updatedUser = req.userId;

  let repair = await req.db.repair.findByPk(req.params.id);
  if (!repair) {
    throw new MyError(`${req.params.id} дугаартай их засвар олдсонгүй!`, 400);
  }

  req.body.clients &&
    (await req.db.repairClient.destroy({ where: { repairId: repair.id } }));
  req.body.clients?.map(async (client) => {
    await repair.addClient(
      (await req.db.client.findOne({
        where: { value: client.value },
      })) ??
        (await req.db.client.create({
          ...client,
          active: true,
          createdUser: req.userId,
        }))
    );
  });

  req.body.budgets &&
    (await req.db.budget.destroy({ where: { repairId: repair.id } }));
  req.body.budgets?.map(async (budget) => {
    await repair.addBudget(
      await req.db.budget.create({ ...budget, createdUser: req.userId })
    );
  });

  req.body.completions &&
    (await req.db.completion.destroy({
      where: { repairId: repair.id, year: 0 },
    }));
  req.body.completions?.map(async (completion) => {
    await repair.addCompletion(
      await req.db.completion.create({
        year: 0,
        month: 0,
        depcode: 0,
        row: completion.row,
        amount: completion.amount,
        createdUser: req.userId,
      })
    );
  });

  req.body.kinds &&
    (await req.db.repairKind.destroy({ where: { repairId: repair.id } }));
  req.body.kinds?.map(async (kind) => {
    await repair.addDevice(await req.db.device.findByPk(kind.deviceId), {
      through: req.db.repairKind,
    });
  });

  req.body.divisions &&
    (await req.db.repairDivision.destroy({ where: { repairId: repair.id } }));
  req.body.divisions?.map(async (division) => {
    await repair.addDivision(await req.db.division.findByPk(division), {
      through: req.db.repairDivision,
    });
  });

  repair = await repair.update(req.body);

  res.status(200).json({
    success: true,
    data: repair,
  });
});

exports.deleteRepair = asyncHandler(async (req, res, next) => {
  let repair = await req.db.repair.findByPk(req.params.id);

  if (!repair) {
    throw new MyError(`${req.params.id} дугаартай их засвар олдсонгүй!`, 400);
  }

  repair = await repair.update({
    active: false,
  });

  res.status(200).json({
    success: true,
    data: repair,
    updatedUser: req.userId,
  });
});

exports.supplyWorker = asyncHandler(async (req, res, next) => {
  let repair = await req.db.repair.findByPk(req.params.id);

  if (!repair) {
    throw new MyError(`${req.params.id} дугаартай их засвар олдсонгүй!`, 400);
  }

  if (!req.body.workers) {
    throw new MyError(`Ажилтанаа сонгоно уу!`, 400);
  }

  await req.db.repairSupplyWorker.destroy({
    where: { repairId: repair.id },
  });
  req.body.workers?.map(async (worker) => {
    await req.db.repairSupplyWorker.create({
      userId: worker,
      repairId: repair.id,
    });
  });

  res.status(200).json({
    success: true,
    data: repair,
  });
});

exports.addToFavorite = asyncHandler(async (req, res, next) => {
  let repair = await req.db.repair.findByPk(req.params.id);

  if (!repair) {
    throw new MyError(`${req.params.id} дугаартай их засвар олдсонгүй!`, 400);
  }

  const fav = !repair.fav;

  repair = await repair.update({ fav: fav });

  res.status(200).json({
    success: true,
    data: repair,
  });
});
