const colors = require("colors");

const logger = (req, res, next) => {
  console.log(
    `${req.method} ${req.protocol}://${req.hostname}${req.originalUrl}`.red
  );
  next();
};

module.exports = logger;
