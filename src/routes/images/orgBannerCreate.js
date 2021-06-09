const AWS_S3_Service = require("../../services/aws-s3-service");

const orgBannerCreate = (req, res, next) => {
  const { files } = req;

  const banner = {
    location: files[0].key,
  };

  AWS_S3_Service.createOrgBanner(req.app.get("db"), banner)
    .then((logoId) => {
      res.status(201).json(logoId);
    })
    .catch(next);
};

module.exports = {
  orgBannerCreate,
};
