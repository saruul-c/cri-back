const asyncHandler = require("express-async-handler");
const MyError = require("../utils/myError");
const { Op } = require("sequelize");

exports.getGuests = asyncHandler(async (req, res, next) => {
  const date =
    req.query.date ||
    new Date().toLocaleString("en-US", { timeZone: "Asia/Ulaanbaatar" });

  const rooms = await req.db.room.findAll({
    where: {
      active: 1,
      depcode: req.query.depcode || 221506,
    },
    include: {
      model: req.db.guest,
      required: false,
      where: {
        active: 1,
        inDate: { [Op.lte]: date },
        outDate: { [Op.gt]: date },
        depcode: req.query.depcode || 221506,
      },
    },
  });

  res.status(200).json({
    success: true,
    data: rooms,
  });
});

exports.createGuests = asyncHandler(async (req, res, next) => {
  req.body.createdUser = req.userId;
  req.body.updatedUser = req.userId;
  req.body.depcode = req.depcode;
  req.body.numChild = 0;
  req.body.active = 1;

  let guests = await req.db.guest.findByPk(req.params.id);
  if (!guests) {
    throw new MyError(`${req.params.id} гэсэн ID-тай зочин олдсонгүй!`, 400);
  }

  let rooms = await req.db.room.findByPk(guests.roomId);
  if (!rooms) {
    throw new MyError(`${guests.roomId} гэсэн ID-тай өрөө олдсонгүй!`, 400);
  }

  let bookings = await req.db.booking.findByPk(guests.bookingId);
  if (!bookings) {
    throw new MyError(`${bookings.id} гэсэн ID-тай захиалга олдсонгүй!`, 400);
  }

  req.body.roomId = rooms.id;
  req.body.bookingId = bookings.id;

  await bookings.update({ status: 3 });
  guests = await guests.update(req.body);

  await res.status(200).json({
    success: true,
    data: guests,
  });
});

exports.updateGuests = asyncHandler(async (req, res, next) => {
  req.body.createdUser = req.userId;
  req.body.updatedUser = req.userId;
  req.body.depcode = req.depcode;
  req.body.numChild = 0;
  req.body.active = 1;

  let guests = await req.db.guest.findByPk(req.params.id);
  if (!guests) {
    throw new MyError(`${req.params.id} гэсэн ID-тай зочин олдсонгүй!`, 400);
  }

  let rooms = await req.db.room.findByPk(guests.roomId);
  if (!rooms) {
    throw new MyError(`${guests.roomId} гэсэн ID-тай өрөө олдсонгүй!`, 400);
  }

  let bookings = await req.db.booking.findByPk(guests.bookingId);
  if (!bookings) {
    throw new MyError(`${bookings.id} гэсэн ID-тай захиалга олдсонгүй!`, 400);
  }

  req.body.roomId = rooms.id;
  req.body.bookingId = bookings.id;

  await bookings.update({ status: 3 });
  guests = await guests.update(req.body);

  await res.status(200).json({
    success: true,
    data: guests,
  });
});

exports.deleteGuests = asyncHandler(async (req, res, next) => {
  let guests = await req.db.guest.findByPk(req.params.id);

  if (!guests) {
    throw new MyError(
      `${req.params.id} гэсэн дугаартай захиалга олдсонгүй!`,
      400
    );
  }

  await guests.update({
    active: 0,
    updatedUser: req.userId,
    comment: req.params.comment || "",
    cancelDate: new Date().toLocaleString("en-US", {
      timeZone: "Asia/Ulaanbaatar",
    }),
  });

  res.status(200).json({
    success: true,
  });
});

exports.confirmGuests = asyncHandler(async (req, res, next) => {
  let guests = await req.db.guest.findByPk(req.params.id);

  if (!guests) {
    throw new MyError(
      `${req.params.id} гэсэн дугаартай захиалга олдсонгүй!`,
      400
    );
  }

  await guests.update({
    status: 2,
    updatedUser: req.userId,
    confirmDate: new Date().toLocaleString("en-US", {
      timeZone: "Asia/Ulaanbaatar",
    }),
  });

  res.status(200).json({
    success: true,
  });
});
