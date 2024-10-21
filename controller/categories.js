const asyncHandler = require("express-async-handler");
const MyError = require("../utils/myError");

exports.getCategories = asyncHandler(async (req, res, next) => {
  const categories = await req.db.category.findAll({
    where: { repair: req.params.id },
    include: {
      model: req.db.sector,
      include: [
        {
          model: req.db.device,
        },
      ],
    },
  });

  res.status(200).json({
    success: true,
    data: categories,
  });
});

exports.createCategory = asyncHandler(async (req, res, next) => {
  req.body.createdUser = req.userId;
  const category = await req.db.category.create(req.body);
  res.status(200).json({
    success: true,
    data: category,
  });
});

exports.updateCategory = asyncHandler(async (req, res, next) => {
  req.body.updatedUser = req.userId;

  let category = await req.db.category.findByPk(req.body.id);
  if (!category) {
    throw new MyError(`${req.body.id} дугаартай бүлэг олдсонгүй!`, 400);
  }

  category = await category.update(req.body);

  res.status(200).json({
    success: true,
    data: category,
  });
});

exports.deleteCategory = asyncHandler(async (req, res, next) => {
  let category = await req.db.category.findByPk(req.params.id);
  if (!category) {
    throw new MyError(`${req.params.id} дугаартай бүлэг олдсонгүй!`, 400);
  }

  const sector = await req.db.sector.findAll({
    where: { categoryId: req.params.id },
  });
  if (sector.length > 0) {
    throw new MyError(
      `${req.params.id} дугаартай бүлгийг устгах боломжгүй!`,
      400
    );
  }

  category = await category.destroy({
    where: {
      id: req.params.id,
    },
  });

  res.status(200).json({
    success: true,
    data: category,
  });
});
