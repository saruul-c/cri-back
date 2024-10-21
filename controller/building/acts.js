const asyncHandler = require("express-async-handler");
const MyError = require("../../utils/myError");

exports.getBuildingActs = asyncHandler(async (req, res, next) => {
  const acts = await req.db.buildingAct.findAll({
    where: { active: 1 },
  });

  res.status(200).json({
    success: true,
    data: acts,
  });
});

exports.createBuildingAct = asyncHandler(async (req, res, next) => {
  req.body.createdUser = req.userId;
  const act = await req.db.buildingAct.create(req.body);
  res.status(200).json({
    success: true,
    data: act,
  });
});

exports.updateBuildingAct = asyncHandler(async (req, res, next) => {
  req.body.updatedUser = req.userId;
  let act = await req.db.buildingAct.findByPk(req.params.id);

  if (!act) {
    throw new MyError(`${req.params.id} дугаартай акт олдсонгүй!`, 400);
  }

  act = await act.update(req.body);

  res.status(200).json({
    success: true,
    data: act,
  });
});

exports.deleteBuildingAct = asyncHandler(async (req, res, next) => {
  let act = await req.db.buildingAct.findByPk(req.params.id);

  if (!act) {
    throw new MyError(`${req.params.id} дугаартай акт олдсонгүй!`, 400);
  }

  act = await act.update({
    active: false,
    updatedUser: req.userId,
  });

  res.status(200).json({
    success: true,
    data: act,
  });
});
