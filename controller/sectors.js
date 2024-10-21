const asyncHandler = require("express-async-handler");
const MyError = require("../utils/myError");

exports.getSectors = asyncHandler(async (req, res, next) => {
  const sectors = await req.db.sector.findAll({
    where: { categoryId: req.params.id },
  });

  res.status(200).json({
    success: true,
    data: sectors,
  });
});

exports.createSector = asyncHandler(async (req, res, next) => {
  req.body.createdUser = req.userId;
  req.body.categoryId = req.params.id;

  const category = await req.db.category.findByPk(req.params.id);
  if (!category) {
    throw new MyError(`${req.params.id} дугаартай бүлэг олдсонгүй!`, 400);
  }

  const sector = await req.db.sector.create(req.body);
  res.status(200).json({
    success: true,
    data: sector,
  });
});

exports.updateSector = asyncHandler(async (req, res, next) => {
  req.body.updatedUser = req.userId;
  req.body.id = req.params.id;

  let sector = await req.db.sector.findByPk(req.body.id);
  if (!sector) {
    throw new MyError(`${req.body.id} дугаартай ангилал олдсонгүй!`, 400);
  }

  sector = await sector.update(req.body);

  res.status(200).json({
    success: true,
    data: sector,
  });
});

exports.deleteSector = asyncHandler(async (req, res, next) => {
  let sector = await req.db.sector.findByPk(req.params.id);
  if (!sector) {
    throw new MyError(`${req.params.id} дугаартай бүлэг олдсонгүй!`, 400);
  }

  const device = await req.db.device.findAll({
    where: { sectorId: req.params.id },
  });
  if (device.length > 0) {
    throw new MyError(
      `${req.params.id} дугаартай ангилалыг устгах боломжгүй!`,
      400
    );
  }

  sector = await sector.destroy({
    where: {
      id: req.params.id,
    },
  });

  res.status(200).json({
    success: true,
    data: sector,
  });
});
