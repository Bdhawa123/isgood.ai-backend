const express = require("express");

const beneficiaryRouter = express.Router();
const jsonBodyParser = express.json();
const jwtCheck = require("../../middleware/oAuth");
const { checkProjectUpdate } = require("../../middleware/checkRole");
const { updateBeneficiary } = require("./beneficiaryUpdate");

beneficiaryRouter
  .route("/update/:projectId")
  .patch(jsonBodyParser, updateBeneficiary);

module.exports = beneficiaryRouter;
