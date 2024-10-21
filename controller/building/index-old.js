const asyncHandler = require("express-async-handler");
const MyError = require("../../utils/myError");
const maxId = require("../../services/criService");
const { QueryTypes } = require("sequelize");

exports.getBuildings = asyncHandler(async (req, res, next) => {
  const getAll = req.query.getAll ? ` AND r.[depcode] IN (${req.query.depcodes})` : ` AND r.[userId] = ${req.userId}`;
  const nowYear = new Date().getFullYear();
  const year = req.query.year ?? nowYear;
  const month = parseInt(year) === nowYear ?  new Date().getMonth() + 1 : parseInt(year) > nowYear ? 1 : 12;
  const buildings = await req.db.sequelize.query(
    `SELECT r.[createdUser], r.[rYear], r.[id], r.[fav], r.[archive], r.[depcode], r.[name], r.[nameRu], r.[workWayId], r.[userId],
    ISNULL((SELECT STRING_AGG(nameShortMn, ',') FROM cri_divisions WHERE id IN (SELECT divisionId FROM cri_buildings_divisions WHERE buildingId = r.id)),'') AS divs,
    ISNULL((SELECT STRING_AGG(label,',') FROM cri_clients WHERE id IN (SELECT clientId FROM cri_buildings_clients WHERE buildingId = r.id)),'') AS clients, 
    ISNULL(sw.worker, 0) AS worker, ISNULL(CONCAT(u.lastname, ' ', u.firstName),'-') [owner], ISNULL(budget.amount, 0) totalBudget, ISNULL(p.c1_plan, 0) AS c1_plan,
      ISNULL(p.plan1, 0) AS plan1, ISNULL(p.plan2, 0) AS plan2, ISNULL(p.plan3, 0) AS plan3, ISNULL(p.plan4, 0) AS plan4, 
      ISNULL(j.c1_coss, 0) AS c1_coss, ISNULL(j.debet, 0) AS debet, prog.statusId, ISNULL(comp.amount, 0) AS comp_amounts,
      (SELECT nameShortMn FROM cri_divisions WHERE depcode = r.depcode) AS depname,
      (SELECT id FROM cri_benefits WHERE buildingId = r.id) AS benefit,
      CASE WHEN prog.statusId = 17 THEN ISNULL(comp.amount, 0) ELSE 0 END AS close_amounts,prog.[comment],
      ISNULL(compPrevMonth.amount,0) AS completionsPrevMonth,ISNULL(compCurrentMonth.amount,0) AS completionsCurrentMonth,ISNULL(compPrevYears.amount,0) AS compPrevYears
  FROM cri_buildings r
  LEFT JOIN (
    SELECT SUM(c1_coss) AS c1_coss,SUM(debet) AS debet, depcode, CODE
      FROM (
      SELECT ISNULL(DEBET, 0) AS c1_coss, 0 AS debet, depcode, Code FROM fas_coss_${year}.logcoss.dns_list WHERE active = 'Y' AND RTRIM(ACCOUNT) = '20-04-01-00' AND smonth = 1
       UNION ALL
          SELECT 0 AS c1_coss, ISNULL(DEBET, 0) AS debet, depcode, Code FROM fas_coss_${year}.logcoss.jrn_list WHERE active = 'Y' AND RTRIM(ACCOUNT) = '20-04-01-00' AND DEBET > 0
      UNION ALL
      SELECT 0 AS c1_coss, ISNULL(CREDIT, 0) * -1 AS debet, depcode, Code FROM fas_coss_${year}.logcoss.jrn_list WHERE active = 'Y' AND LEFT(ATTR, 1) = '0' AND Attr <> '0999' AND RTRIM(ACCOUNT) = '20-04-01-00' AND CREDIT > 0 AND routeid NOT IN (
        SELECT routeid FROM fas_coss_${year}.logcoss.jrn_list WHERE active = 'Y' AND RTRIM(ACCOUNT) = '12-11-01-00' AND DEBET > 0)
    ) c 
    GROUP BY depcode, CODE
  ) j 
  ON j.depcode = r.depcode AND j.CODE = r.sectionCode
  LEFT JOIN cri_users u ON u.id = r.userId
  LEFT JOIN (
    SELECT buildingId, ISNULL(SUM(CASE WHEN planYear < ${year} THEN ISNULL(plan1, 0) + ISNULL(plan2, 0) + ISNULL(plan3, 0) + ISNULL(plan4, 0) END), 0) AS c1_plan,
      ISNULL(SUM(CASE WHEN planYear = ${year} THEN plan1 END), 0) AS plan1, ISNULL(SUM(CASE WHEN planYear = ${year} THEN plan2 END), 0) AS plan2,
      ISNULL(SUM(CASE WHEN planYear = ${year} THEN plan3 END), 0) AS plan3, ISNULL(SUM(CASE WHEN planYear = ${year} THEN plan4 END), 0) AS plan4
    FROM cri_plans WHERE buildingId IS NOT NULL	GROUP BY buildingId
  ) p ON p.buildingId = r.id
  LEFT JOIN (SELECT statusId, buildingId,comment FROM (SELECT ROW_NUMBER() OVER(PARTITION BY buildingId ORDER BY createdAt DESC) as RN, statusId, buildingId,comment FROM cri_progresses WHERE active = 1 AND buildingId IS NOT NULL) pp WHERE RN = 1) prog ON prog.buildingId  = r.id
  LEFT JOIN (SELECT buildingId, SUM(ISNULL(amount, 0)) amount FROM cri_completions WHERE buildingId IS NOT NULL AND [month] > 0 GROUP BY buildingId) comp ON comp.buildingId = r.id
  LEFT JOIN (SELECT buildingId, SUM(ISNULL(amount, 0)) amount FROM cri_completions WHERE buildingId IS NOT NULL AND [month] = 0 AND [year] = 0 GROUP BY buildingId) budget ON budget.buildingId = r.id
  LEFT JOIN (SELECT buildingId, COUNT(buildingId) worker FROM cri_buildings_supply_workers GROUP BY buildingId) sw ON sw.buildingId = r.id
  LEFT JOIN (SELECT buildingId, SUM(ISNULL(amount, 0)) amount FROM cri_completions WHERE buildingId IS NOT NULL AND year = ${year} AND [month] > 0 AND [month] < ${month} GROUP BY buildingId) compPrevMonth ON compPrevMonth.buildingId = r.id
  LEFT JOIN (SELECT buildingId, SUM(ISNULL(amount, 0)) amount FROM cri_completions WHERE buildingId IS NOT NULL AND year = ${year} AND [month] = ${month} GROUP BY buildingId) compCurrentMonth ON compCurrentMonth.buildingId = r.id
  LEFT JOIN (SELECT buildingId, SUM(ISNULL(amount, 0)) amount FROM cri_completions WHERE buildingId IS NOT NULL AND year < ${year} AND [year] > 0 AND [month] > 0 GROUP BY buildingId) compPrevYears ON compPrevYears.buildingId = r.id
  INNER JOIN cri_divisions divisions ON divisions.depcode = r.depcode
  WHERE r.active = 1 ${getAll} AND (rYear = ${year} OR (r.id IN (
    SELECT buildingId 
    FROM (SELECT ROW_NUMBER() OVER(PARTITION BY buildingId ORDER BY createdAt DESC) RN, buildingId, statusId FROM cri_progresses WHERE buildingId IS NOT NULL AND active = 1 ) a 
    WHERE RN = 1 AND statusId <> 17) 
    AND rYear < ${year}))
  ORDER BY divisions.orderby`,
    {
      type: QueryTypes.SELECT,
    }
  );

  res.status(200).json({
    success: true,
    data: buildings,
  });
});

exports.getBuilding = asyncHandler(async (req, res, next) => {
  if (!req.params.id) {
    throw new MyError(`Их барилгын дугаараа оруулна уу!`, 400);
  }

  let building = await req.db.building.findByPk(req.params.id, {
    include: [
      req.db.user,
      req.db.budget,
      req.db.client,
      req.db.division,
      req.db.buildingAct,
      req.db.completion,
      req.db.buildingResearch,
      { model: req.db.buildingSupplyWorker, include: [req.db.user] },
      { model: req.db.plan, include: [req.db.planChange] },
      { model: req.db.progress, include: [req.db.user, req.db.status] },
      {
        model: req.db.buildingKind,
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

  const division = await req.db.division.findOne({
    where: { depcode: building.depcode },
  });

  if (!building) {
    throw new MyError(`${req.params.id} дугаартай их барилга олдсонгүй!`, 400);
  }

  res.status(200).json({
    success: true,
    data: building,
    division,
  });
});

exports.createBuilding = asyncHandler(async (req, res, next) => {
  req.body.createdUser = req.userId;
  req.body.sectionCode = await maxId.getMaxId(
    req.db.sequelize,
    req.body.rYear || new Date().getFullYear()
  );
  const nowDate = new Date().toISOString();
  const building = await req.db.building.create(req.body);
  const plan = {
    planYear: req.body.rYear,
    plan1: req.body.plan1,
    plan2: req.body.plan2,
    plan3: req.body.plan3,
    plan4: req.body.plan4,
    quantity:0,
    active:1,
    createdUser: req.body.createdUser,
    buildingId: building.id,
    repairId:null
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
  //  if (req.body.workWayId === 1 || req.body.workWayId === 3) {
  //   await req.db.section.sequelize.query(
  //     "INSERT INTO fas_coss.logcoss.id_section([id],[id_salbar],[name],[status],[cdate],[ccode],[active]) VALUES(?,?,?,?,?,?,?)",
  //     {
  //       type: QueryTypes.INSERT,
  //       replacements: [
  //         req.body.sectionCode,
  //         req.body.depcode,
  //         req.body.name,
  //         "A",
  //         nowDate,
  //         939,
  //         "Y",
  //       ],
  //     }
  //   );
  // }
  if (req.body.workWayId === 2) {
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
    await building.addBudget(
      await req.db.budget.create({ ...budget, createdUser: req.userId })
    );
  });

  req.body.completions?.map(async (completion) => {
    await building.addCompletion(
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
    await building.addDevice(await req.db.device.findByPk(kind.deviceId), {
      through: req.db.buildingKind,
    });
  });

  req.body.divisions?.map(async (division) => {
    await building.addDivision(await req.db.division.findByPk(division), {
      through: req.db.buildingDivision,
    });
  });

  req.body.clients?.map(async (client) => {
    await building.addClient(
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
    data: building,
  });
});

exports.updateBuilding = asyncHandler(async (req, res, next) => {
  req.body.updatedUser = req.userId;

  let building = await req.db.building.findByPk(req.params.id);
  if (!building) {
    throw new MyError(`${req.params.id} дугаартай их барилга олдсонгүй!`, 400);
  }

  req.body.clients &&
    (await req.db.buildingClient.destroy({
      where: { buildingId: building.id },
    }));
  req.body.clients?.map(async (client) => {
    await building.addClient(
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
    (await req.db.budget.destroy({ where: { buildingId: building.id } }));
  req.body.budgets?.map(async (budget) => {
    await building.addBudget(
      await req.db.budget.create({ ...budget, createdUser: req.userId })
    );
  });

  req.body.completions &&
    (await req.db.completion.destroy({
      where: { buildingId: building.id, year: 0 },
    }));
  req.body.completions?.map(async (completion) => {
    await building.addCompletion(
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
    (await req.db.buildingKind.destroy({ where: { buildingId: building.id } }));
  req.body.kinds?.map(async (kind) => {
    await building.addDevice(await req.db.device.findByPk(kind.deviceId), {
      through: req.db.buildingKind,
    });
  });

  req.body.divisions &&
    (await req.db.buildingDivision.destroy({
      where: { buildingId: building.id },
    }));
  req.body.divisions?.map(async (division) => {
    await building.addDivision(await req.db.division.findByPk(division), {
      through: req.db.buildingDivision,
    });
  });

  building = await building.update(req.body);

  res.status(200).json({
    success: true,
    data: building,
  });
});

exports.addResearchBuilding = asyncHandler(async (req, res, next) => {
  let building = await req.db.building.findByPk(req.params.id);

  if (!building) {
    throw new MyError(`${req.params.id} дугаартай их барилга олдсонгүй!`, 400);
  }

  req.body.researches &&
    (await req.db.buildingResearch.destroy({
      where: { buildingId: building.id },
    }));
  req.body.researches?.map(async (research) => {
    await building.addResearch(
      await req.db.research.findByPk(research.researchId),
      {
        through: { conclusionDate: research.conclusionDate },
      }
    );
  });

  res.status(200).json({
    success: true,
    data: building,
    updatedUser: req.userId,
  });
});

exports.deleteBuilding = asyncHandler(async (req, res, next) => {
  let building = await req.db.building.findByPk(req.params.id);

  if (!building) {
    throw new MyError(`${req.params.id} дугаартай их барилга олдсонгүй!`, 400);
  }

  building = await building.update({
    active: false,
  });

  res.status(200).json({
    success: true,
    data: building,
    updatedUser: req.userId,
  });
});

exports.supplyWorker = asyncHandler(async (req, res, next) => {
  let building = await req.db.building.findByPk(req.params.id);

  if (!building) {
    throw new MyError(`${req.params.id} дугаартай их барилга олдсонгүй!`, 400);
  }

  if (!req.body.workers) {
    throw new MyError(`Ажилтанаа сонгоно уу!`, 400);
  }

  await req.db.buildingSupplyWorker.destroy({
    where: { buildingId: building.id },
  });
  req.body.workers?.map(async (worker) => {
    await req.db.buildingSupplyWorker.create({
      userId: worker,
      buildingId: building.id,
    });
  });

  res.status(200).json({
    success: true,
    data: building,
  });
});

exports.addToFavorite = asyncHandler(async (req, res, next) => {
  let building = await req.db.building.findByPk(req.params.id);

  if (!building) {
    throw new MyError(`${req.params.id} дугаартай их барилга олдсонгүй!`, 400);
  }

  const fav = !building.fav;

  building = await building.update({ fav: fav });

  res.status(200).json({
    success: true,
    data: building,
  });
});