const AWS_S3_Service = require("../../services/aws-s3-service");

const getImage = (req, res, next) => {
  const { imageId } = req.params;
  const readStream = AWS_S3_Service.getImage(imageId);
  readStream.pipe(res);
};

module.exports = {
  getImage,
};
