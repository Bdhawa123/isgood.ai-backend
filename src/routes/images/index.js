const express = require("express");
const jwtCheck = require("../../middleware/oAuth");
const uploadS3 = require("../../middleware/multerS3");
const { projectLogoCreate } = require("./projectLogoCreate");
const { projectBannerCreate } = require("./projectBannerCreate");
const { orgLogoCreate } = require("./orgLogoCreate");
const { orgBannerCreate } = require("./orgBannerCreate");
const { getImage } = require("./imageFind");

const imagesRouter = express.Router();

imagesRouter.route("/:imageId").get(getImage);

imagesRouter.route("/org/logo").post(jwtCheck, uploadS3.any(), orgLogoCreate);

imagesRouter
  .route("/org/banner")
  .post(jwtCheck, uploadS3.any(), orgBannerCreate);

imagesRouter
  .route("/project")
  .post(jwtCheck, uploadS3.any(), projectLogoCreate);

imagesRouter
  .route("/project/banner")
  .post(jwtCheck, uploadS3.any(), projectBannerCreate);

module.exports = imagesRouter;
