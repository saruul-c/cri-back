const asyncHandler = require("express-async-handler");
const { QueryTypes } = require("sequelize");
const MyError = require("../utils/myError");

exports.getSumInvestment = asyncHandler(async (req, res, next) => {
  const year = req.query.year || new Date().getFullYear();
  const depcode = req.query.depcode;
  const investments = await req.db.sequelize.query(
    `SELECT d.[id], [nameShortMn] AS [depname], ISNULL([year], ${year}) AS [year], ISNULL(SUM([price]), 0) AS [price], 
    ISNULL(SUM([season1]), 0) AS [season1], ISNULL(SUM([season2]), 0) AS [season2], ISNULL(SUM([season3]), 0) AS [season3], ISNULL(SUM([season4]), 0) AS [season4],
    CAST(ISNULL(SUM([status3]), 0) / (CASE WHEN ISNULL(SUM([status1] + [status2] + [status3]), 0) = 0 THEN 0.01 ELSE ISNULL(SUM([status1] + [status2] + [status3]), 0) END) * 100 AS INTEGER) AS [percent]
  FROM (
    SELECT [id], [depcode], [nameShortMn] FROM cri_divisions WHERE [active] = 1 AND [depcode] IN (${depcode}) AND LEFT([depcode],4) <> 1206
  ) d
  LEFT JOIN (
    SELECT [id], [divisionId], [year] FROM cri_investments WHERE [active] = 1 AND [year] = ${year} 
  ) i 
  ON d.[id] = i.[divisionId]
  LEFT JOIN (
    SELECT i.[investmentId], i.[season1], i.[season2], i.[season3], i.[season4], p.[status1], p.[status2], p.[status3], pr.[price] FROM (
      SELECT [investmentId], ISNULL([1], 0) AS [season1], ISNULL([2], 0) AS [season2], ISNULL([3], 0) AS [season3], ISNULL([4], 0) AS [season4]
      FROM ( SELECT [investmentId], [season], [cost] FROM cri_investment_plans WHERE [active] = 1) AS i
      PIVOT ( SUM([cost]) FOR season IN ([1], [2], [3], [4]) ) AS i 
    ) AS i
      LEFT JOIN (
      SELECT [investmentId], ISNULL([1], 0) AS [status1], ISNULL([2], 0) AS [status2], ISNULL([3], 0) AS [status3]
      FROM ( SELECT [investmentId], [status], [divQuantity] AS [quantity] FROM cri_investment_plans WHERE [active] = 1) AS p
      PIVOT ( SUM([quantity]) FOR [status] IN ([1], [2], [3]) ) AS p 
    ) AS p
    ON i.investmentId = p.investmentId
    LEFT JOIN (
      SELECT investmentId, SUM(price) AS price FROM cri_investment_plans WHERE [active] = 1 AND [status] = 3 GROUP BY investmentId
    ) AS pr
    ON i.investmentId = pr.investmentId
  ) p 
  ON i.[id] = p.[investmentId]
  GROUP BY d.[id], [year], [divisionId], [depcode], [nameShortMn]
  ORDER BY RIGHT(LEFT([depcode], 4), 2), RIGHT([depcode], 2), LEFT([depcode], 2)`,
    {
      type: QueryTypes.SELECT,
    }
  );

  res.status(200).json({
    success: true,
    data: investments,
  });
});

exports.getInvestment = asyncHandler(async (req, res, next) => {
  const investment = await req.db.investment.findByPk(req.params.id, {
    include: [
      req.db.division,
      {
        model: req.db.investmentPlan,
        include: [
          req.db.measurement,
          // req.db.benefit,
          req.db.client,
          req.db.assetType,
          req.db.investmentPlanChange,
        ],
      },
    ],
  });

  res.status(200).json({
    success: true,
    data: investment,
  });
});

exports.getInvestmentFavs = asyncHandler(async (req, res, next) => {
  const year = req.params.year || new Date().getFullYear();
  const investment = await req.db.investment.findAll({
    where: { year: year, fav: true },
    include: [
      { model: req.db.investmentPlan, where: { active: true } },
      { model: req.db.benefit },
    ],
  });

  res.status(200).json({
    success: true,
    data: investment,
  });
});

exports.getInvestments = asyncHandler(async (req, res, next) => {
  const investments = await req.db.investment.findAll({
    where: {
      active: 1,
      year: req.params.year,
      divisionId: req.params.division,
    },
    include: [
      req.db.division,
      {
        model: req.db.investmentPlan,
        include: [
          req.db.measurement,
          req.db.client,
          req.db.assetType,
          req.db.investmentPlanChange,
        ],
      },
    ],
  });

  res.status(200).json({
    success: true,
    data: investments,
  });
});

exports.createInvestment = asyncHandler(async (req, res, next) => {
  req.body.createdUser = req.userId;
  const investment = await req.db.investment.create(req.body);

  req.body.plans?.map(async (plan) => {
    await req.db.investmentPlan.create({
      ...plan,
      createdUser: req.userId,
      investmentId: investment.id,
    });
  });

  res.status(200).json({
    success: true,
    data: investment,
  });
});

exports.updateInvestment = asyncHandler(async (req, res, next) => {
  req.body.updatedUser = req.userId;

  console.log("body:", req.body);

  let investment = await req.db.investment.findByPk(req.params.id);

  if (!investment) {
    throw new MyError(
      `${req.params.id} гэсэн дугаартай хөрөнгө оруулалт олдсонгүй!`,
      400
    );
  }

  req.body.plans?.map(async (plan) => {
    if (plan.workWayId == 2) {
      await req.db.investmentPlan.update(
        {
          clientId: null,
          price: plan.price,
          workWayId: plan.workWayId,
          divisionId: plan.divisionId,
          divQuantity: plan.divQuantity,
          updatedUser: req.userId,
          status: 2,
        },
        {
          where: {
            id: plan.id,
          },
        }
      );
    } else {
      const client =
        (await req.db.client.findOne({
          where: { value: plan.client.value },
        })) ??
        (await req.db.client.create({
          ...plan.client,
          active: true,
          createdUser: req.userId,
        }));

      await req.db.investmentPlan.update(
        {
          divisionId: null,
          price: plan.price,
          clientId: client.id,
          workWayId: plan.workWayId,
          divQuantity: plan.divQuantity,
          updatedUser: req.userId,
          status: 2,
        },
        {
          where: {
            id: plan.id,
          },
        }
      );
    }
  });

  res.status(200).json({
    success: true,
  });
});

exports.deleteInvestment = asyncHandler(async (req, res, next) => {
  let investment = await req.db.investment.findByPk(req.params.id);

  if (!investment) {
    throw new MyError(
      `${req.params.id} гэсэн дугаартай хөрөнгө оруулалт олдсонгүй!`,
      400
    );
  }

  investment = await investment.update({
    active: false,
    updatedUser: req.userId,
  });

  res.status(200).json({
    success: true,
    data: investment,
  });
});

exports.supplyWorker = asyncHandler(async (req, res, next) => {
  const investment = await req.db.investment.findByPk(req.params.id);

  if (!investment) {
    throw new MyError(
      `${req.params.id} дугаартай хөрөнгө оруулалт олдсонгүй!`,
      400
    );
  }

  if (!req.body.workers) {
    throw new MyError(`Ажилтанаа сонгоно уу!`, 400);
  }

  await req.db.investmentSupplyWorker.destroy({
    where: { investmentId: investment.id },
  });
  req.body.workers?.map(async (worker) => {
    await req.db.investmentSupplyWorker.create({
      userId: worker,
      investmentId: investment.id,
    });
  });

  res.status(200).json({
    success: true,
    data: investment,
  });
});

exports.applyInvestment = asyncHandler(async (req, res, next) => {
  let investmentPlan = await req.db.investmentPlan.findByPk(req.params.id);

  if (!investmentPlan) {
    throw new MyError(
      `${req.params.id} гэсэн дугаартай хөрөнгө оруулалт олдсонгүй!`,
      400
    );
  }

  investmentPlan = await investmentPlan.update({
    status: 3,
    updatedUser: req.userId,
  });

  res.status(200).json({
    success: true,
    data: investmentPlan,
  });
});

exports.insertInvestmentPlan = asyncHandler(async (req, res, next) => {
  const investmentPlan = await req.db.investmentPlan.create({
    name: req.body.name,
    cost: req.body.cost,
    season: req.body.season,
    nnQuantity: req.body.quantity,
    createdUser: req.userId,
    investmentId: req.params.id,
    assetTypeId: req.body.assetTypeId,
    measurementId: req.body.measurementId,
    status: 1,
  });

  const investmentPlanChange = await req.db.investmentPlanChange.create({
    cost: 0,
    season: 1,
    quantity: 0,
    comment: req.body.comment,
    investmentPlanId: investmentPlan.id,
    createdUser: req.userId,
  });

  res.status(200).json({
    success: true,
    data: investmentPlan,
    investmentPlanChange,
  });
});

exports.updateInvestmentPlan = asyncHandler(async (req, res, next) => {
  let investmentPlan = await req.db.investmentPlan.findByPk(req.params.id);

  if (!investmentPlan) {
    throw new MyError(
      `${req.params.id} гэсэн дугаартай хөрөнгө оруулалтын төлөвлөгөө олдсонгүй!`,
      400
    );
  }

  const investmentPlanChange = await req.db.investmentPlanChange.create({
    cost: investmentPlan.cost,
    season: investmentPlan.season,
    quantity: investmentPlan.nnQuantity,
    comment: req.body.comment,
    investmentPlanId: investmentPlan.id,
    createdUser: req.userId,
  });

  await investmentPlan.update(
    {
      clientId: null,
      workWayId: null,
      divisionId: null,
      cost: req.body.cost,
      season: req.body.season,
      nnQuantity: req.body.quantity,
      updatedUser: req.userId,
      status: 1,
    },
    {
      where: {
        id: req.params.id,
      },
    }
  );

  res.status(200).json({
    success: true,
    data: investmentPlan,
    investmentPlanChange,
  });
});

exports.deleteInvestmentPlan = asyncHandler(async (req, res, next) => {
  let investmentPlan = await req.db.investmentPlan.findByPk(req.params.id);

  if (!investmentPlan) {
    throw new MyError(
      `${req.params.id} гэсэн дугаартай хөрөнгө оруулалтын төлөвлөгөө олдсонгүй!`,
      400
    );
  }

  await investmentPlan.update({
    active: false,
    updatedUser: req.userId,
  });

  await req.db.investmentPlanChange.create({
    cost: investmentPlan.cost,
    season: investmentPlan.season,
    quantity: investmentPlan.nnQuantity,
    comment: req.body.comment,
    investmentPlanId: investmentPlan.id,
    createdUser: req.userId,
  });

  res.status(200).json({
    success: true,
    data: investmentPlan,
  });
});

exports.addToFavorite = asyncHandler(async (req, res, next) => {
  let investment = await req.db.investment.findByPk(req.params.id);

  if (!investment) {
    throw new MyError(
      `${req.params.id} дугаартай хөрөнгө оруулалт олдсонгүй!`,
      400
    );
  }

  const fav = !investment.fav;

  investment = await investment.update({ fav: fav });

  res.status(200).json({
    success: true,
    data: investment,
  });
});
