const express = require("express");

const orgRouter = express.Router();
const jsonBodyParser = express.json();
const jwtCheck = require("../../middleware/oAuth");
const { checkOrgDelete } = require("../../middleware/checkRole");
const { listOrgs } = require("./orgList");
const { setOrgInactive, checkOrgExists } = require("./orgDestroy");
const {
  postOrg,
  getRoleId,
  checkOrgLogo,
  checkOrgBanner,
} = require("./orgCreate");

orgRouter.get("/", jwtCheck, listOrgs);

orgRouter.post(
  "/create",
  jwtCheck,
  jsonBodyParser,
  getRoleId,
  checkOrgLogo,
  checkOrgBanner,
  postOrg
);

orgRouter.delete(
  "/:orgId",
  jwtCheck,
  checkOrgExists,
  checkOrgDelete,
  setOrgInactive
);

module.exports = orgRouter;
