const asyncHandler = require("express-async-handler");
const MyError = require("../../utils/myError");

exports.getRepairActs = asyncHandler(async (req, res, next) => {
  const acts = await req.db.repairAct.findAll({
    where: { active: 1 },
  });

  res.status(200).json({
    success: true,
    data: acts,
  });
});

exports.createRepairAct = asyncHandler(async (req, res, next) => {
  req.body.createdUser = req.userId;
  const act = await req.db.repairAct.create(req.body);
  res.status(200).json({
    success: true,
    data: act,
  });
});

exports.updateRepairAct = asyncHandler(async (req, res, next) => {
  req.body.updatedUser = req.userId;
  let act = await req.db.repairAct.findByPk(req.params.id);

  if (!act) {
    throw new MyError(`${req.params.id} дугаартай акт олдсонгүй!`, 400);
  }

  act = await act.update(req.body);

  res.status(200).json({
    success: true,
    data: act,
  });
});

exports.deleteRepairAct = asyncHandler(async (req, res, next) => {
  let act = await req.db.repairAct.findByPk(req.params.id);

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
