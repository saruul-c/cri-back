const asyncHandler = require("express-async-handler");
const MyError = require("../utils/myError");
const { QueryTypes } = require("sequelize");

exports.getAllSupplies = asyncHandler(async (req, res, next) => {
  const year = req.params.year || new Date().getFullYear();
  const user = req.params.user || req.userId;
  const getAll = req.query.getAll;
  console.log(getAll)
  const onlyUser = getAll === '1' ? '' : ` AND u.userId = ${user}`
  const supplies = await req.db.sequelize.query(
    `SELECT ROW_NUMBER() OVER(ORDER BY [type], [id] ASC) AS rn, [id], [depname], [type], [workWayMn], [workWayRu], [nameMn], [nameRu], [quantity], [plan1], [plan2], [plan3], [plan4] 
  FROM (
    SELECT r.id, (SELECT nameShortMn FROM cri_divisions WHERE depcode = r.depcode) AS depname, 'repair' AS [type],
      w.[nameMn] AS workWayMn, w.[nameRu] AS workWayRu, r.[name] AS nameMn, r.[nameRu], r.quantity, 
      ISNULL(plan1, 0) AS plan1, ISNULL(plan2, 0) AS plan2, ISNULL(plan3, 0) AS plan3, ISNULL(plan4, 0) AS plan4 
    FROM cri_repairs r 
    LEFT JOIN cri_repairs_supply_workers u ON r.id = u.repairId 
    LEFT JOIN cri_work_ways w ON r.workWayId = w.id 
    LEFT JOIN cri_plans p ON r.id = p.repairId AND r.rYear = p.planYear 
    WHERE r.active = 1 AND w.active = 1 AND rYear = ${year} AND u.userId = ${user}
    UNION ALL
    SELECT b.id, (SELECT nameShortMn FROM cri_divisions WHERE depcode = b.depcode) AS depname, 'building' AS [type],
      w.[nameMn] AS workWayMn, w.[nameRu] AS workWayRu, b.[name] AS nameMn, b.[nameRu], b.quantity, 
      ISNULL(plan1, 0) AS plan1, ISNULL(plan2, 0) AS plan2, ISNULL(plan3, 0) AS plan3, ISNULL(plan4, 0) AS plan4 
    FROM cri_buildings b 
    LEFT JOIN cri_buildings_supply_workers u ON b.id = u.buildingId 
    LEFT JOIN cri_work_ways w ON b.workWayId = w.id 
    LEFT JOIN cri_plans p ON b.id = p.repairId AND b.rYear = p.planYear 
    WHERE b.active = 1 AND w.active = 1 AND rYear = ${year} ${onlyUser}
  ) a
  `,
    {
      type: QueryTypes.SELECT,
    }
  );

  res.status(200).json({
    success: true,
    data: supplies,
  });
});

exports.getSupplies = asyncHandler(async (req, res, next) => {
  const type = req.query.type || 1;
  const id = req.query.id || 1;

  let supplies = null;
  if (type == 1) {
    supplies = await req.db.supply.findAll({
      include: [
        req.db.department,
        req.db.payment,
        req.db.delivery,
        { model: req.db.tender, include: [req.db.client] },
      ],
      where: { repairId: id },
    });
  } else if (type == 2) {
    supplies = await req.db.supply.findAll({
      include: [
        req.db.department,
        req.db.payment,
        req.db.delivery,
        { model: req.db.tender, include: [req.db.client] },
      ],
      where: { buildingId: id },
    });
  } else {
    supplies = await req.db.supply.findAll({
      include: [
        req.db.department,
        req.db.payment,
        req.db.delivery,
        { model: req.db.tender, include: [req.db.client] },
      ],
      where: { investmentId: id },
    });
  }

  res.status(200).json({
    success: true,
    data: supplies,
  });
});

exports.getSupply = asyncHandler(async (req, res, next) => {
  const supply = await req.db.supply.findByPk(req.params.id, {
    include: [
      req.db.department,
      req.db.payment,
      req.db.delivery,
      { model: req.db.tender, include: [req.db.client] },
    ],
  });

  res.status(200).json({
    success: true,
    data: supply,
  });
});

exports.createSupply = asyncHandler(async (req, res, next) => {
  req.body.createdUser = req.userId;

  const supply = await req.db.supply.create(req.body);

  req.body.payments?.map(async (payment) => {
    await supply.addPayment(await req.db.payment.create(payment));
  });

  req.body.deliveries?.map(async (delivery) => {
    await supply.addDelivery(await req.db.delivery.create(delivery));
  });

  req.body.tenders?.map(async (tender) => {
    let client = null;
    if (tender.client) {
      client =
        (await req.db.client.findOne({
          where: { value: tender.client.value },
        })) ??
        (await req.db.client.create({
          ...tender.client,
          active: true,
          createdUser: req.userId,
        }));
      tender.clientId = client.id;
    }

    await supply.addTender(
      await req.db.tender.create({ ...tender, createdUser: req.userId })
    );
  });

  res.status(200).json({
    success: true,
    data: supply,
  });
});

exports.updateSupply = asyncHandler(async (req, res, next) => {
  req.body.updatedUser = req.userId;

  let supply = await req.db.supply.findByPk(req.params.id);

  if (!supply) {
    throw new MyError(`${req.params.id} дугаартай хангамж олдсонгүй!`, 400);
  }

  supply = await supply.update(req.body);

  req.body.payments &&
    (await req.db.payment.destroy({ where: { supplyId: supply.id } }));
  req.body.payments?.map(async (payment) => {
    await supply.addPayment(await req.db.payment.create(payment));
  });

  req.body.deliveries &&
    (await req.db.delivery.destroy({ where: { supplyId: supply.id } }));
  req.body.deliveries?.map(async (delivery) => {
    await supply.addDelivery(await req.db.delivery.create(delivery));
  });

  req.body.tenders &&
    (await req.db.tender.destroy({ where: { supplyId: supply.id } }));
  req.body.tenders?.map(async (tender) => {
    let client = null;
    if (tender.client) {
      client =
        (await req.db.client.findOne({
          where: { value: tender.client.value },
        })) ??
        (await req.db.client.create({
          ...tender.client,
          active: true,
          createdUser: req.userId,
        }));
      tender.clientId = client.id;
    }

    await supply.addTender(
      await req.db.tender.create({ ...tender, createdUser: req.userId })
    );
  });

  res.status(200).json({
    success: true,
    data: supply,
  });
});

exports.deleteSupply = asyncHandler(async (req, res, next) => {
  let supply = await req.db.supply.findByPk(req.params.id);
  if (!supply) {
    throw new MyError(`${req.params.id} дугаартай хангамж олдсонгүй!`, 400);
  }

  await req.db.tender.destroy({ where: { supplyId: req.params.id } });

  supply = await supply.destroy({
    where: {
      id: req.params.id,
    },
  });

  res.status(200).json({
    success: true,
    data: supply,
  });
});
