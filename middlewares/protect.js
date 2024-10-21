const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler");
const MyError = require("../utils/myError");

dotenv.config({ path: "./config/dev.env" });

exports.protect = asyncHandler(async (req, res, next) => {
  let token = null;
  if (req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  } else {
    console.log("---------- token from cookie: ", req.cookies["token"]);
    token = req.cookies["token"];
  }

  if (!token) {
    throw new MyError("Та нэвтэрч орно уу!", 401);
  }

  const tokenObj = jwt.verify(token, process.env.JWT_SECRET);
  req.userId = tokenObj.id;
  req.depcode = tokenObj.depcode;
  next();
});

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      throw new MyError("Таны эрх энэ үйлдлийг гүйцэтгэхэд хүрэлцэхгүй!", 403);
    }

    next();
  };
};
