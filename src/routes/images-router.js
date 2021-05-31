const express = require("express");
const multer = require("multer");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

const AWS_S3_Service = require("../services/aws-s3-service");
const AuthService = require("../services/auth-service");
const jwtCheck = require("../middleware/oAuth");

const imagesRouter = express.Router();
const jsonBodyParser = express.json();
const upload = multer({ dest: "uploads/" });

imagesRouter.post(
  "/",
  jsonBodyParser,
  jwtCheck,
  upload.single("image"),
  (req, res, next) => {
    const file = req.file;
    console.log(file);
    AWS_S3_Service.uploadImage(file.filename)
      .then((res) => {
        console.log(res);
        unlinkFile(file.path);
      })
      .catch((err) => {
        console.log(err);
      });
    res.json(file);
  }
);

imagesRouter.get("/:imageId", (req, res, next) => {
  const imageId = req.params.imageId;
  const readStream = AWS_S3_Service.getImage(imageId);
  readStream.pipe(res);
});

module.exports = imagesRouter;
