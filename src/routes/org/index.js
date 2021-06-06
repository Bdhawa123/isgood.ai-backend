const express = require("express");

const orgRouter = express.Router();
const jsonBodyParser = express.json();
const jwtCheck = require("../../middleware/oAuth");
const { listOrgs } = require("./orgList");
const { postOrg, getRoleId } = require("./orgCreate");

orgRouter.get("/", jwtCheck, listOrgs);

orgRouter.post("/create", jwtCheck, jsonBodyParser, getRoleId, postOrg);

module.exports = orgRouter;
