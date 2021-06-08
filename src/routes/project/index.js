const express = require("express");

const projectRouter = express.Router();
const jsonBodyParser = express.json();
const jwtCheck = require("../../middleware/oAuth");
const {
  checkProjectCreate,
  checkProjectRead,
  checkProjectUpdate,
} = require("../../middleware/checkRole");
const { listProjects } = require("./projectList");
const { getRoleId, orgExists, postProject } = require("./projectCreate");
const {
  checkProjectExists,
  getBeneficiaries,
  getProjectLogo,
  getIndicatorStatus,
  findProject,
} = require("./projectFind");
const { updateProject } = require("./projectUpdate");

projectRouter.get("/", jwtCheck, listProjects);
projectRouter.post(
  "/create",
  jwtCheck,
  jsonBodyParser,
  orgExists,
  checkProjectCreate,
  getRoleId,
  postProject
);
projectRouter
  .route("/:projectId")
  .all(jwtCheck)
  .get(
    checkProjectExists,
    checkProjectRead,
    getBeneficiaries,
    getProjectLogo,
    getIndicatorStatus,
    findProject
  )
  .patch(checkProjectExists, jsonBodyParser, checkProjectUpdate, updateProject);

module.exports = projectRouter;
