const express = require("express");

const projectRouter = express.Router();
const jsonBodyParser = express.json();
const jwtCheck = require("../../middleware/oAuth");
const {
  checkProjectCreate,
  checkProjectRead,
  checkProjectUpdate,
  checkProjectDelete,
} = require("../../middleware/checkRole");
const { listProjects } = require("./projectList");
const {
  getRoleId,
  orgExists,
  postProject,
  checkProjectLogo,
  checkProjectBanner,
} = require("./projectCreate");
const {
  checkProjectExists,
  getBeneficiaries,
  getProjectLogo,
  getIndicatorStatus,
  findProject,
  getProjectBanner,
} = require("./projectFind");
const { updateProject } = require("./projectUpdate");
const { setProjectInactive } = require("./projectDestroy");

projectRouter.get("/", jwtCheck, listProjects);
projectRouter.post(
  "/create",
  jwtCheck,
  jsonBodyParser,
  orgExists,
  checkProjectCreate,
  getRoleId,
  checkProjectLogo,
  checkProjectBanner,
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
    getProjectBanner,
    getIndicatorStatus,
    findProject
  )
  .patch(checkProjectExists, jsonBodyParser, checkProjectUpdate, updateProject)
  .delete(checkProjectExists, checkProjectDelete, setProjectInactive);

module.exports = projectRouter;
