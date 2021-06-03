const express = require("express");
const jwtCheck = require("../middleware/oAuth");
const uploadS3 = require("../middleware/multerS3");

const AWS_S3_Service = require("../services/aws-s3-service");

const imagesRouter = express.Router();

imagesRouter.post(
  "/",
  jwtCheck,
  uploadS3.any(),
  (req, res, next) => {
    const files = req.filesS;
    console.log(files);
    
    res.json(files);
  }
);

imagesRouter.get("/:imageId", (req, res, next) => {
  const imageId = req.params.imageId;
  const readStream = AWS_S3_Service.getImage(imageId);
  readStream.pipe(res);
});

module.exports = imagesRouter;
