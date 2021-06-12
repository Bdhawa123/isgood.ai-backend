const express = require("express");
const jwtCheck = require("../../middleware/oAuth");
const { uploadS3, imageDelete } = require("../../middleware/multerS3");
const { projectLogoCreate } = require("./projectLogoCreate");
const { projectBannerCreate } = require("./projectBannerCreate");
const { orgLogoCreate } = require("./orgLogoCreate");
const { orgBannerCreate } = require("./orgBannerCreate");
const { orgLogoUpdate, orgLogoExists } = require("./orgLogoUpdate");
const { orgBannerUpdate, orgBannerExists } = require("./orgBannerUpdate");
const { projectLogoUpdate, projectLogoExists } = require("./projectLogoUpdate");
const {
  projectBannerUpdate,
  projectBannerExists,
} = require("./projectBannerUpdate");
const { getImage } = require("./imageFind");

const imagesRouter = express.Router();

imagesRouter.route("/:imageId").get(getImage);

// Post Image routes
imagesRouter.route("/org/logo").post(jwtCheck, uploadS3.any(), orgLogoCreate);

imagesRouter
  .route("/org/banner")
  .post(jwtCheck, uploadS3.any(), orgBannerCreate);

imagesRouter
  .route("/project/logo")
  .post(jwtCheck, uploadS3.any(), projectLogoCreate);

imagesRouter
  .route("/project/banner")
  .post(jwtCheck, uploadS3.any(), projectBannerCreate);

// Update image routes
imagesRouter
  .route("/org/logo")
  .patch(jwtCheck, orgLogoExists, imageDelete, uploadS3.any(), orgLogoUpdate);

imagesRouter
  .route("/org/banner")
  .patch(
    jwtCheck,
    orgBannerExists,
    imageDelete,
    uploadS3.any(),
    orgBannerUpdate
  );

imagesRouter
  .route("/project/logo")
  .patch(
    jwtCheck,
    projectLogoExists,
    imageDelete,
    uploadS3.any(),
    projectLogoUpdate
  );

imagesRouter
  .route("/project/banner")
  .patch(
    jwtCheck,
    projectBannerExists,
    imageDelete,
    uploadS3.any(),
    projectBannerUpdate
  );

module.exports = imagesRouter;
