const express = require("express");

const beneficiaryRouter = express.Router();
const jsonBodyParser = express.json();
const jwtCheck = require("../../middleware/oAuth");
const { checkProjectUpdate } = require("../../middleware/checkRole");
const { updateBeneficiary } = require("./beneficiaryUpdate");
const { deleteBeneficiary } = require("./beneficiaryDestroy");

beneficiaryRouter
  .route("/update/:projectId")
  .patch(jsonBodyParser, updateBeneficiary);
beneficiaryRouter
  .route("/delete/:projectId")
  .delete(jsonBodyParser, deleteBeneficiary);

module.exports = beneficiaryRouter;
