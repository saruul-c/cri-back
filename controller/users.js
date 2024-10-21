const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const MyError = require("../utils/myError");

dotenv.config({ path: "./config/dev.env" });

function formatDate(date = new Date()) {
  const year = date.toLocaleString("default", {
    year: "numeric",
    timeZone: "Asia/Ulaanbaatar",
  });
  const month = date.toLocaleString("default", {
    month: "2-digit",
    timeZone: "Asia/Ulaanbaatar",
  });
  const day = date.toLocaleString("default", {
    day: "2-digit",
    timeZone: "Asia/Ulaanbaatar",
  });

  return [year, month, day].join("-");
}

exports.currentUser = asyncHandler(async (req, res, next) => {
  const user = await req.db.user.findByPk(req.userId, {
    include: [req.db.role, req.db.division],
  });
  delete user.dataValues.password;

  res.status(200).json({
    today: formatDate(),
    success: true,
    user,
  });
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new MyError("Имэйл болон нууц үгээ дамжуулна уу", 400);
  }
  const user = await req.db.user.findOne({
    where: { email: email, active: true },
    include: [req.db.role, req.db.division],
  });

  if (!user) {
    throw new MyError("Имэйл болон нууц үгээ зөв оруулна уу", 401);
  }

  const pass = await user.checkPassword(password, user.password);
  if (!pass) {
    throw new MyError("Имэйл болон нууц үгээ зөв оруулна уу", 401);
  }

  delete user.dataValues.password;

  const accessToken = user.getAccessToken(user.id, user.email, user.depcode);
  const refreshToken = user.getRefreshToken(user.id, user.email, user.depcode);
  const cookieOption = {
    expires: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: "none",
    secure: false,
  };
  res.status(200).cookie("token", accessToken, cookieOption).json({
    success: true,
    today: formatDate(),
    accessToken: accessToken,
    refreshToken: refreshToken,
    user,
  });
});

exports.refreshToken = asyncHandler(async (req, res, next) => {
  if (!req.body.refreshToken) {
    throw new MyError("Refresh token-оо дамжуулна уу", 400);
  }
  const refreshToken = req.body.refreshToken;

  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const { id, email, depcode } = decoded;
    const accessToken = jwt.sign(
      { id, email, depcode },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_AT_EXPIRE,
      }
    );

    res.status(200).json({ success: true, accessToken });
  });
});

exports.logout = asyncHandler(async (req, res, next) => {
  const cookieOption = {
    expires: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    // sameSite: "none",
    // secure: true,
  };

  res.status(200).cookie("token", null, cookieOption).json({
    success: true,
  });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.email) {
    throw new MyError(`И-Мэйл хаягаа оруулна уу!`, 400);
  }

  let user = await req.db.user.findOne({
    where: { email: req.body.email, active: true },
  });

  if (!user) {
    throw new MyError(
      `${req.body.email} гэсэн и-мэйлтэй хэрэглэгч олдсонгүй!`,
      400
    );
  }

  await user.update({
    resetPasswordToken: user.getResetPasswordToken(),
    resetPasswordDate:
      new Date().toLocaleString("en-US", { timeZone: "Asia/Ulaanbaatar" }) +
      10 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
  });
});

exports.getUser = asyncHandler(async (req, res, next) => {
  const users = await req.db.user.findByPk(req.params.id, {
    include: [req.db.role, req.db.division],
  });

  delete users.dataValues.resetPasswordToken;
  delete users.dataValues.resetPasswordDate;
  delete users.dataValues.password;

  res.status(200).json({
    success: true,
    data: users,
  });
});

exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await req.db.user.findAll({
    where: { active: true },
  });

  users.forEach((user) => {
    delete user.dataValues.resetPasswordToken;
    delete user.dataValues.resetPasswordDate;
    delete user.dataValues.password;
  });

  res.status(200).json({
    success: true,
    data: users,
  });
});

exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await req.db.user.create(req.body);

  req.body.roles?.map(async (role) => {
    await user.addRole(await req.db.role.findByPk(role), {
      through: "cri_users_roles",
    });
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.updateUser = asyncHandler(async (req, res, next) => {
  let user = await req.db.user.findByPk(req.params.id);
  if (!user) {
    throw new MyError(
      `${req.params.id} гэсэн дугаартай хэрэглэгч олдсонгүй!`,
      404
    );
  }

  user = await user.update(req.body);

  req.body.roles &&
    (await req.db.userRole.destroy({ where: { userId: user.id } }));
  await req.body.roles?.map(async (role) => {
    await user.addRole(await req.db.role.findByPk(role), {
      through: req.db.userRole,
    });
  });

  req.body.divisions &&
    (await req.db.userDivision.destroy({ where: { userId: user.id } }));
  await req.body.divisions?.map(async (division) => {
    await user.addDivision(await req.db.division.findByPk(division), {
      through: req.db.userDivision,
    });
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  let user = await req.db.user.findByPk(req.params.id);

  if (!user) {
    throw new MyError(
      `${req.params.id} гэсэн дугаартай хэрэглэгч олдсонгүй!`,
      404
    );
  }

  user = await user.destroy();

  res.status(200).json({
    success: true,
    data: user,
  });
});
