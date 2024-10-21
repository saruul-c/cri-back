const asyncHandler = require("express-async-handler");
const { QueryTypes } = require("sequelize");

exports.getCommons = asyncHandler(async (req, res, next) => {
  const activities = await req.db.activity.findAll({
    where: { active: 1 },
  });

  const researches = await req.db.research.findAll({
    where: { active: 1 },
  });

  const workWays = await req.db.workWay.findAll({
    where: { active: 1 },
  });

  const measurements = await req.db.measurement.findAll({
    where: { active: 1 },
  });

  const divisions = await req.db.division.findAll({
    where: { active: 1 },
  });

  const supplyOptions = await req.db.supplyOption.findAll({
    where: { active: 1 },
  });

  const assetTypes = await req.db.assetType.findAll();

  const status = await req.db.status.findAll();

  const rule1 = await req.db.sequelize.query(
    "SELECT [id], [no], [name] FROM fas_material.logmaterial.Rule1 WHERE [active] = 1 AND [status] = 1 ORDER BY [no]",
    { type: QueryTypes.SELECT }
  );

  res.status(200).json({
    supplyOptions,
    measurements,
    activities,
    researches,
    assetTypes,
    divisions,
    workWays,
    status,
    rule1,
  });
});
