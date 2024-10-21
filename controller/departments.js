const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const MyError = require("../utils/myError");

exports.getDepartments = asyncHandler(async (req, res, next) => {
  const departments = await req.db.department.findAll({
    where: { active: 1 },
    include: req.db.division,
  });

  res.status(200).json({
    success: true,
    data: departments,
  });
});

exports.createDepartment = asyncHandler(async (req, res, next) => {
  req.body.createdUser = req.userId;
  const department = await req.db.department.create(req.body);
  res.status(200).json({
    success: true,
    data: department,
  });
});

exports.updateDepartment = asyncHandler(async (req, res, next) => {
  req.body.updatedUser = req.userId;
  let department = await req.db.department.findByPk(req.params.id);

  if (!department) {
    throw new MyError(`${req.params.id} гэсэн дугаартай алба олдсонгүй!`, 400);
  }

  department = await department.update(req.body);

  res.status(200).json({
    success: true,
    data: department,
  });
});

exports.deleteDepartment = asyncHandler(async (req, res, next) => {
  let department = await req.db.department.findByPk(req.params.id);

  if (!department) {
    throw new MyError(`${req.params.id} гэсэн дугаартай алба олдсонгүй!`, 400);
  }

  department = await department.update({
    active: false,
    updatedUser: req.userId,
  });

  res.status(200).json({
    success: true,
    data: department,
  });
});
