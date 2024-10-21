const asyncHandler = require("express-async-handler");
const MyError = require("../utils/myError");

exports.getMeasurements = asyncHandler(async (req, res, next) => {
  const measurements = await req.db.measurement.findAll({
    where: { active: 1 },
  });

  res.status(200).json({
    success: true,
    data: measurements,
  });
});

exports.createMeasurement = asyncHandler(async (req, res, next) => {
  req.body.createdUser = req.userId;
  const measurement = await req.db.measurement.create(req.body);
  res.status(200).json({
    success: true,
    data: measurement,
  });
});

exports.updateMeasurement = asyncHandler(async (req, res, next) => {
  req.body.updatedUser = req.userId;
  let measurement = await req.db.measurement.findByPk(req.params.id);

  if (!measurement) {
    throw new MyError(`${req.params.id} дугаартай хэмжих нэгж олдсонгүй!`, 400);
  }

  measurement = await measurement.update(req.body);

  res.status(200).json({
    success: true,
    data: measurement,
  });
});

exports.deleteMeasurement = asyncHandler(async (req, res, next) => {
  let measurement = await req.db.measurement.findByPk(req.params.id);

  if (!measurement) {
    throw new MyError(`${req.params.id} дугаартай хэмжих нэгж олдсонгүй!`, 400);
  }

  measurement = await measurement.update({
    active: false,
    updatedUser: req.userId,
  });

  res.status(200).json({
    success: true,
    data: measurement,
  });
});
