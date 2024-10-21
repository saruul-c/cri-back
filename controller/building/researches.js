const asyncHandler = require("express-async-handler");
const MyError = require("../../utils/myError");

exports.getResearches = asyncHandler(async (req, res, next) => {
  const researches = await req.db.research.findAll({
    where: { active: 1 },
  });

  res.status(200).json({
    success: true,
    data: researches,
  });
});

exports.createResearch = asyncHandler(async (req, res, next) => {
  req.body.createdUser = req.userId;
  const research = await req.db.research.create(req.body);
  res.status(200).json({
    success: true,
    data: research,
  });
});

exports.updateResearch = asyncHandler(async (req, res, next) => {
  req.body.updatedUser = req.userId;
  let research = await req.db.research.findByPk(req.params.id);

  if (!research) {
    throw new MyError(`${req.params.id} дугаартай судалгаа олдсонгүй!`, 400);
  }

  research = await research.update(req.body);

  res.status(200).json({
    success: true,
    data: research,
  });
});

exports.deleteResearch = asyncHandler(async (req, res, next) => {
  let research = await req.db.research.findByPk(req.params.id);

  if (!research) {
    throw new MyError(`${req.params.id} дугаартай судалгаа олдсонгүй!`, 400);
  }

  research = await research.update({
    active: false,
    updatedUser: req.userId,
  });

  res.status(200).json({
    success: true,
    data: research,
  });
});
