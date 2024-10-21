const asyncHandler = require("express-async-handler");
const { QueryTypes } = require("sequelize");

exports.getClients = asyncHandler(async (req, res, next) => {
  const page = req.query.page ?? 1,
    rowsPerPage = req.query.rowsPerPage ?? 10,
    searchQuery = req.query.text
      ? `AND ([name] LIKE N'%${req.query.text}%' OR regno LIKE N'%${req.query.text}%')`
      : "";
  const total = await req.db.sequelize.query(
    `SELECT COUNT(*) as total FROM fas_coss.logcoss.id_client WHERE active = 'Y' AND status = 'A' AND ctype <> 'W' ${searchQuery}`,
    {
      type: QueryTypes.SELECT,
    }
  );
  const clients = await req.db.sequelize.query(
    `SELECT * FROM (
        SELECT ROW_NUMBER() OVER(ORDER BY id DESC) as rn, id as value, ctype, [name] as label, regno, mail, phone, mobile, fullName 
        FROM fas_coss.logcoss.id_client WHERE active = 'Y' AND status = 'A' AND ctype <> 'W' ${searchQuery}
      ) c WHERE rn BETWEEN ${(page - 1) * rowsPerPage + 1}  AND ${
      page * rowsPerPage
    }`,
    {
      type: QueryTypes.SELECT,
    }
  );
  res.status(200).json({
    success: true,
    data: { clients, total: total[0].total ?? 0 },
  });
});
