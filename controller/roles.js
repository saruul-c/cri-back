const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const MyError = require("../utils/myError");

exports.getRoles = asyncHandler(async (req, res, next) => {
  const roles = await req.db.role.findAll();

  res.status(200).json({
    success: true,
    data: roles,
  });
});

exports.createRole = asyncHandler(async (req, res, next) => {
  const role = await req.db.role.create(req.body);
  res.status(200).json({
    success: true,
    data: role,
  });
});

exports.updateRole = asyncHandler(async (req, res, next) => {
  let role = await req.db.role.findByPk(req.params.id);

  if (!role) {
    throw new MyError(`${req.params.id} гэсэн дугаартай эрх олдсонгүй!`, 400);
  }

  role = await role.update(req.body);

  res.status(200).json({
    success: true,
    data: role,
  });
});

exports.deleteRole = asyncHandler(async (req, res, next) => {
  let role = await req.db.role.findByPk(req.params.id);

  if (!role) {
    throw new MyError(`${req.params.id} гэсэн дугаартай эрх олдсонгүй!`, 400);
  }

  role = await role.destroy();

  res.status(200).json({
    success: true,
    data: role,
  });
});
