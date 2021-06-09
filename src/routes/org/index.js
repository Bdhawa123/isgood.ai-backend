const express = require("express");

const orgRouter = express.Router();
const jsonBodyParser = express.json();
const jwtCheck = require("../../middleware/oAuth");
const { listOrgs } = require("./orgList");
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

module.exports = orgRouter;
