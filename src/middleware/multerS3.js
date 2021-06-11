require("dotenv").config();
const multer = require("multer");
const multerS3 = require("multer-s3");
const S3 = require("aws-sdk/clients/s3");
const crypto = require("crypto");

const accessKey = process.env.S3_KEY;
const secretKey = process.env.S3_SECRET;
const bucketName = process.env.BUCKET_NAME;
const region = process.env.BUCKET_REGION;

// Function to generate unique ID
const uniqueID = () => {
  const idSize = 8
  const id = crypto.randomBytes(Math.ceil(idSize/2)).toString('hex').slice(0, idSize);
  return id;
}

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
      cb(null, uniqueID());
    },
  }),
});

const updateS3 = multer({
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

const imageDelete = async (req, res, next) => {
  const { locationId } = req.query;

  if (!locationId) {
    return res.status(400).json({
      error: { message: `Missing locationId in query` },
    });
  }

  try {
    const params = {
      Bucket: bucketName,
      Key: locationId,
    };
    s3.deleteObject(params, (error, data) => {
      if (error) {
        if (error.statusCode && error.message) {
          return res.status(error.statusCode).send(error.message);
        }
        return res.status(500).send("Issue deleting object");
      }
      next();
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadS3,
  updateS3,
  imageDelete,
};
