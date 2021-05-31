require("dotenv").config();
const fs = require("fs");
const S3 = require("aws-sdk/clients/s3");

const accessKey = process.env.S3_KEY;
const secretKey = process.env.S3_SECRET;
const bucketName = process.env.BUCKET_NAME;
const region = process.env.BUCKET_REGION;

const s3 = new S3({
  region,
  accessKey,
  secretKey,
});

// upload a file from s3
const AWS_S3_Service = {
  uploadImage(fileName) {
    const fileStream = fs.createReadStream(`uploads/${fileName}`);

    const params = {
      Bucket: bucketName,
      Body: fileStream,
      Key: fileName,
    };

    return s3.upload(params).promise();
  },

  // get a file from s3

  getImage(fileName) {
    const params = {
      Key: fileName,
      Bucket: bucketName,
    };

    return s3.getObject(params).createReadStream();
  },
};

module.exports = AWS_S3_Service;
