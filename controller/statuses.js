const asyncHandler = require("express-async-handler");
const MyError = require("../utils/myError");

exports.getStatuses = asyncHandler(async (req, res, next) => {
  const statuses = await req.db.status.findAll();

  res.status(200).json({
    success: true,
    data: statuses,
  });
});

exports.createStatus = asyncHandler(async (req, res, next) => {
  req.body.createdUser = req.userId;
  const status = await req.db.status.create(req.body);
  res.status(200).json({
    success: true,
    data: status,
  });
});

exports.updateStatus = asyncHandler(async (req, res, next) => {
  req.body.updatedUser = req.userId;
  let status = await req.db.status.findByPk(req.params.id);

  if (!status) {
    throw new MyError(`${req.params.id} дугаартай хэмжих нэгж олдсонгүй!`, 400);
  }

  status = await status.update(req.body);

  res.status(200).json({
    success: true,
    data: status,
  });
});

exports.deleteStatus = asyncHandler(async (req, res, next) => {
  let status = await req.db.status.findByPk(req.params.id);
  if (!status) {
    throw new MyError(`${req.params.id} дугаартай хэмжих нэгж олдсонгүй!`, 400);
  }

  const progress = await req.db.progress.findAll({
    where: { statusId: req.params.id },
  });
  if (progress.length > 0) {
    throw new MyError(
      `${req.params.id} дугаартай хэмжих нэгжийг устгах боломжгүй!`,
      400
    );
  }

  status = await status.destroy({
    where: {
      id: req.params.id,
    },
  });

  res.status(200).json({
    success: true,
    data: status,
  });
});
