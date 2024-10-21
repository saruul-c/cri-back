const asyncHandler = require("express-async-handler");
const { QueryTypes } = require("sequelize");

exports.getAssets = asyncHandler(async (req, res, next) => {
  const { text,depcode,year } = req.query;
  const nowDate = new Date();
  const month = nowDate.getMonth() + 1;
  const searchQuery = text
    ? `AND (asset_name LIKE N'%${text}%' OR asset_mark LIKE N'%${text}%' OR new_code LIKE N'%${text}%')`
    : "";
  let amor = "ISNULL(amor0, 0)";
  for (let i = 1; i <= month; i++) {
    amor += ` + ISNULL(amor${i}, 0)`;
  }
  amor += " AS assetAmor";
  const assets = await req.db.sequelize.query(
    `SELECT dep_code AS depcode, new_code AS assetCode, REPLACE(REPLACE(asset_name, 'є', N'ө'), 'ї', N'ү') AS assetName, REPLACE(REPLACE(asset_mark, 'є', N'ө'), 'ї', N'ү') AS assetMark, use_date AS assetDate, ajil${month} / 12 AS assetYear, cost${month} AS assetCost, ${amor}, 
      CASE WHEN LEFT(new_code, 2) = '11' THEN 3 
      WHEN LEFT(new_code, 2) = '12' AND LEFT(new_code, 4) <> '1202' THEN 1
      WHEN LEFT(new_code, 4) = '1202' THEN 2
      WHEN LEFT(new_code, 2) = '13' THEN 4
      WHEN LEFT(new_code, 2) = '14' AND LEFT(new_code, 4) <> '1417' THEN 5
      WHEN LEFT(new_code, 4) = '1417' THEN 6
      WHEN LEFT(new_code, 4) = '1601' THEN 8
      WHEN LEFT(new_code, 4) = '1602' THEN 9 END assetTypeId
     FROM maindb_am.loginmain_am.ASSETS${year}_A 
     WHERE dep_code = ${depcode} AND c2 = 1 AND prob = 99 AND LEFT(new_code, 1) = 1 AND LEFT(new_code, 2) NOT IN (18, 17, 15) ${searchQuery} ORDER BY new_code`,
    {
      type: QueryTypes.SELECT,
    }
  );

  res.status(200).json({
    success: true,
    data: assets,
  });
});
