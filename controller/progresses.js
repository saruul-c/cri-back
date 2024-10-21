const fs = require("fs");
const os = require("os");
const path = require("path");
const asyncHandler = require("express-async-handler");
const MyError = require("../utils/myError");

exports.createProgress = asyncHandler(async (req, res, next) => {
  req.body.createdUser = req.userId;

  if (!req.body.buildingId) {
    let repair = await req.db.repair.findByPk(req.params.id);
    if (!repair) {
      throw new MyError(`${req.params.id} дугаартай их засвар олдсонгүй!`, 400);
    }
  } else {
    let building = await req.db.building.findByPk(req.params.id);
    if (!building) {
      throw new MyError(
        `${req.params.id} дугаартай их барилга олдсонгүй!`,
        400
      );
    }
  }

  const progress = await req.db.progress.create(req.body);

  if (req.body.pictures) {
    const uploadPath = path.join(
      os.homedir(),
      "/Apps/image_server/images/cri/progress"
    );
    const types = ["png", "jpg", "jpeg"];
    let count = 1;

    if (req.body.pictures.lenght > 3) {
      throw new MyError("3-аас их зураг оруулах боломжгүй!", 400);
    }

    req.body.pictures.forEach(async (picture) => {
      const base64 = picture.split(",");
      const type = base64[0].split("/")[1].split(";")[0];
      let column = "picture" + count;

      if (!types.includes(type)) {
        throw new MyError(`${types} гэсэн төрлүүд л зөвшөөрөгдөнө!`, 405);
      }

      fs.writeFile(
        path.join(uploadPath, progress.id + "_" + count++ + "." + type),
        base64[1],
        { encoding: "base64" },
        (error) => {
          if (error) {
            console.log("Error", error);
            throw new MyError(`Зураг хадгалах явцад алдаа гарлаа!!!`, 500);
          }
        }
      );

      await progress.update({ [column]: type });
    });
  }

  res.status(200).json({
    success: true,
    data: progress,
  });
});

exports.deleteProgress = asyncHandler(async (req, res, next) => {
  let progress = await req.db.progress.findByPk(req.params.id);

  if (!progress) {
    throw new MyError(`${req.params.id} дугаартай явц олдсонгүй!`, 400);
  }

  progress = await progress.update({
    active: false,
    updatedUser: req.userId,
  });

  res.status(200).json({
    success: true,
    data: progress,
  });
});
