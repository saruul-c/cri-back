const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const MyError = require("../utils/myError");

exports.getDivisions = asyncHandler(async (req, res, next) => {
  const divisions = await req.db.division.findAll({
    where: { active: 1 },
  });

  res.status(200).json({
    success: true,
    data: divisions,
  });
});

exports.createDivision = asyncHandler(async (req, res, next) => {
  req.body.createdUser = req.userId;
  const division = await req.db.division.create(req.body);
  res.status(200).json({
    success: true,
    data: division,
  });
});

exports.updateDivision = asyncHandler(async (req, res, next) => {
  req.body.updatedUser = req.userId;
  let division = await req.db.division.findByPk(req.params.id);

  if (!division) {
    throw new MyError(`${req.params.id} дугаартай салбар олдсонгүй!`, 400);
  }

  division = await division.update(req.body);

  res.status(200).json({
    success: true,
    data: division,
  });
});

exports.deleteDivision = asyncHandler(async (req, res, next) => {
  let division = await req.db.division.findByPk(req.params.id);

  if (!division) {
    throw new MyError(`${req.params.id} дугаартай салбар олдсонгүй!`, 400);
  }

  division = await division.update({
    active: false,
  });

  res.status(200).json({
    success: true,
    data: division,
    updatedUser: req.userId,
  });
});
