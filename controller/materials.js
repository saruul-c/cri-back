const asyncHandler = require("express-async-handler");
const { QueryTypes } = require("sequelize");

exports.getMaterials = asyncHandler(async (req, res, next) => {
  const page = req.query.page ?? 1,
    rowsPerPage = req.query.rowsPerPage ?? 10;
  const nowDate = new Date();
  const month = nowDate.getMonth()+1;
  const rule1 = req.query.rule1 || 6;
  let searchQuery = "";
  if (req.query.code) {
    searchQuery += ` AND CONCAT(r1.[no], r2.[no], r3.[no], r4.[no], b.[no], m.[no]) LIKE N'${req.query.code}%'`;
  }
  if (req.query.materName) {
    searchQuery += ` AND r4.[name] LIKE N'%${req.query.materName}%'`;
  }
  if (req.query.brandName) {
    searchQuery += ` AND b.[name] LIKE N'%${req.query.brandName}%'`;
  }
  if (req.query.markName) {
    searchQuery += ` AND m.[name] LIKE N'%${req.query.markName}%'`;
  }

  const count = await req.db.sequelize.query(
    `WITH materials(rn,num,materCode) AS (
      SELECT ROW_NUMBER() OVER(ORDER BY materCode) as rn, *
      FROM  (
        SELECT ROW_NUMBER() OVER(PARTITION BY CONCAT(r1.[no], r2.[no], r3.[no], r4.[no], b.[no], m.[no]) ORDER BY dep.[c2] DESC) as num, 
        CONCAT(r1.[no], r2.[no], r3.[no], r4.[no], b.[no], m.[no]) 'materCode'
        FROM fas_material.logmaterial.mark m
        INNER JOIN fas_material.logmaterial.rule1 r1 ON r1.id = m.rule1_id
        INNER JOIN fas_material.logmaterial.rule2 r2 ON r2.id = m.rule2_id
        INNER JOIN fas_material.logmaterial.rule3 r3 ON r3.id = m.rule3_id
        INNER JOIN fas_material.logmaterial.rule4 r4 ON r4.id = m.rule4_id
        INNER JOIN fas_material.logmaterial.brand b ON m.brand_id = b.id
        LEFT JOIN fas_material.logmaterial.B${req.query.depcode}_${req.query.year}_${month} dep ON dep.cr1Id = m.rule1_id AND dep.cr2Id = m.rule2_id AND dep.cr3Id = m.rule3_id AND dep.cr4Id = m.rule4_id
          AND dep.crbrand = m.brand_id AND dep.crmark = m.id
        WHERE r1.[active] = 1 AND r1.[status] = 1 AND r2.[active] = 1 AND r2.[status] = 1 AND r3.[active] = 1 AND r3.[status] = 1
          AND r4.[active] = 1 AND r4.[status] = 1 AND b.[active] = 1 AND b.[status] = 1 AND b.[active] = 1 AND b.[status] = 1 AND m.rule1_id = ${rule1} ${searchQuery}
      ) mtrl
      WHERE num = 1
    )
    SELECT COUNT(*) as totalMaterials FROM materials`,
    {
      type: QueryTypes.SELECT,
    }
  );
  const materials = await req.db.sequelize.query(
    `WITH materials(rn, num, materCode, materName, brandName, markName, serialNo, unitSize, price, quantity, totalPrice) AS (
      SELECT ROW_NUMBER() OVER(ORDER BY materCode) as rn, *
      FROM  (
        SELECT ROW_NUMBER() OVER(PARTITION BY CONCAT(r1.[no], r2.[no], r3.[no], r4.[no], b.[no], m.[no]) ORDER BY dep.[c2] DESC) as num, 
        CONCAT(r1.[no], r2.[no], r3.[no], r4.[no], b.[no], m.[no]) 'materCode', r4.name AS materName, b.name AS brandName, m.name AS markName,
          ISNULL(m.zurag_no,'-') serialNo, m.unit_size unitSize, ISNULL(dep.c1p,0) price, ISNULL(dep.c2,0) quantity, ISNULL(dep.c2pp,0) totalPrice
        FROM fas_material.logmaterial.mark m
        INNER JOIN fas_material.logmaterial.rule1 r1 ON r1.id = m.rule1_id
        INNER JOIN fas_material.logmaterial.rule2 r2 ON r2.id = m.rule2_id
        INNER JOIN fas_material.logmaterial.rule3 r3 ON r3.id = m.rule3_id
        INNER JOIN fas_material.logmaterial.rule4 r4 ON r4.id = m.rule4_id
        INNER JOIN fas_material.logmaterial.brand b ON m.brand_id = b.id
        LEFT JOIN fas_material.logmaterial.B${
          req.depcode
        }_${req.query.year}_${month} dep ON dep.cr1Id = m.rule1_id AND dep.cr2Id = m.rule2_id AND dep.cr3Id = m.rule3_id AND dep.cr4Id = m.rule4_id
          AND dep.crbrand = m.brand_id AND dep.crmark = m.id
        WHERE r1.[active] = 1 AND r1.[status] = 1 AND r2.[active] = 1 AND r2.[status] = 1 AND r3.[active] = 1 AND r3.[status] = 1
          AND r4.[active] = 1 AND r4.[status] = 1 AND b.[active] = 1 AND b.[status] = 1 AND b.[active] = 1 AND b.[status] = 1 AND m.rule1_id = ${rule1} ${searchQuery}
      ) mtrl
      WHERE num = 1
    )
    SELECT * FROM materials WHERE rn BETWEEN ${
      (page - 1) * rowsPerPage + 1
    } AND ${page * rowsPerPage}`,
    {
      type: QueryTypes.SELECT,
    }
  );

  res.status(200).json({
    success: true,
    data: { materials, total: count[0]?.totalMaterials },
  });
});
