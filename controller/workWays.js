const asyncHandler = require("express-async-handler");
const MyError = require("../utils/myError");

exports.getWorkWays = asyncHandler(async (req, res, next) => {
  const workWays = await req.db.workWay.findAll({
    where: { active: 1 },
  });

  res.status(200).json({
    success: true,
    data: workWays,
  });
});

exports.createWorkWay = asyncHandler(async (req, res, next) => {
  req.body.createdUser = req.userId;
  const workWay = await req.db.workWay.create(req.body);
  res.status(200).json({
    success: true,
    data: workWay,
  });
});

exports.updateWorkWay = asyncHandler(async (req, res, next) => {
  req.body.updatedUser = req.userId;
  let workWay = await req.db.workWay.findByPk(req.params.id);

  if (!workWay) {
    throw new MyError(`${req.params.id} дугаартай чиглэл олдсонгүй!`, 400);
  }

  workWay = await workWay.update(req.body);

  res.status(200).json({
    success: true,
    data: workWay,
  });
});

exports.deleteWorkWay = asyncHandler(async (req, res, next) => {
  let workWay = await req.db.workWay.findByPk(req.params.id);

  if (!workWay) {
    throw new MyError(`${req.params.id} дугаартай чиглэл олдсонгүй!`, 400);
  }

  workWay = await workWay.update({
    active: false,
    updatedUser: req.userId,
  });

  res.status(200).json({
    success: true,
    data: workWay,
  });
});
