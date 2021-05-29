const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const AuthService = require("../services/auth-service");
const imagesRouter = express.Router();
const jsonBodyParser = express.json();
const jwtCheck = require("../middleware/oAuth");

imagesRouter.post(
  "/images",
  jsonBodyParser,
  jwtCheck,
  upload.single("avatar"),
  (req, res, next) => {
    const file = req.file;
    const info = req.body.description;

    res.send("uploaded");
  }
);
module.exports = imagesRouter;
