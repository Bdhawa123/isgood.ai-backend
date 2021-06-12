const AWS_S3_Service = require("../../services/aws-s3-service");

const projectLogoUpdate = (req, res, next) => {
  const { files } = req;
  const { id } = req.query;

  const logo = {
    location: files[0].key,
  };

  AWS_S3_Service.updateProjectLogo(req.app.get("db"), id, logo)
    .then((logoId) => {
      res.status(201).json(logoId);
    })
    .catch(next);
};

const projectLogoExists = (req, res, next) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({
      error: { message: `Missing id in query` },
    });
  }

  AWS_S3_Service.checkProjectLogo(req.app.get("db"), id)
    .then((logo) => {
      if (!logo) {
        return res.status(400).json({
          error: { message: `Logo does not exist` },
        });
      }
      next();
    })
    .catch(next);
};

module.exports = {
  projectLogoUpdate,
  projectLogoExists,
};
