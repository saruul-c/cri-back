const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const MyError = require("../utils/myError");

exports.createPlan = asyncHandler(async (req, res, next) => {
  req.body.createdUser = req.userId;

  if (!req.body.buildingId) {
    let repair = await req.db.repair.findByPk(req.params.id);
    if (!repair) {
      throw new MyError(
        `${req.params.id} гэсэн дугаартай их засвар олдсонгүй!`,
        400
      );
    }
  } else {
    let building = await req.db.building.findByPk(req.params.id);
    if (!building) {
      throw new MyError(
        `${req.params.id} гэсэн дугаартай их барилга олдсонгүй!`,
        400
      );
    }
  }

  const plan = await req.db.plan.create(req.body);
  res.status(200).json({
    success: true,
    data: plan,
  });
});

exports.updatePlan = asyncHandler(async (req, res, next) => {
  req.body.updatedUser = req.userId;

  let plan = await req.db.plan.findByPk(req.params.id);
  if (!plan) {
    throw new MyError(
      `${req.params.id} гэсэн дугаартай төлөвлөгөө олдсонгүй!`,
      400
    );
  }

  const planChange = await req.db.planChange.create({
    ...req.body.planChange,
    planId: plan.id,
    createdUser: req.userId,
  });
  await plan.update(req.body);

  res.status(200).json({
    success: true,
    data: planChange,
  });
});

exports.updatePlanChange = asyncHandler(async (req, res, next) => {
  req.body.updatedUser = req.userId;

  let planChange = await req.db.planChange.findByPk(req.params.id);
  if (!planChange) {
    throw new MyError(
      `${req.params.id} гэсэн дугаартай төлөвлөгөөний өөрчлөлт олдсонгүй!`,
      400
    );
  }

  planChange = await planChange.update(req.body);

  res.status(200).json({
    success: true,
    data: planChange,
  });
});

exports.deletePlan = asyncHandler(async (req, res, next) => {
  let plan = await req.db.plan.findByPk(req.params.id);

  if (!plan) {
    throw new MyError(
      `${req.params.id} гэсэн дугаартай төлөвлөгөө олдсонгүй!`,
      400
    );
  }

  plan = await plan.update({
    active: false,
    updatedUser: req.userId,
  });

  res.status(200).json({
    success: true,
    data: plan,
  });
});
