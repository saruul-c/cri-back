const asyncHandler = require("express-async-handler");

exports.getPlanChanges = asyncHandler(async (req, res, next) => {
  const planChanges = await req.db.planChange.findAll({
    where: { active: 1 },
  });

  res.status(200).json({
    success: true,
    data: planChanges,
  });
});
