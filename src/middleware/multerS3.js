require("dotenv").config();
const multer = require("multer");
const multerS3 = require("multer-s3");
const S3 = require("aws-sdk/clients/s3");

const accessKey = process.env.AWS_ACCESS_KEY_ID;
const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
const bucketName = process.env.BUCKET_NAME;
const region = process.env.BUCKET_REGION;

const s3 = new S3({
  region,
  accessKey,
  secretKey,
});

const uploadS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName,
    // acl: 'public-read', //For public permissions later
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      // add unique Id ???
      cb(null, Date.now().toString());
    },
  }),
});

module.exports = uploadS3;
