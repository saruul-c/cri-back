const asyncHandler = require("express-async-handler");
const MyError = require("../utils/myError");

exports.getDevices = asyncHandler(async (req, res, next) => {
  const devices = await req.db.device.findAll({
    where: { sectorId: req.params.id },
  });

  res.status(200).json({
    success: true,
    data: devices,
  });
});

exports.createDevice = asyncHandler(async (req, res, next) => {
  req.body.createdUser = req.userId;
  req.body.sectorId = req.params.id;

  const sector = await req.db.sector.findByPk(req.params.id);
  if (!sector) {
    throw new MyError(`${req.params.id} дугаартай хэсэг олдсонгүй!`, 400);
  }

  const device = await req.db.device.create(req.body);
  res.status(200).json({
    success: true,
    data: device,
  });
});

exports.updateDevice = asyncHandler(async (req, res, next) => {
  req.body.updatedUser = req.userId;
  req.body.id = req.params.id;

  let device = await req.db.device.findByPk(req.body.id);
  if (!device) {
    throw new MyError(`${req.body.id} дугаартай обьект олдсонгүй!`, 400);
  }

  device = await device.update(req.body);

  res.status(200).json({
    success: true,
    data: device,
  });
});

exports.deleteDevice = asyncHandler(async (req, res, next) => {
  let device = await req.db.device.findByPk(req.params.id);
  if (!device) {
    throw new MyError(`${req.params.id} дугаартай обьект олдсонгүй!`, 400);
  }

  const repairKind = await req.db.repairKind.findAll({
    where: { deviceId: req.params.id },
  });
  if (repairKind.length > 0) {
    throw new MyError(
      `${req.params.id} дугаартай обьектыг устгах боломжгүй!`,
      400
    );
  }

  const buildingKind = await req.db.buildingKind.findAll({
    where: { deviceId: req.params.id },
  });
  if (buildingKind.length > 0) {
    throw new MyError(
      `${req.params.id} дугаартай обьектыг устгах боломжгүй!`,
      400
    );
  }

  device = await device.destroy({
    where: {
      id: req.params.id,
    },
  });

  res.status(200).json({
    success: true,
    data: device,
  });
});
