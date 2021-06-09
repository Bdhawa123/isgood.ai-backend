const express = require("express");
const jwtCheck = require("../../middleware/oAuth");
const uploadS3 = require("../../middleware/multerS3");
const { projectLogoCreate } = require("./projectLogoCreate");
const { orgLogoCreate } = require("./orgLogoCreate");
const { getImage } = require("./imageFind");

const imagesRouter = express.Router();

imagesRouter.route("/:imageId").get(getImage);

imagesRouter.route("/org").post(jwtCheck, uploadS3.any(), orgLogoCreate);

imagesRouter
  .route("/project")
  .post(jwtCheck, uploadS3.any(), projectLogoCreate);

module.exports = imagesRouter;
