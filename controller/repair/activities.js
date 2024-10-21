const asyncHandler = require("express-async-handler");
const MyError = require("../../utils/myError");

exports.getActivities = asyncHandler(async (req, res, next) => {
  const activitys = await req.db.activity.findAll({
    where: { active: 1 },
  });

  res.status(200).json({
    success: true,
    data: activitys,
  });
});

exports.createActivity = asyncHandler(async (req, res, next) => {
  req.body.createdUser = req.userId;
  const activity = await req.db.activity.create(req.body);
  res.status(200).json({
    success: true,
    data: activity,
  });
});

exports.updateActivity = asyncHandler(async (req, res, next) => {
  req.body.updatedUser = req.userId;
  let activity = await req.db.activity.findByPk(req.params.id);

  if (!activity) {
    throw new MyError(`${req.params.id} дугаартай чиглэл олдсонгүй!`, 400);
  }

  activity = await activity.update(req.body);

  res.status(200).json({
    success: true,
    data: activity,
  });
});

exports.deleteActivity = asyncHandler(async (req, res, next) => {
  let activity = await req.db.activity.findByPk(req.params.id);

  if (!activity) {
    throw new MyError(`${req.params.id} дугаартай чиглэл олдсонгүй!`, 400);
  }

  activity = await activity.update({
    active: false,
    updatedUser: req.userId,
  });

  res.status(200).json({
    success: true,
    data: activity,
  });
});
