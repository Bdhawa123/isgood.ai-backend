const express = require("express");

const impactRouter = express.Router();
const jsonBodyParser = express.json();
const jwtCheck = require("../../middleware/oAuth");
const { checkProjectUpdate } = require("../../middleware/checkRole");
const { updateImpact } = require("./impactUpdate");
const { deleteImpacts } = require("./impactDestroy");

impactRouter
  .route("/update/:projectId")
  .patch(jwtCheck, jsonBodyParser, checkProjectUpdate, updateImpact);
impactRouter
  .route("/delete/:projectId")
  .delete(jwtCheck, jsonBodyParser, checkProjectUpdate, deleteImpacts);

module.exports = impactRouter;
