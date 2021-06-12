const express = require("express");

const outcomeRouter = express.Router();
const jsonBodyParser = express.json();
const jwtCheck = require("../../middleware/oAuth");
const { checkProjectUpdate } = require("../../middleware/checkRole");
const { updateOutcome } = require("./outcomeUpdate");
const { deleteOutcomes } = require("./outcomeDestroy");

outcomeRouter
  .route("/update/:projectId")
  .patch(jwtCheck, jsonBodyParser, checkProjectUpdate, updateOutcome);
outcomeRouter
  .route("/delete/:projectId")
  .delete(jwtCheck, jsonBodyParser, checkProjectUpdate, deleteOutcomes);

module.exports = outcomeRouter;
