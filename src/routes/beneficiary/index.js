const express = require("express");

const beneficiaryRouter = express.Router();
const jsonBodyParser = express.json();
const jwtCheck = require("../../middleware/oAuth");
const { checkProjectUpdate } = require("../../middleware/checkRole");
const { updateBeneficiary } = require("./beneficiaryUpdate");
const { deleteBeneficiary } = require("./beneficiaryDestroy");
const { checkProjectExists } = require("../project/projectFind");
const { orgExists } = require("../project/projectCreate");

beneficiaryRouter
  .route("/update/:projectId")
  .patch(
    jwtCheck,
    checkProjectExists,
    jsonBodyParser,
    orgExists,
    checkProjectUpdate,
    updateBeneficiary
  );
beneficiaryRouter
  .route("/delete/:projectId")
  .delete(
    jwtCheck,
    checkProjectExists,
    jsonBodyParser,
    orgExists,
    checkProjectUpdate,
    deleteBeneficiary
  );


module.exports = beneficiaryRouter;
