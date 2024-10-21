const asyncHandler = require("express-async-handler");
const { QueryTypes } = require("sequelize");
const MyError = require("../utils/myError");

exports.getBenefits = asyncHandler(async (req, res, next) => {
  const benefits = await req.db.benefit.findAll();

  res.status(200).json({
    success: true,
    data: benefits,
  });
});

exports.getBenefit = asyncHandler(async (req, res, next) => {
  const type = req.params.type || "repair";

  const benefit = await req.db.sequelize.query(
    `SELECT * FROM cri_benefits WHERE ${type}Id = ${req.params.id}`,
    {
      type: QueryTypes.SELECT,
    }
  );

  res.status(200).json({
    success: true,
    data: benefit,
  });
});

exports.createBenefit = asyncHandler(async (req, res, next) => {
  req.body.createdUser = req.userId;

  const benefit = await req.db.benefit.create(req.body);
  res.status(200).json({
    success: true,
    data: benefit,
  });
});

exports.updateBenefit = asyncHandler(async (req, res, next) => {
  req.body.updatedUser = req.userId;
  let benefit = await req.db.benefit.findByPk(req.params.id);

  if (!benefit) {
    throw new MyError(`${req.params.id} дугаартай үр өгөөж олдсонгүй!`, 400);
  }

  benefit = await benefit.update(req.body);

  res.status(200).json({
    success: true,
    data: benefit,
  });
});

exports.insertArchive = asyncHandler(async (req, res, next) => {
  console.log("archive: ", req.params.type, req.params.id, req.body);
  if (!req.params.type) {
    throw new MyError(`Төрлөө дамжуулна уу!`, 400);
  }

  let benefit = await req.db.benefit.findByPk(req.params.id);
  if (!benefit) {
    throw new MyError(`${req.params.id} дугаартай үр өгөөж олдсонгүй!`, 400);
  }

  if (req.params.type == "repair") {
    await req.db.repair.update(
      { archive: true, updatedUser: req.userId },
      { where: { id: benefit.repairId } }
    );
  } else if (req.params.type == "building") {
    await req.db.building.update(
      { archive: true, updatedUser: req.userId },
      { where: { id: benefit.buildingId } }
    );
  } else if (req.params.type == "investment") {
    await req.db.investment.update(
      { archive: true, updatedUser: req.userId },
      { where: { id: benefit.investmentId } }
    );
  } else {
    throw new MyError(`${req.params.type} төрөл байхгүй!`, 400);
  }

  benefit = await benefit.update({
    updatedUser: req.userId,
    archiveDate: req.body.archiveDate,
    archiveComment: req.body.archiveComment,
  });

  res.status(200).json({
    success: true,
    data: benefit,
  });
});

exports.removeArchive = asyncHandler(async (req, res, next) => {
  if (!req.params.type) {
    throw new MyError(`Төрлөө дамжуулна уу!`, 400);
  }

  let benefit = await req.db.benefit.findByPk(req.params.id);
  if (!benefit) {
    throw new MyError(`${req.params.id} дугаартай үр өгөөж олдсонгүй!`, 400);
  }

  if (req.params.type == "repair") {
    await req.db.repair.update(
      { archive: false, updatedUser: req.userId },
      { where: { id: benefit.repairId } }
    );
  } else if (req.params.type == "building") {
    await req.db.building.update(
      { archive: false, updatedUser: req.userId },
      { where: { id: benefit.buildingId } }
    );
  } else if (req.params.type == "investment") {
    await req.db.investment.update(
      { archive: false, updatedUser: req.userId },
      { where: { id: benefit.investmentId } }
    );
  } else {
    throw new MyError(`${req.params.type} төрөл байхгүй!`, 400);
  }

  benefit = await benefit.update({
    updatedUser: req.userId,
    archiveDate: null,
    archiveComment: "",
  });

  res.status(200).json({
    success: true,
    data: benefit,
  });
});
