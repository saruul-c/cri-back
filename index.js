const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const xss = require("xss-clean");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
const rfs = require("rotating-file-stream");

const app = express();
const server = require("http").createServer(app);

const logger = require("./middlewares/logger");
const error = require("./middlewares/error");
const injectdb = require("./middlewares/injectDb");
const departmentsRoutes = require("./routes/departments");
const divisionsRoutes = require("./routes/divisions");
const commonsRoutes = require("./routes/commons");
const measurementsRoutes = require("./routes/measurements");
const progressesRoutes = require("./routes/progresses");
const statusesRoutes = require("./routes/statuses");
const repairsRoutes = require("./routes/repair");
const activitiesRoutes = require("./routes/repair/activities");
const clientsRoutes = require("./routes/clients");
const workWaysRoutes = require("./routes/workWays");
const completionsRoutes = require("./routes/completions");
const categoriesRoutes = require("./routes/categories");
const sectorsRoutes = require("./routes/sectors");
const devicesRoutes = require("./routes/devices");
const actsRoutes = require("./routes/acts");
// building
const researchesRoutes = require("./routes/building/researches");
const buildingsRoutes = require("./routes/building");
// investment
const investmentsRoutes = require("./routes/investments");
// supply
const suppliesRoutes = require("./routes/supplies");

const benefitsRoutes = require("./routes/benefits");
const rolesRoutes = require("./routes/roles");
const usersRoutes = require("./routes/users");
const assetsRoutes = require("./routes/assets");
const materialsRoutes = require("./routes/materials");
const plansRoutes = require("./routes/plans");
const reportsRoutes = require("./routes/reports");
const analyzeRoutes = require("./routes/analyze");

dotenv.config({ path: "./config/dev.env" });
const db = require("./config/db");

const accessLogStream = rfs.createStream("access.log", {
  interval: "1d",
  path: path.join(__dirname, "logs"),
});

const whiteList = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://172.30.30.15:3000",
  "http://172.30.30.15:3001",
  "http://172.30.30.19:3000",
  "http://172.30.30.20:3000",
  "http://172.30.30.21:3000",
  "http://172.30.30.25:3000",
  "http://172.30.30.25:3001",
  "http://192.168.4.103",
];
let corsOption = {
  origin: (origin, callback) => {
    if (origin === undefined || whiteList.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("CORS ERROR!!!"));
    }
  },
  allowedHeaders: "Authorization, Set-Cookie, Content-Type",
  methods: "GET, POST, PUT, DELETE",
  credentials: true,
};

app.use(bodyParser.json({ limit: "5mb" }));
app.use(logger);
app.use(cors(corsOption));
app.use(helmet());
app.use(xss());
app.use(morgan("combined", { stream: accessLogStream }));
app.use(injectdb(db));
app.use("/api/departments", departmentsRoutes);
app.use("/api/divisions", divisionsRoutes);
app.use("/api/measurements", measurementsRoutes);
app.use("/api/statuses", statusesRoutes);
app.use("/api/clients", clientsRoutes);
app.use("/api/commons", commonsRoutes);
app.use("/api/progresses", progressesRoutes);
app.use("/api/acts", actsRoutes);
app.use("/api/benefits", benefitsRoutes);
// repair
app.use("/api/repairs", repairsRoutes);
app.use("/api/activities", activitiesRoutes);
app.use("/api/work-ways", workWaysRoutes);
app.use("/api/completions", completionsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/sectors", sectorsRoutes);
app.use("/api/devices", devicesRoutes);
// building
app.use("/api/researches", researchesRoutes);
app.use("/api/buildings", buildingsRoutes);
// investment
app.use("/api/investments", investmentsRoutes);
// supply
app.use("/api/supplies", suppliesRoutes);

app.use("/api/roles", rolesRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/assets", assetsRoutes);
app.use("/api/materials", materialsRoutes);
app.use("/api/plans", plansRoutes);
app.use("/api/reports", reportsRoutes);
// analyze
app.use("/api/analyze", analyzeRoutes);
app.use(error);

db.user.belongsToMany(db.role, { through: db.userRole });
db.role.belongsToMany(db.user, { through: db.userRole });
db.user.hasMany(db.userRole);
db.role.hasMany(db.userRole);
db.userRole.belongsTo(db.user);
db.userRole.belongsTo(db.role);

db.user.belongsToMany(db.division, { through: db.userDivision });
db.division.belongsToMany(db.user, { through: db.userDivision });
db.user.hasMany(db.userDivision);
db.division.hasMany(db.userDivision);
db.userDivision.belongsTo(db.user);
db.userDivision.belongsTo(db.division);

db.department.hasMany(db.division);
db.division.belongsTo(db.department);

// repairs
db.activity.hasMany(db.repair);
db.repair.belongsTo(db.activity);
db.measurement.hasMany(db.repair);
db.repair.belongsTo(db.measurement);
db.workWay.hasMany(db.repair);
db.repair.belongsTo(db.workWay);
db.repair.hasMany(db.budget);
db.budget.belongsTo(db.repair);
db.assetType.hasMany(db.repair);
db.repair.belongsTo(db.assetType);
db.repair.hasMany(db.plan);
db.plan.belongsTo(db.repair);
db.user.hasMany(db.repair);
db.repair.belongsTo(db.user);
db.repair.hasMany(db.completion);
db.completion.belongsTo(db.repair);
db.repair.hasMany(db.progress);
db.progress.belongsTo(db.repair);
db.user.hasMany(db.progress);
db.progress.belongsTo(db.user);
db.status.hasMany(db.progress);
db.progress.belongsTo(db.status);
db.repair.hasMany(db.repairAct);
db.repairAct.belongsTo(db.repair);
db.repair.hasMany(db.benefit);
db.benefit.belongsTo(db.repair);

db.client.belongsToMany(db.repair, { through: db.repairClient });
db.repair.belongsToMany(db.client, { through: db.repairClient });
db.repair.hasMany(db.repairClient);
db.client.hasMany(db.repairClient);
db.repairClient.belongsTo(db.repair);
db.repairClient.belongsTo(db.client);

db.division.belongsToMany(db.repair, { through: db.repairDivision });
db.repair.belongsToMany(db.division, { through: db.repairDivision });
db.repair.hasMany(db.repairDivision);
db.division.hasMany(db.repairDivision);
db.repairDivision.belongsTo(db.repair);
db.repairDivision.belongsTo(db.division);

db.category.hasMany(db.sector);
db.sector.belongsTo(db.category);
db.sector.hasMany(db.device);
db.device.belongsTo(db.sector);

db.repair.belongsToMany(db.device, { through: db.repairKind });
db.device.belongsToMany(db.repair, { through: db.repairKind });
db.repair.hasMany(db.repairKind);
db.device.hasMany(db.repairKind);
db.repairKind.belongsTo(db.repair);
db.repairKind.belongsTo(db.device);

db.repair.belongsToMany(db.user, { through: db.repairSupplyWorker });
db.user.belongsToMany(db.repair, { through: db.repairSupplyWorker });
db.repair.hasMany(db.repairSupplyWorker);
db.user.hasMany(db.repairSupplyWorker);
db.repairSupplyWorker.belongsTo(db.repair);
db.repairSupplyWorker.belongsTo(db.user);

// plan
db.plan.hasMany(db.planChange);
db.planChange.belongsTo(db.plan);

// building
db.measurement.hasMany(db.building);
db.building.belongsTo(db.measurement);
db.workWay.hasMany(db.building);
db.building.belongsTo(db.workWay);
db.building.hasMany(db.budget);
db.budget.belongsTo(db.building);
db.building.hasMany(db.plan);
db.plan.belongsTo(db.building);
db.user.hasMany(db.building);
db.building.belongsTo(db.user);
db.building.hasMany(db.completion);
db.completion.belongsTo(db.building);
db.building.hasMany(db.progress);
db.progress.belongsTo(db.building);
db.building.hasMany(db.buildingAct);
db.buildingAct.belongsTo(db.building);
db.building.hasMany(db.benefit);
db.benefit.belongsTo(db.building);

db.building.belongsToMany(db.research, { through: db.buildingResearch });
db.research.belongsToMany(db.building, { through: db.buildingResearch });
db.building.hasMany(db.buildingResearch);
db.research.hasMany(db.buildingResearch);
db.buildingResearch.belongsTo(db.building);
db.buildingResearch.belongsTo(db.research);

db.client.belongsToMany(db.building, { through: db.buildingClient });
db.building.belongsToMany(db.client, { through: db.buildingClient });
db.building.hasMany(db.buildingClient);
db.client.hasMany(db.buildingClient);
db.buildingClient.belongsTo(db.building);
db.buildingClient.belongsTo(db.client);

db.division.belongsToMany(db.building, { through: db.buildingDivision });
db.building.belongsToMany(db.division, { through: db.buildingDivision });
db.building.hasMany(db.buildingDivision);
db.division.hasMany(db.buildingDivision);
db.buildingDivision.belongsTo(db.building);
db.buildingDivision.belongsTo(db.division);

db.building.belongsToMany(db.device, { through: db.buildingKind });
db.device.belongsToMany(db.building, { through: db.buildingKind });
db.building.hasMany(db.buildingKind);
db.device.hasMany(db.buildingKind);
db.buildingKind.belongsTo(db.building);
db.buildingKind.belongsTo(db.device);

db.building.belongsToMany(db.user, { through: db.buildingSupplyWorker });
db.user.belongsToMany(db.building, { through: db.buildingSupplyWorker });
db.building.hasMany(db.buildingSupplyWorker);
db.user.hasMany(db.buildingSupplyWorker);
db.buildingSupplyWorker.belongsTo(db.building);
db.buildingSupplyWorker.belongsTo(db.user);

// investment
db.division.hasMany(db.investment);
db.investment.belongsTo(db.division);
db.investment.hasMany(db.investmentPlan);
db.investmentPlan.belongsTo(db.investment);
db.investmentPlan.hasMany(db.investmentPlanChange);
db.investmentPlanChange.belongsTo(db.investmentPlan);
db.measurement.hasMany(db.investmentPlan);
db.investmentPlan.belongsTo(db.measurement);
db.workWay.hasMany(db.investmentPlan);
db.investmentPlan.belongsTo(db.workWay);
db.client.hasMany(db.investmentPlan);
db.investmentPlan.belongsTo(db.client);
db.division.hasMany(db.investmentPlan);
db.investmentPlan.belongsTo(db.division);
db.assetType.hasMany(db.investmentPlan);
db.investmentPlan.belongsTo(db.assetType);
db.investment.hasMany(db.benefit);
db.benefit.belongsTo(db.investment);

db.investment.belongsToMany(db.user, { through: db.investmentSupplyWorker });
db.user.belongsToMany(db.investment, { through: db.investmentSupplyWorker });
db.investment.hasMany(db.investmentSupplyWorker);
db.user.hasMany(db.investmentSupplyWorker);
db.investmentSupplyWorker.belongsTo(db.investment);
db.investmentSupplyWorker.belongsTo(db.user);

// supply
db.department.hasMany(db.supply);
db.supply.belongsTo(db.department);
db.repair.hasMany(db.supply);
db.supply.belongsTo(db.repair);
db.building.hasMany(db.supply);
db.supply.belongsTo(db.building);
db.supply.hasMany(db.payment);
db.payment.belongsTo(db.supply);
db.supply.hasMany(db.delivery);
db.delivery.belongsTo(db.supply);
db.supply.hasMany(db.tender);
db.tender.belongsTo(db.supply);
db.client.hasMany(db.tender);
db.tender.belongsTo(db.client);

db.sequelize
  // .sync({ force: true })
  .sync({ alter: true })
  // .sync()
  .then(() => {
    console.log("DB SYNCED");
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.status(200).send("running");
});

server.listen(
  process.env.PORT,
  console.log(`HTTP server started on port ${process.env.PORT}`)
);
