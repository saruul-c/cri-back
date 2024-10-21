const asyncHandler = require("express-async-handler");
const { QueryTypes } = require("sequelize");

const criService = {
  getMaxId: asyncHandler(async (sequelize, year) => {
    try {
      const maxBuilding = await sequelize.query(
        `SELECT RIGHT(:year, 1) + FORMAT(ISNULL(MAX(RIGHT(sectionCode, 4)), 0) + 1, '0000') AS maxId FROM cri_buildings WHERE rYear = :year`,
        { replacements: { year: year }, type: QueryTypes.SELECT }
      );
      const maxRepair = await sequelize.query(
        `SELECT RIGHT(:year, 1) + FORMAT(ISNULL(MAX(RIGHT(sectionCode, 4)), 0) + 1, '0000') AS maxId FROM cri_repairs WHERE rYear = :year`,
        { replacements: { year: year }, type: QueryTypes.SELECT }
      );
      return maxBuilding[0].maxId > maxRepair[0].maxId
        ? maxBuilding[0].maxId
        : maxRepair[0].maxId;
    } catch (error) {
      throw new Error(`Error finding max ID: ${error.message}`);
    }
  }),
};

module.exports = criService;
