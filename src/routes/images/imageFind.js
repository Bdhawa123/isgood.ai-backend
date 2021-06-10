const AWS_S3_Service = require("../../services/aws-s3-service");

const getImage = async (req, res, next) => {
  try {
    const { imageId } = req.params;
    const readStream = await AWS_S3_Service.getImage(imageId);
    await readStream.pipe(res);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getImage,
};
