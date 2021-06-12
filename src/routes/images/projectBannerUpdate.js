const AWS_S3_Service = require("../../services/aws-s3-service");

const projectBannerUpdate = (req, res, next) => {
  const { files } = req;
  const { id } = req.query;

  const banner = {
    location: files[0].key,
  };

  AWS_S3_Service.updateProjectBanner(req.app.get("db"), id, banner)
    .then((logoId) => {
      res.status(201).json(logoId);
    })
    .catch(next);
};

const projectBannerExists = (req, res, next) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({
      error: { message: `Missing id in query` },
    });
  }

  AWS_S3_Service.checkProjectBanner(req.app.get("db"), id)
    .then((banner) => {
      if (!banner) {
        return res.status(400).json({
          error: { message: `Banner does not exist` },
        });
      }
      next();
    })
    .catch(next);
};

module.exports = {
  projectBannerUpdate,
  projectBannerExists,
};
